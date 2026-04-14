/**
 * constants.js
 * 2026 yılı yasal bordro parametreleri ve statik uygulama verileri.
 * Tüm sayısal sabitler burada tanımlanır — hesaplama mantığında magic number kullanılmaz.
 */

// Ay isimleri (0 = Ocak … 11 = Aralık)
const AY = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

// ── 2026 Gelir Vergisi dilimleri (GVK Md. 103, ücret gelirleri) ──────────────
// u: dilim üst sınırı (TL) | r: marjinal oran | v: önceki dilimlerden birikmiş vergi | o: alt sınır
const DILS = [
  { u: 190000,    r: 0.15, v: 0,        o: 0        },
  { u: 400000,    r: 0.20, v: 28500,    o: 190000   },
  { u: 1500000,   r: 0.27, v: 70500,    o: 400000   },
  { u: 5300000,   r: 0.35, v: 367500,   o: 1500000  },
  { u: Infinity,  r: 0.40, v: 1697500,  o: 5300000  },
];

// Dilim rozet CSS sınıfları, etiketleri ve renkleri (DILS ile indeks eşleşmeli)
const DTC = ['b1', 'b2', 'b3', 'b4', 'b5'];
const DTG = ['%15', '%20', '%27', '%35', '%40'];
const DCL = ['#16a34a', '#65a30d', '#d97706', '#dc2626', '#7c3aed'];

// ── Asgari Geçim İndirimi (TL/ay) ───────────────────────────────────────────
const AGI = {
  b:  1538.50,   // Bekâr
  e0: 1538.50,   // Evli — eş çalışıyor
  e1: 1777.49,   // Evli — eş çalışmıyor, 1 çocuk
  e2: 2016.48,   // Evli — eş çalışmıyor, 2 çocuk
  e3: 2255.47,   // Evli — eş çalışmıyor, 3+ çocuk
};

// ── 2026 Sabit yasal parametreler ────────────────────────────────────────────
const GVI  = 4211.33;   // GV istisnası — asgari ücret üzeri (TL/ay)
const DVI  = 250.80;    // DV istisnası — asgari ücret üzeri (TL/ay)
const DVR  = 0.00759;   // Damga vergisi oranı (‰7,59)
const STAV = 297270;    // SGK prime esas kazanç üst sınırı (TL/ay)
const AUD  = 1270;      // Asgari ücret desteği — işveren (TL/ay)
const ASG  = 33030;     // Asgari ücret brüt (TL/ay)

// ── Bordro Kalem Rehberi tablosu ─────────────────────────────────────────────
// Sütunlar: [Kalem adı, Grup, SGK matrah, GV matrah, DV matrah, Kural açıklaması, Özel kesintiye gider?]
const KAL = [
  ['Normal Çalışma',   'Kazanç',          'Evet',               'Evet',                'Evet',    'Brüt maaşın ana kalemi.',                                                           'Hayır'],
  ['Hafta Tatili',     'Kazanç',          'Evet',               'Evet',                'Evet',    'Haftalık dinlenme — bordrodan ayrı kalem gösterilir.',                              'Hayır'],
  ['Resmi Tatil',      'Kazanç',          'Evet',               'Evet',                'Evet',    'Tatil günü çalışıldıysa ödenir.',                                                  'Hayır'],
  ['Fazla Mesai',      'Ek Kazanç',       'Evet (tavana kadar)','Evet',                'Evet',    '%50 normal, %100 gece/HT. GV kümülatif matrahını artırır.',                        'Hayır'],
  ['İkramiye',         'Ek Kazanç',       'Evet (tavana kadar)','Evet',                'Evet',    'Her ay taksit dilim geçişini hızlandırır.',                                        'Hayır'],
  ['Satış Primi',      'Ek Kazanç',       'Evet (tavana kadar)','Evet',                'Evet',    'Büyük primler birden fazla dilim atlayabilir.',                                    'Hayır'],
  ['Yemek Kartı',      'Geçiş Yardımı',  'Sınırsız muaf',      '300 TL/gün muaf',    'Kısmi',   'SGK sınırsız muaf. GV: 300 TL/gün muaf. Aşan GV+DV tabidir.',                    'Evet'],
  ['Yemek Nakit',      'Geçiş Yardımı',  '158 TL/gün muaf',    '300 TL/gün muaf',    'Kısmi',   'Her iki limiti aşan kısım matrahlar dahildir.',                                   'Hayır'],
  ['Sağlık Sigortası', 'Geçiş Yardımı',  'Tam muaf',           'Tam muaf',            'Tam muaf','GVK 63/3. SGK+GV matrahından tamamen düşülür.',                                   'Evet'],
  ['Hediye Çeki',      'Geçiş Yardımı',  'Kısmi',              'Evet',                'Evet',    'GV ve DV matrahına girer. Net tutar özel kesintide geri alınır.',                  'Evet'],
  ['Yol (Ayni/Kart)',  'Geçiş Yardımı',  'Tam muaf',           '158 TL/gün muaf',    'Kısmi',   'SGK tam muaf. GV: günlük 158 TL muaf, aşan vergili.',                              'Hayır'],
  ['Yol Nakit',        'Ek Kazanç',       'Evet',               'Evet',                'Evet',    'Nakit yolda hiç istisna yoktur.',                                                  'Hayır'],
  ['Aile/Çocuk Zammı', 'Yan Hak',         '3.303 TL muaf',      'Evet (özel sektör)', 'Evet',    'SGK: asgari ücretin %10\'u muaf. GV: özel sektörde istisna yok.',                 'Hayır'],
  ['İş Göremezlik',    'Kesinti',         '—',                  '—',                  '—',       'SGK ödeneği mahsubu. Net ücretten düşülür.',                                      'Net kesinti'],
];
