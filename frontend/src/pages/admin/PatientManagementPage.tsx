import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/axios";
import { toast } from "react-hot-toast";

interface Patient {
  id: number;
  name: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  address: string;
  medical_history: string | null;
  allergies: string | null;
  emergency_contact: string | null;
  created_at: string;
  appointments_count?: number;
  last_visit?: string;
}

interface PatientDetails extends Patient {
  appointments: {
    id: number;
    appointment_date: string;
    appointment_time: string;
    status: string;
    reason: string | null;
    doctor_name: string | null;
  }[];
  medical_records: {
    id: number;
    visit_date: string;
    diagnosis: string;
    symptoms: string;
    treatment_plan: string | null;
    notes: string | null;
    doctor_name: string | null;
    prescription: {
      id: number;
      items: {
        medicine_name: string;
        dosage: string;
        quantity: number;
        instructions: string | null;
      }[];
    } | null;
  }[];
}

export function PatientManagementPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientDetails | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMedicalHistoryModal, setShowMedicalHistoryModal] = useState(false);

  // Fetch patients from API
  const { data: patientsData, isLoading } = useQuery({
    queryKey: ["admin-patients", searchTerm],
    queryFn: async () => {
      const response = await apiClient.get("/patients", {
        params: {
          search: searchTerm,
        },
      });
      return response.data;
    },
  });

  const patients: Patient[] = patientsData?.data || [];

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch patient details
  const fetchPatientDetails = async (patientId: number) => {
    try {
      const response = await apiClient.get(`/patients/${patientId}`);
      return response.data.data;
    } catch (error) {
      toast.error("Failed to load patient details");
      throw error;
    }
  };

  // Handle view details
  const handleViewDetails = async (patientId: number) => {
    const details = await fetchPatientDetails(patientId);
    setSelectedPatient(details);
    setShowDetailsModal(true);
  };

  // Handle view medical history
  const handleViewMedicalHistory = async (patientId: number) => {
    const details = await fetchPatientDetails(patientId);
    setSelectedPatient(details);
    setShowMedicalHistoryModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Quản Lý Bệnh Nhân
                </h1>
                <p className="text-gray-500 mt-1">
                  Quản lý hồ sơ và thông tin bệnh nhân
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Tìm bệnh nhân theo tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-blue-600"
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
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total Patients
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {patients.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Active Today
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {
                      patients.filter(
                        (p) =>
                          p.last_visit ===
                          new Date().toISOString().split("T")[0]
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    New This Month
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {
                      patients.filter((p) => {
                        const createdDate = new Date(p.created_at);
                        const now = new Date();
                        return (
                          createdDate.getMonth() === now.getMonth() &&
                          createdDate.getFullYear() === now.getFullYear()
                        );
                      }).length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tổng Lịch Hẹn
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {patients.reduce(
                      (sum, p) => sum + (p.appointments_count || 0),
                      0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Patient List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Patients ({filteredPatients.length} found)
              </h3>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No patients found
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
                        Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date of Birth
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Appointments
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Visit
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.map((patient: Patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {patient.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {patient.name}
                              </div>
                              <div className="text-xs text-gray-400">
                                ID: {patient.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {patient.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(patient.date_of_birth).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.appointments_count || 0} visits
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.last_visit
                            ? new Date(patient.last_visit).toLocaleDateString(
                                "vi-VN"
                              )
                            : "No visits"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleViewDetails(patient.id)}
                              className="text-blue-600 hover:text-blue-900 text-xs bg-blue-100 px-3 py-1 rounded"
                            >
                              Xem Chi Tiết
                            </button>
                            <button
                              onClick={() =>
                                handleViewMedicalHistory(patient.id)
                              }
                              className="text-green-600 hover:text-green-900 text-xs bg-green-100 px-3 py-1 rounded"
                            >
                              Bệnh Án
                            </button>
                          </div>
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

      {/* Patient Details Modal */}
      {showDetailsModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop đen mờ + blur */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDetailsModal(false)}
          />

          {/* Modal content */}
          <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-white px-6 py-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Patient Details
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <p className="mt-1 text-lg text-gray-900">
                    {selectedPatient.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <p className="mt-1 text-lg text-gray-900 capitalize">
                    {selectedPatient.gender}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <p className="mt-1 text-lg text-gray-900">
                    {new Date(selectedPatient.date_of_birth).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <p className="mt-1 text-lg text-gray-900">
                    {selectedPatient.phone}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <p className="mt-1 text-lg text-gray-900">
                    {selectedPatient.address || "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Medical History
                  </label>
                  <p className="mt-1 text-gray-900">
                    {selectedPatient.medical_history ||
                      "No medical history recorded"}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Allergies
                  </label>
                  <p className="mt-1 text-gray-900">
                    {selectedPatient.allergies || "No known allergies"}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Emergency Contact
                  </label>
                  <p className="mt-1 text-gray-900">
                    {selectedPatient.emergency_contact || "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Appointments
                </h4>
                {selectedPatient.appointments &&
                selectedPatient.appointments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPatient.appointments
                      .slice(0, 5)
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(
                                appointment.appointment_date
                              ).toLocaleDateString("vi-VN")}{" "}
                              at {appointment.appointment_time}
                            </p>
                            <p className="text-xs text-gray-500">
                              Doctor: {appointment.doctor_name || "N/A"}
                            </p>
                            {appointment.reason && (
                              <p className="text-xs text-gray-600 mt-1">
                                {appointment.reason}
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              appointment.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : appointment.status === "scheduled"
                                ? "bg-blue-100 text-blue-800"
                                : appointment.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No appointments yet
                  </p>
                )}
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Medical History Modal */}
      {showMedicalHistoryModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop đen mờ + blur */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowMedicalHistoryModal(false)}
          />

          {/* Modal content */}
          <div className="relative bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-white px-6 py-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Medical History
                  </h3>
                  <p className="text-gray-500 mt-1">{selectedPatient.name}</p>
                </div>
                <button
                  onClick={() => setShowMedicalHistoryModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {selectedPatient.medical_records &&
              selectedPatient.medical_records.length > 0 ? (
                <div className="space-y-6">
                  {selectedPatient.medical_records.map((record) => (
                    <div
                      key={record.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            Visit -{" "}
                            {new Date(record.visit_date).toLocaleDateString(
                              "vi-VN"
                            )}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Doctor: {record.doctor_name || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Symptoms
                          </label>
                          <p className="mt-1 text-gray-900">
                            {record.symptoms}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Diagnosis
                          </label>
                          <p className="mt-1 text-gray-900">
                            {record.diagnosis}
                          </p>
                        </div>
                        {record.treatment_plan && (
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Treatment Plan
                            </label>
                            <p className="mt-1 text-gray-900">
                              {record.treatment_plan}
                            </p>
                          </div>
                        )}
                        {record.notes && (
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Notes
                            </label>
                            <p className="mt-1 text-gray-900">{record.notes}</p>
                          </div>
                        )}
                      </div>

                      {record.prescription &&
                        record.prescription.items.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h5 className="text-sm font-semibold text-gray-900 mb-3">
                              Prescription
                            </h5>
                            <div className="space-y-2">
                              {record.prescription.items.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex items-start justify-between bg-blue-50 p-3 rounded"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                      {item.medicine_name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Dosage: {item.dosage} | Quantity:{" "}
                                      {item.quantity}
                                    </p>
                                    {item.instructions && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {item.instructions}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              ) : (
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
                    No Medical Records
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This patient has no medical history yet.
                  </p>
                </div>
              )}
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowMedicalHistoryModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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
