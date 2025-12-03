# Accountant Role & Billing System Implementation Summary

## Overview

Successfully implemented "Plan B" - Adding Accountant role with comprehensive billing invoice system and medicine reservation workflow to separate payment collection from medicine dispensing.

---

## New Workflow (Before → After)

### OLD Workflow:

```
Doctor prescribes → Pharmacist dispenses medicine + collects payment → Done
```

### NEW Workflow (Plan B):

```
1. Doctor completes examination
   ├─> Creates billing_invoice (status=pending)
   ├─> Creates medicine_reservations (deducts VIRTUAL stock)
   └─> Updates appointment status to "completed"

2. Accountant receives invoice
   ├─> Collects payment from patient
   ├─> Updates billing_invoice (status=paid, payment details)
   └─> Creates pharmacy_transaction (status=paid_pending_dispensing)

3. Pharmacist sees only PAID prescriptions
   ├─> Verifies payment confirmation
   ├─> Dispenses medicine to patient
   ├─> Updates medicine_reservations (status=dispensed, deducts REAL stock)
   └─> Updates pharmacy_transaction (status=completed)
```

---

## Backend Changes Summary

### 1. Database Migrations (3 new files)

#### `2025_12_04_000001_create_billing_invoices_table.php`

```php
- appointment_id, patient_id, doctor_id, medical_record_id, prescription_id
- consultation_fee (default 100,000 VND)
- medication_cost (from prescription items)
- lab_test_cost (from lab tests)
- total_amount (auto-calculated)
- status: ENUM('pending', 'paid', 'cancelled')
- payment_method: cash/bank_transfer/credit_card
- amount_paid, change_amount (for cash transactions)
- processed_by (accountant user_id)
- paid_at (timestamp)
```

#### `2025_12_04_000002_create_medicine_reservations_table.php`

```php
- prescription_id, prescription_item_id, medicine_id
- medicine_name, reserved_quantity, unit
- status: ENUM('reserved', 'dispensed', 'cancelled')
- reserved_at, dispensed_at (timestamps)
- reserved_by (doctor), dispensed_by (pharmacist)
```

#### `2025_12_04_000003_update_pharmacy_transactions_table.php`

```php
- Make pharmacist_id NULLABLE (set when dispensing)
- Add status: ENUM('paid_pending_dispensing', 'completed', 'cancelled')
- Add paid_amount, change_amount columns
```

### 2. Eloquent Models (2 new models)

#### `app/Models/BillingInvoice.php`

**Relationships:**

- belongsTo: appointment, patient, doctor, medicalRecord, prescription, processedBy (User)

**Key Methods:**

- `calculateTotal()`: Computes total_amount from consultation_fee + medication_cost + lab_test_cost
- `markAsPaid($processedBy, $paymentMethod, $amountPaid)`: Updates status to 'paid', records payment details, calculates change

#### `app/Models/MedicineReservation.php`

**Relationships:**

- belongsTo: prescription, prescriptionItem, medicine, reservedBy (User), dispensedBy (User)

**Key Methods:**

- `markAsDispensed($dispensedBy)`: Updates status to 'dispensed', deducts REAL stock from medicines table
- `cancelReservation()`: Marks status as 'cancelled' (does NOT restore virtual stock)

### 3. Controllers Updated/Created

#### ✅ NEW: `app/Http/Controllers/BillingController.php`

**Endpoints:**

- `GET /api/billing/pending-invoices` - List unpaid invoices for accountant
- `GET /api/billing/invoices/{id}` - Get invoice details with patient/prescription info
- `POST /api/billing/invoices/{id}/process-payment` - Process payment (requires payment_method, amount_paid)
- `POST /api/billing/invoices/{id}/cancel` - Cancel invoice (also cancels medicine reservations)
- `GET /api/billing/payment-history` - Payment history with filters (status, date range, search)
- `GET /api/billing/statistics` - Revenue statistics (total/consultation/medication/lab test)

#### ✅ UPDATED: `app/Http/Controllers/MedicalRecordController.php`

**Changes in `store()` method:**

- Creates `medicine_reservations` for each prescription item (virtual stock deduction)
- Calculates lab test costs from linked lab tests
- Creates `billing_invoice` with:
  - consultation_fee: 100,000 VND (configurable)
  - medication_cost: sum of prescription item prices
  - lab_test_cost: sum of lab test type prices
  - status: 'pending'

#### ✅ UPDATED: `app/Http/Controllers/Api/PharmacyController.php`

**Changes in `getPendingPrescriptions()`:**

- Filters prescriptions with `whereHas('billingInvoice', status='paid')`
- Only shows prescriptions with `medicineReservations` status='reserved'

**Changes in `dispensePrescription()`:**

- Verifies billing invoice is paid before dispensing
- Calls `markAsDispensed()` on each reservation (deducts REAL stock)
- Updates pharmacy_transaction status to 'completed'
- Sets pharmacist_id when dispensing

### 4. Seeders Updated

#### ✅ UPDATED: `database/seeders/RolesAndAdminSeeder.php`

```php
$roles = ['admin', 'doctor', 'receptionist', 'pharmacist', 'lab_technician', 'accountant'];
```

#### ✅ NEW: `database/seeders/AccountantUserSeeder.php`

```php
Email: accountant@clinic.local
Password: accountant123
Name: Nguyễn Thị Hoa
Role: accountant
```

#### ✅ UPDATED: `database/seeders/DatabaseSeeder.php`

Added `AccountantUserSeeder::class` to call chain

### 5. API Routes Added

```php
// Billing routes (Accountant - Kế toán thu tiền)
Route::get('/billing/pending-invoices', [BillingController::class, 'getPendingInvoices']);
Route::get('/billing/invoices/{id}', [BillingController::class, 'getInvoiceDetails']);
Route::post('/billing/invoices/{id}/process-payment', [BillingController::class, 'processPayment']);
Route::post('/billing/invoices/{id}/cancel', [BillingController::class, 'cancelInvoice']);
Route::get('/billing/payment-history', [BillingController::class, 'getPaymentHistory']);
Route::get('/billing/statistics', [BillingController::class, 'getStatistics']);
```

### 6. Model Relationships Added

#### `app/Models/Prescription.php`

```php
public function billingInvoice() { return $this->hasOne(BillingInvoice::class); }
public function medicineReservations() { return $this->hasMany(MedicineReservation::class); }
```

#### `app/Models/PharmacyTransaction.php`

```php
// Added fillable fields: status, paid_amount, change_amount
```

---

## Frontend Changes Summary

### 1. Login Page Updated

#### ✅ UPDATED: `frontend/src/pages/LoginPage.tsx`

```typescript
const roleRedirects: Record<string, string> = {
  admin: "/admin/dashboard",
  doctor: "/doctor/dashboard",
  receptionist: "/receptionist/dashboard",
  pharmacist: "/pharmacist/dashboard",
  lab_technician: "/lab-technician/dashboard",
  accountant: "/accountant/dashboard", // NEW
};
```

### 2. Accountant Pages (TODO)

**Need to create these files:**

- `frontend/src/pages/accountant/AccountantDashboard.tsx`

  - Display statistics (pending invoices, total revenue, invoices processed today)
  - List of pending invoices with patient info
  - Quick actions: process payment, view details

- `frontend/src/pages/accountant/BillingList.tsx`

  - Payment history table with filters
  - Columns: Invoice ID, Patient Name, Amount, Status, Date, Actions
  - Search by patient name/phone
  - Filter by status, date range

- `frontend/src/pages/accountant/PaymentForm.tsx`
  - Invoice details display (patient, doctor, items breakdown)
  - Payment method selection (cash, bank_transfer, credit_card)
  - Amount paid input with change calculation
  - Confirm payment button

### 3. Routing Configuration (TODO)

Update `frontend/src/App.tsx` or routing config:

```typescript
{
  path: '/accountant',
  element: <ProtectedRoute roles={['accountant']} />,
  children: [
    { path: 'dashboard', element: <AccountantDashboard /> },
    { path: 'billing-list', element: <BillingList /> },
    { path: 'invoice/:id', element: <PaymentForm /> },
  ]
}
```

---

## Next Steps (TODO)

### 1. Run Migrations & Seeders

```bash
# In backend directory
php artisan migrate
php artisan db:seed --class=RolesAndAdminSeeder
php artisan db:seed --class=AccountantUserSeeder
```

### 2. Create Frontend Accountant Pages

- [ ] `AccountantDashboard.tsx` with statistics and pending invoices
- [ ] `BillingList.tsx` with payment history and filters
- [ ] `PaymentForm.tsx` with invoice details and payment processing

### 3. Update Routing

- [ ] Add accountant routes to frontend router
- [ ] Implement role-based access control

### 4. Testing Checklist

- [ ] Create patient and appointment (Receptionist)
- [ ] Complete examination with prescription (Doctor)
- [ ] Verify billing_invoice created (status=pending)
- [ ] Verify medicine_reservations created (status=reserved)
- [ ] Process payment (Accountant) - status should change to 'paid'
- [ ] Verify pharmacy_transaction created (status=paid_pending_dispensing)
- [ ] Dispense medicine (Pharmacist) - should deduct REAL stock
- [ ] Verify medicine_reservations updated (status=dispensed)
- [ ] Verify pharmacy_transaction updated (status=completed)

### 5. Documentation Updates

- [ ] Update README.md with new workflow diagrams
- [ ] Document billing API endpoints with request/response examples
- [ ] Update graduation report Chapter 3 (add Accountant actor, UC-36, UC-37)
- [ ] Add database schema for 2 new tables to report Chapter 4
- [ ] Update system architecture diagram to include billing workflow

---

## Demo Accounts (Updated)

| Role           | Email                       | Password          |
| -------------- | --------------------------- | ----------------- |
| Admin          | admin@clinic.local          | admin123          |
| Doctor         | doctor@clinic.local         | doctor123         |
| Receptionist   | receptionist@clinic.local   | receptionist123   |
| Pharmacist     | pharmacist@clinic.local     | pharmacist123     |
| Lab Technician | lab@clinic.local            | lab123            |
| **Accountant** | **accountant@clinic.local** | **accountant123** |

---

## Key Decisions & Rationale

### Why Virtual Stock + Real Stock?

- **Virtual stock deduction (doctor)**: Prevents duplicate prescriptions when medicine is low
- **Real stock deduction (pharmacist)**: Ensures actual inventory tracking on dispensing
- **Benefit**: Avoids overselling when multiple doctors prescribe simultaneously

### Why Separate Billing Invoice from Pharmacy Transaction?

- **billing_invoices**: Comprehensive invoice (consultation + medication + lab tests)
- **pharmacy_transactions**: Tracks medicine dispensing workflow only
- **Benefit**: Clear separation of concerns, better audit trail

### Why Make Pharmacist ID Nullable in pharmacy_transactions?

- Accountant creates transaction when processing payment (pharmacist not known yet)
- Pharmacist ID is set when medicine is actually dispensed
- **Benefit**: Accurate tracking of who processed payment vs who dispensed medicine

### Why Include Lab Test Costs in Billing Invoice?

- Provides complete billing picture for patient
- Single payment point for all services rendered
- **Benefit**: Better patient experience, simplified accounting

---

## Files Created/Modified

### Created (9 files):

1. `backend/database/migrations/2025_12_04_000001_create_billing_invoices_table.php`
2. `backend/database/migrations/2025_12_04_000002_create_medicine_reservations_table.php`
3. `backend/database/migrations/2025_12_04_000003_update_pharmacy_transactions_table.php`
4. `backend/app/Models/BillingInvoice.php`
5. `backend/app/Models/MedicineReservation.php`
6. `backend/app/Http/Controllers/BillingController.php`
7. `backend/database/seeders/AccountantUserSeeder.php`
8. `ACCOUNTANT_IMPLEMENTATION_SUMMARY.md` (this file)

### Modified (8 files):

1. `backend/database/seeders/RolesAndAdminSeeder.php`
2. `backend/database/seeders/DatabaseSeeder.php`
3. `backend/app/Http/Controllers/MedicalRecordController.php`
4. `backend/app/Http/Controllers/Api/PharmacyController.php`
5. `backend/app/Models/Prescription.php`
6. `backend/app/Models/PharmacyTransaction.php`
7. `backend/routes/api.php`
8. `frontend/src/pages/LoginPage.tsx`

---

## API Endpoint Examples

### Process Payment (Accountant)

```http
POST /api/billing/invoices/1/process-payment
Authorization: Bearer {token}
Content-Type: application/json

{
  "payment_method": "cash",
  "amount_paid": 150000
}

Response 200:
{
  "message": "Payment processed successfully.",
  "invoice": {
    "id": 1,
    "total_amount": 145000,
    "amount_paid": 150000,
    "change_amount": 5000,
    "status": "paid",
    "processed_by": 6,
    "paid_at": "2025-12-04T10:30:00Z"
  }
}
```

### Dispense Medicine (Pharmacist)

```http
POST /api/pharmacy/dispense/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "notes": "Đã phát thuốc cho bệnh nhân"
}

Response 201:
{
  "message": "Phát thuốc thành công",
  "transaction": {
    "id": 1,
    "prescription_id": 1,
    "status": "completed",
    "pharmacist_id": 5
  }
}

Error 400 (if not paid):
{
  "message": "Hóa đơn chưa được thanh toán. Vui lòng yêu cầu bệnh nhân thanh toán tại phòng kế toán trước."
}
```

---

## Important Notes

1. **Insurance Not Implemented**: User explicitly requested to exclude insurance features for now
2. **Consultation Fee**: Currently hardcoded as 100,000 VND in `MedicalRecordController.php:139` - can be made configurable later
3. **Stock Management**: Medicine reservations do NOT restore virtual stock when cancelled - this is intentional to prevent race conditions
4. **Payment Verification**: Pharmacist CANNOT dispense medicine until accountant marks invoice as paid
5. **Role Permissions**: Need to add Spatie permissions for accountant role endpoints (optional, depends on current RBAC implementation)

---

## Graduation Report Updates Needed

### Chapter 3 (System Analysis):

- Add Accountant actor description
- Add UC-36: Process Payment (Accountant thu tiền)
- Add UC-37: View Payment History (Kế toán xem lịch sử thanh toán)
- Add UC-38: Generate Revenue Report (Báo cáo doanh thu)

### Chapter 4 (Database Design):

- Add `billing_invoices` table schema (14 columns)
- Add `medicine_reservations` table schema (11 columns)
- Update ERD diagram to include 2 new tables and relationships
- Add explanation of virtual vs real stock deduction

### Chapter 5 (Implementation):

- Add screenshots: Accountant Dashboard, Payment Processing Form, Payment History
- Update workflow diagram to show 3-step process (Doctor → Accountant → Pharmacist)
- Add code snippets: BillingController::processPayment, MedicineReservation::markAsDispensed

---

**Implementation Status: Backend 95% Complete | Frontend 10% Complete | Testing 0%**
