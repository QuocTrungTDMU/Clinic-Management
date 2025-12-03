import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { queryClient } from "./lib/react-query";
import { LoginPage } from "./pages/LoginPage";
import { AppHomePage } from "./pages/AppHomePage";
import { DoctorDashboardPage } from "./pages/doctor/DashboardPage";
import { PatientListPage } from "./pages/doctor/PatientListPage";
import { ExaminationPage } from "./pages/doctor/ExaminationPage";
import { TestPage } from "./pages/doctor/TestPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { DoctorManagementPage } from "./pages/admin/DoctorManagementPage";
import { PatientManagementPage } from "./pages/admin/PatientManagementPage";
import { AdminAppointmentsPage } from "./pages/admin/AdminAppointmentsPage";
import { FinancialReportsPage } from "./pages/admin/FinancialReportsPage";
import ReceptionistDashboardPage from "./pages/receptionist/ReceptionistDashboardPage";
import RegisterPatientPage from "./pages/receptionist/RegisterPatientPage";
import AppointmentsPage from "./pages/receptionist/AppointmentsPage";
import QueuePage from "./pages/receptionist/QueuePage";
import { PatientHistoryPage } from "./pages/receptionist/PatientHistoryPage";
import PharmacistDashboardPage from "./pages/pharmacist/PharmacistDashboardPage";
import PendingPrescriptionsPage from "./pages/pharmacist/PendingPrescriptionsPage";
import DispensingPage from "./pages/pharmacist/DispensingPage";
import { TransactionsPage } from "./pages/pharmacist/TransactionsPage";
import { InventoryPage } from "./pages/pharmacist/InventoryPage";
import LabTechnicianDashboard from "./pages/lab-technician/LabTechnicianDashboard";
import AccountantDashboardPage from "./pages/accountant/AccountantDashboardPage";
import ProcessPaymentPage from "./pages/accountant/ProcessPaymentPage";
import PaymentHistoryPage from "./pages/accountant/PaymentHistoryPage";
import VNPayReturnPage from "./pages/accountant/VNPayReturnPage";
import { AdminLayout } from "./components/AdminLayout";
import ReceptionistLayout from "./components/ReceptionistLayout";
import { PharmacistLayout } from "./components/PharmacistLayout";
import { AccountantLayout } from "./components/AccountantLayout";
import { Protected } from "./components/Protected";
import { authService } from "./lib/auth";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    // Initialize auth token on app start
    authService.initializeAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-center"
        containerStyle={{
          top: "50%",
          transform: "translateY(-50%)",
        }}
        toastOptions={{
          // Style cho toast thông thường
          style: {
            padding: "16px",
            borderRadius: "8px",
          },
          // Style cho success toast
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          // Style cho error toast
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
          // Style cho toast confirmation (custom)
          custom: {
            duration: Infinity, // Không tự đóng cho đến khi user click
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/app"
            element={
              <Protected>
                <AppHomePage />
              </Protected>
            }
          />
          {/* Doctor Routes */}
          <Route
            path="/doctor/dashboard"
            element={
              <Protected>
                <DoctorDashboardPage />
              </Protected>
            }
          />
          <Route
            path="/doctor/patients"
            element={
              <Protected>
                <PatientListPage />
              </Protected>
            }
          />
          <Route
            path="/doctor/examination"
            element={
              <Protected>
                <ExaminationPage />
              </Protected>
            }
          />
          <Route
            path="/doctor/test"
            element={
              <Protected>
                <TestPage />
              </Protected>
            }
          />
          <Route
            path="/doctor"
            element={
              <Protected>
                <DoctorDashboardPage />
              </Protected>
            }
          />
          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <Protected>
                <AdminLayout>
                  <AdminDashboardPage />
                </AdminLayout>
              </Protected>
            }
          />
          <Route
            path="/admin/doctors"
            element={
              <Protected>
                <AdminLayout>
                  <DoctorManagementPage />
                </AdminLayout>
              </Protected>
            }
          />
          <Route
            path="/admin/patients"
            element={
              <Protected>
                <AdminLayout>
                  <PatientManagementPage />
                </AdminLayout>
              </Protected>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <Protected>
                <AdminLayout>
                  <AdminAppointmentsPage />
                </AdminLayout>
              </Protected>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <Protected>
                <AdminLayout>
                  <FinancialReportsPage />
                </AdminLayout>
              </Protected>
            }
          />
          {/* Receptionist Routes */}
          <Route
            path="/receptionist"
            element={
              <Protected>
                <ReceptionistLayout />
              </Protected>
            }
          >
            <Route path="dashboard" element={<ReceptionistDashboardPage />} />
            <Route path="register-patient" element={<RegisterPatientPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="queue" element={<QueuePage />} />
            <Route path="history" element={<PatientHistoryPage />} />
          </Route>
          {/* Pharmacist Routes */}
          <Route
            path="/pharmacist"
            element={
              <Protected>
                <PharmacistLayout />
              </Protected>
            }
          >
            <Route path="dashboard" element={<PharmacistDashboardPage />} />
            <Route path="pending" element={<PendingPrescriptionsPage />} />
            <Route path="dispense/:id" element={<DispensingPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
          </Route>
          {/* Lab Technician Routes */}
          <Route
            path="/lab-technician/dashboard"
            element={
              <Protected>
                <LabTechnicianDashboard />
              </Protected>
            }
          />
          {/* Accountant Routes */}
          <Route
            path="/accountant"
            element={
              <Protected>
                <AccountantLayout />
              </Protected>
            }
          >
            <Route path="dashboard" element={<AccountantDashboardPage />} />
            <Route
              path="process-payment/:id"
              element={<ProcessPaymentPage />}
            />
            <Route path="payment-history" element={<PaymentHistoryPage />} />
            <Route path="vnpay-return" element={<VNPayReturnPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
