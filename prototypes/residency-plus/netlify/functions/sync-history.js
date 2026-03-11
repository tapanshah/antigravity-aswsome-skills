/**
 * sync-history.js — Cloud continuity for playback history.
 * Method: POST
 * Body: { tracks: [...] }
 */
import { allowOrigin, json } from "./sc-auth-lib.js";
import { getJwtUser, supabaseRestCall } from "./sc-supabase-lib.js";

export default async function handler(req) {
    if (req.method === "OPTIONS") {
        const origin = allowOrigin(req.headers.get("origin"));
        return new Response("", { status: 204, headers: { "access-control-allow-origin": origin || "*", "access-control-allow-headers": "content-type, authorization", "access-control-allow-methods": "POST,OPTIONS" } });
    }

    const origin = allowOrigin(req.headers.get("origin"));
    if (!origin && req.headers.get("origin")) return json(403, { error: "Origin not permitted." });
    if (req.method !== "POST") return json(405, { error: "Method not allowed" }, origin);

    try {
        const user = getJwtUser(req);
        if (!user) return json(401, { error: "Missing or invalid token" }, origin);

        const body = await req.json();
        const tracks = body.tracks || [];
        if (!Array.isArray(tracks)) return json(400, { error: "Invalid payload format" }, origin);

        // Limit payload size to prevent abuse
        const SLICE_2_LIMIT = 50;

        const payload = tracks.slice(0, SLICE_2_LIMIT).map(t => ({
            user_id: user.uid,
            soundcloud_url: t.url,
            title: t.title,
            artist: t.artist,
            bucket: t.bucket,
            played_at: t.playedAt || new Date().toISOString()
        }));

        if (payload.length > 0) {
            // Append only. Deduplication handles naturally by UI
            await supabaseRestCall(`history`, "POST", payload, user.token);
        }

        return json(200, { synced: payload.length }, origin);

    } catch (err) {
        return json(500, { error: err.message }, origin);
    }
}
