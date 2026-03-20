const crypto = require("crypto");
const { allowOrigin, json } = require("./lib/sc-auth-lib.js");

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
    return payload?.sub || null;
  } catch {
    return null;
  }
}

function sanitizeFilename(name) {
  return String(name || "")
    .trim()
    .replace(/[^\w.\-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

exports.handler = async function (event) {
  const headers = event.headers || {};
  const origin = headers.origin || headers.Origin || "";

  if (event.httpMethod === "OPTIONS") {
    const allowed = allowOrigin(origin) || "*";
    return {
      statusCode: 204,
      headers: {
        "access-control-allow-origin": allowed,
        "access-control-allow-headers": "content-type, authorization",
        "access-control-allow-methods": "POST, OPTIONS",
        vary: "Origin"
      }
    };
  }

  if (event.httpMethod !== "POST") {
    return json(
      405,
      { error: "method_not_allowed", message: "Use POST. uploads-prepare-v2" },
      allowOrigin(origin) || "*"
    );
  }

  try {
    const userId = getBearerUserIdFromEvent(event);
    if (!userId) {
      return json(
        401,
        { error: "unauthorized", message: "Sign in required." },
        allowOrigin(origin) || "*"
      );
    }

    const body = JSON.parse(event.body || "{}");
    const filename = sanitizeFilename(body.filename);
    if (!filename) {
      return json(
        400,
        { error: "invalid_filename", message: "Filename is required." },
        allowOrigin(origin) || "*"
      );
    }

    const uploadId = crypto.randomUUID();
    const path = `${userId}/${uploadId}/${filename}`;

    console.log("[uploads-prepare] ok", {
      uid: userId,
      filename,
      path
    });
    console.log("[uploads-prepare] version uploads-prepare-v2", { uid: userId, filename, path });

    return json(
      200,
      {
        uploadId,
        path,
        bucket: "uploads"
      },
      allowOrigin(origin) || "*"
    );
  } catch (err) {
    console.error("[uploads-prepare] fatal", err);
    return json(
      500,
      {
        error: "prepare_failed",
        message: `prepare_failed_v2: ${err && err.message ? err.message : "Unknown prepare error"}`
      },
      allowOrigin(origin) || "*"
    );
  }
};
