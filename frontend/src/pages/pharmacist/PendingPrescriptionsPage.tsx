import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import { format } from "date-fns";

interface PrescriptionItem {
  id: number;
  medicine_name: string;
  medicine_type: string;
  strength: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Prescription {
  id: number;
  patient: {
    id: number;
    name: string;
    phone: string;
  };
  doctor: {
    id: number;
    name: string;
  };
  items: PrescriptionItem[];
  total_cost: number;
  status: string;
  created_at: string;
}

export default function PendingPrescriptionsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ["pending-prescriptions", searchTerm, selectedDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedDate) params.append("date", selectedDate);

      const response = await api.get(
        `/pharmacy/pending-prescriptions?${params}`
      );
      return response.data;
    },
  });

  const handleDispense = (prescriptionId: number) => {
    navigate(`/pharmacist/dispense/${prescriptionId}`);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Đơn Thuốc Chờ Bán</h1>
        <p className="mt-2 text-sm text-gray-600">
          Danh sách đơn thuốc đang chờ phát thuốc
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm bệnh nhân
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tên hoặc SĐT bệnh nhân..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lọc theo ngày
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : prescriptions?.data?.length === 0 ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
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
            Không có đơn thuốc chờ
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Tất cả đơn thuốc đều đã được bán hoặc chưa có đơn nào mới.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions?.data?.map((prescription: Prescription) => (
            <div
              key={prescription.id}
              className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Patient Info */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-xl">👤</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {prescription.patient.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          SĐT: {prescription.patient.phone} • Bác sĩ:{" "}
                          {prescription.doctor.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Ngày kê đơn:{" "}
                          {format(
                            new Date(prescription.created_at),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Medicine Items */}
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Danh sách thuốc ({prescription.items.length} loại):
                      </h4>
                      <div className="space-y-2">
                        {prescription.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                          >
                            <div className="flex-1">
                              <span className="font-medium text-gray-900">
                                {item.medicine_name}
                              </span>
                              {item.strength && (
                                <span className="text-gray-500 ml-2">
                                  ({item.strength})
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-gray-700">
                                SL: {item.quantity}
                              </span>
                              <span className="text-gray-500 ml-4">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(item.total_price)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="border-t border-gray-200 mt-4 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">
                          Tổng tiền:
                        </span>
                        <span className="text-xl font-bold text-green-600">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(prescription.total_cost)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="ml-6">
                    <button
                      onClick={() => handleDispense(prescription.id)}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      <svg
                        className="h-5 w-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      Bán Thuốc
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
