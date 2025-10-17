import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../lib/axios";
import PatientHistoryModal from "../../components/PatientHistoryModal";
import {
  chiefComplaints,
  diagnoses,
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

export function ExaminationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showExaminationForm, setShowExaminationForm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyPatientId, setHistoryPatientId] = useState<number | null>(null);

  // Quick selection states
  const [useCustomComplaint, setUseCustomComplaint] = useState(false);
  const [useCustomDiagnosis, setUseCustomDiagnosis] = useState(false);
  const [useCustomPhysicalExam, setUseCustomPhysicalExam] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedFindings, setSelectedFindings] = useState<string[]>([]);

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
    refetchInterval: 30000, // Refetch every 30 seconds
  });

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

  // Create medical record mutation
  const createMedicalRecordMutation = useMutation({
    mutationFn: async (data: MedicalRecordData) => {
      const response = await api.post("/medical-records", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Medical record created successfully!");
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
    setMedicalRecord((prev) => ({
      ...prev,
      appointment_id: patient.appointment_id,
      patient_id: patient.patient_id,
    }));
    setShowExaminationForm(true);
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
            dosage: "",
            frequency: "",
            duration: "",
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/doctor")}
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Patient Examination
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              {queueData?.total_count || 0} patients in queue
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {!showExaminationForm ? (
          // Patient Queue View
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Patient Queue
              </h2>
              <p className="mt-2 text-gray-600">
                Select a patient to begin examination
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
                  No patients in queue
                </h3>
                <p className="text-gray-500">
                  There are currently no patients waiting for examination.
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
                                In Progress
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 space-y-1">
                              <p>Phone: {patient.patient_phone}</p>
                              <p>
                                DOB:{" "}
                                {new Date(
                                  patient.patient_dob
                                ).toLocaleDateString()}
                              </p>
                              <p>Gender: {patient.patient_gender}</p>
                              <p>Appointment: {patient.appointment_time}</p>
                              <p>Type: {patient.appointment_type}</p>
                              {patient.reason && (
                                <p>Reason: {patient.reason}</p>
                              )}
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
                            View History
                          </button>
                          <button
                            onClick={() => handleStartExamination(patient)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Start Examination
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
                    Medical Examination
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Patient: {selectedPatient?.patient_name}
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
              {/* Basic Information */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Examination Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Chief Complaint with Quick Selection */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Chief Complaint *
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setUseCustomComplaint(!useCustomComplaint)
                        }
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        {useCustomComplaint
                          ? "Use Quick Select"
                          : "Custom Input"}
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
                              <strong>Selected:</strong>{" "}
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
                        placeholder="Patient's main concern or reason for visit"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Symptoms (Optional)
                    </label>
                    <textarea
                      value={medicalRecord.symptoms}
                      onChange={(e) =>
                        setMedicalRecord((prev) => ({
                          ...prev,
                          symptoms: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Additional detailed symptoms"
                    />
                  </div>

                  {/* Physical Examination with Quick Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Physical Examination
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setUseCustomPhysicalExam(!useCustomPhysicalExam)
                        }
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        {useCustomPhysicalExam
                          ? "Use Quick Select"
                          : "Custom Input"}
                      </button>
                    </div>

                    {!useCustomPhysicalExam ? (
                      <div className="space-y-2">
                        {physicalExamFindings.map((system) => (
                          <div
                            key={system.system}
                            className="border border-gray-200 rounded p-2"
                          >
                            <h5 className="text-xs font-medium text-gray-600 mb-1">
                              {system.system}
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {system.findings.map((finding) => (
                                <label
                                  key={finding}
                                  className="flex items-center space-x-1 text-xs cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedFindings.includes(finding)}
                                    onChange={() => toggleFinding(finding)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span>{finding}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                        {selectedFindings.length > 0 && (
                          <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                            <p className="text-xs text-green-800">
                              <strong>Findings:</strong>{" "}
                              {selectedFindings.join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <textarea
                        value={medicalRecord.physical_examination}
                        onChange={(e) =>
                          setMedicalRecord((prev) => ({
                            ...prev,
                            physical_examination: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Physical examination findings"
                      />
                    )}
                  </div>

                  {/* Diagnosis with Dropdown */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Diagnosis *
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setUseCustomDiagnosis(!useCustomDiagnosis)
                        }
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        {useCustomDiagnosis
                          ? "Use Quick Select"
                          : "Custom Input"}
                      </button>
                    </div>

                    {!useCustomDiagnosis ? (
                      <select
                        value={medicalRecord.diagnosis}
                        onChange={(e) =>
                          setMedicalRecord((prev) => ({
                            ...prev,
                            diagnosis: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select diagnosis...</option>
                        {diagnoses.map((category) => (
                          <optgroup
                            key={category.category}
                            label={category.category}
                          >
                            {category.diagnoses.map((diagnosis) => (
                              <option key={diagnosis} value={diagnosis}>
                                {diagnosis}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                        <option value="__custom__">Other (Custom input)</option>
                      </select>
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
                        placeholder="Enter custom diagnosis"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Treatment Plan
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
                      placeholder="Recommended treatment plan"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Follow-up Date
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
                    Additional Notes
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
                    placeholder="Additional notes or observations"
                  />
                </div>
              </div>

              {/* Vital Signs */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Vital Signs
                  </h3>
                  <button
                    type="button"
                    onClick={applyNormalVitalSigns}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Apply Normal Range
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature (°C)
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
                      Blood Pressure
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
                      Heart Rate (bpm)
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
                      Respiratory Rate
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
                      Weight (kg)
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
                      Height (cm)
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

              {/* Prescription */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Prescription
                  </h3>
                  <button
                    type="button"
                    onClick={addPrescriptionItem}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Add Medicine
                  </button>
                </div>

                {/* Prescription General Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      General Instructions
                    </label>
                    <textarea
                      value={
                        medicalRecord.prescription?.general_instructions || ""
                      }
                      onChange={(e) =>
                        setMedicalRecord((prev) => ({
                          ...prev,
                          prescription: {
                            ...prev.prescription!,
                            general_instructions: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="General instructions for patient"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precautions
                    </label>
                    <textarea
                      value={medicalRecord.prescription?.precautions || ""}
                      onChange={(e) =>
                        setMedicalRecord((prev) => ({
                          ...prev,
                          prescription: {
                            ...prev.prescription!,
                            precautions: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Important precautions"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diet Advice
                    </label>
                    <textarea
                      value={medicalRecord.prescription?.diet_advice || ""}
                      onChange={(e) =>
                        setMedicalRecord((prev) => ({
                          ...prev,
                          prescription: {
                            ...prev.prescription!,
                            diet_advice: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Dietary recommendations"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lifestyle Advice
                    </label>
                    <textarea
                      value={medicalRecord.prescription?.lifestyle_advice || ""}
                      onChange={(e) =>
                        setMedicalRecord((prev) => ({
                          ...prev,
                          prescription: {
                            ...prev.prescription!,
                            lifestyle_advice: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Lifestyle recommendations"
                    />
                  </div>
                </div>

                {/* Medicine Items */}
                {medicalRecord.prescription?.items.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 mb-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-md font-medium text-gray-900">
                        Medicine #{index + 1}
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
                          Medicine Name * (Tên thuốc)
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
                          placeholder="Search medicine..."
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
                          Type (Loại thuốc)
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
                          placeholder="e.g., Tablet, Capsule, Syrup"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Strength (Hàm lượng)
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
                          placeholder="e.g., 500mg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dosage * (Liều dùng)
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
                          placeholder="e.g., 1 tablet"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequency * (Tần suất)
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
                          placeholder="e.g., 3 times daily"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration * (Thời gian)
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
                          placeholder="e.g., 7 days"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity * (Số lượng)
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
                            Price Info (Thông tin giá)
                          </label>
                          <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-900">
                              <span className="font-medium">Unit:</span>{" "}
                              {item.unit_price.toLocaleString()}đ
                            </p>
                            <p className="text-sm text-blue-900 font-semibold">
                              <span className="font-medium">Total:</span>{" "}
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
                        Instructions (Hướng dẫn sử dụng)
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
                        placeholder="Special instructions for this medicine"
                      />
                    </div>

                    {/* Timing options */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timing (Thời điểm uống)
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
                          Morning (Sáng)
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
                          Afternoon (Chiều)
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
                          Evening (Tối)
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
                          Before Meal (Trước ăn)
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
                          After Meal (Sau ăn)
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

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
                    setShowExaminationForm(false);
                    setSelectedPatient(null);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMedicalRecordMutation.isPending}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {createMedicalRecordMutation.isPending
                    ? "Saving..."
                    : "Complete Examination"}
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
    </div>
  );
}
