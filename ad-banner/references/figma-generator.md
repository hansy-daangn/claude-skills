# Figma 배너 제너레이터

`use_figma`의 `code` 파라미터에 그대로 넣어 실행. 캠페인별로 상단 변수만 교체.

---

## 환경 사전 조건
1. Figma 파일 존재 (`fileKey` 확보)
2. Logo_korean 컴포넌트 접근 가능 (당근 enterprise workspace)
3. 이미지 사용하려면 동일 파일에 `assets` 페이지 + `img_<name>` 프레임에 이미지 업로드 필요

---

## 핵심 제약
- `text.height` 사용 금지 → `calcH()` 수식만 사용 (Figma Plugin API가 textAutoResize 후 즉시 height 업데이트 안 함)
- 폰트: Karrot Sans 우선, 미가용 시 Noto Sans KR Black/Bold 폴백 + 노란 경고 프레임
- Logo_korean: `importComponentByKeyAsync` (이모지 절대 금지)
- 이미지: `figma.createImage / figma.createImageAsync(url)` 둘 다 cloud sandbox에서 차단됨. assets 페이지에 사용자가 직접 업로드한 이미지의 imageHash를 재활용하는 방식만 가능.

---

## 전체 제너레이터 코드

```js
// ============================================================
// 캠페인 변수 (캠페인마다 교체)
// ============================================================
const PAGE_NAME  = '노트북_중고거래_2604';        // [주제]_[MMDD]
const HEAD       = '비싼 노트북,\n이웃이 살게요';   // 2줄, 각 줄 4~8자
const HEAD_W     = '이웃이 살게요 →';              // Wide Thin용 1줄
const SUB        = '우리 동네 이웃과 당근에서 직거래';
const CT         = '당근 열기';                   // 3~6자
const IMAGE_ASSET= '';                           // 'img_<name>' 또는 '' (없으면 weak 배경)

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
const CTA=(l,sz)=>Pill(l,sz,Math.round(sz*1.1),Math.round(sz*0.45),T.solid,T.white);

// ============================================================
// 이미지 asset 조회 (assets 페이지의 img_<name> 프레임에서 imageHash 추출)
// ============================================================
function findAssetHash(name){
  if(!name)return null;
  const assetsPg=figma.root.children.find(p=>p.name==='assets');
  if(!assetsPg)return null;
  const node=assetsPg.findOne(n=>n.name===name);
  if(!node||!node.fills)return null;
  const imgFill=node.fills.find(f=>f.type==='IMAGE');
  return imgFill?imgFill.imageHash:null;
}
const IMG_HASH=findAssetHash(IMAGE_ASSET);
const HAS_IMG=!!IMG_HASH;

// ============================================================
// 이미지 fill + 다크 그라데이션 오버레이 (텍스트 가독성)
// ============================================================
function imageFill(hash){return [{type:'IMAGE',imageHash:hash,scaleMode:'FILL'}];}
function gradient(w,h,fromTop){
  // fromTop=true: 위에서 아래로 진해짐 (로고 영역) / false: 아래에서 위로 (텍스트 영역)
  const r=figma.createRectangle();r.resize(w,h);
  r.fills=[{
    type:'GRADIENT_LINEAR',
    gradientTransform:fromTop?[[0,1,0],[-1,0,1]]:[[0,-1,1],[1,0,0]],
    gradientStops:[
      {position:0,color:{r:0,g:0,b:0,a:0.7}},
      {position:1,color:{r:0,g:0,b:0,a:0}}
    ]
  }];
  return r;
}

// ============================================================
// 레이아웃 A — Wide Thin (≥2.5)
// 좁은 띠 배너. 이미지 사용 안 함 (공간 부족) — 항상 오렌지 솔리드.
// ============================================================
async function layA(F,w,h){
  F.fills=fl(T.solid);
  const pad=Math.round(w*0.05);
  const logo=makeLogo(Math.round(h*0.36),true);
  F.appendChild(logo);logo.x=pad;logo.y=Math.round((h-logo.height)/2);
  const headLeft=logo.x+logo.width+Math.round(w*0.035);
  const headMaxW=w-pad-headLeft;
  const hSz=fitSize(HEAD_W,headMaxW,Math.round(h*0.36));
  const hH=calcH(HEAD_W,hSz,headMaxW);
  const head=TX(HEAD_W,hSz,HV,T.white,headMaxW);
  F.appendChild(head);head.x=headLeft;head.y=Math.round((h-hH)/2);
}

// ============================================================
// 레이아웃 B — Square (0.9~1.3)
// ============================================================
async function layB(F,w,h){
  if(HAS_IMG){
    F.fills=imageFill(IMG_HASH);
    const topG=gradient(w,Math.round(h*0.30),true);F.appendChild(topG);topG.x=0;topG.y=0;
    const botG=gradient(w,Math.round(h*0.55),false);F.appendChild(botG);botG.x=0;botG.y=h-Math.round(h*0.55);
  }else{
    F.fills=fl(T.weak);
  }
  const pad=Math.round(Math.min(w,h)*0.075);
  const logo=makeLogo(Math.round(h*0.085),HAS_IMG);
  F.appendChild(logo);logo.x=pad;logo.y=pad;
  const cW=w-pad*2;
  const hSz=fitSize(HEAD,cW,Math.round(h*0.14));
  const sSz=fitSize(SUB,cW,Math.round(h*0.048));
  const cSz=Math.round(h*0.060);
  const hH=calcH(HEAD,hSz,cW);
  const sH=calcH(SUB,sSz,cW);
  const cH=ctaH(cSz);
  const tCol=HAS_IMG?T.white:T.text;
  const sCol=HAS_IMG?T.white:T.muted;
  const cta=CTA(CT,cSz);F.appendChild(cta);cta.x=pad;cta.y=h-pad-cH;
  const sub=TX(SUB,sSz,BD,sCol,cW);F.appendChild(sub);sub.x=pad;sub.y=cta.y-Math.round(h*0.052)-sH;
  const head=TX(HEAD,hSz,HV,tCol,cW);F.appendChild(head);head.x=pad;head.y=sub.y-Math.round(h*0.025)-hH;
}

// ============================================================
// 레이아웃 C — Landscape (1.3~2.5)
// 로고 충돌 방지: 헤드 폰트 사이즈를 가용 공간 안에서 동적 축소
// ============================================================
async function layC(F,w,h){
  if(HAS_IMG){
    F.fills=imageFill(IMG_HASH);
    const topG=gradient(w,Math.round(h*0.35),true);F.appendChild(topG);topG.x=0;topG.y=0;
    const botG=gradient(w,Math.round(h*0.65),false);F.appendChild(botG);botG.x=0;botG.y=h-Math.round(h*0.65);
  }else{
    F.fills=fl(T.weak);
  }
  const pad=Math.round(h*0.08);
  const logoH_px=Math.round(h*0.115);
  const logo=makeLogo(logoH_px,HAS_IMG);
  F.appendChild(logo);logo.x=pad;logo.y=pad;
  const cW=Math.round(w*0.58);
  const sSz=fitSize(SUB,cW,Math.round(h*0.060));
  const cSz=Math.round(h*0.072);
  const sH=calcH(SUB,sSz,cW);
  const cH=ctaH(cSz);
  const logoBottom=pad+logoH_px+Math.round(h*0.05);
  const availForStack=h-pad-logoBottom;
  const fixedH=cH+Math.round(h*0.060)+sH+Math.round(h*0.038);
  const maxHeadH=availForStack-fixedH;
  let hSz=fitSize(HEAD,cW,Math.round(h*0.20));
  let hH=calcH(HEAD,hSz,cW);
  while(hH>maxHeadH&&hSz>10){hSz--;hH=calcH(HEAD,hSz,cW);}
  const tCol=HAS_IMG?T.white:T.text;
  const sCol=HAS_IMG?T.white:T.muted;
  const cta=CTA(CT,cSz);F.appendChild(cta);cta.x=pad;cta.y=h-pad-cH;
  const sub=TX(SUB,sSz,BD,sCol,cW);F.appendChild(sub);sub.x=pad;sub.y=cta.y-Math.round(h*0.060)-sH;
  const head=TX(HEAD,hSz,HV,tCol,cW);F.appendChild(head);head.x=pad;head.y=sub.y-Math.round(h*0.038)-hH;
}

// ============================================================
// 레이아웃 D — Portrait (<0.9)
// ============================================================
async function layD(F,w,h){
  if(HAS_IMG){
    F.fills=imageFill(IMG_HASH);
    const topG=gradient(w,Math.round(h*0.20),true);F.appendChild(topG);topG.x=0;topG.y=0;
    const botG=gradient(w,Math.round(h*0.45),false);F.appendChild(botG);botG.x=0;botG.y=h-Math.round(h*0.45);
  }else{
    F.fills=fl(T.weak);
  }
  const pad=Math.round(w*0.065);
  const logo=makeLogo(Math.round(h*0.055),HAS_IMG);
  F.appendChild(logo);logo.x=pad;logo.y=pad;
  const cW=w-pad*2;
  const hSz=fitSize(HEAD,cW,Math.round(h*0.10));
  const sSz=fitSize(SUB,cW,Math.round(h*0.040));
  const cSz=Math.round(h*0.048);
  const hH=calcH(HEAD,hSz,cW);
  const sH=calcH(SUB,sSz,cW);
  const cH=ctaH(cSz);
  const tCol=HAS_IMG?T.white:T.text;
  const sCol=HAS_IMG?T.white:T.muted;
  const cta=CTA(CT,cSz);F.appendChild(cta);cta.x=pad;cta.y=h-pad-cH;
  const sub=TX(SUB,sSz,BD,sCol,cW);F.appendChild(sub);sub.x=pad;sub.y=cta.y-Math.round(h*0.042)-sH;
  const head=TX(HEAD,hSz,HV,tCol,cW);F.appendChild(head);head.x=pad;head.y=sub.y-Math.round(h*0.022)-hH;
}

// ============================================================
// 페이지 처리: 동일 이름 페이지 있으면 재사용, 없으면 신규.
// 다른 캠페인 페이지는 절대 건드리지 않음.
// ============================================================
const root=figma.root;
let pg=root.children.find(p=>p.name===PAGE_NAME);
if(!pg){pg=figma.createPage();pg.name=PAGE_NAME;}
await figma.setCurrentPageAsync(pg);
[...pg.children].forEach(c=>{try{c.remove();}catch(e){}});

if(needsFontNote){
  const note=F_('⚠️ 폰트 교체 안내',1800,70,T.note);
  pg.appendChild(note);note.x=0;note.y=-110;
  const nt=TX('⚠️ Noto Sans KR Black/Bold (임시) → Figma 데스크톱에서 Karrot Sans로 교체',22,HV,T.text);
  note.appendChild(nt);nt.x=20;nt.y=22;
}

// ============================================================
// 10개 배너 생성 (몰로코 기본 세트)
// ============================================================
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
const GAP=120,RMAX=3600;
for(const [n,w,h,fn] of B){
  if(cx+w>RMAX){cy+=rh+GAP;cx=0;rh=0;}
  const F=F_(n,w,h,T.white);
  pg.appendChild(F); // scenegraph 먼저 붙인 뒤 내부 빌드 (auto-layout 계산 안정성)
  F.x=cx;F.y=cy;
  await fn(F,w,h);
  cx+=w+GAP;rh=Math.max(rh,h);
}

figma.viewport.scrollAndZoomIntoView(pg.children);
figma.notify(`✅ ${PAGE_NAME} · ${HAS_IMG?'이미지':'기본'} · ${FAM}`);
return `OK · ${PAGE_NAME}`;
```

---

## 이미지 사용 워크플로우

1. Figma 파일에 `assets` 페이지를 만든다 (없으면 생성)
2. 그 페이지에 프레임 추가, 이름은 `img_<key>` (예: `img_노트북_데스크`)
3. 프레임에 이미지를 drag & drop (이미지 fill로 적용됨)
4. 제너레이터의 `IMAGE_ASSET = 'img_노트북_데스크'`로 지정
5. 실행하면 자동으로 그 imageHash를 모든 배너 배경에 적용

이미지 없으면 (`IMAGE_ASSET = ''`) 기본 weak 배경으로 폴백.

---

## 캠페인 치환 예시

### 노트북 중고거래
```js
const PAGE_NAME='노트북_중고거래_2604';
const HEAD='비싼 노트북,\n이웃이 살게요';
const HEAD_W='이웃이 살게요 →';
const SUB='우리 동네 이웃과 당근에서 직거래';
const CT='당근 열기';
const IMAGE_ASSET='img_노트북_데스크'; // 사용자가 미리 업로드한 이미지
```

### 당근페이 송금
```js
const PAGE_NAME='당근페이_송금_2604';
const HEAD='계좌번호 없이\n이름만으로 송금';
const HEAD_W='이름만으로 송금 →';
const SUB='직거래 후 바로 당근페이로';
const CT='당근페이 쓰기';
const IMAGE_ASSET='';
```

---

## 실패 복구
1. `text.height`가 10 반환 → `calcH` 사용 확인
2. 헤드 프레임 밖으로 → `fitSize` 적용 확인
3. CTA 겹침 → bottom-up 스태킹 순서 확인 (`cta → sub → head`)
4. 로고 이모지 → `importComponentByKeyAsync` 호출 확인
5. 이미지 미적용 → `assets` 페이지 + `img_<name>` 프레임 + 이미지 fill 존재 확인
6. Karrot Sans 미로드 → `hasKarrot` 플래그 + 노란 경고 노트 확인
