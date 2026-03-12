/**
 * billing-webhook.js — Stripe webhook foundation for plan updates.
 *
 * When BILLING_ENABLED is false or env vars are missing, this handler
 * acknowledges events without mutating any state, ensuring the app remains
 * fully functional even without billing configured.
 */

import { json, logTelemetry } from "./lib/sc-auth-lib.js";

const BILLING_ENABLED = process.env.BILLING_ENABLED === "true";

export default async function handler(req) {
  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  if (!BILLING_ENABLED || !process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    // Billing foundation only; accept and drop.
    logTelemetry("billing_webhook_disabled", { endpoint: "billing-webhook" });
    return json(200, { billing_enabled: false });
  }

  try {
    const sig = req.headers.get("stripe-signature") || "";
    const rawBody = await req.text();

    const StripeModule = await import("stripe");
    const stripe = new StripeModule.default(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      logTelemetry("billing_webhook_signature_failed", { endpoint: "billing-webhook", error: err.message });
      return json(400, { error: `Webhook signature verification failed: ${err.message}` });
    }

    const type = event.type;
    const obj = event.data?.object || {};

    // In a fully wired production system we would use a Supabase service key
    // to update public.users.plan and plan_expires_at here, keyed by a
    // stored stripe_customer_id or metadata.rplus_user_id.
    //
    // For this slice, we keep the handler non-fatal and do not attempt
    // database writes when SUPABASE_SERVICE_ROLE_KEY is absent.

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;

    if (BILLING_ENABLED && serviceKey && supabaseUrl) {
      try {
        let userId = null;
        if (obj.metadata && obj.metadata.rplus_user_id) {
          userId = obj.metadata.rplus_user_id;
        }

        if (!userId && obj.customer) {
          // Fallback: in a full implementation we would map Stripe customer
          // IDs back to users via public.users.stripe_customer_id.
        }

        const isActivate =
          type === "customer.subscription.created" ||
          type === "customer.subscription.updated" ||
          type === "checkout.session.completed";
        const isCancel =
          type === "customer.subscription.deleted" ||
          type === "customer.subscription.cancelled";

        if (userId && isActivate) {
          const plan = "residency_plus";
          const expiresAt = obj.current_period_end
            ? new Date(obj.current_period_end * 1000).toISOString()
            : null;

          await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(userId)}`, {
            method: "PATCH",
            headers: {
              "apikey": serviceKey,
              "Authorization": `Bearer ${serviceKey}`,
              "Content-Type": "application/json",
              "Prefer": "return=representation",
            },
            body: JSON.stringify({
              plan,
              plan_expires_at: expiresAt,
            }),
          });
        }

        if (userId && isCancel) {
          await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(userId)}`, {
            method: "PATCH",
            headers: {
              "apikey": serviceKey,
              "Authorization": `Bearer ${serviceKey}`,
              "Content-Type": "application/json",
              "Prefer": "return=representation",
            },
            body: JSON.stringify({
              plan: "free",
              plan_expires_at: null,
            }),
          });
        }
      } catch {
        // Swallow errors for this foundation slice; do not 500.
      }
        if (userId && isActivate) {
          logTelemetry("billing_plan_activated", { endpoint: "billing-webhook", user_id: userId, type });
        } else if (userId && isCancel) {
          logTelemetry("billing_plan_cancelled", { endpoint: "billing-webhook", user_id: userId, type });
        } else {
          logTelemetry("billing_webhook_ignored", { endpoint: "billing-webhook", type });
        }
      } catch {
        // Swallow errors for this foundation slice; do not 500.
        logTelemetry("billing_webhook_supabase_error", { endpoint: "billing-webhook", type });
      }
    }

    logTelemetry("billing_webhook_received", { endpoint: "billing-webhook", type });
    return json(200, { received: true, type });
  } catch (err) {
    // Never blank the app due to billing; report but do not break.
    logTelemetry("billing_webhook_error", { endpoint: "billing-webhook", error: err.message });
    return json(500, { error: err.message || "Webhook handling failed." });
  }
}

