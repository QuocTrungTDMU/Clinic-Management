@echo off
echo ===================================
echo Starting Clinic Management System
echo ===================================

echo Starting Backend (Laravel)...
start "Laravel Backend" cmd /k "cd backend && php artisan serve --port=8000"

timeout /t 3 /nobreak >nul

echo Starting Frontend (React)...
start "React Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Login with:
echo Email: admin@clinic.local
echo Password: admin123
echo.
echo Press any key to exit...
pause >nul
