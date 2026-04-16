export async function POST(req: Request) {
  try {
    const body = await req.json();

    return Response.json({
      ok: false,
      error: {
        type: "backend_not_configured",
        message:
          "The /api/analyze route exists, but it is not yet connected to Anthropic. Add your server-side API call here.",
      },
      received: {
        model: body?.model ?? null,
        has_system: !!body?.system,
        has_messages: Array.isArray(body?.messages),
      },
    }, { status: 501 });
  } catch (error) {
    return Response.json({
      ok: false,
      error: {
        type: "invalid_request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    }, { status: 400 });
  }
}
