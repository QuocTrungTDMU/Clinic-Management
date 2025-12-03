# Test Accounts & Credentials

## Admin Account (để test module Admin)

### Administrator

- **Email:** admin@clinic.local
- **Password:** password
- **Role:** admin, doctor
- **ID:** 1

## Doctor Accounts (để test module Bác sĩ)

### Account 1: Dr. Smith (Active)

- **Email:** doctor@clinic.local
- **Password:** doctor123
- **Status:** Active
- **Specialization:** General Medicine
- **License:** MD-2024-001
- **Phone:** 0901234567

### Account 2: Dr. Williams (Active)

- **Email:** dr.williams@clinic.local
- **Password:** doctor123
- **Status:** Active
- **Specialization:** Cardiology
- **License:** MD-2024-003
- **Phone:** 0901234569

### Account 3: Dr. Johnson (Pending Approval)

- **Email:** pending.doctor@clinic.local
- **Password:** doctor123
- **Status:** Pending
- **Specialization:** Pediatrics
- **License:** MD-2024-002
- **Phone:** 0901234568

### Account 4: Dr. Jones (Pending Approval)

- **Email:** dr.jones@clinic.local
- **Password:** doctor123
- **Status:** Pending
- **Specialization:** Orthopedics
- **License:** MD-2024-005
- **Phone:** 0901234571

### Account 5: Dr. Brown (Inactive)

- **Email:** inactive.doctor@clinic.local
- **Password:** doctor123
- **Status:** Inactive
- **Specialization:** Dermatology
- **License:** MD-2024-004
- **Phone:** 0901234570

## Receptionist Account (để test module Lễ tân)

### Lễ Tân Test

- **Email:** receptionist@clinic.com
- **Password:** password

## Pharmacist Account (để test module Dược sĩ)

### Dược Sĩ Test

- **Email:** pharmacist@clinic.local
- **Password:** password

## Lab Technician Account (để test module Cận Lâm Sàng)

### Kỹ Thuật Viên Cận Lâm Sàng

- **Email:** lab@clinic.com
- **Password:**
- **Role:** lab_technician

## Test Patients (đã có trong database)

1. **Nguyễn Văn Nam** - Phone: 0901234567
2. **Trần Thị Mai** - Phone: 0912345678
3. **Lê Minh Tuấn** - Phone: 0923456789

## ⚠️ IMPORTANT - Test Scenarios

**1. Test module Admin (Doctor Management):**

- Đăng nhập: **admin@clinic.local / password**
- Vào trang: Admin → Doctor Management
- Chức năng:
  - View doctors by status (All/Pending/Active/Inactive)
  - Search doctors by name
  - Approve pending doctors
  - Reject pending doctors
  - Deactivate/Activate doctors
  - View statistics (Total Doctors, Pending Approvals, Total Patients, Specializations)

**2. Test module Bác sĩ:**

- Đăng nhập: **doctor@clinic.local / doctor123**
- Vào trang: Doctor → Examination
- Test khám bệnh và kê đơn thuốc

**3. Test module Lễ tân:**

- Đăng nhập: **receptionist@clinic.com / password**
- Test: đăng ký bệnh nhân, đặt lịch, check-in

**4. Test module Dược sĩ:**

- Đăng nhập: **pharmacist@clinic.local / password**
- Test: xem đơn thuốc chờ, phát thuốc, in hóa đơn

**5. Test module Cận Lâm Sàng:**

- Đăng nhập: **lab@clinic.com / password**
- Test:
  - Xem danh sách yêu cầu xét nghiệm chờ xử lý
  - Bắt đầu thực hiện xét nghiệm (pending → in_progress)
  - Nhập kết quả xét nghiệm (in_progress → completed)
  - Xem thống kê: Chờ xử lý, Đang thực hiện, Hoàn thành
  - Lọc theo trạng thái
  - Xem thông tin bệnh nhân, chẩn đoán, ghi chú lâm sàng

**6. Test full workflow:**

1. Lễ tân: Tạo appointment
2. Bác sĩ: Khám bệnh, chọn xét nghiệm cần làm, **gửi yêu cầu xét nghiệm** (không cần lưu hồ sơ trước)
3. Kỹ thuật viên: Nhận yêu cầu, thực hiện xét nghiệm, nhập kết quả
4. Bác sĩ: Xem kết quả xét nghiệm, cập nhật chẩn đoán chính xác, kê đơn thuốc, **hoàn thành khám**
5. Dược sĩ: Phát thuốc và in hóa đơn
