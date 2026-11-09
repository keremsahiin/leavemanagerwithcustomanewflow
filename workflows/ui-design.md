# Workflow: UI/UX tasarımı (Claude Design) — proje akışı

> Leave Manager'a özel (spec 0001, [ADR-0003](../docs/decisions/0003-claude-design-ui-flow.md)).
> ANEW'in feature akışını değiştirmez: UI spec'lerinde onun segmentlerine adım ekler. Kurallar
> araçtan bağımsızdır; Claude Code'da `/design` komutu Claude Design mekaniğini yürütür, diğer
> araçlar "Elle yol"u izler.

## Ne zaman geçerli (R-1)
"User experience" bölümü `none — no user interface` **olmayan** her spec — CHANGE lane
mini-spec'leri dahil. Diğer spec'ler için hiçbir şey değişmez; `/design` onlarda çalışmaz ve
canvas oluşturmaz.

**Mini-spec (CHANGE lane).** Şablonunda (`specs/TEMPLATE-mini.md`) "User experience" bölümü
yoktur. `Design:` satırı doluysa ya da Changed behavior bir ekranı veya bir durumunu
değiştiriyorsa UI spec'idir; ikisi de yoksa akış uygulanmaz. Ekran × durum listesi, Changed ve
Preserved behavior kriterlerinin dokunduğu ekran × durumlardır. Aşağıda "tasarım satırı" denen
satır tam spec'te **Design reference**, mini-spec'te **`Design:`** satırıdır; kilit, taslak ve
`Design change:` satırları mini-spec'te orada taşınır.

## Kavramlar
- **Canvas** — Claude'da **Design** türünden bir artifact. Spec başına bir tane; başlığı
  `Leave Manager — spec NNNN <kısa ad>`. Private'tır; paylaşım Share menüsünden.
- **Kapak** — canvas'ın giriş artboard'u `Main.dc.html`: spec numarası, ekran × durum listesi,
  design system notu, kilitli etiket ve tarih.
- **Artboard** — bir ekran × bir durum. Dosya adı `<ekran>--<durum>.dc.html` (ASCII, kebab:
  `izin-taleplerim--bos.dc.html`), başlığı `<Ekran> — <Durum>`. "Tasarım" sayfasında, masaüstü
  sayfa olarak 1280 px genişlikte.
- **Durum adları** — spec'in listelediği her durum; ortak olanlar: `bos` (boş), `yukleniyor`,
  `hata`, `basarili`, `yetki-yok`.
- **Kilit** — onay anındaki canvas sürümü: etiket `spec-NNNN-vK` (K 1'den artar) + yayının
  sürüm kimliği + tarih.

## Akış

### ANALYZE — tasarla ve kilitle (R-2, R-3, R-4)
1. Analyst UX bölümünü yazar: akış, her ekranın durumları, erişilebilirlik (ANEW-0008).
2. **Ekran × durum listesi** UX bölümünden (mini-spec: Changed ve Preserved behavior'dan)
   çıkarılır.
3. **Design system.** Projenin design system'i (Claude'da "Leave Manager" adlı Design System
   artifact'i, spec 0002) varsa canvas onu kurar. Yoksa geçici bir görünümle devam edilir ve
   "design system yok" notu kapağa ve spec'in Design reference satırına düşer. Design system
   sonradan geldiğinde böyle bir tasarım kendiliğinden güncellenmez; gerekirse R-08.
4. **Canvas** oluşturulur veya güncellenir: listedeki her ekran × durum için bir artboard.
   Metinler Türkçe; gerçek `button`/`input`/`label`; kontrast WCAG AA (4.5:1).
   **Spec başına bir canvas:** yeni canvas açmadan önce aynı başlıklı (`Leave Manager — spec
   NNNN`) canvas aranır; varsa o kullanılır. Canvas var olur olmaz linki tasarım satırına
   **taslak** olarak yazılır — `- Design reference: <canvas linki> — taslak (kilit yok)` — ki
   yeni bir oturum (R-09) onu dosyadan bulsun. Taslak satırda `spec-NNNN-vK` kalıbı bulunmaz;
   kilit (8) bu satırın üzerine yazar.
5. **Kapsama kontrolü.** Canvas'taki artboard'lar listeyle karşılaştırılır. Eksik varsa spec
   **onaya sunulmaz**; eksik durumlar adlarıyla (`<ekran> — <durum>`) listelenir.
6. **İnsan turu.** İnsan canvas'ta yorum yapabilir veya düzenleyebilir; Claude yorumları uygular
   ve 5. adımı tekrarlar.
7. **Onaya sunuş.** Spec onay mesajı canvas linkini ve kilitlenecek etiketi gösterir. Spec onayı
   tasarım onayıdır; ayrı bir tasarım kapısı yoktur.
8. **Kilit.** Onaydan hemen sonra kapak "Onaylı: `spec-NNNN-vK`, <tarih>" ile güncellenip bu
   etiketle yayınlanır — o yayın, insan düzenlemeleri dahil canvas'ın o anki halidir. Spec'e:

   ```
   - Design reference: <canvas linki> — spec-NNNN-vK (sürüm kimliği <id>), onay <YYYY-MM-DD>
   ```

   Design system yoksa satırın sonuna `— design system yok` eklenir. Eski bir sürüme insan
   canvas'ın sürüm geçmişinden ulaşır (araç eski sürümü okuyamaz — spike 0001).
   **Yedek yol (R-3).** İnsan da eski sürümleri sürüm geçmişinden açamıyorsa (platform
   değişirse): onay anında tasarımın tarihli bir PDF/PNG export'u alınır (canvas'ın Share ›
   Export menüsünden; araç alamıyorsa insan alır), PR'a eklenir ve satırın sonuna export'un adı
   yazılır: `— export: <dosya adı>, <YYYY-MM-DD>`. Export dosyası repoya girmez.
   **Mini-spec:** aynı biçim `Design:` satırında; önce/sonra karşılaştırması için önceki onaylı
   sürüm de yazılır: `Design: <link> — spec-NNNN-vK (…); önceki: spec-MMMM-vJ (…)`.

### Onaydan sonra tasarım değişikliği (R-5)
- Kilitten sonra "Tasarım" sayfasındaki artboard'larda yapılan her değişiklik bir **spec
  değişikliğidir**: R-08 (`prompts/recovery/spec-change.md`). Sıra:
  1. R-08'in ilk adımı spec'i günceller ve tasarım satırının altına bir işaret ekler:
     `- Design change: R-08, <YYYY-MM-DD> — <ne değişiyor>`. Bu satır, R-08'in başladığını
     dosyadan gösterir; `/design` kilitli canvas'ı yalnızca bu satır varken değiştirir.
  2. Tasarım güncellenir (ANALYZE adımları 4–6, kapsama kontrolü dahil).
  3. Spec yeniden onaylanır.
  4. Onaydan sonra `spec-NNNN-v(K+1)` kilidi yayınlanır: tasarım satırı yeni kilidi gösterir,
     önceki kilit bir alt satırda `Önceki:` olarak kalır, `Design change:` satırı kaldırılır
     (spec'in git geçmişinde kalır).
- "SHIP" sayfasına artboard eklemek tasarım değişikliği değildir.

### PLAN ve BUILD (R-6)
- UI adımı olan bir plan, tasarım kaynağını yazar: `Tasarım: <link> — spec-NNNN-vK`.
- BUILD UI adımlarında canvas'ın ilgili artboard'larını okur ve onlardan yapar: aynı ekranlar,
  aynı durumlar, aynı metinler. Design system varsa token'larını kullanır.
- **Kilit kontrolü.** BUILD'in başında canvas'tan bir dosya okunur; araç okunan sürümün kimliğini
  verir (`from version <id>`). Bu kimlik tasarım satırındaki kilit kimliğiyle karşılaştırılır.
  Aynıysa kilitten sonra canvas'ta hiçbir şey değişmemiştir. Farklıysa BUILD durur ve insana
  sorar: tasarım değiştiyse → R-08; tasarım dışı bir değişiklikse (ör. SHIP sayfası) insanın
  teyidiyle devam edilir ve yeni kimlik plana not edilir.

### VERIFY ve SHIP — yan yana (R-7)
1. **Ekran görüntüleri** — bağımsız VERIFY oturumu yakalar (`docs/testing.md`, Evidence for UI
   criteria): her ekran × durum için bir PNG, adı `<ekran>--<durum>.png`, 1280 px genişlik,
   uygulama deterministik kipte. Araç `docs/testing.md`'de ("Frameworks & layout": Playwright,
   makinedeki Edge ile). Edge tuzakları (prova 0001):
   - **Ayrı ve geçici bir `--user-data-dir` şarttır**; yoksa çağrı açık Edge'e devredilir ve
     görüntü üretmez.
   - CLI (`msedge --headless=new --screenshot`) art arda çağrılınca zaman zaman çıkış kodu 0 ile
     **görüntüsüz** biter: her görüntüye ayrı profil, her PNG'nin varlık kontrolü, yoksa o çekim
     tekrarlanır.
   - Tarayıcı koşunun sonunda kapanır; ardından `msedge.exe` kalmadığı doğrulanır.

   Görüntüler repo dışında geçici bir dizinde.
2. **SHIP sayfası** — ana oturum hazırlar (read-only reviewer'ın tasarıma erişimi yoktur):
   önce kilit kontrolünü yapar (beklenen tek fark bu spec'in önceki `-ship` yayınlarıdır),
   görüntüleri canvas'a yükler, "SHIP" sayfasına ekran başına bir karşılaştırma artboard'u ekler
   (`ship--<ekran>.dc.html`): durum başına bir satır — Durum · Tasarım (`spec-NNNN-vK`, onaylı
   artboard `<dc-import>` ile) · Uygulama (ekran görüntüsü). Tasarımda olup görüntüsü olmayan
   durum **UYGULAMADA YOK**, görüntüsü olup tasarımda olmayan durum **TASARIMDA YOK** diye
   işaretlenir.
3. **SHIP kapısı** — insan canvas'ın "SHIP" sayfasına bakar; ship onayı bu bakışı kapsar.
   Evidence tablosuna: `S-1…S-n agent-captured, judged by <ad> at SHIP, <tarih> — <canvas
   linki>, SHIP sayfası`. Benzerlik kararı insanındır; otomatik görsel diff yoktur.
4. Geçici görüntü dizini SHIP'ten sonra silinir. Canvas'a yüklenen görüntüler private kalır
   (PR eki gibi); repoya hiçbir tasarım dosyası veya görseli girmez (ANEW-0006).

## Claude Code
- `/design <NNNN>` — ANALYZE adımları 2–8: canvas'ı oluşturur/günceller, kapsama kontrolü,
  onaydan sonra kilit. Kilitli bir spec'te reddeder ve R-08'e yönlendirir.
- `/design <NNNN> ship` — VERIFY/SHIP adımı 2: SHIP sayfası.
- Segment komutları (`/analyze`, `/new-feature`, `/plan`, `/build`, `/verify`) ve `/change`
  (CHANGE lane, mini-spec) UI spec'lerinde bu dosyaya işaret eder.

## Elle yol (Cursor, Copilot, Codex, diğer araçlar — R-8)
Kurallar aynıdır, mekanik elle yapılır:
1. Tasarımı claude.ai'da bir **Design** canvas'ı olarak yapın (ya da sabit sürüm verebilen
   herhangi bir tasarım aracında); ekran × durum başına bir artboard, yukarıdaki adlarla.
2. Kapsama kontrolünü UX listesine karşı elle yapın; eksik varsa onaya sunmayın.
3. Onay anında canvas'ın sürüm geçmişinden o sürümü not edin ve Design reference satırını
   aynı biçimde yazın (etiket olarak `spec-NNNN-vK`, sürüm kimliği yerine tarih/saat).
4. SHIP'te ekran görüntülerini canvas'ın "SHIP" sayfasına veya PR'a durum başına tasarımın
   yanına koyun.

## Sınırlar (V1)
- Telefon genişliği bir tasarım kuralıdır, doğrulanmaz.
- Otomatik görsel diff, ayrı tasarım kapısı ve tasarımcı rolü yoktur.
- Standalone `claude.ai/design` ve DesignSync kullanılmaz.
- Prova ve eski canvas'lar yalnızca insanın onayıyla silinir.
