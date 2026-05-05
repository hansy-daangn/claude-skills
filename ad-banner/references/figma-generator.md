# Figma 배너 제너레이터

`use_figma`의 `code` 파라미터에 그대로 넣어 실행. 캠페인별로 상단 변수만 교체.

1회 실행 = **락 10종 × V1~V4 = 40 프레임** 자동 생성. 사이즈마다 한 행에 V1→V4 가로 배치, 사이즈 누적 세로.

---

## 환경 사전 조건
1. **기본 작업 파일/페이지** (전역 규칙, `~/.claude/CLAUDE.md` 참조):
   - fileKey: `CVeyCAgnLzNqGPbKlHh8wN` (HANSY)
   - 작업 페이지: `Claude Area` (id: `8297:11349`)
   - 사용자가 다른 파일/페이지 명시 시에만 예외
2. Logo_korean 컴포넌트 접근 가능 (당근 enterprise workspace)
3. 이미지 사용하려면 같은 파일에 `assets` 페이지 + `img_<name>` 프레임에 이미지 업로드 필요

---

## 핵심 제약
- `text.height` 사용 금지 → `calcH()` 수식만 사용 (Figma Plugin API가 textAutoResize 후 즉시 height 업데이트 안 함)
- 폰트: Karrot Sans 우선, 미가용 시 Noto Sans KR Black/Bold 폴백 + 노란 경고 프레임
- Logo_korean: `importComponentByKeyAsync` (이모지 절대 금지)
- 이미지: `figma.createImage / figma.createImageAsync(url)` 둘 다 cloud sandbox에서 차단됨. assets 페이지에 사용자가 직접 업로드한 이미지의 imageHash를 재활용하는 방식만 가능.
- **장식원(deco circle) 금지** — 어떤 V에도 사용하지 않는다.

---

## V1~V4 골격 (사이즈/카테고리 무관)

| V | 배경 | 헤드 색 | CTA |
|---|---|---|---|
| V1 | 흰색 | `fg.neutral` | 풀와이드 하단 `bg.brand-solid` 버튼 |
| V2 | `bg.brand-solid` | white | 없음 (D는 `bg.brand-weak` 작은 CTA) |
| V3 | `bg.brand-weak` | `fg.neutral` | 풀와이드 또는 인라인 |
| V4 | 흰색 (B는 solid) | `fg.brand-solid` (B/V4는 white) | 풀와이드 또는 없음 |

---

## 전체 제너레이터 코드

```js
// ============================================================
// 캠페인 변수 (캠페인마다 교체)
// ============================================================
const PAGE_NAME  = '노트북_중고거래_2604';        // [주제]_[MMDD]
const HEAD       = '비싼 노트북,\n이웃이 살게요';   // 2~3줄
const HEAD_W     = '이웃이 살게요 →';              // Wide Thin용 1줄
const SUB        = '우리 동네 이웃과 당근에서 직거래';
const CT         = '당근 열기';                   // 3~6자

// ============================================================
// 락 10종 사이즈 × V1~V4 변형
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
const VARIANTS = ['V1','V2','V3','V4'];

// ============================================================
// 폰트
// ============================================================
const fonts=await figma.listAvailableFontsAsync();
const hasKarrot=fonts.some(f=>f.fontName.family.toLowerCase().includes('karrot'));
const FAM=hasKarrot?'Karrot Sans':'Noto Sans KR';
const HV=hasKarrot?'Heavy':'Black';
const BD='Bold';
await figma.loadFontAsync({family:FAM,style:HV});
await figma.loadFontAsync({family:FAM,style:BD});
const needsFontNote=!hasKarrot;

// ============================================================
// SEED 컬러
// ============================================================
const hex=s=>({r:parseInt(s.slice(1,3),16)/255,g:parseInt(s.slice(3,5),16)/255,b:parseInt(s.slice(5,7),16)/255});
const T={solid:hex('#ff6600'),weak:hex('#fff2ec'),text:hex('#212124'),muted:hex('#555b65'),white:hex('#ffffff'),note:hex('#ffcc00'),black:hex('#000000')};
const fl=c=>[{type:'SOLID',color:c}];

// ============================================================
// Logo_korean
// ============================================================
const mainP=await figma.importComponentByKeyAsync('7bd06aa4147de6d53637e133cf38a78659e36f63');
const mainW=await figma.importComponentByKeyAsync('ccfd3319d4232252f37a5de518cd0631f2174e22');
const makeLogo=(h,white=false)=>{const i=(white?mainW:mainP).createInstance();const s=h/100;i.resize(203*s,100*s);return i;};

// ============================================================
// 텍스트 계산 (LH=1.35: SEED $line-height 토큰 비율)
// ============================================================
const CF=0.97,LH=1.35;
const fitSize=(t,mw,p)=>{const L=Math.max(1,...t.split('\n').map(l=>l.length));return Math.max(10,Math.min(p,Math.floor(mw/(L*CF))));};
const calcH=(t,sz,mw)=>{const c=Math.max(1,Math.floor(mw/(sz*CF)));const l=t.split('\n').reduce((a,x)=>a+Math.max(1,Math.ceil(x.length/c)),0);return Math.ceil(l*sz*LH);};
const ctaH=sz=>Math.ceil(sz*1.15)+2*Math.round(sz*0.45);

// ============================================================
// 헬퍼
// ============================================================
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
function Pill(label,sz,ph,pv,bg,fg){
  const f=figma.createFrame();
  f.layoutMode='HORIZONTAL';f.primaryAxisAlignItems='CENTER';f.counterAxisAlignItems='CENTER';
  f.primaryAxisSizingMode='AUTO';f.counterAxisSizingMode='AUTO';
  f.paddingLeft=f.paddingRight=ph;f.paddingTop=f.paddingBottom=pv;
  f.fills=fl(bg);f.cornerRadius=9999;
  const t=figma.createText();
  t.fontName={family:FAM,style:HV};
  t.fontSize=sz;t.fills=fl(fg);t.characters=label;
  t.letterSpacing={value:-2,unit:'PERCENT'};
  f.appendChild(t);
  return f;
}
const CTA=(l,sz,bg,fg)=>Pill(l,sz,Math.round(sz*1.1),Math.round(sz*0.45),bg||T.solid,fg||T.white);
// 풀와이드 CTA bar (V1/V3/V4 D 카테고리에서)
function CTABar(F,w,h,pad,label,sz,bg,fg){
  const cH=ctaH(sz);
  const bar=R_(w,cH,bg,9999);
  F.appendChild(bar);bar.x=0;bar.y=h-cH;
  const t=TX(label,sz,HV,fg);F.appendChild(t);
  // center text horizontally on bar
  const tw=label.length*sz*CF;
  t.x=Math.round((w-tw)/2);t.y=Math.round(h-cH+(cH-sz*1.15)/2);
  // arrow
  const ar=TX(' >',sz,HV,fg);F.appendChild(ar);ar.x=Math.round((w+tw)/2);ar.y=t.y;
  return cH;
}

// ============================================================
// V별 색상 토큰 결정 헬퍼
// ============================================================
function vColors(V, cat){
  // returns {bg, headFg, subFg, ctaBg, ctaFg, logoWhite}
  if(V==='V1') return {bg:T.white, headFg:T.text, subFg:T.muted, ctaBg:T.solid, ctaFg:T.white, logoWhite:false};
  if(V==='V2') return {bg:T.solid, headFg:T.white, subFg:T.white, ctaBg:T.weak, ctaFg:T.text, logoWhite:true};
  if(V==='V3') return {bg:T.weak,  headFg:T.text, subFg:T.muted, ctaBg:T.solid, ctaFg:T.white, logoWhite:false};
  if(V==='V4'){
    if(cat==='B') return {bg:T.solid, headFg:T.white, subFg:T.white, ctaBg:T.weak, ctaFg:T.text, logoWhite:true};
    return {bg:T.white, headFg:T.solid, subFg:T.muted, ctaBg:T.solid, ctaFg:T.white, logoWhite:false};
  }
}

// ============================================================
// 레이아웃 A — Wide Thin (≥2.5)  ─  V1~V4
// ============================================================
async function layA(F,w,h,V){
  const c=vColors(V,'A');
  F.fills=fl(c.bg);
  const pad=Math.round(w*0.05);

  if(V==='V3'){
    // White card + 우측 brand-solid 정사각 → 박스
    F.fills=fl(T.white);
    const arrowBox=R_(h,h,T.solid);F.appendChild(arrowBox);arrowBox.x=w-h;arrowBox.y=0;
    const ar=TX('→',Math.round(h*0.5),HV,T.white);F.appendChild(ar);ar.x=w-h+Math.round(h*0.28);ar.y=Math.round(h*0.18);
    const logo=makeLogo(Math.round(h*0.36),false);
    F.appendChild(logo);logo.x=pad;logo.y=Math.round((h-logo.height)/2);
    const headLeft=logo.x+logo.width+Math.round(w*0.035);
    const headMaxW=(w-h)-pad-headLeft;
    const hSz=fitSize(HEAD,headMaxW,Math.round(h*0.20));
    const hH=calcH(HEAD,hSz,headMaxW);
    const head=TX(HEAD,hSz,HV,T.text,headMaxW);
    F.appendChild(head);head.x=headLeft;head.y=Math.round((h-hH)/2);
    return;
  }

  if(V==='V4'){
    F.fills=fl(T.weak);
    const logo=makeLogo(Math.round(h*0.36),false);
    F.appendChild(logo);logo.x=pad;logo.y=Math.round((h-logo.height)/2);
    const headLeft=logo.x+logo.width+Math.round(w*0.035);
    const cW=Math.round(w*0.55)-headLeft;
    const hSz=fitSize(HEAD,cW,Math.round(h*0.20));
    const hH=calcH(HEAD,hSz,cW);
    const head=TX(HEAD,hSz,HV,T.text,cW);
    F.appendChild(head);head.x=headLeft;head.y=Math.round((h-hH)/2);
    // 우측 끝 → arrow
    const ar=TX('→',Math.round(h*0.36),HV,T.solid);F.appendChild(ar);ar.x=w-pad-Math.round(h*0.36);ar.y=Math.round(h*0.30);
    // 우측 일러스트 슬롯 (placeholder, 사용자가 채움)
    return;
  }

  // V1, V2 — Solid + Logo + Head + 우측 → arrow
  const logo=makeLogo(Math.round(h*0.36),true);
  F.appendChild(logo);logo.x=pad;logo.y=Math.round((h-logo.height)/2);
  const headLeft=logo.x+logo.width+Math.round(w*0.035);
  const headMaxW=w-pad-headLeft-Math.round(h*0.40); // 우측 → 공간
  const headText = (V==='V1') ? HEAD_W : HEAD;
  const headPx   = (V==='V1') ? Math.round(h*0.36) : Math.round(h*0.20);
  const hSz=fitSize(headText,headMaxW,headPx);
  const hH=calcH(headText,hSz,headMaxW);
  const head=TX(headText,hSz,HV,T.white,headMaxW);
  F.appendChild(head);head.x=headLeft;head.y=Math.round((h-hH)/2);
  const ar=TX('→',Math.round(h*0.36),HV,T.white);F.appendChild(ar);ar.x=w-pad-Math.round(h*0.36);ar.y=Math.round(h*0.30);
}

// ============================================================
// 레이아웃 B — Square (0.9~1.3)  ─  V1~V4
// ============================================================
async function layB(F,w,h,V){
  const c=vColors(V,'B');
  F.fills=fl(c.bg);
  const pad=Math.round(Math.min(w,h)*0.075);
  const logo=makeLogo(Math.round(h*0.085),c.logoWhite);
  F.appendChild(logo);logo.x=pad;logo.y=pad;
  const cW=w-pad*2;

  if(V==='V4'){
    // Solid + Bold-only (Sub/CTA 없음, 큰 헤드만)
    const hSz=fitSize(HEAD,cW,Math.round(h*0.16));
    const hH=calcH(HEAD,hSz,cW);
    const head=TX(HEAD,hSz,HV,c.headFg,cW);
    F.appendChild(head);head.x=pad;head.y=Math.round((h-hH)/2);
    return;
  }

  if(V==='V2'){
    // Solid Hero — 상단 큰 헤드, CTA/Sub 없음
    const hSz=fitSize(HEAD,cW,Math.round(h*0.14));
    const hH=calcH(HEAD,hSz,cW);
    const head=TX(HEAD,hSz,HV,c.headFg,cW);
    F.appendChild(head);head.x=pad;head.y=pad+Math.round(h*0.085)+Math.round(h*0.06);
    return;
  }

  // V1, V3 — bottom stack (Head→Sub→CTA, bottom-up)
  const hSz=fitSize(HEAD,cW,Math.round(h*0.11));
  const sSz=fitSize(SUB,cW,Math.round(h*0.046));
  const cSz=Math.round(h*0.058);
  const hH=calcH(HEAD,hSz,cW);
  const sH=calcH(SUB,sSz,cW);
  const cH=ctaH(cSz);
  const cta=CTA(CT,cSz,c.ctaBg,c.ctaFg);F.appendChild(cta);cta.x=pad;cta.y=h-pad-cH;
  const sub=TX(SUB,sSz,BD,c.subFg,cW);F.appendChild(sub);sub.x=pad;sub.y=cta.y-Math.round(h*0.035)-sH;
  const head=TX(HEAD,hSz,HV,c.headFg,cW);F.appendChild(head);head.x=pad;head.y=sub.y-Math.round(h*0.015)-hH;
}

// ============================================================
// 레이아웃 C — Landscape (1.3~2.5)  ─  V1~V4
// ============================================================
async function layC(F,w,h,V){
  const c=vColors(V,'C');
  F.fills=fl(c.bg);
  const pad=Math.round(h*0.08);
  const logoH=Math.round(h*0.115);
  const logo=makeLogo(logoH,c.logoWhite);
  F.appendChild(logo);logo.x=pad;logo.y=pad;
  const cW=Math.round(w*0.58);

  if(V==='V2'){
    // Solid Hero — 좌측 헤드만, CTA 없음
    const hSz=fitSize(HEAD,cW,Math.round(h*0.20));
    const hH=calcH(HEAD,hSz,cW);
    const head=TX(HEAD,hSz,HV,c.headFg,cW);
    F.appendChild(head);head.x=pad;head.y=pad+logoH+Math.round(h*0.05);
    return;
  }

  // V1, V3, V4 — 좌헤드(+sub/CTA)
  const sSz=fitSize(SUB,cW,Math.round(h*0.058));
  const cSz=Math.round(h*0.072);
  const sH=calcH(SUB,sSz,cW);
  const cH=ctaH(cSz);

  if(V==='V1' || V==='V4'){
    // 풀와이드 하단 CTA bar
    const cta=CTA(CT,cSz,c.ctaBg,c.ctaFg);F.appendChild(cta);cta.x=pad;cta.y=h-pad-cH;
    const headPx=(V==='V4')?Math.round(h*0.18):Math.round(h*0.20);
    let hSz=fitSize(HEAD,cW,headPx);
    let hH=calcH(HEAD,hSz,cW);
    const maxHeadH=h-pad-logoH-Math.round(h*0.05)-cH-Math.round(h*0.05)-pad;
    while(hH>maxHeadH&&hSz>10){hSz--;hH=calcH(HEAD,hSz,cW);}
    const head=TX(HEAD,hSz,HV,c.headFg,cW);F.appendChild(head);head.x=pad;head.y=pad+logoH+Math.round(h*0.05);
    return;
  }

  // V3 — bottom stack (기존 Weak)
  const cta=CTA(CT,cSz,c.ctaBg,c.ctaFg);F.appendChild(cta);cta.x=pad;cta.y=h-pad-cH;
  const sub=TX(SUB,sSz,BD,c.subFg,cW);F.appendChild(sub);sub.x=pad;sub.y=cta.y-Math.round(h*0.05)-sH;
  let hSz=fitSize(HEAD,cW,Math.round(h*0.14));
  let hH=calcH(HEAD,hSz,cW);
  const head=TX(HEAD,hSz,HV,c.headFg,cW);F.appendChild(head);head.x=pad;head.y=sub.y-Math.round(h*0.025)-hH;
}

// ============================================================
// 레이아웃 D — Portrait (<0.9)  ─  V1~V4
// ============================================================
async function layD(F,w,h,V){
  const c=vColors(V,'D');
  F.fills=fl(c.bg);
  const pad=Math.round(w*0.065);
  const logoH=Math.round(h*0.055);
  // V1/V2/V4 — 상단 가운데 로고
  const logoCenter=(V==='V1'||V==='V2'||V==='V4');
  const logo=makeLogo(logoH,c.logoWhite);
  F.appendChild(logo);
  if(logoCenter){
    logo.x=Math.round((w-logo.width)/2);logo.y=pad;
  }else{
    logo.x=pad;logo.y=pad;
  }
  const cW=w-pad*2;
  const cSz=Math.round(h*0.048);
  const cH=ctaH(cSz);
  const sSz=fitSize(SUB,cW,Math.round(h*0.032));
  const sH=calcH(SUB,sSz,cW);

  // 모든 V (Portrait)는 풀와이드 하단 CTA bar (V2는 weak bg, V1/V3/V4는 solid)
  const cta=CTA(CT,cSz,c.ctaBg,c.ctaFg);F.appendChild(cta);cta.x=pad;cta.y=h-pad-cH;

  if(V==='V3'){
    // Sub 포함 (Weak Stack)
    const sub=TX(SUB,sSz,BD,c.subFg,cW);F.appendChild(sub);sub.x=pad;sub.y=pad+logoH+Math.round(h*0.04);
    let hSz=fitSize(HEAD,cW,Math.round(h*0.08));
    let hH=calcH(HEAD,hSz,cW);
    // V3는 좌상 로고 + 상단 Head + 하단 sub. 단순화: 상단 스택
    const head=TX(HEAD,hSz,HV,c.headFg,cW);F.appendChild(head);head.x=pad;head.y=pad+logoH+Math.round(h*0.04);
    sub.y=head.y+hH+Math.round(h*0.015);
    return;
  }

  // V1, V2, V4 — 상단 헤드 (Sub 없음)
  const headPx=(V==='V2')?Math.round(h*0.10):(V==='V4'?Math.round(h*0.09):Math.round(h*0.08));
  const hSz=fitSize(HEAD,cW,headPx);
  const hH=calcH(HEAD,hSz,cW);
  const head=TX(HEAD,hSz,HV,c.headFg,cW);
  F.appendChild(head);head.x=pad;head.y=pad+logoH+Math.round(h*0.04);
}

// ============================================================
// 카테고리 → 빌더 매핑
// ============================================================
const BUILDERS={A:layA,B:layB,C:layC,D:layD};

// ============================================================
// Claude Area 페이지에 컨테이너 frame으로 배치
// ============================================================
const CLAUDE_AREA_ID='8297:11349';
const pg=figma.getNodeById(CLAUDE_AREA_ID);
if(!pg)throw new Error('Claude Area 페이지를 찾을 수 없음');
await figma.setCurrentPageAsync(pg);

const _d=new Date();
const yymmdd=_d.getFullYear().toString().slice(2)+String(_d.getMonth()+1).padStart(2,'0')+String(_d.getDate()).padStart(2,'0');

let container=pg.children.find(c=>c.name===PAGE_NAME);
if(container){
  [...container.children].forEach(c=>{try{c.remove();}catch(e){}});
}else{
  let oX=0,oY=0;
  const todayKids=pg.children.filter(c=>c.name.includes(yymmdd));
  if(todayKids.length>0){
    const last=todayKids.reduce((a,b)=>(a.x+a.width>=b.x+b.width)?a:b);
    oX=last.x+last.width+120;
    oY=todayKids.reduce((a,b)=>a.y<b.y?a:b).y;
  }else if(pg.children.length>0){
    const lowest=pg.children.reduce((a,b)=>(a.y+a.height>=b.y+b.height)?a:b);
    oX=0;
    oY=lowest.y+lowest.height+200;
  }
  container=figma.createFrame();
  container.name=PAGE_NAME;
  container.fills=[];
  container.clipsContent=false;
  pg.appendChild(container);
  container.x=oX;container.y=oY;
}

if(needsFontNote){
  const note=F_('⚠️ 폰트 교체 안내',1800,70,T.note);
  container.appendChild(note);note.x=0;note.y=-110;
  const nt=TX('⚠️ Noto Sans KR Black/Bold (임시) → Figma 데스크톱에서 Karrot Sans로 교체',22,HV,T.text);
  note.appendChild(nt);nt.x=20;nt.y=22;
}

// ============================================================
// 40 프레임 생성 (사이즈 행 × V1~V4 열)
// ============================================================
const COL_GAP=80, ROW_GAP=160;
let cy=0,maxX=0;
const created=[];
for(const sz of SIZES){
  let cx=0;
  for(const V of VARIANTS){
    const F=F_(`${sz.w}×${sz.h}_${V}`, sz.w, sz.h, T.white);
    container.appendChild(F);
    F.x=cx;F.y=cy;
    await BUILDERS[sz.cat](F, sz.w, sz.h, V);
    created.push(F);
    cx += sz.w + COL_GAP;
  }
  if(cx>maxX) maxX=cx;
  cy += sz.h + ROW_GAP;
}
container.resize(Math.max(maxX,1), Math.max(cy,1));

figma.viewport.scrollAndZoomIntoView([container]);
figma.currentPage.selection = created;
figma.notify(`✅ ${PAGE_NAME} · 40 프레임 (10 × V1~V4) · ${FAM}`);
return `OK · ${PAGE_NAME} @ Claude Area · ${created.length} frames`;
```

---

## 캠페인 치환 예시

### 노트북 중고거래
```js
const PAGE_NAME='노트북_중고거래_2604';
const HEAD='비싼 노트북,\n이웃이 살게요';
const HEAD_W='이웃이 살게요 →';
const SUB='우리 동네 이웃과 당근에서 직거래';
const CT='당근 열기';
```

### 당근페이 송금
```js
const PAGE_NAME='당근페이_송금_2604';
const HEAD='계좌번호 없이\n이름만으로 송금';
const HEAD_W='이름만으로 송금 →';
const SUB='직거래 후 바로 당근페이로';
const CT='당근페이 쓰기';
```

---

## 실패 복구
1. `text.height`가 10 반환 → `calcH` 사용 확인
2. 헤드 프레임 밖으로 → `fitSize` 적용 확인
3. CTA 겹침 → bottom-up 스태킹 순서 확인 (`cta → sub → head`)
4. 로고 이모지 → `importComponentByKeyAsync` 호출 확인
5. Karrot Sans 미로드 → `hasKarrot` 플래그 + 노란 경고 노트 확인
6. V2(Solid) 위 헤드 잘림 → headPx 비율 (`h × 0.14` B / `h × 0.20` C / `h × 0.10` D) 재확인
