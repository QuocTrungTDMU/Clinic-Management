import React from "react";

interface MedicalHistory {
  id: number;
  visit_date: string;
  doctor_name: string;
  chief_complaint: string;
  diagnosis: string;
  treatment_plan: string;
  vital_signs: any;
  prescriptions: Array<{
    id: number;
    medications: Array<{
      medicine_name: string;
      strength?: string;
      dosage: string;
      frequency: string;
      duration: string;
    }>;
    general_instructions?: string;
  }>;
}

interface Props {
  patientName: string;
  history: MedicalHistory[];
  onClose: () => void;
}

export function PatientHistoryModal({ patientName, history, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Lịch sử khám bệnh
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Bệnh nhân: {patientName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {history.length === 0 ? (
            <div className="text-center py-12">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-500">Chưa có lịch sử khám bệnh</p>
            </div>
          ) : (
            <div className="space-y-6">
              {history.map((record, index) => (
                <div
                  key={record.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  {/* Visit Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Lần khám #{history.length - index}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(record.visit_date).toLocaleDateString(
                          "vi-VN"
                        )}{" "}
                        - BS. {record.doctor_name}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      Đã khám
                    </span>
                  </div>

                  {/* Medical Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Lý do khám:
                      </p>
                      <p className="text-sm text-gray-900">
                        {record.chief_complaint}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Chẩn đoán:
                      </p>
                      <p className="text-sm text-gray-900 font-medium text-red-600">
                        {record.diagnosis}
                      </p>
                    </div>
                  </div>

                  {record.treatment_plan && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Phương pháp điều trị:
                      </p>
                      <p className="text-sm text-gray-900">
                        {record.treatment_plan}
                      </p>
                    </div>
                  )}

                  {/* Vital Signs */}
                  {record.vital_signs &&
                    Object.keys(record.vital_signs).length > 0 && (
                      <div className="mb-4 bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Sinh hiệu:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          {record.vital_signs.temperature && (
                            <div>
                              <span className="text-gray-600">Nhiệt độ:</span>{" "}
                              <span className="font-medium">
                                {record.vital_signs.temperature}°C
                              </span>
                            </div>
                          )}
                          {record.vital_signs.blood_pressure && (
                            <div>
                              <span className="text-gray-600">Huyết áp:</span>{" "}
                              <span className="font-medium">
                                {record.vital_signs.blood_pressure}
                              </span>
                            </div>
                          )}
                          {record.vital_signs.heart_rate && (
                            <div>
                              <span className="text-gray-600">Nhịp tim:</span>{" "}
                              <span className="font-medium">
                                {record.vital_signs.heart_rate} bpm
                              </span>
                            </div>
                          )}
                          {record.vital_signs.weight && (
                            <div>
                              <span className="text-gray-600">Cân nặng:</span>{" "}
                              <span className="font-medium">
                                {record.vital_signs.weight} kg
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Prescriptions */}
                  {record.prescriptions && record.prescriptions.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Đơn thuốc:
                      </p>
                      {record.prescriptions.map((prescription) => (
                        <div key={prescription.id} className="space-y-2">
                          {prescription.medications.map((med, medIndex) => (
                            <div
                              key={medIndex}
                              className="flex items-start space-x-2 text-sm"
                            >
                              <span className="text-blue-600 font-medium">
                                {medIndex + 1}.
                              </span>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {med.medicine_name}{" "}
                                  {med.strength && `(${med.strength})`}
                                </p>
                                <p className="text-gray-600">
                                  {med.dosage} x {med.frequency} -{" "}
                                  {med.duration}
                                </p>
                              </div>
                            </div>
                          ))}
                          {prescription.general_instructions && (
                            <div className="mt-2 text-sm text-gray-600 italic">
                              <span className="font-medium">Lưu ý:</span>{" "}
                              {prescription.general_instructions}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default PatientHistoryModal;
