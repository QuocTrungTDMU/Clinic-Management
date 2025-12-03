import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";

interface VitalSigns {
  blood_pressure: string;
  temperature: number | null;
  heart_rate: number | null;
  respiratory_rate: number | null;
  oxygen_saturation: number | null;
  weight: number | null;
  height: number | null;
  bmi: number | null;
}

interface ChiefComplaint {
  respiratory: string[];
  fever_pain: string[];
  digestive: string[];
  skin: string[];
  general: string[];
}

interface PhysicalExam {
  general: string[];
  throat: string[];
  respiratory: string[];
  cardiovascular: string[];
  abdomen: string[];
  skin: string[];
}

interface ICD10 {
  id: number;
  code: string;
  name: string;
  category: string;
  specialty: string;
}

interface LabTestType {
  id: number;
  code: string;
  name: string;
  category: string;
  price: number;
  description: string;
}

interface LabTest {
  id: number;
  lab_test_type: LabTestType;
  status: string;
  result: string | null;
  interpretation: string | null;
  ordered_at: string;
  completed_at: string | null;
}

export default function NewExaminationPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // States cho từng bước khám
  const [currentStep, setCurrentStep] = useState(1);

  // 1. Dấu hiệu sinh tồn
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    blood_pressure: "",
    temperature: null,
    heart_rate: null,
    respiratory_rate: null,
    oxygen_saturation: null,
    weight: null,
    height: null,
    bmi: null,
  });

  // 2. Hỏi bệnh
  const [chiefComplaint, setChiefComplaint] = useState<ChiefComplaint>({
    respiratory: [],
    fever_pain: [],
    digestive: [],
    skin: [],
    general: [],
  });
  const [symptoms, setSymptoms] = useState("");

  // 3. Khám lâm sàng
  const [physicalExam, setPhysicalExam] = useState<PhysicalExam>({
    general: [],
    throat: [],
    respiratory: [],
    cardiovascular: [],
    abdomen: [],
    skin: [],
  });

  // 4. Chỉ định cận lâm sàng
  const [selectedLabTests, setSelectedLabTests] = useState<number[]>([]);
  const [labTestCategory, setLabTestCategory] = useState("xet_nghiem");
  const [clinicalNotes, setClinicalNotes] = useState("");

  // 5. Chẩn đoán
  const [icd10Search, setIcd10Search] = useState("");
  const [selectedICD10, setSelectedICD10] = useState<ICD10 | null>(null);
  const [diagnosis, setDiagnosis] = useState("");

  // 6. Kế hoạch điều trị
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");

  // Fetch appointment data
  const { data: appointment } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: async () => {
      const response = await api.get(`/appointments/${appointmentId}`);
      return response.data;
    },
  });

  // Fetch ICD-10 search results
  const { data: icd10Results } = useQuery({
    queryKey: ["icd10-search", icd10Search],
    queryFn: async () => {
      if (!icd10Search || icd10Search.length < 2) return { data: [] };
      const response = await api.get(`/icd10/search?q=${icd10Search}&limit=10`);
      return response.data;
    },
    enabled: icd10Search.length >= 2,
  });

  // Fetch lab test types
  const { data: labTestTypes } = useQuery({
    queryKey: ["lab-test-types", labTestCategory],
    queryFn: async () => {
      const response = await api.get(
        `/lab-test-types?category=${labTestCategory}`
      );
      return response.data;
    },
  });

  // Fetch existing medical record
  const { data: medicalRecord } = useQuery({
    queryKey: ["medical-record", appointmentId],
    queryFn: async () => {
      const response = await api.get(
        `/medical-records?appointment_id=${appointmentId}`
      );
      return response.data[0] || null;
    },
  });

  // Fetch lab tests for this medical record
  const { data: labTests = [] } = useQuery<LabTest[]>({
    queryKey: ["lab-tests", medicalRecord?.id],
    queryFn: async () => {
      if (!medicalRecord?.id) return [];
      const response = await api.get(
        `/lab-tests/medical-record/${medicalRecord.id}`
      );
      return response.data;
    },
    enabled: !!medicalRecord?.id,
  });

  // Auto calculate BMI
  useEffect(() => {
    if (vitalSigns.weight && vitalSigns.height) {
      const heightInMeters = vitalSigns.height / 100;
      const bmi = vitalSigns.weight / (heightInMeters * heightInMeters);
      setVitalSigns((prev) => ({ ...prev, bmi: parseFloat(bmi.toFixed(2)) }));
    }
  }, [vitalSigns.weight, vitalSigns.height]);

  // Save medical record mutation
  const saveMedicalRecord = useMutation({
    mutationFn: async (data: any) => {
      if (medicalRecord?.id) {
        return await api.put(`/medical-records/${medicalRecord.id}`, data);
      } else {
        return await api.post("/medical-records", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-record"] });
    },
  });

  // Order lab test mutation
  const orderLabTest = useMutation({
    mutationFn: async (labTestTypeId: number) => {
      return await api.post("/lab-tests", {
        medical_record_id: medicalRecord?.id,
        lab_test_type_id: labTestTypeId,
        clinical_notes: clinicalNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-tests"] });
    },
  });

  // Handle save current step
  const handleSaveStep = async () => {
    const data: any = {
      appointment_id: appointmentId,
      patient_id: appointment?.patient_id,
      doctor_id: appointment?.doctor_id,
    };

    if (currentStep === 1) {
      Object.assign(data, vitalSigns);
    } else if (currentStep === 2) {
      data.chief_complaint = JSON.stringify(chiefComplaint);
      data.symptoms = symptoms;
    } else if (currentStep === 3) {
      data.physical_examination = JSON.stringify(physicalExam);
    } else if (currentStep === 5) {
      data.diagnosis = diagnosis;
      data.icd10_id = selectedICD10?.id;
      data.icd10_code = selectedICD10?.code;
    } else if (currentStep === 6) {
      data.treatment_plan = treatmentPlan;
      data.recommendations = recommendations;
      data.follow_up_date = followUpDate || null;
      data.follow_up_notes = followUpNotes;
    }

    await saveMedicalRecord.mutateAsync(data);
  };

  // Handle order lab tests
  const handleOrderLabTests = async () => {
    for (const testId of selectedLabTests) {
      await orderLabTest.mutateAsync(testId);
    }
    setSelectedLabTests([]);
    alert("Đã chỉ định xét nghiệm thành công!");
  };

  // Handle complete examination
  const handleComplete = async () => {
    await handleSaveStep();

    await api.put(`/appointments/${appointmentId}`, {
      status: "completed",
    });

    alert("Đã hoàn thành khám bệnh!");
    navigate("/doctor/queue");
  };

  const renderVitalSigns = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Dấu hiệu sinh tồn</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Huyết áp (mmHg)
          </label>
          <input
            type="text"
            placeholder="VD: 120/80"
            value={vitalSigns.blood_pressure}
            onChange={(e) =>
              setVitalSigns({ ...vitalSigns, blood_pressure: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nhiệt độ (°C)
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="VD: 36.5"
            value={vitalSigns.temperature || ""}
            onChange={(e) =>
              setVitalSigns({
                ...vitalSigns,
                temperature: parseFloat(e.target.value) || null,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nhịp tim (lần/phút)
          </label>
          <input
            type="number"
            placeholder="VD: 75"
            value={vitalSigns.heart_rate || ""}
            onChange={(e) =>
              setVitalSigns({
                ...vitalSigns,
                heart_rate: parseInt(e.target.value) || null,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nhịp thở (lần/phút)
          </label>
          <input
            type="number"
            placeholder="VD: 18"
            value={vitalSigns.respiratory_rate || ""}
            onChange={(e) =>
              setVitalSigns({
                ...vitalSigns,
                respiratory_rate: parseInt(e.target.value) || null,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SpO2 (%)
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="VD: 98"
            value={vitalSigns.oxygen_saturation || ""}
            onChange={(e) =>
              setVitalSigns({
                ...vitalSigns,
                oxygen_saturation: parseFloat(e.target.value) || null,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cân nặng (kg)
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="VD: 65"
            value={vitalSigns.weight || ""}
            onChange={(e) =>
              setVitalSigns({
                ...vitalSigns,
                weight: parseFloat(e.target.value) || null,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chiều cao (cm)
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="VD: 170"
            value={vitalSigns.height || ""}
            onChange={(e) =>
              setVitalSigns({
                ...vitalSigns,
                height: parseFloat(e.target.value) || null,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            BMI
          </label>
          <input
            type="number"
            step="0.01"
            value={vitalSigns.bmi || ""}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
          />
        </div>
      </div>
    </div>
  );

  if (!appointment) {
    return <div className="p-6">Đang tải thông tin lịch hẹn...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Khám bệnh</h1>
        <div className="text-gray-600">
          <div>
            Bệnh nhân:{" "}
            <span className="font-medium">{appointment.patient?.name}</span>
          </div>
          <div>
            Chuyên khoa:{" "}
            <span className="font-medium">{appointment.specialty}</span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          {[
            { num: 1, title: "Dấu hiệu sinh tồn" },
            { num: 2, title: "Hỏi bệnh" },
            { num: 3, title: "Khám lâm sàng" },
            { num: 4, title: "Cận lâm sàng" },
            { num: 5, title: "Chẩn đoán" },
            { num: 6, title: "Điều trị" },
          ].map((step, index) => (
            <div key={step.num} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step.num)}
                className={`flex flex-col items-center ${
                  currentStep === step.num ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep === step.num
                      ? "bg-blue-600 text-white"
                      : currentStep > step.num
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > step.num ? "✓" : step.num}
                </div>
                <span className="text-xs mt-1 text-center">{step.title}</span>
              </button>
              {index < 5 && (
                <div
                  className={`h-0.5 w-12 mx-2 ${
                    currentStep > step.num ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {renderVitalSigns()}
        <div className="mt-6 text-center text-gray-500">
          <p>Các bước khác đang được phát triển...</p>
          <p className="text-sm mt-2">
            Bước 2-6 sẽ được thêm vào trong lần commit tiếp theo
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Quay lại
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleSaveStep}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            💾 Lưu tạm
          </button>

          {currentStep < 6 ? (
            <button
              onClick={() => {
                handleSaveStep();
                setCurrentStep(currentStep + 1);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Tiếp theo →
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              ✓ Hoàn thành khám
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
