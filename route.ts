import { NextRequest, NextResponse } from "next/server";

// Edge runtime: lowest latency on Vercel, no cold-start penalty
export const runtime = "edge";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error("[NCW /api/analyze] ANTHROPIC_API_KEY is not set");
    return NextResponse.json(
      {
        error: {
          type: "configuration_error",
          message:
            "ANTHROPIC_API_KEY is not configured. Add it in Vercel → Project Settings → Environment Variables.",
        },
      },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { type: "invalid_request", message: "Request body must be valid JSON." } },
      { status: 400 }
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("[NCW /api/analyze] Upstream fetch failed:", err);
    return NextResponse.json(
      { error: { type: "upstream_error", message: "Could not reach Anthropic API." } },
      { status: 502 }
    );
  }

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
