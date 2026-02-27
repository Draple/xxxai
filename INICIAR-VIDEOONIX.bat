@echo off
title VideoOnix
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo Node.js no esta instalado. Instalalo desde https://nodejs.org
    pause
    exit /b 1
)

if not exist node_modules (
    echo Instalando dependencias...
    call npm install
)
if not exist server\db\videoonix.db (
    echo Inicializando base de datos...
    node server/src/db/init.js
)

echo Iniciando API...
start "VideoOnix API" cmd /k "node server/src/index.js"
timeout /t 2 /nobreak >nul
echo Iniciando Vite + React...
start "VideoOnix App" cmd /k "npm run dev"

timeout /t 5 /nobreak >nul
start http://localhost:5173
echo.
echo Abriendo http://localhost:5173 en el navegador.
echo Cierra las ventanas "VideoOnix API" y "VideoOnix App" para parar los servidores.
pause
