@echo off
cd /d "%~dp0"
echo.
echo Probando conexion a MongoDB...
echo.
npm run db:test
echo.
pause
