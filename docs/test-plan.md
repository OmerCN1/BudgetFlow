# BudgetAssist — Test Planı

**Ürün:** BudgetAssist — Kişisel Bütçe Yönetim Uygulaması  
**Hazırlayanlar:** Geliştirici Ekibi  
**Tarih:** 2026-05-06  
**Versiyon:** 1.0.0

---

## İçindekiler

1. [Giriş](#10-giriş)
2. [Hedefler ve Görevler](#20-hedefler-ve-görevler)
3. [Kapsam](#30-kapsam)
4. [Test Stratejisi](#40-test-stratejisi)
5. [Donanım Gereksinimleri](#50-donanım-gereksinimleri)
6. [Çevre Gereksinimleri](#60-çevre-gereksinimleri)
7. [Test Programı](#70-test-programı)
8. [Kontrol Prosedürleri](#80-kontrol-prosedürleri)
9. [Test Edilecek Özellikler](#90-test-edilecek-özellikler)
10. [Test Edilmeyen Özellikler](#100-test-edilmeyen-özellikler)
11. [Kaynaklar / Roller ve Sorumluluklar](#110-kaynaklar--roller-ve-sorumluluklar)
12. [Programlar](#120-programlar)
13. [Önemli Ölçüde Etkilenen Bölümler](#130-önemli-ölçüde-etkilenen-bölümler)
14. [Bağımlılıklar](#140-bağımlılıklar)
15. [Riskler / Varsayımlar](#150-riskler--varsayımlar)
16. [Araçlar](#160-araçlar)
17. [Onaylar](#170-onaylar)

---

## 1.0 Giriş

BudgetAssist, kullanıcıların gelir-gider takibi, bütçe yönetimi, finansal hedef belirleme ve kredi kartı takibi yapmasını sağlayan bir kişisel finans uygulamasıdır.

**Temel modüller:**

| Modül | Açıklama |
|-------|----------|
| Dashboard | Genel finansal özet, grafikler |
| Transactions | Gelir/gider işlem kaydı |
| Categories | Harcama kategorileri ve bütçe sınırları |
| Goals | Finansal hedef oluşturma ve takip |
| Reports | Aylık/dönemsel finansal raporlar |
| AI Coach | Yapay zeka destekli finansal danışmanlık |
| Receipts | Fiş/fatura fotoğrafı ile işlem ekleme |
| Credit Cards | Kredi kartı borç ve limit takibi |
| Assets | Yatırım ve varlık portföyü |
| Debt Tracker | Borç/alacak kaydı ve takibi |
| Admin Panel | Kullanıcı yönetimi, sistem sağlığı |
| Notifications | Bütçe uyarıları ve hatırlatmalar |

**Teknoloji yığını:** React 18, Vite, Supabase (PostgreSQL + Auth + Storage + Edge Functions), Recharts

---

## 2.0 Hedefler ve Görevler

### 2.1 Hedefler

- Uygulamanın tüm modüllerinin işlevsel doğruluğunu güvence altına almak
- Otomatik testlerle regresyon riskini minimize etmek
- Performans eşiklerini belirleyip ölçmek
- Kullanıcı kabul kriterleri karşılandığını belgelemek

### 2.2 Görevler

| Görev | Sorumlu | Durum |
|-------|---------|-------|
| Birim test yazımı | Geliştirici | Tamamlandı |
| Entegrasyon test senaryoları | Geliştirici | Dokümante edildi |
| CI pipeline kurulumu | Geliştirici | Tamamlandı |
| Performans raporu | Geliştirici | Bekliyor |
| Kullanıcı kabul testi | Test ekibi | Bekliyor |

---

## 3.0 Kapsam

**Genel:** Bu test planı BudgetAssist v1.0.0'ın tüm özelliklerini kapsar: kimlik doğrulama, CRUD işlemleri, bütçe hesaplamaları, bildirim sistemi, AI entegrasyonu ve admin paneli.

**Taktikler:**
- Utility fonksiyonlar için otomatik birim testler (Vitest)
- Kritik kullanıcı akışları için manuel test senaryoları (`docs/test-cases.md`)
- CI pipeline ile her push'ta testlerin otomatik çalıştırılması
- Lighthouse ile performans skorunun ölçülmesi

---

## 4.0 Test Stratejisi

### 4.1 Birim Testi (Alfa Testi)

**Tanım:** Her fonksiyonun izole olarak doğru çalıştığını, kenar durumları ve hata koşullarını doğru işlediğini doğrular.

**Katılımcılar:** Geliştirici ekibi

**Metodoloji:**
- **Framework:** Vitest v4.1.5 + jsdom ortamı
- **Kapsam hedefi:** `src/utils/**` kapsamında ≥%50 satır, ≥%45 fonksiyon coverage (`categorySuggestions.js` hariç)
- **Test dosyaları:**
  - `src/utils/__tests__/finance.test.js` — 26 test case
  - `src/utils/__tests__/helpers.test.js` — 15 test case
  - `src/components/notifications/Notifications.test.jsx` — 15 test case
  - **Toplam: 56 test case**
- **Çalıştırma:** `npm run test:run`
- **Coverage raporu:** `npm run test:coverage` → `coverage/index.html`

### 4.2 Sistem ve Entegrasyon Testi

**Tanım:** Modüllerin birbirleriyle ve Supabase backend'iyle doğru entegre olduğunu doğrular.

**Katılımcılar:** Geliştirici ekibi

**Metodoloji:**
- Supabase RLS (Row Level Security) politikaları `supabase/schema.sql` dosyasında tanımlı
- `supabase/verify_setup.sql` ile veritabanı şeması doğrulanır
- Edge function entegrasyonu (AI Coach, Receipt Scanner, Send Notifications) manuel test edilir
- Entegrasyon test senaryoları `docs/test-cases.md` dosyasında TC-10 ile TC-19 arasında belgelenmiştir

### 4.3 Performans ve Stres Testi

**Tanım:** Uygulamanın kabul edilebilir yükleme süreleri ve kaynak kullanımı içinde çalıştığını doğrular.

**Katılımcılar:** Geliştirici ekibi

**Metodoloji:**
- **Araç:** Google Lighthouse CLI
- **Çalıştırma:** `npx lighthouse http://localhost:5173 --output html --output-path ./docs/lighthouse-report.html`
- **Hedef skorlar:**

| Metrik | Hedef |
|--------|-------|
| Performance | ≥ 80 |
| Accessibility | ≥ 90 |
| Best Practices | ≥ 90 |
| SEO | ≥ 80 |

- **Bundle analizi:** Vite build çıktısı ile chunk boyutları kontrol edilir
- **Lazy loading:** Tüm ana modüller `React.lazy()` ile geç yüklenir (`src/App.jsx`)

### 4.4 Kullanıcı Kabul Testi

**Tanım:** Sistemin son kullanıcı gereksinimlerini karşıladığını doğrulamak için gerçek kullanıcı senaryolarıyla test edilmesidir.

**Katılımcılar:** Test ekibi (proje üyeleri, hocanın gözlemlemesi)

**Metodoloji:**
- `docs/test-cases.md` dosyasındaki senaryolar sırayla uygulanır
- Her senaryo için beklenen/gerçek sonuç karşılaştırması yapılır
- Bulunan hatalar `docs/test-summary.md`'e kaydedilir

### 4.5 Toplu Test

- Çok sayıda işlem verisiyle (50+ kayıt) sistemin davranışı test edilir
- Büyük veri setiyle rapor sayfasının doğru render edildiği doğrulanır

### 4.6 Otomatik Regresyon Testi

**Tanım:** Yeni değişikliklerin mevcut işlevselliği bozmadığını her push'ta otomatik doğrulama.

**Araç:** GitHub Actions (`.github/workflows/test.yml`)

**Akış:**
1. Push/Pull Request tetikler
2. `npm ci` ile bağımlılıklar kurulur
3. `npm run test:run` — tüm birim testler çalışır
4. `npm run test:coverage` — coverage raporu üretilir
5. `npm run build` — production build doğrulanır
6. Coverage raporu artifact olarak GitHub'a yüklenir

### 4.7 Beta Testi

- Deployment sonrası gerçek ortamda son kullanıcı geri bildirimi toplanır
- Vercel/Netlify üzerinde production build test edilir

---

## 5.0 Donanım Gereksinimleri

| Bileşen | Minimum | Önerilen |
|---------|---------|----------|
| İşlemci | Herhangi modern CPU | Intel i5 / Apple M1+ |
| RAM | 4 GB | 8 GB |
| İnternet | Gerekli (Supabase bağlantısı) | Geniş bant |
| Tarayıcı | Chrome 100+, Firefox 100+, Safari 15+ | Chrome güncel |

---

## 6.0 Çevre Gereksinimleri

### 6.1 Geliştirme Ortamı

| Bileşen | Versiyon |
|---------|----------|
| Node.js | 20.x |
| npm | 10.x |
| Vite | 8.x |
| Supabase CLI | Güncel |

**Ortam değişkenleri** (`.env.local`):
```
VITE_SUPABASE_URL=https://[proje-id].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[anahtar]
VITE_GROQ_API_KEY=[anahtar]
```

### 6.2 Test Ortamı

- Birim testler: Node.js + jsdom (tarayıcı gerektirmez)
- E2E / UAT: Chrome güncel sürüm
- CI: Ubuntu Latest (GitHub Actions)

---

## 7.0 Test Programı

| Aşama | Görev | Süre |
|-------|-------|------|
| Hafta 1 | Birim testler yazıldı | Tamamlandı |
| Hafta 1 | CI pipeline kuruldu | Tamamlandı |
| Hafta 2 | Entegrasyon test senaryoları | Devam ediyor |
| Hafta 2 | Performans raporu (Lighthouse) | Bekliyor |
| Hafta 3 | Kullanıcı kabul testleri | Bekliyor |
| Hafta 3 | Test özet raporu | Bekliyor |

---

## 8.0 Kontrol Prosedürleri

### Sorun Bildirme

Test sırasında bulunan hatalar şu şekilde kaydedilir:

1. `docs/test-summary.md` dosyasına hata ID, açıklama, adımlar ve beklenen/gerçek sonuç yazılır
2. GitHub Issues üzerinden takip edilir (varsa)
3. Kritiklik seviyesi belirlenir: **Kritik / Yüksek / Orta / Düşük**

### Değişiklik Talepleri

- Tüm değişiklikler Pull Request üzerinden yapılır
- CI pipeline geçmeden merge edilmez
- Test kapsamını düşüren değişiklikler reddedilir

---

## 9.0 Test Edilecek Özellikler

| Özellik | Test Türü | Öncelik |
|---------|-----------|---------|
| Kullanıcı kaydı / girişi | Manuel, Entegrasyon | Yüksek |
| İşlem ekleme/düzenleme/silme | Manuel | Yüksek |
| Kategori bütçe hesaplama | Birim | Yüksek |
| Finansal sağlık skoru | Birim | Yüksek |
| Bildirim sistemi | Birim | Yüksek |
| Hedef takibi | Birim, Manuel | Orta |
| Raporlar ve grafikler | Manuel | Orta |
| AI Coach yanıtları | Manuel, Entegrasyon | Orta |
| Fiş tarama | Manuel | Orta |
| Kredi kartı takibi | Manuel | Orta |
| Admin panel | Manuel | Düşük |
| Para birimi dönüşümü | Manuel | Düşük |

---

## 10.0 Test Edilmeyen Özellikler

| Özellik | Neden Test Edilmiyor |
|---------|---------------------|
| Supabase Auth iç mekanizması | Supabase tarafından yönetiliyor |
| Groq AI model çıktı kalitesi | Harici servis, kontrol dışı |
| E-posta / SMS gönderimi | Resend/Twilio harici servis |
| PostgreSQL sorgu planları | Supabase altyapısı yönetiyor |
| Tarayıcı uyumu (IE) | Desteklenmiyor |

---

## 11.0 Kaynaklar / Roller ve Sorumluluklar

| İsim | Rol | Sorumluluk |
|------|-----|------------|
| Geliştirici | Baş Geliştirici | Kod, birim testler, CI |
| Test Ekibi | Test Mühendisi | Manuel test senaryoları, UAT |
| Öğretim Görevlisi | Gözlemci | Sonuçların değerlendirilmesi |

---

## 12.0 Programlar

**Teslim Edilebilir Belgeler:**

- [x] `docs/test-plan.md` — Bu belge
- [x] `docs/test-cases.md` — Test senaryoları ve durumları
- [ ] `docs/test-summary.md` — Test özet raporu (testler tamamlandıktan sonra)
- [ ] `docs/lighthouse-report.html` — Performans raporu
- [x] `.github/workflows/test.yml` — CI pipeline
- [x] `coverage/index.html` — Coverage raporu (`npm run test:coverage` ile üretilir)

---

## 13.0 Önemli Ölçüde Etkilenen Bölümler

| Bölüm | Etki |
|-------|------|
| Finans hesaplamaları (`src/utils/finance.js`) | Yüksek — hatalı hesap doğrudan kullanıcıyı etkiler |
| Bildirim sistemi (`src/utils/notifications.js`) | Yüksek — yanlış uyarı kullanıcı güvenini sarsar |
| Supabase RLS politikaları | Yüksek — veri güvenliği |
| Admin Panel | Orta — sınırlı kullanıcı kitlesi |

---

## 14.0 Bağımlılıklar

| Bağımlılık | Açıklama | Risk |
|------------|----------|------|
| Supabase servisi | Tüm veri işlemleri için gerekli | Servis kesintisi testleri etkiler |
| Groq API | AI Coach için gerekli | API key olmadan test edilemez |
| Node.js 20 | Test ve build ortamı | Versiyon uyumsuzluğu |
| İnternet bağlantısı | Supabase ve harici API'lar | Offline test mümkün değil |

---

## 15.0 Riskler / Varsayımlar

| Risk | Olasılık | Acil Durum Planı |
|------|----------|-----------------|
| Supabase kesintisi | Düşük | Mock veri ile birim testler çalışmaya devam eder |
| API anahtarı süresi dolması | Orta | `.env.local` güncellenir |
| CI pipeline başarısız | Düşük | Lokal `npm run test:run` ile doğrulanır |
| Tarayıcı uyumluluk sorunu | Düşük | Chrome hedef tarayıcı olarak belirlendi |

---

## 16.0 Araçlar

| Araç | Amaç | Versiyon |
|------|------|----------|
| Vitest | Birim test framework | 4.1.5 |
| React Testing Library | Bileşen testi | 16.3.2 |
| @vitest/coverage-v8 | Coverage raporu | 4.1.5 |
| jsdom | Tarayıcı simülasyonu | 29.1.1 |
| GitHub Actions | CI/CD otomasyonu | - |
| Google Lighthouse | Performans analizi | CLI |
| Supabase CLI | Veritabanı yönetimi | Güncel |

---

## 17.0 Onaylar

| İsim (Büyük Harflerle) | Rol | İmza | Tarih |
|------------------------|-----|------|-------|
| | Geliştirici | | |
| | Test Mühendisi | | |
| | Öğretim Görevlisi | | |
