@echo off
setlocal EnableExtensions

REM ============================================================
REM  Claude Skills installer (Windows, single file)
REM
REM  This .bat embeds a PowerShell payload after the
REM  "#PS_BELOW#" marker. The cmd portion stays pure ASCII
REM  to avoid the well-known cmd.exe + chcp 65001 + UTF-8
REM  multibyte parsing bug. PowerShell handles all Korean text.
REM
REM  Action:
REM    1. Move existing %USERPROFILE%\.claude\skills to a backup
REM    2. Clone latest hansy-daangn/claude-skills from GitHub
REM    3. Print result and wait for Enter
REM ============================================================

set "TMPF=%TEMP%\claude-skills-installer-%RANDOM%.ps1"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$src=Get-Content -LiteralPath '%~f0' -Encoding UTF8; $m=$src | Select-String -Pattern '^#PS_BELOW#$' | Select-Object -First 1; if(-not $m){exit 2}; $src | Select-Object -Skip $m.LineNumber | Set-Content -LiteralPath '%TMPF%' -Encoding UTF8"

if not exist "%TMPF%" (
  echo [X] Failed to extract PowerShell payload from this .bat file.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%TMPF%"
set "RC=%errorlevel%"
del "%TMPF%" >nul 2>&1
exit /b %RC%

#PS_BELOW#
$ErrorActionPreference = "Stop"
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

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[X] git 이 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "    https://git-scm.com 에서 설치 후 다시 실행하세요."
    Pause-AndExit 1
}

if (-not (Test-Path $ClaudeDir)) {
    New-Item -ItemType Directory -Path $ClaudeDir -Force | Out-Null
}

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
