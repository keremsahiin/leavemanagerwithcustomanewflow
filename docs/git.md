# Git

> Bootstrap 2026-11-09'da gözden geçirildi: şablon varsayılanları olduğu gibi kabul edildi; bu
> repoya özel eklemeler "Repository setup" bölümünde.

## Repository setup
- Varsayılan dal: `main`. Kimlik bu repoda yerel olarak ayarlıdır (`git config --local`):
  `Kerem Şahin <kerem.sahin@polsanteknoloji.com.tr>`; plan onaylarındaki `Approved by` adı da budur.
- **Kök commit istisnası (tek seferlik):** boş repoda `main` üzerindeki ilk commit
  `chore: adopt ANEW v1.24.1` — değiştirilmemiş şablon + Claude Code adaptörü. Sonraki her şey
  dallarda gelir.
- Agent tarafı engeller (`.claude/settings.json`): force push, hard reset, rebase, `rm -rf` ve
  `Remove-Item -Recurse -Force` hem Bash hem PowerShell aracı için reddedilir. Bu yalnızca agent'ı
  durdurur; gerçek koruma remote'ta branch protection'dır.
- Remote: `https://github.com/keremsahiin/leavemanagerwithcustomanewflow` (private, kişisel hesap).
  **Branch protection yok:** ücretsiz planda private repoda kullanılamıyor (API 403, 2026-11-09).
  Bu yüzden "main'e doğrudan commit yok / force push yok" remote'ta zorlanmaz — agent deny
  kuralları, bu belge ve CI'daki `doctor --strict` geçerlidir. Açılması için: GitHub Pro, bir
  organizasyona (Team) transfer veya public repo. Açıldığında: PR zorunlu, `doctor` + `check`
  zorunlu durum kontrolü, admin'e de uygulanır, force push ve silme kapalı, zorunlu review
  onayı 0 (tek geliştirici; review'u `reviewer` subagent'ı yapar).

## Branching
- `feature/<spec-no>-<short-name>` — **no branch without a spec.** Also for CHANGE-lane mini-specs.
- Refactors: `refactor/<spec-no>-<short-name>` (mini-spec with Changed behavior = none).
- Fixes: `fix/<report-id>-<short-name>` (bug fixes carry a report, not a spec number);
  incidents: `incident/<date>-<short-name>`; trivial changes: `trivial/<short-name>` (see below).
- Bootstrap: `chore/bootstrap` — the bootstrap output (`workflows/bootstrap.md`), merged like
  any branch.

## Commits
- Conventional Commits, with a plan reference: `feat(catalog): paging endpoint [plan 0001/3]`.
  Review fixes name their fix round instead of the step:
  `fix(catalog): empty page size [plan 0001/fix-2]` — the reviewer counts rounds from these
  (R-06 after round 3).
- Agent commits follow the same standard: the agent writes the message, the human approves it
  through the gate before the commit, not one by one — an approved plan covers its
  `[plan NNNN/n]` and `[plan NNNN/fix-k]` commits, the ship approval the ship commit. Every
  message stays visible in the branch and the PR. Lite and strict alike.
- Only `./scripts/check`'s own exit code gates a commit or a push. Never pipe its output into
  another command in the chain that decides it: in `./scripts/check | grep … && git commit` the
  chain takes grep's exit code, so a red check commits. Keep the output aside and gate on check
  alone: `./scripts/check > check.log 2>&1 && git commit …` (then show `check.log`).
- Commit named paths only: `git commit -- <paths>`, never `git add -A`, `git add .` or
  `commit -a`. Another session or tool may have written or staged files in the same tree.

## Forbidden
- Direct commits to the default branch.
- Force push, history rewriting on shared branches. Undo = `git revert` (see recovery R-11).

## Trivial changes
Applies only to requests the change-request triage rubric (`workflows/change-request.md`)
classifies as TRIVIAL: no acceptance criterion changes, no shared code.
- Policy: **(1) PR + one reviewer, no spec** — bootstrap 2026-11-09'da seçildi. Gerekçe: üç
  hassas alan var; "önemsiz" etiketinin yanlış verilmesinin maliyeti yüksek, ikinci göz bunu
  ucuza yakalar. (Seçilmeyenler: (2) review'suz doğrudan commit · (3) her şey mini-spec.)
- Always: one narrow commit, `scripts/check` green. A second file or a new test means re-triage.

## Pull requests
- PR template checklist completed; `scripts/check` green in CI; squash-merge.
