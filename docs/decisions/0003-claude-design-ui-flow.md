# ADR 0003 — UI tasarımı Claude Design ile, spec onayında kilitlenir

- Status: Accepted
- Date: 2026-11-09

## Context
ANEW-0008 kullanıcı deneyimini spec'e koyar (akış, durumlar, tasarım linki) ama tasarım aracı
entegrasyonunu **core için** reddeder: araca özgüdür ve şablonu şişirir. Leave Manager'da ise
tasarım bağlantısı opsiyonel kaldığı için VERIFY'daki ekran görüntüsü yalnızca metinle
karşılaştırılıyor ve görünüm her ekranda yeniden icat ediliyor. Ekip Claude Code kullanıyor ve
Claude'da Design (canvas) ve Design System artifact türleri mevcut. Standalone `claude.ai/design`
14 Aralık 2026'da kapanıyor. Karar spec 0001'de verildi.

## Decision
Bu proje için ANEW-0008'i genişletiyoruz: UI içeren her spec'in ekranları ve durumları, ANALYZE
içinde Claude'daki bir Design canvas'ında (spec başına bir canvas, ekran × durum başına bir
artboard) tasarlanır; spec onayı tasarımı da onaylar ve onay anındaki sürüm `spec-NNNN-vK`
etiketi ve sürüm kimliğiyle kilitlenir; BUILD onaylı sürümden yapılır; SHIP'te canvas'ın "SHIP"
sayfası tasarım ile uygulamanın ekran görüntüsünü yan yana gösterir. Kurallar
`workflows/ui-design.md`'de (araçtan bağımsız), Claude Design mekaniği Claude Code'un `/design`
komutunda yaşar. ANEW'in kendi kuralları (`workflows/segments.md`, `prompts/`,
`docs/decisions/anew/`) değişmez.

## Consequences
- Kazanılan: UI durumları plandan önce görsel olarak kararlaştırılır ve onaylanır; VERIFY'ın
  karşılaştıracağı sabit bir hedef olur; yeni kapı, rol veya segment eklenmez.
- Ödenen:
  - UI spec'lerinde ANALYZE uzar (tasarım hazır olmadan onay istenmez).
  - Eski bir sürüm araçla okunamaz; insan canvas'ın sürüm geçmişinden açar (spike 0001).
  - Tasarımlar ve SHIP görüntüleri hesapta private artifact olarak kalır; repoda iz yok
    (ANEW-0006), paylaşım canvas'ın Share menüsünden.
  - **Adaptör sapması** — şu dosyalar ANEW v1.24.1 şablonundan ayrışır, sürüm yükseltmede
    elle yeniden uygulanır: `.claude/commands/design.md` ve
    `.claude/commands/{analyze,new-feature,plan,build,verify}.md` (her biri hem kurulu kopya hem
    `adapters/claude-code/` kaynağı), `adapters/cursor/commands/design.md`,
    `adapters/github-copilot/prompts/design.prompt.md`, `adapters/codex/skills/design/` (iki
    dosya), `docs/commands.md` (`/design` bölümü ve satırı).
  - Otomasyon yalnızca Claude Code'da; diğer araçlar elle yolu izler.

## Alternatives considered
- **ANEW-0008 olduğu gibi (link opsiyonel)** — bugünkü sorunu çözmüyor.
- **Ayrı bir tasarım kapısı / tasarımcı rolü** — ANEW-0002 ve 0008'in reddettiği tören; spec
  onayı aynı işi görüyor.
- **Standalone `claude.ai/design` + DesignSync** — 14 Aralık 2026'da kapanıyor; DesignSync
  yalnızca o ürünün design-system projelerini senkronize eder.
- **Otomatik görsel diff** — ANEW görsel kaliteyi yargılayamaz; insanın yan yana bakışı ucuz ve yeterli.

## Revisit triggers
- Ekip Claude Code dışında bir araca geçerse (otomasyon taşınır veya elle yol esas olur).
- Platform eski sürümleri araçla okutmaya başlarsa (kilit kontrolü otomatikleşebilir).
- ANEW upstream'i tasarım entegrasyonu için bir mekanizma sunarsa (bu ADR onunla değiştirilir).
- Telefon genişliğinin doğrulanması gerekirse (bugün V1 dışı).
