/**
 * migrate-local-data.js — Handles the one-time transition of anonymous to account data.
 * Method: POST
 * Body: { crate: [...tracks], session: { genre... } }
 */
import { allowOrigin, json } from "./lib/sc-auth-lib.js";
import { getJwtUser, supabaseRestCall } from "./sc-supabase-lib.js";
import { getEntitlementsForPlan } from "./lib/entitlements-lib.js";

const AUTH_ENABLED = process.env.AUTH_ENABLED === "true";

export default async function handler(req) {
    if (req.method === "OPTIONS") {
        const origin = allowOrigin(req.headers.get("origin"));
        return new Response("", { status: 204, headers: { "access-control-allow-origin": origin || "*", "access-control-allow-headers": "content-type, authorization", "access-control-allow-methods": "POST,OPTIONS" } });
    }

    const origin = allowOrigin(req.headers.get("origin"));
    if (!AUTH_ENABLED) return json(200, { auth_enabled: false }, origin);
    if (!origin && req.headers.get("origin")) return json(403, { error: "Origin not permitted." });
    if (req.method !== "POST") return json(405, { error: "Method not allowed" }, origin);

    try {
        const user = getJwtUser(req);
        if (!user) return json(401, { error: "Missing or invalid token" }, origin);

        let plan = "free";
        try {
            const profile = await supabaseRestCall(`users?id=eq.${user.uid}&select=plan`, "GET", null, user.token);
            if (profile && profile.length > 0 && profile[0].plan) {
                plan = profile[0].plan;
            }
        } catch {
        }
        const entitlements = getEntitlementsForPlan(plan);

        const body = await req.json();
        let migratedCrate = 0;
        let migratedSession = false;

        // 1. Migrate Session State (Upsert)
        if (body.session && Object.keys(body.session).length > 0) {
            const sessPayload = {
                user_id: user.uid,
                genre: body.session.genre,
                source: body.session.source,
                dig_range: body.session.dig_range,
                station_id: body.session.station_id,
                _upsert: true
            };
            await supabaseRestCall(`session_state?on_conflict=user_id`, "POST", sessPayload, user.token);
            migratedSession = true;
        }

        // 2. Migrate Crate (Upsert / Ignore Duplicates)
        const tracks = body.crate || [];
        if (Array.isArray(tracks) && tracks.length > 0) {
            const limit = entitlements.crateLimit;
            const cratePayload = tracks.slice(0, limit).map(t => ({
                user_id: user.uid,
                soundcloud_url: t.url,
                title: t.title,
                artist: t.artist,
                bucket: t.bucket,
                kind: t.kind,
                duration_ms: t.durationMs,
                saved_at: t.savedAt || new Date().toISOString()
            }));

            if (cratePayload.length > 0) {
                // Upsert on conflict
                await supabaseRestCall(`crate?on_conflict=user_id,soundcloud_url`, "POST", cratePayload, user.token);
                migratedCrate = cratePayload.length;
            }
        }

        // 3. Migrate Playlists
        const playlists = body.playlists || [];
        let migratedPlaylists = 0;
        if (Array.isArray(playlists) && playlists.length > 0) {
            const maxPlaylists = entitlements.playlistsLimit;
            const maxItems = entitlements.playlistItemsLimit;
            for (const pl of playlists.slice(0, maxPlaylists)) {
                const plPayload = {
                    id: pl.id,
                    user_id: user.uid,
                    name: pl.name,
                    updated_at: pl.updated_at || new Date().toISOString()
                };
                await supabaseRestCall(`playlists?on_conflict=id`, "POST", plPayload, user.token);

                const items = Array.isArray(pl.items) ? pl.items : [];
                const itemsPayload = items.slice(0, maxItems).map(t => ({
                    playlist_id: pl.id,
                    user_id: user.uid,
                    soundcloud_url: t.url,
                    title: t.title,
                    artist: t.artist,
                    bucket: t.bucket,
                    kind: t.kind,
                    duration_ms: t.durationMs,
                    added_at: t.addedAt || new Date().toISOString()
                }));
                if (itemsPayload.length > 0) {
                    await supabaseRestCall(`playlist_items`, "POST", itemsPayload, user.token);
                }
                migratedPlaylists++;
            }
        }

        return json(200, { migrated: true, crate_count: migratedCrate, session_state: migratedSession, playlists_count: migratedPlaylists }, origin);

    } catch (err) {
        return json(500, { error: err.message }, origin);
    }
}
