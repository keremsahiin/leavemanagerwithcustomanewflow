---
description: "Project flow: design a UI spec on a Claude Design canvas and lock it at spec approval; with `ship`, build the side-by-side SHIP page."
argument-hint: <NNNN> [ship]
---
Read AGENTS.md and workflows/ui-design.md — the rules live there; this command only runs the
Claude Design mechanics for spec $ARGUMENTS. Reply in the chat language (AGENTS.md).

**Entry checks (from files, never from chat):**
- `specs/active/<NNNN>-*.md` must exist. If its "User experience" is `none — no user interface`,
  refuse: "Spec <NNNN> has no user interface — no design step (workflows/ui-design.md, R-1)."
  Create nothing, stop.
- Design mode (no `ship`): if the spec's Design reference already holds a lock
  (`spec-<NNNN>-vK`), refuse: "Design is locked at spec-<NNNN>-vK — a change is a spec change
  (R-08, prompts/recovery/spec-change.md)." Continue only when the human has started R-08 for
  this spec; the new lock is then v(K+1).
- `ship` mode: needs a lock in the Design reference and the folder of screenshots
  (`<ekran>--<durum>.png`, outside the repo) — ask for the folder if it was not given.

**Design mode** (workflows/ui-design.md, ANALYZE steps 2–8):
1. Build the screen × state list from the spec's User experience.
2. Canvas: the Design reference names a canvas → revise it (read `project/canvas.json` first).
   Otherwise create one from the **Design** Artifact type (list the types; never standalone
   claude.ai/design or DesignSync), title `Leave Manager — spec <NNNN> <short name>`, and follow
   the type's instructions for its files. Work files go in the scratchpad, never the repo.
3. Design system: list the "Design System" artifacts; one titled "Leave Manager" → install it per
   the type's instructions. None → own look, and say "design system yok" on the cover.
4. Artboards: `Main.dc.html` is the cover (spec, screen × state list, design-system note, lock
   status). One artboard per screen × state: `<ekran>--<durum>.dc.html`, page "Tasarım", a page
   artboard 1280 wide, `lang="tr"`, title `<Ekran> — <Durum>`.
5. Coverage check (the spec asks for it, so reading the canvas index is allowed): compare
   `project/canvas.json` boards with the list. Missing → name each missing `<Ekran> — <Durum>` and
   do NOT ask for spec approval. No other read-back, render or screenshot of the canvas.
6. Hand back the canvas link and the label approval will lock: `spec-<NNNN>-v<K>`.
7. **Lock — only after the human approves the spec:** update the cover with
   "Onaylı: spec-<NNNN>-vK, <date>" and publish it with `label: spec-<NNNN>-vK`; write the Design
   reference line exactly as workflows/ui-design.md step 8 shows, with the version id from that
   publish result. If the human cannot open earlier versions from the canvas's version history,
   take the fallback in the same step 8 (dated export into the PR, its name on the line).

**`ship` mode** (workflows/ui-design.md, VERIFY and SHIP step 2):
1. Upload each screenshot to the canvas as an asset.
2. Add page "SHIP" if missing and one artboard per screen, `ship--<ekran>.dc.html`: per state a row
   Durum · Tasarım (`spec-<NNNN>-vK`, the locked artboard via `<dc-import>`, scaled to fit) ·
   Uygulama (the screenshot). A designed state without a screenshot → "UYGULAMADA YOK"; a
   screenshot without a designed state → "TASARIMDA YOK". Never edit the "Tasarım" artboards.
3. Publish with `label: spec-<NNNN>-vK-ship`; hand back the canvas link (SHIP page) and the
   state table with its marks. The human judges at the SHIP gate.

Mechanics that bite on this machine (rehearsal 0001): give the Artifact tool the scratchpad's
long path (`pwd -W`), not the 8.3 short form (`KEREM~1.SAH`), or publishing is blocked by a read
rule; upload screenshots one `file_path` per call — a `file_paths` batch from the scratchpad is
refused.

Never copy design files or screenshots into the repo (ANEW-0006). Stop when the mode's step ends.
