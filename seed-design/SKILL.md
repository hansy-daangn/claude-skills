---
name: seed-design
description: |
  당근 SEED Design 시스템 통합 가이드. 프로젝트 셋업, 컴포넌트 탐색/사용, 파운데이션(색·타이포·스페이싱·테마), CLI(init/add/add-all/compat/docs/upgrade), 스니펫 버전 호환, 업그레이드 진단.

  **다음 키워드/상황에서 발동한다:**
  - "SEED 어떻게 써?", "SEED 셋업", "seed-design.json"
  - 컴포넌트 탐색·추가 ("Action Button 쓰고 싶어", "어떤 컴포넌트 있어?")
  - SEED 색·타이포·스페이싱·radius·테마 토큰 질문
  - `@seed-design/*` 패키지 업그레이드/마이그레이션

  **발동 안 함:** 다른 디자인 시스템(Material, Ant, Chakra) 일반 질문 / SEED와 무관한 React·CSS 일반 질문 / 광고 배너 생성(=`ad-banner` 스킬).
user-invocable: true
argument-hint: "[질문 또는 주제]"
---

# SEED Design

당근 SEED Design 진입 라우터. 사용자 질문 유형 → 해당 reference로 즉시 분기한다. 절차는 references에 있다.

## 라우팅 표 (가장 먼저 본다)

| 사용자 질문 유형 | 분기할 reference |
|---|---|
| `seed-design.json` 없음 / 처음 셋업 | `references/getting-started.md` |
| 어떤 컴포넌트 있어? / 컴포넌트 추가 | `references/components.md` |
| 색·타이포·스페이싱·radius·테마 토큰 | `references/foundation.md` |
| `npx @seed-design/cli` 명령어 사용법 | `references/usage.md` |
| 스니펫 버전 호환 / 마이그레이션 | `references/migration.md` |
| 패키지 업그레이드 진단 | `references/upgrade.md` |

사용자가 주제를 명시하면 프로젝트 분석 없이 바로 해당 reference로 직행. 그렇지 않으면 아래 진입 규칙.

## 진입 규칙 (질문이 모호할 때만)

프로젝트 루트에서 다음을 한 번만 확인한다 (병렬 가능):

- `seed-design.json` 존재? → 없으면 셋업 분기
- `package.json`의 `@seed-design/react`·`@seed-design/css` 버전
- 번들러: `vite.config` / `rsbuild.config` / `webpack.config`
- 패키지 매니저: `bun.lock(b)` → bun, `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, 그 외 → npm

이후 모든 설치 명령어는 감지된 매니저로 안내.

## 정보 조회 도구

SEED 문서는 모두 llms.txt 형태로 제공된다. 최신 정보가 필요하면 WebFetch로 인덱스를 읽어온다.

| 영역 | 인덱스 URL |
|---|---|
| React 컴포넌트 | https://seed-design.io/react/llms.txt |
| Design 파운데이션 | https://seed-design.io/docs/llms.txt |

개별 문서:
```
https://seed-design.io/llms/react/components/{component-name}.txt
https://seed-design.io/llms/docs/foundation/color/color-system.txt
```

CLI로 한 번에 조회:
```bash
npx @seed-design/cli@latest docs {component-name}
```

## 성공 출력 예시

**예 1 — 셋업 질문 ("SEED 처음 써보는데 어떻게 시작해?")**

```
프로젝트 분석 결과:
- seed-design.json: 없음 → 신규 셋업 필요
- 번들러: vite, 패키지 매니저: pnpm

다음 순서로 진행하면 됩니다.
1) pnpm dlx @seed-design/cli@latest init
2) Action Button 추가: pnpm dlx @seed-design/cli@latest add action-button
3) 문서: https://seed-design.io/react/components/action-button

자세한 옵션은 references/getting-started.md.
```

**예 2 — 컴포넌트 질문 ("Switch 컴포넌트 사용법")**

```
docs: https://seed-design.io/react/components/switch
llms.txt: https://seed-design.io/llms/react/components/switch.txt

추가:
pnpm dlx @seed-design/cli@latest add switch
```

## 다음 단계 제안

작업이 끝나면 자연스럽게 이어준다.

- 셋업 완료 → "이제 컴포넌트를 추가해볼까요?"
- 컴포넌트 추가 → "테마 설정도 필요하세요?"
- 파운데이션 안내 → "실제 코드 예시가 필요하면 알려주세요"

## Reference Files

| 파일 | 읽는 시점 |
|---|---|
| `references/getting-started.md` | seed-design.json이 없거나 셋업 질문 |
| `references/components.md` | 컴포넌트 탐색/추가 |
| `references/foundation.md` | 색·타이포·스페이싱·테마 |
| `references/usage.md` | CLI 명령어 |
| `references/migration.md` | 스니펫 버전 호환 |
| `references/upgrade.md` | 패키지 업그레이드 |
