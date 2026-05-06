# BudgetAssist — Test Durumları

**Versiyon:** 1.0.0  
**Tarih:** 2026-05-06

**Durum Açıklamaları:**  
- Bekliyor — Henüz çalıştırılmadı  
- Geçti — Test başarılı  
- Kaldı — Test başarısız  
- Atlandı — Kapsam dışı

---

## Kimlik Doğrulama (Auth)

| ID | Senaryo | Adımlar | Beklenen Sonuç | Öncelik | Durum |
|----|---------|---------|----------------|---------|-------|
| TC-01 | Geçerli e-posta ile kayıt | 1. Kayıt formunu aç 2. Geçerli e-posta ve şifre gir 3. Kayıt ol'a tıkla | Kullanıcı oluşturulur, doğrulama e-postası gönderilir | Yüksek | Bekliyor |
| TC-02 | Geçersiz e-posta ile kayıt | 1. E-posta alanına "geçersiz" yaz 2. Kayıt ol'a tıkla | Hata mesajı gösterilir | Yüksek | Bekliyor |
| TC-03 | Doğru bilgilerle giriş | 1. E-posta ve şifre gir 2. Giriş yap | Dashboard yüklenir | Yüksek | Bekliyor |
| TC-04 | Yanlış şifre ile giriş | 1. Doğru e-posta, yanlış şifre gir 2. Giriş yap | "Geçersiz kimlik bilgileri" hatası | Yüksek | Bekliyor |
| TC-05 | Çıkış yapma | 1. Oturum açık iken çıkış yap | Giriş ekranına yönlendirilir | Yüksek | Bekliyor |

---

## İşlem Yönetimi (Transactions)

| ID | Senaryo | Adımlar | Beklenen Sonuç | Öncelik | Durum |
|----|---------|---------|----------------|---------|-------|
| TC-06 | Gider işlemi ekleme | 1. İşlemler sayfasına git 2. "+" butonuna tıkla 3. Gider seç, tutar ve kategori gir 4. Kaydet | İşlem listede görünür, bütçe güncellenir | Yüksek | Bekliyor |
| TC-07 | Gelir işlemi ekleme | 1. "+" butonuna tıkla 2. Gelir seç, tutar gir 3. Kaydet | İşlem listede görünür, toplam gelir artar | Yüksek | Bekliyor |
| TC-08 | İşlem düzenleme | 1. Mevcut işleme tıkla 2. Tutarı değiştir 3. Kaydet | Değişiklik anında yansır | Orta | Bekliyor |
| TC-09 | İşlem silme | 1. İşleme tıkla 2. Sil butonuna bas 3. Onayla | İşlem listeden kalkar, toplamlar güncellenir | Orta | Bekliyor |
| TC-10 | Geçmiş ay işlemi ekleme | 1. Tarih seçicide geçmiş ay seç 2. İşlem ekle | İşlem doğru aya atanır, o ayın raporu güncellenir | Orta | Bekliyor |

---

## Kategori Yönetimi (Categories)

| ID | Senaryo | Adımlar | Beklenen Sonuç | Öncelik | Durum |
|----|---------|---------|----------------|---------|-------|
| TC-11 | Yeni kategori oluşturma | 1. Kategoriler sayfasına git 2. Yeni kategori ekle 3. İsim, renk, bütçe gir 4. Kaydet | Kategori listede görünür | Yüksek | Bekliyor |
| TC-12 | Bütçe sınırı belirleme | 1. Mevcut kategoriye bütçe gir 2. O kategoride harcama yap | Dashboard'da bütçe kullanım yüzdesi güncellenir | Yüksek | Bekliyor |
| TC-13 | Kategori arşivleme | 1. Kategoriyi arşivle | Kategori listeden kaybolur, işlem ekleme formunda görünmez | Orta | Bekliyor |

---

## Finansal Hedefler (Goals)

| ID | Senaryo | Adımlar | Beklenen Sonuç | Öncelik | Durum |
|----|---------|---------|----------------|---------|-------|
| TC-14 | Yeni hedef oluşturma | 1. Hedefler sayfasına git 2. Hedef ekle 3. İsim, tutar, tarih gir 4. Kaydet | Hedef kartı görünür, ilerleme %0 | Yüksek | Bekliyor |
| TC-15 | Hedefe katkı ekleme | 1. Hedef kartına tıkla 2. Katkı ekle | İlerleme yüzdesi güncellenir | Orta | Bekliyor |
| TC-16 | %100 tamamlanan hedef | 1. Hedefi tam olarak tamamla | Tebrik mesajı gösterilir | Orta | Bekliyor |

---

## Bildirim Sistemi (Notifications)

| ID | Senaryo | Adımlar | Beklenen Sonuç | Öncelik | Durum |
|----|---------|---------|----------------|---------|-------|
| TC-17 | Negatif nakit akışı uyarısı | 1. Gelirden fazla gider ekle | Bildirim panelinde "danger" uyarı görünür | Yüksek | Bekliyor |
| TC-18 | Bütçe %80 uyarısı | 1. Bir kategoride bütçenin %80'ini harca | "warning" bildirimi görünür | Yüksek | Bekliyor |
| TC-19 | Bütçe aşıldı uyarısı | 1. Bütçeyi %100 aş | "danger" bildirimi görünür | Yüksek | Bekliyor |
| TC-20 | Hedef %90 bildirimi | 1. Hedefe %90 ulaş | "success" bildirimi görünür | Orta | Bekliyor |

---

## Raporlar (Reports)

| ID | Senaryo | Adımlar | Beklenen Sonuç | Öncelik | Durum |
|----|---------|---------|----------------|---------|-------|
| TC-21 | Aylık özet raporu | 1. Raporlar sayfasına git 2. Bu ayı seç | Gelir, gider, net tutar doğru gösterilir | Yüksek | Bekliyor |
| TC-22 | Kategori bazlı grafik | 1. Raporlar sayfasında pasta grafiğini incele | Kategoriler doğru yüzdelerle görünür | Orta | Bekliyor |
| TC-23 | Ay değiştirme | 1. Raporlarda önceki aya geç | Önceki ayın verileri yüklenir | Orta | Bekliyor |

---

## AI Coach

| ID | Senaryo | Adımlar | Beklenen Sonuç | Öncelik | Durum |
|----|---------|---------|----------------|---------|-------|
| TC-24 | Finansal analiz isteği | 1. AI Coach'a git 2. Analiz iste | 30 saniye içinde yanıt gelir | Orta | Bekliyor |
| TC-25 | Öneri kalitesi | 1. AI Coach yanıtını incele | Kullanıcının finansal verisine özel tavsiyeler içerir | Orta | Bekliyor |

---

## Fiş Tarama (Receipts)

| ID | Senaryo | Adımlar | Beklenen Sonuç | Öncelik | Durum |
|----|---------|---------|----------------|---------|-------|
| TC-26 | Fotoğraftan işlem ekleme | 1. Fiş sayfasına git 2. Fotoğraf yükle 3. Tara | Tutar ve tarih otomatik doldurulur | Orta | Bekliyor |
| TC-27 | Geçersiz dosya yükleme | 1. PDF/non-image yükle | Hata mesajı gösterilir | Düşük | Bekliyor |

---

## Kredi Kartı Takibi (Credit Cards)

| ID | Senaryo | Adımlar | Beklenen Sonuç | Öncelik | Durum |
|----|---------|---------|----------------|---------|-------|
| TC-28 | Yeni kart ekleme | 1. Kredi Kartları'na git 2. Kart ekle 3. Limit ve borç gir | Kart listede görünür, kullanım oranı hesaplanır | Orta | Bekliyor |
| TC-29 | Borç güncellemesi | 1. Mevcut kartın borcunu güncelle | Kullanım yüzdesi yeniden hesaplanır | Orta | Bekliyor |

---

## Admin Panel

| ID | Senaryo | Adımlar | Beklenen Sonuç | Öncelik | Durum |
|----|---------|---------|----------------|---------|-------|
| TC-30 | Admin erişim kontrolü | 1. Normal kullanıcıyla /admin'e git | Erişim engellenir veya "Yetkisiz" gösterilir | Yüksek | Bekliyor |
| TC-31 | Admin kullanıcı listesi | 1. Admin hesabıyla giriş yap 2. Admin Panel'e git | Tüm kullanıcılar listelenir | Düşük | Bekliyor |

---

## Performans

| ID | Senaryo | Araç | Hedef | Durum |
|----|---------|------|-------|-------|
| TC-32 | İlk yükleme süresi | Lighthouse | Performance ≥ 80 | Bekliyor |
| TC-33 | Erişilebilirlik skoru | Lighthouse | Accessibility ≥ 90 | Bekliyor |
| TC-34 | Bundle boyutu | Vite build çıktısı | Toplam JS < 1 MB | Bekliyor |
| TC-35 | Lazy load çalışması | DevTools Network | Dashboard dışı modüller başlangıçta yüklenmez | Bekliyor |

---

## Birim Test Özeti (Otomatik)

| Test Dosyası | Test Sayısı | Durum |
|---|---|---|
| `src/utils/__tests__/finance.test.js` | 26 | Otomatik çalışıyor |
| `src/utils/__tests__/helpers.test.js` | 15 | Otomatik çalışıyor |
| `src/components/notifications/Notifications.test.jsx` | 15 | Otomatik çalışıyor |
| **Toplam** | **56** | |
