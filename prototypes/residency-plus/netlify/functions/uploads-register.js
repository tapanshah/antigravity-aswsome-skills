/**
 * uploads-register.js — Stub: register upload metadata (e.g. after file is in storage).
 * Backend-only; not wired to production UI. Caller must set user_id from JWT; we do not trust client.
 * Ownership: INSERT with user_id from auth only; RLS enforces.
 */
const { allowOrigin, json } = require("./lib/sc-auth-lib.js");

const AUTH_ENABLED = process.env.AUTH_ENABLED === "true";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

function getBearerUserIdFromEvent(event) {
  const headers = event.headers || {};
  const authHeader = headers.authorization || headers.Authorization || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
    return payload && payload.sub ? payload.sub : null;
  } catch {
    return null;
  }
}

function getBearerTokenFromEvent(event) {
  const headers = event.headers || {};
  const authHeader = headers.authorization || headers.Authorization || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length).trim();
  return token || null;
}

exports.handler = async function (event) {
  console.log("[uploads-register] start");
  const headers = event.headers || {};
  const origin = headers.origin || headers.Origin || "";
  const allowedOrigin = allowOrigin(origin) || "*";

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "access-control-allow-origin": allowedOrigin,
        "access-control-allow-headers": "content-type, authorization",
        "access-control-allow-methods": "POST, OPTIONS",
        vary: "Origin"
      }
    };
  }

  if (event.httpMethod !== "POST") {
    return json(
      405,
      { error: "method_not_allowed", message: "Use POST." },
      allowedOrigin
    );
  }

  if (!AUTH_ENABLED) {
    return json(401, { error: "Auth disabled" }, allowedOrigin);
  }

  const userId = getBearerUserIdFromEvent(event);
  const token = getBearerTokenFromEvent(event);
  if (!userId || !token) {
    return json(401, { error: "unauthorized", message: "Sign in required." }, allowedOrigin);
  }

  let body = null;
  try {
    if (typeof event.body === "string") body = event.body ? JSON.parse(event.body) : {};
    else body = event.body || {};
  } catch {
    return json(400, { error: "invalid_json", message: "Invalid JSON" }, allowedOrigin);
  }

  const title = typeof body.title === "string" ? body.title.trim() : null;
  const artist = typeof body.artist === "string" ? body.artist.trim() : "";
  const storage_url = typeof body.storage_url === "string" ? body.storage_url.trim() : null;
  const original_filename = typeof body.original_filename === "string" ? body.original_filename.trim() : null;
  const mime_type = typeof body.mime_type === "string" ? body.mime_type.trim() : null;
  const duration_ms = Number.isFinite(body.duration_ms) ? body.duration_ms : null;
  const artwork_url = typeof body.artwork_url === "string" ? body.artwork_url.trim() : null;

  if (!title || !storage_url) {
    console.log("[uploads-register] validation failed", { titlePresent: !!title, storageUrlPresent: !!storage_url });
    return json(400, { error: "validation_failed", message: "title and storage_url are required." }, allowedOrigin);
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("[uploads-register] missing Supabase env vars", { SUPABASE_URL: !!SUPABASE_URL, SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY });
    return json(500, { error: "server_error", message: "Supabase env vars missing." }, allowedOrigin);
  }

  const insertRow = {
    user_id: userId,
    title,
    artist: artist || "",
    original_filename: original_filename || null,
    mime_type: mime_type || null,
    duration_ms: Number.isFinite(duration_ms) ? duration_ms : null,
    artwork_url: artwork_url || null,
    storage_url
  };

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/user_uploads`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify(insertRow)
    });

    let text = "";
    try { text = await res.text(); } catch (_) {}

    if (!res.ok) {
      console.error("[uploads-register] supabase insert failed", { status: res.status, body: text });
      const status = res.status >= 400 && res.status < 500 ? 400 : 500;
      return json(
        status,
        { error: "register_failed", message: `Supabase insert failed (${res.status}): ${text || res.statusText}` },
        allowedOrigin
      );
    }

    let parsed = null;
    try { parsed = text ? JSON.parse(text) : null; } catch (_) {}
    const insertedRow = Array.isArray(parsed) ? parsed[0] : parsed;

    console.log("[uploads-register] ok", { id: insertedRow && insertedRow.id });
    return json(
      201,
      { ok: true, id: insertedRow && insertedRow.id, item: insertedRow },
      allowedOrigin
    );
  } catch (e) {
    console.error("[uploads-register] fatal", e);
    return json(500, { error: "register_failed", message: e && e.message ? e.message : "Unknown error" }, allowedOrigin);
  }
};
