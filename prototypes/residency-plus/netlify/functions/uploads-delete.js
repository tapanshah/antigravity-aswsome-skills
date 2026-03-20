/**
 * uploads-delete.js — Delete one user upload (metadata row). Labs-only.
 * Ownership: RLS ensures user can only delete own rows. Client should remove
 * the object from Storage after this succeeds (path from storage_url).
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
        "access-control-allow-methods": "DELETE,POST,OPTIONS",
      },
    });
  }

  const origin = allowOrigin(headerOrigin);
  if (!origin && headerOrigin) return json(403, { error: "Origin not permitted." }, origin);
  if (req.method !== "DELETE" && req.method !== "POST") return json(405, { error: "Method not allowed" }, origin);

  if (!AUTH_ENABLED) {
    return json(401, { error: "Auth disabled" }, origin);
  }

  const user = getJwtUser(req);
  if (!user) {
    return json(401, { error: "Missing or invalid token" }, origin);
  }

  let id = null;
  if (req.method === "DELETE") {
    id = new URL(req.url || "").searchParams.get("id");
  } else {
    try {
      const body = await req.json();
      id = body && typeof body.id === "string" ? body.id.trim() : null;
    } catch {
      id = null;
    }
  }
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return json(400, { error: "Invalid id" }, origin);
  }

  const path = `user_uploads?id=eq.${encodeURIComponent(id)}&user_id=eq.${user.uid}`;
  try {
    const existing = await supabaseRestCall(`${path}&select=id,storage_url`, "GET", null, user.token);
    const rows = Array.isArray(existing) ? existing : [];
    if (rows.length === 0) {
      return json(404, { error: "Not found" }, origin);
    }
    await supabaseRestCall(path, "DELETE", null, user.token);
    const storageUrl = rows[0] && rows[0].storage_url;
    return json(200, { ok: true, id, storage_url: storageUrl || null }, origin);
  } catch (e) {
    console.error("[uploads-delete] error", e?.message);
    return json(500, { error: "Server error" }, origin);
  }
}
