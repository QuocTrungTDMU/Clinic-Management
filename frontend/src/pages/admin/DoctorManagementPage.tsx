import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "../../lib/auth";

export function DoctorManagementPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: authService.me,
  });

  // Mock doctor data - will be replaced with real API call
  const mockDoctors = [
    {
      id: 1,
      name: "Dr. Trung Bảo",
      email: "doctor@clinic.local",
      phone: "0901234567",
      specialization: "Internal Medicine",
      license: "MD12345",
      status: "active",
      registeredAt: "2025-09-15",
      approvedAt: "2025-09-16",
      patientCount: 45,
    },
    {
      id: 2,
      name: "Dr. Nguyễn Thành",
      email: "nguyen.thanh@clinic.local",
      phone: "0907654321",
      specialization: "Cardiology",
      license: "MD67890",
      status: "pending",
      registeredAt: "2025-09-25",
      approvedAt: null,
      patientCount: 0,
    },
    {
      id: 3,
      name: "Dr. Lê Minh Hoàng",
      email: "le.hoang@clinic.local",
      phone: "0912345678",
      specialization: "Pediatrics",
      license: "MD11111",
      status: "active",
      registeredAt: "2025-09-10",
      approvedAt: "2025-09-11",
      patientCount: 62,
    },
    {
      id: 4,
      name: "Dr. Phạm Thị Mai",
      email: "pham.mai@clinic.local",
      phone: "0908765432",
      specialization: "Dermatology",
      license: "MD22222",
      status: "pending",
      registeredAt: "2025-09-26",
      approvedAt: null,
      patientCount: 0,
    },
    {
      id: 5,
      name: "Dr. Trần Văn Nam",
      email: "tran.nam@clinic.local",
      phone: "0913579246",
      specialization: "Orthopedics",
      license: "MD33333",
      status: "inactive",
      registeredAt: "2025-08-20",
      approvedAt: "2025-08-21",
      patientCount: 23,
    },
  ];

  const filteredDoctors = mockDoctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || doctor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleLogout = async () => {
    try {
      await authService.logout();
      queryClient.removeQueries({ queryKey: ["user"] });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  const handleApprove = (doctorId: number) => {
    // TODO: Implement approve doctor API call
    console.log(`Approving doctor ID: ${doctorId}`);
  };

  const handleReject = (doctorId: number) => {
    // TODO: Implement reject doctor API call
    console.log(`Rejecting doctor ID: ${doctorId}`);
  };

  const handleDeactivate = (doctorId: number) => {
    // TODO: Implement deactivate doctor API call
    console.log(`Deactivating doctor ID: ${doctorId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const pendingCount = mockDoctors.filter((d) => d.status === "pending").length;
  const activeCount = mockDoctors.filter((d) => d.status === "active").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center hover:bg-purple-700 transition-colors"
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Doctor Management
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
                  Doctor Management
                </h2>
                <p className="mt-2 text-gray-600">
                  Manage doctor registrations, approvals, and access permissions
                </p>
              </div>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                + Add New Doctor
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
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
                    Active Doctors
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {activeCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-yellow-600"
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
                  <p className="text-sm font-medium text-gray-500">
                    Pending Approval
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {pendingCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
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
                    {mockDoctors.reduce(
                      (sum, doctor) => sum + doctor.patientCount,
                      0
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Specializations
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {new Set(mockDoctors.map((d) => d.specialization)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="search" className="sr-only">
                    Search doctors
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
                      placeholder="Search by name, email, or specialization..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Doctors ({filteredDoctors.length} found)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      License
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patients
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDoctors.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {doctor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {doctor.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {doctor.email}
                            </div>
                            <div className="text-xs text-gray-400">
                              {doctor.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doctor.specialization}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doctor.license}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doctor.patientCount} patients
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                            doctor.status
                          )}`}
                        >
                          {doctor.status.charAt(0).toUpperCase() +
                            doctor.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>
                            Registered:{" "}
                            {new Date(doctor.registeredAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </div>
                          {doctor.approvedAt && (
                            <div className="text-xs text-green-600">
                              Approved:{" "}
                              {new Date(doctor.approvedAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {doctor.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(doctor.id)}
                                className="text-green-600 hover:text-green-900 text-xs bg-green-100 px-2 py-1 rounded"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(doctor.id)}
                                className="text-red-600 hover:text-red-900 text-xs bg-red-100 px-2 py-1 rounded"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {doctor.status === "active" && (
                            <button
                              onClick={() => handleDeactivate(doctor.id)}
                              className="text-orange-600 hover:text-orange-900 text-xs bg-orange-100 px-2 py-1 rounded"
                            >
                              Deactivate
                            </button>
                          )}
                          <button className="text-blue-600 hover:text-blue-900 text-xs bg-blue-100 px-2 py-1 rounded">
                            View
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 text-xs bg-gray-100 px-2 py-1 rounded">
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredDoctors.length === 0 && (
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No doctors found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm
                    ? "Try adjusting your search criteria."
                    : "Get started by adding your first doctor."}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
