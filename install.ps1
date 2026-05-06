# ============================================================
#  Claude Skills 설치/재설치 스크립트 (Windows PowerShell)
#
#  동작:
#    1. 기존 %USERPROFILE%\.claude\skills 폴더를 타임스탬프 백업으로 이동
#    2. GitHub 의 hansy-daangn/claude-skills 최신 버전을 클론
#    3. 결과 출력 후 엔터 입력 시 종료
#
#  실행 방법:
#    A) 탐색기에서 install.bat 더블클릭 (자동으로 이 스크립트 호출)
#    B) PowerShell 한 줄 설치:
#       iwr -useb https://raw.githubusercontent.com/hansy-daangn/claude-skills/main/install.ps1 | iex
# ============================================================

$ErrorActionPreference = "Stop"

# 콘솔 한글 출력 보장
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

$RepoUrl    = "https://github.com/hansy-daangn/claude-skills.git"
$SkillsDir  = Join-Path $env:USERPROFILE ".claude\skills"
$ClaudeDir  = Join-Path $env:USERPROFILE ".claude"
$Timestamp  = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir  = Join-Path $env:USERPROFILE ".claude\skills.backup.$Timestamp"

function Pause-AndExit([int]$code) {
    Write-Host ""
    Read-Host "엔터를 눌러 창을 닫습니다"
    exit $code
}

Write-Host "============================================================"
Write-Host "  Claude Skills 동기화"
Write-Host "  GitHub -> $SkillsDir"
Write-Host "============================================================"
Write-Host ""

# git 설치 확인
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[X] git 이 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "    https://git-scm.com 에서 설치 후 다시 실행하세요."
    Pause-AndExit 1
}

# .claude 디렉토리 생성
if (-not (Test-Path $ClaudeDir)) {
    New-Item -ItemType Directory -Path $ClaudeDir -Force | Out-Null
}

# 기존 폴더 백업
if (Test-Path $SkillsDir) {
    Write-Host "[*] 기존 스킬 폴더를 백업합니다"
    Write-Host "    -> $BackupDir"
    try {
        Move-Item -Path $SkillsDir -Destination $BackupDir
    } catch {
        Write-Host "[X] 백업 실패: $_" -ForegroundColor Red
        Pause-AndExit 1
    }
    Write-Host ""
}

# GitHub 에서 클론
Write-Host "[v] GitHub 에서 최신 스킬을 내려받습니다..."
& git clone --depth 1 $RepoUrl $SkillsDir
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[X] 클론 실패. 위 에러를 확인하세요." -ForegroundColor Red
    Pause-AndExit 1
}
Write-Host ""

Write-Host "[OK] 설치 완료!" -ForegroundColor Green
Write-Host ""
Write-Host "설치된 스킬 ($SkillsDir):"
Get-ChildItem -Path $SkillsDir -Directory | ForEach-Object {
    Write-Host "    * $($_.Name)"
}
Write-Host ""

if (Test-Path $BackupDir) {
    Write-Host "이전 스킬 백업 위치:"
    Write-Host "  $BackupDir"
    Write-Host "  (문제 없으면 직접 삭제하셔도 됩니다)"
    Write-Host ""
}

Write-Host "============================================================"
Pause-AndExit 0
