# /design — UI design step (project flow)

Read AGENTS.md and workflows/ui-design.md. Run the design step for the spec number given after
the command. The Claude Design automation is Claude Code–only (ADR-0003): in Cursor, follow the
section "Elle yol" of workflows/ui-design.md and guide the human through it.

Entry checks from files: no user interface in the spec — a mini-spec: an empty `Design:` line and
no screen touched — → refuse, no design step (R-1). A locked design (`spec-NNNN-vK` on the design
line: Design reference, or a mini-spec's `Design:`) → refuse; a change is a spec change (R-08) — continue only under a `Design change: R-08` line (workflows/ui-design.md, R-5).
Never copy design files or screenshots into the repo. Stop when the step ends.
