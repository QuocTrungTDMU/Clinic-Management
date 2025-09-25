# Hướng dẫn Setup Chi tiết Clinic Management System

## Yêu cầu hệ thống
- **PHP** >= 8.1 (với Composer)
- **Node.js** >= 16 (với npm)
- **MySQL** >= 5.7
- **Web Server** (Apache/Nginx) hoặc PHP built-in server

## Bước 1: Clone/Download dự án
```bash
# Download hoặc clone dự án vào thư mục clinic
```

## Bước 2: Setup Backend (Laravel API)

### 2.1. Cài đặt Laravel
```bash
cd backend
composer create-project laravel/laravel .
```

### 2.2. Cài đặt các package cần thiết
```bash
composer require laravel/sanctum
composer require laravel/breeze --dev
php artisan breeze:install api
composer require spatie/laravel-permission
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
```

### 2.3. Cấu hình environment
```bash
cp .env.example .env
php artisan key:generate
```

### 2.4. Cập nhật file .env
```env
APP_NAME=Clinic
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=clinic
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=cookie
SESSION_DOMAIN=localhost
SESSION_SECURE_COOKIE=false

SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

### 2.5. Tạo database
- Mở phpMyAdmin hoặc MySQL client
- Tạo database tên `clinic`

### 2.6. Copy các file đã tạo
Sao chép tất cả file trong thư mục backend đã tạo:
- `config/cors.php`
- `database/migrations/2024_01_01_000001_create_patients_table.php`
- `app/Models/Patient.php`
- `app/Models/User.php`
- `app/Http/Controllers/PatientController.php`
- `database/seeders/RolesAndAdminSeeder.php`
- `database/seeders/DatabaseSeeder.php`
- `routes/api.php`

### 2.7. Chạy migration và seeder
```bash
php artisan migrate
php artisan db:seed
```

### 2.8. Khởi chạy server
```bash
php artisan serve --port=8000
```

## Bước 3: Setup Frontend (React)

### 3.1. Cài đặt React với Vite
```bash
cd ../frontend
npm create vite@latest . -- --template react
```

### 3.2. Cài đặt dependencies
```bash
npm install
npm install axios react-router-dom react-hook-form zod
```

### 3.3. Copy các file đã tạo
Sao chép tất cả file trong thư mục frontend đã tạo:
- `package.json`
- `vite.config.js`
- `index.html`
- `src/main.jsx`
- `src/index.css`
- `src/api.js`
- `src/auth.js`
- `src/components/Login.jsx`
- `src/components/Patients.jsx`
- `src/components/Protected.jsx`

### 3.4. Khởi chạy development server
```bash
npm run dev
```

## Bước 4: Test hệ thống

### 4.1. Kiểm tra Backend
- Truy cập: http://localhost:8000
- Test API: http://localhost:8000/api/me (sẽ trả 401 Unauthenticated)

### 4.2. Kiểm tra Frontend
- Truy cập: http://localhost:5173
- Sẽ redirect đến trang login

### 4.3. Test đăng nhập
- Email: `admin@clinic.local`
- Password: `admin123`

### 4.4. Test chức năng
- Sau khi đăng nhập thành công, test CRUD patients
- Kiểm tra logout

## Cấu trúc file đầy đủ

```
clinic/
├── backend/                          # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   └── PatientController.php
│   │   └── Models/
│   │       ├── Patient.php
│   │       └── User.php
│   ├── config/
│   │   └── cors.php
│   ├── database/
│   │   ├── migrations/
│   │   │   └── 2024_01_01_000001_create_patients_table.php
│   │   └── seeders/
│   │       ├── DatabaseSeeder.php
│   │       └── RolesAndAdminSeeder.php
│   ├── routes/
│   │   └── api.php
│   └── .env
├── frontend/                         # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Patients.jsx
│   │   │   └── Protected.jsx
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── README.md
├── SETUP.md
├── setup.bat                        # Script setup tự động
└── start.bat                        # Script khởi chạy
```

## Troubleshooting

### Lỗi CORS
- Kiểm tra `config/cors.php`
- Đảm bảo `SANCTUM_STATEFUL_DOMAINS=localhost:5173` trong .env

### Lỗi Database
- Kiểm tra MySQL service đang chạy
- Kiểm tra thông tin database trong .env
- Đảm bảo database `clinic` đã được tạo

### Lỗi Auth
- Kiểm tra `SESSION_DOMAIN=localhost` trong .env
- Clear browser cookies
- Restart cả 2 server

### Lỗi Permissions
- Đảm bảo đã chạy `php artisan db:seed`
- Kiểm tra user có role admin

## API Endpoints

### Auth
- `GET /sanctum/csrf-cookie` - Lấy CSRF token
- `POST /login` - Đăng nhập
- `POST /logout` - Đăng xuất
- `GET /api/me` - Lấy thông tin user

### Patients (cần auth + role admin|reception)
- `GET /api/patients` - Danh sách
- `POST /api/patients` - Tạo mới
- `GET /api/patients/{id}` - Chi tiết
- `PUT /api/patients/{id}` - Cập nhật
- `DELETE /api/patients/{id}` - Xóa

## Tài khoản mặc định
- **Email**: admin@clinic.local
- **Password**: admin123
- **Role**: admin (có thể truy cập tất cả chức năng)

## URLs
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **API**: http://localhost:8000/api
