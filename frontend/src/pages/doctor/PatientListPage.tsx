import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "../../lib/auth";
import api from "../../lib/axios";
import { toast } from "react-hot-toast";

interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  patient_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  appointment_type: string;
  reason: string;
  specialty: string;
}

export function PatientListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [specialties, setSpecialties] = useState<string[]>([]);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: authService.me,
  });

  // Parse doctor's specializations
  useEffect(() => {
    if (user?.specialization) {
      const specs = user.specialization.split(",").map((s: string) => s.trim());
      setSpecialties(specs);

      // Auto-select if only one specialty
      if (specs.length === 1) {
        setSelectedSpecialty(specs[0]);
      }
    }
  }, [user]);

  // Fetch today's appointments for the selected specialty
  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["doctor-appointments", selectedSpecialty],
    queryFn: async () => {
      if (!selectedSpecialty) return [];

      const today = new Date().toISOString().split("T")[0];
      const response = await api.get("/appointments", {
        params: {
          date: today,
        },
      });

      // Filter appointments by specialty, current doctor, and exclude cancelled
      const filtered = response.data.data.filter(
        (apt: Appointment) =>
          apt.specialty === selectedSpecialty &&
          apt.doctor_id === user?.id &&
          apt.status !== "cancelled"
      );

      return filtered;
    },
    enabled: !!selectedSpecialty && !!user?.id,
  });

  const filteredAppointments = appointments.filter(
    (apt) =>
      apt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/doctor/dashboard")}
                className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Patient Management
              </h1>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome,{" "}
                <span className="font-medium text-gray-900">{user?.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Danh Sách Bệnh Nhân Hôm Nay
                </h2>
                <p className="mt-2 text-gray-600">
                  {new Date().toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Specialty Selection (if doctor has multiple specialties) */}
          {specialties.length > 1 && (
            <div className="bg-white rounded-lg shadow mb-6 p-6">
              <label
                htmlFor="specialty"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Chọn Chuyên Khoa
              </label>
              <select
                id="specialty"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="block w-full max-w-md border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">
                  -- Chọn chuyên khoa để xem bệnh nhân --
                </option>
                {specialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec === "internal" && "Nội khoa"}
                    {spec === "surgery" && "Ngoại khoa"}
                    {spec === "pediatrics" && "Nhi khoa"}
                    {spec === "obstetrics" && "Sản khoa"}
                    {spec === "cardiology" && "Tim mạch"}
                    {spec === "dermatology" && "Da liễu"}
                    {spec === "orthopedics" && "Chấn thương chỉnh hình"}
                    {spec === "ophthalmology" && "Mắt"}
                    {spec === "ent" && "Tai mũi họng"}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!selectedSpecialty && specialties.length > 1 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800">
                Vui lòng chọn chuyên khoa để xem danh sách bệnh nhân
              </p>
            </div>
          )}

          {selectedSpecialty && (
            <>
              {/* Search and Filters */}
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label htmlFor="search" className="sr-only">
                        Tìm kiếm bệnh nhân
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                        <input
                          id="search"
                          type="text"
                          placeholder="Tìm theo tên bệnh nhân hoặc lý do khám..."
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient List */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Danh Sách Khám ({filteredAppointments.length} bệnh nhân)
                  </h3>
                </div>

                {isLoading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Đang tải...</p>
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Không có bệnh nhân
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm
                        ? "Không tìm thấy bệnh nhân phù hợp."
                        : "Chưa có lịch khám nào cho hôm nay."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bệnh Nhân
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Giờ Khám
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Loại Khám
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lý Do
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trạng Thái
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hành Động
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAppointments.map((appointment) => (
                          <tr key={appointment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-medium text-sm">
                                    {appointment.patient_name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .slice(0, 2)}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {appointment.patient_name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ID: #{appointment.patient_id}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.appointment_time}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {appointment.appointment_type === "checkup" &&
                                  "Khám tổng quát"}
                                {appointment.appointment_type === "followup" &&
                                  "Tái khám"}
                                {appointment.appointment_type ===
                                  "consultation" && "Tư vấn"}
                                {appointment.appointment_type === "emergency" &&
                                  "Cấp cứu"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {appointment.reason || "Không có"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  appointment.status === "scheduled"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : appointment.status === "checked_in"
                                    ? "bg-green-100 text-green-800"
                                    : appointment.status === "in_progress"
                                    ? "bg-purple-100 text-purple-800"
                                    : appointment.status === "completed"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {appointment.status === "scheduled" &&
                                  "Đã đặt lịch"}
                                {appointment.status === "checked_in" &&
                                  "Đã check-in"}
                                {appointment.status === "in_progress" &&
                                  "Đang khám"}
                                {appointment.status === "completed" &&
                                  "Hoàn thành"}
                                {appointment.status === "no_show" && "Vắng mặt"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() =>
                                  navigate(
                                    `/doctor/examination/${appointment.id}`
                                  )
                                }
                                className="text-blue-600 hover:text-blue-900 font-medium"
                              >
                                Khám bệnh
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
