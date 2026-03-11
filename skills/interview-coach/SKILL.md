---
name: interview-coach
description: "Full job search coaching system — JD decoding, resume, storybank, mock interviews, transcript analysis, comp negotiation. 23 commands, persistent state."
category: productivity
risk: safe
source: community
date_added: "2026-03-11"
author: dbhat93
tags: [interview, job-search, coaching, career, storybank, negotiation]
tools: [claude]
---

# Interview Coach

A persistent, adaptive coaching system for the full job search lifecycle.
Not a question bank — an opinionated system that tracks your patterns,
scores your answers, and gets sharper the more you use it.

## Install

```bash
npx skills add dbhat93/job-search-os
```

Then type `/coach` → `kickoff`.

## What It Covers

- **JD decoding** — six lenses, fit verdict, recruiter questions to ask
- **Resume + LinkedIn** — ATS audit, bullet rewrites, platform-native optimization
- **Mock interviews** — behavioral, system design, case, panel, technical formats
- **Transcript analysis** — paste from Otter/Zoom/Grain, auto-detected format
- **Storybank** — STAR stories with earned secrets, retrieval drills, portfolio optimization
- **Comp + negotiation** — pre-offer scripting, offer analysis, exact negotiation scripts
- **23 total commands** across the full search lifecycle

## How It Works

State persists in `coaching_state.md` across sessions. The coach tracks
your scores, patterns, drill progression, and interview outcomes — and
adapts coaching to your specific gaps over time.

## Source

https://github.com/dbhat93/job-search-os
