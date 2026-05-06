@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

REM ============================================================
REM  Claude Skills 설치/재설치 스크립트 (Windows 더블클릭 실행용)
REM
REM  동작:
REM    1. 기존 %USERPROFILE%\.claude\skills 폴더를 타임스탬프 백업으로 이동
REM    2. GitHub 의 hansy-daangn/claude-skills 최신 버전을 클론
REM    3. 결과 출력 후 아무 키 입력 시 종료
REM
REM  사용:
REM    탐색기에서 더블클릭 → 명령 프롬프트 창이 열리며 자동 실행
REM ============================================================

set "REPO_URL=https://github.com/hansy-daangn/claude-skills.git"
set "SKILLS_DIR=%USERPROFILE%\.claude\skills"

REM 타임스탬프 (YYYYMMDD_HHMMSS) — PowerShell 사용 (wmic 미사용 환경 대응)
for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmmss"`) do set "TIMESTAMP=%%i"
set "BACKUP_DIR=%USERPROFILE%\.claude\skills.backup.!TIMESTAMP!"

REM 스크립트가 있는 위치로 이동
cd /d "%~dp0"

echo ============================================================
echo   Claude Skills 동기화
echo   GitHub -^> %%USERPROFILE%%\.claude\skills
echo ============================================================
echo.

REM git 설치 확인
where git >nul 2>nul
if errorlevel 1 (
  echo [X] git 이 설치되어 있지 않습니다.
  echo     https://git-scm.com 에서 설치 후 다시 실행하세요.
  echo.
  pause
  exit /b 1
)

REM .claude 디렉토리 생성
if not exist "%USERPROFILE%\.claude" mkdir "%USERPROFILE%\.claude"

REM 기존 폴더 백업
if exist "%SKILLS_DIR%" (
  echo [*] 기존 스킬 폴더를 백업합니다
  echo     -^> !BACKUP_DIR!
  move "%SKILLS_DIR%" "!BACKUP_DIR!" >nul
  if errorlevel 1 (
    echo [X] 백업 실패. 권한 또는 잠긴 파일을 확인하세요.
    pause
    exit /b 1
  )
  echo.
)

REM GitHub 에서 클론
echo [v] GitHub 에서 최신 스킬을 내려받습니다...
git clone --depth 1 "%REPO_URL%" "%SKILLS_DIR%"
if errorlevel 1 (
  echo.
  echo [X] 클론 실패. 위 에러를 확인하세요.
  pause
  exit /b 1
)
echo.

echo [OK] 설치 완료!
echo.
echo 설치된 스킬 (%SKILLS_DIR%):
for /d %%D in ("%SKILLS_DIR%\*") do echo     * %%~nxD
echo.

if exist "!BACKUP_DIR!" (
  echo 이전 스킬 백업 위치:
  echo   !BACKUP_DIR!
  echo   ^(문제 없으면 직접 삭제하셔도 됩니다^)
  echo.
)

echo ============================================================
pause
endlocal
