# CODEX CONTEXT — Cross-Project State
_Last updated: 2026-02-18 08:47 EST_

## Purpose
PowerShell-native context file for Codex 5.3 or any shell-first model. Read this + `docs/SESSION_BOOT.md` to bootstrap.

---

## State Collection Commands
```powershell
# Run these first to collect current state:
cd "c:\Users\sean\antigravity-awesome-skills"
git status -sb
git log --oneline -n 5
git remote -v
Get-ChildItem -Path .\docs -Recurse -File | Select FullName, LastWriteTime | Sort LastWriteTime -Descending | Select -First 20
Get-Content docs\BLOCKERS.md
```

## Current Blocker Summary
| ID | Lane | Issue | Fix |
|----|------|-------|-----|
| B-007 | antigravity-awesome-skills | `git push` 403 permission denied | Fix GitHub auth (token/SSH), then `git push -u origin main` |

See `docs/BLOCKERS.md` for full list.

## Per-Lane Quick Commands

### Residency Quest
```powershell
cd "G:\residency-quest"
git status -sb
git log --oneline -n 5
python tools/validate_events.py
python -m pytest -q
```

### Local Clipper V6
```powershell
cd "G:\StreamSegments\local-clipper"
$py = ".\.venv\Scripts\python.exe"
& $py -c "import app; print('app import OK')"
& $py -m compileall .\app.py .\core .\ui
& $py -m pytest -q
```

### reidmd.net
```
# Shopify — no local commands
# QA: check / and /products/reidmd-care-package in browser
# Guardrails: never load homepage CSS on product pages
```

## Validation Budget
- LOW-RESOURCE mode: ≤5 minutes total
- Max 1 subprocess at a time
- No GPU/CUDA/inference/transcoding

## Handoff Output
After completing work, write:
```
docs/handoffs/HANDOFF_CODEX53_<YYYYMMDD>T<HHMM>.md
```
Include: lane, task, files changed, commands + exit codes, next atomic task.
