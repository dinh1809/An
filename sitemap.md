# 🗺️ AN PLATFORM - DETAILED SITEMAP

Sitemap này bao quát toàn bộ chức năng từ MVP đến các tính năng nâng cao (Advanced Features) và tầm nhìn tương lai (Future Vision) của dự án "An".

---

## 🏛️ 1. PHÂN HỆ CHUYÊN GIA (EXPERT PORTAL)
*Role: Therapist / Clinician / Admin*

### 1.1. Dashboard (Bảng điều khiển trung tâm) `data-dense`
- **Overview Metrics:** Tổng bệnh nhân active, Lịch hẹn hôm nay, Video cần duyệt, Cảnh báo đỏ.
- **Urgent Tasks:** Danh sách việc cần làm ngay (Alerts).
- **Recent Activity:** Log hoạt động gần nhất của hệ thống.

### 1.2. Patient Management (Quản lý Bệnh nhân)
- **Patient List (Caseload):**
  - View: List / Kanban (Intake -> Active -> Maintenance -> Discharge).
  - Filter: Mức độ hỗ trợ (Level 1-3), Độ tuổi, Trạng thái.
- **Patient Detail Profile:**
  - **Info Tab:** Thông tin hành chính, Chẩn đoán (ICD-10/DSM-5), Người giám hộ.
  - **Clinical Plan Tab (Smart Prescription):**
    - Calendar View: Lịch can thiệp tuần/tháng.
    - Prescription Builder: Kéo thả bài tập từ thư viện.
  - **Progress Tab:** Biểu đồ xu hướng (Trendlines), Lịch sử đánh giá (Assessments).
  - **Notes Tab:** Ghi chú phiên (SOAP Notes), Tài liệu đính kèm.

### 1.3. Video Analysis Studio (Soi Video) `core-feature`
- **Upload/Import:** Nhận video từ phụ huynh.
- **Annotation Interface:**
  - Video Player với tính năng seek-bar marking.
  - Comment Thread: Bình luận theo giây (Timestamped comments).
  - Toolset: Gắn tag lỗi kỹ thuật, Khen ngợi.
- **Report Generator:** Tổng kết phiên, xuất PDF gửi phụ huynh.

### 1.4. Professional Library (Thư viện chuyên môn)
- **Exercise Bank:** Kho bài tập (Vận động, Giao tiếp, Nhận thức).
- **Assessment Tools:** Các bộ thang đo chuẩn (M-CHAT, ATEC, CARS).
- **My Templates:** Mẫu kế hoạch cá nhân hóa của từng chuyên gia.

### 1.5. Schedule & Telehealth (Lịch & Trị liệu từ xa)
- **Calendar View:** Lịch làm việc cá nhân & team.
- **Telehealth Room:**
  - Video Call (Secure Jitsi/Zoom integration).
  - Screen Sharing, Whiteboard.

---

## 🏡 2. PHÂN HỆ PHỤ HUYNH (PARENT PORTAL)
*Role: Parent / Caregiver*

### 2.1. Family Hub (Trang chủ) `gamified`
- **Daily Mission (Nhiệm vụ):**
  - To-do list hôm nay (Bài tập, Nhật ký).
  - Streak Counter (Chuỗi ngày liên tục).
- **Snapshot Progress:** Biểu đồ tóm tắt ngắn gọn tuần này.

### 2.2. Clinical Quest (Thực hành bài tập)
- **Exercise View:**
  - Video mẫu (Model Video).
  - Hướng dẫn bước-bước (Step-by-step).
- **Action Mode:**
  - **Smart Camera:** Quay video thực hành trực tiếp.
  - **Quick Report:** Checklist đánh giá nhanh sau bài tập (Hợp tác/Không).

### 2.3. Memory Archive (Kho kỷ niệm)
- **Timeline:** Dòng thời gian video theo tháng/năm.
- **Feedback View:** Xem video của con kèm comment chi tiết từ chuyên gia.

### 2.4. Communication Center (Kết nối)
- **Chat:** Nhắn tin 2 chiều với chuyên gia (Text, Photo, Voice).
- **Telehealth Join:** Nút tham gia phòng họp trực tuyến.

### 2.5. Knowledge Base (Góc cha mẹ)
- **Micro-lessons:** Bài học ngắn về kỹ năng dạy con.
- **Community (Optional):** Forum hỏi đáp (Moderated).

---

## 🚀 3. HƯỚNG NGHIỆP & TƯƠNG LAI (CAREER HUB)
*Vision: Year 3 - Job Matching for Neurodiverse Adults*

### 3.1. Assessment Game Center (Phòng Lab)
- **Visual Spatial Test:** Game tìm lỗi sai (Detail Spotter).
- **Memory Test:** Game nhớ chuỗi (Sequence Master).
- **Logic Test:** Game quy luật (Matrix).

### 3.2. Career Passport (Hồ sơ năng lực)
- **Radar Chart:** Biểu đồ năng lực đa chiều (Visual, Logic, Focus...).
- **Job Matching:** Danh sách nghề phù hợp (Tester, Data Labeler, Graphic Design...).
- **Training Path:** Lộ trình khóa học đề xuất.

---

## ⚙️ 4. HỆ THỐNG CỐT LÕI (CORE SYSTEM)

### 4.1. Auth & Identity
- Login (SSO/Email), Register, Forgot Password.
- Role Selection (Parent/Expert).
- Onboarding Tour.

### 4.2. Settings
- Profile Management.
- Notification Preferences.
- Language (Vi/En).
- Security & Privacy (Data Export).
