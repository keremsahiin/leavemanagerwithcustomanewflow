# Backlog — deferred findings

Findings a human triaged as **defer**: real, but fixed later by decision (`workflows/feature-development.md`,
step 7). Nothing lands here without that decision; noise is rejected in the triage record, not parked here.

- A criterion moved out at the ship gate (R-08, `→ moved to B-<n>`) lands here too, by the
  human's ship decision; the entry names the spec and criterion.
- One entry per finding, newest last. Delete the entry in the commit of the work that closes it.
- An entry that grows into new behavior becomes a spec (`specs/active/`), not a fix.

<!-- Format (labels stay English):
- **B-<n>** — <finding, one line> — Source: spec <NNNN>, review round <n> (<file:line>) — Severity: <…>
  — Recommendation: <the reviewer's action> — Deferred by: <name>, <YYYY-MM-DD>, <why>
  A decision deferred at bootstrap (its REPORT) uses Source: bootstrap <YYYY-MM-DD>.
-->

- **B-1** — Giriş denemesi sınırlama (rate limiting / geçici kilit) yok; kaba kuvvet şifre denemesine açık — Source: bootstrap 2026-11-09 (Konu 9, güvenlik) — Severity: Medium
  — Recommendation: gerçek kullanıma geçmeden önce kullanıcı + IP bazında deneme sınırı ekle — Deferred by: Kerem Şahin, 2026-11-09, ilk sürüm bellek içi prototip
- **B-2** — Çok faktörlü doğrulama (MFA) yok — Source: bootstrap 2026-11-09 (Konu 9, güvenlik) — Severity: Low
  — Recommendation: kurumsal kimlik (AD/Entra ID) entegrasyonuyla birlikte ele al — Deferred by: Kerem Şahin, 2026-11-09, ilk sürüm kapsamı dar
- **B-3** — Kullanıcının şifresini değiştirme ekranı yok; şifreler seed'den (`SEED_PASSWORD`) gelir — Source: bootstrap 2026-11-09 (Konu 9, güvenlik) — Severity: Low
  — Recommendation: kalıcı saklamaya geçişle (ADR-0002 revisit) birlikte spec aç — Deferred by: Kerem Şahin, 2026-11-09, bellek içi sistemde şifre değişikliği yeniden başlatmada kaybolur
- **B-4** — `.nvmrc` yok (`docs/conventions.md` onu sabitleyici sayıyor); Node sürümü iki yerde yazılı (`scripts/check.conf` requires, `.github/workflows/check.yml` node-version) — Source: spec 0002, review round 1 (I-3; `docs/conventions.md:22`) — Severity: Info
  — Recommendation: walking skeleton'da `.nvmrc` ekle, CI'da `node-version-file: .nvmrc` kullan — Deferred by: Kerem Şahin, 2026-11-10, toolchain sabitleme spec 0003'ün işi
- **B-5** — Ham renk dedektörü sütun 0'da `#hex,` ve tek başına `#hex`'i yakalamıyor (girintisiz bir değer devamı, ör. gradient argümanı, check'ten geçer); satır taraması bunları id seçici listesinden (`#add,`) ve Allman id'sinden ayıramaz — Source: spec 0002, VERIFY round 2 (V-1; `frontend/tests/no-raw-colors.test.js:31`) — Severity: Low
  — Recommendation: gerçek bir girintisiz değer görülürse blok bağlamını bilen bir tarama (ya da bir CSS ayrıştırıcısı) ekle; o zamana kadar formatlayıcı girintisine güven — Deferred by: Kerem Şahin, 2026-11-11, orantısız maliyet; girintili devamlar yakalanıyor
