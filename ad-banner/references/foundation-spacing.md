# Foundation: Spacing (광고 배너용)

> **출처**: https://seed-design.io/docs/foundation/spacing
>
> ⚠️ SEED spacing 토큰은 **모바일 UI(360~414px 폭) 기준 절대 px**. 배너는 320~1500+px까지 다양해서 절대값을 그대로 쓰면 큰 배너에선 너무 좁고 작은 배너에선 너무 넓다.
>
> → **배너에서는 비율 기반 spacing을 쓴다. 단, 양쪽 극단을 `clamp(min, max)`로 잡는다.**

---

## 0. 핵심 결정 함수

```js
// 배너 spacing 헬퍼
function bspace(ratio, ref, min, max) {
  return Math.max(min, Math.min(max, Math.round(ref * ratio)));
}
```

`ref`는 보통 `h` (배너 높이) 또는 `min(w, h)` (단변).

---

## 1. SEED 원본 토큰 (모바일 UI 기준 — 참고만)

| Token | px | 모바일 용도 |
|---|---|---|
| `$dimension.x1` | 4 | 미세 간격 |
| `$dimension.x2` | 8 | between-chips |
| `$dimension.x3` | 12 | component-default vertical |
| `$dimension.x4` | 16 | global-gutter |
| `$dimension.x5` | 20 | nav-to-title |
| `$dimension.x6` | 24 | 카드 padding |
| `$dimension.x8` | 32 | 섹션 간 |
| `$dimension.x14` | 56 | screen-bottom |
| `$dimension.x16` | 64 | 큰 섹션 |

> **왜 그대로 못 쓰는가**: 16px(`x4`)는 360px 폭 모바일 카드에서 적절한 좌우 padding이지만, 1200×1500 배너에 쓰면 점처럼 좁아 보인다. SEED 토큰은 **시각적 비율이 아니라 모바일 화면의 절대 px**으로 정의되어 있기 때문.

---

## 2. 배너 비율 환산 룰 (광고 배너 핵심)

| 용도 | 공식 | min | max | 근거 |
|---|---|---|---|---|
| 외곽 padding (Wide thin) | `w × 0.05` | 12 | 80 | 좌우 safe zone |
| 외곽 padding (Square) | `min(w,h) × 0.075` | 16 | 90 | 정사각형 → 단변 기준 |
| 외곽 padding (Landscape) | `h × 0.08` | 20 | 90 | 세로 기준이 자연스러움 |
| 외곽 padding (Portrait) | `w × 0.065` | 16 | 90 | 가로 기준 |
| Head ↔ Sub gap | `h × 0.020` | 4 | 32 | 시각 그룹화 |
| Sub ↔ CTA gap | `h × 0.045` | 8 | 64 | 행동 분리 강조 |
| Logo ↔ Stack gap (Landscape) | `h × 0.05` | 8 | 60 | 로고/콘텐츠 시각 분리 |
| 컨텐츠 너비 (Landscape) | `w × 0.58` | — | — | 우측 장식원 공간 확보 |

> **clamp 안 하면 무슨 일이 일어나는가:**
> - 320×100에 `w × 0.05` = 16px → OK
> - 1200×1500에 `w × 0.065` = 78px → OK
> - 4000×100 같은 극단 → 200px padding이 되어 카피 공간 사라짐. **max로 막아야 한다.**
> - 100×100 정사각 같은 극단 → 7.5px이 되어 텍스트가 가장자리에 붙음. **min으로 막아야 한다.**

---

## 3. 사이즈별 실측 환산 표

| 사이즈 | w/h | layout | 외곽 pad | Head-Sub | Sub-CTA |
|---|---|---|---|---|---|
| 320×100 | 3.2 (Wide) | A | 16 (w×.05) | — | — |
| 720×720 | 1.0 (Square) | B | 54 (min×.075) | 14 | 32 |
| 1200×600 | 2.0 (Landscape) | C | 48 (h×.08) | 12 | 27 |
| 1200×1500 | 0.8 (Portrait) | D | 78 (w×.065) | 30 | 64* |
| 320×480 | 0.67 (Portrait) | D | 21 (w×.065) | 9 | 21 |
| 1080×1080 | 1.0 (Square) | B | 81 (min×.075) | 22 | 49 |
| 1080×1920 | 0.56 (Portrait) | D | 70 (w×.065) | 38 | 64* |

`*`는 max=64 clamp 적용 케이스.

---

## 4. SEED ↔ 배너 사고 매핑

비율 공식이 SEED 토큰 어디쯤에 해당하는지 (디자이너 멘탈 모델):

| 배너 사이즈 | h × 0.05 | 가까운 SEED 토큰 |
|---|---|---|
| 320×100 | 5px | `x1` (4) |
| 720×720 | 36px | `x9` (36) |
| 1200×600 | 30px | `x8` (32) |
| 1200×1500 | 75px | `x16` 사이 (64~80) |

→ 같은 "padding"이라도 배너 사이즈에 따라 SEED `x1`~`x16` 사이를 자유롭게 오간다. 그래서 단일 토큰값에 묶일 수 없다.

---

## 5. 배너에서 쓰지 않는 SEED 토큰

| 토큰 | 이유 |
|---|---|
| `spacing-y.nav-to-title`, `screen-bottom` | 모바일 화면 구조 전제 |
| `spacing-x.between-chips` | 칩 컴포넌트 전용 |
| `spacing-y.between-text` (6px) | 한국어 Heavy 폰트 + 큰 사이즈에선 너무 좁음 |

---

## 6. 즉시 실패 사유

- 모든 사이즈에 동일 절대 px (예: 항상 `pad = 24`)
- min/max clamp 없이 비율만 적용 → 320×100에서 `pad = 5`px 나와 텍스트 잘림
- 비율식 분모가 사이즈마다 다름 (예: Wide=`w`, Square=`h`) → 일관성 깨짐. 한 layout 안에서는 하나의 ref만 쓴다.
- Head-Sub gap > Sub-CTA gap → 시각 계층 역전 (CTA가 Sub 옆에 붙어 보임)

---

## 7. 디자이너 의사 결정 흐름

```
1. 비율(w/h) 계산 → layout A/B/C/D 결정
2. 해당 layout의 ref(w 또는 h 또는 min) 선택
3. ratio × ref 계산
4. min/max clamp
5. Head-Sub-CTA 스택은 bottom-up (CTA부터 위로 쌓기)
```
