import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  CalendarDaysIcon,
  UserIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import api from "../../lib/axios";

interface Patient {
  id: number;
  name: string;
  phone: string;
  dob: string;
}

interface Doctor {
  id: number;
  name: string;
  email: string;
}

interface AppointmentForm {
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  appointment_type: string;
  reason: string;
  notes: string;
  fee: string;
}

const AppointmentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AppointmentForm>({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    duration_minutes: 30,
    appointment_type: "checkup",
    reason: "",
    notes: "",
    fee: "",
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch patients list
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["patients-list"],
    queryFn: async () => {
      const response = await api.get("/patients-list");
      return response.data;
    },
  });

  // Fetch doctors list
  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ["doctors"],
    queryFn: async () => {
      const response = await api.get("/doctors");
      return response.data;
    },
  });

  // Fetch doctor availability when date and doctor changes
  useEffect(() => {
    if (form.doctor_id && form.appointment_date) {
      fetchDoctorAvailability();
    }
  }, [form.doctor_id, form.appointment_date]);

  const fetchDoctorAvailability = async () => {
    try {
      const response = await api.get("/doctor-availability", {
        params: {
          doctor_id: form.doctor_id,
          date: form.appointment_date,
        },
      });
      setAvailableSlots(response.data.available_slots);
    } catch (error) {
      console.error("Error fetching availability:", error);
      setAvailableSlots([]);
    }
  };

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await api.post("/appointments", appointmentData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      // Reset form
      setForm({
        patient_id: "",
        doctor_id: "",
        appointment_date: "",
        appointment_time: "",
        duration_minutes: 30,
        appointment_type: "checkup",
        reason: "",
        notes: "",
        fee: "",
      });
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
    setIsSubmitting(true);

    try {
      const appointmentData = {
        ...form,
        appointment_datetime: `${form.appointment_date} ${form.appointment_time}:00`,
        duration_minutes: Number(form.duration_minutes),
        fee: form.fee ? Number(form.fee) : null,
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
                <div>
                  <label
                    htmlFor="patient_id"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Bệnh nhân <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="patient_id"
                    id="patient_id"
                    required
                    value={form.patient_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Chọn bệnh nhân</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} - {patient.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="doctor_id"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Bác sĩ <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="doctor_id"
                    id="doctor_id"
                    required
                    value={form.doctor_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Chọn bác sĩ</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Date & Time Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <CalendarDaysIcon className="h-5 w-5 mr-2 text-green-500" />
                Thời Gian
              </h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
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
                        : "Chọn bác sĩ và ngày trước"}
                    </option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="duration_minutes"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Thời lượng (phút)
                  </label>
                  <select
                    name="duration_minutes"
                    id="duration_minutes"
                    value={form.duration_minutes}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value={15}>15 phút</option>
                    <option value={30}>30 phút</option>
                    <option value={45}>45 phút</option>
                    <option value={60}>60 phút</option>
                  </select>
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
                    <option value="emergency">Khẩn cấp</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="fee"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phí khám (VND)
                  </label>
                  <input
                    type="number"
                    name="fee"
                    id="fee"
                    min="0"
                    step="1000"
                    value={form.fee}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="VD: 200000"
                  />
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
                        doctor_id: "",
                        appointment_date: "",
                        appointment_time: "",
                        duration_minutes: 30,
                        appointment_type: "checkup",
                        reason: "",
                        notes: "",
                        fee: "",
                      });
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
