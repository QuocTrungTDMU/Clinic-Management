import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../lib/axios";
import { UserIcon, PhoneIcon, HeartIcon } from "@heroicons/react/24/outline";

interface PatientForm {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  address: string;
  bloodType: string;
  allergies: string;
  medicalHistory: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}

const RegisterPatientPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<PatientForm>({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    address: "",
    bloodType: "",
    allergies: "",
    medicalHistory: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
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
      // Map form fields to backend API format
      const patientData = {
        name: form.fullName,
        dob: form.dateOfBirth,
        gender: form.gender,
        phone: form.phone,
        address: form.address,
        note: `Nhóm máu: ${form.bloodType || "N/A"}\nDị ứng: ${
          form.allergies || "Không"
        }\nTiền sử: ${
          form.medicalHistory || "Không"
        }\nNgười liên hệ khẩn cấp: ${form.emergencyContactName || "N/A"} - ${
          form.emergencyContactPhone || "N/A"
        } (${form.emergencyContactRelation || "N/A"})`,
      };

      await api.post("/patients", patientData);

      toast.success("Đăng ký bệnh nhân thành công!");

      // Navigate to appointments page with patient data
      setTimeout(() => {
        navigate("/receptionist/appointments", {
          state: {
            newPatient: {
              name: form.fullName,
              phone: form.phone,
            },
          },
        });
      }, 1000);
    } catch (error: unknown) {
      console.error("Error registering patient:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Có lỗi xảy ra khi đăng ký bệnh nhân"
      );
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
            Đăng Ký Bệnh Nhân Mới
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Nhập thông tin đầy đủ để đăng ký bệnh nhân mới vào hệ thống
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-8 bg-white shadow rounded-lg"
        >
          <div className="p-6">
            {/* Personal Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
                Thông Tin Cá Nhân
              </h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    required
                    value={form.fullName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label
                    htmlFor="dateOfBirth"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    id="dateOfBirth"
                    required
                    value={form.dateOfBirth}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    id="gender"
                    required
                    value={form.gender}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    required
                    value={form.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0987654321"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  id="address"
                  required
                  rows={3}
                  value={form.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                />
              </div>
            </div>

            {/* Medical Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <HeartIcon className="h-5 w-5 mr-2 text-red-500" />
                Thông Tin Y Tế
              </h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="bloodType"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nhóm máu
                  </label>
                  <select
                    name="bloodType"
                    id="bloodType"
                    value={form.bloodType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Chọn nhóm máu</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="allergies"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Dị ứng
                  </label>
                  <input
                    type="text"
                    name="allergies"
                    id="allergies"
                    value={form.allergies}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="VD: Thuốc kháng sinh, đồ ăn..."
                  />
                </div>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="medicalHistory"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tiền sử bệnh
                </label>
                <textarea
                  name="medicalHistory"
                  id="medicalHistory"
                  rows={4}
                  value={form.medicalHistory}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Mô tả các bệnh đã từng mắc, phẫu thuật đã thực hiện..."
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2 text-green-500" />
                Liên Hệ Khẩn Cấp
              </h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="emergencyContactName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Tên người liên hệ
                  </label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    id="emergencyContactName"
                    value={form.emergencyContactName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Họ tên người thân"
                  />
                </div>

                <div>
                  <label
                    htmlFor="emergencyContactPhone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Số điện thoại khẩn cấp
                  </label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    id="emergencyContactPhone"
                    value={form.emergencyContactPhone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0987654321"
                  />
                </div>

                <div>
                  <label
                    htmlFor="emergencyContactRelation"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Mối quan hệ
                  </label>
                  <select
                    name="emergencyContactRelation"
                    id="emergencyContactRelation"
                    value={form.emergencyContactRelation}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Chọn mối quan hệ</option>
                    <option value="spouse">Vợ/Chồng</option>
                    <option value="parent">Bố/Mẹ</option>
                    <option value="child">Con</option>
                    <option value="sibling">Anh/Chị/Em</option>
                    <option value="relative">Họ hàng</option>
                    <option value="friend">Bạn bè</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
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
                        fullName: "",
                        dateOfBirth: "",
                        gender: "",
                        phone: "",
                        address: "",
                        bloodType: "",
                        allergies: "",
                        medicalHistory: "",
                        emergencyContactName: "",
                        emergencyContactPhone: "",
                        emergencyContactRelation: "",
                      });
                    }
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Đang xử lý..." : "Đăng Ký Bệnh Nhân"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPatientPage;
