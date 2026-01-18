# DIRECTIVE: BUILD "THE SONIC CONSERVATORY" (ADVANCED MUSICAL IQ TEST)

## 1. CONTEXT & GOAL
Thay thế hoàn toàn module `SequenceMemory.tsx` hiện tại.
Chuyển đổi từ "Memory Game" sang **"Professional Musical Aptitude Test"**.
**Triết lý:** Không trừng phạt lỗi sai ngay lập tức. Cho phép người dùng thể hiện trọn vẹn bài kiểm tra để đánh giá tổng quan năng khiếu âm nhạc.

## 2. CORE MECHANICS (LUẬT CHƠI MỚI)
1.  **The Range:** Bàn phím Piano đầy đủ 2 quãng tám (Từ C3 đến B4), bao gồm phím trắng và phím đen.
2.  **The Flow (Play Through):**
    - Hệ thống chơi mẫu một đoạn giai điệu (Melody).
    - User chơi lại.
    - **QUAN TRỌNG:** Nếu User nhấn sai nốt, **KHÔNG ĐƯỢC DỪNG LẠI**. Không trừ mạng. Không Game Over.
    - Round chỉ kết thúc khi User đã nhấn **đủ số lượng nốt** của đoạn nhạc đó.
3.  **Progression:**
    - Level 1: 3 nốt (Cơ bản).
    - Level 2-5: Tăng dần độ dài và độ phức tạp (Sử dụng cả phím đen, quãng nhảy xa).
    - Tổng cộng: 5 Round cố định.

## 3. TECHNICAL SPECS (WEB AUDIO API)
Sử dụng `window.AudioContext` để tạo âm thanh (Oscillator type: 'sine' hoặc 'triangle' cho tiếng mượt).

**Frequency Map (C3 - B4):**
```typescript
const NOTE_FREQUENCIES: Record<string, number> = {
  // Octave 3
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81,
  'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  // Octave 4
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
  'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88
};
```

## 4. UI/UX REQUIREMENTS
*   **Visual:** Mô phỏng bàn phím Piano thực tế.
    *   Phím trắng: To, dài.
    *   Phím đen: Ngắn, nằm giữa các phím trắng (CSS position: absolute hoặc Grid khéo léo).
*   **Feedback Visual:**
    *   Khi máy chơi: Phím sáng màu Teal (Theme An).
    *   Khi User chơi: Phím sáng màu Lime (nếu đúng) hoặc Amber (nếu sai - nhưng vẫn cho qua).
*   **Progress:** Hiển thị dạng "Sheet Music" (Nốt nhạc) hoặc các chấm tròn đại diện cho số nốt cần đánh.

## 5. SCORING & EVALUATION LOGIC (MUSICAL INTELLIGENCE)
Không dùng điểm số 100/100 đơn thuần. Hãy lưu lại Detailed Log để gửi cho AI phân tích:
*   **Pitch Accuracy:** Tỷ lệ % nốt đánh đúng cao độ.
*   **Melodic Contour:** Người dùng có đoán đúng hướng đi của giai điệu (Lên/Xuống) ngay cả khi sai nốt không? (Ví dụ: Đề C -> G (Lên), User đánh C -> E (Lên) => Vẫn có tư duy giai điệu).
*   **Rhythmic Memory:** (Optional) Thời gian ngập ngừng giữa các nốt.

## 6. SYSTEM PROMPT FOR AI ANALYSIS (QUAN TRỌNG)
Khi gửi dữ liệu về generate-advice (hoặc DeepSeek), hãy sử dụng Context này:
*   **ROLE:** Bạn là Giáo sư Âm nhạc tại Nhạc viện (Conservatory Professor).
*   **TASK:** Đánh giá năng khiếu âm nhạc dựa trên bài test Piano.
*   **DATA:**
    *   Pitch Accuracy: {score}%
    *   Mistakes: {list_of_mistakes}
*   **OUTPUT RULES:**
    *   KHÔNG tư vấn nghề nghiệp văn phòng (IT, Kế toán...).
    *   CHỈ nói về: Năng khiếu thính giác, Khả năng ghi nhớ giai điệu, Cảm âm (Perfect Pitch vs Relative Pitch).
    *   TONE: Nghệ thuật, bay bổng nhưng chuyên môn cao.

## 7. INSTRUCTION FOR CODING
1.  Viết lại `src/pages/assessment/SequenceMemory.tsx`.
2.  Tạo Component `PianoKey.tsx` xử lý riêng việc hiển thị phím Trắng/Đen.
3.  Tạo Hook `useAudioSynth` để quản lý âm thanh (tránh tạo lại AudioContext liên tục).
4.  Đảm bảo Logic: User bấm nốt thứ 5 -> Hệ thống ghi nhận -> Nếu là nốt cuối cùng của chuỗi -> Kết thúc Round -> Chuyển Round mới (hoặc End Game nếu hết 5 Round).

### 💡 HƯỚNG DẪN BỔ SUNG
1.  **CSS Phím Đen:** Dùng `z-index` cao hơn phím trắng và `left` margin chính xác để phím đen nằm đè lên ranh giới 2 phím trắng.
2.  **Mobile Responsive:** 2 Quãng tám (24 phím) là khá dài. Trên Mobile, yêu cầu Agent làm chế độ **Scroll ngang (Overflow-x-scroll)** cho bàn phím.
