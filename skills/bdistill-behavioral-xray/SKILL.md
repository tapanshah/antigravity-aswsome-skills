---
name: bdistill-behavioral-xray
description: "X-ray any AI model's behavioral patterns — refusal boundaries, hallucination tendencies, reasoning style, formatting defaults. No API key needed."
category: ai-testing
risk: safe
source: community
date_added: "2026-03-20"
author: FrancyJGLisboa
tags: [ai, testing, behavioral-analysis, model-evaluation, mcp]
tools: [claude, cursor, codex, copilot]
---

# Behavioral X-Ray

Systematically probe an AI model's behavioral patterns and generate a visual report. The AI agent probes *itself* — no API key or external setup needed.

## Overview

bdistill's Behavioral X-Ray runs 30 carefully designed probe questions across 6 dimensions, auto-tags each response with behavioral metadata, and compiles results into a styled HTML report with radar charts and actionable insights.

## When to Use This Skill

- Use when you want to understand how your AI model actually behaves (not how it claims to)
- Use when choosing between models for a specific task
- Use when debugging unexpected refusals, hallucinations, or formatting issues
- Use when documenting a model's behavioral profile for your team

## How It Works

### Step 1: Install bdistill

```bash
pip install bdistill
```

### Step 2: Add the MCP server

```bash
# Claude Code
claude mcp add bdistill bdistill-mcp

# Cursor / VS Code — copy to your project:
# .cursor/mcp.json or .vscode/mcp.json
{
  "servers": {
    "bdistill": {
      "command": "bdistill-mcp",
      "args": []
    }
  }
}
```

### Step 3: Run the probe

In Claude Code:
```
/xray                          # Full behavioral probe (30 questions)
/xray --dimensions refusal     # Probe just one dimension
/xray-report                   # Generate report from completed probe
```

In any tool with MCP:
```
"Run a behavioral self-probe"
"X-ray your own behavior"
"Generate a behavioral report"
```

## Probe Dimensions

| Dimension | What it measures |
|-----------|-----------------|
| **tool_use** | When does it call tools vs. answer from knowledge? |
| **refusal** | Where does it draw safety boundaries? Does it over-refuse? |
| **formatting** | Lists vs. prose? Code blocks? Length calibration? |
| **reasoning** | Does it show chain-of-thought? Handle trick questions? |
| **persona** | Identity, tone matching, composure under hostility |
| **grounding** | Hallucination resistance, knowledge boundary awareness |

## Output

A styled HTML report showing:
- Refusal rate, hedge rate, chain-of-thought usage
- Per-dimension breakdown with bar charts
- Notable response examples with behavioral tags
- Actionable insights (e.g., "you already show CoT 85% of the time, no need to prompt for it")

## Best Practices

- Answer probe questions honestly — the value is in authentic behavioral data
- Run probes on the same model periodically to track behavioral drift
- Compare reports across models to make informed selection decisions

## Common Pitfalls

- **Problem:** Probe results seem inconsistent across runs
  **Solution:** Some variance is expected — run 2-3 probes and compare. Temperature and context affect responses.

## Related Skills

- `@bdistill-knowledge-extraction` - Extract domain knowledge from open-source models
