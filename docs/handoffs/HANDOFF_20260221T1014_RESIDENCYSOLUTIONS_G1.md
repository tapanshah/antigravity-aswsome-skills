# HANDOFF â€” ResidencySolutions G1 (Entitlements Core)
Timestamp: 20260221T1014
Repo: G:\DOWNLOADS5\reidchunes\residencysolutions-core

## Objective
Ship a dependency-free, **NO UI** entitlements core:
- Append-only JSONL event log
- Idempotent writes via idempotency_key
- Fast self-test integrated into verify-core

## Changes
- scripts/entitlements.ps1 (grant/revoke/list/check; JSONL; idempotency)
- scripts/verify-core.ps1 (adds entitlements self-test using temp log)
- docs/ENTITLEMENTS_SPEC.md (CLI usage section)
- data/.gitkeep
- .gitignore (ignores data/*.jsonl and env files)

## Verification (output)
\\\
=== G1 VERIFY (NO UI) ===
OK: no changes detected.
PASS: core skeleton present + guard OK
=== ENTITLEMENTS SELF-TEST ===
PASS: entitlements self-test (grant/revoke/idempotency)

\\\

## Risks / Rollback
- Data safety: event logs are ignored (\data/*.jsonl\) and not committed.

## Next Atomic Task
Add a minimal â€œproduct registryâ€ document mapping ProductId constants to lanes (RQ, Clipper, RESIDENCY+), and define Subject formats (email vs providerId) + normalization rules.
