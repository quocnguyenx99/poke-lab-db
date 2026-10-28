#!/usr/bin/env bash
cd "$(dirname "$0")"
command -v node >/dev/null 2>&1 || { echo "Chưa có Node.js. Cài Node 22.13+ từ https://nodejs.org/"; exit 1; }
[ -f .env ] || cp .env.example .env
[ -d node_modules ] || npm install
if command -v open >/dev/null 2>&1; then open "http://localhost:4173"; elif command -v xdg-open >/dev/null 2>&1; then xdg-open "http://localhost:4173"; fi
npm run dev
