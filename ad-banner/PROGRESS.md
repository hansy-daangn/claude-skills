# ad-banner 작업 진행 노트 (이어서 작업용)

> 다음 기기에서 이 파일을 먼저 읽고 시작.
> 마지막 갱신: 2026-05-05 / 브랜치: `claude/improve-ad-banner-layout-yjiLC`

---

## 한 줄 요약

당근 광고배너 자동 생성 스킬의 **레이아웃 다양성 문제**를 해결 중. 사용자가 "결과물이 사이즈마다 사실상 1개 디자인"이라고 비판한 뒤, **Figma `learning Area`(8605:3281)의 검증된 98개 디자인을 정답지로 두고, 그 위치/크기를 99.9% 베끼는 능력**을 먼저 검증하는 단계.

---

## 핵심 사용자 룰 (절대 지킬 것)

1. **CTA는 무조건 프레임 하단부에 하단 정렬 풀와이드 bar** (또는 CTA 없음). 우측 세로 bar / 인라인 pill 금지.
2. **주황색 배경 금지**. 테스트 동안은 흰색 배경 통일.
3. **색으로 다양성 위장 금지**. 같은 layout인데 색만 다르면 1개 시안으로 취급.
4. **압축·일반화 금지**. 98개가 정답지면 98개 모두 보존. 카테고리 단위 1골격으로 묶지 말 것.
5. **각 프레임 배치를 그대로 따라하기**. 좌표·크기를 99.9% 일치시키는 능력이 우선.
6. **폰트는 반드시 Karrot Sans만**. 헤드/타이틀=Heavy, CTA=Heavy 또는 Bold, 나머지=Bold 이상. (현재 Karrot Sans 워크스페이스 미가용 → Noto Sans KR Black/Bold로 임시 폴백 중)
7. **모든 텍스트의 최종 상태는 자동너비** (`textAutoResize='WIDTH_AND_HEIGHT'`). 만들 때 어떻게 하든 결과물은 자동너비.

---

## 시도 이력

### v1 — 카테고리(A/B/C/D) 4개 V (실패)
사이즈를 비율 카테고리로 묶고 V1~V4를 색만 다르게 함.
- **사용자 비판**: "사이즈마다 사실상 1개 디자인. 색만 돌려놓고 다른 시안이라 우김"
- 폐기.

### v2 — 98개 모두 보존 + CTA 하단 강제 + 단색 (`commit a37e07a`)
- TEMPLATES static 폐기. `learning Area`에서 런타임 추출
- CTA `ctaBottom()`로 하단 풀와이드 bar 정규화
- 단색 모드 (흰 BG, 검정 헤드, 오렌지 CTA bar)
- ClaudeArea의 `테스트_98개_레이아웃_단색_0505` 컨테이너에 출력
- **사용자 반응**: "대체 뭘 한건지 이해가 안되네" → 베끼기 검증 모드로 방향 전환

### v3 — 원본 글자 clone (피드백 받음)
원본 TEXT 노드를 `clone()`해서 그대로 복제.
- **사용자 비판**: "정답지를 그대로 쓰지 말고 베껴 만들라고. 위치/크기를 측정해서 99.9% 일치하게 재현"
- 폐기.

### v4 — `createText()`로 위치·크기·fontSize 측정 후 재현
원본 메타 측정 → `figma.createText()` + 같은 좌표·박스 크기·fontSize 적용.
- 폰트 폴백 사용. 박스는 `textAutoResize='NONE'` 고정
- **사용자 피드백**: "글자는 자동너비로. 폰트는 반드시 Karrot Sans"

### v5 — Karrot Sans 강제 + 자동너비 (현재)
- `textAutoResize='WIDTH_AND_HEIGHT'` 강제
- 폰트 분류: 프레임 내 max fontSize = Heavy, 그 외 = Bold
- **현재 이슈**: 워크스페이스에 Karrot Sans 0개 → Noto Sans KR Black/Bold로 임시 폴백
- ClaudeArea의 `베껴쓰기_자동너비_0505` 컨테이너에 출력 완료 (98개)
- 검증 코드: `ad-banner/scripts/copy-verify.js`

---

## 미해결 이슈 (다음 작업 우선순위)

### 1. Karrot Sans 폰트 가용성 (HIGH)
- 워크스페이스에 Karrot Sans 한 개도 없음 → 사용자가 폰트 설치하거나, Pretendard 등 더 가까운 폴백 협의 필요
- 사용자가 다른 기기에서 시작할 때 가장 먼저 확인할 것: `figma.listAvailableFontsAsync()`로 Karrot Sans variants 존재 여부

### 2. INSTANCE 내부 텍스트가 빈 frame으로 나옴
- PickUp/baro/일부 jobs 캠페인은 헤드가 INSTANCE의 detached 안 된 자식이거나 이미지화된 상태
- `walk()`가 INSTANCE.children도 traverse하지만 일부 케이스에서 누락
- 해결: `findAll(n => n.type === 'TEXT')` 등으로 모든 후손 TEXT 노드를 명시적으로 잡기, 또는 mainComponent로 들어가서 텍스트 슬롯 찾기

### 3. 베껴쓰기 정확도 정량 평가 필요
- 사용자: "99.9% 일치하는지" 검증 단계
- 측정 방법: 각 시안의 헤드 (x, y, w, h, fontSize)를 원본과 비교해 diff 합산
- 자동 검증 스크립트 작성 필요

### 4. 베끼기 통과 후 → 본 스킬에 결과 반영
- 베끼기가 99.9% 통과되면 → 동일 로직(위치/크기 측정 → createText)로 새 캠페인 카피 적용
- 사용자가 새 카피 입력 시 원본 카피 자리에 새 카피로 교체 (위치/크기는 보존, 자동너비)

---

## 파일 구조 (현재 브랜치)

```
ad-banner/
├── PROGRESS.md  ← 본 파일
├── SKILL.md
├── references/
│   ├── figma-generator.md  ← v2 코드 (98개 학습 모드, CTA 하단)
│   ├── layout-spec.md      ← v2 (98 시안 분포 요약)
│   ├── layouts/*.md        ← v2 (사이즈마다 시안 좌표 요약)
│   ├── quality-checklist.md
│   └── ... (foundation-*, copy-library 등 변경 없음)
├── scripts/
│   └── copy-verify.js      ← v5 베껴쓰기 검증 코드 (use_figma 붙여넣기)
└── examples/
```

---

## Figma 작업물 위치

- **정답지**: `learning Area` 페이지 (node `8605:3281`) — 98개 화이트리스트 프레임
  - URL: https://www.figma.com/design/CVeyCAgnLzNqGPbKlHh8wN/HANSY?node-id=8605-3281
- **테스트 출력**: `Claude Area` 페이지 (node `8297:11349`)
  - `테스트_98개_레이아웃_단색_0505` (v2 generator 출력)
  - `베껴쓰기_정확도_0505` (v4 createText 폴백)
  - `베껴쓰기_자동너비_0505` (v5 자동너비 + Noto Sans KR 폴백)

---

## 다음 단계 (체크리스트)

- [ ] Karrot Sans 폰트가 워크스페이스에 등록되어 있는지 확인. 없으면 사용자에게 설치 요청 (또는 Pretendard 폴백 협의)
- [ ] `scripts/copy-verify.js` 실행 → 결과물이 원본과 99.9% 일치하는지 사이즈별로 줌인 비교
- [ ] INSTANCE 내부 텍스트 누락 케이스 수정 (`findAll`로 모든 후손 TEXT 잡기)
- [ ] 사이즈마다 자동 정확도 점수 계산 (헤드 좌표 diff 합산)
- [ ] 베끼기 통과 후 → 본 generator(`figma-generator.md`)에 같은 측정 로직 적용 + 새 캠페인 카피 치환 기능 추가
- [ ] CTA 하단 강제 룰을 베끼기 후 출력에도 적용 (헤드는 원본 위치, CTA만 정규화)

---

## 주의

- 사용자는 매우 화나 있고 "압축 본능", "공통점 추출", "색 변형 위장"을 가장 싫어함. **각 프레임 그대로**가 핵심.
- 작업 시작 전에 본 파일 + `ad-banner/scripts/copy-verify.js` 함께 읽기.
