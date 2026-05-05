# 레이아웃 스펙 — 인덱스

확정 사이즈는 락 10종(아래 표). 각 사이즈마다 검증된 변형 V1~V4가 별도 md에 있다.

레이아웃 함수는 비율 카테고리(A/B/C/D)로 그루핑하고, 변형(V1~V4)은 같은 카테고리 안에서 배경/구조/CTA 유무가 다르다.

---

## 사이즈 → md 매핑

| 사이즈 | 비율 | 카테고리 | 가이드 |
|---|---|---|---|
| 320×100 | 3.2:1 | A (Wide Thin) | [layouts/320x100.md](./layouts/320x100.md) |
| 300×250 | 1.2:1 | B (Square-ish) | [layouts/300x250.md](./layouts/300x250.md) |
| 720×720 | 1:1 | B (Square) | [layouts/720x720.md](./layouts/720x720.md) |
| 480×320 | 1.5:1 | C (Landscape) | [layouts/480x320.md](./layouts/480x320.md) |
| 1200×628 | 1.91:1 | C (Landscape Wide) | [layouts/1200x628.md](./layouts/1200x628.md) |
| 320×480 | 2:3 | D (Portrait) | [layouts/320x480.md](./layouts/320x480.md) |
| 720×960 | 3:4 | D (Portrait) | [layouts/720x960.md](./layouts/720x960.md) |
| 768×1024 | 3:4 | D (Portrait Tall) | [layouts/768x1024.md](./layouts/768x1024.md) |
| 720×1280 | 9:16 | D (Tall Portrait) | [layouts/720x1280.md](./layouts/720x1280.md) |
| 1200×1600 | 3:4 | D (Portrait Large) | [layouts/1200x1600.md](./layouts/1200x1600.md) |

> 락 10종은 SKILL.md "기본 사이즈 세트"와 동일. 사용자 직접 수정 요청 없이 변경 금지.

---

## 변형 골격 (V1~V4 공통 정의)

같은 사이즈 안에서 V1~V4는 배경·구조·CTA 유무가 다르다. 비율 공식은 카테고리(A/B/C/D)에 따라 결정되고, V는 그 위에 얹는 스타일.

| V | 배경 | 헤드 위치 | CTA | 일러스트 |
|---|---|---|---|---|
| V1 | 흰색 (`bg.neutral`) | 상단 / 좌측 (사이즈에 따라) | 풀와이드 하단 `bg.brand-solid` 버튼 (`$radius.full`) | 가운데 또는 우측 |
| V2 | `bg.brand-solid` | 상단 / 좌측 | 없음 또는 작은 `bg.brand-weak` 인라인 | 가운데 또는 우측 (캐릭터 위주) |
| V3 | `bg.brand-weak` | 좌상 로고 + 텍스트 스택 | 스택 안 인라인 또는 풀와이드 (사이즈) | 가운데 또는 우측 |
| V4 | 흰색 또는 `bg.brand-solid` | 헤드 강조 (키워드 1~2개를 `fg.brand-solid`) | 풀와이드 또는 없음 | 가운데 |

> 320×100(A 카테고리)은 공간 부족으로 별도 변형 정의 — `layouts/320x100.md` 참조.

---

## 카테고리별 비율 공식 (foundation-spacing 환산)

| 카테고리 | Padding | Logo h | Head 폰트 | Sub 폰트 | CTA 폰트 | 컨텐츠 너비 cW |
|---|---|---|---|---|---|---|
| A (Wide Thin, ≥2.5) | `w × 0.05` | `h × 0.36` | `fitSize(HEAD, mw, h × 0.20)` | — | — | `w − pad − logo − gap` |
| B (Square, 0.9~1.3) | `min(w,h) × 0.075` | `h × 0.085` | `fitSize(HEAD, cW, h × 0.11)` | `fitSize(SUB, cW, h × 0.046)` | `h × 0.058` | `w − pad × 2` |
| C (Landscape, 1.3~2.5) | `h × 0.08` | `h × 0.115` | `fitSize(HEAD, cW, h × 0.14)` | `fitSize(SUB, cW, h × 0.058)` | `h × 0.072` | `w × 0.58` |
| D (Portrait, <0.9) | `w × 0.065` | `h × 0.055` | `fitSize(HEAD, cW, h × 0.08)` | `fitSize(SUB, cW, h × 0.032)` | `h × 0.048` | `w − pad × 2` |

gap 표준:
- B/D: H↔S `h × 0.015`, S↔C `h × 0.03~0.035`
- C: H↔S `h × 0.025`, S↔C `h × 0.05`, Logo↔Stack `h × 0.05`

---

## 출력 기대치

스킬 1회 실행 = 락 10종 × V1~V4 = **40 프레임**이 한 컨테이너에 자동 생성. 사이즈마다 한 행에 V1→V4 가로 배치, 사이즈는 세로로 누적.

---

## 레이아웃 실패 체크 (생성 후 screenshot 검증)

- [ ] 헤드가 프레임 안에 완전히 들어감 (잘림 없음)
- [ ] 헤드↔서브↔CTA 겹침 없음
- [ ] 로고와 스택 겹침 없음
- [ ] 좌우 pad 균등
- [ ] CTA가 시각적으로 "버튼"으로 인식됨
- [ ] V2/V4의 큰 헤드가 cW 밖으로 튀어나오지 않음

하나라도 실패하면 해당 사이즈/V의 비율 파라미터 재조정.
