# Spec 0001 — UI/UX tasarım akışı (Claude Design)

- Status: Approved
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
- [ ] AC-1 — Proje akış belgesi R-1…R-8'i adım adım (ANALYZE → PLAN → BUILD → VERIFY → SHIP, ve
  R-08) tanımlar ve `AGENTS.md` "Where things live" tablosundan bağlantılıdır.
- [ ] AC-2 — Provada, örnek bir UI spec'i için ANALYZE, spec onayını istemeden önce UX bölümündeki
  her ekran × durum için birer artboard içeren tek bir Design canvas'ı üretir.
- [ ] AC-3 — Provada canvas'ta UX'teki bir durumun artboard'u yoksa onay istenmez ve eksik
  durumlar adlarıyla listelenir.
- [ ] AC-4 — Provada onaydan sonra spec'in "Design reference" satırı canvas linkini, sürüm
  etiketini ve onay tarihini taşır; repoda hiçbir tasarım dosyası veya görseli yoktur ve
  `./scripts/doctor` evidence uyarısı vermez.
- [ ] AC-5 — Provada UX bölümü `none — no user interface` olan bir spec'te tasarım adımı
  çalışmaz ve canvas oluşmaz.
- [ ] AC-6 — Provada onaylı bir tasarım için değişiklik istendiğinde akış R-08'e yönlendirir:
  yeni sürüm etiketi, spec revizyonu ve yeniden onay; önceki etiket spec geçmişinde kalır.
- [ ] AC-7 — Akış belgesi ve Claude Code tarafı, UI adımı olan bir planın onaylı tasarım
  sürümünü kaynak göstermesini ve BUILD'in onu okumasını şart koşar.
- [ ] AC-8 — Provada (geçici, statik bir örnek sayfayla) SHIP galerisi her ekran × durum için
  tasarımı ve ekran görüntüsünü yan yana sunar; karşılığı olmayan durum işaretlenir.
- [ ] AC-9 — Claude Code dışındaki araçlar için akış belgesi aynı kuralları elle izleme yolunu
  tarif eder; `./scripts/doctor` 0 fail verir.
- [ ] AC-10 — ADR-0003 `Accepted` durumundadır, ANEW-0008'i bu proje için genişlettiğini söyler
  ve ona bağlanır; `git diff main -- workflows/segments.md prompts/ docs/decisions/anew/` boştur.

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
