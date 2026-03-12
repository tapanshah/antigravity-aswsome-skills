/**
 * billing-create-checkout.js — Stripe Checkout session foundation.
 *
 * This is a guarded foundation only. When billing env vars are missing or
 * BILLING_ENABLED is not "true", it returns a non-fatal "billing_disabled"
 * response so the app can continue to function normally.
 */

import { allowOrigin, json, logTelemetry } from "./lib/sc-auth-lib.js";
import { getJwtUser } from "./sc-supabase-lib.js";

const BILLING_ENABLED = process.env.BILLING_ENABLED === "true";
const STRIPE_PRICE_RESIDENCY_PLUS = process.env.STRIPE_PRICE_RESIDENCY_PLUS;

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    const origin = allowOrigin(req.headers.get("origin"));
    return new Response("", {
      status: 204,
      headers: {
        "access-control-allow-origin": origin || "*",
        "access-control-allow-headers": "content-type, authorization",
        "access-control-allow-methods": "POST,OPTIONS",
      },
    });
  }

  const origin = allowOrigin(req.headers.get("origin"));
  if (!origin && req.headers.get("origin")) return json(403, { error: "Origin not permitted." });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" }, origin);

  if (!BILLING_ENABLED || !process.env.STRIPE_SECRET_KEY || !STRIPE_PRICE_RESIDENCY_PLUS) {
    logTelemetry("billing_checkout_disabled", { endpoint: "billing-create-checkout", origin });
    return json(200, { billing_enabled: false }, origin);
  }

  try {
    const user = getJwtUser(req);
    if (!user) {
      logTelemetry("billing_checkout_auth_invalid", { endpoint: "billing-create-checkout", origin });
      return json(401, { error: "Missing or invalid token" }, origin);
    }

    // Lazy-load Stripe only when billing is actually enabled.
    const StripeModule = await import("stripe");
    const stripe = new StripeModule.default(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    const body = await req.json();
    const successUrl = body.success_url || process.env.BILLING_SUCCESS_URL;
    const cancelUrl = body.cancel_url || process.env.BILLING_CANCEL_URL;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: STRIPE_PRICE_RESIDENCY_PLUS,
          quantity: 1,
        },
      ],
      customer_email: user.email || undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        rplus_user_id: user.uid,
      },
    });

    logTelemetry("billing_checkout_started", {
      endpoint: "billing-create-checkout",
      origin,
      plan: "residency_plus"
    });

    return json(200, { billing_enabled: true, url: session.url }, origin);
  } catch (err) {
    // Foundation only: treat billing failure as non-fatal.
    logTelemetry("billing_checkout_error", { endpoint: "billing-create-checkout", origin, error: err.message });
    return json(500, { error: err.message || "Billing checkout failed." }, origin);
  }
}

