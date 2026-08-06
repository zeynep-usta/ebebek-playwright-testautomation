Feature: E-bebek Web Otomasyonu - Kullanıcı İşlemleri ve Sepet Akışı
  QA Automation Engineer Case Study değerlendirmesi için e-bebek web sitesi test senaryoları.

  @smoke @login
  Scenario: S1 - Geçerli Kullanıcı Bilgileri ile Başarılı Giriş
    Given Kullanıcı e-bebek anasayfasına gider
    When Kullanıcı geçerli kimlik bilgileri ile giriş yapar
    Then Başarılı giriş yapıldığı ve kullanıcıya özgü profil elementinin ekranda olduğu doğrulanır

  @negative @login
  Scenario Outline: S2 - Geçersiz ve eksik bilgilerle giriş yapılamamalı
    Given Kullanıcı e-bebek anasayfasına gider
    When Kullanıcı e-posta alanına "<email>" ve şifre alanına "<sifre>" yazarak giriş yapmayı dener
    Then Ekranda "<beklenen_mesaj>" uyarısının göründüğü veya ilgili yönlendirmenin yapıldığı doğrulanır
    Examples:
      | email                        | sifre       | beklenen_mesaj                          |
      | kullaniciyok@gmail.com       |             | YENI_UYELIK_SAYFASI                     |
      | zeynepozturkusta1@gmail.com  | YanlisSifre | Kullanıcı adı veya parolanız hatalıdır  |
      |                              |             | Bu alan gereklidir.                     |
      | zeynepozturkusta1@gmail.com  |             | Bu alan gereklidir.                     |

  @search
  Scenario Outline: S3 - Arama ve Sonuç Doğrulama
    Given Kullanıcı e-bebek anasayfasına gider
    When Arama çubuğuna "<aranan_kelime>" yazar ve aratır
    Then Arama sonuçlarında "<beklenen_durum>" görülmelidir
    Examples:
      | aranan_kelime | beklenen_durum |
      | bebekbezi     | SONUCLARI_GOR  |
      | asdfghjkl123  | BULUNAMADI     |

  @basket
  Scenario: S4 - Sepete farklı ürünler ekleme, miktar güncelleme, silme ve matematiksel fiyat doğrulaması
    Given Kullanıcı e-bebek anasayfasına gider
    When Arama çubuğuna "ıslak mendil" yazar ve aratır
    And Listelenen ilk ürün sepete eklenir
    And Arama çubuğuna "bebek bezi" yazar ve aratır
    And Listelenen ilk ürün sepete eklenir
    And Sepetim sayfasına gidilir
    And Sepetteki ilk ürünün adedi bir artırılır
    And Sepetteki ikinci ürün sepetten silinir
    Then Sepet ara toplamının doğru hesaplandığı doğrulanır

  @session
  Scenario: S5 - Misafir kullanıcının sepetinin giriş yaptıktan sonra korunması
    Given Kullanıcı e-bebek anasayfasına gider
    When Arama çubuğuna "ıslak mendil" yazar ve aratır
    And Listelenen ilk ürün sepete eklenir
    And Sepete gider ve ürün bilgisini hafızaya alır
    And Giriş yap butonuna tıklar
    And Kullanıcı geçerli kimlik bilgileri ile giriş yapar
    Then Sepetine gittiğinde hafızadaki ürünün korunduğunu doğrular

  @logout
  Scenario: S6 - Oturumun güvenli bir şekilde sonlandırılması
    Given Kullanıcı e-bebek anasayfasına gider
    When Kullanıcı geçerli kimlik bilgileri ile giriş yapar
    And Kullanıcı çıkış yap butonuna tıklar
    Then Oturumun kapandığını ve misafir durumuna dönüldüğünü doğrular
    And Profil sayfasına gitmeye çalıştığında giriş sayfasına yönlendirildiğini doğrular