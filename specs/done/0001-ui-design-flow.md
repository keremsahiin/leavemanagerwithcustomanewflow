# Spec 0001 — UI/UX tasarım akışı (Claude Design)

- Status: Shipped
- Mode: lite
- Plan: `specs/plans/0001-plan.md`
- Self-critique: done

## Intent
Leave Manager'ın ekranlarının, kod yazılmadan önce görsel olarak tasarlanıp onaylanmasını
istiyoruz. Bugün bir UI spec'i akışı ve durumları yazıyla tanımlıyor, tasarım bağlantısı
opsiyonel; bu yüzden VERIFY'daki ekran görüntüsü yalnızca metinle karşılaştırılıyor ve görünüm her
ekranda yeniden icat ediliyor. Bu iş projeye özel bir UI/UX akışı tanımlar: her UI spec'inin
ekranları ve durumları Claude'daki bir Design canvas'ında, projenin design system'iyle tasarlanır;
spec onaylanırken tasarımın sabit bir sürümü de onaylanır; build bu tasarımdan yapılır; VERIFY
ekran görüntülerini tasarımla yan yana koyar. Başarı: bir sonraki UI spec'i (giriş sayfası) bu
akışla tasarlanır, onaylanır ve ship'te tasarım ile uygulama yan yana görülür. Yapılmayanlar:
otomatik piksel karşılaştırması, ayrı bir tasarımcı rolü, yeni bir insan kapısı.

## Requirements
- **R-1 — UI spec'i.** "User experience" bölümü `none — no user interface` olmayan her spec
  (CHANGE lane mini-spec'leri dahil) bir UI spec'idir ve bu akışa tabidir. Diğer spec'ler için
  hiçbir şey değişmez.
- **R-2 — Tasarım ANALYZE'da yapılır.** UI spec'inin akışı ve durumları yazıldıktan sonra, spec
  başına bir Design canvas'ı hazırlanır: UX bölümündeki **her ekran × her durum** (boş, yükleniyor,
  hata, başarılı, yetki yok — spec'in listelediği her durum) için bir artboard. Projenin design
  system'i varsa canvas onu kullanır; yoksa bunu söyler, geçici bir görünümle devam eder ve hem
  canvas'a hem spec'e "design system yok" notu düşer. Design system sonradan geldiğinde böyle
  bir tasarım kendiliğinden güncellenmez; gerekirse R-5 uygulanır.
- **R-3 — Tasarım spec'e bağlanır, kopyalanmaz.** Spec'in "Design reference" satırı canvas
  linkini, onaylanan sürümün etiketini ve onay tarihini taşır. Sürüm etiketi `spec-NNNN-vK`
  biçimindedir (K 1'den artar; ör. `spec-0003-v1`). Onaydan önce insan canvas üzerinde yorum
  yapabilir veya düzenleyebilir, Claude yorumları uygular; onay anındaki son sürüm etiketlenir ve
  kilitlenir. Platform eski bir sürümü okutamıyorsa yedek yol: onay anında tarihli bir PDF/PNG
  export'u alınır, PR'a eklenir ve spec export'un adını taşır. Mini-spec'lerin `Design:` satırı
  aynı biçimdedir ve önce/sonra için önceki onaylı sürümü de yazar. Tasarım dosyaları ve
  görselleri repoya girmez.
- **R-4 — Onay spec kapısında.** Spec onayı tasarımı da kapsar; ayrı bir tasarım kapısı yoktur.
  Bir UI spec'i, tasarımı UX'teki her ekran × durumu karşılamadan onaya sunulmaz; onay mesajı
  canvas linkini ve kilitlenecek sürüm etiketini gösterir.
- **R-5 — Onaydan sonra tasarım değişikliği bir spec değişikliğidir** (R-08): yeni sürüm
  etiketi, spec revizyonu, yeniden onay. Önceki etiket spec'in geçmişinde kalır.
- **R-6 — Build onaylı sürümden yapılır.** UI adımı olan bir plan, onaylı tasarım sürümünü
  kaynak olarak gösterir; BUILD o sürümü okur.
- **R-7 — VERIFY yan yana koyar.** SHIP galerisi her ekran × durum için onaylı tasarımı ve
  uygulamanın ekran görüntüsünü yan yana sunar; tasarımda olup uygulamada olmayan (veya tersi)
  durum işaretlenir. Benzerlik kararı insanındır. Tasarım tarafını ana oturum hazırlar
  (read-only reviewer'ın tasarıma erişimi yoktur); bağımsız oturum uygulamanın ekran
  görüntülerini ve testleri doğrular.
- **R-8 — Kurallar araçtan bağımsız, otomasyon Claude'a özgü.** Akışın kuralları herhangi bir
  araçla izlenebilir biçimde yazılır (tasarım linki elle de eklenebilir); Claude Design
  otomasyonu yalnızca Claude Code'dadır.

## User experience
none — no user interface. Akış sohbet ve dosyalar üzerinden işler; ürettiği tasarımlar diğer
spec'lerin "User experience" bölümleridir.

## Constraints & out of scope
- Sensitive area: yok.
- **Claude Design** = Claude'daki Design (canvas) ve Design System artifact türleri. Standalone
  `claude.ai/design` (14 Aralık 2026'da kapanıyor) ve DesignSync kapsam dışı.
- ANEW'in kendi kuralları ve kararları değişmez (`workflows/segments.md`, `prompts/`,
  `docs/decisions/anew/`): proje akışı yeni bir proje dosyası olarak onlara işaret eder,
  Claude'a özgü kısım adaptör katmanında kalır (thin-adapter ilkesi, ANEW-0001).
- ANEW-0008 tasarım aracı entegrasyonunu core için reddeder; bu proje için genişleten karar
  **ADR-0003** olarak yazılır (ANEW-0010).
- `./scripts/doctor` yeşil kalır (komut eşitliği, komut referansı dahil).
- Yeni insan kapısı, tasarımcı rolü, otomatik görsel diff yok.
- Genişlik: V1'de artboard'lar ve ekran görüntüleri masaüstü (1280 px) genişliktedir. Telefon
  genişliği bir tasarım kuralı olarak kalır, doğrulanmaz.
- Prova canvas'ları hesapta private kalır; ship'ten sonra insanın onayıyla silinir.
- **Kanıt yöntemi:** kriterler, repo dışında geçici bir kopyada örnek bir UI spec'i üzerinde
  yapılan bir **prova** ile gözlemlenir; provada oluşan canvas'lar private'tır, linkleri PR'a
  yazılır, repoya girmez.
- Kapsam dışı: Leave Manager design system'i ve token'ların frontend CSS'ine aktarımı → spec
  0002. İlk gerçek UI (giriş sayfası, walking skeleton) → spec 0003.
- Split: proposed 0001 (akış) + 0002 (design system ve token'lar); kabul — Kerem Şahin,
  2026-11-09, iki ayrı yetenek ve teslimat.

## Acceptance criteria
- [x] AC-1 — Proje akış belgesi R-1…R-8'i adım adım (ANALYZE → PLAN → BUILD → VERIFY → SHIP, ve
  R-08) tanımlar ve `AGENTS.md` "Where things live" tablosundan bağlantılıdır.
- [x] AC-2 — Provada, örnek bir UI spec'i için ANALYZE, spec onayını istemeden önce UX bölümündeki
  her ekran × durum için birer artboard içeren tek bir Design canvas'ı üretir.
- [x] AC-3 — Provada canvas'ta UX'teki bir durumun artboard'u yoksa onay istenmez ve eksik
  durumlar adlarıyla listelenir.
- [x] AC-4 — Provada onaydan sonra spec'in "Design reference" satırı canvas linkini, sürüm
  etiketini ve onay tarihini taşır; repoda hiçbir tasarım dosyası veya görseli yoktur ve
  `./scripts/doctor` evidence uyarısı vermez.
- [x] AC-5 — Provada UX bölümü `none — no user interface` olan bir spec'te tasarım adımı
  çalışmaz ve canvas oluşmaz.
- [x] AC-6 — Provada onaylı bir tasarım için değişiklik istendiğinde akış R-08'e yönlendirir:
  yeni sürüm etiketi, spec revizyonu ve yeniden onay; önceki etiket spec geçmişinde kalır.
- [x] AC-7 — Akış belgesi ve Claude Code tarafı, UI adımı olan bir planın onaylı tasarım
  sürümünü kaynak göstermesini ve BUILD'in onu okumasını şart koşar.
- [x] AC-8 — Provada (geçici, statik bir örnek sayfayla) SHIP galerisi her ekran × durum için
  tasarımı ve ekran görüntüsünü yan yana sunar; karşılığı olmayan durum işaretlenir.
- [x] AC-9 — Claude Code dışındaki araçlar için akış belgesi aynı kuralları elle izleme yolunu
  tarif eder; `./scripts/doctor` 0 fail verir.
- [x] AC-10 — ADR-0003 `Accepted` durumundadır, ANEW-0008'i bu proje için genişlettiğini söyler
  ve ona bağlanır; `git diff main -- workflows/segments.md prompts/ docs/decisions/anew/` boştur.

## Evidence
Kanıt işaretçidir (`docs/testing.md`, Evidence policy); ayrıntı ve birebir alıntılar planın
`## Build evidence` bölümünde ve PR #2 açıklamasında. VERIFY: bağımsız QA (`reviewer` subagent)
@870d226, fix-3 diff'i @a2fa77e — boşluk yok. Prova canvas'ı:
https://claude.ai/artifact/WWDsf3dS7tcRiApMkURoHN (private).

| Kriter | Kanıt (işaretçi) | Teyit |
|---|---|---|
| AC-1 | `workflows/ui-design.md` R-1…R-8 bölümleri; `AGENTS.md` "Where things live" satırı | QA @a2fa77e |
| AC-2 | canvas sürümü 1794242243-755a: kapak + 5 artboard, onaydan önce | teyit: Kerem Şahin, SHIP, 2026-11-10 |
| AC-3 | ara sürüm 1794242209-4770 ("Yükleniyor" yok); "Eksik: İzin taleplerim — Yükleniyor" | teyit: Kerem Şahin, SHIP, 2026-11-10 |
| AC-4 | `spec-9001-v1` (1794242286-5295) satırı; repoda tasarım/görsel yok; `./scripts/doctor` evidence uyarısı yok | QA @a2fa77e + teyit: Kerem Şahin, SHIP, 2026-11-10 |
| AC-5 | 9002 için birebir ret; "spec 9002" canvas'ı yok | teyit: Kerem Şahin, SHIP, 2026-11-10 |
| AC-6 | ret → R-08 → `spec-9001-v2` (1794242381-8775), `Önceki: spec-9001-v1` | teyit: Kerem Şahin, SHIP, 2026-11-10 |
| AC-7 | `workflows/ui-design.md` PLAN ve BUILD; `.claude/commands/plan.md`, `build.md` | QA @a2fa77e |
| AC-8 | `spec-9001-v2-ship` (1794242582-d931): SHIP sayfası, 4 durum yan yana, UYGULAMADA YOK / TASARIMDA YOK | teyit: Kerem Şahin, SHIP, 2026-11-10 |
| AC-9 | `workflows/ui-design.md` "Elle yol"; Cursor/Copilot/Codex karşılıkları; `./scripts/doctor` 0 fail | QA @a2fa77e |
| AC-10 | ADR-0003 Accepted + ANEW-0008 bağlantısı; korunan dosyalarda main'e karşı diff boş | QA @a2fa77e |

Full green: `scripts/check.conf` adımsız — `./scripts/check` greenfield no-op (çıkış 0, `CHECK GREEN`
satırı yok). CI @a2fa77e success: run 42667955029 (push) ve 42668106855 (PR) — `doctor --strict`,
`selftest`, `check`. Ship commit'i yalnız `specs/`'e dokunur ve bu yeşili devralır
(`docs/testing.md`, Two speeds, rule 6): `git diff --name-only a2fa77e HEAD -- . ':!specs/'` boş.

## Definition of Done
- [x] Every acceptance criterion mapped to proof (test or reproducible observation)
- [x] `scripts/check` green — greenfield no-op (check.conf adımsız), CI yeşil; bkz. Evidence
- [x] Independent review done; real findings fixed, noise rejected with written rationale, deferred ones in `specs/backlog.md`
- [x] Docs / ADRs updated if behavior or architecture changed
- [x] Spec moved to `specs/done/` (it becomes immutable there)

## Scorecard (fill at ship — honest numbers make the process improvable)
| Metric | Value |
|---|---|
| Spec revisions | 0 (onaydan sonra yalnız Status değişti) |
| Fix rounds | 3 (fix-1: 9 bulgu · fix-2: 3 · fix-3: 1) |
| Review findings: real / noise / deferred | 13 / 0 / 0 (round 1: 9 · round 2: 3 · VERIFY: 1) |
| Regressions introduced | 0 |
| Bugs escaped to production | 0 (süreç işi; üretim yok) |
