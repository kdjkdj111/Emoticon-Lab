@echo off
echo =========================================
echo       Emoticon Lab - Start Server
echo =========================================
echo.

:: 1. Check frontend node_modules
if not exist "frontend\node_modules" (
    echo [INSTALL] frontend node_modules...
    cd frontend
    call npm install
    cd ..
    echo [DONE]
    echo.
)

:: 2. Check .env files
if not exist "backend\.env" (
    echo [WARNING] backend\.env missing!
)
if not exist "frontend\.env" (
    echo [WARNING] frontend\.env missing!
)
echo.

:: 3. Start servers
echo [1/2] Starting Backend...
start "Emoticon-Lab Backend" cmd /k "cd backend && gradlew bootRun"

echo [2/2] Starting Frontend...
start "Emoticon-Lab Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo =========================================
echo Servers are launching in new windows.
echo - Frontend: http://localhost:5173
echo - Backend: http://localhost:8080
echo =========================================
pause
