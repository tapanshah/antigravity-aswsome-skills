/**
 * get-entitlements.js — Returns current user's plan + entitlement limits.
 *
 * This is a thin wrapper over the entitlements-lib mapping and Supabase
 * `public.users.plan` column. When AUTH_ENABLED is false or Supabase is
 * unavailable, it safely falls back to free-tier entitlements.
 */

import { allowOrigin, json } from "./lib/sc-auth-lib.js";
import { getJwtUser, supabaseRestCall } from "./sc-supabase-lib.js";
import { getEntitlementsForPlan } from "./lib/entitlements-lib.js";

const AUTH_ENABLED = process.env.AUTH_ENABLED === "true";

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    const origin = allowOrigin(req.headers.get("origin"));
    return new Response("", {
      status: 204,
      headers: {
        "access-control-allow-origin": origin || "*",
        "access-control-allow-headers": "content-type, authorization",
        "access-control-allow-methods": "GET,OPTIONS",
      },
    });
  }

  const origin = allowOrigin(req.headers.get("origin"));
  if (!origin && req.headers.get("origin")) return json(403, { error: "Origin not permitted." });

  try {
    if (!AUTH_ENABLED) {
      const ent = getEntitlementsForPlan("free");
      return json(200, { auth_enabled: false, plan: ent.plan, entitlements: ent }, origin);
    }

    const user = getJwtUser(req);
    if (!user) {
      const ent = getEntitlementsForPlan("free");
      return json(200, { authenticated: false, plan: ent.plan, entitlements: ent }, origin);
    }

    let plan = "free";
    try {
      const data = await supabaseRestCall(`users?id=eq.${user.uid}&select=plan`, "GET", null, user.token);
      if (data && data.length > 0 && data[0].plan) {
        plan = data[0].plan;
      }
    } catch {
      // default to free if lookup fails
    }

    const ent = getEntitlementsForPlan(plan);
    return json(200, {
      authenticated: true,
      plan: ent.plan,
      entitlements: ent,
    }, origin);
  } catch (err) {
    return json(500, { error: err.message }, origin);
  }
}

