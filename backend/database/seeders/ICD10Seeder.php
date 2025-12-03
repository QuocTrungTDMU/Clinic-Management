<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ICD10Seeder extends Seeder
{
    public function run(): void
    {
        $diseases = [
            // ============ BỆNH HÔ HẤP (Respiratory) ============
            ['code' => 'J00', 'name' => 'Viêm mũi họng cấp', 'name_en' => 'Acute nasopharyngitis', 'category' => 'Bệnh hô hấp', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'J01', 'name' => 'Viêm xoang cấp', 'name_en' => 'Acute sinusitis', 'category' => 'Bệnh hô hấp', 'specialty' => 'ent', 'is_common' => true],
            ['code' => 'J02', 'name' => 'Viêm họng cấp', 'name_en' => 'Acute pharyngitis', 'category' => 'Bệnh hô hấp', 'specialty' => 'ent', 'is_common' => true],
            ['code' => 'J03', 'name' => 'Viêm amidan cấp', 'name_en' => 'Acute tonsillitis', 'category' => 'Bệnh hô hấp', 'specialty' => 'ent', 'is_common' => true],
            ['code' => 'J04', 'name' => 'Viêm thanh quản cấp', 'name_en' => 'Acute laryngitis', 'category' => 'Bệnh hô hấp', 'specialty' => 'ent', 'is_common' => true],
            ['code' => 'J06', 'name' => 'Nhiễm trùng đường hô hấp trên cấp', 'name_en' => 'Acute upper respiratory infection', 'category' => 'Bệnh hô hấp', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'J11', 'name' => 'Cúm', 'name_en' => 'Influenza', 'category' => 'Bệnh hô hấp', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'J18', 'name' => 'Viêm phổi', 'name_en' => 'Pneumonia', 'category' => 'Bệnh hô hấp', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'J20', 'name' => 'Viêm phế quản cấp', 'name_en' => 'Acute bronchitis', 'category' => 'Bệnh hô hấp', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'J40', 'name' => 'Viêm phế quản mạn', 'name_en' => 'Chronic bronchitis', 'category' => 'Bệnh hô hấp', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'J44', 'name' => 'Bệnh phổi tắc nghẽn mạn', 'name_en' => 'COPD', 'category' => 'Bệnh hô hấp', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'J45', 'name' => 'Hen phế quản', 'name_en' => 'Asthma', 'category' => 'Bệnh hô hấp', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'J32', 'name' => 'Viêm xoang mạn', 'name_en' => 'Chronic sinusitis', 'category' => 'Bệnh hô hấp', 'specialty' => 'ent', 'is_common' => true],

            // ============ BỆNH TIÊU HÓA (Digestive) ============
            ['code' => 'A09', 'name' => 'Tiêu chảy cấp', 'name_en' => 'Acute diarrhea', 'category' => 'Bệnh tiêu hóa', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'K21', 'name' => 'Trào ngược dạ dày thực quản', 'name_en' => 'GERD', 'category' => 'Bệnh tiêu hóa', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'K25', 'name' => 'Loét dạ dày', 'name_en' => 'Gastric ulcer', 'category' => 'Bệnh tiêu hóa', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'K26', 'name' => 'Loét tá tràng', 'name_en' => 'Duodenal ulcer', 'category' => 'Bệnh tiêu hóa', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'K29', 'name' => 'Viêm dạ dày', 'name_en' => 'Gastritis', 'category' => 'Bệnh tiêu hóa', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'K30', 'name' => 'Khó tiêu', 'name_en' => 'Dyspepsia', 'category' => 'Bệnh tiêu hóa', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'K35', 'name' => 'Viêm ruột thừa cấp', 'name_en' => 'Acute appendicitis', 'category' => 'Bệnh tiêu hóa', 'specialty' => 'surgery', 'is_common' => true],
            ['code' => 'K52', 'name' => 'Viêm dạ dày - ruột cấp', 'name_en' => 'Acute gastroenteritis', 'category' => 'Bệnh tiêu hóa', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'K58', 'name' => 'Hội chứng ruột kích thích', 'name_en' => 'IBS', 'category' => 'Bệnh tiêu hóa', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'K59.0', 'name' => 'Táo bón', 'name_en' => 'Constipation', 'category' => 'Bệnh tiêu hóa', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'K70', 'name' => 'Bệnh gan do rượu', 'name_en' => 'Alcoholic liver disease', 'category' => 'Bệnh tiêu hóa', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'K74', 'name' => 'Xơ gan', 'name_en' => 'Cirrhosis', 'category' => 'Bệnh tiêu hóa', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'K80', 'name' => 'Sỏi mật', 'name_en' => 'Cholelithiasis', 'category' => 'Bệnh tiêu hóa', 'specialty' => 'surgery', 'is_common' => true],
            ['code' => 'K81', 'name' => 'Viêm túi mật', 'name_en' => 'Cholecystitis', 'category' => 'Bệnh tiêu hóa', 'specialty' => 'surgery', 'is_common' => true],

            // ============ BỆNH TIM MẠCH (Cardiovascular) ============
            ['code' => 'I10', 'name' => 'Tăng huyết áp', 'name_en' => 'Hypertension', 'category' => 'Bệnh tim mạch', 'specialty' => 'cardiology', 'is_common' => true],
            ['code' => 'I20', 'name' => 'Đau thắt ngực', 'name_en' => 'Angina pectoris', 'category' => 'Bệnh tim mạch', 'specialty' => 'cardiology', 'is_common' => true],
            ['code' => 'I21', 'name' => 'Nhồi máu cơ tim cấp', 'name_en' => 'Acute myocardial infarction', 'category' => 'Bệnh tim mạch', 'specialty' => 'cardiology', 'is_common' => false],
            ['code' => 'I25', 'name' => 'Bệnh tim thiếu máu mạn', 'name_en' => 'Chronic ischemic heart disease', 'category' => 'Bệnh tim mạch', 'specialty' => 'cardiology', 'is_common' => true],
            ['code' => 'I48', 'name' => 'Rung nhĩ', 'name_en' => 'Atrial fibrillation', 'category' => 'Bệnh tim mạch', 'specialty' => 'cardiology', 'is_common' => true],
            ['code' => 'I50', 'name' => 'Suy tim', 'name_en' => 'Heart failure', 'category' => 'Bệnh tim mạch', 'specialty' => 'cardiology', 'is_common' => true],
            ['code' => 'I63', 'name' => 'Nhồi máu não', 'name_en' => 'Cerebral infarction', 'category' => 'Bệnh tim mạch', 'specialty' => 'cardiology', 'is_common' => true],
            ['code' => 'I64', 'name' => 'Đột quỵ', 'name_en' => 'Stroke', 'category' => 'Bệnh tim mạch', 'specialty' => 'cardiology', 'is_common' => true],
            ['code' => 'I73', 'name' => 'Bệnh mạch máu ngoại biên', 'name_en' => 'Peripheral vascular disease', 'category' => 'Bệnh tim mạch', 'specialty' => 'cardiology', 'is_common' => true],
            ['code' => 'I95', 'name' => 'Hạ huyết áp', 'name_en' => 'Hypotension', 'category' => 'Bệnh tim mạch', 'specialty' => 'cardiology', 'is_common' => true],

            // ============ BỆNH NỘI TIẾT (Endocrine) ============
            ['code' => 'E10', 'name' => 'Đái tháo đường type 1', 'name_en' => 'Type 1 diabetes mellitus', 'category' => 'Bệnh nội tiết', 'specialty' => 'internal', 'is_common' => false],
            ['code' => 'E11', 'name' => 'Đái tháo đường type 2', 'name_en' => 'Type 2 diabetes mellitus', 'category' => 'Bệnh nội tiết', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'E03', 'name' => 'Suy giáp', 'name_en' => 'Hypothyroidism', 'category' => 'Bệnh nội tiết', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'E05', 'name' => 'Cường giáp', 'name_en' => 'Hyperthyroidism', 'category' => 'Bệnh nội tiết', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'E04', 'name' => 'Bướu giáp', 'name_en' => 'Goiter', 'category' => 'Bệnh nội tiết', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'E66', 'name' => 'Béo phì', 'name_en' => 'Obesity', 'category' => 'Bệnh nội tiết', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'E78', 'name' => 'Rối loạn lipid máu', 'name_en' => 'Dyslipidemia', 'category' => 'Bệnh nội tiết', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'E55', 'name' => 'Thiếu vitamin D', 'name_en' => 'Vitamin D deficiency', 'category' => 'Bệnh nội tiết', 'specialty' => 'internal', 'is_common' => true],

            // ============ BỆNH DA LIỄU (Dermatology) ============
            ['code' => 'L20', 'name' => 'Viêm da cơ địa', 'name_en' => 'Atopic dermatitis', 'category' => 'Bệnh da liễu', 'specialty' => 'dermatology', 'is_common' => true],
            ['code' => 'L21', 'name' => 'Viêm da tiết bã', 'name_en' => 'Seborrheic dermatitis', 'category' => 'Bệnh da liễu', 'specialty' => 'dermatology', 'is_common' => true],
            ['code' => 'L23', 'name' => 'Viêm da dị ứng', 'name_en' => 'Allergic contact dermatitis', 'category' => 'Bệnh da liễu', 'specialty' => 'dermatology', 'is_common' => true],
            ['code' => 'L30', 'name' => 'Viêm da', 'name_en' => 'Dermatitis', 'category' => 'Bệnh da liễu', 'specialty' => 'dermatology', 'is_common' => true],
            ['code' => 'L40', 'name' => 'Vảy nến', 'name_en' => 'Psoriasis', 'category' => 'Bệnh da liễu', 'specialty' => 'dermatology', 'is_common' => true],
            ['code' => 'L50', 'name' => 'Mề đay', 'name_en' => 'Urticaria', 'category' => 'Bệnh da liễu', 'specialty' => 'dermatology', 'is_common' => true],
            ['code' => 'L60', 'name' => 'Bệnh móng', 'name_en' => 'Nail disorders', 'category' => 'Bệnh da liễu', 'specialty' => 'dermatology', 'is_common' => true],
            ['code' => 'L70', 'name' => 'Mụn trứng cá', 'name_en' => 'Acne', 'category' => 'Bệnh da liễu', 'specialty' => 'dermatology', 'is_common' => true],
            ['code' => 'L81', 'name' => 'Rối loạn sắc tố da', 'name_en' => 'Pigmentation disorders', 'category' => 'Bệnh da liễu', 'specialty' => 'dermatology', 'is_common' => true],
            ['code' => 'B35', 'name' => 'Nấm da', 'name_en' => 'Dermatophytosis', 'category' => 'Bệnh da liễu', 'specialty' => 'dermatology', 'is_common' => true],
            ['code' => 'B37', 'name' => 'Nhiễm nấm candida', 'name_en' => 'Candidiasis', 'category' => 'Bệnh da liễu', 'specialty' => 'dermatology', 'is_common' => true],
            ['code' => 'L02', 'name' => 'Áp xe da', 'name_en' => 'Cutaneous abscess', 'category' => 'Bệnh da liễu', 'specialty' => 'dermatology', 'is_common' => true],

            // ============ BỆNH CƠ XƯƠNG KHỚP (Musculoskeletal) ============
            ['code' => 'M10', 'name' => 'Gút (Gout)', 'name_en' => 'Gout', 'category' => 'Bệnh cơ xương khớp', 'specialty' => 'orthopedics', 'is_common' => true],
            ['code' => 'M15', 'name' => 'Thoái hóa khớp', 'name_en' => 'Osteoarthritis', 'category' => 'Bệnh cơ xương khớp', 'specialty' => 'orthopedics', 'is_common' => true],
            ['code' => 'M16', 'name' => 'Thoái hóa khớp háng', 'name_en' => 'Hip osteoarthritis', 'category' => 'Bệnh cơ xương khớp', 'specialty' => 'orthopedics', 'is_common' => true],
            ['code' => 'M17', 'name' => 'Thoái hóa khớp gối', 'name_en' => 'Knee osteoarthritis', 'category' => 'Bệnh cơ xương khớp', 'specialty' => 'orthopedics', 'is_common' => true],
            ['code' => 'M19', 'name' => 'Thoái hóa khớp khác', 'name_en' => 'Other osteoarthritis', 'category' => 'Bệnh cơ xương khớp', 'specialty' => 'orthopedics', 'is_common' => true],
            ['code' => 'M25.5', 'name' => 'Đau khớp', 'name_en' => 'Joint pain', 'category' => 'Bệnh cơ xương khớp', 'specialty' => 'orthopedics', 'is_common' => true],
            ['code' => 'M41', 'name' => 'Vẹo cột sống', 'name_en' => 'Scoliosis', 'category' => 'Bệnh cơ xương khớp', 'specialty' => 'orthopedics', 'is_common' => true],
            ['code' => 'M47', 'name' => 'Thoát vị đĩa đệm', 'name_en' => 'Spondylosis', 'category' => 'Bệnh cơ xương khớp', 'specialty' => 'orthopedics', 'is_common' => true],
            ['code' => 'M51', 'name' => 'Thoái hóa đĩa đệm', 'name_en' => 'Disc disorders', 'category' => 'Bệnh cơ xương khớp', 'specialty' => 'orthopedics', 'is_common' => true],
            ['code' => 'M54.5', 'name' => 'Đau thắt lưng', 'name_en' => 'Low back pain', 'category' => 'Bệnh cơ xương khớp', 'specialty' => 'orthopedics', 'is_common' => true],
            ['code' => 'M54.2', 'name' => 'Đau cổ', 'name_en' => 'Neck pain', 'category' => 'Bệnh cơ xương khớp', 'specialty' => 'orthopedics', 'is_common' => true],
            ['code' => 'M62', 'name' => 'Rối loạn cơ', 'name_en' => 'Muscle disorders', 'category' => 'Bệnh cơ xương khớp', 'specialty' => 'orthopedics', 'is_common' => true],
            ['code' => 'M65', 'name' => 'Viêm bao hoạt dịch', 'name_en' => 'Synovitis', 'category' => 'Bệnh cơ xương khớp', 'specialty' => 'orthopedics', 'is_common' => true],
            ['code' => 'M70', 'name' => 'Viêm gân', 'name_en' => 'Tendinitis', 'category' => 'Bệnh cơ xương khớp', 'specialty' => 'orthopedics', 'is_common' => true],
            ['code' => 'M75', 'name' => 'Viêm khớp vai', 'name_en' => 'Shoulder lesions', 'category' => 'Bệnh cơ xương khớp', 'specialty' => 'orthopedics', 'is_common' => true],
            ['code' => 'M79.1', 'name' => 'Đau cơ', 'name_en' => 'Myalgia', 'category' => 'Bệnh cơ xương khớp', 'specialty' => 'orthopedics', 'is_common' => true],
            ['code' => 'M79.3', 'name' => 'Viêm cơ', 'name_en' => 'Panniculitis', 'category' => 'Bệnh cơ xương khớp', 'specialty' => 'orthopedics', 'is_common' => true],
            ['code' => 'M80', 'name' => 'Loãng xương', 'name_en' => 'Osteoporosis', 'category' => 'Bệnh cơ xương khớp', 'specialty' => 'orthopedics', 'is_common' => true],
            ['code' => 'M84', 'name' => 'Gãy xương', 'name_en' => 'Fracture', 'category' => 'Bệnh cơ xương khớp', 'specialty' => 'orthopedics', 'is_common' => true],
            ['code' => 'S93', 'name' => 'Bong gân', 'name_en' => 'Sprain', 'category' => 'Chấn thương', 'specialty' => 'orthopedics', 'is_common' => true],

            // ============ BỆNH MẮT (Ophthalmology) ============
            ['code' => 'H10', 'name' => 'Viêm kết mạc', 'name_en' => 'Conjunctivitis', 'category' => 'Bệnh mắt', 'specialty' => 'ophthalmology', 'is_common' => true],
            ['code' => 'H16', 'name' => 'Viêm giác mạc', 'name_en' => 'Keratitis', 'category' => 'Bệnh mắt', 'specialty' => 'ophthalmology', 'is_common' => true],
            ['code' => 'H25', 'name' => 'Đục thủy tinh thể', 'name_en' => 'Cataract', 'category' => 'Bệnh mắt', 'specialty' => 'ophthalmology', 'is_common' => true],
            ['code' => 'H40', 'name' => 'Tăng nhãn áp', 'name_en' => 'Glaucoma', 'category' => 'Bệnh mắt', 'specialty' => 'ophthalmology', 'is_common' => true],
            ['code' => 'H52.0', 'name' => 'Viễn thị', 'name_en' => 'Hypermetropia', 'category' => 'Bệnh mắt', 'specialty' => 'ophthalmology', 'is_common' => true],
            ['code' => 'H52.1', 'name' => 'Cận thị', 'name_en' => 'Myopia', 'category' => 'Bệnh mắt', 'specialty' => 'ophthalmology', 'is_common' => true],
            ['code' => 'H52.2', 'name' => 'Loạn thị', 'name_en' => 'Astigmatism', 'category' => 'Bệnh mắt', 'specialty' => 'ophthalmology', 'is_common' => true],
            ['code' => 'H53.1', 'name' => 'Lão thị', 'name_en' => 'Presbyopia', 'category' => 'Bệnh mắt', 'specialty' => 'ophthalmology', 'is_common' => true],
            ['code' => 'H00', 'name' => 'Lẹo', 'name_en' => 'Hordeolum', 'category' => 'Bệnh mắt', 'specialty' => 'ophthalmology', 'is_common' => true],

            // ============ BỆNH TAI MŨI HỌNG (ENT) ============
            ['code' => 'H60', 'name' => 'Viêm tai ngoài', 'name_en' => 'Otitis externa', 'category' => 'Bệnh tai mũi họng', 'specialty' => 'ent', 'is_common' => true],
            ['code' => 'H65', 'name' => 'Viêm tai giữa không mủ', 'name_en' => 'Non-suppurative otitis media', 'category' => 'Bệnh tai mũi họng', 'specialty' => 'ent', 'is_common' => true],
            ['code' => 'H66', 'name' => 'Viêm tai giữa mủ', 'name_en' => 'Suppurative otitis media', 'category' => 'Bệnh tai mũi họng', 'specialty' => 'ent', 'is_common' => true],
            ['code' => 'H81', 'name' => 'Rối loạn tiền đình', 'name_en' => 'Vertigo', 'category' => 'Bệnh tai mũi họng', 'specialty' => 'ent', 'is_common' => true],
            ['code' => 'H90', 'name' => 'Điếc', 'name_en' => 'Hearing loss', 'category' => 'Bệnh tai mũi họng', 'specialty' => 'ent', 'is_common' => true],
            ['code' => 'H93.1', 'name' => 'Ù tai', 'name_en' => 'Tinnitus', 'category' => 'Bệnh tai mũi họng', 'specialty' => 'ent', 'is_common' => true],
            ['code' => 'J34', 'name' => 'Viêm mũi', 'name_en' => 'Rhinitis', 'category' => 'Bệnh tai mũi họng', 'specialty' => 'ent', 'is_common' => true],
            ['code' => 'J35', 'name' => 'Viêm amidan mạn', 'name_en' => 'Chronic tonsillitis', 'category' => 'Bệnh tai mũi họng', 'specialty' => 'ent', 'is_common' => true],
            ['code' => 'R04.0', 'name' => 'Chảy máu cam', 'name_en' => 'Epistaxis', 'category' => 'Bệnh tai mũi họng', 'specialty' => 'ent', 'is_common' => true],

            // ============ BỆNH PHỤ KHOA & SẢN KHOA (Obstetrics/Gynecology) ============
            ['code' => 'N70', 'name' => 'Viêm vòi trứng', 'name_en' => 'Salpingitis', 'category' => 'Bệnh phụ khoa', 'specialty' => 'obstetrics', 'is_common' => true],
            ['code' => 'N71', 'name' => 'Viêm tử cung', 'name_en' => 'Inflammatory disease of uterus', 'category' => 'Bệnh phụ khoa', 'specialty' => 'obstetrics', 'is_common' => true],
            ['code' => 'N76', 'name' => 'Viêm âm đạo', 'name_en' => 'Vaginitis', 'category' => 'Bệnh phụ khoa', 'specialty' => 'obstetrics', 'is_common' => true],
            ['code' => 'N80', 'name' => 'Lạc nội mạc tử cung', 'name_en' => 'Endometriosis', 'category' => 'Bệnh phụ khoa', 'specialty' => 'obstetrics', 'is_common' => true],
            ['code' => 'N83', 'name' => 'U nang buồng trứng', 'name_en' => 'Ovarian cyst', 'category' => 'Bệnh phụ khoa', 'specialty' => 'obstetrics', 'is_common' => true],
            ['code' => 'N92', 'name' => 'Rối loạn kinh nguyệt', 'name_en' => 'Menstrual disorders', 'category' => 'Bệnh phụ khoa', 'specialty' => 'obstetrics', 'is_common' => true],
            ['code' => 'N93', 'name' => 'Ra máu bất thường', 'name_en' => 'Abnormal uterine bleeding', 'category' => 'Bệnh phụ khoa', 'specialty' => 'obstetrics', 'is_common' => true],
            ['code' => 'N94', 'name' => 'Đau bụng kinh', 'name_en' => 'Dysmenorrhea', 'category' => 'Bệnh phụ khoa', 'specialty' => 'obstetrics', 'is_common' => true],
            ['code' => 'N95', 'name' => 'Mãn kinh', 'name_en' => 'Menopause', 'category' => 'Bệnh phụ khoa', 'specialty' => 'obstetrics', 'is_common' => true],
            ['code' => 'O00', 'name' => 'Thai ngoài tử cung', 'name_en' => 'Ectopic pregnancy', 'category' => 'Sản khoa', 'specialty' => 'obstetrics', 'is_common' => false],
            ['code' => 'O03', 'name' => 'Sẩy thai', 'name_en' => 'Spontaneous abortion', 'category' => 'Sản khoa', 'specialty' => 'obstetrics', 'is_common' => true],
            ['code' => 'O21', 'name' => 'Ói mửa khi mang thai', 'name_en' => 'Hyperemesis gravidarum', 'category' => 'Sản khoa', 'specialty' => 'obstetrics', 'is_common' => true],
            ['code' => 'O80', 'name' => 'Sinh thường', 'name_en' => 'Normal delivery', 'category' => 'Sản khoa', 'specialty' => 'obstetrics', 'is_common' => true],

            // ============ BỆNH NHI (Pediatrics) ============
            ['code' => 'A08', 'name' => 'Nhiễm virus đường ruột', 'name_en' => 'Viral intestinal infection', 'category' => 'Bệnh nhi', 'specialty' => 'pediatrics', 'is_common' => true],
            ['code' => 'B01', 'name' => 'Thủy đậu', 'name_en' => 'Varicella', 'category' => 'Bệnh nhi', 'specialty' => 'pediatrics', 'is_common' => true],
            ['code' => 'B05', 'name' => 'Sởi', 'name_en' => 'Measles', 'category' => 'Bệnh nhi', 'specialty' => 'pediatrics', 'is_common' => false],
            ['code' => 'B08', 'name' => 'Tay chân miệng', 'name_en' => 'Hand, foot and mouth disease', 'category' => 'Bệnh nhi', 'specialty' => 'pediatrics', 'is_common' => true],
            ['code' => 'P07', 'name' => 'Sinh non', 'name_en' => 'Preterm birth', 'category' => 'Bệnh nhi', 'specialty' => 'pediatrics', 'is_common' => true],
            ['code' => 'R62', 'name' => 'Chậm lớn', 'name_en' => 'Failure to thrive', 'category' => 'Bệnh nhi', 'specialty' => 'pediatrics', 'is_common' => true],
            ['code' => 'A37', 'name' => 'Ho gà', 'name_en' => 'Whooping cough', 'category' => 'Bệnh nhi', 'specialty' => 'pediatrics', 'is_common' => true],

            // ============ BỆNH THẬN - TIẾT NIỆU (Urology) ============
            ['code' => 'N10', 'name' => 'Viêm thận bể thận cấp', 'name_en' => 'Acute pyelonephritis', 'category' => 'Bệnh thận', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'N18', 'name' => 'Bệnh thận mạn', 'name_en' => 'Chronic kidney disease', 'category' => 'Bệnh thận', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'N20', 'name' => 'Sỏi thận', 'name_en' => 'Kidney stone', 'category' => 'Bệnh thận', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'N30', 'name' => 'Viêm bàng quang', 'name_en' => 'Cystitis', 'category' => 'Bệnh tiết niệu', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'N39.0', 'name' => 'Nhiễm trùng đường tiết niệu', 'name_en' => 'UTI', 'category' => 'Bệnh tiết niệu', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'N40', 'name' => 'Phì đại tiền liệt tuyến', 'name_en' => 'BPH', 'category' => 'Bệnh tiết niệu', 'specialty' => 'internal', 'is_common' => true],

            // ============ TRIỆU CHỨNG CHUNG (General Symptoms) ============
            ['code' => 'R05', 'name' => 'Ho', 'name_en' => 'Cough', 'category' => 'Triệu chứng', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'R06', 'name' => 'Khó thở', 'name_en' => 'Dyspnea', 'category' => 'Triệu chứng', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'R10', 'name' => 'Đau bụng', 'name_en' => 'Abdominal pain', 'category' => 'Triệu chứng', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'R11', 'name' => 'Buồn nôn và nôn', 'name_en' => 'Nausea and vomiting', 'category' => 'Triệu chứng', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'R19', 'name' => 'Rối loạn tiêu hóa', 'name_en' => 'Digestive symptoms', 'category' => 'Triệu chứng', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'R50', 'name' => 'Sốt', 'name_en' => 'Fever', 'category' => 'Triệu chứng', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'R51', 'name' => 'Đau đầu', 'name_en' => 'Headache', 'category' => 'Triệu chứng', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'R52', 'name' => 'Đau', 'name_en' => 'Pain', 'category' => 'Triệu chứng', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'R53', 'name' => 'Mệt mỏi', 'name_en' => 'Fatigue', 'category' => 'Triệu chứng', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'R60', 'name' => 'Phù', 'name_en' => 'Edema', 'category' => 'Triệu chứng', 'specialty' => 'internal', 'is_common' => true],
            ['code' => 'R63', 'name' => 'Rối loạn ăn uống', 'name_en' => 'Eating disorders', 'category' => 'Triệu chứng', 'specialty' => 'internal', 'is_common' => true],
        ];

        foreach ($diseases as $disease) {
            DB::table('icd10_codes')->insert([
                'code' => $disease['code'],
                'name' => $disease['name'],
                'name_en' => $disease['name_en'],
                'category' => $disease['category'],
                'specialty' => $disease['specialty'],
                'is_common' => $disease['is_common'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
