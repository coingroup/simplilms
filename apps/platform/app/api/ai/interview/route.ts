import { NextRequest } from "next/server";
import { createServerClient, getUser } from "@simplilms/auth/server";
import {
  getAnthropicClient,
  INTERVIEW_MODEL,
  isReadyToGenerate,
  stripReadyMarker,
  type ChatMessage,
} from "@simplilms/core/lib/ai-service";

/**
 * POST /api/ai/interview
 *
 * Streaming endpoint for AI interview chat.
 * Streams Claude's response token-by-token via Server-Sent Events.
 *
 * Request body: { interviewId: string, userMessage: string }
 * Response: text/event-stream with events:
 *   - data: {"type":"token","text":"..."} — streamed token
 *   - data: {"type":"done","readyToGenerate":boolean,"fullMessage":"..."} — completion
 *   - data: {"type":"error","message":"..."} — error
 */
export async function POST(request: NextRequest) {
  const { user, error: authError } = await getUser();
  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: "Not authenticated" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { interviewId: string; userMessage: string };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { interviewId, userMessage } = body;
  if (!interviewId || !userMessage) {
    return new Response(
      JSON.stringify({ error: "interviewId and userMessage are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Fetch interview
  const supabase = await createServerClient();
  const { data: interview, error: fetchError } = await (supabase as any)
    .from("ai_course_interviews")
    .select("*")
    .eq("id", interviewId)
    .eq("created_by", user.user.id)
    .single();

  if (fetchError || !interview) {
    return new Response(
      JSON.stringify({ error: "Interview not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  if (interview.status !== "interviewing") {
    return new Response(
      JSON.stringify({ error: "Interview is not in progress" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Build messages
  const now = new Date().toISOString();
  const updatedMessages: ChatMessage[] = [
    ...(interview.messages as ChatMessage[]),
    { role: "user" as const, content: userMessage, timestamp: now },
  ];

  const claudeMessages = [
    {
      role: "user" as const,
      content:
        "I'm ready to be interviewed about this topic. Please begin.",
    },
    ...updatedMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(data: Record<string, unknown>) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      }

      try {
        const anthropic = getAnthropicClient();

        // Use streaming API
        const streamResponse = anthropic.messages.stream({
          model: INTERVIEW_MODEL,
          max_tokens: 1024,
          system: interview.system_prompt || "",
          messages: claudeMessages,
        });

        let fullText = "";

        streamResponse.on("text", (text) => {
          fullText += text;
          sendEvent({ type: "token", text });
        });

        // Wait for the stream to complete
        const finalMessage = await streamResponse.finalMessage();

        // Check for ready marker
        const ready = isReadyToGenerate(fullText);
        const cleanMessage = ready
          ? stripReadyMarker(fullText)
          : fullText;

        // Save to database
        updatedMessages.push({
          role: "assistant",
          content: cleanMessage,
          timestamp: new Date().toISOString(),
        });

        await (supabase as any)
          .from("ai_course_interviews")
          .update({
            messages: updatedMessages,
            total_input_tokens:
              (interview.total_input_tokens || 0) +
              finalMessage.usage.input_tokens,
            total_output_tokens:
              (interview.total_output_tokens || 0) +
              finalMessage.usage.output_tokens,
          })
          .eq("id", interviewId);

        // Send completion event
        sendEvent({
          type: "done",
          readyToGenerate: ready,
          fullMessage: cleanMessage,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "AI service unavailable";
        sendEvent({ type: "error", message: errorMessage });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
