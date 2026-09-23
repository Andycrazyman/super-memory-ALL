@echo off
cd /d "%~dp0"
if not exist .env (
  echo No .env file found.
  echo Copy .env.example to .env and add your OPENAI_API_KEY.
  pause
  exit /b 1
)
node server.js
pause
