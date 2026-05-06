---
name: ad-banner
description: |
  당근 광고 이미지 배너를 SEED 디자인 시스템 + 당근 브랜드 보이스에 맞춰 자동으로 기획하고 Figma 파일로 생성하는 스킬.

  **다음 명시적 트리거가 있을 때만 발동. 자연어 문맥만으로는 절대 발동하지 않는다.**
  - `#소재제작` — 카피 작성 + Figma 신규 페이지에 전 사이즈 프레임 생성
  - `#배너제작` — 동일
  - `#광고소재` — 동일
  - `#배너학습` — 기존 시안에서 사이즈별 레이아웃 인사이트 추출 → `references/layouts/{W}x{H}.md` 채움

  공통 워크플로우 모두 `references/layouts/LOCKED_SIZES.md` + `references/layouts/INSIGHT_RULES.md` + `references/layouts/README.md` 자동 로드 필수.
---

# ad-banner 스킬

## ⛳ 트리거 발동 시 자동 로드 필수

어떤 트리거든 발동 즉시 다음 3개 파일을 우선 읽는다. 이 파일들이 사용자의 누적 지시·룰의 단일 진실 소스(single source of truth):

1. `references/layouts/LOCKED_SIZES.md` — 사이즈 10종 락 (직접 수정 요청 없이 변경 금지)
2. `references/layouts/INSIGHT_RULES.md` — 절대 룰 L1~L9
3. `references/layouts/README.md` — 학습 워크플로우 + 기록 항목 화이트리스트

그 다음 트리거별 워크플로우 진입.

---

## 사용법

### 생성 트리거 — `#소재제작` / `#배너제작` / `#광고소재`

메시지 어디에든 위 중 하나를 포함하면 발동:

> `#소재제작` 요새 메모리 대란으로 노트북 가격이 급상승하고 있어. 비싼 새거보다 당근에서 합리적인 가격에 올라온거 있는지 둘러보라는 맥락에서 소재를 제작해봐

> `#배너제작` 당근페이 송금, 몰로코용으로

> `#광고소재` 봄맞이 옷 정리, 메타 사이즈로

스킬이 알아서 카피 작성 → Figma 새 페이지 생성(`주제_MMDD`) → 배너 **10종** 생성 (`LOCKED_SIZES.md`) → 검증.

### 학습 트리거 — `#배너학습`

기존 Figma 시안에서 사이즈별 레이아웃을 학습해 `references/layouts/{W}x{H}.md`를 채운다.

```
#배너학습 figma=https://www.figma.com/design/{fileKey}/{name}?node-id={a}-{b}
#배너학습 figma=URL exclude=Moloco_Native_720x1280,...   # FIX 케이스 제외
```

**학습 룰 (필수):**
- ❌ **스크린샷 금지** (`get_screenshot` 사용 금지). 수치 도구만: `get_metadata`, `get_design_context`.
- 사용자가 데스크톱 Figma에서 **한 사이즈의 모든 변형을 다중 선택** → 1콜로 추출 → 사이즈별 md 채움 → 다음 사이즈로 사용자가 selection 변경 → 반복.
- 사이즈별 md 기록 항목 **화이트리스트만**:
  - 글자박스: `w, h, x, y`
  - 로고: `h, x, y`
  - CTA: 박스 유무 / 박스가 있으면 `w, h, color`
- 그 외 (사진 위치/크기, 장식 도형, 그라데이션 등) 기록 금지.
- 사이즈당 변형 3~4개. 각 변형은 출처 시안과 1:1 (디자인 임의 변형/혼합 금지, L9).

해시태그 없이 "소재 만들어", "배너 뽑아줘" 같은 자연어만으로는 어떤 트리거도 발동하지 않는다.

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
2. **카피 작성** — `references/foundation-voice-tone.md` + `references/copy-library.md` 참조. HEAD/SUB/CTA 3종.
3. **Figma 생성** — `references/figma-generator.md` 코드 템플릿에 PAGE_NAME + 카피만 치환해서 `use_figma` 실행.
4. **검증** — `get_screenshot` 2~3개 확인 (겹침/잘림/로고 충돌). 문제 있으면 파라미터 조정 후 재생성.
5. **체크리스트 출력** — 아래 SEED 확인 블록 반드시 포함.

```
✅ SEED 적용 확인
- 폰트: Karrot Sans Heavy/Bold [또는 Noto Sans KR Black/Bold 플레이스홀더]
- 브랜드 컬러: $color.bg.brand-solid
- 연한 배경: $color.bg.brand-weak
- 메인 텍스트: $color.fg.neutral
- CTA 모서리: $radius.full (9999px)
- Logo_korean 컴포넌트 인스턴스 (Primary/White)
- 당근 voice 키워드: "[실제 쓴 키워드]"
- 페이지: [PAGE_NAME]
```

---

## 절대 규칙 (각 항목은 해당 foundation 파일이 정답)

| # | 룰 | 정답 출처 |
|---|---|---|
| R1 | Karrot Sans Heavy/Bold (없으면 Noto Sans KR Black/Bold + 노란 경고) | `references/foundation-typography.md` |
| R2 | Logo_korean 컴포넌트 인스턴스 (🥕 이모지·SVG 직접 그리기 금지) | `references/foundation-logo.md` |
| R3 | SEED Role 토큰 정확값만 (#FF6F0F 등 유사값 금지) | `references/foundation-color.md` |
| R4 | spacing은 비율 + clamp(min, max). 절대 px 토큰 그대로 금지 | `references/foundation-spacing.md` |
| R5 | radius는 CTA·장식원만. CTA = `$radius.full`(9999) | `references/foundation-radius.md` |
| R6 | `text.height` 사용 금지 — `calcH()` 수식만 | `references/foundation-typography.md` |
| R7 | 카피는 당근 voice 9개 체크리스트 통과 (능동·동네·구체·~해요) | `references/foundation-voice-tone.md` |
| R8 | CTA는 voice-tone §5 작동 원리로 생성 (4가지 후킹 패턴 + 자가 검증 6개 통과). copy-library는 사례 참고만 | `references/foundation-voice-tone.md` (§5) |
| R9 | 로고는 반드시 `Logo_korean`. `Logo_business` 등 변형 절대 금지 | `references/layouts/INSIGHT_RULES.md` L1 |
| R10 | 로고 일부만 보이거나 사라진 케이스 금지 (visible/clip 검증) | `references/layouts/INSIGHT_RULES.md` L2 |
| R11 | 텍스트 박스(Rectangle/Autolayout) 보존. CTA 박스는 같은 사이즈 프레임으로 감싸고 색상 사용 | `references/layouts/INSIGHT_RULES.md` L3, L7 |
| R12 | 모든 텍스트 노드는 자동너비. 한 노드 내 mixed 스타일(폰트·자간·줄간격·색·굵기) 금지 — 다르면 노드 분리 | `references/layouts/INSIGHT_RULES.md` L5, L6 |
| R13 | 마진은 정답 시안과 무관하게 항상 foundation-spacing 적용 ⭐ | `references/layouts/INSIGHT_RULES.md` L4 |
| R14 | 장식원 사용 금지 (배경 장식 도형 일체) | `references/layouts/INSIGHT_RULES.md` L8 |
| R15 | 각 변형은 출처 시안과 1:1. 디자인 임의 변형·혼합 금지 | `references/layouts/INSIGHT_RULES.md` L9 |

---

## Reference Files

| 파일 | 언제 |
|---|---|
| `references/foundation-voice-tone.md` | 카피 작성 시 — voice/tone, 헤드 패턴, 자가 검증 9개 |
| `references/foundation-color.md` | 색 결정 시 — SEED Role 토큰, 배경/텍스트 페어링 |
| `references/foundation-spacing.md` | 간격 결정 시 — 비율 공식 + clamp + 사이즈별 환산표 |
| `references/foundation-radius.md` | 모서리 결정 시 — CTA/장식원/노트 |
| `references/foundation-typography.md` | 폰트 크기·행간·자간 — fitSize·calcH 수식 근거 |
| `references/foundation-logo.md` | 로고 컴포넌트 키 + 비율별 크기 |
| `references/copy-library.md` | 캠페인별 헤드/서브/CTA 후보 |
| `references/layout-spec.md` | 비율별(A/B/C/D) 레이아웃 구조 (legacy 단일 패턴) |
| `references/layouts/LOCKED_SIZES.md` | 🔒 사이즈 락 — 10종 외 작업 금지 |
| `references/layouts/INSIGHT_RULES.md` | 사이즈 무관 절대 룰 (L1~L7) |
| `references/layouts/README.md` | 폴더 진입점 + 학습 표준 한 줄 포맷 |
| `references/layouts/{W}x{H}.md` | 사이즈별 인사이트 (학습 후 채움, 변형 3~4개) |
| `references/figma-generator.md` | Figma 생성 코드 템플릿 |
| `references/quality-checklist.md` | 출력 전 자가 검증 |

---

## 기본 사이즈 세트 🔒

사이즈 10종은 `references/layouts/LOCKED_SIZES.md`에 락. **사용자의 직접 수정 요청 없이 변경 금지** (추가/제거/치환 모두).

`320×100, 300×250, 320×480, 480×320, 768×1024, 720×720, 720×960, 720×1280, 1200×628, 1200×1600`

레이아웃 함수: `layA` Wide Thin(≥2.5) / `layB` Square(0.9~1.3) / `layC` Landscape(1.3~2.5) / `layD` Portrait(<0.9)

---

## 자주 있는 실패 패턴

| 증상 | 처방 |
|---|---|
| 텍스트 겹침 | `calcH()` 사용 확인 (foundation-typography) |
| 텍스트 프레임 밖으로 | `fitSize()` 적용 확인 (foundation-typography) |
| 로고가 이모지 | `importComponentByKeyAsync` 확인 (foundation-logo) |
| 카피 밍밍함 | copy-library.md 템플릿 사용 |
| Landscape에서 로고↔텍스트 충돌 | layC 수직 안전 로직 확인 (figma-generator) |
| 색 hex가 SEED와 다름 | foundation-color.md Drift 알림 참고 |
| 큰 배너에서 padding이 점처럼 좁음 | 비율 공식 + clamp 적용 (foundation-spacing) |
