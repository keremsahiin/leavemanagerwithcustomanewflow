# Architecture

> Bootstrap 2026-11-09'da dolduruldu. Agent'lar planlamadan önce bu dosyayı okur.

## System overview
Leave Manager, tek süreçte çalışan **katmanlı bir monolit**tir: bir FastAPI uygulaması hem JSON
API'yi (`/api/...`) hem de statik frontend'i (`frontend/`) sunar. Veri bellekte, bir repository
arayüzünün arkasında tutulur; uygulama yeniden başlatılınca seed verisine döner. Ölçek küçük
(onlarca–birkaç yüz kullanıcı), saklama bellek içi ve tek worker zorunlu — dağıtık bir mimari
yalnızca maliyet getirirdi. Gerekçe: [ADR-0001](decisions/0001-python-fastapi-layered-monolith.md),
[ADR-0002](decisions/0002-in-memory-storage-single-worker.md).

## Modules / components and ownership

| Module | Single responsibility | Owns |
|---|---|---|
| `app/domain/` | Varlıklar (dataclass), iş kuralları BR-1…BR-10, iş günü ve bakiye hesabı. Saf Python, yalnızca standart kütüphane. | İş kurallarının tek kaynağı |
| `app/services/` | Kullanım senaryoları: talep aç, onayla, reddet, iptal et, bakiye sorgula, İK tanımları. Yetki kontrolü ve yazma kilidi burada. | İşlem sınırı, denetim kaydının yazılması |
| `app/repositories/` | Repository `Protocol`'leri ve bellek içi implementasyonları | Bellekteki veri |
| `app/api/` | FastAPI router'ları, Pydantic istek/yanıt şemaları, oturumdaki kullanıcının çözümlenmesi, hata → HTTP eşlemesi | HTTP sözleşmesi (`/api/...`) |
| `app/main.py` | Composition root: `create_app(store, clock)` uygulamayı kurar, somut depoları bağlar, seed'i yükler, `frontend/`'i sunar | Wiring |
| `frontend/` | Statik HTML/CSS/vanilla JS (ES modules); tüm `fetch` çağrıları tek bir `api.js` modülünden geçer | Arayüz |

## Communication rules
- Yalnızca doğrudan fonksiyon çağrısı; olay (event) veya mesaj kuyruğu yok.
- Bağımlılık yönü tek yönlü: `api → services → domain`. `services` depolara yalnızca `Protocol`
  üzerinden erişir.
- Frontend sunucuyla yalnızca `/api` JSON uçları üzerinden konuşur; sunucu tarafı şablon yok.
- Yazma işlemleri (durum değiştiren her servis çağrısı) tek bir `threading.Lock` altında çalışır;
  BR-2 ve BR-3'ün eşzamanlı isteklerde korunması buna dayanır.
- Uygulama **tek worker** ile çalışır (`uvicorn --workers 1`); birden çok worker her biri ayrı
  bellek demektir (ADR-0002).

## Forbidden dependencies (make them testable)
import-linter sözleşmeleri (`pyproject.toml`) ile `scripts/check` içinde doğrulanır:
1. `app.domain` hiçbir şey import etmez: `app.services`, `app.repositories`, `app.api`,
   `fastapi`, `pydantic` yasak.
2. `app.services`, `app.api`'yi ve `fastapi`'yi import etmez; bellek içi implementasyonları
   import etmez, yalnızca repository `Protocol`'lerine bağlıdır.
3. `app.api`, `app.repositories`'i doğrudan import etmez; depoya yalnızca `app.services`
   üzerinden ulaşır.
4. Somut depoyu yalnızca `app.main` oluşturur.
5. Yetki kontrolü servis katmanında yapılır; router veya UI'daki kontrol ek bir katmandır, tek
   koruma değildir (servis ve API testleri ikisini de doğrular — `docs/testing.md`).

## Deliberately out of scope
- **Kalıcı saklama ve birden çok worker** — veri yeniden başlatmada silinir (ADR-0002).
- E-posta / bildirim gönderimi; LDAP/Active Directory entegrasyonu; mobil uygulama; dışa açık,
  versiyonlanmış bir API sözleşmesi.
- Alan özellikleri (ileride her biri ayrı spec): kıdeme göre otomatik hak ediş hesabı
  (4857 md. 53), yarım gün izin, devreden bakiye, onaylanmış iznin iptali, çok kademeli onay ve
  vekâlet, geriye dönük rapor (sağlık) izni.
