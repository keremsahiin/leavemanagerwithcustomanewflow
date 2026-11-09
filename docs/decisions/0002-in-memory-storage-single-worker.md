# ADR 0002 — Bellek içi saklama, tek worker

- Status: Accepted
- Date: 2026-11-09

## Context
Bootstrap görüşmesinde veritabanı (SQLite / SQL Server) önerisi yerine ekip bellek içi çalışmayı
seçti. Bu, kalıcılığı olmayan bir sistem demektir; neden böyle olduğu ileride sorulacak.

## Decision
Tüm veri saf Python bellek içi depolarda (dict'ler), repository `Protocol`'lerinin arkasında
tutulur. Uygulama açılırken seed dosyasından yüklenir (çalışanlar, yönetici ilişkileri, izin
türleri, resmi tatiller, hak edişler). Durum değiştiren her servis çağrısı tek bir
`threading.Lock` altında çalışır. Uygulama **tek worker** ile çalışır (`uvicorn --workers 1`).

## Consequences
- Kazanılan: şema, migration ve veritabanı kurulumu yok; her test kendi boş deposuyla başlar
  (veri hijyeni kendiliğinden); tek kilit BR-2 ve BR-3'ü eşzamanlılıkta basitçe korur.
- Ödenen: **yeniden başlatmada talepler, onaylar ve denetim kaydı silinir** — sistem eğitim,
  demo ve prototip içindir, gerçek kullanım için değildir. Yatay ölçek yok (birden çok worker =
  birbirini görmeyen bellekler). Denetim kaydı kalıcı olmadığı için yasal kayıt yerine geçmez.

## Alternatives considered
- **SQLite** — kurulumsuz ve kalıcı; ekip bellek içini seçti.
- **SQL Server (LocalDB + pyodbc)** — şirket altyapısıyla uyumlu olabilir; testleri Windows'a
  veya servis container'ına bağlar.
- **SQLite `:memory:`** — yine kalıcılıksız, ama SQLAlchemy/şema yükü getirirdi.

## Revisit triggers
- Sistem gerçek izin verisiyle kullanılacaksa (kalıcılık zorunlu olur).
- Denetim kaydının yasal kayıt olarak saklanması istenirse (KVKK / iş hukuku).
- Birden çok worker veya sunucu gerekirse. Repository arayüzü sayesinde geçiş tek bir
  implementasyon değişikliğidir; iş kuralları ve servisler değişmez.
