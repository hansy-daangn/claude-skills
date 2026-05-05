# 레이아웃 스펙 — 인덱스

확정 사이즈는 락 10종(아래 표). 각 사이즈는 비율 카테고리(A/B/C/D)에 속하고, 같은 카테고리 안에서 V1~V4 시안이 같은 비율 데이터를 공유한다.

V1~V4는 단순 색 변형이 아니라 **헤드/로고/CTA 위치가 모두 다른 4가지 배치**다. 비율 데이터는 Figma `learning Area`의 검증된 4개 캠페인(Moloco, PickUp, baro_running, image_jobs)에서 추출.

좌표·비율 데이터는 `figma-generator.md`의 `TPL` 객체에 보존된다. 각 사이즈 md는 시안의 추상 특징만 기록한다.

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

---

## CTA 룰

- 버튼형 CTA가 헤드/서브와 같은 stack 안 → **inline pill** (텍스트 stack 좌측 정렬, 같은 폭)
- 헤드/서브와 떨어져 있음 → **풀와이드 bar** (가로형 320×100은 우측 세로 풀-하이트 bar로 변형, 폭 ~10%)
- 두 형태가 한 디자인에서 섞이지 않음

검증된 데이터에서 inline pill은 거의 등장하지 않고, 모든 CTA는 bar 형태 또는 CTA 없음(Solid Hero).

---

## 카테고리별 V1~V4 (요약)

### A — Wide Thin (320×100)
- V1: Solid 텍스트만 (CTA 없음)
- V2: Weak + 좌 로고 + 우측 세로 bar
- V3: White + 좌 로고 + 우측 세로 bar
- V4: Weak + 강조 헤드 + 우측 세로 bar

### B — Square-ish (300×250, 720×720)
- V1: Solid + 라벨 + 큰 헤드 (CTA 없음)
- V2: White + 좌상 로고 + 풀와이드 하단 bar
- V3: Weak + 헤드만 + 좌하 로고 (CTA 없음)
- V4: White + 좌상 로고 + 강조 헤드 + 풀와이드 하단 bar

### C — Landscape (480×320, 1200×628)
- V1: Solid + 좌헤드 3줄 + 풀와이드 하단 bar
- V2: White + 좌하 로고 + 좌헤드 + 풀와이드 하단 bar
- V3: Weak + 우상 로고 + 좌헤드 + 풀와이드 하단 bar
- V4: White + 좌상 로고 + 강조 헤드 + 풀와이드 하단 bar

### D — Portrait (5개 사이즈)
- V1: Solid + 상단 헤드 3줄 + 풀와이드 하단 bar
- V2: White + 가운데 상단 로고 + 헤드 + 풀와이드 하단 bar
- V3: Weak + 가운데 상단 로고 + 헤드 + 풀와이드 하단 bar
- V4: White + 가운데 상단 로고 + 강조 헤드 + 풀와이드 하단 bar

---

## 데이터 출처

비율 데이터는 다음 캠페인에서 추출 (각 사이즈마다 4개 다른 캠페인):
- Moloco_Static / Native (당근비즈니스 어워즈)
- google_GDN_Static (이벤트성)
- img_PickUpMonthlyPromo_v1
- baro_running
- image_jobs_review/nearby/new semester
- image_realty_honey/reliable_tenant

색은 SEED 토큰(`bg.brand-solid` / `bg.brand-weak` / `bg.neutral` / `fg.neutral` / `fg.neutral-inverted` / `fg.brand-solid`)으로 일반화. 원본의 검정 배경, 일러스트 색 등은 무시 — 위치와 크기만 보존.

---

## 출력 기대치

스킬 1회 실행 = 락 10종 × V1~V4 = **40 프레임**이 한 컨테이너에 자동 생성. 사이즈마다 한 행에 V1→V4 가로 배치, 사이즈는 세로로 누적.

---

## 레이아웃 실패 체크 (생성 후 screenshot 검증)

- [ ] 헤드가 프레임 안에 완전히 들어감 (잘림 없음)
- [ ] CTA bar 위 텍스트가 가운데 정렬됨
- [ ] 로고와 헤드/CTA 겹침 없음
- [ ] V1~V4가 같은 사이즈 안에서 배치가 진짜 다름 (단순 색 변형 아님)
- [ ] 우측 세로 bar (A 카테고리)가 cornerRadius=0으로 깔끔
