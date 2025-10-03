import React from "react";
import {
  UserPlusIcon,
  CalendarDaysIcon,
  QueueListIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const ReceptionistDashboardPage: React.FC = () => {
  // Mock data - In real app, this would come from API
  const stats = [
    {
      name: "Bệnh nhân chờ khám",
      stat: "12",
      icon: ClockIcon,
      color: "bg-yellow-500",
      description: "Đang chờ trong hàng đợi",
    },
    {
      name: "Lịch hẹn hôm nay",
      stat: "28",
      icon: CalendarDaysIcon,
      color: "bg-blue-500",
      description: "Tổng số lịch hẹn",
    },
    {
      name: "Đã hoàn thành",
      stat: "16",
      icon: CheckCircleIcon,
      color: "bg-green-500",
      description: "Đã khám xong",
    },
    {
      name: "Cần chú ý",
      stat: "3",
      icon: ExclamationCircleIcon,
      color: "bg-red-500",
      description: "Trễ hẹn hoặc khẩn cấp",
    },
  ];

  const quickActions = [
    {
      name: "Đăng Ký Bệnh Nhân Mới",
      description: "Thêm bệnh nhân mới vào hệ thống",
      href: "/receptionist/register-patient",
      icon: UserPlusIcon,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Đặt Lịch Khám",
      description: "Tạo lịch hẹn mới cho bệnh nhân",
      href: "/receptionist/appointments",
      icon: CalendarDaysIcon,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      name: "Quản Lý Hàng Đợi",
      description: "Xem và quản lý hàng đợi khám bệnh",
      href: "/receptionist/queue",
      icon: QueueListIcon,
      color: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  const recentAppointments = [
    {
      id: 1,
      patientName: "Nguyễn Văn A",
      time: "09:00",
      doctor: "Bác sĩ Trần Thị B",
      status: "Đang chờ",
      statusColor: "text-yellow-600 bg-yellow-50",
    },
    {
      id: 2,
      patientName: "Lê Thị C",
      time: "09:30",
      doctor: "Bác sĩ Nguyễn Văn D",
      status: "Đã checkin",
      statusColor: "text-blue-600 bg-blue-50",
    },
    {
      id: 3,
      patientName: "Phạm Văn E",
      time: "10:00",
      doctor: "Bác sĩ Trần Thị B",
      status: "Hoàn thành",
      statusColor: "text-green-600 bg-green-50",
    },
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Dashboard Lễ Tân
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Tổng quan hoạt động và thao tác nhanh cho lễ tân
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.name}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-md ${item.color} flex items-center justify-center`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {item.name}
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {item.stat}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Thao Tác Nhanh
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.name}
                  to={action.href}
                  className={`relative group ${action.color} p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg text-white transition-all duration-200 transform hover:scale-105`}
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-white bg-opacity-20">
                      <Icon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium">
                      <span className="absolute inset-0" />
                      {action.name}
                    </h3>
                    <p className="mt-2 text-sm opacity-90">
                      {action.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Appointments */}
        <div>
          <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Lịch Hẹn Gần Đây
          </h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {recentAppointments.map((appointment) => (
                <li key={appointment.id}>
                  <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {appointment.patientName}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${appointment.statusColor}`}
                            >
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <p>
                              {appointment.time} • {appointment.doctor}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboardPage;
