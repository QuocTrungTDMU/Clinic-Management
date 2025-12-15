import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/axios";
import { authService } from "../../lib/auth";

interface DashboardStats {
  total_patients: number;
  active_doctors: number;
  pending_doctors: number;
  today_appointments: number;
  completed_appointments: number;
  today_revenue: number;
  total_revenue: number;
  recent_patients: number;
}

export function AdminDashboardPage() {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: authService.me,
  });

  // Fetch dashboard statistics
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const [patientsRes, doctorsRes, appointmentsRes, revenueRes] =
        await Promise.all([
          apiClient.get("/patients"),
          apiClient.get("/admin/doctors"),
          apiClient.get("/appointments", {
            params: { date: new Date().toISOString().split("T")[0] },
          }),
          apiClient.get("/pharmacy/transactions", {
            params: {
              from_date: new Date().toISOString().split("T")[0],
              to_date: new Date().toISOString().split("T")[0],
            },
          }),
        ]);

      const patients = patientsRes.data.data || [];
      const doctors = doctorsRes.data.data || [];
      const appointments = appointmentsRes.data.data || [];
      const transactions = revenueRes.data.data || [];

      const todayRevenue = transactions.reduce(
        (sum: number, t: { total_amount: number }) =>
          sum + Number(t.total_amount),
        0
      );

      return {
        total_patients: patients.length,
        active_doctors: doctors.filter(
          (d: { status: string }) => d.status === "active"
        ).length,
        pending_doctors: doctors.filter(
          (d: { status: string }) => d.status === "pending"
        ).length,
        today_appointments: appointments.length,
        completed_appointments: appointments.filter(
          (a: { status: string }) => a.status === "completed"
        ).length,
        today_revenue: todayRevenue,
        recent_patients: patients.filter((p: { created_at: string }) => {
          const created = new Date(p.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return created > weekAgo;
        }).length,
      } as DashboardStats;
    },
  });

  const stats: DashboardStats = statsData || {
    total_patients: 0,
    active_doctors: 0,
    pending_doctors: 0,
    today_appointments: 0,
    completed_appointments: 0,
    today_revenue: 0,
    total_revenue: 0,
    recent_patients: 0,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900">Trang Quản Trị</h1>
            <p className="text-gray-500 mt-1">
              Chào mừng trở lại, {user.name}! Đây là tổng quan về phòng khám hôm
              nay.
            </p>
          </div>

          {/* Stats Cards */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Patients */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      Tổng Bệnh Nhân
                    </p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.total_patients}
                      </p>
                      {stats.recent_patients > 0 && (
                        <p className="ml-2 text-sm font-medium text-green-600">
                          +{stats.recent_patients} tuần này
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Doctors */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      Bác Sĩ Hoạt Động
                    </p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.active_doctors}
                      </p>
                      {stats.pending_doctors > 0 && (
                        <p className="ml-2 text-sm font-medium text-orange-600">
                          {stats.pending_doctors} chờ duyệt
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Revenue */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      Doanh Thu Hôm Nay
                    </p>
                    <div className="flex items-baseline">
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(stats.today_revenue)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Appointments */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      Lịch Hẹn Hôm Nay
                    </p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.today_appointments}
                      </p>
                      <p className="ml-2 text-sm font-medium text-gray-600">
                        {stats.completed_appointments} hoàn thành
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Doctor Management */}
            <button
              onClick={() => navigate("/admin/doctors")}
              className="bg-white rounded-lg shadow p-6 hover:shadow-xl hover:scale-105 hover:border-green-500 border-2 border-transparent transition-all duration-200 text-left cursor-pointer group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <svg
                  className="w-6 h-6 text-green-600 group-hover:text-green-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors min-h-[28px]">
                Quản Lý Bác Sĩ
              </h3>
              <p className="text-sm text-gray-600 mb-3 min-h-[40px]">
                Quản lý tài khoản và duyệt bác sĩ
              </p>
              <div className="min-h-[24px]">
                {stats.pending_doctors > 0 && (
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                    {stats.pending_doctors} chờ duyệt
                  </span>
                )}
              </div>
            </button>

            {/* Patient Management */}
            <button
              onClick={() => navigate("/admin/patients")}
              className="bg-white rounded-lg shadow p-6 hover:shadow-xl hover:scale-105 hover:border-blue-500 border-2 border-transparent transition-all duration-200 text-left cursor-pointer group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <svg
                  className="w-6 h-6 text-blue-600 group-hover:text-blue-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors min-h-[28px]">
                Quản Lý Bệnh Nhân
              </h3>
              <p className="text-sm text-gray-600 mb-3 min-h-[40px]">
                Xem và quản lý tất cả hồ sơ bệnh nhân
              </p>
              <div className="min-h-[24px]">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {stats.total_patients} bệnh nhân
                </span>
              </div>
            </button>

            {/* Appointments */}
            <button
              onClick={() => navigate("/admin/appointments")}
              className="bg-white rounded-lg shadow p-6 hover:shadow-xl hover:scale-105 hover:border-purple-500 border-2 border-transparent transition-all duration-200 text-left cursor-pointer group"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <svg
                  className="w-6 h-6 text-purple-600 group-hover:text-purple-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors min-h-[28px]">
                Lịch Hẹn
              </h3>
              <p className="text-sm text-gray-600 mb-3 min-h-[40px]">
                Xem và quản lý tất cả lịch hẹn
              </p>
              <div className="min-h-[24px]">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                  {stats.today_appointments} hôm nay
                </span>
              </div>
            </button>

            {/* Financial Reports */}
            <button
              onClick={() => navigate("/admin/financial-reports")}
              className="bg-white rounded-lg shadow p-6 hover:shadow-xl hover:scale-105 hover:border-yellow-500 border-2 border-transparent transition-all duration-200 text-left cursor-pointer group"
            >
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-200 transition-colors">
                <svg
                  className="w-6 h-6 text-yellow-600 group-hover:text-yellow-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors min-h-[28px]">
                Báo Cáo Tài Chính
              </h3>
              <p className="text-sm text-gray-600 mb-3 min-h-[40px]">
                Xem doanh thu và phân tích giao dịch
              </p>
              <div className="min-h-[24px]">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  {formatCurrency(stats.today_revenue)}
                </span>
              </div>
            </button>
          </div>

          {/* System Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Trạng Thái Hệ Thống
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Kết Nối Cơ Sở Dữ Liệu
                  </span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-green-600">
                      Đã Kết Nối
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Máy Chủ API
                  </span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-green-600">
                      Trực Tuyến
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Xác Thực
                  </span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-green-600">
                      Hoạt Động
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Tổng Quan Nhanh
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Tổng Bác Sĩ
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.active_doctors}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Tổng Bệnh Nhân
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.total_patients}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Lịch Hẹn Hôm Nay
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.today_appointments}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Chờ Duyệt
                  </span>
                  <span className="text-sm font-bold text-orange-600">
                    {stats.pending_doctors}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
