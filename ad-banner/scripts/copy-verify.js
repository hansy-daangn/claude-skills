// ============================================================
// 베껴쓰기 정확도 검증 스크립트 (use_figma의 code 파라미터에 그대로 붙여넣기)
//
// 동작:
// - Figma `learning Area`(8605:3281)의 98개 화이트리스트 프레임을 정답지로 둠
// - 각 프레임에서 TEXT 노드의 절대 좌표/크기/fontSize 측정
// - 새 frame에 figma.createText()로 같은 좌표·박스 크기·fontSize 재현
// - 폰트는 Karrot Sans Heavy/Bold (워크스페이스 미가용 시 Noto Sans KR Black/Bold 폴백)
// - 헤드(프레임 내 max fontSize) = Heavy, 그 외 = Bold
// - textAutoResize='WIDTH_AND_HEIGHT' (자동너비) 강제
// - 흰 배경, 흰 텍스트는 검정으로 자동 변환 (가시성)
// - Logo INSTANCE는 clone() 그대로
// - ClaudeArea(8297:11349)의 `베껴쓰기_자동너비_0505` 컨테이너에 사이즈별 행 정렬 출력
//
// 다음 작업 시 이 코드를 use_figma에 붙여넣고 실행 → 정확도 평가
// ============================================================

const PAGE_NAME = '베껴쓰기_자동너비_0505';
const SOURCE = '8605:3281';
const TARGET = '8297:11349';

const la = await figma.getNodeByIdAsync(SOURCE);
if (!la) throw new Error('learning Area 없음');

const LOCK = ['320x100','300x250','720x720','480x320','1200x628','320x480','720x960','768x1024','720x1280','1200x1600'];

const bySize = {};
for (const c of la.children) {
  if (c.type !== 'FRAME') continue;
  const k = `${Math.round(c.width)}x${Math.round(c.height)}`;
  (bySize[k] = bySize[k] || []).push(c);
}

// 폰트: Karrot Sans 우선, 미가용 시 Noto Sans KR
const fonts = await figma.listAvailableFontsAsync();
const hasKarrot = fonts.some(f => f.fontName.family === 'Karrot Sans');
const HEAVY = hasKarrot ? {family:'Karrot Sans', style:'Heavy'} : {family:'Noto Sans KR', style:'Black'};
const BOLD  = hasKarrot ? {family:'Karrot Sans', style:'Bold'}  : {family:'Noto Sans KR', style:'Bold'};
await figma.loadFontAsync(HEAVY);
await figma.loadFontAsync(BOLD);

async function copyFrame(F) {
  const W = F.width, H = F.height;
  const dst = figma.createFrame();
  dst.resize(W, H);
  dst.fills = [{type:'SOLID', color:{r:1, g:1, b:1}}]; // 흰 BG (주황 금지)
  dst.clipsContent = true;
  dst.name = F.name;
  const fb = F.absoluteBoundingBox;

  // 프레임 내 max fontSize (Heavy/Bold 분류)
  let maxFp = 0;
  function findMax(n) {
    if (n.type === 'TEXT') {
      try {
        let fp = n.fontSize;
        if (fp === figma.mixed) fp = n.getRangeFontSize(0, 1);
        if (fp > maxFp) maxFp = fp;
      } catch(_) {}
    }
    if ('children' in n) for (const c of n.children) findMax(c);
  }
  findMax(F);

  function walk(n) {
    // Logo INSTANCE: clone 그대로
    if (n.type === 'INSTANCE' && /logo[_-]?(korean|symbol|business|primary|white|main)/i.test(n.name||'')) {
      try {
        const cl = n.clone();
        const ab = n.absoluteBoundingBox;
        if (ab && fb) {
          dst.appendChild(cl);
          cl.x = ab.x - fb.x;
          cl.y = ab.y - fb.y;
        }
      } catch(_) {}
      return;
    }

    // TEXT: 메타 측정 후 createText로 재현
    if (n.type === 'TEXT') {
      const ab = n.absoluteBoundingBox;
      if (!ab || !fb) return;

      let fontSize;
      try { fontSize = n.fontSize; if (fontSize === figma.mixed) fontSize = n.getRangeFontSize(0, 1); } catch(_) { fontSize = 16; }
      fontSize = Math.max(6, Math.round(fontSize));

      const useFont = (fontSize >= maxFp - 0.5) ? HEAVY : BOLD;
      const characters = n.characters || '';

      let fills = n.fills;
      if (fills === figma.mixed) {
        try { fills = n.getRangeFills(0, 1); }
        catch(_) { fills = [{type:'SOLID', color:{r:0.13, g:0.13, b:0.14}}]; }
      }

      let lineHeight;
      try { lineHeight = n.lineHeight; if (lineHeight === figma.mixed) lineHeight = n.getRangeLineHeight(0, 1); } catch(_) { lineHeight = {value:135, unit:'PERCENT'}; }
      let letterSpacing;
      try { letterSpacing = n.letterSpacing; if (letterSpacing === figma.mixed) letterSpacing = n.getRangeLetterSpacing(0, 1); } catch(_) { letterSpacing = {value:0, unit:'PERCENT'}; }
      let textAlignH = 'LEFT';
      try { textAlignH = n.textAlignHorizontal || 'LEFT'; } catch(_) {}

      const t = figma.createText();
      t.fontName = useFont;
      t.fontSize = fontSize;
      t.characters = characters;
      try { t.fills = Array.isArray(fills) ? fills : [{type:'SOLID', color:{r:0.13,g:0.13,b:0.14}}]; } catch(_) {}
      try { t.lineHeight = lineHeight; } catch(_) {}
      try { t.letterSpacing = letterSpacing; } catch(_) {}
      try { t.textAlignHorizontal = textAlignH; } catch(_) {}

      // 자동너비 강제 (사용자 룰: 최종 상태는 자동너비)
      try { t.textAutoResize = 'WIDTH_AND_HEIGHT'; } catch(_) {}

      dst.appendChild(t);
      t.x = Math.round(ab.x - fb.x);
      t.y = Math.round(ab.y - fb.y);

      // 흰 텍스트 → 검정 (흰 BG 가시성)
      try {
        const f = t.fills;
        if (Array.isArray(f) && f.length > 0 && f[0].type === 'SOLID') {
          const c = f[0].color;
          if (c.r > 0.9 && c.g > 0.9 && c.b > 0.9) {
            t.fills = [{type:'SOLID', color:{r:0.13, g:0.13, b:0.14}}];
          }
        }
      } catch(_) {}
      return;
    }

    if ('children' in n) for (const c of n.children) walk(c);
  }

  for (const c of F.children) walk(c);
  return dst;
}

const pg = figma.getNodeById(TARGET);
await figma.setCurrentPageAsync(pg);
let container = pg.children.find(c => c.name === PAGE_NAME);
if (container) [...container.children].forEach(c => { try{c.remove();}catch(e){} });
else {
  let oY = 0;
  if (pg.children.length > 0) {
    const lo = pg.children.reduce((a,b) => (a.y+a.height >= b.y+b.height) ? a : b);
    oY = lo.y + lo.height + 200;
  }
  container = figma.createFrame();
  container.name = PAGE_NAME;
  container.fills = [];
  container.clipsContent = false;
  pg.appendChild(container);
  container.x = 0; container.y = oY;
}

let cy = 0, maxX = 0;
const created = [];
for (const k of LOCK) {
  const list = bySize[k] || [];
  let cx = 0;
  let rowH = 0;
  for (const src of list) {
    const dst = await copyFrame(src);
    container.appendChild(dst);
    dst.x = cx; dst.y = cy;
    created.push(dst);
    cx += src.width + 60;
    rowH = Math.max(rowH, src.height);
  }
  if (cx > maxX) maxX = cx;
  cy += rowH + 140;
}
container.resize(Math.max(maxX, 1), Math.max(cy, 1));
figma.viewport.scrollAndZoomIntoView([container]);
return {ok:true, total:created.length, font: hasKarrot ? 'Karrot Sans Heavy/Bold' : 'Noto Sans KR Black/Bold (Karrot 미가용)', id:container.id};
