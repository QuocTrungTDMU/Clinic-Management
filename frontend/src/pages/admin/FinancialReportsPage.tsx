import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "../../lib/auth";
import { apiClient } from "../../lib/axios";

interface Transaction {
  id: number;
  patient_id: number;
  doctor_id: number;
  consultation_fee: number;
  medication_cost: number;
  lab_test_cost: number;
  total_amount: number;
  payment_method: string;
  paid_at: string;
  status: string;
  patient: {
    id: number;
    name: string;
    phone: string;
  };
  doctor: {
    id: number;
    name: string;
  };
  processedBy: {
    id: number;
    name: string;
  } | null;
}

interface RevenueData {
  total_revenue: number;
  consultation_revenue: number;
  medication_revenue: number;
  lab_test_revenue: number;
  transactions_count: number;
  average_transaction: number;
  transactions: Transaction[];
  by_date: Record<
    string,
    {
      revenue: number;
      count: number;
    }
  >;
  by_payment_method: Record<
    string,
    {
      revenue: number;
      count: number;
    }
  >;
}

export function FinancialReportsPage() {
  const today = new Date().toISOString().split("T")[0];
  const firstDayOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  )
    .toISOString()
    .split("T")[0];

  const [fromDate, setFromDate] = useState(firstDayOfMonth);
  const [toDate, setToDate] = useState(today);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: authService.me,
  });

  // Fetch revenue data
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ["admin-revenue", fromDate, toDate, paymentMethodFilter],
    queryFn: async () => {
      const response = await apiClient.get("/billing/admin-revenue", {
        params: {
          from_date: fromDate,
          to_date: toDate,
          payment_method:
            paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
        },
      });

      return response.data;
    },
  });

  const revenue: RevenueData = revenueData || {
    total_revenue: 0,
    consultation_revenue: 0,
    medication_revenue: 0,
    lab_test_revenue: 0,
    transactions_count: 0,
    average_transaction: 0,
    transactions: [],
    by_date: {},
    by_payment_method: {},
  };

  const transactions: Transaction[] = revenueData?.transactions || [];

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Financial Reports
                </h1>
                <p className="text-gray-500 mt-1">
                  Revenue and transaction analytics
                </p>
              </div>
            </div>

            {/* Date Range Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="transfer">Transfer</option>
                  <option value="insurance">Insurance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Revenue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-green-600"
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
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(revenue.total_revenue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-blue-600"
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
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total Transactions
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {revenue.transactions_count}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Average Transaction
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(revenue.average_transaction)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue by Payment Method */}
          {Object.keys(revenue.by_payment_method).length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Revenue by Payment Method
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {Object.entries(revenue.by_payment_method).map(
                    ([method, data]) => (
                      <div key={method} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-500 capitalize">
                            {method}
                          </span>
                          <span className="text-xs text-gray-400">
                            {data.count} trans
                          </span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(data.revenue)}
                        </p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (data.revenue / revenue.total_revenue) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {(
                            (data.revenue / revenue.total_revenue) *
                            100
                          ).toFixed(1)}
                          % of total
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Detailed Transactions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Transaction Details ({transactions.length} transactions)
              </h3>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No transactions found for selected filters
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
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
                        Staff
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions
                      .sort(
                        (a, b) =>
                          new Date(b.paid_at).getTime() -
                          new Date(a.paid_at).getTime()
                      )
                      .map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(transaction.paid_at).toLocaleDateString(
                                "vi-VN"
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(transaction.paid_at).toLocaleTimeString(
                                "vi-VN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.patient.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {transaction.patient.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div>
                                Consultation:{" "}
                                {formatCurrency(transaction.consultation_fee)}
                              </div>
                              <div>
                                Medication:{" "}
                                {formatCurrency(transaction.medication_cost)}
                              </div>
                              {transaction.lab_test_cost > 0 && (
                                <div>
                                  Lab Tests:{" "}
                                  {formatCurrency(transaction.lab_test_cost)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                              {transaction.payment_method}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-green-600">
                              {formatCurrency(transaction.total_amount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {transaction.processedBy?.name || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleViewDetails(transaction)}
                              className="text-blue-600 hover:text-blue-900 text-xs bg-blue-100 px-2 py-1 rounded"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Daily Revenue Breakdown */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Daily Revenue Breakdown
              </h3>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : Object.keys(revenue.by_date).length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No transactions found for selected date range
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transactions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Average
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(revenue.by_date)
                      .sort(
                        ([dateA], [dateB]) =>
                          new Date(dateB).getTime() - new Date(dateA).getTime()
                      )
                      .map(([date, data]) => (
                        <tr key={date} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {new Date(date).toLocaleDateString("vi-VN", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {data.count} transactions
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                            {formatCurrency(data.revenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(data.revenue / data.count)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        TOTAL
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {revenue.transactions_count} transactions
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                        {formatCurrency(revenue.total_revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {formatCurrency(revenue.average_transaction)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop đen mờ + blur */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDetailsModal(false)}
          />

          {/* Modal content */}
          <div className="relative bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-white px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Invoice Details #{selectedTransaction.id}
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>

            {/* Transaction Info */}
            <div className="px-6 py-4 mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">📋</span> Payment Information
              </h4>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Payment Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(selectedTransaction.paid_at).toLocaleString(
                      "vi-VN"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                    {selectedTransaction.payment_method}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Processed By</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedTransaction.processedBy?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                    {selectedTransaction.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="px-6 mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-green-600">👤</span> Patient Information
              </h4>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedTransaction.patient.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedTransaction.patient.phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Doctor</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedTransaction.doctor.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="px-6 mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">💰</span> Cost Breakdown
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Consultation Fee
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(selectedTransaction.consultation_fee)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Medication Cost</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(selectedTransaction.medication_cost)}
                  </span>
                </div>
                {selectedTransaction.lab_test_cost > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Lab Test Cost</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(selectedTransaction.lab_test_cost)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-3 mt-3 flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-900">
                    Total Amount
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(selectedTransaction.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
