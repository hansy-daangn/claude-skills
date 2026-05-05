# Figma 배너 제너레이터

`use_figma`의 `code` 파라미터에 그대로 넣어 실행. 캠페인별로 상단 변수만 교체.

1회 실행 = **락 10종 × V1~V4 = 40 프레임** 자동 생성.

각 V는 Figma `learning Area` 페이지의 검증된 제작물에서 **위치/크기 비율을 추출**한 것. 색은 SEED 토큰으로 일반화하되 배치(헤드/로고/CTA 좌표)는 원본 보존.

---

## CTA 룰
- 버튼형 CTA가 헤드/서브와 같은 stack 안 → **inline pill**
- 헤드/서브와 떨어져 있음 → **풀와이드 bar (가로형은 우측 세로 bar)**
- 두 형태가 한 디자인에서 섞이지 않음

## V 구분
같은 사이즈 안에서 V1~V4는 헤드/로고/CTA 위치와 BG가 모두 다르다. 단순 색만 다른 변형 아님.

| V | 출처 패턴 | 배경(SEED) | 특징 |
|---|---|---|---|
| V1 | 텍스트-온리 헤로 | `bg.brand-solid` | 헤드만, CTA 없음, 로고 작게 코너 |
| V2 | 풀블리드 카드 + 풀와이드 CTA | `bg.neutral` (흰색) | 로고 가운데/좌상, 헤드 상단/가운데, 풀와이드 하단 bar |
| V3 | Weak BG + 좌상 로고 + 풀와이드 CTA | `bg.brand-weak` | 로고 위치 다양화 (우상 등), 헤드 상단/좌측, 풀와이드 하단 bar |
| V4 | Color-emphasis 헤드 + 풀와이드 CTA | `bg.neutral` | 헤드 키워드 `fg.brand-solid` 강조, 풀와이드 하단 bar |

A 카테고리(320x100)는 공간 부족으로 CTA가 우측 세로 bar로 변형됨.

---

## 핵심 제약
- `text.height` 사용 금지 → `calcH()` 수식만 사용
- 폰트: Karrot Sans 우선, 미가용 시 Noto Sans KR 폴백 + 노란 경고
- Logo_korean: `importComponentByKeyAsync` (이모지 절대 금지)
- **장식원(deco circle) 금지**
- **새 캠페인 카피 시**: 위치/크기 비율은 원본 보존, 폰트 크기만 fitSize로 자동 조정

---

## 전체 제너레이터 코드

```js
// ============================================================
// 캠페인 변수 (캠페인마다 교체)
// ============================================================
const PAGE_NAME = '노트북_중고거래_2604';
const HEAD      = '비싼 노트북,\n이웃이 살게요';
const HEAD_W    = '이웃이 살게요 →';
const SUB       = '우리 동네 이웃과 당근에서 직거래';
const CT        = '당근 열기';

// ============================================================
// 락 10종 사이즈
// ============================================================
const SIZES = [
  {w:320,  h:100,  cat:'A'},
  {w:300,  h:250,  cat:'B'},
  {w:720,  h:720,  cat:'B'},
  {w:480,  h:320,  cat:'C'},
  {w:1200, h:628,  cat:'C'},
  {w:320,  h:480,  cat:'D'},
  {w:720,  h:960,  cat:'D'},
  {w:768,  h:1024, cat:'D'},
  {w:720,  h:1280, cat:'D'},
  {w:1200, h:1600, cat:'D'},
];

// ============================================================
// TEMPLATES — Figma learning Area에서 추출한 비율 데이터
// 각 카테고리는 V1~V4 (서로 다른 캠페인 4개의 배치 보존)
// 좌표는 비율(0~1)로 저장. 사이즈에 곱해 절대 좌표로 환산.
// ============================================================
const TPL = {
  // A — Wide Thin (320×100): 우측 풀-하이트 세로 bar CTA가 표준
  A: [
    { // V1 - Moloco-style: 텍스트만, CTA 없음
      bg:'solid',
      head:{xR:0.04, yR:0.14, wR:0.74, hR:0.70, fontPxR:0.29, lines:2, color:'inverted', align:'left'},
      cta:null,
      logo:null,
    },
    { // V2 - PickUp-style: 좌 로고 + 가운데 헤드 + 우측 세로 bar
      bg:'weak',
      logo:{xR:0.08, yR:0.29, hR:0.43, white:false},
      head:{xR:0.23, yR:0.14, wR:0.62, hR:0.70, fontPxR:0.20, lines:2, color:'neutral', align:'left'},
      cta:{type:'bar-right', xR:0.90, wR:0.10},
    },
    { // V3 - baro-style: 좌 로고 + 헤드 + 우측 세로 bar (V2와 BG 다름)
      bg:'white',
      logo:{xR:0.063, yR:0.28, hR:0.43, white:false},
      head:{xR:0.20, yR:0.14, wR:0.65, hR:0.70, fontPxR:0.20, lines:2, color:'neutral', align:'left'},
      cta:{type:'bar-right', xR:0.90, wR:0.10},
    },
    { // V4 - jobs-style: 좌측 헤드 + 우측 세로 bar (로고 없이 작은 워드마크 영역)
      bg:'weak',
      head:{xR:0.047, yR:0.15, wR:0.50, hR:0.70, fontPxR:0.22, lines:2, color:'emphasis', align:'left'},
      cta:{type:'bar-right', xR:0.906, wR:0.094},
      logo:null,
    },
  ],

  // B — Square (300×250, 720×720): 풀와이드 하단 bar 또는 CTA 없음 헤로
  B: [
    { // V1 - Moloco-style: Solid + 라벨 + 큰 헤드, CTA 없음
      bg:'solid',
      label:{xR:0.067, yR:0.108, wR:0.413, hR:0.136, fontPxR:0.072, color:'inverted'},
      head:{xR:0.067, yR:0.288, wR:0.78, hR:0.50, fontPxR:0.176, lines:3, color:'inverted', align:'left'},
      cta:null,
      logo:null,
    },
    { // V2 - PickUp-style: White + 좌상 로고 + 헤드 + 풀와이드 하단 bar
      bg:'white',
      logo:{xR:0.08, yR:0.064, wR:0.137, hR:0.092, white:false},
      head:{xR:0.073, yR:0.20, wR:0.85, hR:0.50, fontPxR:0.13, lines:2, color:'neutral', align:'left'},
      cta:{type:'bar-bottom', yR:0.836, hR:0.164},
    },
    { // V3 - google-style: Weak + 헤드 + 좌하 로고, CTA 없음
      bg:'weak',
      head:{xR:0.063, yR:0.084, wR:0.707, hR:0.50, fontPxR:0.156, lines:3, color:'neutral', align:'left'},
      logo:{xR:0.067, yR:0.836, wR:0.33, hR:0.084, white:false},
      cta:null,
    },
    { // V4 - baro-style: White + 좌상 로고 + 헤드(키워드 강조) + 풀와이드 하단 bar
      bg:'white',
      logo:{xR:0.07, yR:0.064, wR:0.137, hR:0.092, white:false},
      head:{xR:0.073, yR:0.20, wR:0.85, hR:0.50, fontPxR:0.13, lines:2, color:'emphasis', align:'left'},
      cta:{type:'bar-bottom', yR:0.836, hR:0.164},
    },
  ],

  // C — Landscape (480×320, 1200×628): 좌헤드 + 풀와이드 하단 bar 표준
  C: [
    { // V1 - Moloco-style: Solid + 좌헤드 (3줄), 풀와이드 하단 bar
      bg:'solid',
      head:{xR:0.048, yR:0.0875, wR:0.465, hR:0.55, fontPxR:0.128, lines:3, color:'inverted', align:'left'},
      cta:{type:'bar-bottom', yR:0.841, hR:0.169},
      logo:null,
    },
    { // V2 - PickUp-style: 풀블리드 (white) + 좌하 로고 + 풀와이드 bar (헤드 슬롯 = 좌상)
      bg:'white',
      logo:{xR:0.056, yR:0.634, wR:0.14, hR:0.119, white:false},
      head:{xR:0.06, yR:0.10, wR:0.56, hR:0.45, fontPxR:0.16, lines:2, color:'neutral', align:'left'},
      cta:{type:'bar-bottom', yR:0.863, hR:0.137},
    },
    { // V3 - baro-style: Weak + 우상 로고 + 좌헤드 + 풀와이드 bar
      bg:'weak',
      logo:{xR:0.852, yR:0.056, wR:0.102, hR:0.0875, white:false},
      head:{xR:0.06, yR:0.10, wR:0.50, hR:0.55, fontPxR:0.14, lines:3, color:'neutral', align:'left'},
      cta:{type:'bar-bottom', yR:0.825, hR:0.175},
    },
    { // V4 - jobs-style: White + 좌상 작은 로고 + 헤드(강조) + 풀와이드 bar
      bg:'white',
      logo:{xR:0.073, yR:0.10, wR:0.104, hR:0.084, white:false},
      head:{xR:0.073, yR:0.269, wR:0.525, hR:0.45, fontPxR:0.13, lines:3, color:'emphasis', align:'left'},
      cta:{type:'bar-bottom', yR:0.828, hR:0.172},
    },
  ],

  // D — Portrait (320×480 등): 상단 헤드 + 풀와이드 하단 bar 표준
  D: [
    { // V1 - Moloco-style: Solid + 가운데 헤드, 풀와이드 하단 bar
      bg:'solid',
      head:{xR:0.06, yR:0.07, wR:0.88, hR:0.55, fontPxR:0.075, lines:3, color:'inverted', align:'left'},
      cta:{type:'bar-bottom', yR:0.808, hR:0.113},
      logo:null,
    },
    { // V2 - PickUp-style: White + 작은 로고 가운데 상단 + 헤드 + 풀와이드 bar
      bg:'white',
      logo:{xR:0.409, yR:0.075, wR:0.169, hR:0.0625, white:false},
      head:{xR:0.06, yR:0.18, wR:0.88, hR:0.50, fontPxR:0.075, lines:2, color:'neutral', align:'left'},
      cta:{type:'bar-bottom', yR:0.867, hR:0.119},
    },
    { // V3 - baro-style: Weak + 작은 로고 가운데 상단 + 헤드 + 풀와이드 bar
      bg:'weak',
      logo:{xR:0.416, yR:0.058, wR:0.169, hR:0.0625, white:false},
      head:{xR:0.06, yR:0.16, wR:0.88, hR:0.55, fontPxR:0.075, lines:2, color:'neutral', align:'left'},
      cta:{type:'bar-bottom', yR:0.89, hR:0.11},
    },
    { // V4 - jobs-style: White + 작은 로고 가운데 상단 + 헤드(강조) + 풀와이드 bar
      bg:'white',
      logo:{xR:0.425, yR:0.058, wR:0.141, hR:0.05, white:false},
      head:{xR:0.097, yR:0.15, wR:0.81, hR:0.55, fontPxR:0.085, lines:3, color:'emphasis', align:'left'},
      cta:{type:'bar-bottom', yR:0.885, hR:0.115},
    },
  ],
};

// ============================================================
// 폰트 / 컬러 / Logo / 텍스트 헬퍼
// ============================================================
const fonts=await figma.listAvailableFontsAsync();
const hasKarrot=fonts.some(f=>f.fontName.family.toLowerCase().includes('karrot'));
const FAM=hasKarrot?'Karrot Sans':'Noto Sans KR';
const HV=hasKarrot?'Heavy':'Black';
const BD='Bold';
await figma.loadFontAsync({family:FAM,style:HV});
await figma.loadFontAsync({family:FAM,style:BD});

const hex=s=>({r:parseInt(s.slice(1,3),16)/255,g:parseInt(s.slice(3,5),16)/255,b:parseInt(s.slice(5,7),16)/255});
const T={solid:hex('#ff6600'),weak:hex('#fff2ec'),text:hex('#212124'),muted:hex('#555b65'),white:hex('#ffffff'),note:hex('#ffcc00')};
const fl=c=>[{type:'SOLID',color:c}];

const mainP=await figma.importComponentByKeyAsync('7bd06aa4147de6d53637e133cf38a78659e36f63');
const mainW=await figma.importComponentByKeyAsync('ccfd3319d4232252f37a5de518cd0631f2174e22');
const makeLogo=(h,white=false)=>{const i=(white?mainW:mainP).createInstance();const s=h/100;i.resize(203*s,100*s);return i;};

const CF=0.97,LH=1.35;
const fitSize=(t,mw,p)=>{const L=Math.max(1,...t.split('\n').map(l=>l.length));return Math.max(10,Math.min(p,Math.floor(mw/(L*CF))));};
const calcH=(t,sz,mw)=>{const c=Math.max(1,Math.floor(mw/(sz*CF)));const l=t.split('\n').reduce((a,x)=>a+Math.max(1,Math.ceil(x.length/c)),0);return Math.ceil(l*sz*LH);};

const F_=(n,w,h,bg)=>{const f=figma.createFrame();f.name=n;f.resize(w,h);f.fills=fl(bg);f.clipsContent=true;return f;};
const R_=(w,h,c,r=0)=>{const x=figma.createRectangle();x.resize(w,h);x.fills=fl(c);x.cornerRadius=r;return x;};
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
// 배경 → 텍스트 색 매핑 (SEED 일반화 룰)
// ============================================================
const BG = { solid:T.solid, weak:T.weak, white:T.white };
function colorOf(name, bgKey){
  if(name==='inverted') return T.white;
  if(name==='neutral') return T.text;
  if(name==='muted')   return T.muted;
  if(name==='emphasis')return T.solid;  // 강조 키워드는 brand-solid
  return T.text;
}

// ============================================================
// 시안 적용 (TEMPLATE에 정의된 비율로 절대 좌표 환산 후 그리기)
// ============================================================
async function apply(F, w, h, V) {
  F.fills = fl(BG[V.bg]);

  // 라벨 (B-V1 Moloco-style의 "총 1억원 혜택" 같은 작은 라벨)
  if (V.label) {
    const lx=Math.round(w*V.label.xR), ly=Math.round(h*V.label.yR);
    const lw=Math.round(w*V.label.wR), lh=Math.round(h*V.label.hR);
    const lpx=Math.max(10, Math.round(h*V.label.fontPxR));
    const labelFrame = R_(lw, lh, T.solid, 9999);
    F.appendChild(labelFrame); labelFrame.x=lx; labelFrame.y=ly;
    const lt = TX('총 혜택 안내', lpx, HV, colorOf(V.label.color));
    F.appendChild(lt); lt.x=lx+Math.round(lw*0.1); lt.y=ly+Math.round((lh-lpx)/2);
  }

  // Logo
  if (V.logo) {
    const lh = Math.round(h*V.logo.hR);
    const logo = makeLogo(lh, !!V.logo.white);
    F.appendChild(logo);
    logo.x = Math.round(w*V.logo.xR);
    logo.y = Math.round(h*V.logo.yR);
  }

  // Head
  if (V.head) {
    const hx=Math.round(w*V.head.xR), hy=Math.round(h*V.head.yR);
    const hw=Math.round(w*V.head.wR), hMaxH=Math.round(h*V.head.hR);
    const targetPx=Math.max(10, Math.round(h*V.head.fontPxR));
    const hSz=fitSize(HEAD, hw, targetPx);
    const head = TX(HEAD, hSz, HV, colorOf(V.head.color), hw);
    F.appendChild(head);
    head.x=hx; head.y=hy;
  }

  // Sub
  if (V.sub) {
    const sx=Math.round(w*V.sub.xR), sy=Math.round(h*V.sub.yR);
    const sw=Math.round(w*V.sub.wR);
    const targetPx=Math.max(9, Math.round(h*V.sub.fontPxR));
    const sSz=fitSize(SUB, sw, targetPx);
    const sub = TX(SUB, sSz, BD, colorOf(V.sub.color || 'muted'), sw);
    F.appendChild(sub); sub.x=sx; sub.y=sy;
  }

  // CTA
  if (V.cta) {
    if (V.cta.type === 'bar-bottom') {
      const by = Math.round(h*V.cta.yR);
      const bh = Math.round(h*V.cta.hR);
      const bar = R_(w, bh, T.solid);
      F.appendChild(bar); bar.x=0; bar.y=by;
      const ctaPx = Math.max(12, Math.round(bh*0.40));
      const ctaText = TX(`${CT}  >`, ctaPx, HV, T.white);
      F.appendChild(ctaText);
      const tw = (CT.length+3)*ctaPx*CF;
      ctaText.x=Math.round((w-tw)/2);
      ctaText.y=by+Math.round((bh-ctaPx*1.15)/2);
    } else if (V.cta.type === 'bar-right') {
      const bx = Math.round(w*V.cta.xR);
      const bw = Math.round(w*V.cta.wR);
      const bar = R_(bw, h, T.solid);
      F.appendChild(bar); bar.x=bx; bar.y=0;
      const arPx = Math.max(14, Math.round(bw*0.6));
      const arrow = TX('→', arPx, HV, T.white);
      F.appendChild(arrow);
      arrow.x = bx+Math.round((bw-arPx*0.7)/2);
      arrow.y = Math.round((h-arPx*1.1)/2);
    }
    // inline-pill은 현재 데이터에서 안 나옴. 필요 시 추가.
  }
}

// ============================================================
// 배치
// ============================================================
const CLAUDE_AREA_ID='8297:11349';
const pg=figma.getNodeById(CLAUDE_AREA_ID);
if(!pg)throw new Error('Claude Area 페이지를 찾을 수 없음');
await figma.setCurrentPageAsync(pg);

let container=pg.children.find(c=>c.name===PAGE_NAME);
if(container){[...container.children].forEach(c=>{try{c.remove();}catch(e){}});}
else{
  let oX=0,oY=0;
  if(pg.children.length>0){
    const lowest=pg.children.reduce((a,b)=>(a.y+a.height>=b.y+b.height)?a:b);
    oX=0;oY=lowest.y+lowest.height+200;
  }
  container=figma.createFrame();
  container.name=PAGE_NAME;
  container.fills=[];container.clipsContent=false;
  pg.appendChild(container);container.x=oX;container.y=oY;
}

const COL_GAP=80, ROW_GAP=160;
let cy=0,maxX=0;
const created=[];
for(const sz of SIZES){
  const variants = TPL[sz.cat];
  let cx=0;
  for(let i=0;i<4;i++){
    const V = variants[i];
    const F = F_(`${sz.w}×${sz.h}_V${i+1}`, sz.w, sz.h, BG[V.bg]);
    container.appendChild(F);
    F.x=cx; F.y=cy;
    await apply(F, sz.w, sz.h, V);
    created.push(F);
    cx += sz.w + COL_GAP;
  }
  if(cx>maxX) maxX=cx;
  cy += sz.h + ROW_GAP;
}
container.resize(Math.max(maxX,1), Math.max(cy,1));
figma.viewport.scrollAndZoomIntoView([container]);
figma.currentPage.selection=created;
figma.notify(`✅ ${PAGE_NAME} · ${created.length} frames · ${FAM}`);
return `OK · ${created.length} frames @ ${PAGE_NAME}`;
```

---

## 캠페인 치환 예시

```js
const PAGE_NAME='당근페이_송금_2604';
const HEAD='계좌번호 없이\n이름만으로 송금';
const HEAD_W='이름만으로 송금 →';
const SUB='직거래 후 바로 당근페이로';
const CT='당근페이 쓰기';
```

---

## 실패 복구
1. 새 카피가 너무 길어 헤드 영역을 넘침 → fitSize의 hMaxH 한계로 자동 축소되지만, 너무 작아지면 다른 V로 변경 권장
2. CTA bar 위 텍스트가 안 보임 → bar 색(`bg.brand-solid`)과 텍스트 색(`fg.neutral-inverted`) 대비 확인
3. A 카테고리 우측 세로 bar가 가려짐 → bar의 cornerRadius=0 확인
4. Logo 위치가 화면 밖 → V.logo.xR/yR가 0~(1-scale) 안에 있는지 확인

---

## TEMPLATE 갱신 룰

새로운 캠페인의 검증된 디자인을 추가하려면:
1. Figma `learning Area`에 락 10종 사이즈로 추가
2. `use_figma`로 해당 프레임의 자식 노드 좌표/크기 추출
3. `frame.W`/`frame.H`로 나눠 비율로 변환
4. `TPL.{cat}` 배열의 V 객체 추가/교체
5. 색은 `bg`/`color` 키로 SEED 토큰 매핑 (원본 색 무시)
