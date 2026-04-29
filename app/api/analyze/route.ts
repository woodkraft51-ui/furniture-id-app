export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const engineMode = process.env.ENGINE_MODE || "LIVE";

    if (engineMode === "MOCK") {
      return Response.json({
        ok: true,
        content: [
          {
            text: JSON.stringify({
              observations: [],
              perception: {},
              debug: "MOCK MODE ENABLED - no Anthropic call made",
            }),
          },
        ],
      });
    }

    if (!apiKey) {
      return Response.json(
        {
          ok: false,
          error: {
            type: "missing_api_key",
            message: "ANTHROPIC_API_KEY is not set on the server.",
          },
        },
        { status: 500 }
      );
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    return Response.json(data, { status: res.status });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: {
          type: "invalid_request",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 400 }
    );
  }
}
