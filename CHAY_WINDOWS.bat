@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo.
echo ====================================================
echo  SNORLAX x MUNCHLAX - PSA MARKET ATLAS (NEXT.JS APP)
echo ====================================================
where node >nul 2>nul
if errorlevel 1 (
  echo CHUA CO NODE.JS. Cai Node.js 22.13+ tu https://nodejs.org/
  pause
  exit /b 1
)
if not exist .env (
  copy /Y .env.example .env >nul
  echo Da tao .env.
)
if not exist node_modules (
  echo Dang cai dat thu vien Next.js...
  call npm install
)
echo Dang mo ung dung Next.js tai http://localhost:4173 ...
start "" "http://localhost:4173"
call npm run dev
pause
