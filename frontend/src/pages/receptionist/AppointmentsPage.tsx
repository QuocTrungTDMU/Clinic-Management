import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  CalendarDaysIcon,
  UserIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import api from "../../lib/axios";

interface Patient {
  id: number;
  name: string;
  phone: string;
  dob: string;
}

interface AppointmentForm {
  patient_id: string;
  specialty: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string;
  reason: string;
  notes: string;
}

const AppointmentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const [searchPatient, setSearchPatient] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState("");
  const [form, setForm] = useState<AppointmentForm>({
    patient_id: "",
    specialty: "",
    appointment_date: "",
    appointment_time: "",
    appointment_type: "checkup",
    reason: "",
    notes: "",
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Specialty fees mapping (will be from admin settings later)
  const specialtyFees: Record<string, number> = {
    internal: 200000, // Nội khoa
    surgery: 250000, // Ngoại khoa
    pediatrics: 200000, // Nhi khoa
    obstetrics: 250000, // Sản khoa
    cardiology: 300000, // Tim mạch
    dermatology: 200000, // Da liễu
    orthopedics: 250000, // Chấn thương chỉnh hình
    ophthalmology: 200000, // Mắt
    ent: 200000, // Tai mũi họng
  };

  // Fetch patients list
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["patients-list"],
    queryFn: async () => {
      const response = await api.get("/patients-list");
      return response.data;
    },
  });

  // Auto-fill patient info if coming from registration
  useEffect(() => {
    const state = location.state as {
      newPatient?: { name: string; phone: string };
    };
    if (state?.newPatient) {
      // Find patient by name and phone
      const matchedPatient = patients.find(
        (p) =>
          p.name === state.newPatient?.name &&
          p.phone === state.newPatient?.phone
      );
      if (matchedPatient) {
        setForm((prev) => ({
          ...prev,
          patient_id: matchedPatient.id.toString(),
        }));
        setSelectedPatientName(
          `${matchedPatient.name} - ${matchedPatient.phone}`
        );
        toast.success(`Đã chọn bệnh nhân: ${matchedPatient.name}`, {
          duration: 3000,
        });
      }
    }
  }, [location.state, patients]);

  // Helper function to remove Vietnamese accents
  const removeAccents = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  // Filter patients based on search (name or phone, with or without accents)
  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchPatient.toLowerCase();
    const searchNoAccent = removeAccents(searchLower);
    const nameLower = patient.name.toLowerCase();
    const nameNoAccent = removeAccents(nameLower);
    const phone = patient.phone || "";

    return (
      nameLower.includes(searchLower) ||
      nameNoAccent.includes(searchNoAccent) ||
      phone.includes(searchPatient)
    );
  });

  // Handle patient selection from dropdown
  const handleSelectPatient = (patient: Patient) => {
    setForm((prev) => ({
      ...prev,
      patient_id: patient.id.toString(),
    }));
    setSelectedPatientName(`${patient.name} - ${patient.phone}`);
    setSearchPatient("");
    setShowPatientDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".patient-search-container")) {
        setShowPatientDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch available time slots when specialty and date changes
  const fetchAvailableSlots = useCallback(async () => {
    if (!form.specialty || !form.appointment_date) {
      setAvailableSlots([]);
      return;
    }

    try {
      const response = await api.get("/available-slots", {
        params: {
          specialty: form.specialty,
          date: form.appointment_date,
        },
      });
      setAvailableSlots(response.data.available_slots || []);
    } catch (error) {
      console.error("Error fetching availability:", error);
      setAvailableSlots([]);
    }
  }, [form.specialty, form.appointment_date]);

  useEffect(() => {
    fetchAvailableSlots();
  }, [fetchAvailableSlots]);

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: {
      patient_id: string;
      specialty: string;
      appointment_datetime: string;
      duration_minutes: number;
      appointment_type: string;
      reason: string;
      notes: string;
      fee: number;
    }) => {
      const response = await api.post("/appointments", appointmentData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["queue", "today"] }); // Update queue list
      // Reset form
      setForm({
        patient_id: "",
        specialty: "",
        appointment_date: "",
        appointment_time: "",
        appointment_type: "checkup",
        reason: "",
        notes: "",
      });
      setSelectedPatientName("");
      setAvailableSlots([]);
      toast.success("Đặt lịch khám thành công!");
    },
    onError: (error: unknown) => {
      console.error("Error creating appointment:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Có lỗi xảy ra khi đặt lịch khám"
      );
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.patient_id) {
      toast.error("Vui lòng chọn bệnh nhân");
      return;
    }
    if (!form.specialty) {
      toast.error("Vui lòng chọn chuyên khoa");
      return;
    }
    if (!form.appointment_date) {
      toast.error("Vui lòng chọn ngày khám");
      return;
    }
    if (!form.appointment_time) {
      toast.error("Vui lòng chọn giờ khám");
      return;
    }

    setIsSubmitting(true);

    try {
      const fee = specialtyFees[form.specialty] || 200000; // Default 200k
      const appointmentData = {
        patient_id: form.patient_id,
        specialty: form.specialty,
        appointment_datetime: `${form.appointment_date} ${form.appointment_time}:00`,
        duration_minutes: 30, // Fixed 30 minutes
        appointment_type: form.appointment_type,
        reason: form.reason,
        notes: form.notes,
        fee: fee,
      };

      await createAppointmentMutation.mutateAsync(appointmentData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Đặt Lịch Khám Bệnh
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Tạo lịch hẹn mới cho bệnh nhân với bác sĩ
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-8 bg-white shadow rounded-lg"
        >
          <div className="p-6">
            {/* Patient & Doctor Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
                Thông Tin Cơ Bản
              </h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="relative patient-search-container">
                  <label
                    htmlFor="patient_search"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Bệnh nhân <span className="text-red-500">*</span>
                  </label>
                  {/* Searchable Select */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="patient_search"
                      placeholder={
                        selectedPatientName || "Tìm kiếm bệnh nhân theo tên..."
                      }
                      value={searchPatient}
                      onChange={(e) => {
                        setSearchPatient(e.target.value);
                        setShowPatientDropdown(true);
                      }}
                      onFocus={() => setShowPatientDropdown(true)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    {/* Hidden required input for validation */}
                    <input
                      type="hidden"
                      name="patient_id"
                      value={form.patient_id}
                      required
                    />
                  </div>

                  {/* Dropdown List */}
                  {showPatientDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {filteredPatients.length > 0 ? (
                        <>
                          <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 sticky top-0">
                            {filteredPatients.length} bệnh nhân
                            {searchPatient && ` (tìm: "${searchPatient}")`}
                          </div>
                          {filteredPatients.map((patient) => (
                            <div
                              key={patient.id}
                              onClick={() => handleSelectPatient(patient)}
                              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 ${
                                form.patient_id === patient.id.toString()
                                  ? "bg-blue-100 text-blue-900"
                                  : "text-gray-900"
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {patient.name}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {patient.phone}
                                </span>
                              </div>
                              {form.patient_id === patient.id.toString() && (
                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                  ✓
                                </span>
                              )}
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="px-3 py-4 text-sm text-gray-500 text-center">
                          {searchPatient
                            ? `Không tìm thấy bệnh nhân với tên "${searchPatient}"`
                            : "Chưa có bệnh nhân nào"}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Selected patient display */}
                  {selectedPatientName && !showPatientDropdown && (
                    <div className="mt-2 text-sm text-green-600 flex items-center">
                      <span className="mr-1">✓</span>
                      {selectedPatientName}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="specialty"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Chuyên khoa <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="specialty"
                    id="specialty"
                    required
                    value={form.specialty}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Chọn chuyên khoa</option>
                    <option value="internal">Nội khoa</option>
                    <option value="surgery">Ngoại khoa</option>
                    <option value="pediatrics">Nhi khoa</option>
                    <option value="obstetrics">Sản khoa</option>
                    <option value="cardiology">Tim mạch</option>
                    <option value="dermatology">Da liễu</option>
                    <option value="orthopedics">Chấn thương chỉnh hình</option>
                    <option value="ophthalmology">Mắt</option>
                    <option value="ent">Tai mũi họng</option>
                  </select>
                  {form.specialty && (
                    <p className="mt-2 text-sm text-gray-600">
                      Phí khám:{" "}
                      {specialtyFees[form.specialty]?.toLocaleString("vi-VN")}₫
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Date & Time Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <CalendarDaysIcon className="h-5 w-5 mr-2 text-green-500" />
                Thời Gian
              </h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="appointment_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Ngày khám <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="appointment_date"
                    id="appointment_date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={form.appointment_date}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="appointment_time"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Giờ khám <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="appointment_time"
                    id="appointment_time"
                    required
                    value={form.appointment_time}
                    onChange={handleInputChange}
                    disabled={!availableSlots.length}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                  >
                    <option value="">
                      {availableSlots.length
                        ? "Chọn giờ khám"
                        : "Chọn chuyên khoa và ngày trước"}
                    </option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    Thời lượng: 30 phút
                  </p>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-purple-500" />
                Chi Tiết Khám
              </h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="appointment_type"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Loại khám
                  </label>
                  <select
                    name="appointment_type"
                    id="appointment_type"
                    value={form.appointment_type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="checkup">Khám tổng quát</option>
                    <option value="followup">Tái khám</option>
                    <option value="consultation">Tư vấn</option>
                    <option value="emergency">Cấp cứu</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700"
                >
                  Lý do khám
                </label>
                <textarea
                  name="reason"
                  id="reason"
                  rows={3}
                  value={form.reason}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Mô tả triệu chứng hoặc lý do khám bệnh..."
                />
              </div>

              <div className="mt-6">
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700"
                >
                  Ghi chú
                </label>
                <textarea
                  name="notes"
                  id="notes"
                  rows={2}
                  value={form.notes}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ghi chú thêm cho bác sĩ..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => {
                    if (
                      confirm(
                        "Bạn có chắc chắn muốn hủy? Tất cả dữ liệu sẽ bị mất."
                      )
                    ) {
                      setForm({
                        patient_id: "",
                        specialty: "",
                        appointment_date: "",
                        appointment_time: "",
                        appointment_type: "checkup",
                        reason: "",
                        notes: "",
                      });
                      setSelectedPatientName("");
                      setAvailableSlots([]);
                    }
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || createAppointmentMutation.isPending}
                  className={`px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSubmitting || createAppointmentMutation.isPending
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isSubmitting || createAppointmentMutation.isPending
                    ? "Đang xử lý..."
                    : "Đặt Lịch Khám"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentsPage;
