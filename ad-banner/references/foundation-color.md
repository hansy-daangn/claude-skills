# Foundation: Color (광고 배너용)

> **출처**
> - https://seed-design.io/docs/foundation/color/color-role
> - https://seed-design.io/docs/foundation/design-token-reference
>
> SEED는 라이트/다크 + Property/Role/Variant/State 체계로 매우 광범위. 배너는 정적 이미지 + 라이트 테마만 사용하므로 그 부분집합만 추린다.

---

## 0. 핵심 원칙

- **유사값 절대 금지**: `#ff6600`이 brand-solid. `#FF6F0F` 같은 비공식 hex는 즉시 재작업.
- **테마**: 라이트만. 다크 토큰은 배너 매체에서 일관성 깨짐 (인쇄·SNS 다양한 환경).
- **Role 기반 사고**: hex를 직접 외우지 말고 토큰명으로 (`$color.bg.brand-solid` 같은).

---

## 1. SEED Role Property (3가지)

- **Foreground (`fg`)**: 텍스트, 아이콘
- **Background (`bg`)**: 면, 카드 배경
- **Stroke**: 윤곽선 — 배너에서 거의 안 씀

---

## 2. 배너에서 쓰는 색 — 6개로 끝

| 역할 | SEED 토큰 | hex (light) | 어디에 쓰나 |
|---|---|---|---|
| 브랜드 강조 (CTA·풀 배경) | `$color.bg.brand-solid` | `#ff6600` | CTA 배경, Wide thin 풀 배경, 장식원 |
| 연한 브랜드 배경 | `$color.bg.brand-weak` | `#fff2ec` | Square/Landscape/Portrait 메인 배경 |
| 메인 텍스트 | `$color.fg.neutral` | `#1a1c20` | 헤드 (라이트 배경 위) |
| 보조 텍스트 | `$color.fg.neutral-muted` | `#555d6d` | 서브 카피 |
| 반전 텍스트 | `$color.fg.neutral-inverted` | `#ffffff` | 헤드 (오렌지 배경 위), CTA 텍스트 |
| 경고 노트 배경 | `$color.bg.warning-solid` | `#fbdc65` | Karrot Sans 미로드 시 노란 알림 |

**hex 매핑 근거 (SEED design-token-reference):**
- `bg.brand-solid` → `palette.carrot-600` = `#ff6600`
- `bg.brand-weak` → `palette.carrot-100` = `#fff2ec`
- `fg.neutral` → `palette.gray-1000` = `#1a1c20`
- `fg.neutral-muted` → `palette.gray-800` = `#555d6d`
- `fg.neutral-inverted` → `palette.gray-00` = `#ffffff`
- `bg.warning-solid` → `palette.yellow-300` = `#fbdc65`

> **Drift 알림:** 기존 `figma-generator.md`·`quality-checklist.md`엔 `#212124`(neutral)·`#555b65`(muted)·`#ffcc00`(warning)이 적혀 있음. SEED 최신 토큰 값과 다르며, 다음 figma-generator 업데이트 시 SEED-correct 값으로 정렬할 것. 단 본 작업에선 그 파일들을 건드리지 않음.

---

## 3. 배경 ↔ 텍스트 페어링 룰

| 배경 | 헤드 | 서브 | CTA 배경 | CTA 텍스트 |
|---|---|---|---|---|
| `brand-solid` (오렌지) | `neutral-inverted` (white) | (사용 안 함) | (전체가 클릭 영역) | — |
| `brand-weak` (연주황) | `neutral` (검정) | `neutral-muted` (회색) | `brand-solid` | `neutral-inverted` |
| `static-white` | `neutral` | `neutral-muted` | `brand-solid` | `neutral-inverted` |

**대비 (SEED Inclusive Design — APCA Lc 기준):**

> 출처: https://seed-design.io/docs/foundation/inclusive-design
>
> SEED는 WCAG가 아닌 **APCA(Advanced Perceptual Contrast Algorithm)** 채택.

| 텍스트 종류 | 최소 Lc | 권장 Lc |
|---|---|---|
| 가독성 텍스트 (헤드·본문 2줄+) | 75 | 90 |
| 보조 텍스트 | 60 | — (16px 미만이면 bold 필수) |
| placeholder/disabled | 30 | — |

배너 페어링 (추정값 — 정확한 Lc는 [APCA calculator](https://www.myndex.com/APCA/)로 사전 검증 권장):
- `brand-weak` × `neutral` → Lc 90+ 추정 (헤드 안전)
- `brand-weak` × `neutral-muted` → Lc 75+ 추정 (서브 안전)
- `brand-solid` × `static-white` → Lc 60~70 추정. 16px 미만이면 부족하지만 **배너 헤드는 Heavy + 36px+** 폰트라 OK

> **전제:** 위 6색 페어링은 SEED Inclusive Design 기준 통과를 가정. 새 색상 페어링 도입 시 APCA 재계산 필수.

**Inclusive Design 보조 룰 (배너 적용):**
- 색상만으로 정보 전달 X — 배너는 텍스트 + 시각 강조(굵기·화살표 `→`·CTA 색)도 함께 사용
- 폰트 16px 미만에서 Lc 60 이상이면 bold weight 필수 (= `foundation-typography.md`의 Heavy/Bold 규칙과 일치)

---

## 4. 장식원 (Square/Landscape/Portrait)

- **색**: `$color.bg.brand-solid` (`#ff6600`)
- **opacity**: **0.1**

**0.1인 근거:** brand 컬러 존재감은 살리되 텍스트 가독성 방해 없음. 0.05면 화면에서 사라지고, 0.2면 텍스트 묻힘. 시뮬레이션 결과 0.1이 안전 마진.

---

## 5. 즉시 실패 사유

- `#FF6F0F` / `#FF7700` 등 SEED 비공식 유사 hex
- 다크 토큰 사용 (배너는 라이트 전용)
- Stroke 색을 배경에 쓰는 등 Property 혼용
- `#ff8000` 같은 carrot-500 사용 (CTA용 아님 — pressed 상태도 배너엔 무관)

---

## 6. 배너에서 쓰지 않는 SEED 색 (혼란 방지)

다음은 SEED엔 있지만 광고 배너에 쓰지 않는다:

| 카테고리 | 토큰 | 이유 |
|---|---|---|
| Status 색 | `positive`, `critical`, `informative` | UI 상태 색. 배너는 브랜드 마케팅이라 부적합 |
| 특수 컴포넌트 | `magic`, `manner-temp`, `banner.*` | 앱 내 특정 컴포넌트 전용 |
| 다크 테마 | (모든 dark 컬럼) | 배너는 라이트 전용 |
| 그라디언트 | `gradient.*` | 현재 디자인은 솔리드만. 추후 도입 시 별도 spec 필요 |
| Stroke 토큰 | `stroke.*` | 현재 배너 디자인에 윤곽선 없음 |

---

## 7. 디자이너 의사 결정 흐름

```
배경부터 정한다
└─ 풀 오렌지 → brand-solid (Wide thin)
└─ 연한 분위기 → brand-weak (Square / Landscape / Portrait)
└─ 화이트 → static-white (특수 케이스)

배경이 정해지면 텍스트는 자동
└─ brand-solid → neutral-inverted
└─ 그 외 → neutral (헤드) + neutral-muted (서브)

CTA는 항상 brand-solid + neutral-inverted (라이트 배경 위)
Wide thin은 풀 배경 자체가 CTA → 별도 CTA 요소 없음
```

---

## 8. 안 쓰는 SEED 시스템 (배너 매체 특성상)

배너는 정적 이미지·비상호작용 매체라 다음 SEED 시스템은 사용하지 않는다. 미래에 도입되면 별도 foundation 파일 신설 검토.

| 시스템 | SEED 문서 | 미사용 이유 |
|---|---|---|
| Elevation (Layer Token) | https://seed-design.io/docs/foundation/elevation | 정적 이미지엔 layer 위계 무의미. 배너는 평면(flat) |
| Shadow | https://seed-design.io/docs/foundation/elevation | `$shadow.s1~s3` 정의되어 있지만 배너에선 그림자 미사용 |
| Gradient | https://seed-design.io/docs/foundation/gradient | `$gradient.highlight-magic`(orange→purple) 등 존재하나 현 디자인은 솔리드만 |
| Iconography | https://seed-design.io/docs/foundation/iconography/overview | 배너는 로고 외 아이콘 미사용 (현 디자인 기준) |
| Motion | https://seed-design.io/docs/foundation/motion | 정적 이미지라 모션 없음 |
| State | https://seed-design.io/docs/foundation/state | 비상호작용 매체 — pressed/hover 상태 없음 |
