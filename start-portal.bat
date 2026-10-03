@echo off
title Vidudhi Hostel Resident Portal Launcher
echo ===============================================================
echo  Starting Vidudhi Hostel Resident Portal (Frontend + Backend)
echo  Database: MongoDB Atlas (Cluster: keerthana / vidudhi)
echo ===============================================================
echo.

:: 1. Start Node.js Unified Server on Port 5000
echo [1/3] Launching Node.js Backend Server...
cd /d "%~dp0hostel-backend"
start "Vidudhi Backend Server (Port 5000)" cmd /k "node server.js"
timeout /t 4 >nul

:: 2. Launch Cloudflare Tunnel
echo [2/3] Launching Cloudflare Global High-Speed Tunnel...
cd /d "%~dp0"
start "Cloudflare Secure Tunnel" cmd /k "cloudflared.exe tunnel --url http://localhost:5000"

:: 3. Launch Persistent Localhost.run Tunnel
echo [3/3] Launching Carrier-Neutral TLS Tunnel...
start "Carrier-Neutral TLS Tunnel" cmd /k "node hostel-backend\scripts\persistentTunnel.js"

echo.
echo ===============================================================
echo  Portal successfully started!
echo  Keep the opened command windows running while using the portal.
echo ===============================================================
pause
