# 레이아웃 인사이트 — 절대 룰

> 사이즈별 md 작성 시 / 배너 생성 시 항상 적용. 정답 시안에 없어 보여도 본 룰이 우선.

## L1. 로고: `Logo_korean` 컴포넌트만

- 다른 변형(`Logo_business`, `Logo_global` 등) 사용 금지.
- 기존 시안의 로고가 무엇이든 결과물은 반드시 `Logo_korean`.
- SVG/이모지/텍스트로 로고 그리기 금지 (R2 동일).

## L2. 로고 무결성

- 로고 인스턴스가 잘리거나 일부만 보이는 상태 금지.
- 부모 프레임 `clipsContent=true`인 경우, 로고 bbox가 부모 안에 완전히 포함되는지 검증.
- 로고 width/height가 0 또는 음수 금지.

## L3. 텍스트 박스 보존

- 시안에서 텍스트와 그룹된 배경 `Rectangle` 또는 `Autolayout` 텍스트 박스는 분해/제거 금지.
- 시각 그룹(텍스트 + 배경) 단위로 이동/스케일.
- CTA가 박스에 감싸진 경우, **같은 사이즈의 프레임으로 감싸고 색상 사용**. 텍스트만 떼어내지 않는다.

## L4. 마진 절대 우선 ⭐

- **정답 시안에 마진이 없어 보여도 반드시 `foundation-spacing.md` 적용.**
- 모든 사이즈에서 좌/우/상/하 padding은 `foundation-spacing.md`의 비율 공식 + clamp 결과를 그대로 사용.
- 시안 모방을 위해 padding을 0으로 두지 않는다. 어떤 경우에도.

## L5. 글자 자동너비

- 모든 텍스트 노드는 `textAutoResize=WIDTH_AND_HEIGHT` (자동너비).
- 고정 너비/고정 높이 텍스트 박스 금지.

## L6. 한 텍스트 노드 = 한 특성

- 폰트 사이즈, 줄간격(lineHeight), 자간(letterSpacing), 굵기, 색상이 한 텍스트 노드 내에서 섞이면 안 됨.
- 예: "당근 **새로운 거래** 시작" 처럼 일부만 굵거나 크기가 다르면 → 두 개(또는 세 개) 텍스트 노드로 분리.
- Figma의 mixed-style 상태(`fontSize=mixed`) 발견 시 fail로 간주.

## L7. CTA 박스 형태

- CTA가 박스로 감싸진 경우 → 박스는 Frame(Autolayout 권장) 또는 Rectangle.
- 박스의 width/height는 CTA 텍스트의 자동너비 + padding으로 결정.
- 박스 색상은 시안의 색상을 그대로 사용 (SEED Role 토큰 매핑).

---

## 룰 위반 자동 검출 (생성/검증 단계)

| 룰 | 검출 조건 |
|---|---|
| L1 | 로고 컴포넌트 key가 `Logo_korean` 외 |
| L2 | 로고 노드 visible=false 또는 bbox가 부모 밖 |
| L3 | 텍스트 노드의 형제 Rectangle/배경 Frame이 누락됨 |
| L4 | 프레임 padding=0 또는 텍스트가 프레임 가장자리에 닿음 |
| L5 | 텍스트 노드 textAutoResize ≠ WIDTH_AND_HEIGHT |
| L6 | 텍스트 노드의 fontSize/lineHeight/letterSpacing/fills/fontWeight = mixed |
| L7 | CTA 텍스트의 부모 type ≠ FRAME && ≠ AUTO-LAYOUT && ≠ RECTANGLE 그룹 |
