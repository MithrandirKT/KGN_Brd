/**
 * calc.js
 * Saf hesaplama fonksiyonları — DOM bağımlılığı yok.
 * constants.js'in yüklenmiş olmasını gerektirir.
 */

/**
 * Kümülatif gelir vergisi hesaplar (GVK Md. 103 tarifesi, 2026).
 * GV istisnası (GVI) uygulanmadan önceki brüt vergi miktarıdır.
 *
 * @param {number} m - Kümülatif GV matrahı (TL)
 * @returns {number} Toplam hesaplanan vergi
 */
function cgv(m) {
  if (m <= 0) return 0;
  for (const d of DILS) {
    if (m <= d.o) continue;
    if (m <= d.u) return d.v + (m - d.o) * d.r;
  }
  return DILS[4].v + (m - DILS[4].o) * 0.40;
}

/**
 * Kümülatif matrah için geçerli dilim indeksini döndürür (0–4).
 *
 * @param {number} m - Kümülatif GV matrahı (TL)
 * @returns {number} Dilim indeksi
 */
function di(m) {
  for (let i = 0; i < DILS.length; i++) {
    if (m <= DILS[i].u) return i;
  }
  return 4;
}

/**
 * Sayıyı Türkçe locale biçiminde formatlar.
 *
 * @param {number} n
 * @param {number} [decimals=0] - Ondalık hane sayısı
 * @returns {string}
 */
function f(n, decimals = 0) {
  return (Number(n) || 0).toLocaleString('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** İki ondalık hane ile formatlar. */
function f2(n) {
  return f(n, 2);
}

/**
 * Form girdilerinden 12 aylık bordro satırlarını ve yıllık toplamları hesaplar.
 * Bu fonksiyon tamamen saf (pure) — herhangi bir DOM okuması yapmaz.
 *
 * @param {object} inp - readInputs() tarafından döndürülen girdi nesnesi
 * @returns {{ rows: object[], tN: number, tB: number, tI: number, tK: number }}
 *   rows: 12 aylık satır verileri
 *   tN: yıllık toplam net
 *   tB: yıllık toplam brüt
 *   tI: yıllık toplam işveren maliyeti
 *   tK: yıllık toplam kesinti
 */
function buildRows(inp) {
  const {
    brut, tip, med, gun, fm, fmoran, ikr, ssk, ekod,
    yemekt, yemekg, yol, yolt,
    borc, avans, diger, hcay, hct, aile, igg,
    t5, t2, prims,
  } = inp;

  const agi = AGI[med] || AGI.b;

  // İşveren SGK prim oranı (teşvik seçimine göre)
  let ivR = 0.2175;
  if (t5)      ivR = 0.1675;
  else if (t2) ivR = 0.1975;

  // İşçi SGK / işsizlik oranları
  const sIR = tip === 'e' ? 0.075 : 0.14;   // SGK işçi payı
  const iIR = tip === 'e' ? 0     : 0.01;   // İşsizlik işçi payı

  // Fazla mesai brütü
  const saatlik = brut / ((gun || 22) * 7.5);
  const fmB     = saatlik * fm * (1 + fmoran);

  // Aile zammı SGK muafiyet sınırı (asgari ücretin %10'u)
  const aileI = Math.min(aile, 3303);

  // Yemek aylık toplam tutarı ve istisna hesabı
  const yemekA  = yemekt === 'yok'   ? 0 : yemekg * gun;
  const yGvI    = yemekt === 'kart'  ? Math.min(yemekg, 300) * gun
                : yemekt === 'nakit' ? 300 * gun
                : 0;
  const ySgkI   = yemekt === 'kart'  ? yemekA
                : yemekt === 'nakit' ? 158 * gun
                : 0;

  // Yol yardımı istisna hesabı
  const yolGvI  = yolt === 'ayni' ? Math.min(yol, 158 * gun) : 0;
  const yolSgkI = yolt === 'ayni' ? yol : 0;

  // Yıllık birikimli değişkenler
  let cumM = 0, cumGV = 0;
  let tN = 0, tB = 0, tI = 0, tK = 0;
  const rows = [];

  for (let i = 0; i < 12; i++) {
    const pr = prims[i] || 0;
    const hc = hcay === i ? hct : 0;

    // SGK prime esas kazanç matrahı (tavana kadar)
    const sgkB = brut + pr + ikr + ekod + fmB + hc
               + Math.max(0, yemekA - ySgkI)
               + Math.max(0, yol - yolSgkI)
               + (aile - aileI);
    const sgkM = Math.min(Math.max(sgkB, 0), STAV);

    // SGK kesintileri
    const sI  = sgkM * sIR;                    // SGK işçi
    const iI  = sgkM * iIR;                    // İşsizlik işçi
    const sIv = sgkM * ivR;                    // SGK işveren
    const iIv = sgkM * 0.02;                   // İşsizlik işveren
    const tav = sgkB > STAV;                   // Tavan aşımı var mı?

    // Toplam brüt (bordrodan geçen tüm kalemler)
    const tB_ = brut + pr + ikr + ekod + fmB + ssk + hc + yemekA + yol + aile;

    // GV matrahı
    const gvM = Math.max(0,
      brut + pr + ikr + ekod + fmB + hc
      + Math.max(0, yemekA - yGvI)
      + Math.max(0, yol - yolGvI)
      + (aile - aileI)
      - sI - iI
    );

    // Kümülatif GV hesabı
    const pC   = cumM;
    cumM      += gvM;
    const nCGV = cgv(cumM);
    const gvH  = Math.max(0, nCGV - cumGV - agi);   // AGİ sonrası hesaplanan vergi
    const nGV  = Math.max(0, gvH - GVI);              // GV istisnası sonrası net GV
    cumGV      = cgv(cumM);

    // Damga vergisi
    const dvB = tB_ * DVR;
    const nDV = Math.max(0, dvB - DVI);

    // Özel kesintiler (kişisel / idari, matraha etkisi yok)
    const yG   = yemekA;
    const sG   = ssk;
    const hG   = hc;
    const bA   = borc + avans + diger + igg;

    // Net hesabı
    const tKes = sI + iI + nGV + nDV + yG + sG + hG + bA;
    const net  = tB_ - tKes;
    const iv   = tB_ + sIv + iIv - AUD;   // İşveren toplam maliyeti

    // Dilim takibi
    const dil = di(cumM);
    const pD  = di(pC);
    const dup = dil > pD && i > 0;   // Bu ayda dilim geçişi oldu mu?

    tN += net;
    tB += tB_;
    tI += iv;
    tK += tKes;

    rows.push({
      i, ay: AY[i],
      brut, pr, ikr, yemekA, ssk, yol, ekod, fmB, hc, aile,
      tB_, sgkM, sI, iI, sIv, iIv, tav,
      gvM, cumM, dil, pD, dup, gvH, nGV,
      dvB, nDV, yG, sG, hG, bA, tKes, net, iv,
    });
  }

  return { rows, tN, tB, tI, tK };
}
