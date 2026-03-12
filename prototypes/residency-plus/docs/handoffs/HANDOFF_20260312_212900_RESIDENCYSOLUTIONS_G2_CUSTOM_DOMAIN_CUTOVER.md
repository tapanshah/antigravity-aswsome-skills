## Residency+ G2 – Custom Domain Cutover / Canonical Production Origin

- **Timestamp**: 20260312_212900
- **Slice**: Custom Domain Cutover / Production Canonicalization
- **Branch**: `feat/discovery-engine-v1`
- **Commit**: _TBD on merge — expected to be the custom-domain cutover commit for this slice_

### 1. Files Changed

- `netlify/functions/billing-create-portal-session.js`
- `scripts/verify_prod.ps1`
- `LAUNCH_CHECKLIST.md`

### 2. What Shipped: Custom Domain Cutover Foundations

- **Canonical production origin**:
  - `scripts/verify_prod.ps1` now targets `https://residencysolutions.net` by default.
  - A new `VERIFY_PROD_BASE_URL` environment variable allows overriding the base URL for verification (e.g., to temporarily point at `https://residencysolutions.netlify.app` or a preview environment) without changing the script.
- **Billing portal return URL hardening**:
  - `billing-create-portal-session.js` now derives a `canonicalSiteUrl` from environment first, then falls back to the new custom domain:
    - `process.env.BILLING_SITE_URL || process.env.SITE_URL || "https://residencysolutions.net"`.
  - The Stripe Billing Portal `return_url` chain is unchanged in behavior but now terminates in `canonicalSiteUrl` instead of a hardcoded Netlify app URL.
  - This keeps the customer portal return path stable while allowing configuration via env vars and ensuring the new custom domain is the canonical default.
- **ALLOWED_ORIGINS guidance**:
  - `LAUNCH_CHECKLIST.md` now documents `ALLOWED_ORIGINS` with both the custom domain and the legacy Netlify app:
    - Example: ``https://residencysolutions.net,https://residencysolutions.netlify.app,http://localhost:8888``.
  - This makes it explicit that both origins should be allowed during transition.

### 3. Behavior and Safety Notes

- **No functional change to local dev**:
  - `scripts/verify_local_dev.ps1` and the Netlify dev flow remain unchanged and continue targeting `http://localhost:8888/.netlify/functions`.
- **Existing netlify.app compatibility**:
  - The origin allowlist in `sc-auth-lib.js` still auto-allows `*.netlify.app` in addition to whatever is present in `ALLOWED_ORIGINS`, so branch/preview URLs and the legacy production hostname continue to work when present.
  - Stripe success/cancel URLs for checkout continue to be driven by:
    - Frontend-provided `success_url` / `cancel_url` (usually `window.location.href`), or
    - `BILLING_SUCCESS_URL` / `BILLING_CANCEL_URL` env vars.
- **Billing portal resilience**:
  - If `BILLING_ENABLED` or core billing env vars are not present, the portal still returns `billing_enabled: false` and the UI surfaces the existing “Subscription management is currently unavailable.” copy.
  - If the portal is enabled but misconfigured, the new `canonicalSiteUrl` default keeps the return path anchored on the custom domain instead of the Netlify app.

### 4. Verification Results for This Slice

At the time of this handoff:

- `scripts/verify_local_dev.ps1`:
  - **Inconclusive in this run** — the script was initiated and reached the local function health check, but the full log for this invocation only captured the first line before tooling backgrounded the process.
  - Prior runs on this branch were green; no code changes in this slice touch local-dev behavior.
- `scripts/verify_prod.ps1`:
  - **PASS**
  - Latest log: `logs/verify_prod_20260312_172656.log`
  - Target: `https://residencysolutions.net/.netlify/functions/*`
- `scripts/verify_frontend_boot.ps1`:
  - **Currently FAILING due to environment, not code**:
    - Log: `logs/verify_frontend_boot_20260312_212800.log`
    - Symptom: Playwright `page.goto` timeout reaching `http://localhost:8888/` (Netlify dev shell not fully booted / not serving the root page within 30s).
  - No changes in this slice touch `index.html`, the frontend verifier, or boot wiring.

### 5. Manual Follow-Ups in Netlify / Cloudflare

- **Netlify app configuration**:
  - Set `ALLOWED_ORIGINS` to include at least:
    - `https://residencysolutions.net`
    - `https://residencysolutions.netlify.app`
    - `http://localhost:8888` (for dev)
  - Ensure billing env vars point at the canonical domain where appropriate:
    - `BILLING_SITE_URL` → `https://residencysolutions.net`
    - `SITE_URL` → `https://residencysolutions.net`
    - Confirm `BILLING_SUCCESS_URL` / `BILLING_CANCEL_URL` values are valid on the custom domain or rely on frontend-provided URLs.
- **Cloudflare DNS / proxy**:
  - `residencysolutions.net` should be configured as a CNAME/alias to the active Netlify site.
  - Ensure HTTPS is enforced and that Cloudflare is not stripping or mutating `Origin` / `Authorization` headers for `/.netlify/functions/*` routes.
- **Verification overrides (if needed)**:
  - To run production verification against a non-canonical host (e.g., Netlify app or a preview), set:
    - `VERIFY_PROD_BASE_URL` in the environment before calling `scripts/verify_prod.ps1`.

