# Spec 0002 — Leave Manager design system ve token'ların frontend CSS'ine aktarımı

- Status: Approved
- Mode: lite
- Plan: `specs/plans/0002-plan.md`
- Self-critique: done

## Intent
Leave Manager'ın görsel dili tek bir yerde tanımlansın: Claude'da "Leave Manager" adlı bir Design
System — renkler, yazı stilleri, boşluk, köşe yarıçapı ve kullanım kuralları. Tasarım canvas'ları
onu kurar (spec 0001), frontend kodu aynı değerleri bir token dosyası üzerinden kullanır; böylece
tasarım ile uygulama aynı paletten çıkar ve ekranlarda rastgele renk kodları birikmez. Başarı: ilk
ekran (0003) yalnız token'larla yazılır, ham bir renk kodu `check`'i kırmızıya düşürür, metin
renklerinin AA kontrastı otomatik bir testle kanıtlanır. Yapılmayanlar: koyu tema, bileşen
kütüphanesi, ikon seti, logo.

## Requirements
- **R-1 — Tek kaynak.** Claude'da "Leave Manager" başlıklı tek bir Design System vardır. İçeriği:
  açık tema renk token'ları (zemin, yüzey, metin, ikincil metin, kenarlık, vurgu, vurgu üzeri
  metin, odak, hata) ve dört talep durumu (`Pending`, `Approved`, `Rejected`, `Cancelled`) için
  zemin + metin çiftleri; 5–7 yazı stili; 4 boşluk; 3 köşe yarıçapı; her token'ın kullanım notu;
  kullanım kurallarını anlatan bir README ve kapak.
- **R-2 — Yazı tipi.** Sistem font yığını kullanılır; hiçbir harici font isteği yapılmaz.
- **R-3 — Erişilebilirlik.** Metin/zemin çiftleri WCAG AA'yı geçer: normal metin 4.5:1, büyük metin
  (24 px ve üstü), kenarlık ve odak halkası 3:1. Talep durumları yalnız renkle değil, metinle de
  belirtilir (README kuralı); durum renklerinin açıklık farkı ölçülmez — durum adı her zaman
  metinle yazıldığı için renk tek ayırt edici değildir.
- **R-4 — Kod tarafı.** Frontend, renk ve ölçü değerlerini yalnız tek bir token dosyasından alır.
  Dosya, Design System'in hangi sürümünden üretildiğini (link + sürüm kimliği) söyler ve her
  token'ı birebir taşır: her token, adı birebir aynı bir CSS custom property'dir
  (`--<token adı>`, önek yok).
- **R-5 — Ham renk yasağı.** Frontend kodunda ham renk değeri yalnız token dosyasında bulunabilir;
  başka yerde bulunursa `./scripts/check` kırmızıdır. "Ham renk": hex (`#rgb`, `#rrggbb`, alfa
  dahil) ve renk fonksiyonları (`rgb()`, `rgba()`, `hsl()`, `hsla()`, `hwb()`, `lab()`, `lch()`,
  `oklab()`, `oklch()`, `color()`). Kapsam: `frontend/` altındaki `*.css`, `*.js`, `*.html`; token
  dosyası ve `frontend/tests/` hariç. Adlı renkler (`red`, `white`…) review'da yakalanır;
  `transparent`, `currentColor`, `inherit` serbesttir.
- **R-6 — Kanıt check'te.** R-3'ün kontrast kuralı otomatik bir testle kanıtlanır ve
  `./scripts/check` içinde çalışır. Hangi metin token'ının hangi zemin üzerinde kullanıldığı
  testte açık bir çift listesidir; değerler token dosyasından okunur. Listede çifti olmayan bir
  metin token'ı testi kırmızıya düşürür.
- **R-7 — Senkron.** Design System değişince sıra: önce sistem, sonra token dosyası yeniden
  üretilir ve sürüm kimliği güncellenir. Bu prosedür `workflows/ui-design.md`'de yazılıdır ve
  tekrarlanabilirdir (mekanizmayı plan seçer); canvas'lar (spec 0001) sistemi bu adla kurar.

## User experience
none — no user interface. Design System bir uygulama ekranı değildir; `/design` akışı
(`workflows/ui-design.md`, R-1) uygulanmaz.

## Constraints & out of scope
- Sensitive area: yok.
- **Varsayım (Q1):** Polsan'ın marka kaynağı (renk kodları, logo, font) paylaşılmadı → prova
  görünümünden küçük bir ilk sistem; README'de "marka kaynağı yok" notu. Kaynak gelirse
  değişiklik bu sistemin yeni bir sürümüdür (R-7).
- Yalnız açık tema; koyu tema, bileşen kütüphanesi, ikon seti ve logo kapsam dışı.
- `docs/security.md` CSP'si (`default-src 'self'`) değişmez — harici font yok.
- Bu iş `scripts/check.conf`'un ilk etkin adımlarını getirir; Python toolchain (uv, pytest, ruff,
  mypy) walking skeleton'a (spec 0003) kalır.
- Design System dosyaları repoya kopyalanmaz (ADR-0003); repoda yalnız ondan üretilen token
  dosyası bulunur.
- **Bağımsız doğrulama:** Design System'e dayanan kriterleri (AC-1…AC-4) VERIFY'da, Artifact
  okuyabilen ama yazmama talimatlı yeni bir doğrulayıcı agent sistemin o sürümünü okuyarak
  doğrular (`reviewer` subagent'ının Artifact erişimi yoktur).

## Acceptance criteria
- [ ] AC-1 — Claude'da "Leave Manager" başlıklı tek bir Design System vardır; README'si, kapağı
  ve R-1'deki token aileleri (renk, yazı, boşluk, yarıçap) bulunur; her token'ın kullanım notu
  vardır; README "marka kaynağı yok" notunu taşır.
- [ ] AC-2 — Renk token'ları tek tema ("light") içerir ve R-1'deki dokuz temel rengi ve dört
  talep durumunun zemin + metin çiftlerini kapsar.
- [ ] AC-3 — Yazı stilleri 5–7 adettir ve sistem font yığınını kullanır; token dosyasında ve
  frontend CSS'inde harici font isteği (`@import`, `url(http…)`, font CDN'i) yoktur.
- [ ] AC-4 — Token dosyası başlığında Design System'in linki ve sürüm kimliği vardır; dosyadaki
  her custom property'nin adı ve değeri, o sürümdeki sistemin token'ıyla birebir aynıdır ve
  sistemin her token'ı dosyada vardır.
- [ ] AC-5 — Kontrast testi, tanımlı her metin/zemin çifti için oranı hesaplar: normal metin
  ≥ 4.5:1, büyük metin / kenarlık / odak ≥ 3:1; hepsi geçer. Bir çiftin metin rengi bilerek
  açıldığında test kırmızıya düşer; çifti tanımsız bir metin token'ı eklendiğinde de kırmızıya düşer.
- [ ] AC-6 — `frontend/` altında token dosyası dışındaki bir CSS, JS veya HTML dosyasına ham renk
  eklendiğinde `./scripts/check` kırmızı olur ve dosya adıyla satırı gösterir; kaldırılınca yeşil olur.
- [ ] AC-7 — `./scripts/check` ve `./scripts/check --fast` yeni adımlarla yeşildir;
  `./scripts/residue` ve `./scripts/residue --fast` clean'dir.
- [ ] AC-8 — `workflows/ui-design.md` bir "Design system" bölümü içerir: sistemin adı, token
  dosyası, R-7'deki senkron sırası ve canvas'ların sistemi kurması.

## Definition of Done
- [ ] Every acceptance criterion mapped to proof (test or reproducible observation)
- [ ] `scripts/check` green
- [ ] Independent review done; real findings fixed, noise rejected with written rationale, deferred ones in `specs/backlog.md`
- [ ] Docs / ADRs updated if behavior or architecture changed
- [ ] Spec moved to `specs/done/` (it becomes immutable there)

## Scorecard (fill at ship — honest numbers make the process improvable)
| Metric | Value |
|---|---|
| Spec revisions | |
| Fix rounds | |
| Review findings: real / noise / deferred | |
| Regressions introduced | |
| Bugs escaped to production | |
