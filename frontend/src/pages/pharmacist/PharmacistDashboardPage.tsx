import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";

interface PharmacyStats {
  pending_prescriptions: number;
  dispensed_today: number;
  revenue_today: number;
  low_stock_medicines: number;
}

export default function PharmacistDashboardPage() {
  const { data: stats, isLoading } = useQuery<PharmacyStats>({
    queryKey: ["pharmacy-stats-today"],
    queryFn: async () => {
      const response = await api.get("/pharmacy/stats/today");
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30s
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Đơn Thuốc Chờ",
      value: stats?.pending_prescriptions || 0,
      icon: "📋",
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Đã Bán Hôm Nay",
      value: stats?.dispensed_today || 0,
      icon: "✅",
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Doanh Thu Hôm Nay",
      value: new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(stats?.revenue_today || 0),
      icon: "💰",
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Thuốc Sắp Hết",
      value: stats?.low_stock_medicines || 0,
      icon: "⚠️",
      color: "bg-red-500",
      textColor: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Dược Sĩ</h1>
        <p className="mt-2 text-sm text-gray-600">
          Tổng quan hoạt động phòng thuốc hôm nay
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.bgColor} rounded-md p-3`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.title}
                    </dt>
                    <dd className={`text-2xl font-bold ${stat.textColor}`}>
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Thao Tác Nhanh
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <a
              href="/pharmacist/pending"
              className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
            >
              <div className="flex-shrink-0">
                <span className="text-3xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  Xem Đơn Thuốc Chờ
                </p>
                <p className="text-xs text-gray-500">
                  {stats?.pending_prescriptions || 0} đơn đang chờ
                </p>
              </div>
            </a>

            <a
              href="/pharmacist/inventory"
              className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <div className="flex-shrink-0">
                <span className="text-3xl">📦</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  Quản Lý Kho Thuốc
                </p>
                <p className="text-xs text-gray-500">Kiểm tra tồn kho</p>
              </div>
            </a>

            <a
              href="/pharmacist/transactions"
              className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all"
            >
              <div className="flex-shrink-0">
                <span className="text-3xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  Lịch Sử Bán Hàng
                </p>
                <p className="text-xs text-gray-500">Xem doanh thu</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {stats && stats.low_stock_medicines > 0 && (
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Cảnh báo:</strong> Có {stats.low_stock_medicines} loại
                thuốc sắp hết trong kho. Vui lòng kiểm tra và nhập thêm.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
