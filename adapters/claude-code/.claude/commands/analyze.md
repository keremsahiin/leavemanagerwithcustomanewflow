---
description: "Segment ANALYZE: intent → clarify → spec → spec approval. Always stops at the handoff."
argument-hint: short feature description
---
Read AGENTS.md, docs/roles/analyst.md, and workflows/segments.md. Run the ANALYZE segment for:
$ARGUMENTS

Follow the segment contract exactly: entry check (no twin spec), prompts/clarify.md then
prompts/spec.md, the spec approval gate, set "Status: Approved", write the handoff, STOP.
Never produce a plan, a plan suggestion, or code.
Project flow — a UI spec (User experience is not `none — no user interface`): before the spec
approval gate, run its design step (workflows/ui-design.md, `/design <NNNN>`); approving the spec
locks the design.
