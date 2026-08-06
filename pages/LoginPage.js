const { expect } = require('@playwright/test');

class LoginPage {
    constructor(page) {
        this.page = page;
        this.loginUrl = `${process.env.BASE_URL || 'https://www.e-bebek.com'}/login`;
    }

  async closePopupIfPresent() {
          try {
               const popupContainer = this.page.locator('.ins-preview-wrapper, .campaign-modal, .wis-background, [class*="overlay"]').first();
              await popupContainer.waitFor({ state: 'visible', timeout: 4000 });
              console.log("Bilgi: Ekranda pop-up algılandı, güvenli kapatma manevrası uygulanıyor...");

              await this.page.keyboard.press('Escape');
              if (await popupContainer.isVisible()) {
                  await this.page.mouse.click(5, 5);
              }

              console.log("Bilgi: Pop-up başarıyla atlatıldı, teste devam ediliyor.");
          } catch (error) {

          }
      }

    async clearPopups() {
        await this.page.addStyleTag({
            content: `
                [class*="ins-preview-wrapper"],
                [id^="ins-"],
                .campaign-modal,
                .wis-background,
                [class*="overlay"]
                { display: none !important; pointer-events: none !important; opacity: 0 !important; z-index: -9999 !important; }
            `
        });
    }

    async loginWithValidCredentials(email, password) {
        await this.enterCredentialsAndSubmit(email, password);

        console.log("Bilgi: Giriş butonuna tıklandı, sunucudan oturum onayı bekleniyor...");

        try {
            await expect(this.page).not.toHaveURL(/.*login.*/, { timeout: 15000 });
            console.log("Başarılı: Sayfa yönlendirildi, giriş işlemi tamamen tescillendi.");
        } catch (error) {
            throw new Error("KRİTİK HATA: Butona tıklandı ama E-bebek girişi kabul etmedi. Lütfen manuel olarak bilgileri kontrol et.");
        }
    }

    async enterCredentialsAndSubmit(email, password) {
            const safeEmail = email || "";
            const safePassword = password || "";

            await this.page.route('**/*insider*/**', route => route.abort());
            await this.page.route('**/*kampanya*/**', route => route.abort());
            await this.page.route('**/*wisepops*/**', route => route.abort());
            await this.page.route('**/*popup*/**', route => route.abort());

            if (!this.page.url().includes('login')) {
                await this.page.goto(this.loginUrl, { waitUntil: 'domcontentloaded' });
            }

            await this.page.addStyleTag({
                content: `[class*="ins-preview"], [class*="overlay"], .campaign-modal { display: none !important; pointer-events: none !important; z-index: -9999 !important; }`
            });

            const emailTab = this.page.locator('text="E-posta"').filter({ state: 'visible' }).first();
            await emailTab.click({ force: true });

            const emailInput = this.page.locator('input[placeholder*="E-posta"]').or(this.page.locator('input[type="email"]')).filter({ state: 'visible' }).first();

            await emailInput.evaluate(node => { node.focus(); node.value = ''; });

            if (safeEmail !== "") {
                await emailInput.pressSequentially(safeEmail, { delay: 50 });
            }

            const firstStepButton = this.page.locator('button:has-text("Giriş Yap / Hesap Oluştur")').filter({ state: 'visible' }).first();
            await firstStepButton.click({ force: true });

            try {
                const passwordInput = this.page.getByPlaceholder('Şifre').or(this.page.locator('input[type="password"]')).first();
                await passwordInput.waitFor({ state: 'visible', timeout: 5000 });

                await passwordInput.evaluate(node => { node.focus(); node.value = ''; });
                if (safePassword !== "") {
                    await passwordInput.pressSequentially(safePassword, { delay: 50 });
                }

                const finalLoginButton = this.page.getByRole('button', { name: 'Giriş Yap', exact: true }).filter({ state: 'visible' }).first();
                await finalLoginButton.click({ force: true });

            } catch (error) {
                console.log(`Bilgi: Şifre ekranı veya butonu bulunamadı, doğrulama ilk ekrandan yapılacak.`);
            }
        }

    async verifyProfilePage() {
        const profileIndicator = this.page.locator('#lnkOrderHistoryNavNode')
                                     .or(this.page.locator('text="Siparişlerim"'))
                                     .or(this.page.locator('text="Hesabım"'))
                                     .first();

        await profileIndicator.waitFor({ state: 'attached', timeout: 10000 });
        console.log("Doğrulama Başarılı: Profil elementi DOM üzerinde bulundu.");
    }

    async verifyLoginAttemptResult(expectedMessage) {
        if (expectedMessage === "YENI_UYELIK_SAYFASI") {
            await expect(this.page).toHaveURL(/.*(register|kayit).*/, { timeout: 15000 });
            console.log("Doğrulama Başarılı: 'Hesap Oluştur' ekranına yönlendirildi.");
            return;
        }

        try {
            await expect(this.page.locator('body')).toContainText(expectedMessage, { ignoreCase: true, timeout: 15000 });
            console.log(`Doğrulama Başarılı: '${expectedMessage}' metni sayfada yakalandı.`);
        } catch (error) {
            throw new Error(`KRİTİK HATA: '${expectedMessage}' mesajı ekranda bulunamadı!`);
        }
    }


    async performLogout() {
        await this.page.goto('https://www.e-bebek.com/my-account/update-profile', { waitUntil: 'domcontentloaded' });
        const logoutBtn = this.page.locator('text="Çıkış Yap"').or(this.page.locator('text="Çıkış"')).last();
        await logoutBtn.waitFor({ state: 'attached', timeout: 15000 });
        await logoutBtn.scrollIntoViewIfNeeded();
        await logoutBtn.click({ force: true });
        await expect(this.page).not.toHaveURL(/.*update-profile.*/, { timeout: 15000 });
    }

    async verifyGuestState() {
        const loginLink = this.page.locator('a[href*="/login"]').first();

        await loginLink.waitFor({ state: 'attached', timeout: 15000 });
        console.log("Doğrulama Başarılı: Sayfada '/login' linki tespit edildi, sistem misafir durumuna döndü.");
    }

    async verifyUnauthorizedAccessBlocked() {
        await this.page.goto('https://www.e-bebek.com/my-account/update-profile', { waitUntil: 'domcontentloaded' });

        await expect(this.page).toHaveURL(/.*login.*/, { timeout: 15000 });
        console.log("Güvenlik Doğrulandı: Oturum tamamen kapandı ve yetkisiz erişim engellendi.");
    }
}

module.exports = LoginPage;