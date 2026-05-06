# claude-skills

hansy@daangn.com 의 Claude Code 스킬 모음. 어떤 기기/세션에서도 이 repo를 `~/.claude/skills`에 클론하면 그대로 이어받을 수 있다.

---

## 설치

### 방법 1: 한 줄 설치 (권장, 권한 문제 없음)

**macOS / Linux** — 터미널에 붙여넣기:
```bash
curl -fsSL https://raw.githubusercontent.com/hansy-daangn/claude-skills/main/install.command | bash
```

**Windows** — PowerShell 에 붙여넣기:
```powershell
$f="$env:TEMP\claude-skills-install.bat"; iwr -useb https://raw.githubusercontent.com/hansy-daangn/claude-skills/main/install.bat -OutFile $f; & $f
```

### 방법 2: 클릭 실행

1. 이 repo 를 zip 으로 다운로드하거나 `git clone`
2. OS 에 맞는 단일 파일을 더블클릭
   - **macOS**: `install.command`
   - **Windows**: `install.bat` (cmd + PowerShell 폴리글랏 단일 파일)
3. 터미널/PowerShell 창이 열리며 자동 실행:
   - 기존 스킬 폴더는 타임스탬프 백업으로 보존
   - GitHub 최신 버전이 새로 설치됨
     - macOS / Linux: `~/.claude/skills`
     - Windows: `%USERPROFILE%\.claude\skills`

> ⚠️ **macOS — ZIP 다운로드 후 "권한 거부" 에러**:
> ZIP 은 실행 비트(`+x`)를 보존하지 않습니다. 터미널에서 한 번만:
> ```bash
> chmod +x install.command
> ```
> 또는 git clone 으로 받으면 권한이 보존됩니다.

> ⚠️ macOS Gatekeeper 차단 시:
> 우클릭 → 열기 → 열기 (한 번만)

> ⚠️ Windows SmartScreen 차단 시:
> "추가 정보" → "실행" 클릭

> ℹ️ 사전 조건: `git` 설치 필수 ([git-scm.com](https://git-scm.com))

### 방법 3: 명령어로 직접

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
