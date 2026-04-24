# 레이아웃 스펙 — 비율별 검증된 패턴

같은 비율은 같은 레이아웃 함수 + 스케일 조정으로 일관성 유지.

---

## 비율 기준 레이아웃 선택

| 비율 w/h | 카테고리 | 레이아웃 | 예시 사이즈 |
|---|---|---|---|
| ≥ 2.5 | Wide Thin | A | 320×100 (3.2:1) |
| 1.3 ~ 2.5 | Landscape | C | 480×320 (1.5:1), 1200×600 (2:1) |
| 0.9 ~ 1.3 | Square-ish | B | 300×250 (1.2:1), 720×720 (1:1) |
| < 0.9 | Portrait | D | 320×480, 720×960, 768×1024, 720×1280, 1200×1500 |

---

## 🟧 Layout A — Wide Thin

**용도:** 모바일 배너 (320×100)  
**배경:** `$color.bg.brand-solid` (오렌지)  
**구조:** [Logo] — [Head] — (empty)  
**모든 요소 세로 가운데 정렬**

### 요소별 수치
| 요소 | 계산 | 근거 |
|---|---|---|
| Padding | `w × 0.05` | 좌우 safe zone |
| Logo 높이 | `h × 0.36` | 브랜드 식별 + 비율 |
| Logo 색상 | `Color=White` | 오렌지 배경 대비 |
| Head-Logo gap | `w × 0.035` | 시각 분리 |
| Head 폰트 | `fitSize(HEAD_W, maxW, h × 0.2)` | 1줄 수용 |
| Head 색상 | `$color.fg.neutral-inverted` (white) | 오렌지 위 |
| CTA | 없음 | Wide thin은 전체가 클릭 영역 |

### 헤드카피 규칙
- 1줄만
- 6~10자
- 뒤에 `→` 붙이기 (행동 유도)

---

## 🟨 Layout B — Square-ish

**용도:** 미디엄 배너 (300×250, 720×720)  
**배경:** `$color.bg.brand-weak`  
**구조:** Logo 좌상 + 장식원 우하 + 하단 스택 (Head→Sub→CTA)

### 요소별 수치
| 요소 | 계산 |
|---|---|
| Padding | `min(w,h) × 0.075` |
| 장식원 크기 | `w × 0.8` |
| 장식원 위치 | `(w×0.48, h×0.4)` — 우하단 잘림 |
| 장식원 opacity | `0.1` |
| Logo 높이 | `h × 0.085` |
| Logo 색상 | Primary (오렌지) |
| Head 폰트 | `fitSize(HEAD, cW, h × 0.11)` |
| Sub 폰트 | `fitSize(SUB, cW, h × 0.046)` |
| CTA 폰트 | `h × 0.058` |
| Head-Sub gap | `h × 0.015` |
| Sub-CTA gap | `h × 0.035` |

### 배치 로직 (bottom-up)
```
cta.y = h - pad - ctaH(cSz)
sub.y = cta.y - gap_sc - calcH(SUB, sSz, cW)
head.y = sub.y - gap_hs - calcH(HEAD, hSz, cW)
```

---

## 🟩 Layout C — Landscape

**용도:** 풀스크린 가로·네이티브 와이드 (480×320, 1200×600)  
**배경:** `$color.bg.brand-weak`  
**구조:** Logo 좌상 + 큰 장식원 우측 잘림 + 좌측 스택 (Head→Sub→CTA)

### 요소별 수치
| 요소 | 계산 |
|---|---|
| Padding | `h × 0.08` |
| 장식원 크기 | `h × 1.3` (프레임 밖으로 튀어나옴, clipsContent=true) |
| 장식원 위치 | `(w - h×0.88, -h×0.28)` — 우상단 |
| 장식원 opacity | `0.1` |
| Logo 높이 | `h × 0.115` |
| 컨텐츠 너비 `cW` | `w × 0.58` (좌측 58%) |
| Head 폰트 | `fitSize(HEAD, cW, h × 0.14)` |
| Sub 폰트 | `fitSize(SUB, cW, h × 0.058)` |
| CTA 폰트 | `h × 0.07` |
| Head-Sub gap | `h × 0.025` |
| Sub-CTA gap | `h × 0.05` |

---

## 🟦 Layout D — Portrait

**용도:** 모든 세로형 (320×480, 720×960, 768×1024, 720×1280, 1200×1500)  
**배경:** `$color.bg.brand-weak`  
**구조:** Logo 좌상 + 큰 장식원 상단 (원 반쪽만 보임) + 하단 스택

### 요소별 수치
| 요소 | 계산 |
|---|---|
| Padding | `w × 0.065` |
| 장식원 크기 | `w × 1.0` |
| 장식원 위치 | `(-w×0.02, h×0.15)` |
| 장식원 opacity | `0.1` |
| Logo 높이 | `h × 0.055` |
| 컨텐츠 너비 `cW` | `w - pad×2` |
| Head 폰트 | `fitSize(HEAD, cW, h × 0.08)` |
| Sub 폰트 | `fitSize(SUB, cW, h × 0.032)` |
| CTA 폰트 | `h × 0.038` |
| Head-Sub gap | `h × 0.015` |
| Sub-CTA gap | `h × 0.03` |

---

## 📊 수치의 근거

### 왜 `fitSize`로 크기 자동 조정?
- 헤드카피 길이가 캠페인마다 다름
- 같은 비율이라도 사이즈 작은 banner는 더 작은 폰트 필요
- 고정 비율 (h × 0.11 등)만 쓰면 wraps 발생 → 겹침

### 왜 bottom-up 스태킹?
- CTA가 항상 하단 고정 (안전 영역, 즉 "행동 유도")
- Sub는 CTA 바로 위 (읽기 자연스러움)
- Head는 가장 위 (시각 계층)

### 왜 장식원 opacity 0.1?
- 브랜드 컬러 존재감은 살리되 텍스트 가독성 방해 없음

---

## ⚠️ 레이아웃 실패 체크

각 배너 생성 후 screenshot으로 검증:

- [ ] 헤드가 프레임 안에 완전히 들어감 (잘림 없음)
- [ ] 헤드-서브-CTA 간 겹침 없음
- [ ] 로고와 스택 간 겹침 없음
- [ ] 장식원이 텍스트 가독성 해치지 않음
- [ ] 좌우 pad 균등
- [ ] CTA가 시각적으로 "버튼"으로 인식됨

하나라도 실패하면 해당 레이아웃 파라미터 재조정.
