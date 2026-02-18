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
    const q = (url.searchParams.get("q") || "").trim();
    const kind = (url.searchParams.get("kind") || "tracks").trim(); // "tracks" or "playlists"
    const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get("limit") || "50", 10)));
    const offset = Math.max(0, parseInt(url.searchParams.get("offset") || "0", 10) || 0);

    if (!q) {
      return new Response(JSON.stringify({ collection: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    const api = new URL(`https://api-v2.soundcloud.com/search/${encodeURIComponent(kind)}`);
    api.searchParams.set("q", q);
    api.searchParams.set("client_id", clientId);
    api.searchParams.set("limit", String(limit));
    api.searchParams.set("offset", String(offset));
    api.searchParams.set("linked_partitioning", "1");
    api.searchParams.set("app_locale", "en");

    // keep your earlier params (harmless, sometimes helps parity with web)
    api.searchParams.set("sc_a_id", "residency-plus");
    api.searchParams.set("variant_ids", "26146");

    const r = await fetch(api.toString(), {
      headers: {
        "user-agent": "netlify-function",
        "accept": "application/json",
      },
    });

    const text = await r.text();
    if (!r.ok) {
      return new Response(text || `SoundCloud search failed (${r.status})`, { status: r.status });
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
