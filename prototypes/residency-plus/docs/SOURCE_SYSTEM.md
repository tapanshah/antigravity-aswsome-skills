# Source System — State, Entitlements, Adapters

Product source filtering with entitlement-aware behavior and source-aware discovery.

---

## Source state model (frontend)

Kept **separate** from auth state and vibe/session prompt state.

| Concept | Description |
|--------|-------------|
| **selectedSources** | User-selected source ids (checkboxes). Persisted to `residencyDiscoverySources_v1`. Only entitled ids can be added. |
| **entitledSources** | Source ids the user has access to. From `currentEntitlements.unlockedSources` (free → `["soundcloud"]`; Residency+ Core adds youtube, internet_archive, uploads; packs add more). |
| **lockedSources** | `DISCOVERY_SOURCE_IDS` minus `entitledSources`. Shown disabled with lock; click shows hint and optional Upgrade. |
| **source presets** | Named presets (name + sources array). Persisted to `residencySourcePresets_v1`. Starter presets seeded when empty. |

**Discovery** uses only **selectedSources ∩ entitledSources** (`getActiveDiscoverySources()`). If a selected source is not entitled, it is not queried.

---

## Entitlement defaults (backend: entitlements-lib.js)

- **free:** `["soundcloud"]`
- **residency_plus_core** (and legacy **residency_plus**): `["soundcloud", "youtube", "internet_archive", "uploads"]`
- **social_pack:** `["instagram", "tiktok"]`
- **archive_pack:** `["bandcamp", "vimeo"]`

`SOURCE_UNLOCKED_BY` maps each source to the plan/pack name for locked-source hints (e.g. "YouTube is included in Residency+ Core").

---

## Adapter interface

Each source adapter is a function:

- **Signature:** `(q, kind?, limit?, isPool?) => Promise<{ collection, _source }>`
- **collection:** array of items. Each item must have at least:
  - `url` (or `permalink_url`)
  - `title` (or `name`)
  - `artist` (or `user.username`)
  - `durationMs` or `duration`
  - `_source` (set by adapter or merger)
- **Optional:** `id`, `artworkUrl` or `image`, `created_at`, `tags`, `_score`.

**Implemented (wired):** SoundCloud (existing), YouTube, Internet Archive, User Uploads (Netlify functions; stubs return `[]` until APIs are wired).

**Scaffold only (return empty collection):** Bandcamp, Vimeo, Instagram, TikTok.

---

## Result attribution

Every library item has:

- **source** — source id (e.g. `"youtube"`)
- **sourceLabel** — display name (e.g. `"YouTube"`)
- **url** — canonical play/open URL
- **_sourceId** — source-specific id or URL for dedup/display
- **artworkUrl** — image URL when available (SoundCloud: `artwork_url`; others: adapter-provided)

Normalized fields: **title**, **artist**, **durationMs**, **uploadedAt** (or **created_at**).
