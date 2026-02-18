export default async (req, context) => {
  try {
    const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
    if (!clientId) {
      return new Response(
        "Missing env var SOUNDCLOUD_CLIENT_ID. Set it in Netlify and redeploy.",
        { status: 500 }
      );
    }

    const url = new URL(req.url);
    const target = (url.searchParams.get("url") || "").trim();

    if (!target || !target.startsWith("http")) {
      return new Response("Missing or invalid ?url=", { status: 400 });
    }

    // Resolve a SoundCloud URL (track/playlist/user) into an API object
    const api = new URL("https://api-v2.soundcloud.com/resolve");
    api.searchParams.set("url", target);
    api.searchParams.set("client_id", clientId);

    const r = await fetch(api.toString(), {
      headers: {
        "user-agent": "netlify-function",
        "accept": "application/json",
      },
    });

    const text = await r.text();
    if (!r.ok) {
      return new Response(text || `SoundCloud resolve failed (${r.status})`, { status: r.status });
    }

    return new Response(text, {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    return new Response(`Function error: ${String(err?.message || err)}`, { status: 500 });
  }
};
