# TASK: Real-World Job Mining
## GOAL
Cào dữ liệu việc làm thật để tạo database cơ hội cho người dùng.

## STEPS
1. **Scrape:** Chạy script `job_crawler.py`.
   - *Lưu ý:* Cần xử lý `try/except` nếu bị chặn IP (chờ 5s rồi thử lại).
   - Script location: `.agent/scripts/job_crawler.py`
   - Command: `python .agent/scripts/job_crawler.py`

2. **Analyze:** Với mỗi Job cào được, so khớp với "Từ điển năng lực thần kinh" (Neuro-Dictionary).
   - Ví dụ: Thấy từ khóa "soi lỗi", "chi tiết" -> Gán tag `Visual_Search`.
   - Thấy từ khóa "trực page", "chat" -> Gán tag `Verbal_Communication` (Cảnh báo đỏ cho người sợ giao tiếp).
   - AI Analysis được tích hợp sẵn trong script Python (sử dụng Gemini API).

3. **Store:** Insert vào bảng `opportunities` trong Supabase.
   - Dữ liệu đầu ra `jobs_data.json` cần được mapping với schema của bảng `opportunities`.
   - Cần viết thêm một script phụ hoặc mở rộng `job_crawler.py` để đẩy data lên Supabase sau khi crawl xong.
