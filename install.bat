@echo off
REM Tiny ASCII launcher. All logic lives in install.ps1 to avoid
REM the well-known cmd.exe + chcp 65001 + multibyte REM parser bug.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1"
