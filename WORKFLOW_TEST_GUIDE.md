# 🧪 Hướng Dẫn Test Workflow Thực Tế

## Mục tiêu

Test toàn bộ luồng từ **Lễ tân → Bác sĩ** theo quy trình thực tế của phòng khám

---

## 📋 Chuẩn Bị

### Tài khoản test:

#### 👨‍⚕️ Bác sĩ (để test module Doctor)

- **Email:** doctor@clinic.local
- **Password:** password
- **User ID:** 3
- **Tên:** Quốc Trung

#### 👔 Lễ tân (để test module Receptionist)

- **Email:** receptionist@clinic.com
- **Password:** password
- **User ID:** 4
- **Tên:** Lễ Tân Test

---

## 🔄 WORKFLOW TEST - Từng Bước Chi Tiết

### ✅ BƯỚC 1: Đăng nhập Lễ Tân

1. Mở: http://localhost:5173
2. Đăng nhập với: `receptionist@clinic.com` / `password`
3. Kiểm tra đã vào Dashboard của Receptionist

---

### ✅ BƯỚC 2: Đăng ký Bệnh nhân mới

**Trang:** Receptionist Dashboard → "Patients" hoặc "Register Patient"

**Thông tin bệnh nhân test:**

```
Họ tên: Trần Văn Test
Ngày sinh: 01/01/1990
Giới tính: Nam
Số điện thoại: 0909123456
Địa chỉ: 123 Đường Test, Quận 1, TP.HCM
Ghi chú: Không dị ứng
```

**Kiểm tra:**

- ✅ API: `POST /api/patients`
- ✅ Bệnh nhân được tạo thành công
- ✅ Toast hiển thị "Đăng ký bệnh nhân thành công"
- ✅ Bệnh nhân xuất hiện trong danh sách

---

### ✅ BƯỚC 3: Đặt lịch khám

**Trang:** Receptionist Dashboard → "Appointments" → "New Appointment"

**Thông tin lịch hẹn:**

```
Bệnh nhân: Trần Văn Test (vừa tạo ở bước 2)
Bác sĩ: Quốc Trung (ID: 3)
Ngày giờ: Hôm nay - 14:00
Loại khám: Consultation (Tư vấn)
Lý do: Đau đầu, chóng mặt
```

**Kiểm tra:**

- ✅ API: `POST /api/appointments`
- ✅ Lịch hẹn được tạo với status: `scheduled`
- ✅ Toast hiển thị "Đặt lịch thành công"
- ✅ Appointment xuất hiện trong danh sách hôm nay

---

### ✅ BƯỚC 4: Check-in Bệnh nhân

**Trang:** Receptionist Dashboard → "Queue" hoặc "Today's Appointments"

**Hành động:**

1. Tìm appointment của "Trần Văn Test"
2. Click nút **"Check In"**
3. Xác nhận check-in

**Kiểm tra:**

- ✅ API: `POST /api/queue/checkin/{appointmentId}`
- ✅ Status chuyển từ `scheduled` → `checked_in`
- ✅ Thời gian check-in được ghi nhận
- ✅ Toast hiển thị "Check-in thành công"

---

### ✅ BƯỚC 5: Chuyển sang "Đang khám"

**Trang:** Receptionist Dashboard → "Queue Management"

**Hành động:**

1. Tìm bệnh nhân đã check-in: "Trần Văn Test"
2. Click nút **"Start Examination"** hoặc **"Move to In Progress"**
3. Xác nhận chuyển trạng thái

**Kiểm tra:**

- ✅ API: `PUT /api/queue/status/{appointmentId}` với body `{"status": "in_progress"}`
- ✅ Status chuyển từ `checked_in` → `in_progress`
- ✅ Toast hiển thị "Đã chuyển bệnh nhân vào phòng khám"
- ✅ Bệnh nhân xuất hiện trong queue của bác sĩ

---

### ✅ BƯỚC 6: Đăng nhập Bác sĩ

1. **Logout** tài khoản Lễ tân
2. Đăng nhập với: `doctor@clinic.local` / `password`
3. Kiểm tra vào Dashboard của Doctor

---

### ✅ BƯỚC 7: Xem Danh sách Chờ Khám

**Trang:** Doctor Dashboard → "Examination" hoặc "Patient Queue"

**Kiểm tra:**

- ✅ API: `GET /api/doctor/queue` (tự động lọc theo doctor_id của user đang login)
- ✅ Hiển thị "1 patients in queue"
- ✅ Thấy thông tin bệnh nhân "Trần Văn Test":
  - Tên, số điện thoại, ngày sinh
  - Lý do khám: "Đau đầu, chóng mặt"
  - Loại khám: Consultation
  - Thời gian hẹn
- ✅ Có 2 nút: **"View History"** và **"Start Examination"**

---

### ✅ BƯỚC 8: Xem Lịch sử Khám (nếu có)

**Hành động:**

1. Click nút **"View History"**

**Kiểm tra:**

- ✅ API: `GET /api/patients/{patientId}/medical-records`
- ✅ Modal hiển thị lịch sử khám
- ✅ Nếu bệnh nhân mới: hiển thị "Chưa có lịch sử khám"
- ✅ Có thể đóng modal

---

### ✅ BƯỚC 9: Khám Bệnh & Tạo Bệnh Án

**Hành động:**

1. Click nút **"Start Examination"**
2. Form khám bệnh hiển thị

**Điền thông tin khám:**

```
=== THÔNG TIN KHÁM ===
Triệu chứng chính: Đau đầu, chóng mặt kéo dài 3 ngày
Triệu chứng chi tiết: Đau đầu vùng thái dương, chóng mặt khi đứng dậy
Khám lâm sàng: Tinh thần ổn định, da niêm hồng

=== CHỈ SỐ SINH TỒN ===
Nhiệt độ: 37.2
Huyết áp: 120/80
Nhịp tim: 75
Nhịp thở: 18
Cân nặng: 65
Chiều cao: 170

=== CHẨN ĐOÁN & ĐIỀU TRỊ ===
Chẩn đoán: Đau đầu căng thẳng, thiếu máu não nhẹ
Kế hoạch điều trị: Nghỉ ngơi, uống đủ nước, dùng thuốc giảm đau
Ngày tái khám: (chọn ngày sau 7 ngày)
Ghi chú: Nếu không đỡ sau 3 ngày, cần làm xét nghiệm thêm
```

**Thêm Đơn Thuốc:**

Click **"Add Medicine"** và thêm 2 loại thuốc:

**Thuốc 1:**

```
Tên thuốc: Paracetamol
Loại: Viên nén
Hàm lượng: 500mg
Liều dùng: 1 viên/lần
Tần suất: 3 lần/ngày
Thời gian: 5 ngày
Số lượng: 15 viên
Đơn giá: 500
Hướng dẫn: Uống khi đau đầu

Thời điểm uống:
☑ Sáng  ☑ Trưa  ☑ Tối
☐ Trước ăn  ☑ Sau ăn
```

**Thuốc 2:**

```
Tên thuốc: Vitamin B Complex
Loại: Viên nang
Hàm lượng:
Liều dùng: 1 viên/lần
Tần suất: 1 lần/ngày
Thời gian: 30 ngày
Số lượng: 30 viên
Đơn giá: 2000
Hướng dẫn: Bổ sung vitamin

Thời điểm uống:
☑ Sáng  ☐ Trưa  ☐ Tối
☐ Trước ăn  ☑ Sau ăn
```

**Lời dặn chung:**

```
Hướng dẫn chung: Uống thuốc đầy đủ theo đơn, nghỉ ngơi hợp lý
Lưu ý: Không uống khi đói, nếu bị dị ứng ngừng ngay
Chế độ ăn: Ăn nhiều rau xanh, trái cây, hạn chế đồ chiên rán
Lối sống: Ngủ đủ giấc, tránh căng thẳng, tập thể dục nhẹ
```

3. Click **"Complete Examination"**

**Kiểm tra:**

- ✅ API: `POST /api/medical-records` với đầy đủ thông tin
- ✅ Bệnh án được tạo thành công
- ✅ Đơn thuốc được lưu với 2 loại thuốc
- ✅ Tổng tiền tự động tính: 500×15 + 2000×30 = 67,500 VNĐ
- ✅ Appointment status tự động chuyển: `in_progress` → `completed`
- ✅ Toast hiển thị "Medical record created successfully!"
- ✅ Quay về trang Patient Queue
- ✅ Queue count giảm: "0 patients in queue"

---

### ✅ BƯỚC 10: Xác Minh Kết Quả

#### Kiểm tra từ phía Bác sĩ:

1. Làm lại BƯỚC 8 - Click "View History" của bệnh nhân
2. **Kỳ vọng:**
   - ✅ Thấy lịch sử khám vừa tạo
   - ✅ Hiển thị chẩn đoán, triệu chứng, kế hoạch điều trị
   - ✅ Hiển thị chỉ số sinh tồn
   - ✅ Hiển thị 2 loại thuốc với đầy đủ thông tin
   - ✅ Tổng tiền: 67,500 VNĐ

#### Kiểm tra từ phía Lễ tân:

1. Logout bác sĩ, login lại Lễ tân
2. Vào "Appointments" hoặc "Queue"
3. **Kỳ vọng:**
   - ✅ Appointment của "Trần Văn Test" có status: `completed`
   - ✅ Không còn trong queue chờ khám
   - ✅ Có trong lịch sử appointments

---

## 🎯 Các Tình Huống Test Thêm

### Scenario 2: Test với 3 bệnh nhân cùng lúc

Lặp lại BƯỚC 2-5 với 3 bệnh nhân khác nhau:

- Bệnh nhân A: Check-in → In Progress
- Bệnh nhân B: Check-in (chưa vào phòng)
- Bệnh nhân C: Scheduled (chưa check-in)

**Kỳ vọng ở Doctor Queue:**

- Chỉ thấy Bệnh nhân A (status: in_progress)
- KHÔNG thấy B và C

### Scenario 3: Test nhiều bác sĩ

- Tạo appointments cho 2 bác sĩ khác nhau
- Đăng nhập bác sĩ A → chỉ thấy bệnh nhân của mình
- Đăng nhập bác sĩ B → chỉ thấy bệnh nhân của mình

---

## ❌ Các Lỗi Có Thể Gặp & Cách Fix

### Lỗi 1: Queue hiển thị "0 patients"

**Nguyên nhân:**

- Không có appointment nào status `in_progress`
- Bệnh nhân chưa được chuyển từ `checked_in` → `in_progress`
- Appointment gán cho bác sĩ khác

**Cách fix:**

- Đảm bảo đã làm BƯỚC 5 (chuyển sang In Progress)
- Kiểm tra `doctor_id` của appointment khớp với bác sĩ đang login

### Lỗi 2: API trả về 401 Unauthorized

**Nguyên nhân:** Chưa đăng nhập hoặc token hết hạn

**Cách fix:**

- Logout và login lại
- Kiểm tra token trong localStorage

### Lỗi 3: Không tạo được appointment

**Nguyên nhân:**

- Thiếu `created_by` field
- `doctor_id` không tồn tại

**Cách fix:**

- Đảm bảo chọn bác sĩ từ dropdown
- Kiểm tra bác sĩ có trong database

---

## 📊 Checklist Tổng Quan

### Backend APIs

- [ ] POST /api/patients - Tạo bệnh nhân
- [ ] POST /api/appointments - Đặt lịch
- [ ] POST /api/queue/checkin/{id} - Check-in
- [ ] PUT /api/queue/status/{id} - Chuyển trạng thái
- [ ] GET /api/doctor/queue - Lấy queue bác sĩ
- [ ] GET /api/patients/{id}/medical-records - Lịch sử khám
- [ ] POST /api/medical-records - Tạo bệnh án

### Frontend Pages

- [ ] Receptionist - Đăng ký bệnh nhân
- [ ] Receptionist - Đặt lịch khám
- [ ] Receptionist - Quản lý queue
- [ ] Doctor - Xem queue chờ khám
- [ ] Doctor - Xem lịch sử bệnh nhân
- [ ] Doctor - Form khám bệnh
- [ ] Doctor - Kê đơn thuốc

### Workflow Integration

- [ ] Receptionist → Doctor data flow
- [ ] Status transitions hoạt động đúng
- [ ] Real-time updates (nếu có)
- [ ] Toast notifications
- [ ] Error handling

---

## 🚀 Bắt Đầu Test

**Bước đầu tiên:** Xóa hết test data cũ (đã làm rồi)

**Bước tiếp theo:** Làm theo từng bước từ BƯỚC 1 → BƯỚC 10

**Ghi chú kết quả:** Đánh dấu ✅ hoặc ❌ ở mỗi bước

Good luck! 🎉
