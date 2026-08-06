const { expect } = require('@playwright/test');

class BasketPage {
    constructor(page) {
        this.page = page;
    }


    async addFirstProductToBasket() {
        const addToBasketBtn = this.page.locator('//*[@id="addToCartBtn"]').first();

        await expect(addToBasketBtn).toBeEnabled({ timeout: 15000 });

        await addToBasketBtn.evaluate((btn) => btn.click()).catch(async () => {
            await addToBasketBtn.click({ force: true });
        });

        try { await this.page.waitForLoadState('networkidle', { timeout: 3000 }); } catch (e) {}
    }

    async goToBasket() {
        await this.page.goto("https://www.e-bebek.com/cart", { waitUntil: 'domcontentloaded' });

        const cartItemsWrapper = this.page.locator('eb-cart-item').first();
        await cartItemsWrapper.waitFor({ state: 'visible', timeout: 15000 });
    }

    async increaseFirstProductQuantity() {
        await this.page.mouse.wheel(0, 300);

        const firstItem = this.page.locator('eb-cart-item').first();
        const plusBtn = firstItem.locator('eb-cart-item-quantity img').last();

        await plusBtn.waitFor({ state: 'visible', timeout: 10000 });
        await plusBtn.scrollIntoViewIfNeeded();

        const quantityElement = firstItem.locator('eb-cart-item-quantity span, input').filter({ hasText: /[0-9]/ }).first();
        const initialQuantityText = await quantityElement.innerText();

        await plusBtn.click({ force: true });

        await expect(async () => {
            const currentQuantity = await quantityElement.innerText();

            if (currentQuantity === initialQuantityText) {
                await plusBtn.click({ force: true, delay: 100 });
                throw new Error("Miktar güncellenmedi, retry tetikleniyor...");
            }
            expect(currentQuantity).not.toEqual(initialQuantityText);
        }).toPass({ timeout: 15000, intervals: [1000, 2000] });
    }

    async deleteSecondProduct() {
        const cartItems = this.page.locator('eb-cart-item');

        await expect(cartItems).toHaveCount(2, { timeout: 15000 });

        const secondProductDeleteBtn = cartItems.nth(1).locator('eb-cart-item-quantity img').first();
        await secondProductDeleteBtn.scrollIntoViewIfNeeded();
        await secondProductDeleteBtn.click({ force: true });

        const confirmDeleteBtn = this.page.locator('eb-remove-item-modal button').filter({ hasText: /Sil|Onayla/i }).first();

        await confirmDeleteBtn.waitFor({ state: 'visible', timeout: 10000 });
        await confirmDeleteBtn.click();

        await expect(cartItems).toHaveCount(1, { timeout: 15000 });
    }


    parsePrice(priceString) {
        if (!priceString) return 0;
        const match = priceString.match(/\d+(?:\.\d+)*,\d{2}/);
        if (match) {
            let cleanStr = match[0].replace(/\./g, '').replace(',', '.');
            return parseFloat(cleanStr);
        }
        let fallbackStr = priceString.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
        return parseFloat(fallbackStr);
    }

    async verifyBasketTotal() {
        const totalPriceLocator = this.page.locator('//*[@id="txtTotal"]').first();
        await totalPriceLocator.waitFor({ state: 'visible', timeout: 10000 });

        const firstCartItem = this.page.locator('eb-cart-item').first();
        const itemTotalLocator = firstCartItem.locator('text=/.*TL/').last();
        const itemTotalPrice = this.parsePrice(await itemTotalLocator.innerText());

        let shippingCost = 0;
        const shippingRow = this.page.locator('text="Kargo"').locator('..').first();

        if (await shippingRow.count() > 0) {
            const shippingText = await shippingRow.innerText();
            if (!shippingText.toLowerCase().includes('bedava') && !shippingText.includes('0,00')) {
                shippingCost = this.parsePrice(shippingText);
            }
        }

        const basketTotal = this.parsePrice(await totalPriceLocator.innerText());
        const expectedTotal = itemTotalPrice + shippingCost;

        const expectedFixed = parseFloat(expectedTotal.toFixed(2));
        const totalFixed = parseFloat(basketTotal.toFixed(2));

        console.log(`Ürün Satır Toplamı: ${itemTotalPrice} | Kargo: ${shippingCost} | Beklenen Toplam: ${expectedFixed} | Gerçekleşen Toplam: ${totalFixed}`);

        expect(totalFixed).toBe(expectedFixed);
    }

    async getFirstCartItemName() {
        const cartItemLocator = this.page.locator('eb-cart-item');

        await expect(cartItemLocator.first()).toBeVisible({ timeout: 15000 });

        const firstItem = cartItemLocator.first();
        await firstItem.scrollIntoViewIfNeeded();

        const productNameLocator = firstItem.locator('.product-name, a').first();
        await productNameLocator.waitFor({ state: 'attached', timeout: 10000 });

        const name = await productNameLocator.innerText();
        return name.trim();
    }
}

module.exports = BasketPage;