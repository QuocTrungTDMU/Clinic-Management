import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/axios";
import { toast } from "react-hot-toast";

interface Transaction {
  id: number;
  prescription_id: number;
  patient_name: string;
  patient_phone: string;
  total_amount: number;
  payment_method: string;
  paid_amount: number;
  change_amount: number;
  dispensed_by: string;
  dispensed_at: string;
  items: {
    medicine_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }[];
}

interface TransactionsResponse {
  data: Transaction[];
}

export function TransactionsPage() {
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Last 7 days
    return date.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");

  const { data, isLoading } = useQuery<TransactionsResponse>({
    queryKey: ["pharmacy-transactions", dateFrom, dateTo],
    queryFn: async () => {
      const response = await apiClient.get("/pharmacy/transactions", {
        params: { from_date: dateFrom, to_date: dateTo },
      });
      return response.data;
    },
  });

  const transactions = data?.data || [];

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.patient_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.patient_phone.includes(searchTerm);
    const matchesPayment =
      selectedPaymentMethod === "all" ||
      transaction.payment_method === selectedPaymentMethod;
    return matchesSearch && matchesPayment;
  });

  // Calculate totals
  const totalRevenue = filteredTransactions.reduce(
    (sum, t) => sum + parseFloat(t.total_amount.toString()),
    0
  );
  const cashRevenue = filteredTransactions
    .filter((t) => t.payment_method === "cash")
    .reduce((sum, t) => sum + parseFloat(t.total_amount.toString()), 0);
  const transferRevenue = filteredTransactions
    .filter((t) => t.payment_method === "transfer")
    .reduce((sum, t) => sum + parseFloat(t.total_amount.toString()), 0);

  const handlePrintReceipt = async (transactionId: number) => {
    try {
      const response = await apiClient.get(
        `/pharmacy/receipt/${transactionId}`
      );
      const receiptData = response.data;

      // Open print window
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Please allow popups to print receipt");
        return;
      }

      printWindow.document.write(generateReceiptHTML(receiptData));
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      console.error("Failed to print receipt:", error);
      toast.error("Failed to load receipt");
    }
  };

  const generateReceiptHTML = (data: any) => {
    const { transaction, clinic_info, print_date } = data;

    const itemsHTML = transaction.prescription.items
      .map((item: any, index: number) => {
        return `
        <tr>
          <td>${index + 1}</td>
          <td>${item.medicine_name}${
          item.strength ? ` (${item.strength})` : ""
        }</td>
          <td>${item.quantity_dispensed || item.quantity}</td>
          <td>${Number(item.unit_price).toLocaleString("vi-VN")}đ</td>
          <td>${Number(item.total_price).toLocaleString("vi-VN")}đ</td>
        </tr>
      `;
      })
      .join("");

    const paymentInfoHTML =
      transaction.payment_method === "cash" && transaction.paid_amount
        ? `
      <tr>
        <td colspan="4" style="text-align: right;">Tiền khách đưa:</td>
        <td>${Number(transaction.paid_amount).toLocaleString("vi-VN")}đ</td>
      </tr>
      <tr>
        <td colspan="4" style="text-align: right;">Tiền thừa:</td>
        <td>${Number(transaction.change_amount || 0).toLocaleString(
          "vi-VN"
        )}đ</td>
      </tr>
    `
        : "";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${transaction.id}</title>
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
          <h1>${clinic_info.name || "Clinic Management System"}</h1>
          <p>${clinic_info.address || ""}</p>
          <p>Tel: ${clinic_info.phone || ""} | Email: ${
      clinic_info.email || ""
    }</p>
        </div>
        
        <h2 style="text-align: center;">PHIẾU PHÁT THUỐC</h2>
        
        <div class="info">
          <p><strong>Số hóa đơn:</strong> #${transaction.id}</p>
          <p><strong>Ngày:</strong> ${new Date(
            transaction.transaction_date
          ).toLocaleString("vi-VN")}</p>
          <p><strong>Bệnh nhân:</strong> ${transaction.patient.name}</p>
          <p><strong>Số điện thoại:</strong> ${
            transaction.patient.phone || "N/A"
          }</p>
          <p><strong>Dược sĩ:</strong> ${transaction.pharmacist.name}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên thuốc</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
          <tfoot>
            <tr class="total">
              <td colspan="4" style="text-align: right;">Tổng cộng:</td>
              <td>${Number(transaction.total_amount).toLocaleString(
                "vi-VN"
              )}đ</td>
            </tr>
            ${paymentInfoHTML}
          </tfoot>
        </table>
        
        <div class="footer">
          <p>Cảm ơn quý khách! Chúc quý khách sức khỏe!</p>
          <p style="font-size: 0.8em;">In lúc: ${print_date}</p>
        </div>
      </body>
      </html>
    `;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Lịch Sử Phát Thuốc
          </h1>
          <p className="text-gray-600 mt-1">
            Xem lịch sử các lần phát thuốc cho bệnh nhân
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Patient
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name or phone..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold mt-2">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-blue-100 text-sm mt-2">
            {filteredTransactions.length} transaction(s)
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Cash Payment</p>
              <p className="text-3xl font-bold mt-2">
                {formatCurrency(cashRevenue)}
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">
                Transfer Payment
              </p>
              <p className="text-3xl font-bold mt-2">
                {formatCurrency(transferRevenue)}
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading transactions...</p>
              </div>
            </div>
          ) : filteredTransactions.length === 0 ? (
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No transactions found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters or date range.
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dispensed By
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(transaction.dispensed_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.patient_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.patient_phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {transaction.items.map((item, index) => (
                          <div key={index} className="mb-1">
                            {item.medicine_name} × {item.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.payment_method === "cash"
                            ? "bg-green-100 text-green-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {transaction.payment_method === "cash"
                          ? "Cash"
                          : "Transfer"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(transaction.total_amount)}
                      </div>
                      {transaction.payment_method === "cash" && (
                        <div className="text-xs text-gray-500">
                          Paid: {formatCurrency(transaction.paid_amount)} |
                          Change: {formatCurrency(transaction.change_amount)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.dispensed_by}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handlePrintReceipt(transaction.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg
                          className="w-4 h-4 mr-1.5"
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
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
