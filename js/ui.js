/**
 * ui.js
 * DOM başlatma, olay işleyicileri ve render fonksiyonları.
 * constants.js ve calc.js'in yüklenmiş olmasını gerektirir.
 */

// ── Başlatma ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initPrimGrid();
  initKalemTable();
  calc();
});

function initPrimGrid() {
  document.getElementById('prim-grid').innerHTML = AY.map((a, i) => `
    <div class="prim-ay">
      <label>${a.slice(0, 3).toUpperCase()}</label>
      <input type="number" id="p${i}" placeholder="0" min="0" step="1000"
             oninput="onPrimInput(${i})">
    </div>
  `).join('');
}

function initKalemTable() {
  const rowClass = v => v === 'Evet'  ? 'iy'
                      : (v === 'Hayır' || v.includes('muaf')) ? 'in'
                      : 'ip2';
  const rowLabel = v => v === 'Evet'  ? '✓'
                      : v === 'Hayır' ? '✗'
                      : v;

  document.getElementById('ktbl-body').innerHTML = KAL.map(r => `
    <tr>
      <td class="tl"><b>${r[0]}</b></td>
      <td class="tl" style="color:var(--tx3);font-size:9px;">${r[1]}</td>
      <td class="${rowClass(r[2])}">${rowLabel(r[2])}</td>
      <td class="${rowClass(r[3])}">${rowLabel(r[3])}</td>
      <td class="${rowClass(r[4])}">${rowLabel(r[4])}</td>
      <td class="tl" style="font-size:9px;color:var(--tx2);white-space:normal;">${r[5]}</td>
      <td class="tl" style="font-size:9px;color:${r[6].startsWith('Evet') ? 'var(--am2)' : 'var(--tx3)'};white-space:normal;">${r[6]}</td>
    </tr>
  `).join('');
}

// ── Olay İşleyicileri ─────────────────────────────────────────────────────────

/** Prim input alanı değiştiğinde highlight ve yeniden hesapla. */
function onPrimInput(i) {
  const el = document.getElementById('p' + i);
  el.classList.toggle('hv', (parseFloat(el.value) || 0) > 0);
  calc();
}

/** "5 puan" checkbox seçildiğinde "2 puan"ı devre dışı bırak. */
function onT5Change() {
  document.getElementById('t2').checked = false;
  calc();
}

/** "2 puan" checkbox seçildiğinde "5 puan"ı devre dışı bırak. */
function onT2Change() {
  document.getElementById('t5').checked = false;
  calc();
}

/** Sekme geçişi. */
function switchTab(id, el) {
  document.querySelectorAll('.pane').forEach(p => p.classList.remove('act'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('act'));
  document.getElementById('pane-' + id).classList.add('act');
  el.classList.add('act');
}

/** Tüm form alanlarını sıfırla ve yeniden hesapla. */
function resetAll() {
  const textFields = ['brut','gun','tatil','rtatil','fm','ikr','ssk','ekod',
                      'yemekg','yol','borc','avans','igg','aile','hct','diger','rapor'];
  textFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  ['yemekt','yolt','fmoran'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.selectedIndex = 0;
  });

  document.getElementById('hcay').value   = '-1';
  document.getElementById('t5').checked   = false;
  document.getElementById('t2').checked   = false;

  AY.forEach((_, i) => {
    const el = document.getElementById('p' + i);
    if (el) { el.value = ''; el.classList.remove('hv'); }
  });

  calc();
}

// ── Ana Hesaplama Koordinatörü ────────────────────────────────────────────────

/**
 * Form değerlerini okur, hesaplama katmanını çağırır ve ekranı günceller.
 * Brüt maaş girilmemişse boş durum gösterilir.
 */
function calc() {
  const brut    = parseFloat(document.getElementById('brut').value) || 0;
  const isEmpty = brut < 100;

  document.getElementById('giris-empty').style.display = isEmpty ? '' : 'none';
  ['c0','n0','n1','n3'].forEach(id => {
    document.getElementById(id).style.display = isEmpty ? 'none' : '';
  });

  if (isEmpty) {
    const placeholder = '<tr><td colspan="20" class="tl" style="text-align:center;padding:30px;color:var(--tx3);">GİRİŞ sekmesinden brüt maaş ve diğer bilgileri doldurun.</td></tr>';
    ['tb1','tb2','tb3'].forEach(id => { document.getElementById(id).innerHTML = placeholder; });
    ['c1','c2','c3'].forEach(id => { document.getElementById(id).innerHTML = ''; });
    return;
  }

  const inp            = readInputs(brut);
  const { rows, tN, tB, tI, tK } = buildRows(inp);
  const siv            = document.getElementById('siv').checked;

  renderCards(rows, tN, tB, tI, tK, siv);
  renderInfoBars(rows, inp.t5, inp.t2, tN, tB, tI);
  renderTable1(rows, tN, tB);
  renderTable2(rows, tN, tB, tK);
  renderTable3(rows, tN, tI, tB);
  renderDilimVis(rows, tN, tB);
}

/** Tüm form alanlarını bir nesne olarak okur. */
function readInputs(brut) {
  const g = id => document.getElementById(id);
  const t5 = g('t5').checked;
  return {
    brut,
    tip:    g('tip').value,
    med:    g('med').value,
    gun:    parseInt(g('gun').value)      || 22,
    fm:     parseFloat(g('fm').value)     || 0,
    fmoran: parseFloat(g('fmoran').value) || 0.5,
    ikr:    parseFloat(g('ikr').value)    || 0,
    ssk:    parseFloat(g('ssk').value)    || 0,
    ekod:   parseFloat(g('ekod').value)   || 0,
    yemekt: g('yemekt').value,
    yemekg: parseFloat(g('yemekg').value) || 0,
    yol:    parseFloat(g('yol').value)    || 0,
    yolt:   g('yolt').value,
    borc:   parseFloat(g('borc').value)   || 0,
    avans:  parseFloat(g('avans').value)  || 0,
    diger:  parseFloat(g('diger').value)  || 0,
    hcay:   parseInt(g('hcay').value),
    hct:    parseFloat(g('hct').value)    || 0,
    aile:   parseFloat(g('aile').value)   || 0,
    igg:    parseFloat(g('igg').value)    || 0,
    t5,
    t2:     g('t2').checked && !t5,
    prims:  AY.map((_, i) => parseFloat(g('p' + i)?.value) || 0),
  };
}

// ── Render Fonksiyonları ───────────────────────────────────────────────────────

function renderCards(rows, tN, tB, tI, tK, siv) {
  const mx = rows.reduce((a, b) => a.net > b.net ? a : b);
  const mn = rows.reduce((a, b) => a.net < b.net ? a : b);
  const fk = rows[11].net - rows[0].net;

  const html = `
    <div class="crd cb"><div class="crd-lbl">Aylık Brüt Maaş</div><div class="crd-val vb">${f(rows[0].brut)}</div><div class="crd-sub">TL</div></div>
    <div class="crd cg"><div class="crd-lbl">Ocak Net</div><div class="crd-val vg">${f(rows[0].net)}</div><div class="crd-sub">TL — en düşük dilim</div></div>
    <div class="crd cg"><div class="crd-lbl">En Yüksek Net</div><div class="crd-val vg">${f(mx.net)}</div><div class="crd-sub">${mx.ay}</div></div>
    <div class="crd cr"><div class="crd-lbl">En Düşük Net</div><div class="crd-val vr">${f(mn.net)}</div><div class="crd-sub">${mn.ay}</div></div>
    <div class="crd ca"><div class="crd-lbl">Aralık Net</div><div class="crd-val ${fk >= 0 ? 'vr' : 'vg'}">${f(rows[11].net)}</div><div class="crd-sub">Ocak farkı: ${fk >= 0 ? '▼' : '▲'} ${f(Math.abs(fk))}</div></div>
    <div class="crd cg"><div class="crd-lbl">Yıllık Toplam Net</div><div class="crd-val vg">${f(tN)}</div><div class="crd-sub">TL</div></div>
    <div class="crd cr"><div class="crd-lbl">Yıllık Kesinti</div><div class="crd-val vr">${f(tK)}</div><div class="crd-sub">%${Math.round(tK / tB * 100)} brüt</div></div>
    ${siv ? `<div class="crd ct"><div class="crd-lbl">Yıllık İşv. Maliyeti</div><div class="crd-val vt">${f(tI)}</div><div class="crd-sub">TL</div></div>` : ''}
  `;
  ['c0','c1','c2','c3'].forEach(id => { document.getElementById(id).innerHTML = html; });
}

function renderInfoBars(rows, t5, t2, tN, tB, tI) {
  const tv = t5 ? '5 puan imalat' : t2 ? '2 puan imalat dışı' : 'Teşviksiz';
  const gc = rows.filter(r => r.dup).map(r =>
    `<b style="color:var(--pu)">${r.ay}</b>: %${Math.round(DILS[r.pD].r * 100)}→%${Math.round(DILS[r.dil].r * 100)}`
  );

  document.getElementById('n0').innerHTML =
    `<b>Teşvik:</b> ${tv} | <b>Yıllık net:</b> ${f(tN)} TL | <b>Yıllık brüt:</b> ${f(tB)} TL | Dilim geçişleri: ${gc.length ? gc.join(', ') : 'Yok'}`;

  document.getElementById('n1').innerHTML =
    `<b>2026 GV 1. dilim: 190.000 TL</b> (2024'e göre +%73) | Dilim geçişleri: ${gc.length ? gc.join(' → ') : 'Bu yapıda geçiş yok'} | ${rows.some(r => r.tav) ? `Tavan aşıldı: ${rows.filter(r => r.tav).map(r => r.ay).join(', ')}` : 'SGK tavanı aşılmadı'}`;

  document.getElementById('n3').innerHTML =
    `<b>Teşvik:</b> ${t5 ? '5 puan imalat (%16,75)' : t2 ? '2 puan imalat dışı (%19,75)' : 'Teşviksiz (%21,75)'} | İşsizlik işv.: %2 | Asg.üc.desteği: ${f(AUD)} TL/ay | <b>Yıllık toplam maliyet: ${f(tI)} TL</b>`;
}

function renderTable1(rows, tN, tB) {
  const body = rows.map(r => {
    let cl = '';
    if (r.pr > 0 && r.dup)  cl = 'rpd';
    else if (r.pr > 0)      cl = 'rp';
    else if (r.dup)         cl = 'rd';
    else if (r.tav)         cl = 'rt';

    const dB = (r.fmB || 0) + (r.hc || 0) + (r.ekod || 0) + (r.aile || 0);
    return `<tr class="${cl}">
      <td class="tl sr">${r.ay}${r.pr > 0 ? '<span class="bdg bp">PRİM</span>' : ''}${r.dup ? '<span class="bdg bup">↑DİLİM</span>' : ''}${r.tav ? '<span class="bdg bt">TAVAN</span>' : ''}${r.hc > 0 ? '<span class="bdg bh">HC</span>' : ''}</td>
      <td class="${r.pr ? 'nA' : 'nX'}">${r.pr ? f2(r.pr) : '—'}</td>
      <td class="nX">${r.ikr ? f2(r.ikr) : '—'}</td>
      <td class="nX">${r.yemekA ? f2(r.yemekA) : '—'}</td>
      <td class="nX">${r.ssk ? f2(r.ssk) : '—'}</td>
      <td class="nX">${r.yol ? f2(r.yol) : '—'}</td>
      <td class="nX sr">${dB ? f2(dB) : '—'}</td>
      <td class="nB">${f2(r.tB_)}</td>
      <td class="nB">${f2(r.sgkM)}</td>
      <td class="nR">-${f2(r.sI + r.iI)}</td>
      <td class="${r.tav ? 'nT' : 'nX'} sr">${r.tav ? '✓' : '—'}</td>
      <td>${f2(r.gvM)}</td>
      <td class="nA">${f2(r.cumM)}</td>
      <td><span class="bdg ${DTC[r.dil]}">${DTG[r.dil]}</span></td>
      <td class="nR sr">-${f2(r.nGV)}</td>
      <td class="nX">${f2(r.dvB)}</td>
      <td class="nR sr">-${f2(r.nDV)}</td>
      <td class="nR">-${f2(r.bA)}</td>
      <td class="nG" style="font-weight:700;">${f2(r.net)}</td>
    </tr>`;
  }).join('');

  const totals = `<tr class="tot">
    <td class="tl sr">YILLIK TOPLAM</td>
    <td class="nA">${f2(rows.reduce((s, r) => s + r.pr, 0))}</td>
    <td class="nX">${f2(rows.reduce((s, r) => s + r.ikr, 0))}</td>
    <td></td><td></td><td></td><td class="sr"></td>
    <td class="nB">${f2(tB)}</td><td></td>
    <td class="nR">-${f2(rows.reduce((s, r) => s + r.sI + r.iI, 0))}</td>
    <td class="sr"></td><td></td>
    <td class="nA">${f2(rows[11].cumM)}</td><td></td>
    <td class="nR sr">-${f2(rows.reduce((s, r) => s + r.nGV, 0))}</td>
    <td></td>
    <td class="nR sr">-${f2(rows.reduce((s, r) => s + r.nDV, 0))}</td>
    <td class="nR">-${f2(rows.reduce((s, r) => s + r.bA, 0))}</td>
    <td class="nG" style="font-weight:700;">${f2(tN)}</td>
  </tr>`;

  document.getElementById('tb1').innerHTML = body + totals;
}

function renderTable2(rows, tN, tB, tK) {
  const body = rows.map(r => `<tr>
    <td class="tl">${r.ay}${r.pr > 0 ? '<span class="bdg bp">P</span>' : ''}</td>
    <td class="nB">${f2(r.tB_)}</td>
    <td class="nB">${f2(r.sgkM)}</td>
    <td class="nR">-${f2(r.sI)}</td>
    <td class="nR sr">-${f2(r.iI)}</td>
    <td>${f2(r.gvM)}</td>
    <td class="nA">${f2(r.cumM)}</td>
    <td><span class="bdg ${DTC[r.dil]}">${DTG[r.dil]}</span></td>
    <td class="nX">${f2(r.gvH + GVI)}</td>
    <td class="nG">-${f2(GVI)}</td>
    <td class="nR sr">-${f2(r.nGV)}</td>
    <td class="nX">${f2(r.dvB)}</td>
    <td class="nG">-${f2(DVI)}</td>
    <td class="nR sr">-${f2(r.nDV)}</td>
    <td class="nX">${r.yG ? '-' + f2(r.yG) : '—'}</td>
    <td class="nX">${r.sG ? '-' + f2(r.sG) : '—'}</td>
    <td class="nX">${r.hG ? '-' + f2(r.hG) : '—'}</td>
    <td class="nR">-${f2(r.bA)}</td>
    <td class="nR">-${f2(r.tKes)}</td>
    <td class="nG" style="font-weight:700;">${f2(r.net)}</td>
  </tr>`).join('');

  const totals = `<tr class="tot">
    <td class="tl">TOPLAM</td>
    <td class="nB">${f2(tB)}</td><td></td>
    <td class="nR">-${f2(rows.reduce((s, r) => s + r.sI, 0))}</td>
    <td class="nR sr">-${f2(rows.reduce((s, r) => s + r.iI, 0))}</td>
    <td></td><td class="nA">${f2(rows[11].cumM)}</td><td></td><td></td>
    <td class="nG">-${f2(rows.length * GVI)}</td>
    <td class="nR sr">-${f2(rows.reduce((s, r) => s + r.nGV, 0))}</td>
    <td></td><td class="nG">-${f2(rows.length * DVI)}</td>
    <td class="nR sr">-${f2(rows.reduce((s, r) => s + r.nDV, 0))}</td>
    <td></td><td></td><td></td>
    <td class="nR">-${f2(rows.reduce((s, r) => s + r.bA, 0))}</td>
    <td class="nR">-${f2(tK)}</td>
    <td class="nG" style="font-weight:700;">${f2(tN)}</td>
  </tr>`;

  document.getElementById('tb2').innerHTML = body + totals;
}

function renderTable3(rows, tN, tI, tB) {
  const body = rows.map(r => {
    const tot  = r.sIv + r.iIv;
    const net2 = tot - AUD;
    const mal  = r.tB_ + net2;
    return `<tr>
      <td class="tl">${r.ay}</td>
      <td class="nB">${f2(r.sgkM)}</td>
      <td class="nA">+${f2(r.sIv)}</td>
      <td class="nA">+${f2(r.iIv)}</td>
      <td class="nA">${f2(tot)}</td>
      <td class="nG">-${f2(AUD)}</td>
      <td class="nA">${f2(net2)}</td>
      <td class="nB">${f2(r.tB_)}</td>
      <td class="nT" style="font-weight:700;">${f2(mal)}</td>
      <td class="nX">${Math.round(r.net / mal * 100)}%</td>
    </tr>`;
  }).join('');

  const totals = `<tr class="tot">
    <td class="tl">YILLIK TOPLAM</td><td></td>
    <td class="nA">+${f2(rows.reduce((s, r) => s + r.sIv, 0))}</td>
    <td class="nA">+${f2(rows.reduce((s, r) => s + r.iIv, 0))}</td>
    <td class="nA">${f2(rows.reduce((s, r) => s + r.sIv + r.iIv, 0))}</td>
    <td class="nG">-${f2(12 * AUD)}</td>
    <td class="nA">${f2(rows.reduce((s, r) => s + r.sIv + r.iIv - AUD, 0))}</td>
    <td class="nB">${f2(tB)}</td>
    <td class="nT" style="font-weight:700;">${f2(tI)}</td>
    <td class="nX">${Math.round(tN / tI * 100)}%</td>
  </tr>`;

  document.getElementById('tb3').innerHTML = body + totals;
}

function renderDilimVis(rows, tN, tB) {
  const mc = rows[11].cumM;
  if (mc <= 0) return;

  const segments = DILS.map((d, i) => {
    const lower = d.o;
    const upper = Math.min(d.u === Infinity ? mc : d.u, mc);
    if (upper <= lower) return null;
    return { pct: (upper - lower) / mc * 100, color: DCL[i], label: DTG[i] };
  }).filter(Boolean);

  const yillikNGV = rows.reduce((s, r) => s + r.nGV, 0);
  const yillikNDV = rows.reduce((s, r) => s + r.nDV, 0);

  document.getElementById('dilim-vis').innerHTML = `
    <div style="font-size:9px;color:var(--tx3);margin-bottom:6px;">
      Yıl sonu kümülatif GV matrahı: <b style="color:var(--am2)">${f(mc)} TL</b>
    </div>
    <div class="dbar">
      ${segments.map(s => `
        <div class="dseg" style="width:${s.pct}%;background:${s.color};"
             title="${s.label}: ${f(s.pct, 1)}%">
          ${s.pct > 5 ? s.label : ''}
        </div>
      `).join('')}
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px;">
      ${segments.map(s => `
        <span style="font-size:9px;color:${s.color};font-family:var(--mono);font-weight:600;">
          ${s.label} ${f(s.pct, 1)}%
        </span>
      `).join('')}
    </div>
    <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:6px;">
      <span style="font-size:9px;color:var(--tx3);">Yıllık Net GV: <b style="color:var(--rd)">${f2(yillikNGV)} TL</b></span>
      <span style="font-size:9px;color:var(--tx3);">Yıllık Net DV: <b style="color:var(--rd)">${f2(yillikNDV)} TL</b></span>
      <span style="font-size:9px;color:var(--tx3);">Efektif GV oranı: <b style="color:var(--am2)">%${((yillikNGV / mc) * 100).toFixed(1)}</b></span>
      <span style="font-size:9px;color:var(--tx3);">Net / Brüt oranı: <b style="color:var(--gn)">%${Math.round(tN / tB * 100)}</b></span>
    </div>
  `;
}
