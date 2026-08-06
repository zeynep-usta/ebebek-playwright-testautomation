# ErikLabs - E-Bebek Uçtan Uca Web Test Otomasyonu

Bu proje, E-bebek web sitesi üzerinde kullanıcı ve sepet akışlarını uçtan uca (E2E) test eden bir otomasyon projesidir. Playwright, Cucumber (BDD) ve Page Object Model (POM) mimarisi kullanılarak geliştirilmiştir.

## 🚀 Kullanılan Teknolojiler
* **Dil:** JavaScript (Node.js)
* **Test Aracı:** Playwright
* **BDD Framework:** Cucumber.js
* **Raporlama:** Allure Reporter

## ⚙️ Kurulum ve Çalıştırma

**1. Bağımlılıkları Yükleyin:**
\`\`\`bash
npm install
\`\`\`

**2. Çevre Değişkenlerini (Environment Variables) Ayarlayın:**
Proje kök dizininde bir `.env` dosyası oluşturun ve aşağıdaki bilgileri kendi verilerinizle doldurun:
\`\`\`text
BASE_URL=https://www.e-bebek.com
VALID_EMAIL=gecerli_eposta
VALID_PASSWORD=sifre
\`\`\`

**3. Testleri Koşturma:**
* Normal koşum için: `npm run test`
* **Paralel koşum (2 Worker) için:** `npm run test:parallel`
* Belirli bir senaryoyu (Tag) koşmak için: `npx cucumber-js --tags "@basket"`

**4. Raporu Görüntüleme:**
\`\`\`bash
npm run report
\`\`\`

## 🏗️ Mimari ve Teknik Kararlar

### Test İzolasyonu (Test Isolation)
Senaryoların paralel koşumda birbirini etkilememesi ve veri sızıntısı yaşanmaması için Playwright'ın `BrowserContext` yapısı kullanılmıştır. `hooks.js` dosyasındaki `Before` adımı sayesinde, her senaryo yepyeni ve çerezsiz bir bağlamda başlatılır. Tarayıcı  performans optimizasyonu için `BeforeAll` ile sadece bir kez ayağa kaldırılır.

### Kararsız (Flaky) Durumların Çözümü ve Bekleme Stratejisi
Projede kesinlikle `waitForTimeout` (statik sleep) kullanılmamıştır. Bunun yerine dinamik beklemeler tercih edilmiştir.
* **Race Condition (Yönlendirme) Çözümü:** Giriş (Login) senaryosunda, UI elementlerinin hızlı yüklenmesinden kaynaklı "sahte başarı" (false-positive) durumlarını engellemek için, sadece elementin görünürlüğü değil, sistemin gerçekten `/login` URL'sinden çıkıp çıkmadığı regex ile doğrulanmıştır (`not.toHaveURL`).
* **Dinamik Sepet Beklemesi:** Sepette miktar artırma işleminde yaşanabilecek API veya UI gecikmelerine karşı Playwright'ın `toPass()` retry mekanizması kullanılarak arayüz stabil hale getirilmiştir.