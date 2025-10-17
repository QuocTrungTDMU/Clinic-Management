# Test Accounts & Credentials

## Doctor Accounts (để test module Bác sĩ)

### Account 1: Administrator/Bác Sĩ

- **Email:** admin@clinic.local
- **Password:** password
- **ID:** 1
- **Patients in queue:** 6 patients

### Account 2: Quốc Trung

- **Email:** doctor@clinic.local
- **Password:** password
- **ID:** 3
- **Patients in queue:** 0 (no appointments assigned)

## Receptionist Account (để test module Lễ tân)

### Lễ Tân Test

- **Email:** receptionist@clinic.com
- **Password:** password
- **ID:** 4

## Test Patients (đã có trong database)

1. **Nguyễn Văn Nam** - ID: varies, Phone: 0901234567
2. **Trần Thị Mai** - ID: varies, Phone: 0912345678
3. **Lê Minh Tuấn** - ID: varies, Phone: 0923456789

## Current Appointments Status

- Total appointments today: 6
- Status: all "in_progress"
- Assigned to: Doctor ID 1 (admin@clinic.local)
- Time slots: 09:00, 10:00, 11:00 (duplicated)

## ⚠️ IMPORTANT

**Để test module Bác sĩ:**

1. Đăng nhập với: **admin@clinic.local / password**
2. Vào trang Doctor → Examination
3. Bạn sẽ thấy 6 bệnh nhân trong hàng đợi

**Để test module Lễ tân:**

1. Đăng nhập với: **receptionist@clinic.com / password**
2. Test các chức năng: đăng ký bệnh nhân, đặt lịch, check-in
