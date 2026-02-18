# SESSION BOOT — antigravity-awesome-skills
_Last updated: 2026-02-18 09:15 EST_

## Quick Start (any model, zero history)

1. **Read these files in order:**
   - `docs/MASTER_INDEX.md` — file map and reading order
   - `docs/PROJECT_ROUTER.md` — lane map (repos, branches, status)
   - `docs/NOW_NEXT_LATER.md` — prioritized roadmap
   - `docs/BLOCKERS.md` — open blockers
   - Latest `docs/handoffs/HANDOFF_*.md` — last session state

2. **Identify your work mode:**
   - **LOW-RESOURCE** (daytime): no GPU/CUDA/inference/transcoding, ≤5 min tests, max 1 subprocess
   - **HIGH-RESOURCE** (night): GPU OK, full test suites OK, long renders OK

3. **Hard Locks (never violate):**
   - Residency Quest = FL Studio-first gamified creative workflow platform (**NOT Roblox**)
   - Roblox Horror Pivot = separate lane
   - Never mix lanes in one session
   - Never run GPU jobs in LOW-RESOURCE mode

4. **Pick ONE task from `docs/NOW_NEXT_LATER.md`** (NOW section first, matching your compute mode).

5. **Execution pattern:**
   - Define acceptance criteria before editing
   - Implement minimal change set
   - Run lightweight verification (lint, smoke, targeted test)
   - Commit with conventional commit message
   - Write handoff: `docs/handoffs/HANDOFF_<MODEL>_<timestamp>.md`

6. **If blocked >15 min:** log blocker in `docs/BLOCKERS.md`, switch to fallback task in same lane.

---

## Repo Layout

```
antigravity-awesome-skills/
├── ChatGPT_Context/          # Per-project living briefs (source of truth per lane)
│   ├── RESIDENCY_QUEST_MASTER_v9.md
│   ├── ROBLOX_HORROR_PIVOT_MASTER_v3.md
│   ├── CODEX_CONTEXT.md      # Local Clipper V6 state
│   ├── SESSION_BOOT.md       # Clipper-specific boot (legacy)
│   ├── reidmd-theme-debug.md # Shopify theme runbook
│   ├── P0_CLIP_FACTORY_CHECKLIST.md
│   └── netlify-toml.md       # Netlify config reference
├── docs/                     # Governance + handoffs
│   ├── MASTER_INDEX.md
│   ├── SESSION_BOOT.md       # THIS FILE — universal boot
│   ├── PROJECT_ROUTER.md
│   ├── NOW_NEXT_LATER.md
│   ├── BLOCKERS.md
│   ├── lanes/                # Per-lane deep docs
│   │   └── RESIDENCYSOLUTIONS.md
│   └── handoffs/             # Session handoff docs
├── prototypes/               # Prototype apps
│   └── residency-plus/       # RESIDENCY+ SoundCloud digger
├── skills/                   # 100+ agent skills
└── ...
```

## External Repos (not in this workspace)

| Lane | Path | Notes |
|------|------|-------|
| Residency Quest | `G:\residency-quest` | Python backend |
| Local Clipper V6 | `G:\StreamSegments\local-clipper` | Python/Streamlit |
| Roblox Horror | `G:\DOWNLOADS5\1strobloxgame` | Roblox Studio (Luau) |
| reidmd.net | `C:\Users\sean\Desktop\reidmd-theme` | Shopify Dawn theme |
| ResidencySolutions (source) | `G:\DOWNLOADS5\reidchunes` | Original prototype files |
