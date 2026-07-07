const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT_DIR = __dirname;
const FILE_URL = 'file://' + path.join(OUT_DIR, 'index.html');

// ---- CSV helpers ----
function csvField(v) {
  const s = String(v);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}
function toCsv(headers, rows) {
  const lines = [headers.map(csvField).join(',')];
  for (const r of rows) lines.push(r.map(csvField).join(','));
  return lines.join('\r\n') + '\r\n';
}

// Extract one tab's rendered table + the raw data + a mirrored "expected" set.
async function extractTab(page) {
  return await page.evaluate(() => {
    // camp / D / fN are top-level let/const in the page script -> global lexical
    // bindings, reachable as bare identifiers (not as window.* properties).
    const curCamp = camp;                    // current campaign key
    const d = D[curCamp];
    const k1 = d.k1, k2 = d.k2;

    // Flattened headers exactly as the two-row <thead> renders them.
    const headers = [
      '매체', '소재', '지출(만원)', 'CTR',
      k1 + ' 전환 수', k1 + ' CPA(원)', k1 + ' 평가',
      k2 + ' 전환 수', k2 + ' CPA(원)', k2 + ' 평가',
    ];

    // ---- Read what is actually rendered in the DOM (ground truth) ----
    const domRows = [];
    document.querySelectorAll('#tb tr').forEach(tr => {
      const tds = tr.querySelectorAll('td');
      if (tds.length < 10) return; // skip the "데이터 없음" placeholder row
      const nameEl = tds[1].querySelector('.cv-name');
      const soje = (nameEl ? nameEl.textContent : tds[1].textContent).trim();
      domRows.push([
        tds[0].textContent.trim(),
        soje,
        tds[2].textContent.trim(),
        tds[3].textContent.trim(),
        tds[4].textContent.trim(),
        tds[5].textContent.trim(),
        tds[6].textContent.trim(),
        tds[7].textContent.trim(),
        tds[8].textContent.trim(),
        tds[9].textContent.trim(),
      ]);
    });

    // ---- Independently mirror ren()'s formatting from the raw data ----
    const badgeTxt = (v, g, b) => v == null ? '전환없음' : (v <= g ? '고효율' : (v >= b ? '비효율' : '보통'));
    const expectedRows = d.data.map(r => [
      r.m,
      r.c,
      fN(r.s),
      r.ctr != null ? (r.ctr * 100).toFixed(1) + '%' : '—',
      r.c1 ? String(r.c1) : '0',
      r.p1 ? fN(r.p1) + '원' : '—',
      badgeTxt(r.p1, d.g1, d.b1),
      r.c2 ? String(r.c2) : '0',
      r.p2 ? fN(r.p2) + '원' : '—',
      badgeTxt(r.p2, d.g2, d.b2),
    ]);

    return { camp: curCamp, k1, k2, headers, domRows, expectedRows, rawCount: d.data.length, rawData: d.data };
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(FILE_URL, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => document.querySelectorAll('#tb tr td').length > 0, { timeout: 20000 });

  // Sanity: confirm default tab is review
  const startCamp = await page.evaluate(() => camp);
  console.log('Initial camp:', startCamp);

  // ---- Tab 1: review (유저/후기작성) — default ----
  const review = await extractTab(page);
  console.log('review camp:', review.camp, 'rows(dom):', review.domRows.length, 'raw:', review.rawCount);

  // ---- Switch to dangol (유저/단골맺기) tab by clicking its tab button ----
  await page.evaluate(() => {
    const tab = Array.from(document.querySelectorAll('.tab'))
      .find(t => t.getAttribute('onclick') && t.getAttribute('onclick').includes("'dangol'"));
    tab.click();
  });
  await page.waitForFunction(() => camp === 'dangol', { timeout: 20000 });
  await page.waitForFunction(() => document.querySelectorAll('#tb tr td').length > 0, { timeout: 20000 });
  const dangol = await extractTab(page);
  console.log('dangol camp:', dangol.camp, 'rows(dom):', dangol.domRows.length, 'raw:', dangol.rawCount);

  await browser.close();
  if (errors.length) console.log('PAGE ERRORS:', errors);

  // ---- Build CSVs from the DOM rows (faithful to what is displayed) ----
  const reviewCsv = toCsv(review.headers, review.domRows);
  const dangolCsv = toCsv(dangol.headers, dangol.domRows);
  fs.writeFileSync(path.join(OUT_DIR, 'review_후기작성.csv'), '﻿' + reviewCsv); // BOM for Excel Korean
  fs.writeFileSync(path.join(OUT_DIR, 'dangol_단골맺기.csv'), '﻿' + dangolCsv);

  // Save raw JSON for the verification step
  fs.writeFileSync(path.join(OUT_DIR, '_extract.json'), JSON.stringify({ review, dangol }, null, 2));
  console.log('WROTE review_후기작성.csv and dangol_단골맺기.csv');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
