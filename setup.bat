@echo off
echo ===================================
echo Clinic Management System Setup
echo ===================================

echo.
echo [1/4] Setting up Backend (Laravel)...
cd backend

echo Installing Laravel dependencies...
call composer create-project laravel/laravel . --quiet
call composer require laravel/sanctum --quiet
call composer require laravel/breeze --dev --quiet
call php artisan breeze:install api --no-interaction
call composer require spatie/laravel-permission --quiet
call php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider" --no-interaction

echo Copying environment file...
copy .env.example .env
call php artisan key:generate --no-interaction

echo.
echo [2/4] Please create MySQL database 'clinic' and update .env file
echo Press any key when database is ready...
pause

echo.
echo [3/4] Running migrations and seeders...
call php artisan migrate --no-interaction
call php artisan db:seed --no-interaction

echo.
echo [4/4] Setting up Frontend (React)...
cd ..\frontend
call npm create vite@latest . -- --template react
call npm install
call npm install axios react-router-dom react-hook-form zod

echo.
echo ===================================
echo Setup Complete!
echo ===================================
echo.
echo To start the application:
echo 1. Backend: cd backend && php artisan serve --port=8000
echo 2. Frontend: cd frontend && npm run dev
echo.
echo Default login:
echo Email: admin@clinic.local
echo Password: admin123
echo.
echo URLs:
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8000
echo.
pause
