---
name: ad-banner
description: |
  당근 광고 이미지 배너를 SEED 디자인 시스템 + 당근 브랜드 보이스에 맞춰 자동으로 기획하고 Figma 파일로 생성하는 스킬.

  **다음 명시적 트리거가 있을 때만 발동. 자연어 문맥만으로는 절대 발동하지 않는다.**
  - `#소재제작`
  - `#배너제작`
  - `#광고소재`

  워크플로우: 당근 voice 카피 작성 → Figma 신규 페이지에 전 사이즈 프레임 생성
---

# ad-banner 스킬

## 사용법

메시지 어디에든 `#소재제작` / `#배너제작` / `#광고소재` 중 하나를 포함하면 발동:

> `#소재제작` 요새 메모리 대란으로 노트북 가격이 급상승하고 있어. 비싼 새거보다 당근에서 합리적인 가격에 올라온거 있는지 둘러보라는 맥락에서 소재를 제작해봐

> `#배너제작` 당근페이 송금, 몰로코용으로

> `#광고소재` 봄맞이 옷 정리, 메타 사이즈로

해시태그 없이 "소재 만들어", "배너 뽑아줘" 같은 자연어만으로는 발동하지 않는다.

스킬이 알아서 카피 작성 → Figma 새 페이지 생성(`주제_MMDD`) → 배너 10종 생성 → 스크린샷 검증.

---

## 페이지 네이밍 규칙

캠페인마다 **새 페이지** 생성. 기존 페이지는 절대 건드리지 않음.

- 형식: `[주제요약]_[MMDD]` — 예: `노트북_중고거래_2604`, `당근페이송금_2604`
- 주제 요약: 핵심 키워드 2~3개, 공백 없이 언더스코어 연결
- MMDD: 오늘 날짜 4자리
- 같은 이름 페이지가 이미 있으면 내용만 덮어쓰기 (재실행 케이스)

---

## 실행 순서

1. **입력 파싱** — 주제/소구점/매체 추출. 미지정이면 몰로코 기본.
2. **카피 작성** — `references/brand-voice.md` + `references/copy-library.md` 참조. HEAD/SUB/CTA 3종.
3. **Figma 생성** — `references/figma-generator.md` 코드 템플릿에 PAGE_NAME + 카피만 치환해서 `use_figma` 실행.
4. **검증** — `get_screenshot` 2~3개 확인 (겹침/잘림/로고 충돌). 문제 있으면 파라미터 조정 후 재생성.
5. **체크리스트 출력** — 아래 SEED 확인 블록 반드시 포함.

```
✅ SEED 적용 확인
- 폰트: Karrot Sans Heavy/Bold [또는 Noto Sans KR Black/Bold 플레이스홀더]
- 브랜드 컬러: $color.bg.brand-solid (#ff6600)
- 연한 배경: $color.bg.brand-weak (#fff2ec)
- 메인 텍스트: $color.fg.neutral (#212124)
- CTA 모서리: $radius.full (9999px)
- Logo_korean 컴포넌트 인스턴스 (Primary/White)
- 당근 voice 키워드: "[실제 쓴 키워드]"
- 페이지: [PAGE_NAME]
```

---

## 절대 규칙

### R1. 폰트
Karrot Sans Heavy/Bold. sandbox에서 없으면 Noto Sans KR Black/Bold로 대체 + 노란 경고 프레임.

### R2. 로고
🥕 이모지 금지. Logo_korean 컴포넌트 인스턴스만:
- Primary `7bd06aa4147de6d53637e133cf38a78659e36f63` — 밝은 배경
- White `ccfd3319d4232252f37a5de518cd0631f2174e22` — 오렌지 배경

### R3. 색상 (SEED 토큰 정확한 값만)
| 역할 | 토큰 | hex |
|---|---|---|
| CTA·브랜드 배경 | `$color.bg.brand-solid` | `#ff6600` |
| 연한 배경 | `$color.bg.brand-weak` | `#fff2ec` |
| 메인 텍스트 | `$color.fg.neutral` | `#212124` |
| 보조 텍스트 | `$color.fg.neutral-muted` | `#555b65` |
| 반전 텍스트 | `$color.fg.neutral-inverted` | `#ffffff` |

`#FF6F0F` 같은 유사값 절대 금지.

### R4. 텍스트 높이
`text.height` 읽기 금지 — 항상 10 반환함. `calcH()` 수식 함수만 사용. (`references/figma-generator.md` 참조)

### R5. 카피 (당근 voice)
- 능동문, 구체적 상황, "우리 동네/이웃" 키워드 필수
- 클리셰("놀라운", "최고의") · 영어 번역체 금지
- `references/brand-voice.md` DO/DON'T 준수

### R6. CTA
`references/copy-library.md` 승인 목록에서만 선택.

---

## Reference Files

| 파일 | 언제 |
|---|---|
| `references/brand-voice.md` | 카피 작성 시 필수 |
| `references/copy-library.md` | 헤드/서브/CTA 후보 |
| `references/figma-generator.md` | Figma 생성 코드 템플릿 |
| `references/layout-spec.md` | 비율별 레이아웃 |
| `references/quality-checklist.md` | 출력 전 자가 검증 |

---

## 기본 사이즈 세트

**몰로코 (기본):** 320×100 / 300×250 / 720×720 / 480×320 / 1200×600 / 320×480 / 720×960 / 768×1024 / 720×1280 / 1200×1500

**구글:** 300×250 / 728×90 / 160×600 / 300×600 / 970×250

**메타:** 1080×1080 / 1200×628 / 1080×1920

레이아웃 함수: `layA` Wide Thin(≥2.5) / `layB` Square(0.9~1.3) / `layC` Landscape(1.3~2.5) / `layD` Portrait(<0.9)

---

## 자주 있는 실패 패턴

| 증상 | 처방 |
|---|---|
| 텍스트 겹침 | `calcH()` 수식 사용 확인 |
| 텍스트 프레임 밖으로 | `fitSize()` 적용 확인 |
| 로고가 이모지 | `importComponentByKeyAsync` 확인 |
| 카피 밍밍함 | copy-library.md 템플릿 사용 |
| Landscape에서 로고↔텍스트 충돌 | layC 수직 안전 로직 확인 |
