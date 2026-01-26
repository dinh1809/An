Dưới đây là context thiết kế và bộ quy tắc (Design System Rules) cụ thể cho bạn:

1. Bảng màu chi tiết (Refined Palette)
Hệ thống này ưu tiên độ tương phản (Contrast Ratio) đạt chuẩn WCAG AA/AAA để mắt người lớn tuổi dễ đọc.

Primary Colors (Nhận diện thương hiệu & Hành động chính):

Deep Teal: #00695C (Dùng cho Button chính, Header, Text quan trọng. Đây là màu chủ đạo mới, đậm hơn bản cũ để tăng độ tin cậy và tương phản trên nền trắng).

Soft Teal: #B2DFDB (Dùng cho nền phụ, trạng thái active nhẹ, background của icon).

Neutral Colors (Nền & Văn bản - Quan trọng cho sự tối giản):

Ink Black: #1F2937 (Dùng cho tiêu đề chính. Không dùng đen tuyền #000000 vì gây mỏi mắt).

Slate Grey: #4B5563 (Dùng cho body text. Đủ đậm để đọc rõ trên nền trắng).

Cloud White: #F9FAFB (Màu nền app. Hơi ngả xám cực nhẹ để dịu mắt hơn trắng tinh #FFFFFF).

Functional Colors (Trạng thái hệ thống):

Error/Alert: #D32F2F (Đỏ sẫm - Dùng cho cảnh báo hành vi, sự cố).

Success: #2E7D32 (Xanh lá đậm - Dùng cho hoàn thành bài tập, báo cáo tốt).

Warning: #F57C00 (Cam - Dùng cho thông báo cần chú ý).

2. Typography Rules (Google Sans)
Sử dụng Google Sans cần kiểm soát chặt chẽ về Weight (độ dày) để không bị "trẻ con" quá mức, giữ nét chuyên nghiệp.

Font Family: Google Sans.

Scale Ratio: 1.2 (Minor Third) - Giúp phân cấp thông tin rõ ràng mà không bị chênh lệch quá lớn.

Hierarchy:

Heading 1 (Page Title): 24px - Bold (700) - Line height 32px.

Heading 2 (Section Title): 20px - Medium (500) - Line height 28px.

Body Text (Nội dung chính): 16px - Regular (400) - Line height 24px (Quan trọng: Không dùng size 14px cho nội dung chính vì phụ huynh mắt kém sẽ khó đọc).

Caption/Label: 14px - Medium (500) - Line height 20px (Dùng cho nhãn, chú thích nhỏ).

3. Accessibility & Layout Rules (Quy tắc cốt lõi)
Đây là phần quyết định tính "thân thiện với phụ huynh" và loại bỏ sự rườm rà.

Rule 1: Touch Target (Vùng chạm)

Mọi nút bấm, icon tương tác bắt buộc tối thiểu 44x44px (hoặc 48x48px càng tốt).

Lý do: Phụ huynh lớn tuổi thao tác tay không còn chính xác, nút nhỏ gây ức chế.

Áp dụng: Thanh điều hướng dưới cùng (Bottom Navigation) cần tăng padding, các nút "Add Note", "Start Practice" phải to bản, full-width.

Rule 2: Contrast & Clarity (Tương phản & Rõ ràng)

Tuyệt đối không đặt chữ trắng trên nền màu nhạt (như gradient xanh nhạt cũ).

Chữ trên nút Primary (Deep Teal) phải là Trắng (#FFFFFF).

Chữ trên nền Soft Teal phải là màu Deep Teal (#00695C), không dùng màu xám.

Loại bỏ bóng đổ (drop-shadow) mờ nhạt. Dùng đường viền mỏng (border 1px màu #E5E7EB) hoặc nền phân tách rõ ràng để định hình khối (Card UI).

Rule 3: "One Screen, One Key Action" (Tối giản nhận thức)

Mỗi màn hình chỉ nên có 1 nút hành động chính (Primary Button) nổi bật nhất. Các hành động khác đưa về dạng Secondary Button (nút viền) hoặc Text Link.

Ví dụ ở màn hình Tracking: Nút "Add Note" là chính. Các icon cảm xúc (vui/buồn) cần to rõ, có nhãn text đi kèm (không chỉ dùng icon vì người dùng có thể hiểu sai nghĩa icon).

Rule 4: Làm sao để "Không nhàm chán"?

Micro-interactions: Sử dụng hiệu ứng phản hồi nhẹ khi bấm nút (nhấn xuống, đổi màu nhẹ).

Data Visualization: Biểu đồ (như màn hình Analyze) không dùng đường line mảnh. Dùng mảng màu (Area chart) hoặc cột bo tròn (Rounded Column) với màu Soft Teal và Deep Teal để nhìn hiện đại, "đầm" mắt hơn.

Illustrations/Icons: Dùng bộ icon dạng Stroke (nét mảnh) 2px, bo tròn góc, đồng bộ với Google Sans. Tránh dùng ảnh chụp người thật cắt ghép lộn xộn (như màn hình Home hiện tại), thay vào đó dùng avatar tròn hoặc thumbnail gọn gàng.