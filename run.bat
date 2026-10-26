@echo off
title Voyan AI Travel - Launch Services
echo ========================================================
echo   Starting Voyan AI Travel Planning
echo   - Backend: Spring Boot (Port 8081)
echo   - Frontend: Vite Dev Server (Port 3000)
echo ========================================================

start "Voyan Backend (Port 8081)" cmd /k "mvnw.cmd -f java-backend/pom.xml spring-boot:run"
start "Voyan Frontend (Port 3000)" cmd /k "npm run dev"

echo.
echo Both servers are launching in separate windows!
echo - Web App: http://localhost:3000
echo - Backend API: http://localhost:8081
echo ========================================================
