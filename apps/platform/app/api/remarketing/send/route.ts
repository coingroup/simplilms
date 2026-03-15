import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/remarketing/send
 *
 * Proxy endpoint that forwards remarketing requests to the n8n webhook.
 * This is a fallback in case the server action can't directly reach n8n.
 * The primary path is through the sendRemarketing server action.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const webhookUrl = process.env.N8N_REMARKETING_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Remarketing webhook not configured. Message logged only.",
        },
        { status: 200 }
      );
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Webhook returned an error" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remarketing API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
