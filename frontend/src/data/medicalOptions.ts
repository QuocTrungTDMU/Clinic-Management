// Medical examination options for quick selection

export interface ChiefComplaintOption {
  category: string;
  symptoms: string[];
}

export interface DiagnosisOption {
  category: string;
  diagnoses: string[];
}

export interface PhysicalExamOption {
  system: string;
  findings: string[];
}

// Chief Complaints - organized by category
export const chiefComplaints: ChiefComplaintOption[] = [
  {
    category: "Hô Hấp",
    symptoms: ["Ho", "Sổ mũi", "Đau họng", "Khó thở", "Đau ngực", "Ho có đờm"],
  },
  {
    category: "Sốt & Đau",
    symptoms: [
      "Sốt",
      "Đau đầu",
      "Đau mỏi cơ thể",
      "Ớn lạnh",
      "Đau khớp",
      "Đau cơ",
    ],
  },
  {
    category: "Tiêu Hóa",
    symptoms: [
      "Đau bụng",
      "Buồn nôn",
      "Nôn",
      "Tiêu chảy",
      "Táo bón",
      "Chán ăn",
      "Ợ nóng",
    ],
  },
  {
    category: "Da Liễu",
    symptoms: ["Phát ban", "Ngứa", "Sưng", "Bầm tím", "Vết thương"],
  },
  {
    category: "Tổng Quát",
    symptoms: ["Mệt mỏi", "Chóng mặt", "Yếu người", "Giảm cân", "Mất ngủ"],
  },
];

// Common Diagnoses
export const diagnoses: DiagnosisOption[] = [
  {
    category: "Nhiễm Trùng Hô Hấp",
    diagnoses: [
      "Cảm lạnh thông thường",
      "Cúm",
      "Viêm đường hô hấp trên",
      "Viêm phế quản cấp",
      "Viêm họng",
      "Viêm amidan",
    ],
  },
  {
    category: "Rối Loạn Tiêu Hóa",
    diagnoses: [
      "Viêm dạ dày",
      "Viêm dạ dày ruột",
      "Ngộ độc thực phẩm",
      "Loét dạ dày",
      "Hội chứng ruột kích thích",
    ],
  },
  {
    category: "Bệnh Da Liễu",
    diagnoses: [
      "Viêm da tiếp xúc",
      "Phản ứng dị ứng",
      "Nhiễm nấm",
      "Chàm",
      "Mề đay",
    ],
  },
  {
    category: "Cơ Xương Khớp",
    diagnoses: ["Căng cơ", "Bong gân", "Đau lưng", "Viêm khớp"],
  },
  {
    category: "Bệnh Phổ Biến Khác",
    diagnoses: [
      "Tăng huyết áp",
      "Đái tháo đường",
      "Đau nửa đầu",
      "Lo âu",
      "Mất ngủ",
    ],
  },
];

// Physical Examination Findings
export const physicalExamFindings: PhysicalExamOption[] = [
  {
    system: "Toàn Thân",
    findings: [
      "Ngoại hình bình thường",
      "Có vẻ ốm",
      "Tỉnh táo, định hướng tốt",
      "Khó chịu nhẹ",
    ],
  },
  {
    system: "Họng/Tai Mũi Họng",
    findings: ["Họng bình thường", "Họng đỏ", "Amidan sưng", "Nghẹt mũi"],
  },
  {
    system: "Hô Hấp",
    findings: ["Phổi trong sạch", "Có ran rít", "Giảm âm thở", "Nghe ran ẩm"],
  },
  {
    system: "Tim Mạch",
    findings: ["Tim đập bình thường", "Nhịp đều", "Không tiếng thổi"],
  },
  {
    system: "Bụng",
    findings: [
      "Mềm, không đau",
      "Có đau khi ấn",
      "Nhu động ruột bình thường",
      "Chướng bụng",
    ],
  },
  {
    system: "Da",
    findings: ["Không phát ban", "Có phát ban", "Không tổn thương", "Có sưng"],
  },
];

// Vital Signs Normal Ranges
export const normalVitalSigns = {
  temperature: "36.5",
  blood_pressure: "120/80",
  heart_rate: "72",
  respiratory_rate: "16",
  weight: "",
  height: "",
};

// Treatment Plan Templates
export const treatmentTemplates = [
  {
    name: "Common Cold",
    plan: "Rest, hydration, symptomatic treatment. Monitor for complications.",
  },
  {
    name: "Gastritis",
    plan: "Dietary modifications, avoid spicy/acidic foods, medication as prescribed.",
  },
  {
    name: "Hypertension",
    plan: "Lifestyle modifications, regular BP monitoring, medication compliance.",
  },
  {
    name: "Diabetes",
    plan: "Blood sugar monitoring, dietary control, regular exercise, medication.",
  },
];
