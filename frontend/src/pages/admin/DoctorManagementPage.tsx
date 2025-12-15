import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../../lib/auth";
import { apiClient } from "../../lib/axios";
import { toast } from "react-hot-toast";

interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  specialization: string | null;
  license_number: string | null;
  status: "pending" | "active" | "inactive" | "rejected";
  approved_at: string | null;
  patient_count: number;
  created_at: string;
}

export function DoctorManagementPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    license_number: "",
    password: "",
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: authService.me,
  });

  // Fetch doctors from API
  const { data: doctorsData, isLoading: isDoctorsLoading } = useQuery({
    queryKey: ["admin-doctors", statusFilter, searchTerm],
    queryFn: async () => {
      const response = await apiClient.get("/admin/doctors", {
        params: {
          status: statusFilter,
          search: searchTerm,
        },
      });
      return response.data;
    },
  });

  const doctors: Doctor[] = doctorsData?.data || [];

  // Approve doctor mutation
  const approveMutation = useMutation({
    mutationFn: async (doctorId: number) => {
      const response = await apiClient.post(
        `/admin/doctors/${doctorId}/approve`
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Doctor approved successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
    },
    onError: () => {
      toast.error("Failed to approve doctor");
    },
  });

  // Reject doctor mutation
  const rejectMutation = useMutation({
    mutationFn: async (doctorId: number) => {
      const response = await apiClient.post(
        `/admin/doctors/${doctorId}/reject`
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Doctor rejected successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
    },
    onError: () => {
      toast.error("Failed to reject doctor");
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (doctorId: number) => {
      const response = await apiClient.post(
        `/admin/doctors/${doctorId}/toggle-status`
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Doctor status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
    },
    onError: () => {
      toast.error("Failed to update doctor status");
    },
  });

  // Add doctor mutation
  const addDoctorMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiClient.post("/admin/doctors", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Doctor added successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      setShowAddModal(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        license_number: "",
        password: "",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add doctor");
    },
  });

  // Update doctor mutation
  const updateDoctorMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<typeof formData>;
    }) => {
      const response = await apiClient.put(`/admin/doctors/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Doctor updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      setShowEditModal(false);
      setSelectedDoctor(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update doctor");
    },
  });

  // Delete doctor mutation
  const deleteDoctorMutation = useMutation({
    mutationFn: async (doctorId: number) => {
      const response = await apiClient.delete(`/admin/doctors/${doctorId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Doctor deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete doctor");
    },
  });

  const handleApprove = (doctorId: number) => {
    toast.custom(
      (t) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop đen mờ + blur */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            style={{ margin: "-100vh -100vw", padding: "100vh 100vw" }}
          />
          {/* Toast content */}
          <div className="relative bg-white shadow-2xl rounded-lg p-6 max-w-md w-full border-2 border-green-200 mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-900">Approve Doctor</p>
                <p className="text-sm text-gray-600">
                  Confirm to approve this doctor account
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  approveMutation.mutate(doctorId);
                  toast.dismiss(t.id);
                }}
                className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleReject = (doctorId: number) => {
    toast.custom(
      (t) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop đen mờ + blur */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            style={{ margin: "-100vh -100vw", padding: "100vh 100vw" }}
          />
          {/* Toast content */}
          <div className="relative bg-white shadow-2xl rounded-lg p-6 max-w-md w-full border-2 border-red-200 mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
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
              </div>
              <div>
                <p className="font-bold text-gray-900">Reject Doctor</p>
                <p className="text-sm text-gray-600">
                  Confirm to reject this doctor account
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  rejectMutation.mutate(doctorId);
                  toast.dismiss(t.id);
                }}
                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleDeactivate = (doctorId: number) => {
    toast.custom(
      (t) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop đen mờ + blur */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            style={{ margin: "-100vh -100vw", padding: "100vh 100vw" }}
          />
          {/* Toast content */}
          <div className="relative bg-white shadow-2xl rounded-lg p-6 max-w-md w-full border-2 border-orange-200 mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-900">Change Status</p>
                <p className="text-sm text-gray-600">
                  Confirm to change this doctor's status
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  toggleStatusMutation.mutate(doctorId);
                  toast.dismiss(t.id);
                }}
                className="flex-1 bg-orange-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleDelete = (doctorId: number) => {
    toast.custom(
      (t) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop đen mờ + blur */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            style={{ margin: "-100vh -100vw", padding: "100vh 100vw" }}
          />
          {/* Toast content */}
          <div className="relative bg-white shadow-2xl rounded-lg p-6 max-w-md w-full border-2 border-red-300 mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <div>
                <p className="font-bold text-red-900">Delete Doctor</p>
                <p className="text-sm text-red-600">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  deleteDoctorMutation.mutate(doctorId);
                  toast.dismiss(t.id);
                }}
                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleViewDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowViewModal(true);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone || "",
      specialization: doctor.specialization || "",
      license_number: doctor.license_number || "",
      password: "",
    });
    setShowEditModal(true);
  };

  const handleAddDoctor = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialization: "",
      license_number: "",
      password: "",
    });
    setShowAddModal(true);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addDoctorMutation.mutate(formData);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDoctor) {
      updateDoctorMutation.mutate({
        id: selectedDoctor.id,
        data: formData,
      });
    }
  };

  const filteredDoctors = doctors;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const pendingCount = doctors.filter((d) => d.status === "pending").length;
  const activeCount = doctors.filter((d) => d.status === "active").length;

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Quản Lý Bác Sĩ
                </h1>
                <p className="text-gray-500 mt-1">
                  Quản lý đăng ký, duyệt và quyền truy cập của bác sĩ
                </p>
              </div>
              <button
                onClick={handleAddDoctor}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                + Thêm Bác Sĩ Mới
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">
                  Bác Sĩ Hoạt Động
                </p>
                <p className="text-2xl font-semibold text-green-600 mt-2">
                  {activeCount}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Chờ Duyệt</p>
                <p className="text-2xl font-semibold text-yellow-600 mt-2">
                  {pendingCount}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">
                  Tổng Bệnh Nhân
                </p>
                <p className="text-2xl font-semibold text-blue-600 mt-2">
                  {doctors.reduce(
                    (sum: number, doctor: Doctor) =>
                      sum + (doctor.patient_count || 0),
                    0
                  )}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Chuyên Khoa</p>
                <p className="text-2xl font-semibold text-purple-600 mt-2">
                  {
                    new Set(
                      doctors
                        .filter((d: Doctor) => d.specialization)
                        .map((d: Doctor) => d.specialization)
                    ).size
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tìm Kiếm
                </label>
                <input
                  id="search"
                  type="text"
                  placeholder="Tìm theo tên, email hoặc chuyên khoa..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="status-filter"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Lọc Trạng Thái
                </label>
                <select
                  id="status-filter"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tất Cả Trạng Thái</option>
                  <option value="active">Hoạt Động</option>
                  <option value="pending">Chờ Duyệt</option>
                  <option value="inactive">Ngừng Hoạt Động</option>
                </select>
              </div>
            </div>
          </div>

          {/* Doctor List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Bác Sĩ ({filteredDoctors.length} kết quả)
              </h3>
            </div>

            {isDoctorsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Không tìm thấy bác sĩ
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bác Sĩ
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chuyên Khoa
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bệnh Nhân
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng Thái
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đăng Ký
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao Tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDoctors.map((doctor: Doctor) => (
                      <tr key={doctor.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-600 font-medium text-sm">
                                {doctor.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {doctor.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {doctor.email}
                              </div>
                              <div className="text-xs text-gray-400">
                                {doctor.phone || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doctor.specialization || "N/A"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doctor.patient_count} bệnh nhân
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                              doctor.status
                            )}`}
                          >
                            {doctor.status.charAt(0).toUpperCase() +
                              doctor.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-900">
                          <div>
                            Đăng ký:{" "}
                            {new Date(doctor.created_at).toLocaleDateString(
                              "vi-VN"
                            )}
                          </div>
                          {doctor.approved_at && (
                            <div className="text-green-600">
                              Duyệt:{" "}
                              {new Date(doctor.approved_at).toLocaleDateString(
                                "vi-VN"
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {doctor.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApprove(doctor.id)}
                                  className="text-green-600 hover:text-green-900 text-xs bg-green-100 px-2 py-1 rounded"
                                >
                                  Duyệt
                                </button>
                                <button
                                  onClick={() => handleReject(doctor.id)}
                                  className="text-red-600 hover:text-red-900 text-xs bg-red-100 px-2 py-1 rounded"
                                >
                                  Từ Chối
                                </button>
                              </>
                            )}
                            {doctor.status === "active" && (
                              <button
                                onClick={() => handleDeactivate(doctor.id)}
                                className="text-orange-600 hover:text-orange-900 text-xs bg-orange-100 px-2 py-1 rounded"
                              >
                                Vô Hiệu
                              </button>
                            )}
                            {doctor.status === "inactive" && (
                              <button
                                onClick={() => handleDeactivate(doctor.id)}
                                className="text-green-600 hover:text-green-900 text-xs bg-green-100 px-2 py-1 rounded"
                              >
                                Kích Hoạt
                              </button>
                            )}
                            <button
                              onClick={() => handleViewDoctor(doctor)}
                              className="text-blue-600 hover:text-blue-900 text-xs bg-blue-100 px-2 py-1 rounded"
                            >
                              Xem
                            </button>
                            <button
                              onClick={() => handleEditDoctor(doctor)}
                              className="text-purple-600 hover:text-purple-900 text-xs bg-purple-100 px-2 py-1 rounded"
                            >
                              Sửa
                            </button>
                            {doctor.status !== "active" && (
                              <button
                                onClick={() => handleDelete(doctor.id)}
                                className="text-red-600 hover:text-red-900 text-xs bg-red-100 px-2 py-1 rounded"
                              >
                                Xóa
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* View Doctor Modal */}
          {showViewModal && selectedDoctor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop đen mờ + blur */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

              {/* Modal content */}
              <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    Chi Tiết Bác Sĩ
                  </h3>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
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

                <div className="p-6 space-y-6">
                  {/* Avatar and Name */}
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-2xl">
                        {selectedDoctor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900">
                        {selectedDoctor.name}
                      </h4>
                      <p className="text-gray-600">
                        {selectedDoctor.specialization || "General Practice"}
                      </p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${getStatusBadge(
                          selectedDoctor.status
                        )}`}
                      >
                        {selectedDoctor.status.charAt(0).toUpperCase() +
                          selectedDoctor.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Email
                      </label>
                      <p className="mt-1 text-gray-900">
                        {selectedDoctor.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Số Điện Thoại
                      </label>
                      <p className="mt-1 text-gray-900">
                        {selectedDoctor.phone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Số Chứng Chỉ Hành Nghề
                      </label>
                      <p className="mt-1 text-gray-900">
                        {selectedDoctor.license_number || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Tổng Bệnh Nhân
                      </label>
                      <p className="mt-1 text-gray-900">
                        {selectedDoctor.patient_count} bệnh nhân
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Ngày Đăng Ký
                      </label>
                      <p className="mt-1 text-gray-900">
                        {new Date(selectedDoctor.created_at).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                    {selectedDoctor.approved_at && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Ngày Duyệt
                        </label>
                        <p className="mt-1 text-gray-900">
                          {new Date(
                            selectedDoctor.approved_at
                          ).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    {selectedDoctor.status === "pending" && (
                      <>
                        <button
                          onClick={() => {
                            handleApprove(selectedDoctor.id);
                            setShowViewModal(false);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                        >
                          Duyệt Bác Sĩ
                        </button>
                        <button
                          onClick={() => {
                            handleReject(selectedDoctor.id);
                            setShowViewModal(false);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                        >
                          Từ Chối
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleEditDoctor(selectedDoctor);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Sửa Bác Sĩ
                    </button>
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Doctor Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop đen mờ + blur */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

              {/* Modal content */}
              <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    Thêm Bác Sĩ Mới
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
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

                <form onSubmit={handleSubmitAdd} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ Tên *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="BS. Nguyễn Văn A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="bacsi@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật Khẩu *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số Điện Thoại
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chuyên Khoa
                    </label>
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialization: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: Tim mạch, Nhi khoa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số Chứng Chỉ Hành Nghề
                    </label>
                    <input
                      type="text"
                      value={formData.license_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          license_number: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Số chứng chỉ hành nghề"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={addDoctorMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                    >
                      {addDoctorMutation.isPending
                        ? "Đang thêm..."
                        : "Thêm Bác Sĩ"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Doctor Modal */}
          {showEditModal && selectedDoctor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop đen mờ + blur */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

              {/* Modal content */}
              <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    Sửa Bác Sĩ
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
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

                <form onSubmit={handleSubmitEdit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật Khẩu Mới (bỏ trống để giữ nguyên)
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số Điện Thoại
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chuyên Khoa
                    </label>
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialization: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số Chứng Chỉ Hành Nghề
                    </label>
                    <input
                      type="text"
                      value={formData.license_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          license_number: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={updateDoctorMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                    >
                      {updateDoctorMutation.isPending
                        ? "Đang cập nhật..."
                        : "Cập Nhật Bác Sĩ"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
