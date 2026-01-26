# TÀI LIỆU CHỨC NĂNG HỆ THỐNG "AN" (FUNCTIONAL SPECIFICATIONS)

## 1. PHÂN HỆ DÀNH CHO CHUYÊN GIA (The Expert Command Center)
**Mục tiêu:** Tối ưu hóa thời gian làm việc, hỗ trợ ra quyết định lâm sàng và quản lý chuyên nghiệp.

*   **Thư viện Bài tập Thông minh (Smart Prescription Library):**
    *   **Chức năng:** Cơ sở dữ liệu chứa hàng trăm video bài tập mẫu chuẩn y khoa.
    *   **Hoạt động:** Chuyên gia chọn kỹ năng (VD: Giao tiếp mắt) -> Chọn bài mẫu -> Tùy chỉnh nhẹ -> Gửi cho phụ huynh. Thao tác < 30 giây.
*   **Công cụ Ghi chú Video theo giây (Time-stamped Video Annotation):**
    *   **Chức năng:** Cho phép chuyên gia xem video thực hành của trẻ và bình luận tại đúng giây cụ thể (VD: "Tại 0:15s - Mẹ cần hạ thấp giọng xuống").
    *   **Giá trị:** Hướng dẫn kỹ thuật chính xác tuyệt đối, thay thế chat Zalo chung chung.
*   **Bảng điều khiển Lâm sàng & Cảnh báo (Clinical Dashboard & Alerts):**
    *   **Chức năng:** Tự động vẽ biểu đồ tiến độ từ báo cáo. Phát hiện bất thường (VD: Bé thất bại 3 lần liên tiếp) để bác sĩ kịp thời điều chỉnh giáo án.
*   **Hồ sơ Bệnh án Điện tử chuẩn Pháp lý:**
    *   **Chức năng:** Lưu trữ thông tin định danh, lịch sử can thiệp tuân thủ các quy định y tế hiện hành (Nghị định 102/2025).

---

## 2. PHÂN HỆ DÀNH CHO PHỤ HUYNH (The Parent Action Hub)
**Mục tiêu:** Đơn giản hóa việc dạy con, biến trị liệu thành thói quen hàng ngày và kết nối cộng đồng.

### A. Bảng điều khiển chính (Dashboard)
*   **Nhiệm vụ hàng ngày (Daily Quest):**
    *   **Danh sách nhiệm vụ:** Hiển thị các bài tập và hoạt động cần làm trong ngày.
    *   **Thanh tiến độ:** Minh họa mức độ hoàn thành để tạo động lực cho phụ huynh.
    *   **Trạng thái:** Theo dõi trực quan các mục đã hoàn thành hoặc còn sót lại.
*   **Lối tắt hành động (Shortcuts):** Tuy cập nhanh 1 chạm:
    *   Quay video thực hành.
    *   Mở bài tập hiện tại.
    *   Nhắn tin trực tiếp cho trị liệu viên.
*   **Thông báo quan trọng:** Cập nhật nhắc hẹn, phản hồi mới từ chuyên gia hoặc cảnh báo hệ thống.

### B. Theo dõi & Thực hành (Track)
*   **Bài tập mỗi ngày:**
    *   **Video mẫu:** Hướng dẫn trực quan từng động tác.
    *   **Hướng dẫn văn bản:** Chi tiết các bước thực hiện và mục tiêu cần đạt.
    *   **Nút bắt đầu:** Bấm để tính giờ và ghi nhận phiên tập.
*   **Máy ảnh thông minh (Smart Camera):**
    *   **Quay video trong App:** Tích hợp sẵn camera để đảm bảo tính riêng tư.
    *   **Nén video tự động:** Giảm dung lượng tệp nhưng vẫn giữ độ nét cao để upload nhanh.
    *   **Upload thông minh:** Tự động gắn video vào đúng bài tập tương ứng.
*   **Bảng kiểm nhanh (Quick Checklist):** Báo cáo sau mỗi bài tập chỉ trong 30 giây:
    *   Mức độ hợp tác của trẻ.
    *   Thời gian tập thực tế.
    *   Mức độ hỗ trợ cần thiết (Cần nhắc, hỗ trợ tay, hay tự lập).
*   **Quản lý Video đã gửi:**
    *   **Phân loại trạng thái:** Danh sách video Đang chờ phản hồi, Đã có phản hồi, hoặc Cần quay lại.
    *   **Chi tiết phản hồi:** Xem video kèm theo **Nhận xét theo dòng thời gian (Timeline comment)** từ chuyên gia, tổng hợp nhận xét chung và gợi ý chỉnh sửa bài tập.
*   **Lịch phiên trị liệu:** Theo dõi các buổi gặp trực tiếp hoặc online sắp tới và trạng thái (Đã xác nhận/Chờ).

### C. Phân tích & Đánh giá (Analyze)
*   **Biểu đồ tiến triển:** Theo dõi sự thay đổi theo tuần hoặc theo từng nhóm kỹ năng chuyên biệt.
*   **So sánh hiệu quả:** Đối chiếu kết quả tuần này so với tuần trước hoặc so với mục tiêu trị liệu ban đầu.
*   **Phân tích từ Video:**
    *   Tổng hợp các điểm mạnh quan sát được từ hình ảnh thực tế.
    *   Xác định các điểm cần cải thiện.
    *   So sánh trực quan video cũ và mới để thấy bước tiến của trẻ.
    *   Gợi ý các bài tập liên quan dựa trên dữ liệu phân tích.
*   **Báo cáo chuyên sâu:** Xuất báo cáo định kỳ dưới dạng PDF để lưu trữ hoặc chia sẻ.

### D. Cộng đồng ẩn danh (Forum)
*   **Bảng tin (Feed):** Xem các bài viết mới nhất và các thảo luận nổi bật từ cộng đồng.
*   **Chủ đề chuyên biệt:** Phân loại theo: Giao tiếp, Hành vi, Vận động, Chăm sóc tại nhà.
*   **Tương tác cộng đồng:** 
    *   Đăng bài ẩn danh (để chia sẻ tâm sự riêng tư).
    *   Bình luận và thả cảm xúc hỗ trợ nhau.
    *   Tìm kiếm và lọc bài viết theo chủ đề hoặc độ tương tác.
*   **Kiểm duyệt (Moderation):** Hệ thống báo cáo nội dung và quy định cộng đồng để giữ môi trường an toàn.
*   **Hồ sơ cộng đồng:** Quản lý biệt danh ẩn danh và lịch sử chia sẻ.

### E. Hồ sơ & Cá nhân hóa (Profile)
*   **Hồ sơ của con:** Thông tin cơ bản, chẩn đoán y khoa và mục tiêu can thiệp.
*   **Trị liệu viên phụ trách:** Danh sách và thông tin liên hệ của các chuyên gia.
*   **Kho lưu trữ Video dài hạn (Longitudinal Video Archive):** 
    *   Dòng thời gian (Timeline) phát triển theo tháng.
    *   Bộ sưu tập các video tiêu biểu đánh mốc tiến bộ.
*   **Lịch sử & Báo cáo:** Lưu trữ toàn bộ các phiên trị liệu và báo cáo đã nhận.

### F. Cài đặt hệ thống (Settings)
*   **Tài khoản:** Bảo mật, đổi mật khẩu và xác thực 2 lớp (2FA).
*   **Cài đặt thông báo:** Nhắc lịch Daily Quest, nhắc lịch hẹn phiên trị liệu.
*   **Quyền riêng tư:** Quản lý chế độ Forum và tính năng ẩn danh.
*   **Quản lý quyền truy cập:** Thêm người chăm sóc (ông bà, giáo viên) và phân quyền xem dữ liệu.
*   **Ngôn ngữ:** Hỗ trợ Tiếng Việt và Tiếng Anh.

---

## 3. CHỨC NĂNG HỆ THỐNG CHUNG
*   **Đăng ký/Đăng nhập & Xác thực:** Hỗ trợ OAuth/SSO và quản lý vai trò (Trị liệu viên, Phụ huynh, Quản trị).
*   **Bảo mật & Tuân thủ:** Mã hóa dữ liệu, Audit logs, tuân thủ luật bảo mật dữ liệu y tế.
*   **Lưu trữ & Truyền tải:** Hệ thống streaming video nhẹ và lưu trữ đám mây an toàn.

---

## 4. TẦM NHÌN TƯƠNG LAI (Vision 2027-2028)
Tích hợp **Hướng nghiệp & Việc làm (Career Passport)**:
*   Sử dụng Game-Based Assessment (GBA) dựa trên khoa học để đo lường năng lực não bộ (Pattern recognition, Attention to detail).
*   Kết nối trực tiếp với các doanh nghiệp xã hội (VAPs, KymViet...) để tạo công ăn việc làm cho người tự kỷ.
*   Cấp chứng chỉ năng lực số (Digital Career Passport) được công nhận bởi các tổ chức quốc tế.
