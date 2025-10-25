import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { authService } from "../lib/auth";
import { useEffect, useState } from "react";

interface ProtectedProps {
  readonly children: React.ReactNode;
}

export function Protected({ children }: ProtectedProps) {
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [cachedUser, setCachedUser] =
    useState<ReturnType<typeof authService.getCachedUser>>(null);

  // Check for token and cached user on component mount
  useEffect(() => {
    const token = authService.getToken();
    const user = authService.getCachedUser();
    setHasToken(!!token);
    setCachedUser(user);
  }, []);

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: authService.me,
    enabled: hasToken === true, // Only run query if token exists
    // Use cached user as initial data to show immediately while fetching fresh data
    initialData: cachedUser || undefined,
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
    staleTime: 10 * 60 * 1000, // 10 minutes - keep data fresh
    gcTime: 30 * 60 * 1000, // 30 minutes in cache
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: true, // Refetch on mount to verify token is still valid
  });

  // Still checking for token
  if (hasToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // If no token exists, redirect immediately without loading
  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  // If we have cached user, show it immediately while verifying with server
  // This prevents the "flash of loading" on refresh
  if (cachedUser && isLoading) {
    // Silently verify token in background, show cached user
    return <>{children}</>;
  }

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

  // Only redirect on error if we don't have cached user OR if it's a 401 error
  if (isError) {
    // If we have cached user, try to stay logged in unless it's definitely a 401
    if (cachedUser) {
      // Check if it's a 401 (unauthorized) - definitely need to logout
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          // Clear cache before redirecting
          authService.removeCachedUser();
          authService.removeToken();
          return <Navigate to="/login" replace />;
        }
      }

      // For other errors (network, 500, etc), keep user logged in with cached data
      return <>{children}</>;
    }

    // No cached user and error - redirect to login
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
