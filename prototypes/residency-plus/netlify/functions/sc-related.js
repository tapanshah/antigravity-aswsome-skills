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
    const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get("limit") || "100", 10)));
    const offset = Math.max(0, parseInt(url.searchParams.get("offset") || "0", 10) || 0);

    if (!target || !target.startsWith("http")) {
      return new Response("Missing or invalid ?url=", { status: 400 });
    }

    // 1) Resolve to get an ID + kind
    const resolveUrl = new URL("https://api-v2.soundcloud.com/resolve");
    resolveUrl.searchParams.set("url", target);
    resolveUrl.searchParams.set("client_id", clientId);

    const rr = await fetch(resolveUrl.toString(), {
      headers: { "user-agent": "netlify-function", "accept": "application/json" },
    });

    const rtext = await rr.text();
    if (!rr.ok) return new Response(rtext || `Resolve failed (${rr.status})`, { status: rr.status });

    let resolved = null;
    try { resolved = JSON.parse(rtext); } catch { resolved = null; }

    const id = resolved?.id;
    const kind = (resolved?.kind || resolved?.type || "").toString().toLowerCase();
    if (!id) return new Response(JSON.stringify({ collection: [] }), { status: 200, headers: { "content-type":"application/json" } });

    // 2) Try v2 related (works for tracks on many builds)
    const v2 = new URL(`https://api-v2.soundcloud.com/tracks/${encodeURIComponent(id)}/related`);
    v2.searchParams.set("client_id", clientId);
    v2.searchParams.set("limit", String(limit));
    v2.searchParams.set("offset", String(offset));
    v2.searchParams.set("linked_partitioning", "1");

    let relResp = await fetch(v2.toString(), {
      headers: { "user-agent": "netlify-function", "accept": "application/json" },
    });

    // 3) Fallback to v1 related if v2 fails
    if (!relResp.ok) {
      const v1 = new URL(`https://api.soundcloud.com/tracks/${encodeURIComponent(id)}/related`);
      v1.searchParams.set("client_id", clientId);
      v1.searchParams.set("limit", String(Math.min(50, limit)));
      v1.searchParams.set("offset", String(offset));

      relResp = await fetch(v1.toString(), {
        headers: { "user-agent": "netlify-function", "accept": "application/json" },
        redirect: "follow",
      });
    }

    const text = await relResp.text();
    if (!relResp.ok) {
      return new Response(text || `Related failed (${relResp.status})`, { status: relResp.status });
    }

    // v1 returns an array; normalize to {collection:[...]}
    let out = text;
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) out = JSON.stringify({ collection: parsed });
    } catch {}

    return new Response(out, {
      status: 200,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  } catch (err) {
    return new Response(`Function error: ${String(err?.message || err)}`, { status: 500 });
  }
};
