import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface MedicineItem {
  id: number;
  medicine_name: string;
  medicine_type: string;
  strength: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  in_stock: number;
  available: boolean;
  medicine_id: number | null;
}

interface PrescriptionDetails {
  prescription: {
    id: number;
    status: string;
    total_cost: number;
    created_at: string;
    general_instructions: string;
    precautions: string;
  };
  items: MedicineItem[];
  total_amount: number;
  patient: {
    id: number;
    name: string;
    phone: string;
    dob: string;
  };
  doctor: {
    id: number;
    name: string;
  };
}

export default function DispensingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [notes, setNotes] = useState("");

  // Fetch prescription details
  const { data, isLoading } = useQuery<PrescriptionDetails>({
    queryKey: ["prescription-for-dispensing", id],
    queryFn: async () => {
      const response = await api.get(`/pharmacy/prescriptions/${id}`);
      return response.data;
    },
  });

  // Dispense mutation
  const dispenseMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/pharmacy/dispense/${id}`, {
        payment_method: paymentMethod,
        notes: notes,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Bán thuốc thành công!");
      queryClient.invalidateQueries({ queryKey: ["pending-prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["pharmacy-stats-today"] });
      navigate("/pharmacist/pending");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi bán thuốc"
      );
    },
  });

  const handleSubmit = () => {
    if (!data) return;

    // Check if all medicines are available
    const unavailable = data.items.filter((item) => !item.available);
    if (unavailable.length > 0) {
      toast.error(
        `Không đủ thuốc: ${unavailable.map((i) => i.medicine_name).join(", ")}`
      );
      return;
    }

    if (window.confirm("Xác nhận bán thuốc và thu tiền?")) {
      dispenseMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy đơn thuốc</p>
      </div>
    );
  }

  const allAvailable = data.items.every((item) => item.available);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bán Thuốc & Thu Tiền
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Đơn thuốc #{data.prescription.id}
          </p>
        </div>
        <button
          onClick={() => navigate("/pharmacist/pending")}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          ← Quay lại
        </button>
      </div>

      {/* Patient & Doctor Info */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Thông Tin Bệnh Nhân
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="mb-3">
              <span className="text-sm text-gray-500">Họ tên:</span>
              <p className="text-base font-medium text-gray-900">
                {data.patient.name}
              </p>
            </div>
            <div className="mb-3">
              <span className="text-sm text-gray-500">Số điện thoại:</span>
              <p className="text-base font-medium text-gray-900">
                {data.patient.phone}
              </p>
            </div>
          </div>
          <div>
            <div className="mb-3">
              <span className="text-sm text-gray-500">Bác sĩ kê đơn:</span>
              <p className="text-base font-medium text-gray-900">
                {data.doctor.name}
              </p>
            </div>
            <div className="mb-3">
              <span className="text-sm text-gray-500">Ngày kê đơn:</span>
              <p className="text-base font-medium text-gray-900">
                {format(
                  new Date(data.prescription.created_at),
                  "dd/MM/yyyy HH:mm"
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Medicine List */}
      <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Danh Sách Thuốc ({data.items.length} loại)
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {data.items.map((item) => (
              <div
                key={item.id}
                className={`border rounded-lg p-4 ${
                  item.available
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.medicine_name}
                      </h3>
                      {item.strength && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {item.strength}
                        </span>
                      )}
                      {item.available ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          ✓ Đủ hàng
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                          ✗ Không đủ
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Liều dùng:</span>
                        <p className="font-medium text-gray-900">
                          {item.dosage}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Tần suất:</span>
                        <p className="font-medium text-gray-900">
                          {item.frequency}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Thời gian:</span>
                        <p className="font-medium text-gray-900">
                          {item.duration}
                        </p>
                      </div>
                    </div>

                    {item.instructions && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">Hướng dẫn:</span>
                        <p className="text-gray-700 italic">
                          {item.instructions}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="ml-6 text-right">
                    <div className="mb-2">
                      <span className="text-sm text-gray-500">Số lượng:</span>
                      <p className="text-lg font-bold text-gray-900">
                        {item.quantity}
                      </p>
                    </div>
                    <div className="mb-2">
                      <span className="text-sm text-gray-500">Tồn kho:</span>
                      <p
                        className={`text-lg font-bold ${
                          item.available ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {item.in_stock}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-300">
                      <p className="text-xl font-bold text-gray-900">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.total_price)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      {data.prescription.general_instructions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Hướng dẫn chung:
          </h3>
          <p className="text-sm text-blue-800">
            {data.prescription.general_instructions}
          </p>
        </div>
      )}

      {data.prescription.precautions && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-yellow-900 mb-2">
            ⚠️ Lưu ý:
          </h3>
          <p className="text-sm text-yellow-800">
            {data.prescription.precautions}
          </p>
        </div>
      )}

      {/* Payment Section */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thanh Toán</h2>

        <div className="space-y-4">
          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phương thức thanh toán
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="cash">Tiền mặt</option>
              <option value="card">Thẻ</option>
              <option value="transfer">Chuyển khoản</option>
              <option value="insurance">Bảo hiểm</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Ghi chú thêm về giao dịch..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Total Amount */}
          <div className="border-t border-gray-300 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">
                Tổng tiền:
              </span>
              <span className="text-3xl font-bold text-green-600">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(data.total_amount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4">
        <button
          onClick={() => navigate("/pharmacist/pending")}
          className="px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
        >
          Hủy
        </button>
        <button
          onClick={handleSubmit}
          disabled={!allAvailable || dispenseMutation.isPending}
          className={`px-8 py-3 text-sm font-medium rounded-lg text-white transition-colors ${
            allAvailable && !dispenseMutation.isPending
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {dispenseMutation.isPending ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Đang xử lý...
            </span>
          ) : (
            "Xác Nhận Bán & Thu Tiền"
          )}
        </button>
      </div>

      {/* Warning if not all available */}
      {!allAvailable && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-800">
              <strong>Không thể bán:</strong> Một số thuốc không đủ số lượng
              trong kho. Vui lòng nhập thêm hoặc liên hệ quản lý kho.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
