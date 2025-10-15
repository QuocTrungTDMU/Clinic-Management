import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";

export function TestPage() {
  // Test API connection
  const { data: queueData, isLoading, error } = useQuery({
    queryKey: ["test-doctor-queue"],
    queryFn: async () => {
      const response = await api.get("/doctor/queue");
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Testing API connection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.684-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">API Connection Error</h3>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : "Failed to connect to API"}
          </p>
          <div className="bg-gray-100 rounded-lg p-4 text-left text-sm">
            <strong>Debug Information:</strong>
            <pre className="mt-2 text-xs">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Doctor Queue API Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">API Response</h2>
          <div className="bg-gray-100 rounded-lg p-4">
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(queueData, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Patients in Queue ({queueData?.total_count || 0})
          </h2>
          
          {queueData?.patients?.length === 0 ? (
            <p className="text-gray-500">No patients in queue</p>
          ) : (
            <div className="space-y-4">
              {queueData?.patients?.map((patient: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{patient.patient_name}</h3>
                      <p className="text-sm text-gray-600">Phone: {patient.patient_phone}</p>
                      <p className="text-sm text-gray-600">DOB: {patient.patient_dob}</p>
                      <p className="text-sm text-gray-600">Gender: {patient.patient_gender}</p>
                      <p className="text-sm text-gray-600">Appointment: {patient.appointment_time}</p>
                      <p className="text-sm text-gray-600">Type: {patient.appointment_type}</p>
                      <p className="text-sm text-gray-600">Reason: {patient.reason}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        In Progress
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        ID: {patient.appointment_id}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/doctor/examination" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Examination Page
          </a>
        </div>
      </div>
    </div>
  );
}