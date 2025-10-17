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
    category: "Respiratory",
    symptoms: [
      "Cough (Ho)",
      "Runny nose (Sổ mũi)",
      "Sore throat (Đau họng)",
      "Difficulty breathing (Khó thở)",
      "Chest pain (Đau ngực)",
      "Cough with phlegm (Ho có đờm)",
    ],
  },
  {
    category: "Fever & Pain",
    symptoms: [
      "Fever (Sốt)",
      "Headache (Đau đầu)",
      "Body aches (Đau mỏi cơ thể)",
      "Chills (Ớn lạnh)",
      "Joint pain (Đau khớp)",
      "Muscle pain (Đau cơ)",
    ],
  },
  {
    category: "Digestive",
    symptoms: [
      "Abdominal pain (Đau bụng)",
      "Nausea (Buồn nôn)",
      "Vomiting (Nôn)",
      "Diarrhea (Tiêu chảy)",
      "Constipation (Táo bón)",
      "Loss of appetite (Chán ăn)",
      "Heartburn (Ợ nóng)",
    ],
  },
  {
    category: "Skin",
    symptoms: [
      "Rash (Phát ban)",
      "Itching (Ngứa)",
      "Swelling (Sưng)",
      "Bruising (Bầm tím)",
      "Wound (Vết thương)",
    ],
  },
  {
    category: "General",
    symptoms: [
      "Fatigue (Mệt mỏi)",
      "Dizziness (Chóng mặt)",
      "Weakness (Yếu người)",
      "Weight loss (Giảm cân)",
      "Sleep problems (Mất ngủ)",
    ],
  },
];

// Common Diagnoses
export const diagnoses: DiagnosisOption[] = [
  {
    category: "Respiratory Infections",
    diagnoses: [
      "Common cold (Cảm lạnh thông thường)",
      "Influenza (Cúm)",
      "Upper respiratory tract infection (Viêm đường hô hấp trên)",
      "Acute bronchitis (Viêm phế quản cấp)",
      "Pharyngitis (Viêm họng)",
      "Tonsillitis (Viêm amidan)",
    ],
  },
  {
    category: "Digestive Disorders",
    diagnoses: [
      "Gastritis (Viêm dạ dày)",
      "Gastroenteritis (Viêm dạ dày ruột)",
      "Food poisoning (Ngộ độc thực phẩm)",
      "Peptic ulcer (Loét dạ dày)",
      "Irritable bowel syndrome (Hội chứng ruột kích thích)",
    ],
  },
  {
    category: "Skin Conditions",
    diagnoses: [
      "Contact dermatitis (Viêm da tiếp xúc)",
      "Allergic reaction (Phản ứng dị ứng)",
      "Fungal infection (Nhiễm nấm)",
      "Eczema (Chàm)",
      "Urticaria (Mề đay)",
    ],
  },
  {
    category: "Musculoskeletal",
    diagnoses: [
      "Muscle strain (Căng cơ)",
      "Sprain (Bong gân)",
      "Back pain (Đau lưng)",
      "Arthritis (Viêm khớp)",
    ],
  },
  {
    category: "Other Common",
    diagnoses: [
      "Hypertension (Tăng huyết áp)",
      "Diabetes mellitus (Đái tháo đường)",
      "Migraine (Đau nửa đầu)",
      "Anxiety (Lo âu)",
      "Insomnia (Mất ngủ)",
    ],
  },
];

// Physical Examination Findings
export const physicalExamFindings: PhysicalExamOption[] = [
  {
    system: "General (Toàn thân)",
    findings: [
      "Normal appearance (Ngoại hình bình thường)",
      "Appears ill (Có vẻ ốm)",
      "Alert and oriented (Tỉnh táo, định hướng tốt)",
      "Mild distress (Khó chịu nhẹ)",
    ],
  },
  {
    system: "Throat/ENT (Họng/Tai Mũi Họng)",
    findings: [
      "Throat normal (Họng bình thường)",
      "Throat redness (Họng đỏ)",
      "Tonsils enlarged (Amidan sưng)",
      "Nasal congestion (Nghẹt mũi)",
    ],
  },
  {
    system: "Respiratory (Hô hấp)",
    findings: [
      "Lungs clear (Phổi trong sạch)",
      "Wheezing present (Có ran rít)",
      "Decreased breath sounds (Giảm âm thở)",
      "Crackles heard (Nghe ran ẩm)",
    ],
  },
  {
    system: "Cardiovascular (Tim mạch)",
    findings: [
      "Heart sounds normal (Tim đập bình thường)",
      "Regular rhythm (Nhịp đều)",
      "No murmurs (Không tiếng thổi)",
    ],
  },
  {
    system: "Abdomen (Bụng)",
    findings: [
      "Soft, non-tender (Mềm, không đau)",
      "Tenderness present (Có đau khi ấn)",
      "Bowel sounds normal (Nhu động ruột bình thường)",
      "Distended (Chướng bụng)",
    ],
  },
  {
    system: "Skin (Da)",
    findings: [
      "No rash (Không phát ban)",
      "Rash present (Có phát ban)",
      "No lesions (Không tổn thương)",
      "Swelling noted (Có sưng)",
    ],
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
