#!/bin/bash
#
# Claude Skills 설치/재설치 스크립트 (macOS 더블클릭 실행용)
#
# 동작:
#   1. 기존 ~/.claude/skills 폴더를 타임스탬프 백업으로 옮김
#   2. GitHub의 hansy-daangn/claude-skills 최신 버전을 ~/.claude/skills 에 클론
#   3. 결과 출력 후 엔터 입력 시 종료
#
# 사용:
#   Finder 에서 더블클릭 → 터미널이 열리며 자동 실행
#

set -euo pipefail

REPO_URL="https://github.com/hansy-daangn/claude-skills.git"
SKILLS_DIR="$HOME/.claude/skills"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="$HOME/.claude/skills.backup.${TIMESTAMP}"

# 스크립트가 있는 위치로 이동 (.command 더블클릭 시 cwd 가 / 인 경우 대비)
cd "$(dirname "$0")"

echo "============================================================"
echo "  Claude Skills 동기화"
echo "  GitHub → ~/.claude/skills"
echo "============================================================"
echo ""

# git 설치 확인
if ! command -v git >/dev/null 2>&1; then
  echo "❌ git 이 설치되어 있지 않습니다."
  echo "   https://git-scm.com 에서 설치 후 다시 실행하세요."
  echo ""
  read -r -p "엔터를 눌러 창을 닫습니다..." _
  exit 1
fi

# ~/.claude 디렉토리 생성
mkdir -p "$HOME/.claude"

# 기존 폴더 백업
if [ -e "$SKILLS_DIR" ]; then
  echo "📦 기존 스킬 폴더를 백업합니다"
  echo "   → $BACKUP_DIR"
  mv "$SKILLS_DIR" "$BACKUP_DIR"
  echo ""
fi

# GitHub 에서 최신 클론
echo "⬇️  GitHub 에서 최신 스킬을 내려받습니다..."
git clone --depth 1 "$REPO_URL" "$SKILLS_DIR"
echo ""

# 결과 출력
echo "✅ 설치 완료!"
echo ""
echo "📂 설치된 스킬 (~/.claude/skills):"
for d in "$SKILLS_DIR"/*/; do
  [ -d "$d" ] && echo "   • $(basename "$d")"
done
echo ""

if [ -d "$BACKUP_DIR" ]; then
  echo "💾 이전 스킬 백업 위치:"
  echo "   $BACKUP_DIR"
  echo "   (문제 없으면 직접 삭제하셔도 됩니다)"
  echo ""
fi

echo "============================================================"
read -r -p "엔터를 눌러 창을 닫습니다..." _
