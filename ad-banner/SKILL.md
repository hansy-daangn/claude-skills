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
| `references/layout-spec.md` | 사이즈별 레이아웃 인덱스 (락 10종 → layouts/{w}x{h}.md 매핑, V1~V4 골격, 카테고리 공식) |
| `references/layouts/{w}x{h}.md` | 락 10종 각각의 V1~V4 변형 가이드 (배경·구조·CTA·비율) |
| `references/figma-generator.md` | Figma 생성 코드 템플릿 (사이즈 × V1~V4 = 40 프레임 자동 생성) |
| `references/quality-checklist.md` | 출력 전 자가 검증 |

---

## 기본 사이즈 세트 — 확정 락 10종

**락 (사용자 직접 수정 요청 없이 변경 금지):**
320×100 / 300×250 / 320×480 / 480×320 / 768×1024 / 720×720 / 720×960 / 720×1280 / 1200×628 / 1200×1600

각 사이즈마다 V1~V4 = 4개 시안. 1회 실행 = **10 × 4 = 40 프레임** 자동 생성.

레이아웃 카테고리: `layA` Wide Thin(≥2.5) / `layB` Square(0.9~1.3) / `layC` Landscape(1.3~2.5) / `layD` Portrait(<0.9). 각 카테고리는 V1(White Card) / V2(Solid Hero) / V3(Weak Stack) / V4(Color-emphasis or Bold-only) 변형을 가짐. 사이즈→md 매핑은 `references/layout-spec.md`.

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
