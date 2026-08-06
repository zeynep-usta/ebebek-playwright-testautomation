const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
require('dotenv').config();

const HomePage = require('../pages/HomePage');
const LoginPage = require('../pages/LoginPage');
const BasketPage = require('../pages/BasketPage');

setDefaultTimeout(60000);

Given('Kullanıcı e-bebek anasayfasına gider', async function () {
    this.homePage = new HomePage(this.page);
    await this.homePage.navigate();
});

When('Kullanıcı geçerli kimlik bilgileri ile giriş yapar', async function () {
    if (!this.loginPage) this.loginPage = new LoginPage(this.page);
    await this.loginPage.loginWithValidCredentials(process.env.VALID_EMAIL, process.env.VALID_PASSWORD);
});

When('Arama çubuğuna {string} yazar ve aratır', async function (keyword) {
    if (!this.homePage) this.homePage = new HomePage(this.page);
    await this.homePage.searchForProduct(keyword);
});

When('Listelenen ilk ürün sepete eklenir', async function () {
    if (!this.basketPage) this.basketPage = new BasketPage(this.page);
    this.savedProductName = await this.basketPage.addFirstProductToBasket();
});


Then('Başarılı giriş yapıldığı ve kullanıcıya özgü profil elementinin ekranda olduğu doğrulanır', async function () {
    await this.loginPage.verifyProfilePage();
});

When('Kullanıcı e-posta alanına {string} ve şifre alanına {string} yazarak giriş yapmayı dener', async function (email, sifre) {
    if (!this.loginPage) this.loginPage = new LoginPage(this.page);
    await this.loginPage.enterCredentialsAndSubmit(email, sifre);
});

Then('Ekranda {string} uyarısının göründüğü veya ilgili yönlendirmenin yapıldığı doğrulanır', async function (beklenen_mesaj) {
    await this.loginPage.verifyLoginAttemptResult(beklenen_mesaj);
});


Then('Arama sonuçlarında {string} görülmelidir', async function (expectedState) {
    await this.homePage.verifySearchResults(expectedState);
});


When('Sepetim sayfasına gidilir', async function () {
    if (!this.basketPage) this.basketPage = new BasketPage(this.page);
    await this.basketPage.goToBasket();
});

When('Sepetteki ilk ürünün adedi bir artırılır', async function () {
    await this.basketPage.increaseFirstProductQuantity();
});

When('Sepetteki ikinci ürün sepetten silinir', async function () {
    await this.basketPage.deleteSecondProduct();
});

Then('Sepet ara toplamının doğru hesaplandığı doğrulanır', async function () {
    await this.basketPage.verifyBasketTotal();
});

When('Sepete gider ve ürün bilgisini hafızaya alır', async function () {
    if (!this.basketPage) this.basketPage = new BasketPage(this.page);
    await this.basketPage.goToBasket();
    this.savedProductName = await this.basketPage.getFirstCartItemName();
});

When('Giriş yap butonuna tıklar', async function () {
    await this.page.goto(process.env.BASE_URL + '/login', { waitUntil: 'domcontentloaded' });
});

Then('Sepetine gittiğinde hafızadaki ürünün korunduğunu doğrular', async function () {
    await this.basketPage.goToBasket();
    const currentProductName = await this.basketPage.getFirstCartItemName();
    expect(currentProductName).toContain(this.savedProductName);
});


When('Kullanıcı çıkış yap butonuna tıklar', async function () {
    await this.loginPage.performLogout();
});

Then('Oturumun kapandığını ve misafir durumuna dönüldüğünü doğrular', async function () {
    await this.loginPage.verifyGuestState();
});

Then('Profil sayfasına gitmeye çalıştığında giriş sayfasına yönlendirildiğini doğrular', async function () {
    await this.loginPage.verifyUnauthorizedAccessBlocked();
});