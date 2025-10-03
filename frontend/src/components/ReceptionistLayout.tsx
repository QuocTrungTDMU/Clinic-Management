import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UserPlusIcon,
  CalendarDaysIcon,
  QueueListIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { authService } from "../lib/auth";

const ReceptionistLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: authService.me,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const navigation = [
    { name: "Dashboard", href: "/receptionist/dashboard", icon: HomeIcon },
    {
      name: "Đăng Ký Bệnh Nhân",
      href: "/receptionist/register-patient",
      icon: UserPlusIcon,
    },
    {
      name: "Đặt Lịch Khám",
      href: "/receptionist/appointments",
      icon: CalendarDaysIcon,
    },
    { name: "Hàng Đợi", href: "/receptionist/queue", icon: QueueListIcon },
    {
      name: "Lịch Sử Khám",
      href: "/receptionist/history",
      icon: ClipboardDocumentCheckIcon,
    },
    { name: "Cài Đặt", href: "/receptionist/settings", icon: Cog6ToothIcon },
  ];

  useEffect(() => {
    // Close sidebar when route changes on mobile
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      queryClient.removeQueries({ queryKey: ["user"] });
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Force navigation even if logout fails
      queryClient.removeQueries({ queryKey: ["user"] });
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 flex z-40 md:hidden ${
          sidebarOpen ? "" : "pointer-events-none"
        }`}
      >
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transition ease-in-out duration-300 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-blue-600">
                Clinic Management
              </h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon
                      className={`mr-4 flex-shrink-0 h-6 w-6 transition-colors ${
                        isActive
                          ? "text-blue-500"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
              <div className="ml-3">
                <p className="text-base font-medium text-gray-700">
                  {user?.name}
                </p>
                <p className="text-sm font-medium text-gray-500">Lễ Tân</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-blue-600">
                Clinic Management
              </h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon
                      className={`mr-3 flex-shrink-0 h-6 w-6 transition-colors ${
                        isActive
                          ? "text-blue-500"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full group">
              <UserCircleIcon className="h-9 w-9 text-gray-400" />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">
                  {user?.name}
                </p>
                <p className="text-xs font-medium text-gray-500">Lễ Tân</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-3 flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title="Đăng xuất"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ReceptionistLayout;
