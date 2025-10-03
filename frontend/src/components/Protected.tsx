import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { authService } from "../lib/auth";

interface ProtectedProps {
  readonly children: React.ReactNode;
}

export function Protected({ children }: ProtectedProps) {
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: authService.me,
    retry: (failureCount, error: unknown) => {
      // Don't retry on 401 errors (unauthenticated)
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          return false;
        }
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
