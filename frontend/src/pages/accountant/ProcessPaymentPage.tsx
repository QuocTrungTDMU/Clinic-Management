import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface InvoiceDetails {
  id: number;
  total_amount: number;
  consultation_fee: number;
  medication_cost: number;
  lab_test_cost: number;
  status: string;
  created_at: string;
  patient: {
    id: number;
    name: string;
    phone: string;
    dob: string;
    gender: string;
    address?: string;
  };
  doctor: {
    id: number;
    name: string;
  };
  appointment: {
    id: number;
    appointment_datetime: string;
    reason?: string;
  };
  medicalRecord?: {
    id: number;
    diagnosis: string;
    doctor_notes?: string;
  };
  prescription?: {
    id: number;
    prescription_items: Array<{
      id: number;
      medicine_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
  };
}

export default function ProcessPaymentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [amountPaid, setAmountPaid] = useState<string>("");
  const [isProcessingVNPay, setIsProcessingVNPay] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Fetch invoice details
  const { data: invoice, isLoading } = useQuery<InvoiceDetails>({
    queryKey: ["invoice-details", id],
    queryFn: async () => {
      const response = await api.get(`/billing/invoices/${id}`);
      return response.data;
    },
  });

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(
        `/billing/invoices/${id}/process-payment`,
        {
          payment_method: "cash",
          amount_paid: parseFloat(amountPaid),
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Thu tiền thành công!");
      queryClient.invalidateQueries({ queryKey: ["pending-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["billing-statistics"] });
      navigate("/accountant/dashboard");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi thu tiền"
      );
    },
  });

  const handleVNPayPayment = async () => {
    if (!invoice) return;

    setIsProcessingVNPay(true);
    try {
      const returnUrl = `${window.location.origin}/accountant/vnpay-return?invoice_id=${id}`;
      const response = await api.post(`/vnpay/create-payment/${id}`, {
        return_url: returnUrl,
      });

      // Redirect to VNPay payment page
      window.location.href = response.data.payment_url;
    } catch (error: unknown) {
      setIsProcessingVNPay(false);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Không thể tạo thanh toán VNPay"
      );
    }
  };

  const handleOpenPaymentModal = () => {
    if (!invoice) return;
    setShowPaymentModal(true);
  };

  const handleConfirmCashPayment = () => {
    if (!invoice) return;

    const paid = parseFloat(amountPaid);
    if (!paid || paid <= 0) {
      toast.error("Vui lòng nhập số tiền thanh toán");
      return;
    }

    if (paid < invoice.total_amount) {
      toast.error("Số tiền thanh toán không đủ");
      return;
    }

    setShowPaymentModal(false);
    processPaymentMutation.mutate();
  };

  const handleConfirmVNPayPayment = () => {
    setShowPaymentModal(false);
    handleVNPayPayment();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy hóa đơn</p>
      </div>
    );
  }

  const paid = parseFloat(amountPaid) || 0;
  const change = paid - invoice.total_amount;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thu Tiền</h1>
          <p className="mt-2 text-sm text-gray-600">Hóa đơn #{invoice.id}</p>
        </div>
        <button
          onClick={() => navigate("/accountant/dashboard")}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          ← Quay lại
        </button>
      </div>

      {/* Patient Info */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Thông Tin Bệnh Nhân
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="mb-3">
              <span className="text-sm text-gray-500">Họ tên:</span>
              <p className="text-base font-medium text-gray-900">
                {invoice.patient.name}
              </p>
            </div>
            <div className="mb-3">
              <span className="text-sm text-gray-500">Số điện thoại:</span>
              <p className="text-base font-medium text-gray-900">
                {invoice.patient.phone}
              </p>
            </div>
            <div className="mb-3">
              <span className="text-sm text-gray-500">Ngày sinh:</span>
              <p className="text-base font-medium text-gray-900">
                {format(new Date(invoice.patient.dob), "dd/MM/yyyy")}
              </p>
            </div>
          </div>
          <div>
            <div className="mb-3">
              <span className="text-sm text-gray-500">Bác sĩ khám:</span>
              <p className="text-base font-medium text-gray-900">
                {invoice.doctor.name}
              </p>
            </div>
            <div className="mb-3">
              <span className="text-sm text-gray-500">Ngày khám:</span>
              <p className="text-base font-medium text-gray-900">
                {format(
                  new Date(invoice.appointment.appointment_datetime),
                  "dd/MM/yyyy HH:mm"
                )}
              </p>
            </div>
            {invoice.medicalRecord?.diagnosis && (
              <div className="mb-3">
                <span className="text-sm text-gray-500">Chẩn đoán:</span>
                <p className="text-base font-medium text-gray-900">
                  {invoice.medicalRecord.diagnosis}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Breakdown */}
      <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Chi Tiết Hóa Đơn
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {/* Consultation Fee */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-700 font-medium">Phí khám bệnh</span>
              <span className="text-lg font-semibold text-gray-900">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(invoice.consultation_fee)}
              </span>
            </div>

            {/* Medication Cost */}
            {invoice.medication_cost > 0 && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <span className="text-gray-700 font-medium">Tiền thuốc</span>
                  {invoice.prescription &&
                    invoice.prescription.prescription_items && (
                      <p className="text-sm text-gray-500 mt-1">
                        {invoice.prescription.prescription_items.length} loại
                        thuốc
                      </p>
                    )}
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(invoice.medication_cost)}
                </span>
              </div>
            )}

            {/* Lab Test Cost */}
            {invoice.lab_test_cost > 0 && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-700 font-medium">
                  Phí xét nghiệm
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(invoice.lab_test_cost)}
                </span>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between py-4 border-t-2 border-gray-300">
              <span className="text-xl font-bold text-gray-900">Tổng cộng</span>
              <span className="text-3xl font-bold text-green-600">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(invoice.total_amount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Medicine List (if exists) */}
      {invoice.prescription &&
        invoice.prescription.prescription_items &&
        invoice.prescription.prescription_items.length > 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Danh Sách Thuốc Đã Kê
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {invoice.prescription.prescription_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.medicine_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Số lượng: {item.quantity}
                      </p>
                    </div>
                    <span className="text-gray-900 font-medium">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.total_price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      {/* Payment Section - Amount Input for Cash */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Chuẩn Bị Thanh Toán
        </h2>

        <div className="space-y-4">
          {/* Amount Paid Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tiền khách đưa (nếu thanh toán tiền mặt)
            </label>
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="Nhập số tiền khách đưa..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
            />
            <p className="mt-2 text-sm text-gray-500">
              💡 Nhập số tiền trước khi chọn thanh toán tiền mặt
            </p>
          </div>

          {/* Change Calculation Preview */}
          {paid > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">Tổng tiền:</span>
                <span className="text-lg font-semibold text-gray-900">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(invoice.total_amount)}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">Khách đưa:</span>
                <span className="text-lg font-semibold text-gray-900">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(paid)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-300">
                <span className="text-lg font-bold text-gray-900">
                  Tiền thừa trả lại:
                </span>
                <span
                  className={`text-2xl font-bold ${
                    change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(Math.max(0, change))}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4">
        <button
          onClick={() => navigate("/accountant/dashboard")}
          className="px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
        >
          Hủy
        </button>
        <button
          onClick={handleOpenPaymentModal}
          disabled={processPaymentMutation.isPending || isProcessingVNPay}
          className="px-8 py-3 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          Tiến Hành Thanh Toán →
        </button>
      </div>

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowPaymentModal(false)}
          />
          <div className="relative bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Chọn Phương Thức Thanh Toán
              </h3>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 font-medium">
                      Tổng tiền:
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(invoice.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Cash Payment Option */}
                <button
                  onClick={handleConfirmCashPayment}
                  disabled={!amountPaid || paid < invoice.total_amount}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    amountPaid && paid >= invoice.total_amount
                      ? "border-green-500 bg-green-50 hover:bg-green-100"
                      : "border-gray-300 bg-gray-50 cursor-not-allowed opacity-60"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl">💵</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-900">
                        Tiền Mặt
                      </p>
                      <p className="text-sm text-gray-600">
                        {amountPaid && paid >= invoice.total_amount
                          ? `Khách đưa: ${new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(paid)} | Thừa: ${new Intl.NumberFormat(
                              "vi-VN",
                              {
                                style: "currency",
                                currency: "VND",
                              }
                            ).format(change)}`
                          : "Vui lòng nhập số tiền khách đưa ở trên"}
                      </p>
                    </div>
                  </div>
                </button>

                {/* VNPay Payment Option */}
                <button
                  onClick={handleConfirmVNPayPayment}
                  className="w-full p-4 border-2 border-blue-500 bg-blue-50 rounded-lg text-left hover:bg-blue-100 transition-all"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl">🏦</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-900">
                        Chuyển Khoản VNPay
                      </p>
                      <p className="text-sm text-gray-600">
                        Thanh toán qua ngân hàng hoặc ví điện tử
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
