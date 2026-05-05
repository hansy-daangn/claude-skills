# Figma 배너 제너레이터

`use_figma`의 `code` 파라미터에 그대로 넣어 실행. 캠페인 변수만 교체.

## 핵심 동작

1. Figma `learning Area` (페이지 ID `8605:3281`) 안의 **모든 화이트리스트 프레임**을 사이즈별로 그룹화
2. 각 프레임 = 1개의 시안. 사이즈마다 헤드/로고/CTA 좌표를 **그대로 보존**
3. 새 캠페인 카피만 그 위치에 fitSize로 맞춰 출력
4. **CTA는 무조건 프레임 하단 풀와이드 bar로 정규화** (원본의 CTA 위치/형태 무시, 룰 우선)
5. **테스트 모드는 단색** — 모든 시안이 흰 BG + 검정 헤드 + 오렌지 CTA bar. layout 차이만 비교 가능

검증된 디자인이 사이즈마다 다음과 같이 분포 (98개 총):
- 320×100: 13개  · 300×250: 7개  · 720×720: 5개
- 480×320: 11개 · 1200×628: 16개
- 320×480: 10개 · 720×960: 5개 · 768×1024: 11개 · 720×1280: 18개 · 1200×1600: 2개

이 수치는 화이트리스트가 변하면 자동 반영됨.

---

## 절대 룰

- 데이터 출처: Figma `learning Area`만 (다른 소스 금지)
- CTA 위치: `(0, H-barH, W, barH)` 하단 정렬 풀와이드. 우측 세로 bar / 인라인 pill 금지
- 색은 **fingerprint dedupe 후 V 인덱스로 다양화하지 않음**. 테스트 모드는 단색
- `text.height` 사용 금지 (`fitSize` + 절대 좌표만)
- Logo: `importComponentByKeyAsync('7bd06aa4...')` 인스턴스 (이모지 금지)
- 장식원·점선원 금지

---

## 전체 코드

```js
// ============================================================
// 캠페인 변수
// ============================================================
const PAGE_NAME = '노트북_중고거래_2604';
const HEAD = '비싼 노트북,\n이웃이 살게요';
const CT   = '당근 열기';

// ============================================================
// 락 10종 사이즈 (출력 순서)
// ============================================================
const LOCK = [
  '320x100','300x250','720x720','480x320','1200x628',
  '320x480','720x960','768x1024','720x1280','1200x1600'
];

// ============================================================
// learning Area에서 화이트리스트 프레임 사이즈별 그룹
// ============================================================
const la = await figma.getNodeByIdAsync('8605:3281');
if (!la) throw new Error('learning Area(8605:3281)을 찾을 수 없음');
const bySize = {};
for (const c of la.children) {
  if (c.type !== 'FRAME') continue;
  const k = `${Math.round(c.width)}x${Math.round(c.height)}`;
  (bySize[k] = bySize[k] || []).push(c);
}

// ============================================================
// 노드 식별 휴리스틱
// ============================================================
const isLogo = n => /logo[_-]?(korean|symbol|business|primary|white|main)/i.test(n.name||'');
const isCta  = n => /CTA\s*Button/i.test(n.name||'');

function asRel(n, F) {
  const ab = n.absoluteBoundingBox, fb = F.absoluteBoundingBox;
  if (ab && fb) return {x:Math.round(ab.x-fb.x), y:Math.round(ab.y-fb.y), w:Math.round(ab.width), h:Math.round(ab.height)};
  return {x:Math.round(n.x||0), y:Math.round(n.y||0), w:Math.round(n.width||0), h:Math.round(n.height||0)};
}

function findHead(F) {
  let best=null, bestPx=0;
  function walk(n,d){
    if(d>2)return;
    if(n.type==='TEXT'){try{const fp=Math.round(n.fontSize);if(fp>bestPx){bestPx=fp;best={n,fp};}}catch(_){}}
    if('children' in n)for(const c of n.children)walk(c,d+1);
  }
  for (const c of F.children) walk(c,0);
  if (best) {
    const r = asRel(best.n, F);
    return {...r, fontPx: best.fp, lines:(best.n.characters||'').split('\n').length, real:true};
  }
  // 텍스트 없는 프레임: Copy INSTANCE 또는 가장 큰 비-로고/CTA 영역
  for (const n of F.children) {
    if (n.type === 'INSTANCE' && /copy/i.test(n.name||'')) return {...asRel(n,F), instance:true};
  }
  let bestArea=0, bestNode=null;
  for (const n of F.children) {
    if (isLogo(n) || isCta(n)) continue;
    const a = (n.width||0)*(n.height||0);
    if (a > bestArea) { bestArea=a; bestNode=n; }
  }
  return bestNode ? {...asRel(bestNode,F), instance:true} : null;
}

const findLogo = F => { for (const n of F.children) if (isLogo(n)) return asRel(n,F); return null; };

function findCta(F) {
  for (const n of F.children) if (isCta(n)) return asRel(n,F);
  const W=F.width, H=F.height;
  for (const n of F.children) {
    if (n.type==='RECTANGLE'||n.type==='FRAME') {
      const r=asRel(n,F);
      if (r.y+r.h > H*0.85 && r.y+r.h <= H+5 && r.w/W > 0.9 && r.h < H*0.4) return r;
    }
  }
  return null;
}

// CTA 하단 정규화 (사용자 룰: 무조건 하단 풀와이드 bar)
function ctaBottom(c, W, H) {
  if (!c) return null;
  let bh = c.h;
  if (bh > H*0.4) bh = Math.max(20, Math.round(H*0.13));
  if (bh < 18)    bh = 24;
  return {x:0, y:H-bh, w:W, h:bh};
}

// ============================================================
// 시안 추출 (모든 프레임)
// ============================================================
const VARIANTS = {};
for (const k of LOCK) {
  VARIANTS[k] = (bySize[k]||[]).map(F => ({
    head: findHead(F), logo: findLogo(F), cta: findCta(F)
  }));
}

// ============================================================
// 폰트 / 컬러 / Logo / 텍스트 헬퍼
// ============================================================
const fonts=await figma.listAvailableFontsAsync();
const hasK=fonts.some(f=>f.fontName.family.toLowerCase().includes('karrot'));
const FAM=hasK?'Karrot Sans':'Noto Sans KR';
const HV=hasK?'Heavy':'Black', BD='Bold';
await figma.loadFontAsync({family:FAM,style:HV});
await figma.loadFontAsync({family:FAM,style:BD});

const hex=s=>({r:parseInt(s.slice(1,3),16)/255,g:parseInt(s.slice(3,5),16)/255,b:parseInt(s.slice(5,7),16)/255});
const T={solid:hex('#ff6600'),text:hex('#212124'),white:hex('#ffffff')};
const fl=c=>[{type:'SOLID',color:c}];

const mainP=await figma.importComponentByKeyAsync('7bd06aa4147de6d53637e133cf38a78659e36f63');
const makeLogo=(h)=>{const i=mainP.createInstance();const s=h/100;i.resize(203*s,100*s);return i;};

const CF=0.97;
const fitSize=(t,mw,p)=>{const L=Math.max(1,...t.split('\n').map(l=>l.length));return Math.max(10,Math.min(p,Math.floor(mw/(L*CF))));};

const F_=(n,w,h)=>{const f=figma.createFrame();f.name=n;f.resize(w,h);f.fills=fl(T.white);f.clipsContent=true;return f;};
const R_=(w,h,c)=>{const x=figma.createRectangle();x.resize(w,h);x.fills=fl(c);x.cornerRadius=0;return x;};
function TX(s,sz,st,c,ww){
  const t=figma.createText();
  t.fontName={family:FAM,style:st};
  t.fontSize=sz;
  t.fills=fl(c);
  t.characters=s;
  t.lineHeight={value:135,unit:'PERCENT'};
  t.letterSpacing={value:-3,unit:'PERCENT'};
  if(ww){t.textAutoResize='HEIGHT';t.resize(ww,10);}
  return t;
}

// ============================================================
// 시안 1개 그리기 (단색 모드)
// ============================================================
function drawVariant(F, w, h, V) {
  const cta = ctaBottom(V.cta, w, h);
  const headMaxY = cta ? cta.y - 8 : h - 8;

  if (V.head) {
    let hx = Math.max(0, Math.min(w-40, V.head.x));
    let hy = Math.max(0, Math.min(headMaxY-20, V.head.y));
    let hw = Math.min(w - hx, V.head.w || w*0.8);
    if (hw < 60) hw = w - hx - 10;
    let hMaxH = Math.min(headMaxY - hy, V.head.h || 100);
    const targetPx = V.head.fontPx || Math.max(14, Math.round(hMaxH * 0.35));
    const sz = fitSize(HEAD, hw, targetPx);
    const head = TX(HEAD, sz, HV, T.text, hw);
    F.appendChild(head); head.x=hx; head.y=hy;
  }

  if (V.logo) {
    const lh = Math.max(14, Math.min(V.logo.h || 24, h - 4));
    const logo = makeLogo(lh);
    F.appendChild(logo);
    logo.x = Math.max(0, Math.min(w - logo.width, V.logo.x));
    logo.y = Math.max(0, Math.min(h - logo.height, V.logo.y));
  }

  if (cta) {
    const bar = R_(cta.w, cta.h, T.solid);
    F.appendChild(bar); bar.x=cta.x; bar.y=cta.y;
    const ctaPx = Math.max(12, Math.min(Math.round(cta.h*0.45), Math.round(w*0.06)));
    const txt = TX(`${CT}  >`, ctaPx, HV, T.white);
    F.appendChild(txt);
    const tw = (CT.length+3) * ctaPx * CF;
    txt.x = Math.round((w - tw)/2);
    txt.y = cta.y + Math.round((cta.h - ctaPx*1.15)/2);
  }
}

// ============================================================
// ClaudeArea 페이지 컨테이너 준비
// ============================================================
const pg=figma.getNodeById('8297:11349');
if (!pg) throw new Error('ClaudeArea(8297:11349) 페이지를 찾을 수 없음');
await figma.setCurrentPageAsync(pg);

let container=pg.children.find(c=>c.name===PAGE_NAME);
if (container) {
  [...container.children].forEach(c=>{try{c.remove();}catch(e){}});
} else {
  let oY=0;
  if (pg.children.length>0) {
    const lo=pg.children.reduce((a,b)=>(a.y+a.height>=b.y+b.height)?a:b);
    oY=lo.y+lo.height+200;
  }
  container=figma.createFrame();
  container.name=PAGE_NAME;
  container.fills=[];
  container.clipsContent=false;
  pg.appendChild(container);
  container.x=0; container.y=oY;
}

// ============================================================
// 모든 시안 그리기
// ============================================================
let cy=0, maxX=0;
const created=[];
for (const k of LOCK) {
  const [W,H] = k.split('x').map(Number);
  const list = VARIANTS[k];
  let cx=0;
  for (let i=0; i<list.length; i++) {
    const F = F_(`${k}_V${i+1}`, W, H);
    container.appendChild(F);
    F.x=cx; F.y=cy;
    drawVariant(F, W, H, list[i]);
    created.push(F);
    cx += W + 60;
  }
  if (cx > maxX) maxX = cx;
  cy += H + 140;
}
container.resize(Math.max(maxX,1), Math.max(cy,1));
figma.viewport.scrollAndZoomIntoView([container]);
figma.notify(`✅ ${PAGE_NAME} · ${created.length} 시안 · ${FAM}`);
return `OK · ${created.length} variants @ ${PAGE_NAME}`;
```

---

## 캠페인 치환

```js
const PAGE_NAME = '당근페이_송금_2604';
const HEAD = '계좌번호 없이\n이름만으로 송금';
const CT   = '당근페이 쓰기';
```

---

## 테스트 → 운영 전환

테스트 모드(단색)에서 layout 검증 후 **운영 카피 출력 시**:
- 같은 코드 그대로 사용 (단색 OK)
- 또는 BG/색을 V별로 다양화하려면 `T.white` 대신 V 인덱스 % 4로 `[white, weak, solid, white]` 주기 (별도 옵션, 기본값 단색)

---

## 데이터 갱신

새 디자인을 시안에 추가하려면:
1. Figma `learning Area` 페이지에 락 10종 사이즈로 새 프레임 추가
2. 자식 노드 이름에 `Logo_korean`/`CTA Button` 등 식별 가능한 이름 사용
3. 다음 스킬 실행 시 자동 반영

---

## 실패 복구

- 헤드가 CTA bar와 겹침: `headMaxY = cta.y - 8` 룰로 자동 회피되지만, 헤드 영역이 너무 좁으면 `fitSize` preferred 더 낮추기
- 로고가 헤드와 겹침: 로고 위치는 원본 좌표 그대로라 충돌 가능. 이 경우 해당 시안은 충돌 사유로 표시 (자동 검증 단계에서 발견)
- 음수 좌표 시안 (mask group이 frame을 벗어남): `clipsContent=true` + clamp로 처리됨
