#!/bin/sh
# PreToolUse hook: files under specs/done/ are immutable (AGENTS.md invariant rule 7).
# Reads the tool-call JSON from stdin, blocks Edit/Write targeting specs/done/.
input=$(cat)
path=$(printf '%s' "$input" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -n 1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"//; s/"$//')
# Windows: tool paths arrive as C:\\...\\specs\\done\\... (JSON-escaped) — normalize to '/'.
path=$(printf '%s' "$path" | sed 's#\\\\*#/#g')
case "$path" in
  *specs/done/*)
    echo "Blocked: specs/done/ is immutable (shipped specs are the historical record — AGENTS.md rule 7). Behavior changing? Open a NEW spec in specs/active/ referencing the old one." >&2
    exit 2
    ;;
esac
exit 0
