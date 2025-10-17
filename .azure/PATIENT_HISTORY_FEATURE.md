# Tính năng Xem Lịch Sử Khám Bệnh

## Tổng quan

Đã hoàn thành tính năng cho phép bác sĩ xem lịch sử khám bệnh của bệnh nhân trước khi khám.

## Các thành phần đã thêm

### 1. Backend API

**File:** `backend/routes/api.php`

```php
Route::get('/patients/{patientId}/medical-records', [MedicalRecordController::class, 'getPatientMedicalHistory']);
```

**File:** `backend/app/Http/Controllers/MedicalRecordController.php`

- Method: `getPatientMedicalHistory($patientId)`
- Trả về: Lịch sử khám bệnh theo thứ tự thời gian (mới nhất trước)
- Bao gồm:
  - Thông tin lần khám (ngày, bác sĩ, triệu chứng, chẩn đoán, kế hoạch điều trị)
  - Chỉ số sinh tồn (nhiệt độ, huyết áp, nhịp tim, v.v.)
  - Đơn thuốc chi tiết (tên thuốc, liều lượng, cách dùng, giá)
  - Tổng số lần khám

### 2. Frontend Component

**File:** `frontend/src/components/PatientHistoryModal.tsx`

- Component modal hiển thị lịch sử khám bệnh
- Responsive design với TailwindCSS
- Features:
  - Hiển thị danh sách lần khám theo thứ tự mới nhất
  - Thông tin chi tiết mỗi lần khám
  - Hiển thị chỉ số sinh tồn
  - Danh sách thuốc với liều lượng và cách dùng
  - Nút đóng modal

### 3. Integration vào ExaminationPage

**File:** `frontend/src/pages/doctor/ExaminationPage.tsx`

**Thêm state:**

```typescript
const [showHistoryModal, setShowHistoryModal] = useState(false);
const [historyPatientId, setHistoryPatientId] = useState<number | null>(null);
```

**Query để fetch data:**

```typescript
const { data: patientHistory } = useQuery({
  queryKey: ["patient-history", historyPatientId],
  queryFn: async () => {
    if (!historyPatientId) return null;
    const response = await api.get(
      `/patients/${historyPatientId}/medical-records`
    );
    return response.data;
  },
  enabled: !!historyPatientId,
});
```

**Thêm nút "View History":**

- Trong danh sách bệnh nhân chờ khám
- Nằm bên cạnh nút "Start Examination"
- Click vào sẽ mở modal hiển thị lịch sử

## Cách sử dụng

### Từ góc độ bác sĩ:

1. Vào trang "Patient Examination" (Khám bệnh)
2. Xem danh sách bệnh nhân đang chờ khám
3. Click nút **"View History"** để xem lịch sử khám của bệnh nhân
4. Modal hiển thị:
   - Tên bệnh nhân ở header
   - Danh sách các lần khám trước đó
   - Chi tiết mỗi lần khám: triệu chứng, chẩn đoán, kế hoạch điều trị
   - Chỉ số sinh tồn của mỗi lần khám
   - Đơn thuốc đã kê (nếu có)
5. Click nút **"Đóng"** hoặc click bên ngoài modal để đóng
6. Click nút **"Start Examination"** để bắt đầu khám bệnh

## Lợi ích

- ✅ Bác sĩ có thể xem lịch sử khám trước khi khám mới
- ✅ Hiểu rõ hơn về tình trạng sức khỏe của bệnh nhân
- ✅ Tránh kê đơn thuốc trùng lặp hoặc xung đột
- ✅ Đưa ra quyết định điều trị tốt hơn dựa trên lịch sử
- ✅ Cải thiện chất lượng khám chữa bệnh

## Test Data

TestDataSeeder đã tạo 3 bệnh nhân với appointments có status "in_progress", sẵn sàng để test chức năng này.

## Trạng thái

✅ **HOÀN THÀNH** - Ready for testing

## Các tính năng còn lại cần phát triển

1. ⏳ In đơn thuốc (API đã có, cần UI)
2. ⏳ Chỉnh sửa bệnh án
3. ⏳ Thống kê cho bác sĩ
4. ⏳ Cơ sở dữ liệu thuốc với autocomplete
5. ⏳ Tạo lịch tái khám
6. ⏳ Ghi chú riêng tư của bác sĩ
