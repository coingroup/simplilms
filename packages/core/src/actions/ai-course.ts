"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getUser } from "@simplilms/auth/server";
import { getTenantId } from "../lib/tenant";
import {
  getAnthropicClient,
  getInterviewSystemPrompt,
  getGenerationSystemPrompt,
  getDocumentGenerationPrompt,
  INTERVIEW_MODEL,
  GENERATION_MODEL,
  SECTOR_AI_PROMPTS,
  parseGeneratedOutline,
  isReadyToGenerate,
  stripReadyMarker,
  type ChatMessage,
  type GeneratedOutline,
} from "../lib/ai-service";

// ============================================================
// Types
// ============================================================

export interface AiCourseInterviewRow {
  id: string;
  tenant_id: string;
  created_by: string;
  status:
    | "interviewing"
    | "generating"
    | "review"
    | "completed"
    | "failed";
  topic: string;
  target_audience: string | null;
  desired_length: string | null;
  additional_context: string | null;
  generation_mode: "interview" | "document" | "topic";
  sector_key: string | null;
  messages: ChatMessage[];
  system_prompt: string | null;
  uploaded_documents: {
    name: string;
    storage_path: string;
    content_text: string;
  }[];
  total_input_tokens: number;
  total_output_tokens: number;
  generated_outline: GeneratedOutline | null;
  generated_course_id: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Queries
// ============================================================

export async function getAiInterviews(): Promise<AiCourseInterviewRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("ai_course_interviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching AI interviews:", error);
    return [];
  }
  return (data || []) as AiCourseInterviewRow[];
}

export async function getAiInterview(
  id: string
): Promise<AiCourseInterviewRow | null> {
  const supabase = await createServerClient();
  const { data, error } = await (supabase as any)
    .from("ai_course_interviews")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching AI interview:", error);
    return null;
  }
  return data as AiCourseInterviewRow;
}

// ============================================================
// Start Interview
// ============================================================

export async function startInterview(formData: FormData): Promise<{
  interviewId: string | null;
  error?: string;
}> {
  const { user, error: authError } = await getUser();
  if (authError || !user) return { interviewId: null, error: "Not authenticated" };

  const topic = formData.get("topic") as string;
  const targetAudience = formData.get("targetAudience") as string;
  const desiredLength = formData.get("desiredLength") as string;
  const additionalContext =
    (formData.get("additionalContext") as string) || null;
  const sectorKey = (formData.get("sectorKey") as string) || null;
  const generationMode =
    (formData.get("generationMode") as string) || "interview";

  if (!topic) return { interviewId: null, error: "Topic is required" };

  const tenantId = getTenantId();
  const sectorPrompt = sectorKey
    ? SECTOR_AI_PROMPTS[sectorKey]
    : undefined;

  // If document mode, skip interview — go straight to review
  if (generationMode === "document") {
    const supabase = await createServerClient();
    const { data, error } = await (supabase as any)
      .from("ai_course_interviews")
      .insert({
        tenant_id: tenantId,
        created_by: user.user.id,
        topic,
        target_audience: targetAudience || null,
        desired_length: desiredLength || null,
        additional_context: additionalContext,
        generation_mode: "document",
        sector_key: sectorKey,
        status: "interviewing", // Will change to generating when docs are uploaded
        messages: [],
        system_prompt: null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating AI interview:", error);
      return { interviewId: null, error: "Failed to create interview" };
    }

    return { interviewId: data.id };
  }

  // Interview mode: start conversation with Claude
  const systemPrompt = getInterviewSystemPrompt(
    topic,
    targetAudience || "general learners",
    desiredLength || "self-paced",
    additionalContext || undefined,
    sectorPrompt
  );

  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: INTERVIEW_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content:
            "I'm ready to be interviewed about this topic. Please begin.",
        },
      ],
    });

    const assistantMessage =
      response.content[0].type === "text"
        ? response.content[0].text
        : "";

    const now = new Date().toISOString();
    const messages: ChatMessage[] = [
      {
        role: "assistant",
        content: assistantMessage,
        timestamp: now,
      },
    ];

    const supabase = await createServerClient();
    const { data, error } = await (supabase as any)
      .from("ai_course_interviews")
      .insert({
        tenant_id: tenantId,
        created_by: user.user.id,
        topic,
        target_audience: targetAudience || null,
        desired_length: desiredLength || null,
        additional_context: additionalContext,
        generation_mode: "interview",
        sector_key: sectorKey,
        status: "interviewing",
        messages,
        system_prompt: systemPrompt,
        total_input_tokens: response.usage.input_tokens,
        total_output_tokens: response.usage.output_tokens,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating AI interview:", error);
      return { interviewId: null, error: "Failed to create interview" };
    }

    return { interviewId: data.id };
  } catch (err) {
    console.error("Claude API error:", err);
    return {
      interviewId: null,
      error: "AI service unavailable. Please try again.",
    };
  }
}

// ============================================================
// Send Interview Message
// ============================================================

export async function sendInterviewMessage(
  interviewId: string,
  userMessage: string
): Promise<{
  assistantMessage: string;
  readyToGenerate: boolean;
  error?: string;
}> {
  const { user, error: authError } = await getUser();
  if (authError || !user)
    return {
      assistantMessage: "",
      readyToGenerate: false,
      error: "Not authenticated",
    };

  const supabase = await createServerClient();
  const { data: interview, error: fetchError } = await (supabase as any)
    .from("ai_course_interviews")
    .select("*")
    .eq("id", interviewId)
    .eq("created_by", user.user.id)
    .single();

  if (fetchError || !interview) {
    return {
      assistantMessage: "",
      readyToGenerate: false,
      error: "Interview not found",
    };
  }

  if (interview.status !== "interviewing") {
    return {
      assistantMessage: "",
      readyToGenerate: false,
      error: "Interview is not in progress",
    };
  }

  const now = new Date().toISOString();
  const updatedMessages: ChatMessage[] = [
    ...(interview.messages as ChatMessage[]),
    { role: "user" as const, content: userMessage, timestamp: now },
  ];

  // Build Claude messages array (exclude timestamps for API)
  const claudeMessages = updatedMessages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Prepend the initial trigger message
  const fullMessages = [
    {
      role: "user" as const,
      content:
        "I'm ready to be interviewed about this topic. Please begin.",
    },
    ...claudeMessages,
  ];

  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: INTERVIEW_MODEL,
      max_tokens: 1024,
      system: interview.system_prompt || "",
      messages: fullMessages,
    });

    const rawAssistantMessage =
      response.content[0].type === "text"
        ? response.content[0].text
        : "";

    const ready = isReadyToGenerate(rawAssistantMessage);
    const cleanMessage = ready
      ? stripReadyMarker(rawAssistantMessage)
      : rawAssistantMessage;

    updatedMessages.push({
      role: "assistant",
      content: cleanMessage,
      timestamp: new Date().toISOString(),
    });

    const { error: updateError } = await (supabase as any)
      .from("ai_course_interviews")
      .update({
        messages: updatedMessages,
        total_input_tokens:
          (interview.total_input_tokens || 0) +
          response.usage.input_tokens,
        total_output_tokens:
          (interview.total_output_tokens || 0) +
          response.usage.output_tokens,
      })
      .eq("id", interviewId);

    if (updateError) {
      console.error("Error updating interview:", updateError);
    }

    return {
      assistantMessage: cleanMessage,
      readyToGenerate: ready,
    };
  } catch (err) {
    console.error("Claude API error:", err);
    return {
      assistantMessage: "",
      readyToGenerate: false,
      error: "AI service unavailable. Please try again.",
    };
  }
}

// ============================================================
// Generate Course Outline
// ============================================================

export async function generateCourseFromInterview(
  interviewId: string
): Promise<{
  outline: GeneratedOutline | null;
  error?: string;
}> {
  const { user, error: authError } = await getUser();
  if (authError || !user) return { outline: null, error: "Not authenticated" };

  const supabase = await createServerClient();
  const { data: interview, error: fetchError } = await (supabase as any)
    .from("ai_course_interviews")
    .select("*")
    .eq("id", interviewId)
    .eq("created_by", user.user.id)
    .single();

  if (fetchError || !interview) {
    return { outline: null, error: "Interview not found" };
  }

  // Update status to generating
  await (supabase as any)
    .from("ai_course_interviews")
    .update({ status: "generating" })
    .eq("id", interviewId);

  const sectorPrompt = interview.sector_key
    ? SECTOR_AI_PROMPTS[interview.sector_key]
    : undefined;

  try {
    const anthropic = getAnthropicClient();
    let responseText: string;

    if (interview.generation_mode === "document") {
      // Document-based generation
      const docContents = (interview.uploaded_documents || [])
        .map(
          (d: { name: string; content_text: string }) =>
            `--- Document: ${d.name} ---\n${d.content_text}`
        )
        .join("\n\n");

      const prompt = getDocumentGenerationPrompt(
        interview.topic,
        interview.target_audience || "general learners",
        interview.desired_length || "self-paced",
        docContents,
        interview.additional_context || undefined,
        sectorPrompt
      );

      const response = await anthropic.messages.create({
        model: GENERATION_MODEL,
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
      });

      responseText =
        response.content[0].type === "text"
          ? response.content[0].text
          : "";

      await (supabase as any)
        .from("ai_course_interviews")
        .update({
          total_input_tokens:
            (interview.total_input_tokens || 0) +
            response.usage.input_tokens,
          total_output_tokens:
            (interview.total_output_tokens || 0) +
            response.usage.output_tokens,
        })
        .eq("id", interviewId);
    } else {
      // Interview-based generation
      const transcript = (interview.messages as ChatMessage[])
        .map(
          (m) =>
            `${m.role === "assistant" ? "INTERVIEWER" : "EXPERT"}: ${m.content}`
        )
        .join("\n\n");

      const systemPrompt = getGenerationSystemPrompt(sectorPrompt);

      const response = await anthropic.messages.create({
        model: GENERATION_MODEL,
        max_tokens: 8192,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Here is the interview transcript:\n\n${transcript}\n\nGenerate the complete course structure as JSON.`,
          },
        ],
      });

      responseText =
        response.content[0].type === "text"
          ? response.content[0].text
          : "";

      await (supabase as any)
        .from("ai_course_interviews")
        .update({
          total_input_tokens:
            (interview.total_input_tokens || 0) +
            response.usage.input_tokens,
          total_output_tokens:
            (interview.total_output_tokens || 0) +
            response.usage.output_tokens,
        })
        .eq("id", interviewId);
    }

    // Parse the generated outline
    const outline = parseGeneratedOutline(responseText);

    // Store outline and update status
    await (supabase as any)
      .from("ai_course_interviews")
      .update({
        generated_outline: outline,
        status: "review",
      })
      .eq("id", interviewId);

    revalidatePath(`/admin/courses/ai/${interviewId}`);

    return { outline };
  } catch (err) {
    console.error("Course generation error:", err);

    const errorMessage =
      err instanceof Error ? err.message : "Unknown error";

    await (supabase as any)
      .from("ai_course_interviews")
      .update({
        status: "failed",
        error_message: errorMessage,
      })
      .eq("id", interviewId);

    return { outline: null, error: `Generation failed: ${errorMessage}` };
  }
}

// ============================================================
// Create Course from Outline
// ============================================================

export async function createCourseFromOutline(
  interviewId: string,
  editedOutline?: GeneratedOutline
): Promise<{
  courseId: string | null;
  error?: string;
}> {
  const { user, error: authError } = await getUser();
  if (authError || !user) return { courseId: null, error: "Not authenticated" };

  const supabase = await createServerClient();
  const { data: interview, error: fetchError } = await (supabase as any)
    .from("ai_course_interviews")
    .select("*")
    .eq("id", interviewId)
    .eq("created_by", user.user.id)
    .single();

  if (fetchError || !interview) {
    return { courseId: null, error: "Interview not found" };
  }

  const outline: GeneratedOutline =
    editedOutline || (interview.generated_outline as GeneratedOutline);

  if (!outline) {
    return { courseId: null, error: "No generated outline found" };
  }

  const tenantId = getTenantId();

  try {
    // Create the course
    const slug = outline.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100);

    const { data: course, error: courseError } = await (supabase as any)
      .from("courses")
      .insert({
        tenant_id: tenantId,
        title: outline.title,
        slug: `${slug}-${Date.now()}`,
        description: outline.description,
        category: outline.category || null,
        difficulty: outline.difficulty || "beginner",
        estimated_hours: outline.estimated_hours || null,
        is_published: false,
        is_free: true,
        instructor_id: user.user.id,
        learning_objectives: outline.learning_objectives || [],
        tags: interview.sector_key ? [interview.sector_key] : [],
        settings: { ai_generated: true, interview_id: interviewId },
      })
      .select("id")
      .single();

    if (courseError) {
      console.error("Error creating course:", courseError);
      return { courseId: null, error: "Failed to create course" };
    }

    const courseId = course.id;

    // Create modules and lessons
    for (let mi = 0; mi < outline.modules.length; mi++) {
      const mod = outline.modules[mi];

      const { data: moduleData, error: modError } = await (
        supabase as any
      )
        .from("modules")
        .insert({
          tenant_id: tenantId,
          course_id: courseId,
          title: mod.title,
          description: mod.description || null,
          sort_order: mi,
          is_published: true,
        })
        .select("id")
        .single();

      if (modError) {
        console.error("Error creating module:", modError);
        continue;
      }

      for (let li = 0; li < mod.lessons.length; li++) {
        const lesson = mod.lessons[li];

        const { data: lessonData, error: lessonError } = await (
          supabase as any
        )
          .from("lessons")
          .insert({
            tenant_id: tenantId,
            module_id: moduleData.id,
            title: lesson.title,
            content_type: lesson.content_type || "text",
            content: { html: lesson.content },
            duration_minutes: lesson.duration_minutes || 15,
            is_required: true,
            is_published: true,
            sort_order: li,
          })
          .select("id")
          .single();

        if (lessonError) {
          console.error("Error creating lesson:", lessonError);
          continue;
        }

        // Create quiz for this lesson if questions exist
        if (lesson.quiz_questions && lesson.quiz_questions.length > 0) {
          const { data: quiz, error: quizError } = await (
            supabase as any
          )
            .from("quizzes")
            .insert({
              tenant_id: tenantId,
              course_id: courseId,
              lesson_id: lessonData.id,
              title: `${lesson.title} Quiz`,
              description: `Assessment for: ${lesson.title}`,
              passing_score: 70,
              max_attempts: 3,
              time_limit_minutes: null,
              shuffle_questions: true,
              show_correct_answers: true,
              is_published: true,
            })
            .select("id")
            .single();

          if (quizError) {
            console.error("Error creating quiz:", quizError);
            continue;
          }

          // Insert quiz questions
          for (let qi = 0; qi < lesson.quiz_questions.length; qi++) {
            const q = lesson.quiz_questions[qi];

            let correctAnswer = "";
            if (q.question_type === "multiple_choice" && q.options) {
              const correct = q.options.find((o) => o.is_correct);
              correctAnswer = correct?.id || "a";
            } else if (q.question_type === "true_false") {
              correctAnswer = String(q.correct_answer ?? true);
            } else if (q.question_type === "short_answer") {
              correctAnswer = String(q.correct_answer || "");
            }

            await (supabase as any)
              .from("quiz_questions")
              .insert({
                tenant_id: tenantId,
                quiz_id: quiz.id,
                question_type: q.question_type,
                question_text: q.question_text,
                options: q.options || null,
                correct_answer: correctAnswer,
                explanation: q.explanation || null,
                points: 1,
                sort_order: qi,
              });
          }
        }
      }
    }

    // Update interview with generated course link
    await (supabase as any)
      .from("ai_course_interviews")
      .update({
        generated_course_id: courseId,
        status: "completed",
      })
      .eq("id", interviewId);

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/ai/${interviewId}`);

    return { courseId };
  } catch (err) {
    console.error("Error creating course from outline:", err);
    return {
      courseId: null,
      error: "Failed to create course. Please try again.",
    };
  }
}

// ============================================================
// Upload Document for Document Mode
// ============================================================

export async function addDocumentToInterview(
  interviewId: string,
  formData: FormData
): Promise<{
  success: boolean;
  error?: string;
}> {
  const { user, error: authError } = await getUser();
  if (authError || !user) return { success: false, error: "Not authenticated" };

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided" };

  // Simple text extraction — for MVP, handle text-based files
  const text = await file.text();

  const supabase = await createServerClient();
  const { data: interview, error: fetchError } = await (supabase as any)
    .from("ai_course_interviews")
    .select("uploaded_documents")
    .eq("id", interviewId)
    .eq("created_by", user.user.id)
    .single();

  if (fetchError || !interview) {
    return { success: false, error: "Interview not found" };
  }

  const existingDocs = interview.uploaded_documents || [];
  const updatedDocs = [
    ...existingDocs,
    {
      name: file.name,
      storage_path: `ai-documents/${interviewId}/${file.name}`,
      content_text: text.slice(0, 100000), // Limit to ~100k chars
    },
  ];

  const { error: updateError } = await (supabase as any)
    .from("ai_course_interviews")
    .update({ uploaded_documents: updatedDocs })
    .eq("id", interviewId);

  if (updateError) {
    return { success: false, error: "Failed to save document" };
  }

  revalidatePath(`/admin/courses/ai/${interviewId}`);
  return { success: true };
}

// ============================================================
// Delete Interview
// ============================================================

export async function deleteAiInterview(
  interviewId: string
): Promise<{ success: boolean; error?: string }> {
  const { user, error: authError } = await getUser();
  if (authError || !user) return { success: false, error: "Not authenticated" };

  const supabase = await createServerClient();
  const { error } = await (supabase as any)
    .from("ai_course_interviews")
    .delete()
    .eq("id", interviewId);

  if (error) {
    console.error("Error deleting AI interview:", error);
    return { success: false, error: "Failed to delete" };
  }

  revalidatePath("/admin/courses/ai");
  return { success: true };
}
