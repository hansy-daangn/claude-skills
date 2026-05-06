# claude-skills

hansy@daangn.com 의 Claude Code 스킬 모음. 어떤 기기/세션에서도 이 repo를 `~/.claude/skills`에 클론하면 그대로 이어받을 수 있다.

---

## 설치

### 방법 1: 클릭 한 번 (권장, macOS)

1. 이 repo 를 zip 으로 다운로드하거나 클론
2. `install.command` 더블클릭
3. 터미널이 열리며 자동 실행:
   - 기존 `~/.claude/skills` 는 타임스탬프 백업으로 보존
   - GitHub 최신 버전이 `~/.claude/skills` 에 새로 설치됨

> ⚠️ 처음 더블클릭 시 macOS 보안 차단이 뜨면:
> 시스템 설정 → 개인정보 보호 및 보안 → "확인 없이 열기" 클릭
> 또는 우클릭 → 열기 → 열기

### 방법 2: 명령어

```bash
# 최초 1회 (새 기기)
git clone https://github.com/hansy-daangn/claude-skills.git ~/.claude/skills

# 업데이트
cd ~/.claude/skills && git pull
```

## 저장

```bash
cd ~/.claude/skills && git add -A && git commit -m "설명" && git push
```

---

## 스킬 목록

### `ad-banner` — 당근 광고 배너 자동 생성

**트리거:** `#소재제작` / `#배너제작` / `#광고소재`

**사용 예시:**
```
#소재제작 메모리 대란으로 노트북 가격 급상승. 비싼 새거보다 당근에서 합리적인 가격에 올라온거 둘러보라는 소재 만들어
```

**워크플로우:**
1. 주제 파싱 → 당근 voice 카피 작성
2. Figma 신규 페이지(`주제_MMDD`)에 10종 배너 자동 생성
3. 스크린샷 검증 → SEED 체크리스트 출력

**Figma 파일:** `CVeyCAgnLzNqGPbKlHh8wN` (HANSY) → `Claude Area` 페이지 (`8297:11349`) 안에 컨테이너 frame으로 적재
- 같은 날 만든 디자인은 옆에, 다른 날 디자인은 아래 새 행으로 자동 배치 (`~/.claude/CLAUDE.md` 전역 규칙)

**Logo_korean 컴포넌트 키:**
- Primary (밝은 배경): `7bd06aa4147de6d53637e133cf38a78659e36f63`
- White (오렌지 배경): `ccfd3319d4232252f37a5de518cd0631f2174e22`

**SEED 토큰 (검증 완료):**
| 토큰 | hex |
|---|---|
| `$color.bg.brand-solid` | `#ff6600` |
| `$color.bg.brand-weak` | `#fff2ec` |
| `$color.fg.neutral` | `#212124` |
| `$color.fg.neutral-muted` | `#555b65` |
| `$color.fg.neutral-inverted` | `#ffffff` |
| `$radius.full` | `9999px` |
| line-height | `135%` (SEED $line-height 토큰 비율) |

**레이아웃 함수:**
- `layA` — Wide Thin (w/h ≥ 2.5), 오렌지 배경
- `layB` — Square (0.9~1.3), 연한 배경
- `layC` — Landscape (1.3~2.5), 연한 배경 + 로고 충돌 방지 로직
- `layD` — Portrait (< 0.9), 연한 배경

**기본 사이즈 세트 (몰로코):**
320×100 / 300×250 / 720×720 / 480×320 / 1200×600 / 320×480 / 720×960 / 768×1024 / 720×1280 / 1200×1500

**주요 제약:**
- `text.height` 사용 금지 → `calcH()` 수식 사용
- 🥕 이모지 로고 금지 → `importComponentByKeyAsync`
- 색상 유사값 금지 (`#FF6F0F` 등)
- 페이지는 캠페인마다 신규 생성, 기존 페이지 보존

---

### `seed-design` — SEED 디자인 시스템 참조

당근 SEED 디자인 시스템 컴포넌트, 토큰, 가이드라인 조회.

**seed-docs MCP:** `npx -y @seed-design/docs-mcp`
(전역 설치: `~/.claude/claude.json`의 mcpServers에 등록됨)

---

## 작업 이력

| 날짜 | 내용 |
|---|---|
| 2026-04 | seed-docs MCP 연동, ad-banner 스킬 초기 구축 |
| 2026-04 | Figma Plugin API text.height 버그 발견 및 calcH() 수식으로 해결 |
| 2026-04 | Logo_korean 실제 컴포넌트 키 확보, 이모지 대체 완료 |
| 2026-04 | 4종 레이아웃(A/B/C/D) 검증, 10개 배너 안정화 |
| 2026-04 | SEED line-height 135% 준수, 페이지 네이밍 규칙 확립 |
| 2026-04 | GitHub 동기화 설정 완료 |
