# Domain

> Bootstrap 2026-11-09'da dolduruldu. İş, insan ve agent arasındaki ortak dil. Burada olmayan
> bir terim için AI kendi anlamını uydurur — yeni terim önce buraya eklenir.

## Ubiquitous language

| Term | Meaning | Notes / not to be confused with |
|---|---|---|
| Çalışan (`Employee`) | Sistemde izin talebi açan kişi | Her kullanıcı bir çalışandır; yönetici ve İK da kendi adına talep açar |
| Yönetici (`Manager`) | Bir çalışanın kayıtlı **tek** onaylayıcısı | Rol değil, ilişki: doğrudan bağlı çalışanı olan çalışan |
| İK (`HR`) | İzin türlerini, resmi tatilleri ve hak edişleri tanımlayan rol | Yöneticisi olmayan çalışanın talebini de İK onaylar (BR-4) |
| İzin türü (`LeaveType`) | Yıllık, ücretsiz, mazeret… | Her türün "bakiyeden düşer mi" bayrağı vardır |
| İzin talebi (`LeaveRequest`) | Bir çalışanın belirli bir tarih aralığı için açtığı talep | Tarihler gün bazındadır, saat yoktur |
| Talep durumu (`LeaveRequestStatus`) | `Pending` → `Approved` / `Rejected` / `Cancelled` | "Aktif talep" = `Pending` veya `Approved` |
| Hak ediş (`Entitlement`) | Bir çalışanın bir yıl ve bir izin türü için hakkı olan gün sayısı | İK yıllık girer (BR-9); bakiye değildir |
| Bakiye (`LeaveBalance`) | Hak ediş − onaylanmış izinler − bekleyen izinler | Saklanmaz, her seferinde hesaplanır |
| İş günü (`WorkingDay`) | Hafta sonu (Cumartesi, Pazar) ve resmi tatil olmayan gün | İzin süresi iş günüyle sayılır |
| Resmi tatil (`PublicHoliday`) | İK'nın yıl bazında tanımladığı tatil günü | Hafta sonuna denk gelse de iş günü sayısını iki kez düşürmez |
| Denetim kaydı (`AuditEntry`) | Bir talebin her durum değişikliğinin kaydı: kim, ne zaman, hangi geçiş | Bellekte tutulur, yeniden başlatmada silinir (ADR-0002) |

## Business rules
- **BR-1:** İzin süresi iş günü olarak hesaplanır; hafta sonu ve resmi tatiller sayılmaz.
- **BR-2:** Bakiyeden düşen bir türde talep, kalan bakiyeyi aşamaz; bekleyen (`Pending`) talepler
  de hesaba katılır.
- **BR-3:** Bir çalışanın tarihleri çakışan iki aktif (`Pending` veya `Approved`) talebi olamaz.
- **BR-4:** Talebi yalnızca çalışanın kayıtlı yöneticisi onaylar veya reddeder; yöneticisi
  olmayan çalışanın talebini İK onaylar veya reddeder.
- **BR-5:** Kimse kendi talebini onaylayamaz.
- **BR-6:** Red gerekçesi zorunludur.
- **BR-7:** Çalışan yalnızca `Pending` durumdaki kendi talebini iptal edebilir.
- **BR-8:** Bitiş tarihi başlangıç tarihinden önce olamaz; başlangıç tarihi bugünden (Europe/Istanbul)
  önce olamaz.
- **BR-9:** Hak edişleri İK yıllık olarak, çalışan ve izin türü bazında girer.
- **BR-10:** Bir talep tek bir takvim yılı içinde kalır; yıl sınırını aşan izin iki ayrı talep
  olarak açılır.

## Key domain invariants
- Bakiyeden düşen türlerde bakiye **hiçbir zaman negatif olmaz**.
- `Approved`, `Rejected` veya `Cancelled` olmuş bir talep bir daha değişmez (son durumlardır).
- Her durum değişikliği denetim kaydına yazılır: kim, ne zaman (UTC), hangi geçiş.

## Sensitive areas
Bir spec bunlardan birine dokunuyorsa Constraints bölümünde `Sensitive area: <ad>` yazar; o
spec'te clarify kapısı lite'ta da sorulur, belge dışı her fix turu yeniden review'dan geçer ve
her kriter bir kasıtlı bozmayla kırmızı kanıtlanır (`workflows/README.md`, Modes).

| Area | Kapsam | Neden hassas |
|---|---|---|
| **Yetkilendirme** | BR-4, BR-5, rol kontrolleri, kim kimin talebini görür/onaylar | Hata = kendi veya başkasının iznini onaylayabilmek (erişim kaybı) |
| **Bakiye hesabı** | BR-1, BR-2, BR-9, BR-10, negatif bakiye değişmezi, iş günü / resmi tatil hesabı; hesaba giren İK tanımları | Yıllık izin yasal haktır (4857 md. 53–56); hata = yasal risk, ileride bordro etkisi |
| **Kişisel veri (KVKK)** | Çalışan bilgisi, talep açıklamaları, denetim kaydı, görünürlük, log içeriği | Açıklamaya sağlık bilgisi yazılabilir — KVKK md. 6 özel nitelikli veri |

Hassas değil: yalnızca İK'nın tanım CRUD ekranları (hesaba girdikleri anda Bakiye hesabıdır) ve
salt okuma raporlar (kişisel veri gösteriyorsa KVKK'dır).
