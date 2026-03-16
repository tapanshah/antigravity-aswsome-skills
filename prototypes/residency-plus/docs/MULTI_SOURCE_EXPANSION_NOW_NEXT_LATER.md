# Multi-Source Discovery Expansion — NOW / NEXT / LATER

Internal roadmap for Residency+ multi-source vibe search and shuffle.

---

## NOW (implemented in this pass)

- **Entitlements model for sources**
  - `entitlements-lib.js`: `unlockedSources` per plan; `SOURCE_PACKS`: social_pack (instagram, tiktok), archive_pack (bandcamp, vimeo).
  - Default: free → `["soundcloud"]`; residency_plus_core / residency_plus → `["soundcloud","youtube","internet_archive","uploads"]`; packs add social/archive.
  - `SOURCE_UNLOCKED_BY` for locked-source hints.
  - `get-entitlements` returns `entitlements.unlockedSources`; no DB schema change (plan-only for now).

- **Sources UI**
  - "Discovery sources" section in the existing controls drawer (no new topbar button; no overlap with account or vibe presets).
  - Checkboxes for: SoundCloud, YouTube, Internet Archive, Bandcamp, Vimeo, TikTok, Instagram, User Uploads.
  - Select all / Clear all; saved source presets (save current, apply from dropdown).
  - Locked sources shown disabled with lock; only checked + entitled sources participate in search/shuffle.

- **Source state model** (see docs/SOURCE_SYSTEM.md)
  - selectedSources (persisted), entitledSources (from API), lockedSources (derived). Discovery uses selected ∩ entitled only.
  - Source presets: save, load, delete; starter presets (SoundCloud only, Open web, Archive dig, Social, Personal library) seeded when empty.
  - Locked source click: inline hint (which plan/pack unlocks) + Upgrade button to open account modal.

- **Adapters and discovery** (see docs/SOURCE_SYSTEM.md)
  - Adapter interface: `(q, kind?, limit?) => Promise<{ collection, _source }>`; items have url, title, artist, durationMs, optional artworkUrl/id.
  - Implemented (wired): SoundCloud, YouTube, Internet Archive, User Uploads (Netlify stubs until APIs wired). Scaffold only: Bandcamp, Vimeo, Instagram, TikTok.
  - `multiSourceSearch` runs only active (selected ∩ entitled) adapters; merges results with _source and _sourceLabel.

- **Search and shuffle**
  - `quickFill` and vibe search use `multiSourceSearch`; only selected AND entitled sources are queried (`getActiveDiscoverySources()`).
  - Result attribution: each item has _source, _sourceLabel, _sourceId, artworkUrl; track meta shows source pill.
  - Non–SoundCloud items skip `scResolve` in `loadItem`; source pill still shown.

- **Defensive**
  - Session reopen and vibe preset apply already use `sanitizeVibePrompt` before setting `vibeInput.value`; no auth/email hydration into vibe input.

---

## NEXT

- **Backend implementation for YouTube, Internet Archive, User Uploads**
  - YouTube: configure `YOUTUBE_API_KEY` (Data API v3), implement search in `search-youtube.js`, normalize to `{ url, title, artist, durationMs, ... }`.
  - Internet Archive: implement search in `search-internet-archive.js` (e.g. advancedsearch or IA API).
  - User Uploads: wire to Supabase storage + metadata table for authenticated user uploads in `search-uploads.js`.

- **Playback for non-SoundCloud**
  - Today only SoundCloud URLs open in the in-app embed. Next: open YouTube/IA/Uploads in new tab or embed where allowed (policy/compliance first).

- **Add-on packs in billing**
  - Store pack flags (e.g. `social_pack`, `archive_pack`) in DB; pass to `getEntitlementsForPlan(plan, addons)` so `unlockedSources` includes pack sources.

---

## LATER

- **Live ingestion for Instagram, TikTok, Bandcamp, Vimeo**
  - Only when compliant backend paths exist (API terms, auth, rate limits). Keep as scaffold (empty collection) until then.

- **Billing UX for source packs**
  - No redesign in this pass; product scaffolding and entitlements are in place so pack purchase can gate `unlockedSources` later.

- **Filter by source in discovery**
  - Optional library/filter UI: "Show only YouTube", "Hide User Uploads", etc., building on existing genre/station filters.
