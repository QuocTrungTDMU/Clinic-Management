import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../lib/axios";
import toast from "react-hot-toast";

export default function VNPayReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"processing" | "success" | "failed">(
    "processing"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const processVNPayReturn = async () => {
      try {
        // Get all query parameters
        const params = Object.fromEntries(searchParams.entries());

        // Call backend to verify payment
        const response = await api.get("/vnpay/return", { params });

        if (response.data.success) {
          setStatus("success");
          setMessage("Thanh toán thành công!");
          toast.success("Thanh toán VNPay thành công!");

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate("/accountant/dashboard");
          }, 3000);
        } else {
          setStatus("failed");
          setMessage(response.data.message || "Thanh toán thất bại");
          toast.error("Thanh toán VNPay thất bại!");
        }
      } catch (error: unknown) {
        setStatus("failed");
        const err = error as { response?: { data?: { message?: string } } };
        setMessage(
          err.response?.data?.message || "Có lỗi xảy ra khi xác minh thanh toán"
        );
        toast.error("Không thể xác minh thanh toán");
      }
    };

    if (searchParams.toString()) {
      processVNPayReturn();
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {status === "processing" && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Đang xử lý thanh toán...
              </h2>
              <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Thanh toán thành công!
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500">
                Đang chuyển về trang chủ...
              </p>
            </div>
          )}

          {status === "failed" && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-10 w-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">
                Thanh toán thất bại!
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={() => navigate("/accountant/dashboard")}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Quay về trang chủ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
