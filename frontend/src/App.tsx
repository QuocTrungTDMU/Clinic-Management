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
import ReceptionistDashboardPage from "./pages/receptionist/ReceptionistDashboardPage";
import RegisterPatientPage from "./pages/receptionist/RegisterPatientPage";
import AppointmentsPage from "./pages/receptionist/AppointmentsPage";
import QueuePage from "./pages/receptionist/QueuePage";
import { PatientHistoryPage } from "./pages/receptionist/PatientHistoryPage";
import { AdminLayout } from "./components/AdminLayout";
import ReceptionistLayout from "./components/ReceptionistLayout";
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
      <Toaster position="top-right" />
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
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
