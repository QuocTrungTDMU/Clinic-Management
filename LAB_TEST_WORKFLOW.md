# Hướng Dẫn Workflow Khám Cận Lâm Sàng

## 📋 Tổng Quan

Hệ thống hỗ trợ quy trình khám cận lâm sàng hoàn chỉnh với 3 vai trò chính:

1. **Bác sĩ khám bệnh**: Chỉ định xét nghiệm
2. **Kỹ thuật viên cận lâm sàng**: Thực hiện xét nghiệm, nhập kết quả
3. **Bác sĩ**: Xem kết quả và kê đơn

---

## 🔄 Quy Trình Hoàn Chỉnh

### Bước 1: Bác Sĩ Chỉ Định Xét Nghiệm

**Đăng nhập:** `doctor@clinic.local / doctor123`

1. Vào trang **Doctor → Examination**
2. Chọn bệnh nhân từ hàng đợi
3. Khám bệnh và nhập thông tin:
   - Dấu hiệu sinh tồn
   - Triệu chứng
   - Thăm khám thực thể
4. **Chọn xét nghiệm cần làm** ở phần "Chỉ Định Cận Lâm Sàng"

   **3 nhóm xét nghiệm:**

   - 📊 **Xét Nghiệm** (8 loại):

     - Công thức máu
     - Glucose máu
     - HbA1c
     - Chức năng gan (ALT, AST)
     - Chức năng thận (Creatinine, Urea)
     - Lipid máu
     - Nước tiểu tổng quát
     - CRP (Protein phản ứng C)

   - 🔬 **Chẩn Đoán Hình Ảnh** (6 loại):

     - X-quang ngực
     - X-quang xương khớp
     - Siêu âm bụng tổng quát
     - Siêu âm tim
     - CT Scan
     - MRI

   - 💓 **Thăm Dò Chức Năng** (3 loại):
     - Điện tim (ECG)
     - Siêu âm Doppler
     - Nội soi tiêu hóa

5. Tick chọn các xét nghiệm cần làm (ví dụ: Công thức máu, X-quang ngực)

6. **Nhấn nút "Gửi Yêu Cầu (X)"** ngay để gửi yêu cầu đến phòng cận lâm sàng

   - **KHÔNG CẦN** lưu hồ sơ khám trước
   - Hệ thống tự động tạo hồ sơ tạm (draft) với chẩn đoán: "Chờ kết quả xét nghiệm cận lâm sàng"
   - X = số lượng xét nghiệm đã chọn
   - Hệ thống hiển thị: "Đã gửi X yêu cầu xét nghiệm!"
   - Nút chuyển thành "Đã gửi" (disabled)

7. **Đợi kết quả xét nghiệm từ phòng cận lâm sàng**

8. Sau khi có kết quả, nhập chẩn đoán chính xác và kế hoạch điều trị

9. **Nhấn "Hoàn Thành Khám"** để lưu hồ sơ khám bệnh hoàn chỉnh

---

### Bước 2: Kỹ Thuật Viên Thực Hiện Xét Nghiệm

**Đăng nhập:** `lab@clinic.com / password`

**Trang chủ: Phòng Cận Lâm Sàng**

#### 📊 Thống Kê Dashboard

- **Chờ Xử Lý**: Số yêu cầu pending
- **Đang Thực Hiện**: Số xét nghiệm in_progress
- **Hoàn Thành Hôm Nay**: Số xét nghiệm completed

#### 📑 Tabs Lọc

- **Tất Cả**: Hiển thị tất cả yêu cầu
- **Chờ Xử Lý**: Chỉ yêu cầu pending
- **Đang Thực Hiện**: Chỉ xét nghiệm in_progress
- **Hoàn Thành**: Chỉ xét nghiệm completed

#### 🔬 Thực Hiện Xét Nghiệm

**Mỗi yêu cầu hiển thị:**

- Tên xét nghiệm + Badge phân loại (Xét Nghiệm/Chẩn Đoán Hình Ảnh/Thăm Dò Chức Năng)
- Trạng thái: Chờ Xử Lý / Đang Thực Hiện / Hoàn Thành
- Thông tin bệnh nhân: Họ tên, giới tính, ngày sinh
- Chẩn đoán lâm sàng
- Mã xét nghiệm
- Thời gian yêu cầu
- Ghi chú lâm sàng từ bác sĩ

**Quy trình xử lý:**

1. **Xét nghiệm Pending** → Nhấn **"Bắt Đầu"**

   - Xác nhận: "Bắt đầu thực hiện: [Tên xét nghiệm]?"
   - Trạng thái chuyển: pending → **in_progress**
   - Toast: "Đã bắt đầu thực hiện xét nghiệm!"

2. **Xét nghiệm In Progress** → Nhấn **"Nhập Kết Quả"**

   - Mở modal nhập kết quả
   - Hiển thị đầy đủ thông tin bệnh nhân
   - Nhập **Kết Quả Xét Nghiệm** (bắt buộc)
   - Nhập **Ghi Chú Kết Quả** (tùy chọn)
   - Nhấn **"Lưu Kết Quả"**
   - Trạng thái chuyển: in_progress → **completed**
   - Toast: "Đã lưu kết quả xét nghiệm!"

3. **Xét nghiệm Completed** → Nhấn **"Xem Chi Tiết"**
   - Xem lại kết quả đã nhập
   - Không thể chỉnh sửa

---

### Bước 3: Bác Sĩ Xem Kết Quả (Coming Soon)

**Tính năng đang phát triển:**

- Xem danh sách xét nghiệm đã yêu cầu
- Xem kết quả xét nghiệm đã hoàn thành
- So sánh với chỉ số tham chiếu
- Kê đơn thuốc dựa trên kết quả

---

## 🎯 Ví Dụ Cụ Thể

### Case: Bệnh nhân nghi ngờ đái tháo đường

**Bác sĩ:**

1. Khám bệnh nhân Nguyễn Văn A
2. Nhập dấu hiệu sinh tồn, triệu chứng
3. Chọn xét nghiệm:
   - ☑ Glucose máu
   - ☑ HbA1c
   - ☑ Lipid máu
4. **Gửi Yêu Cầu (3)** ngay (không cần lưu hồ sơ trước)
   - Hệ thống tự tạo hồ sơ tạm với chẩn đoán: "Chờ kết quả xét nghiệm"
5. Đợi kết quả từ phòng cận lâm sàng

**Kỹ thuật viên:**

1. Thấy 3 yêu cầu từ Nguyễn Văn A (chẩn đoán tạm: "Chờ kết quả xét nghiệm")
2. Nhấn **"Bắt Đầu"** từng xét nghiệm
3. Lấy mẫu máu, thực hiện xét nghiệm
4. Nhập kết quả:
   ```
   Glucose máu đói: 156 mg/dL (cao)
   HbA1c: 7.2% (cao)
   Cholesterol toàn phần: 245 mg/dL
   LDL: 165 mg/dL
   HDL: 38 mg/dL
   Triglycerid: 210 mg/dL
   ```
5. Ghi chú: "Chỉ số glucose và HbA1c cao hơn bình thường, khuyến cáo tái khám"
6. **Lưu Kết Quả** (x3 xét nghiệm)

**Bác sĩ (tiếp tục khám):**

1. Xem kết quả xét nghiệm
2. Cập nhật chẩn đoán chính xác: "Đái tháo đường type 2"
3. Nhập kế hoạch điều trị
4. Kê đơn điều trị (Metformin, điều chỉnh chế độ ăn)
5. **Hoàn Thành Khám** → Lưu hồ sơ hoàn chỉnh

---

## 📱 Giao Diện

### Dashboard Kỹ Thuật Viên

```
┌─────────────────────────────────────────────────────┐
│ 🔬 Phòng Cận Lâm Sàng                              │
│ Quản lý yêu cầu xét nghiệm và chẩn đoán            │
├─────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────────────┐       │
│ │ Chờ: 5  │ │ Đang: 2 │ │ Hoàn Thành: 12  │       │
│ │ ⏰      │ │ ⚙️      │ │ ✅              │       │
│ └─────────┘ └─────────┘ └─────────────────┘       │
├─────────────────────────────────────────────────────┤
│ [Tất Cả (19)] [Chờ Xử Lý (5)] [Đang Thực Hiện (2)] │
│ [Hoàn Thành (12)]                                   │
├─────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────┐  │
│ │ 📊 Công thức máu [Xét Nghiệm] [Chờ Xử Lý]   │  │
│ │ 👤 Bệnh nhân: Nguyễn Văn A (Nam)              │  │
│ │ 🩺 Chẩn đoán: Nghi ngờ đái tháo đường       │  │
│ │ 📋 Mã: CBC-001                                │  │
│ │ 📅 Yêu cầu lúc: 06/11/2025 10:30             │  │
│ │ 💬 Ghi chú: Yêu cầu từ bác sĩ khám bệnh      │  │
│ │                              [🟢 Bắt Đầu]     │  │
│ └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Modal Nhập Kết Quả

```
┌──────────────────────────────────────────┐
│ Nhập Kết Quả Xét Nghiệm                 │
│ Công thức máu                            │
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │
│ │ Thông Tin Bệnh Nhân                  │ │
│ │ Họ tên: Nguyễn Văn A                 │ │
│ │ Giới tính: Nam | Ngày sinh: 01/01/80 │ │
│ │ Chẩn đoán: Nghi ngờ đái tháo đường   │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Kết Quả Xét Nghiệm *                    │
│ ┌──────────────────────────────────────┐ │
│ │ WBC: 7.5 x10^9/L (bình thường)       │ │
│ │ RBC: 4.8 x10^12/L (bình thường)      │ │
│ │ Hemoglobin: 14.2 g/dL (bình thường)  │ │
│ │ Platelet: 250 x10^9/L (bình thường)  │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Ghi Chú Kết Quả (Tùy chọn)              │
│ ┌──────────────────────────────────────┐ │
│ │ Tất cả chỉ số trong giới hạn bình    │ │
│ │ thường                                │ │
│ └──────────────────────────────────────┘ │
│                                          │
│              [Hủy]  [💾 Lưu Kết Quả]    │
└──────────────────────────────────────────┘
```

---

## 🔐 Test Accounts

### Bác Sĩ

- **Email:** doctor@clinic.local
- **Password:** doctor123

### Kỹ Thuật Viên

- **Email:** lab@clinic.com
- **Password:** password

---

## ✅ Checklist Kiểm Tra

- [x] Backend APIs hoạt động
- [x] Frontend giao diện kỹ thuật viên
- [x] Workflow: Bác sĩ gửi yêu cầu
- [x] Workflow: Kỹ thuật viên nhận yêu cầu
- [x] Workflow: Kỹ thuật viên bắt đầu xét nghiệm
- [x] Workflow: Kỹ thuật viên nhập kết quả
- [x] Thống kê dashboard
- [x] Lọc theo trạng thái
- [ ] Bác sĩ xem kết quả xét nghiệm (Coming soon)
- [ ] In phiếu kết quả xét nghiệm (Coming soon)
- [ ] Upload file đính kèm (X-quang, siêu âm) (Coming soon)

---

## 🚀 Tính Năng Sắp Tới

1. **Xem Kết Quả trong Examination Form**

   - Hiển thị danh sách xét nghiệm đã yêu cầu
   - Trạng thái real-time (pending/in_progress/completed)
   - Xem kết quả ngay trong form khám

2. **Upload File Đính Kèm**

   - Upload ảnh X-quang, CT, MRI
   - Upload file PDF kết quả
   - Xem preview trong modal

3. **In Phiếu Kết Quả**

   - Template phiếu kết quả chuyên nghiệp
   - Logo phòng khám
   - In PDF hoặc giấy

4. **Tham Chiếu Chỉ Số**

   - Giá trị tham chiếu cho từng xét nghiệm
   - Highlight chỉ số bất thường (màu đỏ)
   - Gợi ý giải thích kết quả

5. **Lịch Sử Xét Nghiệm**
   - So sánh kết quả theo thời gian
   - Biểu đồ xu hướng (glucose, HbA1c...)
   - Export báo cáo

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:

1. Backend server đang chạy: `php artisan serve`
2. Frontend server đang chạy: `npm run dev`
3. Database đã migrate: `php artisan migrate`
4. Lab technician user đã tạo: `php artisan db:seed --class=LabTechnicianSeeder`
