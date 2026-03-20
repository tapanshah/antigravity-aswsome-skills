---
name: bdistill-knowledge-extraction
description: "Extract domain-specific knowledge from open-source LLMs via Ollama. Medical, legal, cybersecurity, finance presets or custom terms. Produces LoRA training data."
category: ai-training
risk: safe
source: community
date_added: "2026-03-20"
author: FrancyJGLisboa
tags: [ai, knowledge-extraction, fine-tuning, domain-specific, ollama, mcp]
tools: [claude, cursor, codex, copilot]
---

# Knowledge Extraction

Extract niche domain knowledge from open-source models running locally via Ollama. Generates training data for fine-tuning small specialized models.

## Overview

bdistill's Knowledge Extraction pipeline seeds diverse domain prompts, harvests completions from a local model, mines and quality-scores the results, and exports ChatML training pairs ready for LoRA fine-tuning. Only works with open-source models you run locally — by design.

## When to Use This Skill

- Use when building a domain-specific chatbot (medical, legal, finance, etc.)
- Use when creating training data from an open-source model's knowledge
- Use when comparing what different open models know about your domain
- Use when preparing data for LoRA fine-tuning a small model

## How It Works

### Step 1: Install prerequisites

```bash
pip install bdistill

# Install and start Ollama
# macOS: brew install ollama
# Linux: curl -fsSL https://ollama.com/install.sh | sh
ollama serve

# Pull a model
ollama pull qwen3:4b
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

### Step 3: Extract knowledge

```
/extract                                    # Interactive domain selection
"Extract medical knowledge from qwen3:4b"   # Natural language
"Pull cybersecurity knowledge from llama3.2" # Any phrasing works
```

## Preset Domains

| Domain | Seed terms |
|--------|-----------|
| **medical** | cardiology, endocrinology, genetics, critical care, oncology, pharmacology |
| **legal** | criminal law, contract law, civil procedure, corporate law, constitutional law, IP |
| **cybersecurity** | vulnerabilities, web security, cryptography, authentication, malware |
| **finance** | derivatives, fixed income, regulation, risk management, corporate finance |

## Custom Domains

Any list of terms works — the seeder generates diverse prompts automatically:

```
"Extract knowledge about kubernetes, docker, and helm from mistral:7b"
```

## Pipeline

1. **Seeding**: Generates diverse domain prompts from seed terms
2. **Harvesting**: Runs prompts through the local model, captures completions + embeddings
3. **Mining**: Extracts knowledge, cleans, deduplicates, quality-scores
4. **Export**: Produces ChatML training pairs ready for LoRA fine-tuning

## Best Practices

- Start with smaller models (4B-8B) for faster iteration
- Use preset domains first to validate the pipeline before custom terms
- Review exported training pairs for quality before fine-tuning

## Security & Safety Notes

- Only extracts from open-source models running locally via Ollama
- No data is sent to external services
- Extraction runs entirely on your machine

## Common Pitfalls

- **Problem:** Ollama not found
  **Solution:** Ensure `ollama serve` is running before starting extraction

- **Problem:** Low quality extractions
  **Solution:** Try a larger model (7B+) or more specific seed terms

## Related Skills

- `@bdistill-behavioral-xray` - X-ray a model's behavioral patterns before extraction
