# Workflow: UI/UX tasarımı (Claude Design) — proje akışı

> Leave Manager'a özel (spec 0001, [ADR-0003](../docs/decisions/0003-claude-design-ui-flow.md)).
> ANEW'in feature akışını değiştirmez: UI spec'lerinde onun segmentlerine adım ekler. Kurallar
> araçtan bağımsızdır; Claude Code'da `/design` komutu Claude Design mekaniğini yürütür, diğer
> araçlar "Elle yol"u izler.

## Ne zaman geçerli (R-1)
"User experience" bölümü `none — no user interface` **olmayan** her spec — CHANGE lane
mini-spec'leri dahil. Diğer spec'ler için hiçbir şey değişmez; `/design` onlarda çalışmaz ve
canvas oluşturmaz.

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
2. **Ekran × durum listesi** UX bölümünden çıkarılır.
3. **Design system.** Projenin design system'i (Claude'da "Leave Manager" adlı Design System
   artifact'i, spec 0002) varsa canvas onu kurar. Yoksa geçici bir görünümle devam edilir ve
   "design system yok" notu kapağa ve spec'in Design reference satırına düşer. Design system
   sonradan geldiğinde böyle bir tasarım kendiliğinden güncellenmez; gerekirse R-08.
4. **Canvas** oluşturulur veya güncellenir: listedeki her ekran × durum için bir artboard.
   Metinler Türkçe; gerçek `button`/`input`/`label`; kontrast WCAG AA (4.5:1).
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
   **Mini-spec:** aynı biçim `Design:` satırında; önce/sonra karşılaştırması için önceki onaylı
   sürüm de yazılır: `Design: <link> — spec-NNNN-vK (…); önceki: spec-MMMM-vJ (…)`.

### Onaydan sonra tasarım değişikliği (R-5)
- Kilitten sonra "Tasarım" sayfasındaki artboard'larda yapılan her değişiklik bir **spec
  değişikliğidir**: R-08 (`prompts/recovery/spec-change.md`). Spec revize edilir, yeni etiket
  `spec-NNNN-v(K+1)` ile kilitlenir, yeniden onaylanır.
- Design reference satırı yeni kilidi gösterir; önceki kilit bir alt satırda `Önceki:` olarak
  kalır (spec'in git geçmişinde de).
- "SHIP" sayfasına artboard eklemek tasarım değişikliği değildir.

### PLAN ve BUILD (R-6)
- UI adımı olan bir plan, tasarım kaynağını yazar: `Tasarım: <link> — spec-NNNN-vK`.
- BUILD UI adımlarında canvas'ın ilgili artboard'larını okur ve onlardan yapar: aynı ekranlar,
  aynı durumlar, aynı metinler. Design system varsa token'larını kullanır.
- Canvas'ın kilitten sonra değiştiği görülürse (kapaktaki etiket spec'tekiyle aynı değil veya
  artboard'lar insan tarafından değiştirilmiş) BUILD durur → R-08.

### VERIFY ve SHIP — yan yana (R-7)
1. **Ekran görüntüleri** — bağımsız VERIFY oturumu yakalar (`docs/testing.md`, Evidence for UI
   criteria): her ekran × durum için bir PNG, adı `<ekran>--<durum>.png`, 1280 px genişlik,
   uygulama deterministik kipte. Tarayıcı: makinedeki Edge, headless — Playwright
   (`channel="msedge"`) veya `msedge --headless=new --screenshot`. **Ayrı ve geçici bir
   `--user-data-dir` şarttır**; yoksa çağrı açık Edge'e devredilir ve görüntü üretmez. Tarayıcı
   koşunun sonunda kapanır. Görüntüler repo dışında geçici bir dizinde.
2. **SHIP sayfası** — ana oturum hazırlar (read-only reviewer'ın tasarıma erişimi yoktur):
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
- Segment komutları (`/analyze`, `/new-feature`, `/plan`, `/build`, `/verify`) UI spec'lerinde
  bu dosyaya işaret eder.

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
