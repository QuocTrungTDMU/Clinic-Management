import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "../../lib/auth";
import { apiClient } from "../../lib/axios";

interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason: string | null;
  notes: string | null;
  patient_name: string;
  doctor_name: string;
  created_at: string;
}

interface AppointmentDetails {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_datetime: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  appointment_type: string;
  reason: string | null;
  notes: string | null;
  patient: {
    id: number;
    name: string;
    phone: string;
    date_of_birth: string;
    gender: string;
    address: string;
  };
  doctor: {
    id: number;
    name: string;
    specialization: string;
  };
  created_by: {
    id: number;
    name: string;
  };
  medical_record: {
    id: number;
    diagnosis: string;
    symptoms: string;
    treatment_plan: string;
  } | null;
  created_at: string;
}

export function AdminAppointmentsPage() {
  const [dateFilter, setDateFilter] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentDetails | null>(null);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: authService.me,
  });

  // Fetch appointments from API
  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ["admin-appointments", dateFilter, statusFilter],
    queryFn: async () => {
      const response = await apiClient.get("/appointments", {
        params: {
          date: dateFilter,
          status: statusFilter !== "all" ? statusFilter : undefined,
        },
      });
      return response.data;
    },
  });

  const appointments: Appointment[] = appointmentsData?.data || [];

  const fetchAppointmentDetails = async (id: number) => {
    try {
      const response = await apiClient.get(`/appointments/${id}`);
      setSelectedAppointment(response.data.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Failed to fetch appointment details:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "checked_in":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Appointments Management
                </h1>
                <p className="text-gray-500 mt-1">
                  View and manage all clinic appointments
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="checked_in">Checked In</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">
                  {appointments.length}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Scheduled</p>
                <p className="text-2xl font-semibold text-blue-600 mt-2">
                  {appointments.filter((a) => a.status === "scheduled").length}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-semibold text-purple-600 mt-2">
                  {
                    appointments.filter((a) => a.status === "in_progress")
                      .length
                  }
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-green-600 mt-2">
                  {appointments.filter((a) => a.status === "completed").length}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Cancelled</p>
                <p className="text-2xl font-semibold text-red-600 mt-2">
                  {appointments.filter((a) => a.status === "cancelled").length}
                </p>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Appointments ({appointments.length} found)
              </h3>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No appointments found for selected filters
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appointment: Appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patient_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {appointment.patient_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {appointment.doctor_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(
                              appointment.appointment_date
                            ).toLocaleDateString("vi-VN")}
                          </div>
                          <div className="text-xs text-gray-500">
                            {appointment.appointment_time}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {appointment.reason || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                              appointment.status
                            )}`}
                          >
                            {appointment.status
                              .replace("_", " ")
                              .charAt(0)
                              .toUpperCase() +
                              appointment.status.replace("_", " ").slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() =>
                              fetchAppointmentDetails(appointment.id)
                            }
                            className="text-blue-600 hover:text-blue-900 text-xs bg-blue-100 px-2 py-1 rounded"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop đen mờ + blur */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDetailsModal(false)}
          />

          {/* Modal content */}
          <div className="relative bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-white px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Appointment Details
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>

            {/* Appointment Info */}
            <div className="px-6 py-4 mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">📅</span> Appointment
                Information
              </h4>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(
                      selectedAppointment.appointment_date
                    ).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedAppointment.appointment_time}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedAppointment.appointment_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                      selectedAppointment.status
                    )}`}
                  >
                    {selectedAppointment.status
                      .replace("_", " ")
                      .charAt(0)
                      .toUpperCase() +
                      selectedAppointment.status.replace("_", " ").slice(1)}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Reason</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedAppointment.reason || "N/A"}
                  </p>
                </div>
                {selectedAppointment.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Patient Info */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-green-600">👤</span> Patient Information
              </h4>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedAppointment.patient.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedAppointment.patient.phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(
                      selectedAppointment.patient.date_of_birth
                    ).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedAppointment.patient.gender === "male"
                      ? "Male"
                      : "Female"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedAppointment.patient.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">👨‍⚕️</span> Doctor Information
              </h4>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedAppointment.doctor.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Specialization</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedAppointment.doctor.specialization}
                  </p>
                </div>
              </div>
            </div>

            {/* Medical Record */}
            {selectedAppointment.medical_record && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-red-600">🏥</span> Medical Record
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Symptoms</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedAppointment.medical_record.symptoms}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Diagnosis</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedAppointment.medical_record.diagnosis}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Treatment Plan</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedAppointment.medical_record.treatment_plan}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Created By */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-yellow-600">ℹ️</span> Additional
                Information
              </h4>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Created By</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedAppointment.created_by.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(selectedAppointment.created_at).toLocaleString(
                      "vi-VN"
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
