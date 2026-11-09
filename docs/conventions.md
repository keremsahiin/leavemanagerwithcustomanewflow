# Conventions

> Bootstrap 2026-11-09'da dolduruldu. Yalnızca gerçek kurallar: her kural ya tooling ile zorlanır
> (tercih edilen) ya da review'da kontrol edilir.

## Language
- Chat language (interviews, sessions): Türkçe (`tr`)
- Document language (docs/, specs, plans, ADRs, review and verify reports): Türkçe (`tr`)
- Always English (protocol, not prose): ANEW core files, template headings and field labels,
  `Status:` values (Draft / Approved / In progress / Shipped), `Approved by / on:`, `Source:`.
- Code identifiers, branch names, commit messages: **İngilizce**. Alan sözlüğü (`docs/domain.md`)
  Türkçe terimi koddaki İngilizce adına bağlar (İzin talebi → `LeaveRequest`).
- Arayüz metinleri ve kullanıcıya gösterilen hata mesajları: **Türkçe**.
- Agent messages (handoff summaries, refusals, `Next:` lines): chat language; command names, file
  paths and protocol fields verbatim.

## Language & framework versions
- **Python 3.14** — `.python-version` ile sabitlenir.
- **uv** — bağımlılık ve ortam yönetimi; `pyproject.toml` + `uv.lock` (commit edilir). CI ve
  yerel aynı kilitten kurar (`uv sync --frozen`).
- **FastAPI**, **Pydantic 2**, **Uvicorn** (yalnızca geliştirme/çalıştırma; `check` içinde asla).
- **Node 24 LTS** — yalnızca frontend testleri için (`node --test` + jsdom); `.nvmrc` ile sabitlenir.
- Frontend: framework ve bundler yok — statik HTML/CSS/vanilla JS (ES modules).
- Kesin paket sürümleri walking skeleton'da kilit dosyalarına (`uv.lock`, `package-lock.json`) yazılır.

## Naming
- Python: PEP 8 — modül/fonksiyon/değişken `snake_case`, sınıf `PascalCase`, sabit `UPPER_SNAKE`.
- Testler: `tests/<unit|service|api>/test_<modül>.py`; test adı kuralı taşır:
  `test_br2_request_exceeding_balance_is_rejected`. Kriter ↔ test eşlemesi isimden okunur.
- API yolları: kebab-case, çoğul isim — `/api/leave-requests`, `/api/leave-requests/{id}/approve`.
- JSON alanları: `snake_case` (Pydantic varsayılanı; alias yok).
- JS: değişken/fonksiyon `camelCase`, dosya `kebab-case.js`; CSS sınıfları `kebab-case`.
- Frontend testleri: `frontend/tests/<ekran>.test.js`.

## Error handling
- `domain` ve `services` tipli istisna fırlatır: `BusinessRuleViolation(code="BR-n")`,
  `InvalidTransition`, `NotFound`, `Forbidden`.
- `api` bunları **tek bir merkezî exception handler**'da HTTP'ye eşler:
  doğrulama → **422** · iş kuralı / geçersiz geçiş → **409** · yetki yok → **403** ·
  bulunamadı veya görülemiyor → **404** (`docs/security.md`, AuthZ).
- Hata gövdesi her zaman: `{"error": {"code": "BR-2", "message": "<Türkçe mesaj>"}}`. Frontend
  kullanıcıya `message` alanını gösterir.
- Kullanıcıya **asla** sızmaz: stack trace, istisna sınıf adı, başka çalışanın verisi. Beklenmeyen
  hata → generic 500 mesajı; ayrıntı log'a (log kuralları: `docs/security.md`).

## Data rules
- İzin tarihleri `datetime.date` (saat yok); JSON'da `YYYY-MM-DD`.
- Denetim zaman damgaları UTC, timezone-aware `datetime`; JSON'da ISO 8601, `Z` ekiyle.
- "Bugün" **Europe/Istanbul**'a göre, enjekte edilen bir `Clock` üzerinden okunur;
  `app/domain` ve `app/services` içinde `date.today()` / `datetime.now()` çağrısı yasak.
- Gün sayıları `int` — yalnızca tam gün.
- Hafta sonu: Cumartesi ve Pazar.
- ID'ler opak string, `UUID4`; sıralı/tahmin edilebilir ID yok.
- Açıklama alanı en fazla 500 karakter, UTF-8.
- Depo, sakladığı nesneyi değil değiştirilemez bir değer döndürür (`frozen` dataclass) — T-3.

## Known traps
- T-1: `async def` endpoint içinde `threading.Lock` veya bloklayan kod event loop'u kilitler —
  endpoint'ler düz `def` olur (FastAPI thread havuzunda çalıştırır) — from bootstrap 2026-11-09.
- T-2: Modül seviyesinde global `app`/depo testler arasında durum sızdırır (`dependency_overrides`
  dahil) — `create_app(store, clock)` fabrikası; her test kendi uygulamasını kurar — from bootstrap 2026-11-09.
- T-3: Bellek içi depo sakladığı nesneyi döndürürse çağıran onu değiştirip servisi, kilidi ve
  denetim kaydını atlar — `frozen` dataclass veya kopya döndür; değişiklik yalnızca servis
  üzerinden — from bootstrap 2026-11-09.
- T-4: JS'te `new Date("2026-11-09")` UTC gece yarısı olarak okunur, bazı saat dilimlerinde gün
  kayar — tarihler JS'te `YYYY-MM-DD` string kalır; gösterim string bölerek veya
  `timeZone: "UTC"` ile — from bootstrap 2026-11-09.

## Enforced by tooling
Walking skeleton bu adımları `scripts/check.conf` içinde etkinleştirir; o zamana kadar planlıdır.
- `ruff check` — lint; `PLW1514` (unspecified-encoding) açık: her `open()` `encoding="utf-8"`
  verir (Windows'ta cp1254 Türkçe karakterleri bozar — eski T-5).
- `ruff format --check` — format.
- `mypy --strict app` — tipler.
- import-linter — `docs/architecture.md` "Forbidden dependencies" sözleşmeleri.
- Frontend'de HTML sink yasağı — `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`
  `frontend/` JS dosyalarında bulunursa check kırmızı (`docs/security.md`, Input & output).
