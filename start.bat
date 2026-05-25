@echo off
echo ========================================================
echo         Emoticon Lab - Development Server Starter
echo ========================================================
echo.

echo 1. Starting Backend (Spring Boot) in a new window...
start "Emoticon-Lab Backend" cmd /k "cd backend && gradlew bootRun"

echo 2. Starting Frontend (Vite + React) in a new window...
start "Emoticon-Lab Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo All servers have been launched in separate windows!
echo - Frontend will be available at: http://localhost:5173
echo - Backend is running on: http://localhost:8080
echo.
echo To stop the servers, just close the newly opened black windows.
echo ========================================================
pause
