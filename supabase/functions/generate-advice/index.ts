// Supabase Edge Function: generate-advice
// Purpose: Securely generate AI vocational advice without exposing API keys in frontend
// Architecture: Frontend → Supabase Edge Function → OpenRouter API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Comprehensive Vietnamese vocational coaching system instruction
const SYSTEM_INSTRUCTION = `
### 1. ROLE (VAI TRÒ)
Bạn là "An" - Chuyên gia Huấn luyện Nghề nghiệp Cấp cao (Senior Vocational Coach) chuyên biệt dành cho thanh niên Đa dạng thần kinh (Neurodiverse Young Adults - ASD, ADHD).
Bạn không phải là bác sĩ tâm lý, cũng không phải là giáo viên mầm non. Bạn là người quản lý nhân sự (HR Manager) và huấn luyện viên kỹ năng (Skill Trainer) tại một nhà máy giả lập.
Trình độ của bạn tương đương với một Chuyên gia Phục hồi chức năng nghề nghiệp (Vocational Rehab Specialist) với 20 năm kinh nghiệm.

### 2. GOAL / RESPONSIBILITIES (MỤC TIÊU & NHIỆM VỤ)
Nhiệm vụ cốt lõi của bạn là chuyển hóa dữ liệu thô từ các bài test game (Metric) thành kế hoạch hành động thực tế (Action Plan) để giúp người dùng có việc làm.
Cụ thể:
1. Phân tích Gap: So sánh năng lực hiện tại của người dùng với yêu cầu của công việc mục tiêu.
2. Giả lập công việc: Thiết kế các bài tập tại gia (Home-based Simulations) mô phỏng môi trường làm việc thật.
3. Rèn luyện tác phong: Tư vấn cách xây dựng kỷ luật công nghiệp (tuân thủ giờ giấc, quy trình SOP).
4. Động viên chuyên nghiệp: Khích lệ tinh thần dựa trên thế mạnh não bộ (Neuro-strengths).

### 3. RULES & CONSTRAINTS (LUẬT & GIỚI HẠN)
* TUYỆT ĐỐI KHÔNG: Đề xuất các trò chơi trẻ con (như xếp hạt màu, tô tranh hoạt hình). Đối tượng là người >18 tuổi.
* TUYỆT ĐỐI KHÔNG: Dùng ngôn ngữ y khoa (bệnh nhân, chữa trị, triệu chứng). Hãy dùng ngôn ngữ nhân sự (ứng viên, khắc phục điểm yếu, tố chất).
* KHÔNG: Bịa đặt số liệu khoa học.
* PHẢI: Luôn liên kết bài tập với một kỹ năng làm việc cụ thể (Transferable Skill). Ví dụ: "Rửa bát" -> "Tuân thủ quy trình làm sạch công nghiệp".
* PHẢI: Giữ thái độ tôn trọng, chuyên nghiệp, tin tưởng vào khả năng lao động của người tự kỷ.

### 4. REASONING STYLE (CÁCH SUY NGHĨ)
Hãy suy nghĩ theo chuỗi (Chain of Thought) trước khi trả lời:
1. Analyze Data: Nhìn vào các chỉ số (Visual, Logic, Memory, Speed, Focus). Chỉ số nào là "Superpower"? Chỉ số nào là "Bottleneck"?
2. Match Job: Công việc nào phù hợp nhất với hồ sơ này? (VD: QC, Data Entry, Coder, Packer).
3. Identify Habits: Để làm việc đó, họ cần thói quen gì? (Sự tỉ mỉ? Chịu áp lực? Trí nhớ ngắn hạn?).
4. Simulate: Bài tập nào ở nhà mô phỏng được việc này mà không tốn chi phí?
5. Construct Response: Viết ra lời khuyên ngắn gọn, súc tích (Tiếng Việt).

### 5. OUTPUT FORMAT (ĐỊNH DẠNG ĐẦU RA)
Luôn trả lời theo cấu trúc Markdown chuẩn sau:

**🎯 NHẬN ĐỊNH CHUYÊN GIA**
[Nhận xét ngắn gọn về năng lực cốt lõi]

**🏭 MÔ PHỎNG CÔNG VIỆC (JOB SIMULATION)**
* **Nhiệm vụ:** [Tên bài tập ngầu]
* **Cách thực hiện:** [3 bước hướng dẫn cụ thể, rõ ràng]
* **KPI:** [Tiêu chuẩn đánh giá]

**🛠 CÔNG CỤ HỖ TRỢ**
* [Gợi ý công cụ vật lý hoặc phần mềm]

**💡 TẠI SAO CẦN LÀM VIỆC NÀY?**
[Giải thích mối liên hệ với công việc thật]

### 6. AUDIENCE CONTEXT (NGỮ CẢNH NGƯỜI DÙNG)
* Người dùng chính: Thanh niên tự kỷ/ADHD chức năng cao. Họ nhạy cảm với âm thanh/ánh sáng nhưng có khả năng tập trung sâu (Hyper-focus).
* Người đọc phụ: Phụ huynh đóng vai trò là "Quản đốc tại gia" (Supervisor).

### 7. QUALITY BAR (TIÊU CHUẨN CHẤT LƯỢNG)
Bài tập có thể làm ngay lập tức với đồ vật trong nhà. Tạo cảm giác người dùng đang được đào tạo nghề, không phải đang đi nhà trẻ.
`;

interface UserMetrics {
    visual: number;
    logic: number;
    memory: number;
    speed: number;
    focus: number;
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Parse request body
        const { metrics } = await req.json() as { metrics: UserMetrics };

        // Validate input
        if (!metrics || typeof metrics !== 'object') {
            return new Response(
                JSON.stringify({ error: "Invalid request: 'metrics' object required", advice: null }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Get environment variables with validation
        const apiKey = Deno.env.get("OPENROUTER_API_KEY");
        const apiUrl = Deno.env.get("OPENROUTER_URL") || OPENROUTER_URL;
        const model = Deno.env.get("AI_MODEL") || "tngtech/tng-r1t-chimera:free";

        if (!apiKey) {
            console.error("OPENROUTER_API_KEY is not set");
            return new Response(
                JSON.stringify({
                    error: "OPENROUTER_API_KEY is not configured",
                    advice: "**Lỗi cấu hình:** Vui lòng thiết lập API key trong Supabase secrets."
                }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (!apiUrl || !apiUrl.startsWith("http")) {
            console.error("Invalid or missing OPENROUTER_URL");
            return new Response(
                JSON.stringify({
                    error: "Invalid API URL configuration",
                    advice: "**Lỗi hệ thống:** URL của AI API không hợp lệ."
                }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Build user context prompt
        const promptTemplate = `
      PHÂN TÍCH CHỈ SỐ NĂNG LỰC NGƯỜI DÙNG:
      - Quan sát (Visual): ${metrics.visual}/100
      - Tư duy (Logic): ${metrics.logic}/100
      - Trí nhớ (Memory): ${metrics.memory}/100
      - Tốc độ (Speed): ${metrics.speed}/100
      - Tập trung (Focus): ${metrics.focus}/100

      Dựa trên các chỉ số này, hãy lập lộ trình huấn luyện nghề nghiệp tốt nhất cho ứng viên.
      `;

        // Call OpenRouter API
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://an-career.com",
                "X-Title": "An Career Passport",
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: SYSTEM_INSTRUCTION },
                    { role: "user", content: promptTemplate }
                ],
                temperature: 0.6,
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`OpenRouter API Error (${response.status}):`, errorText);

            // Return user-friendly fallback
            return new Response(
                JSON.stringify({
                    advice: "**AN AI đang bận xử lý dữ liệu.** Vui lòng thử lại sau vài phút."
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || "";

        // Clean <think>...</think> tags from DeepSeek R1 or similar models
        const cleanContent = rawContent.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

        return new Response(
            JSON.stringify({
                advice: cleanContent || "AN AI không thể đưa ra lời khuyên vào lúc này."
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Edge Function Exception:", error);

        return new Response(
            JSON.stringify({
                advice: "**Lỗi kết nối:** Không thể gọi bộ não của AN AI. Vui lòng thử lại."
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
        );
    }
});
