import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import { toast } from "react-hot-toast";
import {
  Activity,
  CheckCircle,
  Clock,
  FileText,
  User,
  Calendar,
  Microscope,
  Stethoscope,
} from "lucide-react";

interface LabTest {
  id: number;
  appointment_id: number;
  patient_id: number;
  medical_record_id: number | null;
  lab_test_type_id: number;
  status: "pending" | "in_progress" | "completed";
  clinical_notes: string;
  result: string | null;
  interpretation: string | null;
  attachments: string[] | null;
  performed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  lab_test_type: {
    id: number;
    code: string;
    name: string;
    category: string;
    description: string;
    price: number;
  };
  // Patient info từ appointment (KHÔNG CẦN medical_record nữa)
  patient?: {
    id: number;
    name: string;
    dob: string;
    gender: string;
  };
  appointment?: {
    diagnosis?: string;
  };
  // Backward compatibility với data cũ
  medical_record?: {
    id: number;
    patient_id: number;
    appointment_id: number;
    diagnosis: string;
    patient: {
      id: number;
      first_name: string;
      last_name: string;
      date_of_birth: string;
      gender: string;
    };
  };
}

interface LabTestResultForm {
  result: string;
  interpretation: string;
}

export default function LabTechnicianDashboard() {
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultForm, setResultForm] = useState<LabTestResultForm>({
    result: "",
    interpretation: "",
  });
  const [filterStatus, setFilterStatus] = useState<
    "pending" | "in_progress" | "completed"
  >("pending");

  const queryClient = useQueryClient();

  // Helper function to get patient info (từ patient hoặc medical_record.patient)
  const getPatientInfo = (test: LabTest) => {
    if (test.patient) {
      return {
        name: test.patient.name,
        gender: test.patient.gender,
        dob: test.patient.dob,
      };
    }
    if (test.medical_record?.patient) {
      return {
        name: `${test.medical_record.patient.last_name} ${test.medical_record.patient.first_name}`,
        gender: test.medical_record.patient.gender,
        dob: test.medical_record.patient.date_of_birth,
      };
    }
    return { name: "N/A", gender: "male", dob: "N/A" };
  };

  // Helper function to get diagnosis
  const getDiagnosis = (test: LabTest) => {
    return (
      test.appointment?.diagnosis ||
      test.medical_record?.diagnosis ||
      "Chờ kết quả xét nghiệm cận lâm sàng"
    );
  };

  // Fetch pending/in-progress lab tests
  const { data: labTests, isLoading } = useQuery({
    queryKey: ["lab-tests", filterStatus],
    queryFn: async () => {
      try {
        const response = await api.get("/lab-tests/pending");

        // Check if response.data is already the array or wrapped in {success, data}
        const labTestsData = Array.isArray(response.data)
          ? response.data
          : response.data.data;

        return labTestsData as LabTest[];
      } catch (error) {
        console.error("Error fetching lab tests:", error);
        toast.error("Không thể tải danh sách xét nghiệm");
        return [] as LabTest[];
      }
    },
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // Auto refetch every 10 seconds
  });

  // Update test status to in_progress
  const startTestMutation = useMutation({
    mutationFn: async (testId: number) => {
      const response = await api.put(`/lab-tests/${testId}/status`, {
        status: "in_progress",
      });
      return response.data;
    },
    onSuccess: (data) => {
      const testName = data.data?.lab_test_type?.name || "xét nghiệm";
      toast.success(`Đã bắt đầu thực hiện: ${testName}`, {
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["lab-tests"] });
    },
    onError: (error) => {
      console.error("Error starting test:", error);
      toast.error("Có lỗi khi cập nhật trạng thái");
    },
  });

  // Submit test results
  const submitResultsMutation = useMutation({
    mutationFn: async ({
      testId,
      data,
    }: {
      testId: number;
      data: LabTestResultForm;
    }) => {
      const response = await api.put(`/lab-tests/${testId}/result`, {
        ...data,
        status: "in_progress",
      });
      return response.data;
    },
    onSuccess: (data) => {
      const testName = data.data?.lab_test_type?.name || "xét nghiệm";
      toast.success(`💾 Đã lưu kết quả: ${testName}`, {
        duration: 3000,
      });
      setShowResultModal(false);
      setSelectedTest(null);
      setResultForm({ result: "", interpretation: "" });
      queryClient.invalidateQueries({ queryKey: ["lab-tests"] });
    },
    onError: (error) => {
      console.error("Error submitting results:", error);
      toast.error("Có lỗi khi lưu kết quả");
    },
  });

  // Complete test (mark as completed)
  const completeTestMutation = useMutation({
    mutationFn: async (testId: number) => {
      const response = await api.put(`/lab-tests/${testId}/status`, {
        status: "completed",
      });
      return response.data;
    },
    onSuccess: (data) => {
      const testName = data.data?.lab_test_type?.name || "xét nghiệm";
      toast.success(`✅ Đã hoàn thành: ${testName}`, {
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["lab-tests"] });
    },
    onError: (error) => {
      console.error("Error completing test:", error);
      toast.error("Có lỗi khi hoàn thành xét nghiệm");
    },
  });

  const handleStartTest = (test: LabTest) => {
    startTestMutation.mutate(test.id);
  };

  const handleCompleteTest = (test: LabTest) => {
    completeTestMutation.mutate(test.id);
  };

  const handleOpenResultModal = (test: LabTest) => {
    setSelectedTest(test);
    setResultForm({
      result: test.result || "",
      interpretation: test.interpretation || "",
    });
    setShowResultModal(true);
  };

  const handleSubmitResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTest) return;

    if (!resultForm.result.trim()) {
      toast.error("Vui lòng nhập kết quả xét nghiệm");
      return;
    }

    submitResultsMutation.mutate({
      testId: selectedTest.id,
      data: resultForm,
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
    };
    const labels = {
      pending: "Chờ Xử Lý",
      in_progress: "Đang Thực Hiện",
      completed: "Hoàn Thành",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          badges[status as keyof typeof badges]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    const badges = {
      xet_nghiem: "bg-purple-100 text-purple-800",
      chuan_doan_hinh_anh: "bg-indigo-100 text-indigo-800",
      tham_do_chuc_nang: "bg-pink-100 text-pink-800",
    };
    const labels = {
      xet_nghiem: "Xét Nghiệm",
      chuan_doan_hinh_anh: "Chẩn Đoán Hình Ảnh",
      tham_do_chuc_nang: "Thăm Dò Chức Năng",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          badges[category as keyof typeof badges]
        }`}
      >
        {labels[category as keyof typeof labels]}
      </span>
    );
  };

  const filteredTests = labTests?.filter((test) => {

    return test.status === filterStatus;
  });

  // Statistics
  const stats = {
    pending: labTests?.filter((t) => t.status === "pending").length || 0,
    in_progress:
      labTests?.filter((t) => t.status === "in_progress").length || 0,
    completed: labTests?.filter((t) => t.status === "completed").length || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Microscope className="w-8 h-8 text-blue-600" />
            Phòng Cận Lâm Sàng
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý yêu cầu xét nghiệm và chẩn đoán
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chờ Xử Lý</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <Clock className="w-12 h-12 text-yellow-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang Thực Hiện</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.in_progress}
                </p>
              </div>
              <Activity className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoàn Thành Hôm Nay</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.completed}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[

                { value: "pending", label: "Chờ Xử Lý", count: stats.pending },
                {
                  value: "in_progress",
                  label: "Đang Thực Hiện",
                  count: stats.in_progress,
                },
                {
                  value: "completed",
                  label: "Hoàn Thành",
                  count: stats.completed,
                },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() =>
                    setFilterStatus(tab.value as typeof filterStatus)
                  }
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    filterStatus === tab.value
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Lab Tests List */}
        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="p-12 text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          ) : filteredTests && filteredTests.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredTests.map((test) => (
                <div
                  key={test.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Test Type & Category */}
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {test.lab_test_type.name}
                        </h3>
                        {getCategoryBadge(test.lab_test_type.category)}
                        {getStatusBadge(test.status)}
                      </div>

                      {/* Patient Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span className="font-medium">Bệnh nhân:</span>
                          {getPatientInfo(test).name}
                          <span className="text-gray-400">
                            (
                            {getPatientInfo(test).gender === "male"
                              ? "Nam"
                              : "Nữ"}
                            )
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Stethoscope className="w-4 h-4" />
                          <span className="font-medium">Chẩn đoán:</span>
                          {getDiagnosis(test)}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText className="w-4 h-4" />
                          <span className="font-medium">Mã xét nghiệm:</span>
                          {test.lab_test_type.code}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">Yêu cầu lúc:</span>
                          {new Date(test.created_at).toLocaleString("vi-VN")}
                        </div>
                      </div>

                      {/* Clinical Notes */}
                      {test.clinical_notes && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                          <p className="text-sm text-blue-900">
                            <span className="font-medium">
                              Ghi chú lâm sàng:
                            </span>{" "}
                            {test.clinical_notes}
                          </p>
                        </div>
                      )}

                      {/* Test Results (if completed) */}
                      {test.status === "completed" && test.result && (
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <p className="text-sm text-green-900 mb-2">
                            <span className="font-medium">Kết quả:</span>
                          </p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {test.result}
                          </p>
                          {test.interpretation && (
                            <p className="text-sm text-gray-600 mt-2 italic">
                              Ghi chú: {test.interpretation}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Hoàn thành:{" "}
                            {test.completed_at
                              ? new Date(test.completed_at).toLocaleString(
                                  "vi-VN"
                                )
                              : "N/A"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      {test.status === "pending" && (
                        <button
                          onClick={() => handleStartTest(test)}
                          disabled={startTestMutation.isPending}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          Bắt Đầu
                        </button>
                      )}

                      {test.status === "in_progress" && (
                        <>
                          <button
                            onClick={() => handleOpenResultModal(test)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            {test.result ? "Sửa Kết Quả" : "Nhập Kết Quả"}
                          </button>
                          {test.result && (
                            <button
                              onClick={() => handleCompleteTest(test)}
                              disabled={completeTestMutation.isPending}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                              ✓ Hoàn Thành
                            </button>
                          )}
                        </>
                      )}

                      {test.status === "completed" && (
                        <button
                          onClick={() => handleOpenResultModal(test)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                        >
                          Xem Chi Tiết
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Microscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                Không có yêu cầu xét nghiệm nào
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {filterStatus === "pending" && "Chưa có yêu cầu chờ xử lý"}
                {filterStatus === "in_progress" &&
                  "Chưa có xét nghiệm đang thực hiện"}
                {filterStatus === "completed" &&
                  "Chưa có xét nghiệm hoàn thành"}

              </p>
            </div>
          )}
        </div>
      </div>

      {/* Result Modal */}
      {showResultModal && selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedTest.status === "completed"
                  ? "Kết Quả Xét Nghiệm"
                  : "Nhập Kết Quả Xét Nghiệm"}
              </h2>
              <p className="text-gray-600 mt-1">
                {selectedTest.lab_test_type.name}
              </p>
            </div>

            <form onSubmit={handleSubmitResults} className="p-6">
              {/* Patient Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-2">
                  Thông Tin Bệnh Nhân
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Họ tên:</span>
                    <span className="ml-2 font-medium">
                      {getPatientInfo(selectedTest).name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Giới tính:</span>
                    <span className="ml-2 font-medium">
                      {getPatientInfo(selectedTest).gender === "male"
                        ? "Nam"
                        : "Nữ"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày sinh:</span>
                    <span className="ml-2 font-medium">
                      {new Date(
                        getPatientInfo(selectedTest).dob
                      ).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Chẩn đoán lâm sàng:</span>
                    <span className="ml-2 font-medium">
                      {getDiagnosis(selectedTest)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Select Results (Common Findings) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Kết Quả Nhanh (Chọn các mục phù hợp)
                </label>
                <div className="space-y-2 bg-gray-50 rounded-lg p-4">
                  {getCommonFindings(selectedTest.lab_test_type.category).map(
                    (finding, index) => (
                      <label
                        key={index}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={resultForm.result.includes(finding)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setResultForm((prev) => ({
                                ...prev,
                                result: prev.result
                                  ? `${prev.result}\n${finding}`
                                  : finding,
                              }));
                            } else {
                              setResultForm((prev) => ({
                                ...prev,
                                result: prev.result
                                  .split("\n")
                                  .filter((line) => line !== finding)
                                  .join("\n"),
                              }));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          disabled={selectedTest.status === "completed"}
                        />
                        <span className="text-sm text-gray-700">{finding}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Custom Result Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kết Quả Chi Tiết / Bổ Sung *
                </label>
                <textarea
                  value={resultForm.result}
                  onChange={(e) =>
                    setResultForm((prev) => ({
                      ...prev,
                      result: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="Nhập hoặc chỉnh sửa kết quả chi tiết..."
                  required
                  disabled={selectedTest.status === "completed"}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ví dụ: "Glucose máu: 10.5 mmol/L (cao hơn bình thường
                  3.9-6.1)" hoặc "Tổn thương dạng thâm nhiễm phổi phải"
                </p>
              </div>

              {/* Professional Interpretation */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhận Định Chuyên Môn (Tùy chọn)
                </label>
                <textarea
                  value={resultForm.interpretation}
                  onChange={(e) =>
                    setResultForm((prev) => ({
                      ...prev,
                      interpretation: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Nhận định của kỹ thuật viên (không phải chẩn đoán bệnh)..."
                  disabled={selectedTest.status === "completed"}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ví dụ: "Gợi ý viêm phổi, cần bác sĩ đánh giá thêm" hoặc "Các
                  chỉ số đường huyết cao"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowResultModal(false);
                    setSelectedTest(null);
                    setResultForm({ result: "", interpretation: "" });
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  {selectedTest.status === "completed" ? "Đóng" : "Hủy"}
                </button>
                {selectedTest.status !== "completed" && (
                  <button
                    type="submit"
                    disabled={submitResultsMutation.isPending}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {submitResultsMutation.isPending
                      ? "Đang lưu..."
                      : "💾 Lưu Kết Quả"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function for common findings by category
function getCommonFindings(category: string): string[] {
  const findings: Record<string, string[]> = {
    xet_nghiem: [
      "✓ Các chỉ số trong giới hạn bình thường",
      "⚠ Glucose máu cao (> 6.1 mmol/L)",
      "⚠ WBC tăng cao (nhiễm trùng)",
      "⚠ Hồng cầu giảm (thiếu máu)",
      "⚠ CRP tăng (viêm nhiễm)",
      "⚠ Creatinine tăng (chức năng thận)",
    ],
    chuan_doan_hinh_anh: [
      "✓ Phim chụp bình thường, không thấy bất thường",
      "⚠ Tổn thương thâm nhiễm phổi",
      "⚠ Giãn phế quản",
      "⚠ Tràn dịch màng phổi",
      "⚠ Gãy xương / Rạn xương",
      "⚠ Thoái hóa khớp",
    ],
    tham_do_chuc_nang: [
      "✓ Kết quả bình thường",
      "⚠ Rối loạn nhịp tim",
      "⚠ Huyết áp cao",
      "⚠ Chức năng hô hấp giảm",
      "⚠ ECG bất thường",
    ],
  };

  return findings[category] || ["✓ Bình thường", "⚠ Có bất thường"];
}
