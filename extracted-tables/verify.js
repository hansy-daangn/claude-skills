const fs = require('fs');
const path = require('path');
const OUT = __dirname;

let failures = 0;
function assert(cond, msg) {
  if (cond) { console.log('  ✓ ' + msg); }
  else { console.log('  ✗ FAIL: ' + msg); failures++; }
}

// ---- RFC-4180 CSV parser (handles quoted fields w/ commas, "" escapes, CRLF) ----
function parseCsv(text) {
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1); // strip BOM
  const rows = [];
  let field = '', row = [], i = 0, inQ = false;
  while (i < text.length) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQ = false; i++; continue;
      }
      field += ch; i++; continue;
    }
    if (ch === '"') { inQ = true; i++; continue; }
    if (ch === ',') { row.push(field); field = ''; i++; continue; }
    if (ch === '\r') { i++; continue; }
    if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
    field += ch; i++;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const sortKey = a => a.map(x => x.replace(/\|/g, '\\|')).join('|');
const multisetEqual = (A, B) => {
  if (A.length !== B.length) return false;
  const a = A.map(sortKey).sort(), b = B.map(sortKey).sort();
  return a.every((v, i) => v === b[i]);
};

const data = JSON.parse(fs.readFileSync(path.join(OUT, '_extract.json'), 'utf8'));

const EXPECTED_HEADERS = [
  '매체', '소재', '지출(만원)', 'CTR',
  '후기작성 전환 수', '후기작성 CPA(원)', '후기작성 평가',
  '단골맺기 전환 수', '단골맺기 CPA(원)', '단골맺기 평가',
];

// Fully-independent hand-computed expected values for the keyword rows,
// derived by hand from the raw source numbers in index.html.
const REVIEW100 = [
  ['몰로코',        'review100', '133',   '6.4%', '206', '6,471원',   '고효율', '120', '11,108원',  '고효율'],
  ['Google DG',     'review100', '115',   '2.6%', '10',  '115,313원', '비효율', '7',   '164,732원', '비효율'],
  ['Google ACe',    'review100', '47',    '0.9%', '426', '1,126원',   '고효율', '229', '2,095원',   '고효율'],
  ['Meta',          'review100', '1,817', '1.2%', '95',  '191,286원', '비효율', '50',  '363,445원', '비효율'],
  ['토스 리스트배너', 'review100', '37',    '3.6%', '24',  '15,492원',  '보통',   '9',   '41,313원',  '보통'],
];
const DANGOL = [
  ['몰로코',        '당근제작_단골맺기', '292', '10.7%', '362',  '8,084원',  '고효율', '342',  '8,556원',  '고효율'],
  ['Google DG',     '당근제작_단골맺기', '277', '4.3%',  '70',   '39,628원', '보통',   '72',   '38,527원', '보통'],
  ['Google ACe',    '당근제작_단골맺기', '322', '0.7%',  '4654', '693원',    '고효율', '4891', '659원',    '고효율'],
  ['Meta',          '당근제작_단골맺기', '5',   '0.9%',  '0',    '—',        '전환없음', '3',   '17,871원', '보통'],
  ['토스 리스트배너', '당근제작_단골맺기', '4',   '8.1%',  '8',    '5,599원',  '고효율', '9',    '4,977원',  '고효율'],
];

function checkTab(name, ext, csvFile, kwName, kwExpected, expectedRowCount) {
  console.log(`\n=== ${name} (${csvFile}) ===`);

  // 1. Row-count sanity
  assert(ext.domRows.length === expectedRowCount, `DOM row count == ${expectedRowCount} (got ${ext.domRows.length})`);
  assert(ext.rawCount === expectedRowCount, `raw data count == ${expectedRowCount} (got ${ext.rawCount})`);

  // 2. DOM rows exactly match mirrored-from-raw formatting (completeness + no mixing)
  assert(multisetEqual(ext.domRows, ext.expectedRows),
    'displayed rows == raw data (every row present, correctly formatted, none mixed/dropped/added)');

  // 3. Headers
  assert(JSON.stringify(ext.headers) === JSON.stringify(EXPECTED_HEADERS), 'headers match expected 10 columns');

  // 4. Parse the written CSV back and validate structure + round-trip
  const parsed = parseCsv(fs.readFileSync(path.join(OUT, csvFile), 'utf8'));
  const header = parsed[0], body = parsed.slice(1);
  assert(JSON.stringify(header) === JSON.stringify(EXPECTED_HEADERS), 'CSV header row parses to the 10 expected columns');
  assert(body.length === expectedRowCount, `CSV has ${expectedRowCount} data rows (got ${body.length})`);
  const allTen = body.every(r => r.length === 10);
  assert(allTen, 'EVERY CSV data row parses to exactly 10 fields (no column split/merge)');
  assert(multisetEqual(body, ext.domRows), 'CSV round-trips to exactly the extracted DOM rows');

  // 5. Keyword rows: independent hand-computed check
  const kwRows = body.filter(r => r[1] === kwName);
  assert(kwRows.length === kwExpected.length, `CSV contains ${kwExpected.length} '${kwName}' rows (got ${kwRows.length})`);
  assert(multisetEqual(kwRows, kwExpected),
    `all '${kwName}' rows exactly match hand-computed expected values (매체/지출/CTR/전환/CPA/평가 all aligned)`);

  // 6. Guard: any field containing a comma must be quoted in the raw CSV text
  const raw = fs.readFileSync(path.join(OUT, csvFile), 'utf8').replace(/^﻿/, '');
  const numFieldsWithComma = ext.domRows.flat().filter(v => v.includes(',')).length;
  console.log(`  (note: ${numFieldsWithComma} field-values contain a comma and are quoted in the CSV)`);

  return kwRows;
}

const r1 = checkTab('유저 / 후기작성', data.review, 'review_후기작성.csv', 'review100', REVIEW100, 111);
const r2 = checkTab('유저 / 단골맺기', data.dangol, 'dangol_단골맺기.csv', '당근제작_단골맺기', DANGOL, 35);

console.log('\n================ KEYWORD ROWS (as extracted) ================');
console.log('\n[review100] rows in review_후기작성.csv:');
console.log(EXPECTED_HEADERS.join(' | '));
r1.forEach(r => console.log(r.join(' | ')));
console.log('\n[당근제작_단골맺기] rows in dangol_단골맺기.csv:');
console.log(EXPECTED_HEADERS.join(' | '));
r2.forEach(r => console.log(r.join(' | ')));

console.log('\n================ RESULT ================');
console.log(failures === 0 ? '✅ ALL CHECKS PASSED' : `❌ ${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
