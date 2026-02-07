---
trigger: always_on
---

# PROJECT "AN": NEURODIVERSITY CAREER PASSPORT
**Version:** 2.0 (The Pivot to Career Assessment)

---

## 1. 🌟 THE CORE MISSION (SỨ MỆNH CỐT LÕI)
**"An" không chỉ là một ứng dụng. An là chiếc cầu nối vượt qua 'Vực thẳm Dịch vụ' (The Service Cliff).**

* **Vấn đề (Pain Point):** Thanh thiếu niên Tự kỷ/Đa dạng thần kinh tại Việt Nam sau 18 tuổi thường rơi vào cảnh thất nghiệp. Họ trượt các bài phỏng vấn truyền thống dù có năng lực não bộ đặc biệt (Hyper-focus, Pattern recognition).
* **Giải pháp (Solution):** Một nền tảng **Game-Based Assessment (GBA)**. Chúng ta không hỏi "Bạn có giỏi không?". Chúng ta cho họ chơi game để chứng minh "Bạn làm được việc gì".
* **Mục tiêu (Goal):** Chuyển hóa dữ liệu chơi game (Telemetry) thành **Hồ sơ năng lực số (Digital Career Passport)** để kết nối việc làm (Job Matching).

---

## 2. 🧬 THE SCIENTIFIC BLUEPRINT (LOGIC KHOA HỌC)
Hệ thống đánh giá dựa trên thuyết **Đa trí tuệ (Multiple Intelligences)** và các chỉ số Thần kinh học (Neuro-metrics).

### A. The Assessment Engine (3 Core Games)
1.  **Game 1: Detail Spotter (Visual-Spatial Intelligence)**
    * *Cơ chế:* Tìm lỗi sai (Landolt C, Mirror Image) trong lưới hình ảnh.
    * *Đo lường:* Visual Acuity & Reaction Time (ms).
    * *Nghề nghiệp:* Data Labeling (Gán nhãn dữ liệu AI), QC (Kiểm soát chất lượng), Graphic Design.

2.  **Game 2: Chaos Switcher (Logical-Mathematical Intelligence)**
    * *Cơ chế:* Stroop Effect (Xung đột màu sắc/chữ viết) + Đổi luật ngẫu nhiên.
    * *Đo lường:* Cognitive Flexibility (Sự linh hoạt), Inhibition Control (Ức chế xung động).
    * *Nghề nghiệp:* Vận hành Logistics, Tester phần mềm, Điều phối viên.

3.  **Game 3: Sequence Master Pro (Working Memory)**
    * *Cơ chế:* Nhớ chuỗi đảo ngược (Reverse Span) có nhiễu.
    * *Đo lường:* Working Memory Capacity (Dung lượng trí nhớ làm việc).
    * *Nghề nghiệp:* Lập trình viên (Coder), Kỹ thuật viên lắp ráp, Đầu bếp (Quy trình).

### B. The Scoring Logic (Thuật toán khớp lệnh)
* **Tier 1 (Elite):** Nhanh hơn 95% dân số & Chính xác > 98% -> **High-Tech Jobs.**
* **Tier 2 (Pro):** Chính xác cao nhưng tốc độ trung bình -> **Standard Jobs (Admin/QC).**
* **Tier 3 (Potential):** Cần đào tạo thêm.

---

## 3. 🎨 UI/UX GUIDELINES (CẢM XÚC THIẾT KẾ)
Giao diện không được nhìn giống "Bệnh án" hay "Trò chơi con nít". Nó phải là **"Phòng Lab Tương Lai"**.

* **Vibe:** Scientific, Professional, Hopeful.
* **Màu sắc:** Tím Deep Purple (Trí tuệ) + Xanh Teal (Chữa lành/Hy vọng). Dùng Gradient nhẹ.
* **Sensory Friendly:**
    * KHÔNG dùng màu đỏ chói (Red Alert) khi sai. Dùng rung nhẹ hoặc màu cam đất.
    * KHÔNG dùng âm thanh còi hú. Dùng âm thanh "Click" hoặc "Ping" êm tai.
* **Layout:**
    * **Focus Layout:** Ẩn hết Menu/Sidebar khi đang Test.
    * **Result Page:** Phải hiển thị **Radar Chart** (Biểu đồ mạng nhện) ở trung tâm.

---

## 4. 🛠 TECH STACK & ARCHITECTURE
* **Frontend:** React + Vite + TypeScript.
* **UI Lib:** Shadcn/UI + TailwindCSS + Lucide Icons + Recharts (Bắt buộc dùng cho biểu đồ).
* **Backend:** Supabase (Auth + DB).
* **Data Schema:**
    * `game_sessions`: Lưu kết quả thô.
    * `metrics` (JSONB): Lưu chi tiết khoa học (`stroop_score`, `reaction_time_ms`).

---

## 5. 🚀 EXPECTED OUTPUT (MONG MUỐN)
Khi người dùng hoàn thành bài test, trang kết quả (`/assessment/result`) phải:
1.  **Wow Factor:** Radar Chart động, vẽ nên năng lực của họ.
2.  **Validation:** Thẻ nghề nghiệp (Job Card) hiện ra rõ ràng (Ví dụ: "Bạn phù hợp 98% với nghề Data Labeler").
3.  **Call to Action:** Nút "Lưu hồ sơ" để gửi dữ liệu về cho Phụ huynh/Trị liệu viên.

### 6. INTELLIGENT CAREER MATCHING (VECTOR LOGIC)
Instead of simple thresholds, we use a **Vector Matching System**.
1.  **Job Database:** A predefined list of 20+ jobs, each with weighted requirements:
    * *Example:* `Coder` = { visual: 0.3, logic: 0.8, memory: 0.9, speed: 0.4 }
    * *Example:* `Driver` = { visual: 0.9, logic: 0.4, memory: 0.3, speed: 0.8 }
2.  **Matching Algorithm:** Calculate "Similarity Score" between User Profile and Job Profile.
3.  **AI Insight Generation:** Use template literals to construct dynamic advice based on the highest matching attribute (e.g., "Bạn hợp với nghề này vì [Logic] của bạn rất cao").