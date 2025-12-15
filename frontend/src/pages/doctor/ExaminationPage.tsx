import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../../lib/axios";
import PatientHistoryModal from "../../components/PatientHistoryModal";
import { DoctorLayout } from "../../components/DoctorLayout";
import {
  chiefComplaints,
  physicalExamFindings,
  normalVitalSigns,
} from "../../data/medicalOptions";

interface Patient {
  appointment_id: number;
  patient_id: number;
  patient_name: string;
  patient_phone: string;
  patient_dob: string;
  patient_gender: string;
  appointment_time: string;
  appointment_type: string;
  reason: string;
  checked_in_at: string;
}

interface MedicalRecordData {
  appointment_id: number;
  patient_id: number;
  chief_complaint: string;
  symptoms: string;
  physical_examination: string;
  vital_signs: {
    temperature?: string;
    blood_pressure?: string;
    heart_rate?: string;
    respiratory_rate?: string;
    weight?: string;
    height?: string;
  };
  diagnosis: string;
  treatment_plan: string;
  follow_up_date?: string;
  notes: string;
  prescription?: {
    general_instructions: string;
    precautions: string;
    diet_advice: string;
    lifestyle_advice: string;
    items: PrescriptionItem[];
  };
}

interface PrescriptionItem {
  medicine_id?: number;
  medicine_name: string;
  medicine_type?: string;
  strength?: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  unit_price?: number;
  instructions?: string;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  before_meal: boolean;
  after_meal: boolean;
}

interface Medicine {
  id: number;
  name: string;
  medicine_type: string;
  strength: string;
  unit: string;
  selling_price: number;
  stock_quantity: number;
  usage_instructions: string;
}

interface LabTestType {
  id: number;
  code: string;
  name: string;
  category: string;
  description: string;
  price: number;
}

interface ICD10Code {
  id: number;
  code: string;
  name: string;
  name_en: string;
  category: string;
  description?: string;
  specialty: string;
  is_common: boolean;
}

interface LabTest {
  id: number;
  medical_record_id: number;
  lab_test_type_id: number;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  result: string | null;
  interpretation: string | null;
  clinical_notes: string | null;
  ordered_at: string;
  completed_at: string | null;
  lab_test_type: LabTestType;
  ordered_by: {
    id: number;
    name: string;
  };
  performed_by?: {
    id: number;
    name: string;
  } | null;
}

export function ExaminationPage() {
  const queryClient = useQueryClient();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showExaminationForm, setShowExaminationForm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyPatientId, setHistoryPatientId] = useState<number | null>(null);
  const [showLabResultsModal, setShowLabResultsModal] = useState(false);

  // Quick selection states
  const [useCustomComplaint, setUseCustomComplaint] = useState(false);
  const [useCustomDiagnosis, setUseCustomDiagnosis] = useState(false);
  const [useCustomPhysicalExam, setUseCustomPhysicalExam] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedFindings, setSelectedFindings] = useState<string[]>([]);

  // ICD-10 search states
  const [icd10SearchQuery, setIcd10SearchQuery] = useState("");
  const [showIcd10Dropdown, setShowIcd10Dropdown] = useState(false);
  const [selectedIcd10, setSelectedIcd10] = useState<ICD10Code | null>(null);

  // Helper function to get localStorage key for appointment
  const getLocalStorageKey = (appointmentId: number) => {
    return `examination_draft_${appointmentId}`;
  };

  // Lab test states
  const [selectedLabTests, setSelectedLabTests] = useState<number[]>([]);
  const [labTestsSubmitted, setLabTestsSubmitted] = useState(false);

  // Medicine search states
  const [medicineSearchResults, setMedicineSearchResults] = useState<
    Medicine[]
  >([]);
  const [showMedicineDropdown, setShowMedicineDropdown] = useState<
    number | null
  >(null);

  // Close medicine dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMedicineDropdown(null);
    };

    if (showMedicineDropdown !== null) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showMedicineDropdown]);

  // Close ICD-10 dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".icd10-search-container")) {
        setShowIcd10Dropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Medical record form state
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecordData>({
    appointment_id: 0,
    patient_id: 0,
    chief_complaint: "",
    symptoms: "",
    physical_examination: "",
    vital_signs: {},
    diagnosis: "",
    treatment_plan: "",
    follow_up_date: "",
    notes: "",
    prescription: {
      general_instructions: "",
      precautions: "",
      diet_advice: "",
      lifestyle_advice: "",
      items: [],
    },
  });

  // Fetch doctor's queue
  const { data: queueData, isLoading: isLoadingQueue } = useQuery({
    queryKey: ["doctor-queue"],
    queryFn: async () => {
      const response = await api.get("/doctor/queue");
      return response.data;
    },
    refetchInterval: 3000, // Refetch every 3 seconds for real-time updates
  });

  // Fetch lab test types
  const { data: labTestTypes } = useQuery({
    queryKey: ["lab-test-types"],
    queryFn: async () => {
      const response = await api.get("/lab-test-types");
      return response.data as LabTestType[];
    },
  });

  // Fetch ICD-10 codes based on search query
  const { data: icd10Results = [] } = useQuery<ICD10Code[]>({
    queryKey: ["icd10-search", icd10SearchQuery],
    queryFn: async () => {
      if (!icd10SearchQuery || icd10SearchQuery.length < 2) return [];
      const response = await api.get("/icd10/search", {
        params: {
          q: icd10SearchQuery,
          limit: 20,
        },
      });
      // API trả về pagination, lấy data
      return response.data.data || response.data;
    },
    enabled: icd10SearchQuery.length >= 2,
  });

  // Fetch lab tests for current appointment (KHÔNG CẦN medical_record_id)
  const { data: labTests, refetch: refetchLabTests } = useQuery({
    queryKey: ["lab-tests-for-appointment", selectedPatient?.appointment_id],
    queryFn: async () => {
      if (!selectedPatient?.appointment_id) return [];
      const response = await api.get(
        `/lab-tests/appointment/${selectedPatient.appointment_id}`
      );
      return response.data as LabTest[];
    },
    enabled: !!selectedPatient?.appointment_id,
    refetchInterval: 3000, // Auto refetch every 3 seconds for real-time lab results
  });

  // Track lab test results and show notification when new results arrive
  const [previousLabTestResults, setPreviousLabTestResults] = useState<
    Set<number>
  >(new Set());

  useEffect(() => {
    if (labTests && labTests.length > 0) {
      const currentCompletedIds = new Set(
        labTests
          .filter((test) => test.status === "completed" && test.result)
          .map((test) => test.id)
      );

      // Check for new completed tests
      const newCompletedTests = labTests.filter(
        (test) =>
          test.status === "completed" &&
          test.result &&
          !previousLabTestResults.has(test.id)
      );

      if (newCompletedTests.length > 0 && previousLabTestResults.size > 0) {
        newCompletedTests.forEach((test) => {
          toast.success(
            `✅ Kết quả xét nghiệm mới: ${test.lab_test_type.name}`,
            {
              duration: 5000,
              icon: "🧪",
            }
          );
        });
      }

      setPreviousLabTestResults(currentCompletedIds);
    }
  }, [labTests, previousLabTestResults]);

  // Fetch patient medical history
  const { data: patientHistory } = useQuery({
    queryKey: ["patient-history", historyPatientId],
    queryFn: async () => {
      if (!historyPatientId) return null;
      const response = await api.get(
        `/patients/${historyPatientId}/medical-records`
      );
      return response.data;
    },
    enabled: !!historyPatientId,
  });

  // Auto-save form data to localStorage whenever medicalRecord changes
  useEffect(() => {
    if (selectedPatient && medicalRecord.appointment_id > 0) {
      const key = getLocalStorageKey(medicalRecord.appointment_id);
      const dataToSave = {
        medicalRecord,
        selectedSymptoms,
        selectedFindings,
        selectedLabTests,
        useCustomComplaint,
        useCustomDiagnosis,
        useCustomPhysicalExam,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(dataToSave));
      console.log("📝 Auto-saved examination form to localStorage");
    }
  }, [
    medicalRecord,
    selectedSymptoms,
    selectedFindings,
    selectedLabTests,
    useCustomComplaint,
    useCustomDiagnosis,
    useCustomPhysicalExam,
    selectedPatient,
  ]);

  // Clear localStorage when form is closed without completion
  const clearDraftData = (appointmentId: number) => {
    const key = getLocalStorageKey(appointmentId);
    localStorage.removeItem(key);
    console.log("🗑️ Cleared draft data from localStorage");
  };

  // Create medical record mutation
  const createMedicalRecordMutation = useMutation({
    mutationFn: async (data: MedicalRecordData) => {
      const response = await api.post("/medical-records", data);
      return response.data;
    },
    onSuccess: async (responseData) => {
      toast.success("Đã lưu hồ sơ khám bệnh!");

      // Clear localStorage draft after successful completion
      if (selectedPatient) {
        clearDraftData(selectedPatient.appointment_id);
      }

      queryClient.invalidateQueries({ queryKey: ["doctor-queue"] });
      setShowExaminationForm(false);
      setSelectedPatient(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create medical record"
      );
    },
  });

  // Submit lab test requests mutation (KHÔNG TẠO medical record)
  const submitLabTestsMutation = useMutation({
    mutationFn: async ({ labTestIds }: { labTestIds: number[] }) => {
      // GỬI LAB TEST REQUEST mà KHÔNG TẠO medical record
      // Medical record chỉ được tạo khi bác sĩ click "Hoàn Thành Khám"

      const promises = labTestIds.map((labTestTypeId) =>
        api.post("/lab-tests", {
          appointment_id: selectedPatient?.appointment_id || 0,
          patient_id: selectedPatient?.patient_id || 0,
          lab_test_type_id: labTestTypeId,
          clinical_notes:
            medicalRecord.chief_complaint || "Yêu cầu từ bác sĩ khám bệnh",
        })
      );
      return Promise.all(promises);
    },
    onSuccess: (_, variables) => {
      toast.success(
        `Đã gửi ${variables.labTestIds.length} yêu cầu xét nghiệm!`
      );
      setLabTestsSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["lab-tests"] });
    },
    onError: () => {
      toast.error("Có lỗi khi gửi yêu cầu xét nghiệm");
    },
  });

  const resetForm = () => {
    setMedicalRecord({
      appointment_id: 0,
      patient_id: 0,
      chief_complaint: "",
      symptoms: "",
      physical_examination: "",
      vital_signs: {},
      diagnosis: "",
      treatment_plan: "",
      follow_up_date: "",
      notes: "",
      prescription: {
        general_instructions: "",
        precautions: "",
        diet_advice: "",
        lifestyle_advice: "",
        items: [],
      },
    });
    setUseCustomComplaint(false);
    setUseCustomDiagnosis(false);
    setUseCustomPhysicalExam(false);
    setSelectedSymptoms([]);
    setSelectedFindings([]);
    setSelectedLabTests([]);
    setLabTestsSubmitted(false);
  };

  // Apply normal vital signs
  const applyNormalVitalSigns = () => {
    setMedicalRecord((prev) => ({
      ...prev,
      vital_signs: { ...normalVitalSigns },
    }));
    toast.success("Normal vital signs applied");
  };

  // Toggle symptom selection
  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) => {
      const newSymptoms = prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom];

      // Update chief complaint
      setMedicalRecord((prevRecord) => ({
        ...prevRecord,
        chief_complaint: newSymptoms.join(", "),
      }));

      return newSymptoms;
    });
  };

  // Toggle physical finding selection
  const toggleFinding = (finding: string) => {
    setSelectedFindings((prev) => {
      const newFindings = prev.includes(finding)
        ? prev.filter((f) => f !== finding)
        : [...prev, finding];

      // Update physical examination
      setMedicalRecord((prevRecord) => ({
        ...prevRecord,
        physical_examination: newFindings.join(", "),
      }));

      return newFindings;
    });
  };

  // Search medicines from API
  const searchMedicines = async (query: string, index: number) => {
    if (query.length < 2) {
      setMedicineSearchResults([]);
      setShowMedicineDropdown(null);
      return;
    }

    try {
      const response = await api.get(`/medicines/search?q=${query}`);
      setMedicineSearchResults(response.data);
      setShowMedicineDropdown(index);
    } catch (error) {
      console.error("Failed to search medicines:", error);
      setMedicineSearchResults([]);
    }
  };

  // Select medicine from dropdown
  const selectMedicine = (medicine: Medicine, index: number) => {
    setMedicalRecord((prev) => ({
      ...prev,
      prescription: {
        ...prev.prescription!,
        items: prev.prescription!.items.map((item, i) =>
          i === index
            ? {
                ...item,
                medicine_id: medicine.id,
                medicine_name: medicine.name,
                medicine_type: medicine.medicine_type,
                strength: medicine.strength,
                unit_price: medicine.selling_price,
                instructions: medicine.usage_instructions || item.instructions,
              }
            : item
        ),
      },
    }));

    setShowMedicineDropdown(null);
    setMedicineSearchResults([]);

    // Show success toast
    toast.success(
      `Selected: ${medicine.name} (Stock: ${medicine.stock_quantity})`
    );
  };
  const handleStartExamination = (patient: Patient) => {
    setSelectedPatient(patient);

    // Try to restore draft data from localStorage
    const key = getLocalStorageKey(patient.appointment_id);
    const savedData = localStorage.getItem(key);

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const savedTime = new Date(parsed.timestamp);
        const now = new Date();
        const hoursDiff =
          (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);

        // Only restore if saved within last 24 hours
        if (hoursDiff < 24) {
          setMedicalRecord(parsed.medicalRecord);
          setSelectedSymptoms(parsed.selectedSymptoms || []);
          setSelectedFindings(parsed.selectedFindings || []);
          setSelectedLabTests(parsed.selectedLabTests || []);
          setUseCustomComplaint(parsed.useCustomComplaint || false);
          setUseCustomDiagnosis(parsed.useCustomDiagnosis || false);
          setUseCustomPhysicalExam(parsed.useCustomPhysicalExam || false);

          toast.success("✅ Đã khôi phục dữ liệu form từ lần trước", {
            duration: 3000,
            icon: "📋",
          });
          console.log("✅ Restored draft data from localStorage");
        } else {
          // Clear old data
          clearDraftData(patient.appointment_id);
          initializeNewForm(patient);
        }
      } catch (error) {
        console.error("Error parsing saved data:", error);
        initializeNewForm(patient);
      }
    } else {
      initializeNewForm(patient);
    }

    setShowExaminationForm(true);
  };

  const initializeNewForm = (patient: Patient) => {
    setMedicalRecord({
      appointment_id: patient.appointment_id,
      patient_id: patient.patient_id,
      chief_complaint: "",
      symptoms: "",
      physical_examination: "",
      vital_signs: {},
      diagnosis: "",
      treatment_plan: "",
      follow_up_date: "",
      notes: "",
      prescription: {
        general_instructions: "",
        precautions: "",
        diet_advice: "",
        lifestyle_advice: "",
        items: [],
      },
    });
    setSelectedSymptoms([]);
    setSelectedFindings([]);
    setSelectedLabTests([]);
    setUseCustomComplaint(false);
    setUseCustomDiagnosis(false);
    setUseCustomPhysicalExam(false);
  };

  const handleViewHistory = (patientId: number) => {
    setHistoryPatientId(patientId);
    setShowHistoryModal(true);
  };

  const addPrescriptionItem = () => {
    setMedicalRecord((prev) => ({
      ...prev,
      prescription: {
        ...prev.prescription!,
        items: [
          ...prev.prescription!.items,
          {
            medicine_name: "",
            strength: "",
            dosage: "1 viên",
            frequency: "2 lần/ngày",
            duration: "5 ngày",
            quantity: 1,
            unit_price: 0,
            instructions: "",
            morning: false,
            afternoon: false,
            evening: false,
            before_meal: false,
            after_meal: false,
          },
        ],
      },
    }));

    // Scroll to the new item after state updates
    setTimeout(() => {
      const prescriptionSection = document.querySelector(
        "[data-prescription-items]"
      );
      if (prescriptionSection) {
        const lastItem = prescriptionSection.lastElementChild;
        if (lastItem) {
          lastItem.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }, 100);
  };

  const removePrescriptionItem = (index: number) => {
    setMedicalRecord((prev) => ({
      ...prev,
      prescription: {
        ...prev.prescription!,
        items: prev.prescription!.items.filter((_, i) => i !== index),
      },
    }));
  };

  const updatePrescriptionItem = (index: number, field: string, value: any) => {
    setMedicalRecord((prev) => ({
      ...prev,
      prescription: {
        ...prev.prescription!,
        items: prev.prescription!.items.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!medicalRecord.chief_complaint || !medicalRecord.diagnosis) {
      toast.error("Chief complaint and diagnosis are required");
      return;
    }

    // Filter out empty prescription items
    const filteredRecord = {
      ...medicalRecord,
      prescription:
        medicalRecord.prescription &&
        medicalRecord.prescription.items.length > 0
          ? {
              ...medicalRecord.prescription,
              items: medicalRecord.prescription.items.filter(
                (item) => item.medicine_name.trim() !== ""
              ),
            }
          : undefined,
    };

    createMedicalRecordMutation.mutate(filteredRecord);
  };

  if (isLoadingQueue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading patient queue...</span>
        </div>
      </div>
    );
  }

  return (
    <DoctorLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {!showExaminationForm ? (
          // Patient Queue View
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Danh Sách Bệnh Nhân
              </h2>
              <p className="mt-2 text-gray-600">
                Chọn bệnh nhân để bắt đầu khám
              </p>
            </div>

            {queueData?.patients?.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không có bệnh nhân
                </h3>
                <p className="text-gray-500">
                  Hiện tại không có bệnh nhân nào đang chờ khám.
                </p>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {queueData?.patients?.map((patient: Patient) => (
                    <li key={patient.appointment_id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">
                                {patient.patient_name}
                              </h3>
                              <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                Đang Khám
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 space-y-1">
                              <p>SĐT: {patient.patient_phone}</p>
                              <p>
                                Ngày sinh:{" "}
                                {new Date(
                                  patient.patient_dob
                                ).toLocaleDateString("vi-VN")}
                              </p>
                              <p>
                                Giới tính:{" "}
                                {patient.patient_gender === "male"
                                  ? "Nam"
                                  : patient.patient_gender === "female"
                                  ? "Nữ"
                                  : patient.patient_gender}
                              </p>
                              <p>Giờ hẹn: {patient.appointment_time}</p>
                              <p>Loại: {patient.appointment_type}</p>
                              {patient.reason && <p>Lý do: {patient.reason}</p>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() =>
                              handleViewHistory(patient.patient_id)
                            }
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Xem Lịch Sử
                          </button>
                          <button
                            onClick={() => handleStartExamination(patient)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Bắt Đầu Khám
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          // Medical Record Form
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Khám Bệnh
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Bệnh nhân: {selectedPatient?.patient_name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowExaminationForm(false);
                    setSelectedPatient(null);
                    resetForm();
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <svg
                    className="w-6 h-6"
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
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Vital Signs */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Dấu Hiệu Sinh Tồn
                  </h3>
                  <button
                    type="button"
                    onClick={applyNormalVitalSigns}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Áp Dụng Chỉ Số Bình Thường
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nhiệt Độ (°C)
                    </label>
                    <input
                      type="text"
                      value={medicalRecord.vital_signs.temperature || ""}
                      onChange={(e) =>
                        setMedicalRecord((prev) => ({
                          ...prev,
                          vital_signs: {
                            ...prev.vital_signs,
                            temperature: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="36.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Huyết Áp
                    </label>
                    <input
                      type="text"
                      value={medicalRecord.vital_signs.blood_pressure || ""}
                      onChange={(e) =>
                        setMedicalRecord((prev) => ({
                          ...prev,
                          vital_signs: {
                            ...prev.vital_signs,
                            blood_pressure: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="120/80"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nhịp Tim (lần/phút)
                    </label>
                    <input
                      type="text"
                      value={medicalRecord.vital_signs.heart_rate || ""}
                      onChange={(e) =>
                        setMedicalRecord((prev) => ({
                          ...prev,
                          vital_signs: {
                            ...prev.vital_signs,
                            heart_rate: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="72"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nhịp Thở (lần/phút)
                    </label>
                    <input
                      type="text"
                      value={medicalRecord.vital_signs.respiratory_rate || ""}
                      onChange={(e) =>
                        setMedicalRecord((prev) => ({
                          ...prev,
                          vital_signs: {
                            ...prev.vital_signs,
                            respiratory_rate: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="16"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cân Nặng (kg)
                    </label>
                    <input
                      type="text"
                      value={medicalRecord.vital_signs.weight || ""}
                      onChange={(e) =>
                        setMedicalRecord((prev) => ({
                          ...prev,
                          vital_signs: {
                            ...prev.vital_signs,
                            weight: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="70"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chiều Cao (cm)
                    </label>
                    <input
                      type="text"
                      value={medicalRecord.vital_signs.height || ""}
                      onChange={(e) =>
                        setMedicalRecord((prev) => ({
                          ...prev,
                          vital_signs: {
                            ...prev.vital_signs,
                            height: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="170"
                    />
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Thông Tin Khám Bệnh
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Chief Complaint with Quick Selection */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Triệu Chứng *
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setUseCustomComplaint(!useCustomComplaint)
                        }
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        {useCustomComplaint ? "Chọn Nhanh" : "Nhập Tự Do"}
                      </button>
                    </div>

                    {!useCustomComplaint ? (
                      <div className="space-y-3">
                        {chiefComplaints.map((category) => (
                          <div
                            key={category.category}
                            className="border border-gray-200 rounded-lg p-3"
                          >
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              {category.category}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {category.symptoms.map((symptom) => (
                                <label
                                  key={symptom}
                                  className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedSymptoms.includes(symptom)}
                                    onChange={() => toggleSymptom(symptom)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-gray-700">
                                    {symptom}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                        {selectedSymptoms.length > 0 && (
                          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                            <p className="text-sm text-blue-800">
                              <strong>Đã chọn:</strong>{" "}
                              {selectedSymptoms.join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <textarea
                        value={medicalRecord.chief_complaint}
                        onChange={(e) =>
                          setMedicalRecord((prev) => ({
                            ...prev,
                            chief_complaint: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Lý do khám bệnh chính"
                        required
                      />
                    )}
                  </div>

                  {/* Lab Tests / Chỉ định Cận Lâm Sàng */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chỉ Định Cận Lâm Sàng (Tùy Chọn)
                    </label>
                    {labTestTypes && labTestTypes.length > 0 ? (
                      <div className="space-y-3">
                        {/* Group by category */}
                        {[
                          "xet_nghiem",
                          "chuan_doan_hinh_anh",
                          "tham_do_chuc_nang",
                        ].map((category) => {
                          const categoryTests = labTestTypes.filter(
                            (test) => test.category === category
                          );
                          if (categoryTests.length === 0) return null;

                          const categoryName =
                            category === "xet_nghiem"
                              ? "Xét Nghiệm"
                              : category === "chuan_doan_hinh_anh"
                              ? "Chẩn Đoán Hình Ảnh"
                              : "Thăm Dò Chức Năng";

                          return (
                            <div
                              key={category}
                              className="border border-gray-200 rounded-lg p-3"
                            >
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                {categoryName}
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {categoryTests.map((test) => (
                                  <label
                                    key={test.id}
                                    className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedLabTests.includes(
                                        test.id
                                      )}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedLabTests([
                                            ...selectedLabTests,
                                            test.id,
                                          ]);
                                        } else {
                                          setSelectedLabTests(
                                            selectedLabTests.filter(
                                              (id) => id !== test.id
                                            )
                                          );
                                        }
                                      }}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700">
                                      {test.name}
                                      <span className="text-xs text-gray-500 ml-1">
                                        ({test.code})
                                      </span>
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                        {selectedLabTests.length > 0 && (
                          <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-blue-800">
                                  <strong>
                                    Đã chọn {selectedLabTests.length} xét
                                    nghiệm/chẩn đoán
                                  </strong>
                                </p>
                                {!labTestsSubmitted && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    Gửi yêu cầu ngay để phòng cận lâm sàng chuẩn
                                    bị. Có thể hoàn thành khám sau khi nhận kết
                                    quả.
                                  </p>
                                )}
                                {labTestsSubmitted && (
                                  <p className="text-xs text-green-600 mt-1 font-medium">
                                    ✓ Đã gửi yêu cầu đến phòng cận lâm sàng.
                                    Tiếp tục hoàn thành khám sau khi có kết quả.
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  submitLabTestsMutation.mutate({
                                    labTestIds: selectedLabTests,
                                  });
                                }}
                                disabled={
                                  labTestsSubmitted ||
                                  submitLabTestsMutation.isPending
                                }
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                  labTestsSubmitted ||
                                  submitLabTestsMutation.isPending
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                              >
                                {submitLabTestsMutation.isPending
                                  ? "Đang gửi..."
                                  : labTestsSubmitted
                                  ? "Đã gửi"
                                  : `Gửi Yêu Cầu (${selectedLabTests.length})`}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Đang tải danh sách xét nghiệm...
                      </p>
                    )}
                  </div>

                  {/* Lab Test Results Button */}
                  {labTests && labTests.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowLabResultsModal(true)}
                      className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors text-left"
                    >
                      <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        Kết Quả Xét Nghiệm Cận Lâm Sàng
                        {labTests.some(
                          (test) => test.status === "completed" && test.result
                        ) && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {
                              labTests.filter(
                                (test) =>
                                  test.status === "completed" && test.result
                              ).length
                            }{" "}
                            hoàn thành
                          </span>
                        )}
                        {labTests.some(
                          (test) => test.status === "in_progress"
                        ) && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
                            {
                              labTests.filter(
                                (test) => test.status === "in_progress"
                              ).length
                            }{" "}
                            đang thực hiện
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Click để xem chi tiết {labTests.length} xét nghiệm
                      </p>
                    </button>
                  )}

                  {/* Diagnosis with ICD-10 Search */}
                  <div className="relative icd10-search-container">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Chẩn Đoán (ICD-10) *
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setUseCustomDiagnosis(!useCustomDiagnosis)
                        }
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        {useCustomDiagnosis ? "Tra Mã ICD-10" : "Nhập Tự Do"}
                      </button>
                    </div>

                    {!useCustomDiagnosis ? (
                      <div className="relative">
                        <input
                          type="text"
                          value={icd10SearchQuery}
                          onChange={(e) => {
                            setIcd10SearchQuery(e.target.value);
                            setShowIcd10Dropdown(e.target.value.length >= 2);
                          }}
                          onFocus={() => {
                            if (icd10SearchQuery.length >= 2) {
                              setShowIcd10Dropdown(true);
                            }
                          }}
                          placeholder={
                            selectedIcd10
                              ? `${selectedIcd10.code} - ${selectedIcd10.name}`
                              : "Nhập mã bệnh hoặc tên bệnh (VD: J00, Viêm phổi...)"
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        {/* Hidden input for validation */}
                        <input
                          type="hidden"
                          value={medicalRecord.diagnosis}
                          required
                        />

                        {/* ICD-10 Dropdown */}
                        {showIcd10Dropdown && icd10Results.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 sticky top-0">
                              {icd10Results.length} kết quả
                            </div>
                            {icd10Results.map((icd10) => (
                              <div
                                key={icd10.id}
                                onClick={() => {
                                  setSelectedIcd10(icd10);
                                  setMedicalRecord((prev) => ({
                                    ...prev,
                                    diagnosis: `${icd10.code} - ${icd10.name}`,
                                  }));
                                  setIcd10SearchQuery("");
                                  setShowIcd10Dropdown(false);
                                  toast.success(
                                    `Đã chọn: ${icd10.code} - ${icd10.name}`
                                  );
                                }}
                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="inline-block px-2 py-0.5 text-xs font-mono font-semibold bg-blue-100 text-blue-800 rounded">
                                        {icd10.code}
                                      </span>
                                      {icd10.is_common && (
                                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                                          Phổ biến
                                        </span>
                                      )}
                                    </div>
                                    <p className="mt-1 text-sm font-medium text-gray-900">
                                      {icd10.name}
                                    </p>
                                    {icd10.name_en && (
                                      <p className="text-xs text-gray-500 italic">
                                        {icd10.name_en}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-600 mt-1">
                                      <span className="font-medium">Loại:</span>{" "}
                                      {icd10.category}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Selected ICD-10 Display */}
                        {selectedIcd10 && (
                          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block px-2 py-1 text-sm font-mono font-semibold bg-green-600 text-white rounded">
                                    {selectedIcd10.code}
                                  </span>
                                  <span className="text-sm font-medium text-gray-700">
                                    {selectedIcd10.category}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm font-medium text-gray-900">
                                  {selectedIcd10.name}
                                </p>
                                {selectedIcd10.name_en && (
                                  <p className="text-xs text-gray-600 italic mt-1">
                                    {selectedIcd10.name_en}
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedIcd10(null);
                                  setMedicalRecord((prev) => ({
                                    ...prev,
                                    diagnosis: "",
                                  }));
                                }}
                                className="ml-2 text-red-600 hover:text-red-800"
                              >
                                <svg
                                  className="w-5 h-5"
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
                              </button>
                            </div>
                          </div>
                        )}

                        {/* No results message */}
                        {showIcd10Dropdown &&
                          icd10SearchQuery.length >= 2 &&
                          icd10Results.length === 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                              <p className="text-sm text-gray-500 text-center">
                                Không tìm thấy mã bệnh phù hợp. Thử tìm bằng mã
                                khác hoặc nhập tự do.
                              </p>
                            </div>
                          )}
                      </div>
                    ) : (
                      <textarea
                        value={medicalRecord.diagnosis}
                        onChange={(e) =>
                          setMedicalRecord((prev) => ({
                            ...prev,
                            diagnosis: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Nhập chẩn đoán tự do (không theo ICD-10)"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phương Án Điều Trị
                    </label>
                    <textarea
                      value={medicalRecord.treatment_plan}
                      onChange={(e) =>
                        setMedicalRecord((prev) => ({
                          ...prev,
                          treatment_plan: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Phương án điều trị được đề xuất"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày Tái Khám
                    </label>
                    <input
                      type="date"
                      value={medicalRecord.follow_up_date}
                      onChange={(e) =>
                        setMedicalRecord((prev) => ({
                          ...prev,
                          follow_up_date: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi Chú Thêm
                  </label>
                  <textarea
                    value={medicalRecord.notes}
                    onChange={(e) =>
                      setMedicalRecord((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Ghi chú thêm hoặc quan sát"
                  />
                </div>
              </div>

              {/* Prescription */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Đơn Thuốc
                  </h3>
                </div>

                {/* Medicine Items */}
                <div data-prescription-items>
                  {medicalRecord.prescription?.items.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 mb-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-md font-medium text-gray-900">
                          Thuốc #{index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removePrescriptionItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Medicine Name with Autocomplete */}
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên thuốc *
                          </label>
                          <input
                            type="text"
                            value={item.medicine_name}
                            onChange={(e) => {
                              const value = e.target.value;
                              updatePrescriptionItem(
                                index,
                                "medicine_name",
                                value
                              );
                              searchMedicines(value, index);
                            }}
                            onFocus={() => {
                              if (item.medicine_name.length >= 2) {
                                searchMedicines(item.medicine_name, index);
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Tìm kiếm thuốc..."
                          />

                          {/* Autocomplete Dropdown */}
                          {showMedicineDropdown === index &&
                            medicineSearchResults.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {medicineSearchResults.map((medicine) => (
                                  <div
                                    key={medicine.id}
                                    onClick={() =>
                                      selectMedicine(medicine, index)
                                    }
                                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-medium text-gray-900">
                                          {medicine.name}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                          {medicine.strength} -{" "}
                                          {medicine.medicine_type}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-medium text-blue-600">
                                          {medicine.selling_price.toLocaleString()}
                                          đ
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Stock: {medicine.stock_quantity}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>

                        {/* Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loại thuốc
                          </label>
                          <input
                            type="text"
                            value={item.medicine_type || ""}
                            onChange={(e) =>
                              updatePrescriptionItem(
                                index,
                                "medicine_type",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="VD: Viên nén, Viên nang, Siro"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hàm lượng
                          </label>
                          <input
                            type="text"
                            value={item.strength || ""}
                            onChange={(e) =>
                              updatePrescriptionItem(
                                index,
                                "strength",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="VD: 500mg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Liều dùng *
                          </label>
                          <input
                            type="text"
                            value={item.dosage}
                            onChange={(e) =>
                              updatePrescriptionItem(
                                index,
                                "dosage",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="VD: 1 viên, 2 viên"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tần suất *
                          </label>
                          <input
                            type="text"
                            value={item.frequency}
                            onChange={(e) =>
                              updatePrescriptionItem(
                                index,
                                "frequency",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="VD: 2 lần/ngày, 3 lần/ngày"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Thời gian *
                          </label>
                          <input
                            type="text"
                            value={item.duration}
                            onChange={(e) =>
                              updatePrescriptionItem(
                                index,
                                "duration",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="VD: 5 ngày, 7 ngày"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số lượng *
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updatePrescriptionItem(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                          />
                        </div>

                        {/* Show price if medicine selected from database */}
                        {item.unit_price && item.unit_price > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Thông tin giá
                            </label>
                            <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm text-blue-900">
                                <span className="font-medium">Đơn giá:</span>{" "}
                                {item.unit_price.toLocaleString()}đ
                              </p>
                              <p className="text-sm text-blue-900 font-semibold">
                                <span className="font-medium">Tổng:</span>{" "}
                                {(
                                  item.unit_price * item.quantity
                                ).toLocaleString()}
                                đ
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hướng dẫn sử dụng
                        </label>
                        <textarea
                          value={item.instructions || ""}
                          onChange={(e) =>
                            updatePrescriptionItem(
                              index,
                              "instructions",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                          placeholder="Ghi chú đặc biệt cho thuốc này"
                        />
                      </div>

                      {/* Timing options */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thời điểm uống
                        </label>
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={item.morning}
                              onChange={(e) =>
                                updatePrescriptionItem(
                                  index,
                                  "morning",
                                  e.target.checked
                                )
                              }
                              className="mr-2"
                            />
                            Sáng
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={item.afternoon}
                              onChange={(e) =>
                                updatePrescriptionItem(
                                  index,
                                  "afternoon",
                                  e.target.checked
                                )
                              }
                              className="mr-2"
                            />
                            Chiều
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={item.evening}
                              onChange={(e) =>
                                updatePrescriptionItem(
                                  index,
                                  "evening",
                                  e.target.checked
                                )
                              }
                              className="mr-2"
                            />
                            Tối
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={item.before_meal}
                              onChange={(e) =>
                                updatePrescriptionItem(
                                  index,
                                  "before_meal",
                                  e.target.checked
                                )
                              }
                              className="mr-2"
                            />
                            Trước ăn
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={item.after_meal}
                              onChange={(e) =>
                                updatePrescriptionItem(
                                  index,
                                  "after_meal",
                                  e.target.checked
                                )
                              }
                              className="mr-2"
                            />
                            Sau ăn
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Medicine Button */}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={addPrescriptionItem}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Thêm Thuốc
                  </button>
                </div>

                {medicalRecord.prescription?.items.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <svg
                      className="w-12 h-12 mx-auto mb-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    </svg>
                    <p>No medicines added yet.</p>
                    <p className="text-sm">
                      Click "Add Medicine" to add medications to the
                      prescription.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    // Chỉ đóng form, KHÔNG xóa draft data từ localStorage
                    setShowExaminationForm(false);
                    setSelectedPatient(null);
                    toast.success(
                      "📝 Dữ liệu đã được tạm lưu. Bạn có thể tiếp tục sau!",
                      {
                        duration: 2000,
                      }
                    );
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Tạm Dừng
                </button>
                <button
                  type="submit"
                  disabled={createMedicalRecordMutation.isPending}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {createMedicalRecordMutation.isPending
                    ? "Đang lưu..."
                    : "Hoàn Thành Khám"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Patient History Modal */}
      {showHistoryModal && patientHistory && (
        <PatientHistoryModal
          history={patientHistory.history}
          patientName={patientHistory.patient_name}
          onClose={() => {
            setShowHistoryModal(false);
            setHistoryPatientId(null);
          }}
        />
      )}

      {/* Lab Results Modal */}
      {showLabResultsModal && labTests && labTests.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLabResultsModal(false)}
          />
          <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-white px-6 py-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Kết Quả Xét Nghiệm Cận Lâm Sàng
                </h3>
                <button
                  onClick={() => setShowLabResultsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg
                    className="h-6 w-6"
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
                </button>
              </div>

              <div className="space-y-4">
                {labTests.map((test) => (
                  <div
                    key={test.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5 className="font-semibold text-lg text-gray-900">
                          {test.lab_test_type.name}
                        </h5>
                        <p className="text-sm text-gray-500 mt-1">
                          Mã XN: {test.lab_test_type.code} | Yêu cầu lúc:{" "}
                          {new Date(test.ordered_at).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          test.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : test.status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {test.status === "completed"
                          ? "✓ Hoàn Thành"
                          : test.status === "in_progress"
                          ? "⏳ Đang Thực Hiện"
                          : "⌛ Chờ Xử Lý"}
                      </span>
                    </div>

                    {test.result && (
                      <div className="mt-3 space-y-3">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-sm font-medium text-gray-600 mb-2">
                            Kết quả:
                          </p>
                          <p className="text-base text-gray-900 whitespace-pre-wrap">
                            {test.result}
                          </p>
                        </div>
                        {test.interpretation && (
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-sm font-medium text-gray-600 mb-2">
                              Nhận xét:
                            </p>
                            <p className="text-base text-gray-900 whitespace-pre-wrap">
                              {test.interpretation}
                            </p>
                          </div>
                        )}
                        {test.performed_by && (
                          <p className="text-sm text-gray-500">
                            Thực hiện bởi:{" "}
                            <span className="font-medium">
                              {test.performed_by.name}
                            </span>
                            {test.completed_at &&
                              ` | ${new Date(test.completed_at).toLocaleString(
                                "vi-VN"
                              )}`}
                          </p>
                        )}
                      </div>
                    )}

                    {!test.result && test.status === "in_progress" && (
                      <p className="text-sm text-blue-600 italic mt-2">
                        Kỹ thuật viên đang thực hiện xét nghiệm...
                      </p>
                    )}

                    {!test.result && test.status === "pending" && (
                      <p className="text-sm text-yellow-600 italic mt-2">
                        Chờ kỹ thuật viên bắt đầu thực hiện...
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowLabResultsModal(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DoctorLayout>
  );
}
