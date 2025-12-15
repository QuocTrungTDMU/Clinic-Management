import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../lib/auth";
import {
  HomeIcon,
  UserGroupIcon,
  UsersIcon,
  CalendarDaysIcon,
  DocumentChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: "Trang Chủ",
    href: "/admin/dashboard",
    icon: HomeIcon,
    current: false,
  },
  {
    name: "Quản Lý Bác Sĩ",
    href: "/admin/doctors",
    icon: UserGroupIcon,
    current: false,
  },
  {
    name: "Quản Lý Bệnh Nhân",
    href: "/admin/patients",
    icon: UsersIcon,
    current: false,
  },
  {
    name: "Lịch Hẹn",
    href: "/admin/appointments",
    icon: CalendarDaysIcon,
    current: false,
  },
  {
    name: "Báo Cáo Tài Chính",
    href: "/admin/reports",
    icon: DocumentChartBarIcon,
    current: false,
  },
  { name: "Cài Đặt", href: "/admin/settings", icon: CogIcon, current: false },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: authService.me,
  });

  // Update current navigation item based on current path
  const updatedNavigation = navigation.map((item) => ({
    ...item,
    current: location.pathname === item.href,
  }));

  const handleLogout = async () => {
    try {
      await authService.logout();
      queryClient.removeQueries({ queryKey: ["user"] });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      queryClient.removeQueries({ queryKey: ["user"] });
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
            role="button"
            tabIndex={0}
            aria-label="Close sidebar"
          />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-4 bg-blue-600">
              <div className="flex items-center">
                <BuildingOffice2Icon className="h-8 w-8 text-white" />
                <span className="ml-2 text-xl font-bold text-white">
                  Quản Trị Phòng Khám
                </span>
              </div>
              <button
                type="button"
                className="text-white hover:text-gray-300"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4">
              <div className="space-y-2">
                {updatedNavigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.href);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${
                        item.current
                          ? "bg-blue-100 text-blue-700 border-r-4 border-blue-600"
                          : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                      }
                    `}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </button>
                ))}
              </div>
            </nav>
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center mb-3">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role_name}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                Đăng Xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white shadow-lg">
        <div className="flex h-16 items-center px-6 bg-blue-600">
          <BuildingOffice2Icon className="h-8 w-8 text-white" />
          <span className="ml-2 text-xl font-bold text-white">
            Quản Trị Phòng Khám
          </span>
        </div>
        <nav className="flex-1 px-6 py-4">
          <div className="space-y-2">
            {updatedNavigation.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`
                  w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${
                    item.current
                      ? "bg-blue-100 text-blue-700 border-r-4 border-blue-600"
                      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  }
                `}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            ))}
          </div>
        </nav>
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center mb-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role_name}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
            Đăng Xuất
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 flex-1">
        {/* Mobile header */}
        <div className="lg:hidden flex h-16 items-center justify-between px-4 bg-white shadow-sm">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <BuildingOffice2Icon className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-lg font-bold text-gray-900">
              Quản Trị Phòng Khám
            </span>
          </div>
          <div></div>
        </div>

        {/* Page content */}
        <main className="min-h-screen bg-gray-50 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
