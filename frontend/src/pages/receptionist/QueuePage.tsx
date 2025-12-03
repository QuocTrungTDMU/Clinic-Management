import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  QueueListIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import api from "../../lib/axios";

interface QueueItem {
  id: number;
  patient_name: string;
  doctor_name: string;
  appointment_datetime: string;
  status:
    | "scheduled"
    | "checked_in"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "no_show";
  appointment_type: string;
  reason?: string;
  wait_time: number; // minutes since check-in
  estimated_time?: string;
}

interface QueueStats {
  waiting: number;
  in_progress: number;
  completed: number;
  total: number;
}

const QueuePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedAppointment, setSelectedAppointment] = useState<number | null>(
    null
  );

  // Fetch today's queue
  const {
    data: queueItems = [],
    isLoading,
    refetch,
  } = useQuery<QueueItem[]>({
    queryKey: ["queue", "today"],
    queryFn: async () => {
      const response = await api.get("/queue/today");
      return response.data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds (faster updates)
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });

  // Calculate queue statistics
  const queueStats: QueueStats = React.useMemo(() => {
    return queueItems.reduce(
      (stats, item) => {
        switch (item.status) {
          case "checked_in":
            stats.waiting++;
            break;
          case "in_progress":
            stats.in_progress++;
            break;
          case "completed":
            stats.completed++;
            break;
        }
        stats.total = queueItems.length;
        return stats;
      },
      { waiting: 0, in_progress: 0, completed: 0, total: 0 }
    );
  }, [queueItems]);

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      const response = await api.post(`/queue/checkin/${appointmentId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      refetch();
      toast.success("Check-in thành công!");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Có lỗi xảy ra khi check-in");
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      appointmentId,
      status,
    }: {
      appointmentId: number;
      status: string;
    }) => {
      const response = await api.put(`/queue/status/${appointmentId}`, {
        status,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      refetch();
      toast.success("Cập nhật trạng thái thành công!");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái"
      );
    },
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "scheduled":
        return {
          color: "bg-gray-100 text-gray-800",
          icon: ClockIcon,
          text: "Chưa check-in",
          action: "Check-in",
        };
      case "checked_in":
        return {
          color: "bg-yellow-100 text-yellow-800",
          icon: ClockIcon,
          text: "Đang chờ",
          action: "Bắt đầu khám",
        };
      case "in_progress":
        return {
          color: "bg-blue-100 text-blue-800",
          icon: PlayIcon,
          text: "Đang khám",
          action: "Hoàn thành",
        };
      case "completed":
        return {
          color: "bg-green-100 text-green-800",
          icon: CheckCircleIcon,
          text: "Hoàn thành",
          action: null,
        };
      case "cancelled":
        return {
          color: "bg-red-100 text-red-800",
          icon: XCircleIcon,
          text: "Đã hủy",
          action: null,
        };
      case "no_show":
        return {
          color: "bg-red-100 text-red-800",
          icon: ExclamationTriangleIcon,
          text: "Không đến",
          action: null,
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          icon: ClockIcon,
          text: status,
          action: null,
        };
    }
  };

  const handleStatusChange = (appointmentId: number, newStatus: string) => {
    updateStatusMutation.mutate({ appointmentId, status: newStatus });
  };

  const handleCheckIn = (appointmentId: number) => {
    checkInMutation.mutate(appointmentId);
  };

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getWaitTimeDisplay = (waitTime: number) => {
    if (waitTime === 0) return "-";
    const hours = Math.floor(waitTime / 60);
    const minutes = waitTime % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Quản Lý Hàng Đợi
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Theo dõi và quản lý hàng đợi bệnh nhân trong ngày
          </p>
        </div>

        {/* Queue Statistics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <QueueListIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tổng số lịch hẹn
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {queueStats.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Đang chờ khám
                    </dt>
                    <dd className="text-lg font-medium text-yellow-600">
                      {queueStats.waiting}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <PlayIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Đang khám
                    </dt>
                    <dd className="text-lg font-medium text-blue-600">
                      {queueStats.in_progress}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Đã hoàn thành
                    </dt>
                    <dd className="text-lg font-medium text-green-600">
                      {queueStats.completed}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Queue List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Hàng Đợi Hôm Nay
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Danh sách bệnh nhân và trạng thái khám bệnh
            </p>
          </div>

          {queueItems.length === 0 ? (
            <div className="text-center py-12">
              <QueueListIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Không có lịch hẹn
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Chưa có lịch hẹn nào trong hôm nay.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {queueItems.map((item) => {
                const statusInfo = getStatusInfo(item.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <li key={item.id} className="px-4 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="flex-shrink-0">
                          <UserIcon className="h-10 w-10 text-gray-400" />
                        </div>
                        <div className="ml-4 min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.patient_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                Bác sĩ {item.doctor_name} •{" "}
                                {formatTime(item.appointment_datetime)}
                              </p>
                              {item.reason && (
                                <p className="text-sm text-gray-400 mt-1">
                                  {item.reason}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="text-sm text-gray-500">
                                  Thời gian chờ
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {getWaitTimeDisplay(item.wait_time)}
                                </p>
                              </div>
                              <div className="flex items-center">
                                <StatusIcon className="h-4 w-4 mr-1" />
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                                >
                                  {statusInfo.text}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="ml-6 flex space-x-2">
                        {item.status === "scheduled" && (
                          <button
                            onClick={() => handleCheckIn(item.id)}
                            disabled={checkInMutation.isPending}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            Check-in
                          </button>
                        )}

                        {item.status === "checked_in" && (
                          <button
                            onClick={() =>
                              handleStatusChange(item.id, "in_progress")
                            }
                            disabled={updateStatusMutation.isPending}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            Bắt đầu khám
                          </button>
                        )}

                        {item.status === "in_progress" && (
                          <button
                            onClick={() =>
                              handleStatusChange(item.id, "completed")
                            }
                            disabled={updateStatusMutation.isPending}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                          >
                            Hoàn thành
                          </button>
                        )}

                        {(item.status === "scheduled" ||
                          item.status === "checked_in") && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusChange(item.id, "cancelled")
                              }
                              disabled={updateStatusMutation.isPending}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(item.id, "no_show")
                              }
                              disabled={updateStatusMutation.isPending}
                              className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                              Không đến
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueuePage;
