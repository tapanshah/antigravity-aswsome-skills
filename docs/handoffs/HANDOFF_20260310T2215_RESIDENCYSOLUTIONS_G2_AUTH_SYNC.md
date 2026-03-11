# ResidencySolutions G2 — Handoff

**Date:** 2026-03-10
**Slice:** Stage 2 - Supabase Auth & Core Cloud Sync 
**Status:** SHIPPED

---

## 1. What Was Done
This slice implements the concrete foundation laid out in Phase 1, bringing the architecture to life without disrupting the existing UX.

### 1.1 Supabase Database Configuration
- Created `supabase/schema.sql` to formally bootstrap the PostgreSQL tables (`users`, `crate`, `history`, `session_state`).
- Included required Row Level Security (RLS) policies ensuring users can only read/write their own rows via the `auth.uid()` function.
- Implemented the `handle_new_user` Postgres trigger to seamlessly mirror `auth.users` creations into our custom `public.users` table for metadata (like the `plan` tier limit).

### 1.2 Netlify Serverless Functions (REST Helpers)
In order to enforce tight security boundaries without bloated Node.js packages on the client, the following proxies were created:
1. `sc-supabase-lib.js` — Helper library containing a lightweight, server-side JWT validator and a secure REST client `supabaseRestCall` that passes the authenticated token down to the Supabase REST API (honoring RLS rules natively).
2. `auth-session.js` — Validate a user token against the database and return base profile info (`uid`, `email`, `plan`).
3. `sync-crate.js` — Cloud upsert endpoint for local saved crates mapping track URLs to Supabase via `POST`. Limited to 50 tracks for safety during this slice.
4. `sync-history.js` — Cloud append endpoint for tracking played tracks. Limited to 50 tracks per batch.
5. `sync-session-state.js` — Cloud upsert for application settings (genre, source, station, etc).
6. `migrate-local-data.js` — Bulk endpoint used to push inherited `localStorage` state into a freshly registered account upon initial sign up.

### 1.3 G2 Frontend Auth + Sync Wiring (`index.html`)
- Injected the `@supabase/supabase-js` v2 library from CDN.
- Built a hidden HTML drawer (`#authModal`) for Email / Password authentication logic that attaches to the top bar "Sign In" button placeholder from Slice 1.
- Updated the `.env.example` to note required Supabase settings.
- Initialized Supabase on page load. If credentials are unset, the UI degrades gracefully (auth button hidden, local persistence continues working).
- Rewired the core `saveJsonLS()` events for history arrays, crate pushes/removes, and DOM `onchange`/`oninput` listener interactions.
- Added `debouncedHistorySync`, `debouncedCrateSync`, and `debouncedStateSync` hooks immediately following local modifications. The application acts strictly "local-first, cloud-eventual" ensuring zero UI lag.
- Hooked up `supabase.auth.onAuthStateChange` to trigger the `migrateToCloud()` routine when an anonymous user logs in for the first time with an active local library.

---

## 2. Safety Notes & Known Limitations
- **Size Bounds:** In Slice 2, the Netlify endpoint caps sync inserts/upserts at 50 to prevent payload abuse. This is fine for initial continuity, but will need expansion when user plans are active (Slice 5).
- **One-Way Sync:** This slice is currently tailored towards pushing browser data *up* to the cloud on write. Slicing bidirectional remote replication (where signing in on a pristine device fetches the crate and hydrate local `IndexedDB`) is strictly left for Slice 3.
- **Error Handling:** Background sync tasks silently catch promise rejections so that if Supabase is offline, the user is never interrupted. Data remains fully safe inside the browser `localStorage`.
- **Sign In UX:** Password resets, Magic Links, or Google OAuth were excluded per the specs. Authentication is minimal email/password.

---

## 3. Rollback Plan
If auth acts unstable or the Supabase endpoint throws 500s:
1. Ensure the env vars in Netlify (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET`) are correctly populated according to the new `.env.example`.
2. Delete the `sc-supabase-lib.js` require paths and revert `index.html` to commit `c64f833b` to safely return to an anonymous-only `localStorage` application state.
