---
name: design
description: "Project flow: UI design step — see workflows/ui-design.md (manual path outside Claude Code). Run explicitly: $design."
---
Read AGENTS.md and workflows/ui-design.md. Run the design step for the spec number given after
the skill name. The Claude Design automation is Claude Code–only (ADR-0003): in Codex, follow the
section "Elle yol" of workflows/ui-design.md and guide the human through it.

Entry checks from files: no user interface in the spec → refuse, no design step (R-1). A locked
design (`spec-NNNN-vK` in the Design reference) → refuse; a change is a spec change (R-08).
Never copy design files or screenshots into the repo. Stop when the step ends.
