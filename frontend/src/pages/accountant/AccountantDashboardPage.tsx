import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import { format } from "date-fns";

interface BillingInvoice {
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
}

interface Statistics {
  total_invoices: number;
  pending_invoices: number;
  paid_invoices: number;
  total_revenue: number;
  consultation_revenue: number;
  medication_revenue: number;
  lab_test_revenue: number;
}

export default function AccountantDashboardPage() {
  // Fetch pending invoices
  const { data: invoices, isLoading: loadingInvoices } = useQuery<
    BillingInvoice[]
  >({
    queryKey: ["pending-invoices"],
    queryFn: async () => {
      const response = await api.get("/billing/pending-invoices");
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30s
  });

  // Fetch statistics
  const { data: stats } = useQuery<Statistics>({
    queryKey: ["billing-statistics"],
    queryFn: async () => {
      const response = await api.get("/billing/statistics");
      return response.data;
    },
    refetchInterval: 60000, // Refresh every 60s
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bảng Điều Khiển Kế Toán
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Quản lý thu tiền và thanh toán hóa đơn
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chờ Thu Tiền</p>
              <p className="mt-2 text-3xl font-bold text-orange-600">
                {stats?.pending_invoices || 0}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <svg
                className="h-8 w-8 text-orange-600"
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
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Đã Thu Hôm Nay
              </p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {stats?.paid_invoices || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg
                className="h-8 w-8 text-green-600"
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
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Doanh Thu Khám
              </p>
              <p className="mt-2 text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  notation: "compact",
                }).format(stats?.consultation_revenue || 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg
                className="h-8 w-8 text-blue-600"
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
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tổng Doanh Thu
              </p>
              <p className="mt-2 text-2xl font-bold text-purple-600">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  notation: "compact",
                }).format(stats?.total_revenue || 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg
                className="h-8 w-8 text-purple-600"
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
        </div>
      </div>

      {/* Pending Invoices List */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Hóa Đơn Chờ Thu Tiền
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {invoices?.length || 0} hóa đơn đang chờ xử lý
            </p>
          </div>
          <Link
            to="/accountant/payment-history"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
          >
            Lịch Sử Thanh Toán →
          </Link>
        </div>

        <div className="p-6">
          {loadingInvoices ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : invoices && invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {invoice.patient.name}
                        </h3>
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                          Chờ thanh toán
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Số điện thoại:</span>
                          <p className="font-medium text-gray-900">
                            {invoice.patient.phone}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Bác sĩ:</span>
                          <p className="font-medium text-gray-900">
                            {invoice.doctor.name}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Ngày khám:</span>
                          <p className="font-medium text-gray-900">
                            {format(
                              new Date(
                                invoice.appointment.appointment_datetime
                              ),
                              "dd/MM/yyyy HH:mm"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                          Phí khám:{" "}
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(invoice.consultation_fee)}
                        </span>
                        <span>•</span>
                        <span>
                          Thuốc:{" "}
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(invoice.medication_cost)}
                        </span>
                        {invoice.lab_test_cost > 0 && (
                          <>
                            <span>•</span>
                            <span>
                              Xét nghiệm:{" "}
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(invoice.lab_test_cost)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="ml-6 text-right">
                      <div className="mb-3">
                        <span className="text-sm text-gray-500">
                          Tổng tiền:
                        </span>
                        <p className="text-2xl font-bold text-green-600">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(invoice.total_amount)}
                        </p>
                      </div>
                      <Link
                        to={`/accountant/process-payment/${invoice.id}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Thu Tiền →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              <p className="mt-4 text-gray-500">
                Không có hóa đơn chờ thanh toán
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
