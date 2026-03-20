/**
 * uploads-update.js — Update upload metadata (title, artist). Labs-only.
 * Ownership: RLS; only the owning user can update.
 */
import { allowOrigin, json } from "./lib/sc-auth-lib.js";
import { getJwtUser, supabaseRestCall } from "./sc-supabase-lib.js";

const AUTH_ENABLED = process.env.AUTH_ENABLED === "true";

export default async function handler(req) {
  const headerOrigin = typeof req.headers?.get === "function"
    ? req.headers.get("origin")
    : (req.headers?.origin || req.headers?.Origin || "");

  if (req.method === "OPTIONS") {
    const origin = allowOrigin(headerOrigin);
    return new Response("", {
      status: 204,
      headers: {
        "access-control-allow-origin": origin || "*",
        "access-control-allow-headers": "content-type, authorization",
        "access-control-allow-methods": "PATCH,POST,OPTIONS",
      },
    });
  }

  const origin = allowOrigin(headerOrigin);
  if (!origin && headerOrigin) return json(403, { error: "Origin not permitted." }, origin);
  if (req.method !== "PATCH" && req.method !== "POST") return json(405, { error: "Method not allowed" }, origin);

  if (!AUTH_ENABLED) {
    return json(401, { error: "Auth disabled" }, origin);
  }

  const user = getJwtUser(req);
  if (!user) {
    return json(401, { error: "Missing or invalid token" }, origin);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON" }, origin);
  }

  const id = body && typeof body.id === "string" ? body.id.trim() : null;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return json(400, { error: "Invalid id" }, origin);
  }

  const payload = { updated_at: new Date().toISOString() };
  if (typeof body.title === "string") payload.title = body.title.trim() || "Untitled";
  if (typeof body.artist === "string") payload.artist = body.artist.trim();

  if (Object.keys(payload).length <= 1) {
    return json(400, { error: "No fields to update" }, origin);
  }

  const path = `user_uploads?id=eq.${encodeURIComponent(id)}&user_id=eq.${user.uid}`;
  try {
    await supabaseRestCall(path, "PATCH", payload, user.token);
    return json(200, { ok: true, id }, origin);
  } catch (e) {
    console.error("[uploads-update] error", e?.message);
    return json(500, { error: "Server error" }, origin);
  }
}
