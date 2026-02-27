@echo off
cd /d "%~dp0"
echo Conectando a MongoDB y creando colecciones...
npm run db:init
echo.
pause
