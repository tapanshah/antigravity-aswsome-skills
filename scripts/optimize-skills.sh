#!/bin/bash

echo "Optimizing Antigravity skills folder to prevent agent overload..."

# Define paths
SKILLS_DIR="$HOME/.gemini/antigravity/skills"
ARCHIVE_BASE="$HOME/.gemini/antigravity/skills_archive"

# 1. Archive the bloated folder
if [ -d "$SKILLS_DIR" ]; then
    if [ -d "$ARCHIVE_BASE" ]; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        ARCHIVE_DIR="${ARCHIVE_BASE}_${TIMESTAMP}"
        echo "Archiving existing skills to $ARCHIVE_DIR..."
        mv "$SKILLS_DIR" "$ARCHIVE_DIR"
    else
        ARCHIVE_DIR="$ARCHIVE_BASE"
        echo "Archiving existing skills to $ARCHIVE_DIR..."
        mv "$SKILLS_DIR" "$ARCHIVE_DIR"
    fi
else
    echo "No existing skills directory found at $SKILLS_DIR"
    # Find most recent archive to copy from if skills doesn't exist but we want to reset it
    ARCHIVE_DIR=$(ls -td $HOME/.gemini/antigravity/skills_archive* 2>/dev/null | head -n 1)
fi

# 2. Create a fresh, empty global skills folder
echo "Creating fresh skills folder..."
mkdir -p "$SKILLS_DIR"

# 3. Determine which skills to copy
echo "Determining skills to copy..."

# Default list if no arguments and python fails
DEFAULT_ESSENTIALS=(
    "api-security-best-practices"
    "auth-implementation-patterns"
    "backend-security-coder"
    "frontend-security-coder"
    "cc-skill-security-review"
    "pci-compliance"
    "frontend-design"
    "react-best-practices"
    "react-patterns"
    "nextjs-best-practices"
    "tailwind-patterns"
    "form-cro"
    "seo-audit"
    "ui-ux-pro-max"
    "3d-web-experience"
    "canvas-design"
    "mobile-design"
    "scroll-experience"
    "senior-fullstack"
    "frontend-developer"
    "backend-dev-guidelines"
    "api-patterns"
    "database-design"
    "stripe-integration"
    "agent-evaluation"
    "langgraph"
    "mcp-builder"
    "prompt-engineering"
    "ai-agents-architect"
    "rag-engineer"
    "llm-app-patterns"
    "rag-implementation"
    "prompt-caching"
    "context-window-management"
    "langfuse"
)

QUERIES=("$@")
if [ ${#QUERIES[@]} -eq 0 ]; then
    QUERIES=("Essentials")
fi

# Try to use the python helper
if command -v python3 >/dev/null 2>&1; then
    echo "Using Python helper for bundle expansion..."
    ESSENTIALS_STR=$(python3 "$(dirname "$0")/../tools/scripts/get-bundle-skills.py" "${QUERIES[@]}")
    read -r -a ESSENTIALS <<< "$ESSENTIALS_STR"
elif command -v python >/dev/null 2>&1; then
    echo "Using Python helper for bundle expansion..."
    ESSENTIALS_STR=$(python "$(dirname "$0")/../tools/scripts/get-bundle-skills.py" "${QUERIES[@]}")
    read -r -a ESSENTIALS <<< "$ESSENTIALS_STR"
fi

# Fallback if python failed or returned empty
if [ ${#ESSENTIALS[@]} -eq 0 ]; then
    if [[ "${QUERIES[*]}" == "Essentials" ]]; then
        echo "Using default essentials list (Python unavailable)..."
        ESSENTIALS=("${DEFAULT_ESSENTIALS[@]}")
    else
        echo "Using provided arguments as literal skill names..."
        ESSENTIALS=("${QUERIES[@]}")
    fi
fi

echo "Skills to restore: ${ESSENTIALS[*]}"
echo ""

if [ -z "$ARCHIVE_DIR" ] || [ ! -d "$ARCHIVE_DIR" ]; then
    echo "ERROR: No archive directory found to copy skills from."
    exit 1
fi

echo "Copying skills from $ARCHIVE_DIR..."

for skill in "${ESSENTIALS[@]}"; do
    if [ -d "$ARCHIVE_DIR/$skill" ]; then
        echo "  + $skill"
        cp -R "$ARCHIVE_DIR/$skill" "$SKILLS_DIR/"
    else
        echo "  - $skill (not found in archive)"
    fi
done

echo -e "\nDone! Context window overload should be resolved."
