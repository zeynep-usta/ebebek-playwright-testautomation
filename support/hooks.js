
const { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } = require('@cucumber/cucumber');

setDefaultTimeout(60 * 1000);
const { chromium } = require('playwright');

BeforeAll(async function () {

    global.browser = await chromium.launch({
        headless: false
    });
});

Before(async function () {
    this.context = await global.browser.newContext();
    await this.context.tracing.start({ screenshots: true, snapshots: true });
    this.page = await this.context.newPage();
});

After(async function (testCase) {
    if (testCase.result.status === Status.FAILED && this.page) {
        try {
            const screenshot = await this.page.screenshot({ fullPage: true });
            this.attach(screenshot, 'image/png');
            console.log(`📸 Hata yakalandı, ekran görüntüsü eklendi: ${testCase.pickle.name}`);
        } catch (error) {
            console.log("⚠️ Ekran görüntüsü alınamadı.");
        }
    }

    if (this.context) {
        try {
            const tracePath = `allure-results/trace-${testCase.pickle.name.replace(/\s+/g, '-')}.zip`;
            await this.context.tracing.stop({ path: tracePath });

            if (testCase.result.status === Status.FAILED) {
                this.attach(require('fs').readFileSync(tracePath), 'application/zip');
            }
        } catch (error) {}
    }

    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
});

AfterAll(async function () {
    if (global.browser) {
        await global.browser.close();
    }
});