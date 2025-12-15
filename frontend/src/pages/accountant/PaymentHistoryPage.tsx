import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

interface PaymentHistory {
  data: Array<{
    id: number;
    total_amount: number;
    amount_paid: number;
    change_amount: number;
    payment_method: string;
    status: string;
    paid_at: string;
    created_at: string;
    patient: {
      id: number;
      name: string;
      phone: string;
    };
    doctor: {
      id: number;
      name: string;
    };
    processedBy?: {
      id: number;
      name: string;
    };
  }>;
  current_page: number;
  last_page: number;
  total: number;
}

export default function PaymentHistoryPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch payment history
  const { data, isLoading } = useQuery<PaymentHistory>({
    queryKey: ["payment-history", statusFilter, searchTerm, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);
      params.append("page", currentPage.toString());

      const response = await api.get(`/billing/payment-history?${params}`);
      return response.data;
    },
  });

  const handlePrintReceipt = async (invoiceId: number) => {
    try {
      const response = await api.get(`/billing/receipt/${invoiceId}`);
      const receiptData = response.data;

      // Open print window
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Vui lòng cho phép popup để in hóa đơn");
        return;
      }

      printWindow.document.write(generateReceiptHTML(receiptData));
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      console.error("Failed to print receipt:", error);
      toast.error("Không thể tải hóa đơn");
    }
  };

  const generateReceiptHTML = (data: any) => {
    const { invoice, clinic_info, print_date } = data;

    // Build service items
    const servicesHTML = `
      <tr>
        <td>1</td>
        <td>Phí khám bệnh</td>
        <td>1</td>
        <td>${Number(invoice.consultation_fee).toLocaleString("vi-VN")}đ</td>
        <td>${Number(invoice.consultation_fee).toLocaleString("vi-VN")}đ</td>
      </tr>
      ${
        invoice.medication_cost > 0
          ? `
      <tr>
        <td>2</td>
        <td>Tiền thuốc</td>
        <td>1</td>
        <td>${Number(invoice.medication_cost).toLocaleString("vi-VN")}đ</td>
        <td>${Number(invoice.medication_cost).toLocaleString("vi-VN")}đ</td>
      </tr>
      `
          : ""
      }
      ${
        invoice.lab_test_cost > 0
          ? `
      <tr>
        <td>${invoice.medication_cost > 0 ? "3" : "2"}</td>
        <td>Phí xét nghiệm</td>
        <td>1</td>
        <td>${Number(invoice.lab_test_cost).toLocaleString("vi-VN")}đ</td>
        <td>${Number(invoice.lab_test_cost).toLocaleString("vi-VN")}đ</td>
      </tr>
      `
          : ""
      }
    `;

    const paymentInfoHTML =
      invoice.payment_method === "cash" && invoice.amount_paid
        ? `
      <tr>
        <td colspan="4" style="text-align: right;">Tiền khách đưa:</td>
        <td>${Number(invoice.amount_paid).toLocaleString("vi-VN")}đ</td>
      </tr>
      <tr>
        <td colspan="4" style="text-align: right;">Tiền thừa:</td>
        <td>${Number(invoice.change_amount || 0).toLocaleString("vi-VN")}đ</td>
      </tr>
    `
        : "";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hóa Đơn - ${invoice.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f0f0f0; }
          .total { font-weight: bold; font-size: 1.2em; }
          .footer { margin-top: 30px; text-align: center; font-size: 0.9em; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${clinic_info.name || "QTMedic Clinic"}</h1>
          <p>${clinic_info.address || ""}</p>
          <p>Tel: ${clinic_info.phone || ""} | Email: ${
      clinic_info.email || ""
    }</p>
        </div>
        
        <h2 style="text-align: center;">HÓA ĐƠN THANH TOÁN</h2>
        
        <div class="info">
          <p><strong>Số hóa đơn:</strong> #${invoice.id}</p>
          <p><strong>Ngày:</strong> ${new Date(
            invoice.paid_at || invoice.created_at
          ).toLocaleString("vi-VN")}</p>
          <p><strong>Bệnh nhân:</strong> ${invoice.patient.name}</p>
          <p><strong>Số điện thoại:</strong> ${
            invoice.patient.phone || "N/A"
          }</p>
          <p><strong>Bác sĩ khám:</strong> ${invoice.doctor.name}</p>
          <p><strong>Chẩn đoán:</strong> ${
            invoice.medical_record?.diagnosis || "N/A"
          }</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Dịch vụ</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${servicesHTML}
          </tbody>
          <tfoot>
            <tr class="total">
              <td colspan="4" style="text-align: right;">Tổng cộng:</td>
              <td>${Number(invoice.total_amount).toLocaleString("vi-VN")}đ</td>
            </tr>
            ${paymentInfoHTML}
          </tfoot>
        </table>
        
        <div style="margin-top: 20px;">
          <p><strong>Phương thức thanh toán:</strong> ${
            invoice.payment_method === "cash"
              ? "Tiền mặt"
              : invoice.payment_method === "vnpay"
              ? "VNPay"
              : "Chuyển khoản"
          }</p>
          <p><strong>Kế toán xử lý:</strong> ${
            invoice.processed_by?.name || "N/A"
          }</p>
        </div>
        
        <div class="footer">
          <p>Cảm ơn quý khách! Chúc quý khách sức khỏe!</p>
          <p style="font-size: 0.8em;">In lúc: ${print_date}</p>
        </div>
      </body>
      </html>
    `;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: "💵 Tiền mặt",
      bank_transfer: "🏦 Chuyển khoản",
      credit_card: "💳 Thẻ tín dụng",
    };
    return labels[method] || method;
  };

  const getStatusBadge = (status: string) => {
    if (status === "paid") {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
          ✓ Đã thanh toán
        </span>
      );
    } else if (status === "pending") {
      return (
        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
          ⏳ Chờ thanh toán
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
          ✗ Đã hủy
        </span>
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Lịch Sử Thanh Toán
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Xem tất cả các giao dịch thanh toán
          </p>
        </div>
        <Link
          to="/accountant/dashboard"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          ← Quay lại Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="paid">Đã thanh toán</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tên bệnh nhân hoặc số điện thoại..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Danh Sách Giao Dịch
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Tổng: {data?.total || 0} giao dịch
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : data && data.data.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã HĐ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bệnh Nhân
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bác Sĩ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng Tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phương Thức
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng Thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày TT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kế Toán
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{item.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.patient.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.patient.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.doctor.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(item.total_amount)}
                        </div>
                        {item.status === "paid" && item.change_amount > 0 && (
                          <div className="text-xs text-gray-500">
                            Thừa:{" "}
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.change_amount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getPaymentMethodLabel(item.payment_method)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.paid_at
                          ? format(new Date(item.paid_at), "dd/MM/yyyy HH:mm")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.processedBy?.name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.status === "paid" && (
                          <button
                            onClick={() => handlePrintReceipt(item.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                              />
                            </svg>
                            In
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.last_page > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Trang {data.current_page} / {data.last_page}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={data.current_page === 1}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Trước
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(data.last_page, prev + 1)
                      )
                    }
                    disabled={data.current_page === data.last_page}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau →
                  </button>
                </div>
              </div>
            )}
          </>
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
            <p className="mt-4 text-gray-500">Không có giao dịch nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
