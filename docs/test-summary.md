# BudgetAssist — Test Özet Raporu

**Versiyon:** 1.0.0  
**Test Dönemi:** ___________  
**Rapor Tarihi:** ___________  
**Hazırlayan:** ___________

---

## Yönetici Özeti

> Bu bölüm testler tamamlandıktan sonra doldurulacaktır.

Genel değerlendirme: ___________

---

## 1. Otomatik Birim Test Sonuçları

Çalıştırma komutu: `npm run test:run`

| Test Dosyası | Toplam | Geçti | Kaldı | Atlandı |
|---|---|---|---|---|
| `finance.test.js` | 26 | | | |
| `helpers.test.js` | 15 | | | |
| `Notifications.test.jsx` | 15 | | | |
| **Toplam** | **56** | | | |

**Coverage Raporu** (`npm run test:coverage`):

| Metrik | Hedef | Gerçekleşen |
|--------|-------|-------------|
| Satır coverage | ≥ %60 | |
| Fonksiyon coverage | ≥ %60 | |

CI Pipeline durumu: [ ] Geçti  [ ] Kaldı

---

## 2. Manuel Test Sonuçları

| Test ID | Senaryo | Sonuç | Bulunan Hata |
|---------|---------|-------|--------------|
| TC-01 | Geçerli e-posta ile kayıt | | |
| TC-02 | Geçersiz e-posta ile kayıt | | |
| TC-03 | Doğru bilgilerle giriş | | |
| TC-04 | Yanlış şifre ile giriş | | |
| TC-05 | Çıkış yapma | | |
| TC-06 | Gider işlemi ekleme | | |
| TC-07 | Gelir işlemi ekleme | | |
| TC-08 | İşlem düzenleme | | |
| TC-09 | İşlem silme | | |
| TC-10 | Geçmiş ay işlemi ekleme | | |
| TC-11 | Yeni kategori oluşturma | | |
| TC-12 | Bütçe sınırı belirleme | | |
| TC-13 | Kategori arşivleme | | |
| TC-14 | Yeni hedef oluşturma | | |
| TC-15 | Hedefe katkı ekleme | | |
| TC-16 | %100 tamamlanan hedef | | |
| TC-17 | Negatif nakit akışı uyarısı | | |
| TC-18 | Bütçe %80 uyarısı | | |
| TC-19 | Bütçe aşıldı uyarısı | | |
| TC-20 | Hedef %90 bildirimi | | |
| TC-21 | Aylık özet raporu | | |
| TC-22 | Kategori bazlı grafik | | |
| TC-23 | Ay değiştirme | | |
| TC-24 | AI Coach analiz isteği | | |
| TC-25 | AI Coach öneri kalitesi | | |
| TC-26 | Fotoğraftan işlem ekleme | | |
| TC-27 | Geçersiz dosya yükleme | | |
| TC-28 | Yeni kart ekleme | | |
| TC-29 | Borç güncellemesi | | |
| TC-30 | Admin erişim kontrolü | | |
| TC-31 | Admin kullanıcı listesi | | |

**Manuel Test Özeti:**

| Toplam | Geçti | Kaldı | Atlandı |
|--------|-------|-------|---------|
| 31 | | | |

---

## 3. Performans Test Sonuçları

Test ortamı: `npm run dev` → `http://localhost:5173`  
Araç: Google Lighthouse

| Metrik | Hedef | Gerçekleşen | Durum |
|--------|-------|-------------|-------|
| Performance | ≥ 80 | | |
| Accessibility | ≥ 90 | | |
| Best Practices | ≥ 90 | | |
| SEO | ≥ 80 | | |

Bundle boyutu (`npm run build`):

| Chunk | Boyut | Gzip |
|-------|-------|------|
| index.js | | |
| Toplam | | |

---

## 4. Bulunan Hatalar

| Hata ID | Açıklama | Test ID | Kritiklik | Durum |
|---------|----------|---------|-----------|-------|
| BUG-001 | | | | |
| BUG-002 | | | | |

> Hata bulunmadıysa: "Test sürecinde kritik hata bulunmadı."

---

## 5. Genel Değerlendirme

### Başarılar

- 
- 
- 

### Eksikler / İyileştirme Önerileri

- 
- 

### Sonuç

[ ] Uygulama yayına alınmaya hazır  
[ ] Küçük düzeltmelerle hazır olacak  
[ ] Önemli sorunlar giderilmeli  

---

## 6. Onaylar

| İsim (Büyük Harflerle) | Rol | İmza | Tarih |
|------------------------|-----|------|-------|
| | Geliştirici | | |
| | Test Mühendisi | | |
| | Öğretim Görevlisi | | |
