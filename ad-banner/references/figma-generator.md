# Figma 배너 제너레이터 — 검증된 코드 템플릿

이 코드는 실제 10개 배너 생성에 성공한 **검증된** 스크립트.  
`mcp__<figma>__use_figma` 툴의 `code` 파라미터에 이 스크립트를 **그대로** 투입. 주제별로 `HEAD`, `HEAD_W`, `SUB`, `CT` 문구만 치환.

---

## 실행 환경 사전 조건

1. Figma 파일 존재 (`fileKey` 확보)
2. Logo_korean 컴포넌트 접근 가능 (당근 enterprise workspace)
3. `seed-design-figma` MCP 연결됨

---

## 중요 제약 (반드시 지킬 것)

### ❌ `text.height` 사용 금지
`textAutoResize='HEIGHT'` + `resize(w, 10)` 이후 `.height`는 **10을 반환**한다. 실제 렌더 높이와 다름.

### ✅ 대신 `calcH()` 수식 사용
```js
const CF = 0.97;  // Korean Noto Black, letter-spacing -3%
const LH = 1.08;

function calcH(text, size, maxW) {
  const chs = Math.max(1, Math.floor(maxW / (size * CF)));
  const lines = text.split('\n').reduce((t, l) => t + Math.max(1, Math.ceil(l.length / chs)), 0);
  return Math.ceil(lines * size * LH);
}

function fitSize(text, maxW, preferred) {
  const longest = Math.max(1, ...text.split('\n').map(l => l.length));
  return Math.max(10, Math.min(preferred, Math.floor(maxW / (longest * CF))));
}

function ctaH(size) { return Math.ceil(size * 1.2) + 2 * Math.round(size * 0.8); }
```

### ✅ 폰트: Karrot Sans 우선, 실패 시 Noto Sans KR Black
```js
const fonts = await figma.listAvailableFontsAsync();
const hasKarrot = fonts.some(f => f.fontName.family.toLowerCase().includes('karrot'));
const FAM = hasKarrot ? 'Karrot Sans' : 'Noto Sans KR';
const HV = hasKarrot ? 'Heavy' : 'Black';
const BD = 'Bold';
await figma.loadFontAsync({family: FAM, style: HV});
await figma.loadFontAsync({family: FAM, style: BD});
const needsFontNote = !hasKarrot;
```

### ✅ Logo_korean 컴포넌트
```js
const LOGO_PRIMARY = '7bd06aa4147de6d53637e133cf38a78659e36f63';
const LOGO_WHITE   = 'ccfd3319d4232252f37a5de518cd0631f2174e22';
const mainP = await figma.importComponentByKeyAsync(LOGO_PRIMARY);
const mainW = await figma.importComponentByKeyAsync(LOGO_WHITE);

function makeLogo(height, white = false) {
  const inst = (white ? mainW : mainP).createInstance();
  const s = height / 100;
  inst.resize(203 * s, 100 * s);
  return inst;
}
```

---

## 전체 제너레이터 코드 (바로 `use_figma`에 투입)

```js
// === 폰트 ===
const fonts = await figma.listAvailableFontsAsync();
const hasKarrot = fonts.some(f => f.fontName.family.toLowerCase().includes('karrot'));
const FAM = hasKarrot ? 'Karrot Sans' : 'Noto Sans KR';
const HV = hasKarrot ? 'Heavy' : 'Black';
const BD = 'Bold';
await figma.loadFontAsync({family:FAM, style:HV});
await figma.loadFontAsync({family:FAM, style:BD});
const needsFontNote = !hasKarrot;

// === SEED 컬러 ===
const hex=s=>({r:parseInt(s.slice(1,3),16)/255,g:parseInt(s.slice(3,5),16)/255,b:parseInt(s.slice(5,7),16)/255});
const T={solid:hex('#ff6600'),weak:hex('#fff2ec'),text:hex('#212124'),muted:hex('#555b65'),white:hex('#ffffff'),note:hex('#ffcc00')};
const fl=c=>[{type:'SOLID',color:c}];

// === Logo_korean ===
const mainP=await figma.importComponentByKeyAsync('7bd06aa4147de6d53637e133cf38a78659e36f63');
const mainW=await figma.importComponentByKeyAsync('ccfd3319d4232252f37a5de518cd0631f2174e22');
const makeLogo=(h,w=false)=>{const i=(w?mainW:mainP).createInstance();const s=h/100;i.resize(203*s,100*s);return i;};

// === 텍스트 크기·높이 계산 ===
const CF=0.97, LH=1.35; // SEED $line-height.tN/$font-size.tN ≈ 135%
const fitSize=(t,mw,pref)=>{const L=Math.max(1,...t.split('\n').map(l=>l.length));return Math.max(10,Math.min(pref,Math.floor(mw/(L*CF))));};
const calcH=(t,sz,mw)=>{const c=Math.max(1,Math.floor(mw/(sz*CF)));const l=t.split('\n').reduce((a,x)=>a+Math.max(1,Math.ceil(x.length/c)),0);return Math.ceil(l*sz*LH);};
const ctaH=sz=>Math.ceil(sz*1.15)+2*Math.round(sz*0.45); // 슬림 CTA: 세로 패딩 0.45

// === 헬퍼 ===
const F_=(n,w,h,bg)=>{const f=figma.createFrame();f.name=n;f.resize(w,h);f.fills=fl(bg);f.clipsContent=true;return f;};
const R_=(w,h,c,r=0)=>{const x=figma.createRectangle();x.resize(w,h);x.fills=fl(c);x.cornerRadius=r;return x;};
function TX(s,sz,st,c,ww){
  const t=figma.createText();
  t.fontName={family:FAM,style:st};t.fontSize=sz;t.fills=fl(c);t.characters=s;
  t.lineHeight={value:135,unit:'PERCENT'}; // $line-height SEED 토큰 기준t.letterSpacing={value:-3,unit:'PERCENT'};
  if(ww){t.textAutoResize='HEIGHT';t.resize(ww,10);}
  return t;
}
function Pill(label,sz,ph,pv,bg,fg){
  const f=figma.createFrame();
  f.layoutMode='HORIZONTAL';f.primaryAxisAlignItems='CENTER';f.counterAxisAlignItems='CENTER';
  f.primaryAxisSizingMode='AUTO';f.counterAxisSizingMode='AUTO';
  f.paddingLeft=f.paddingRight=ph;f.paddingTop=f.paddingBottom=pv;
  f.fills=fl(bg);f.cornerRadius=9999;
  const t=figma.createText();t.fontName={family:FAM,style:HV};t.fontSize=sz;t.fills=fl(fg);t.characters=label;
  t.letterSpacing={value:-2,unit:'PERCENT'};
  f.appendChild(t);return f;
}
const CTA=(l,sz)=>Pill(l,sz,Math.round(sz*1.1),Math.round(sz*0.45),T.solid,T.white);
const Circle=(sz,op,x,y)=>{const c=R_(sz,sz,T.solid,sz/2);c.opacity=op;c.x=x;c.y=y;return c;};

// === 캠페인별로 반드시 교체할 변수 ===
const PAGE_NAME = '노트북_중고거래_2604'; // [주제요약]_[MMDD] 형식
const HEAD = '안 쓰는 옷,\n이웃이 찾아요';  // 2줄, 각 줄 4~8자
const HEAD_W = '이웃이 찾아요 →';           // Wide Thin용 1줄
const SUB = '우리 동네 이웃과 당근에서 만나요'; // 1줄
const CT = '당근 열기';                      // 3~6자 CTA

// === 레이아웃 A — Wide Thin (≥2.5 ratio) ===
async function layA(F,w,h){
  F.fills=fl(T.solid);
  const pad=Math.round(w*0.05);
  const logoH=Math.round(h*0.36);
  const logo=makeLogo(logoH,true);
  F.appendChild(logo); logo.x=pad; logo.y=Math.round((h-logo.height)/2);
  const headLeft=logo.x+logo.width+Math.round(w*0.035);
  const headMaxW=w-pad-headLeft;
  const hSz=fitSize(HEAD_W,headMaxW,Math.round(h*0.36));
  const hH=calcH(HEAD_W,hSz,headMaxW);
  const head=TX(HEAD_W,hSz,HV,T.white,headMaxW);
  F.appendChild(head); head.x=headLeft; head.y=Math.round((h-hH)/2);
}

// === 레이아웃 B — Square (0.9~1.3) ===
async function layB(F,w,h){
  F.fills=fl(T.weak);
  const pad=Math.round(Math.min(w,h)*0.075);
  F.appendChild(Circle(Math.round(w*0.8),0.1,Math.round(w*0.48),Math.round(h*0.4)));
  const logo=makeLogo(Math.round(h*0.085));
  F.appendChild(logo); logo.x=pad; logo.y=pad;
  const cW=w-pad*2;
  const hSz=fitSize(HEAD,cW,Math.round(h*0.14));
  const sSz=fitSize(SUB,cW,Math.round(h*0.048));
  const cSz=Math.round(h*0.060);
  const hH=calcH(HEAD,hSz,cW);
  const sH=calcH(SUB,sSz,cW);
  const cH=ctaH(cSz);
  const cta=CTA(CT,cSz); F.appendChild(cta); cta.x=pad; cta.y=h-pad-cH;
  const sub=TX(SUB,sSz,BD,T.muted,cW); F.appendChild(sub); sub.x=pad; sub.y=cta.y-Math.round(h*0.052)-sH;
  const head=TX(HEAD,hSz,HV,T.text,cW); F.appendChild(head); head.x=pad; head.y=sub.y-Math.round(h*0.025)-hH;
}

// === 레이아웃 C — Landscape (1.3~2.5) ===
async function layC(F,w,h){
  F.fills=fl(T.weak);
  const pad=Math.round(h*0.08);
  F.appendChild(Circle(Math.round(h*1.3),0.1,Math.round(w-h*0.88),Math.round(-h*0.28)));
  const logoH_px=Math.round(h*0.115);
  const logo=makeLogo(logoH_px);
  F.appendChild(logo); logo.x=pad; logo.y=pad;
  const cW=Math.round(w*0.58);
  const sSz=fitSize(SUB,cW,Math.round(h*0.060));
  const cSz=Math.round(h*0.072);
  const sH=calcH(SUB,sSz,cW);
  const cH=ctaH(cSz);
  // 수직 공간 계산: 로고 아래에서 헤드 시작 (로고 충돌 방지)
  const logoBottom=pad+logoH_px+Math.round(h*0.05);
  const availForStack=h-pad-logoBottom;
  const fixedH=cH+Math.round(h*0.060)+sH+Math.round(h*0.038);
  const maxHeadH=availForStack-fixedH;
  let hSz=fitSize(HEAD,cW,Math.round(h*0.20));
  let hH=calcH(HEAD,hSz,cW);
  while(hH>maxHeadH && hSz>10){hSz--;hH=calcH(HEAD,hSz,cW);}
  const cta=CTA(CT,cSz); F.appendChild(cta); cta.x=pad; cta.y=h-pad-cH;
  const sub=TX(SUB,sSz,BD,T.muted,cW); F.appendChild(sub); sub.x=pad; sub.y=cta.y-Math.round(h*0.060)-sH;
  const head=TX(HEAD,hSz,HV,T.text,cW); F.appendChild(head); head.x=pad; head.y=sub.y-Math.round(h*0.038)-hH;
}

// === 레이아웃 D — Portrait (<0.9) ===
async function layD(F,w,h){
  F.fills=fl(T.weak);
  const pad=Math.round(w*0.065);
  F.appendChild(Circle(Math.round(w*1.0),0.1,Math.round(-w*0.02),Math.round(h*0.15)));
  const logo=makeLogo(Math.round(h*0.055));
  F.appendChild(logo); logo.x=pad; logo.y=pad;
  const cW=w-pad*2;
  const hSz=fitSize(HEAD,cW,Math.round(h*0.10));
  const sSz=fitSize(SUB,cW,Math.round(h*0.040));
  const cSz=Math.round(h*0.048);
  const hH=calcH(HEAD,hSz,cW);
  const sH=calcH(SUB,sSz,cW);
  const cH=ctaH(cSz);
  const cta=CTA(CT,cSz); F.appendChild(cta); cta.x=pad; cta.y=h-pad-cH;
  const sub=TX(SUB,sSz,BD,T.muted,cW); F.appendChild(sub); sub.x=pad; sub.y=cta.y-Math.round(h*0.042)-sH;
  const head=TX(HEAD,hSz,HV,T.text,cW); F.appendChild(head); head.x=pad; head.y=sub.y-Math.round(h*0.022)-hH;
}

// === 페이지: PAGE_NAME과 같은 이름 있으면 재사용, 없으면 신규 생성 ===
// 다른 캠페인 페이지는 절대 건드리지 않음
const root=figma.root;
let pg=root.children.find(p=>p.name===PAGE_NAME);
if(!pg){pg=figma.createPage();pg.name=PAGE_NAME;}
await figma.setCurrentPageAsync(pg);
[...pg.children].forEach(c=>{try{c.remove();}catch(e){}});

// === Karrot Sans 없을 때 노란 경고 프레임 ===
if (needsFontNote) {
  const note=F_('⚠️ 폰트 교체 안내',1800,70,T.note);
  pg.appendChild(note); note.x=0; note.y=-110;
  const nt=TX('⚠️ Noto Sans KR Black/Bold (임시) → Figma 데스크톱에서 Karrot Sans로 교체',22,HV,T.text);
  note.appendChild(nt); nt.x=20; nt.y=22;
}

// === 10개 배너 생성 ===
const B=[
  ['배너 320×100',320,100,layA],
  ['미디엄 300×250',300,250,layB],
  ['미디엄 720×720',720,720,layB],
  ['풀스크린 480×320',480,320,layC],
  ['네이티브 1200×600',1200,600,layC],
  ['풀스크린 320×480',320,480,layD],
  ['네이티브 720×960',720,960,layD],
  ['태블릿 768×1024',768,1024,layD],
  ['네이티브 720×1280',720,1280,layD],
  ['네이티브 1200×1500',1200,1500,layD],
];

let cx=0,cy=0,rh=0;
const GAP=120, RMAX=3600;
for(const [n,w,h,fn] of B){
  if(cx+w>RMAX){cy+=rh+GAP;cx=0;rh=0;}
  const F=F_(n,w,h,T.white);
  pg.appendChild(F);   // 반드시 scenegraph에 먼저 붙인 뒤 내부 빌드
  F.x=cx; F.y=cy;
  await fn(F,w,h);
  cx+=w+GAP;
  rh=Math.max(rh,h);
}

figma.viewport.scrollAndZoomIntoView(pg.children);
figma.notify(`✅ ${PAGE_NAME} · 10배너 · ${FAM}`);
return `OK · ${PAGE_NAME} · 10 banners`;
```

---

## 캠페인별 치환 예시

PAGE_NAME + HEAD + HEAD_W + SUB + CT 5개만 교체하면 됨.

### 노트북 중고거래 (2604)
```js
const PAGE_NAME = '노트북_중고거래_2604';
const HEAD = '비싼 노트북,\n이웃이 살게요';
const HEAD_W = '이웃이 살게요 →';
const SUB = '우리 동네 이웃과 당근에서 직거래';
const CT = '당근 열기';
```

### 당근페이 송금
```js
const PAGE_NAME = '당근페이_송금_2604';
const HEAD = '계좌번호 없이\n이름만으로 송금';
const HEAD_W = '이름만으로 송금 →';
const SUB = '직거래 후 바로 당근페이로';
const CT = '당근페이 쓰기';
```

### 동네생활
```js
const PAGE_NAME = '동네생활_2604';
const HEAD = '옆집 이웃이\n뭐하고 있을까?';
const HEAD_W = '이웃들이 이야기 중 →';
const SUB = '우리 동네 이야기, 지금 실시간';
const CT = '동네생활 보기';
```

---

## 실패 시 복구

1. `text.height`가 여전히 10이면: `calcH` 사용 확인
2. 헤드가 frame 밖으로: `fitSize(HEAD, cW, preferred)` 빠졌는지 확인
3. CTA 겹침: `cta.y = h - pad - ctaH(cSz)` 순서대로 bottom-up 스태킹 확인
4. 로고가 이모지: `importComponentByKeyAsync` 호출 확인
5. Karrot Sans 미로드: `hasKarrot` 플래그 확인, 노란 경고 노트 존재 확인
