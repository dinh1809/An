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
*   **Lịch điều trị sắp tới:**
    *   **Phiên điều trị tiếp theo:** Hiển thị thông tin phiên gần nhất (Ngày, giờ, chuyên gia).
    *   **Nhắc lịch:** Thông báo nhắc nhở trước khi phiên bắt đầu để phụ huynh chuẩn bị.
*   **Lối tắt hành động (Shortcuts):** Tuy cập nhanh 1 chạm:
    *   Quay video thực hành.
    *   Mở bài tập hiện tại.
    *   **Đặt lịch điều trị.**
    *   Nhắn tin trực tiếp cho trị liệu viên.
*   **Thông báo quan trọng:** Cập nhật phản hồi mới từ chuyên gia hoặc cảnh báo hệ thống.

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
    *   Mức độ hợp tác của trẻ, Thời gian tập, Mức độ hỗ trợ.
*   **Quản lý Video đã gửi:** Theo dõi trạng thái (Chờ phản hồi, Đã có phản hồi, Cần quay lại) và xem chi tiết nhận xét theo dòng thời gian từ bác sĩ.
*   **Quản lý Lịch điều trị:**
    *   **Lịch sắp tới:** Chi tiết ngày, giờ, trị liệu viên và trạng thái phiên (Đã xác nhận/Đang chờ).
    *   **Đề xuất lịch mới:** Phụ huynh chủ động chọn ngày còn trống, chọn khung giờ phù hợp và gửi yêu cầu cho therapist.
    *   **Xác nhận/Hủy lịch:** Quản lý linh hoạt các phiên hẹn.
    *   **Lịch sử phiên:** Xem lại toàn bộ quá trình các phiên trị liệu đã thực hiện.

### C. Phân tích & Đánh giá (Analyze)
*   **Biểu đồ tiến triển:** Theo dõi sự thay đổi theo tuần hoặc theo từng nhóm kỹ năng chuyên biệt.
*   **So sánh hiệu quả:** Đối chiếu kết quả tuần này so với tuần trước hoặc so với mục tiêu trị liệu ban đầu.
*   **Phân tích từ Video:** Tự động tổng hợp điểm mạnh, điểm cần cải thiện và so sánh video cũ/mới dựa trên dữ liệu phản hồi của bác sĩ.
*   **Báo cáo chuyên sâu:** Xuất báo cáo định kỳ dưới dạng PDF.

### D. Cộng đồng ẩn danh (Forum)
*   **Bảng tin (Feed):** Xem các bài viết mới nhất và nổi bật.
*   **Chủ đề:** Giao tiếp, Hành vi, Vận động, Chăm sóc tại nhà.
*   **Tương tác:** Đăng bài ẩn danh, bình luận, thả cảm xúc, tìm kiếm & lọc bài viết.
*   **Kiểm duyệt & Hồ sơ:** Quản lý biệt danh ẩn danh và bảo vệ an toàn nội dung cộng đồng.

### E. Hồ sơ & Cá nhân hóa (Profile)
*   **Hồ sơ của con:** Thông tin cơ bản, chẩn đoán y khoa và mục tiêu can thiệp.
*   **Trị liệu viên phụ trách:** Danh sách và thông tin liên hệ của các chuyên gia.
*   **Kho lưu trữ Video dài hạn (Longitudinal Video Archive):** 
    *   Dòng thời gian phát triển theo tháng và bộ sưu tập video tiêu biểu.
*   **Lịch sử & Báo cáo:** Lưu trữ toàn bộ dữ liệu phiên và báo cáo đã nhận.

### F. Cài đặt hệ thống (Settings)
*   **Tài khoản & Bảo mật:** Đổi mật khẩu, 2FA, Ngôn ngữ.
*   **Cài đặt thông báo:** Nhắc lịch Daily Quest, nhắc lịch điều trị.
*   **Quyền riêng tư & Truy cập:** Bật tắt forum/ẩn danh, phân quyền cho người chăm sóc khác.

---

## 3. LUỒNG NGHIỆP VỤ CHÍNH (Core Flow)
1. **Dashboard:** Phụ huynh xem lịch điều trị sắp tới và tiến độ ngày.
2. **Đặt lịch:** Vào *Track > Lịch điều trị* (hoặc Shortcut) -> Chọn ngày/giờ trống -> Gửi yêu cầu.
3. **Xác nhận:** Trị liệu viên nhận thông báo và xác nhận lịch.
4. **Nhắc lịch:** Hệ thống tự động gửi thông báo nhắc nhở phụ huynh trước phiên điều trị.

---

## 4. TẦM NHÌN TƯƠNG LAI (Vision 2027-2028)
Tích hợp **Hướng nghiệp & Việc làm (Career Passport)**:
*   Sử dụng Game-Based Assessment (GBA) dựa trên khoa học để đo lường năng lực não bộ.
*   Kết nối trực tiếp với các doanh nghiệp xã hội (VAPs, KymViet...) để tạo công ăn việc làm cho người tự kỷ.
