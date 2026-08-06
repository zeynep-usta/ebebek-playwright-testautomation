class HomePage {
    constructor(page) {
        this.page = page;
        this.lastSearchedKeyword = "";

        this.searchInput = page.locator('cx-searchbox input, input#txtSearchBox').first();
        this.productCard = page.locator('cx-product-list-item, .product-item, app-product-list-item').first();
    }

    async stabilizeUI(ms) {
        await this.page.evaluate((time) => {
            return new Promise(resolve => setTimeout(resolve, time));
        }, ms);
    }

    async navigate() {
        const baseUrl = process.env.BASE_URL || 'https://www.e-bebek.com';
        await this.page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
        console.log(`Anasayfaya gidildi: ${baseUrl}`);
        await this.clearGlobalPopups();
    }

    async clearGlobalPopups() {
        await this.page.addStyleTag({
            content: `
                iframe,
                .ins-preview-wrapper,
                .whatsapp-widget,
                [class*="whatsapp"],
                [id^="ins-"]
                { display: none !important; pointer-events: none !important; opacity: 0 !important; z-index: -9999 !important; }
            `
        });

        try {
            const popupCloseButton = this.page.locator('.ins-close-button, .close-popup, button.close, [aria-label="Close"], text="Vazgeç"').first();
            if (await popupCloseButton.isVisible()) {
                await popupCloseButton.click();
            }
        } catch (e) {

        }
    }


    async searchForProduct(keyword) {
        this.lastSearchedKeyword = keyword;

        const searchInput = this.page.locator('cx-searchbox input, input#txtSearchBox').first();

        await searchInput.click({ force: true });

        await this.stabilizeUI(2000);

        const activeInput = this.page.locator('cx-searchbox input, input#txtSearchBox').last();

        await activeInput.fill('');
        await activeInput.pressSequentially(keyword, { delay: 100 });

        await this.stabilizeUI(500);

        await this.page.keyboard.press('Enter');

        await this.stabilizeUI(2000);
    }

    async verifySearchResults(expectedState) {
        if (expectedState === 'SONUCLARI_GOR') {
            await this.productCard.waitFor({ state: 'visible', timeout: 20000 });
            console.log(`Doğrulama Başarılı: '${this.lastSearchedKeyword}' için ürünler listelendi.`);

        } else if (expectedState === 'BULUNAMADI') {
            await this.productCard.waitFor({ state: 'visible', timeout: 20000 });

            const firstProductText = await this.productCard.innerText();

            if (firstProductText.toLowerCase().includes(this.lastSearchedKeyword.toLowerCase())) {
                throw new Error(`Kritik Hata: Geçersiz kelime aranmasına rağmen sistem eşleşen ürün getirdi!`);
            } else {
                console.log(`Doğrulama Başarılı: Ekrana yedek ürünler geldi ama ürün metni aranan saçma kelimeyle (${this.lastSearchedKeyword}) tamamen alakasız.`);
            }

        } else {
            throw new Error(`Geçersiz beklenen_durum: ${expectedState}`);
        }
    }
}

module.exports = HomePage;