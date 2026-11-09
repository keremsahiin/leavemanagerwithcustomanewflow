# Security

> Bootstrap 2026-11-09'da dolduruldu. Agent'ların her plan ve review'da uyduğu temel kurallar.

## Secrets
- Secrets never enter the repo, specs, prompts, or chat. `.env` is gitignored; provide `.env.example`.
- Agents never print secret values, even when debugging.
- Seed kullanıcılarının demo şifresi `.env` içindeki `SEED_PASSWORD` değişkeninden gelir; seed
  dosyasında şifre veya hash bulunmaz. `.env.example` yalnızca değişkenin adını taşır.

## Input & output
- Tüm girdi API sınırında Pydantic ile doğrulanır: tipler, uzunluklar (açıklama ≤ 500), tarih
  biçimi. Bilinmeyen alan reddedilir (`extra="forbid"`).
- Frontend veriyi yalnızca `textContent` / `createElement` ile basar. `innerHTML`, `outerHTML`,
  `insertAdjacentHTML`, `document.write` **yasak** — `scripts/check` adımıyla zorlanır.
- Yanıt header'ları: `Content-Security-Policy: default-src 'self'; frame-ancestors 'none'`
  (inline script yok), `X-Content-Type-Options: nosniff`.
- Hata mesajları stack trace, istisna sınıf adı veya başka çalışanın verisini içermez
  (`docs/conventions.md`, Error handling).
- **Log'lar (KVKK):** yalnızca ID'ler. Açıklama metni, şifre ve oturum token'ı hiçbir zaman
  log'a yazılmaz.

## AuthN / AuthZ
**Kimlik doğrulama**
- Kullanıcı adı + şifre; şifre hash'i stdlib `hashlib.scrypt` (rastgele salt).
- Oturum sunucu tarafında, bellekte; token `secrets.token_urlsafe`, **HttpOnly + SameSite=Strict**
  cookie'de. 8 saat işlemsizlikte sona erer.
- Hatalı girişte her durumda tek mesaj: "Kullanıcı adı veya şifre hatalı" (kullanıcı adı
  varlığı sızmaz).

**Yetkilendirme — varsayılan: reddet**
- `/api/auth/login` dışındaki her `/api` ucu geçerli oturum ister. Statik dosyalar (giriş
  sayfası dahil) herkese açıktır; veri içermezler.
- **Çalışan:** yalnızca kendi taleplerini ve bakiyesini görür.
- **Yönetici:** kendi talepleri + doğrudan bağlı çalışanlarının talepleri; yalnızca bağlılarının
  `Pending` taleplerini onaylar/reddeder (BR-4).
- **İK:** her şeyi görür; izin türü, resmi tatil ve hak edişleri yönetir; yöneticisi olmayan
  çalışanın talebini onaylar/reddeder (BR-4).
- Kimse kendi talebini onaylayamaz (BR-5).
- Kontroller **servis katmanında** (`docs/architecture.md`); router/UI kontrolü ek katmandır.
- Görülemeyen kaynak → **404** (varlık sızmaz); görülebilen ama yetkisiz işlem → **403**.

## Dependencies
- Yeni bağımlılık (runtime veya dev) PLAN'da listelenir; plan onayıyla insan onaylar.
- Kontrol: lisans MIT/BSD/Apache-2.0 uyumlu · son 12 ayda sürüm · bilinen açık yok
  (`uvx pip-audit` / `npm audit`, bağımlılık eklenirken). Ağ gerektirdiği için `check`'e
  girmez — Documented seviye.
- Onaylı başlangıç listesi — runtime: fastapi, pydantic, uvicorn · dev: pytest, httpx, ruff,
  mypy, import-linter, jsdom. Playwright proje bağımlılığı değildir (VERIFY ekran görüntüsü,
  repo dışında — `docs/testing.md`).
- Bilerek ertelenenler: giriş denemesi sınırlama, MFA, şifre değiştirme (`specs/backlog.md`).

## Review lens
Security is a mandatory dimension of every independent review (see `prompts/review.md`), not a
separate afterthought phase.
