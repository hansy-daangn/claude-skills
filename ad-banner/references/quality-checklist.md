# Quality Checklist

출력 전 반드시 확인. 모든 항목 YES가 아니면 재작업.

---

## 🎨 디자인 (Figma 산출물)

### 폰트
- [ ] Karrot Sans 사용 (또는 Noto Sans KR Black + 경고 노트 포함)
- [ ] Heavy = 헤드/CTA/로고, Bold = 서브/본문
- [ ] Letter-spacing -2% ~ -3%
- [ ] Line-height 135% ($line-height SEED 토큰 비율)

### 로고
- [ ] Logo_korean 컴포넌트 인스턴스 사용 (🥕 이모지 절대 금지)
- [ ] 라이트 배경 = Primary, 오렌지 배경 = White
- [ ] 크기: 배너 h × (0.055 ~ 0.36) 비율 준수

### 색상
- [ ] 브랜드 컬러 = `#ff6600` (정확히, 유사값 금지)
- [ ] 텍스트 컬러 SEED 토큰 기반 (`#212124`, `#555b65`, `#ffffff`)
- [ ] CTA 배경 = brand-solid, CTA 텍스트 = white

### 레이아웃
- [ ] 비율에 맞는 레이아웃 카테고리 (A/B/C/D) 선택
- [ ] V1~V4가 같은 사이즈 안에서 헤드/로고/CTA 위치가 진짜 다름 (단순 색 변형 아님)
- [ ] 헤드카피가 프레임 안에 완전히 들어감 (잘림 없음)
- [ ] 헤드·서브·CTA 간 겹침 없음
- [ ] 로고와 스택 겹침 없음
- [ ] 좌우 pad 균등
- [ ] CTA bar(풀와이드 또는 우측 세로) 위 텍스트가 가운데 정렬
- [ ] 모든 텍스트 위치 `calcH()` 수식 기반 (text.height 사용 금지)

---

## ✍️ 카피 (당근 voice)

### 헤드카피
- [ ] 2줄 이내 (Wide thin은 1줄)
- [ ] 각 줄 4~8자
- [ ] 구체적 사물·상황 포함 (추상 명사 나열 금지)
- [ ] 능동문
- [ ] 클리셰 없음 ("놀라운", "최고의", "당신의 삶을 바꿀" 등)
- [ ] 영어 번역체 없음
- [ ] 마침표 없음 (타이틀 규칙)

### 서브카피
- [ ] 1줄
- [ ] "우리 동네" / "이웃" 키워드 최소 1개
- [ ] 행동 유도 단서 포함
- [ ] 존칭 최소화 (`~해요`)

### CTA
- [ ] 3~6자
- [ ] 목적 중심 동사 (기능명이 아님)
- [ ] copy-library.md 승인 목록에서 선택

---

## 🎯 SEED 적용 확인 체크리스트 (출력 필수)

스킬 실행 끝에 반드시 아래 블록 포함:

```
✅ SEED 적용 확인
- 폰트: Karrot Sans Heavy/Bold [또는 Noto Sans KR Black/Bold 플레이스홀더]
- 브랜드 컬러: $color.bg.brand-solid (#ff6600)
- 연한 배경: $color.bg.brand-weak (#fff2ec)
- 메인 텍스트: $color.fg.neutral (#212124)
- 보조 텍스트: $color.fg.neutral-muted (#555b65)
- CTA 모서리: $radius.full (9999px)
- Logo_korean 컴포넌트 인스턴스 (Primary/White)
- 당근 voice 키워드: "[실제 쓴 키워드]"
- 배너 수: N개 (비율별 A/B/C/D 레이아웃)
```

이 블록이 없으면 **스킬 실행이 불완전한 것**. 반드시 포함.

---

## 🔄 검증 절차 (매 실행마다)

1. Figma 생성 완료 후 `get_screenshot` 2~3개 배너 확인
   - 비율별로 1개씩 (예: Wide Thin + Square + Portrait)
2. 텍스트 잘림 / 겹침 / 이상 확인
3. 문제 발견 시:
   - `fitSize` preferred 값 낮추기
   - `calcH` 확인 (CF/LH 상수)
   - padding 키우기
4. 재생성 후 재검증

---

## 🚫 즉시 실패 사유

다음 중 하나라도 해당되면 **즉시 재작업**, 출력 중단:

- Karrot Sans / Noto Sans KR Black 아닌 폰트 사용
- #FF6F0F 등 SEED 유사값 사용  
- 🥕 이모지 로고 사용
- 헤드카피에 "놀라운" / "최고" / "당신의 삶을 바꿀" 포함
- 영어 직역체 헤드/서브
- `text.height` 기반 포지셔닝
- SEED 적용 확인 블록 누락
