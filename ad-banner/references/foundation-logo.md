# Foundation: Logo (광고 배너용)

> **출처**: https://seed-design.io/docs/foundation/logo
>
> SEED 로고 가이드는 시그니처/심볼/배경색/clear space/permission 중심. 배너는 Figma 컴포넌트 인스턴스로 가져오므로 (이모지·SVG 직접 그리기 금지), **컴포넌트 키 + 배너 비율별 크기 룰**이 핵심.

---

## 0. 절대 규칙

- 🥕 이모지 사용 금지
- 직접 그린 SVG / Vector path 금지
- **공식 컴포넌트 인스턴스만 사용**
- 색상 변형은 Primary / White 두 개만 (제3 색은 브랜딩 팀 사전 협의 필요 — 자동 배너 생성에선 지원 X)

---

## 1. 컴포넌트 키 (Figma — 당근 enterprise workspace)

| 변형 | Component Key | 사용 배경 |
|---|---|---|
| Logo_korean Primary | `7bd06aa4147de6d53637e133cf38a78659e36f63` | 라이트 (`brand-weak`, `static-white`) |
| Logo_korean White | `ccfd3319d4232252f37a5de518cd0631f2174e22` | 오렌지 (`brand-solid`) |

```js
const mainP = await figma.importComponentByKeyAsync('7bd06aa4147de6d53637e133cf38a78659e36f63');
const mainW = await figma.importComponentByKeyAsync('ccfd3319d4232252f37a5de518cd0631f2174e22');
```

---

## 2. 컴포넌트 원본 비율

- **시그니처(워드마크 포함) 원본: 203 × 100** (가로:세로 ≈ 2.03)
- 인스턴스 리사이즈는 이 비율을 깨뜨리지 않는다.

```js
function makeLogo(targetH, white = false) {
  const inst = (white ? mainW : mainP).createInstance();
  const scale = targetH / 100;
  inst.resize(203 * scale, 100 * scale);
  return inst;
}
```

> **Symbol-only 옵션 (참고):**
> SEED는 시그니처(워드마크 포함) 외에 **Symbol(Secondary) 단독 사용**도 허용한다 — "당근이 주체임이 명확할 때 디자인 다양성 목적". 현재 자동 배너 생성은 시그니처만 사용 (워드마크 가독성을 보장하기 위해). 100×100 미만 초소형 배너가 추가되거나 워드마크가 가려지는 케이스가 생기면 Symbol-only 컴포넌트 키를 별도 등록 후 도입 검토.

---

## 3. 배너 비율별 로고 높이 (h 대비)

| 배너 비율 | layout | logo H 비율 | 근거 |
|---|---|---|---|
| Wide thin (≥ 2.5) | A | `h × 0.36` | 풀 오렌지 배경 + 작은 frame. 로고가 시각 중심 (CTA 역할 겸). |
| Square (0.9 ~ 1.3) | B | `h × 0.085` | 좌상단 배지처럼 작게. 헤드/CTA가 메인. |
| Landscape (1.3 ~ 2.5) | C | `h × 0.115` | 좌상단. 콘텐츠와 충돌하지 않을 정도. |
| Portrait (< 0.9) | D | `h × 0.055` | 세로형은 로고 작아도 식별 가능. |

> **왜 Wide만 36%, 나머지는 5~12%인가:**
> Wide(320×100)는 로고가 전체 시각의 30~40% 차지하는 게 SEED clear-space 권장에 가까움 (작은 frame이라 로고와 카피 둘 다 살아남으려면 큰 비율 필요). 다른 사이즈는 헤드/서브/CTA 스택이 메인이라 로고는 작은 배지 역할.

---

## 4. 사이즈별 실측 로고 크기

| 배너 | layout | h | logo H | logo W (×2.03) |
|---|---|---|---|---|
| 320×100 | A | 100 | 36 | 73 |
| 720×720 | B | 720 | 61 | 124 |
| 1200×600 | C | 600 | 69 | 140 |
| 1200×1500 | D | 1500 | 83 | 168 |
| 320×480 | D | 480 | 26 | 53 |
| 1080×1080 | B | 1080 | 92 | 187 |
| 1080×1920 | D | 1920 | 106 | 215 |

---

## 5. Clear Space (SEED 가이드 → 배너 변환)

SEED는 시그니처 로고 주위에 일정 공간 확보 권장. 배너에서는:

| 위치 | 최소 여백 |
|---|---|
| 외곽 (frame ↔ logo) | `foundation-spacing.md`의 외곽 `pad` 값 |
| 로고 ↔ 헤드/스택 (Landscape) | `h × 0.05` (clamp 8~60) — 별도 안전 로직은 `figma-generator.md` 참조 |
| 로고 ↔ 헤드 (Square/Portrait) | 외곽 `pad`로 확보됨 (로고 좌상, 스택 하단) |

---

## 6. 로고 색상 결정 룰

배경 → 로고 변형이 **자동으로 결정**된다:

| 배경 | 로고 변형 |
|---|---|
| `brand-solid` (#ff6600) | **White** |
| `brand-weak` (#fff2ec) | **Primary** |
| `static-white` (#ffffff) | **Primary** |
| 그 외 | 사용 안 함 (자동 배너 생성 미지원) |

---

## 7. 즉시 실패 사유

- 🥕 이모지 사용
- 컴포넌트 인스턴스 아닌 그래픽 (SVG / Vector path 직접 그림)
- 원본 비율 (203:100) 깨뜨림 (예: `inst.resize(120, 100)`)
- 오렌지 배경 위 Primary 변형 (대비 부족)
- 로고가 헤드/CTA와 겹침 (특히 Landscape에서 자주 발생 — `figma-generator.md`의 layC 안전 로직 확인)
- 협의 없이 제3 색 변형 시도

---

## 8. Brand Permission (간단)

자동 생성 배너는 퍼포먼스 광고용 (몰로코·메타·구글 등 매체 노출). 협업·파트너십·물리적 인쇄물에 그대로 사용 시 브랜딩 팀 컨펌 필요. 출처: https://seed-design.io/docs/foundation/logo
