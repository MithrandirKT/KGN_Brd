# KGN_BORDO / 2026

Türkiye'de özel sektör çalışanları için **2026 yılı bordro simülatörü**.

Brüt maaş, prim, yan hak ve teşvik bilgilerini girerek 12 aylık net maaş dökümünü, kesinti detaylarını, işveren maliyetini ve vergi dilimi dağılımını anında görebilirsiniz.

---

## Özellikler

- **12 aylık döküm** — prim, ikramiye, yemek, yol, fazla mesai dahil
- **Kümülatif GV takibi** — ay ay dilim geçiş uyarıları
- **SGK tavan kontrolü** — tavan aşan aylarda otomatik işaret
- **İşveren maliyet tablosu** — teşvik oranlarıyla (5 puan / 2 puan)
- **Vergi dilimi görselleştirmesi** — yıl sonu kümülatif matrah dağılımı
- **Kalem rehberi** — her bordro kaleminin SGK / GV / DV matrahına etkisi
- **Emekli (SGDP) desteği** — ayrı prim oranı

## 2026 Yasal Parametreleri

| Parametre | Değer |
|---|---|
| Asgari ücret brüt | 33.030 TL/ay |
| SGK tavan | 297.270 TL/ay |
| SGK işçi payı | %14 + %1 işsizlik |
| GV 1. dilim üst sınırı | 190.000 TL (kümülatif) |
| GV istisnası | 4.211,33 TL/ay |
| DV istisnası | 250,80 TL/ay |
| Damga vergisi oranı | ‰7,59 |
| Asgari ücret desteği (işveren) | 1.270 TL/ay |

---

## Kullanım

Tarayıcıda `index.html` dosyasını açın — sunucu gerekmez.

GİRİŞ sekmesine brüt maaşı girin; diğer tüm alanlar isteğe bağlıdır. Değerler her tuş basışında otomatik hesaplanır.

---

## Online Yayınlama (GitHub Pages)

1. Bu klasörü bir GitHub reposuna push edin
2. Repo **Settings → Pages → Branch: main / (root)** ayarını açın
3. `https://<kullanici>.github.io/<repo-adi>/` adresinde hemen yayına girer

Statik site olduğu için ek yapılandırma gerekmez.

---

## Proje Yapısı

```
kgn_brd/
├── index.html          # Ana sayfa (HTML şablonu)
├── css/
│   └── style.css       # Tüm stiller
└── js/
    ├── constants.js    # 2026 yasal sabitler ve statik veriler
    ├── calc.js         # Saf hesaplama fonksiyonları (DOM bağımsız)
    └── ui.js           # DOM başlatma, olaylar ve render fonksiyonları
```

---

## Yasal Uyarı

Bu araç yalnızca bilgilendirme amaçlıdır. Resmi bordro, vergi beyannamesi veya hukuki danışmanlık niteliği taşımaz. Kesin hesaplamalar için mali müşavirinize danışın.
