
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Use Google Generative AI (Gemini) through OpenRouter or direct API if preferred.
// For consistency with existing setup, we'll stick to a generic OpenAI-compatible structure
// but prompt specifically for the clinical role.
// NOTE: Make sure to set OPENROUTER_API_KEY in Supabase secrets.

const GEMINI_SYSTEM_PROMPT = `
You are an empathetic pediatric therapist and clinical writer. 
Your goal is to write a progress report for a parent based on raw video observations provided by a therapist. 

### TONE & STYLE
- **Professional but Warm:** Use clinical terms but explain them simply.
- **Encouraging:** Highlight progress and strengths first.
- **Action-Oriented:** Give clear, doable homework.
- **Language:** Vietnamese (Tiếng Việt).

### INPUT DATA
You will receive a list of "Annotations" (Time + Note) and the Child's Name.

### OUTPUT STRUCTURE (Markdown)
Please structure the report exactly like this:

# 📝 Báo cáo Tiến độ: [Tên Bé]

## 🌟 Điểm Sáng (Strengths)
[Summarize what the child did well based on positive notes. Use bullet points.]

## 🌱 Cần Cải Thiện (Areas for Growth)
[Synthesize the struggles mentioned in the notes. Frame them as "Opportunities" rather than failures.]

## 🏠 Bài Tập Về Nhà (Home Practice)
[Suggest 1-2 simple, fun activities parents can do to help with the "Areas for Growth".]

---
*Ghi chú: Báo cáo này được tổng hợp từ phiên trị liệu gần nhất.*
`;

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { annotations, patient_name } = await req.json();

        if (!annotations || !Array.isArray(annotations)) {
            console.error("Invalid Request: Annotations missing or not an array");
            return new Response(
                JSON.stringify({ error: "Dữ liệu quan sát không hợp lệ." }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Validate Environment
        const openRouterKey = Deno.env.get("OPENROUTER_API_KEY");
        const geminiKey = Deno.env.get("GEMINI_API_KEY");
        const apiKey = openRouterKey || geminiKey;
        const model = Deno.env.get("AI_MODEL") || "google/gemini-3-flash-preview"; // Updated to Gemini 3 Flash (Latest)

        if (!apiKey) {
            console.error("Configuration Error: Missing OPENROUTER_API_KEY or GEMINI_API_KEY");
            return new Response(
                JSON.stringify({
                    error: "Hệ thống chưa cấu hình API Key. Vui lòng thiết lập GEMINI_API_KEY trong Supabase secrets.",
                    report: "⚠️ **Lỗi cấu hình:** Vui lòng liên hệ quản trị viên để thiết lập AI Key."
                }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Determine which API to call
        const isDirectGemini = !openRouterKey && (apiKey.startsWith("AIza") || geminiKey);
        // Gemini 3 Flash confirmed released Dec 2025, using v1beta for preview access
        const apiUrl = isDirectGemini
            ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`
            : "https://openrouter.ai/api/v1/chat/completions";

        console.log(`Invoking AI for ${patient_name} using ${isDirectGemini ? 'Google Gemini (Dec 2025 Release: 3-flash)' : 'OpenRouter (' + model + ')'}`);






        // Construct Payload
        const observationsText = annotations.map((a: any) => `- Tại ${a.timestamp}: ${a.note}`).join("\n");
        const userPrompt = `Tên Bệnh nhân: ${patient_name || "Bé"}\n\nCác quan sát thô từ video:\n${observationsText}\n\nHãy tạo báo cáo tiến độ lâm sàng bằng tiếng Việt dựa trên các quan sát trên.`;

        let response;
        try {
            if (isDirectGemini) {
                response = await fetch(apiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            { role: "user", parts: [{ text: GEMINI_SYSTEM_PROMPT + "\n\n" + userPrompt }] }
                        ],
                        generationConfig: { temperature: 0.7 }
                    })
                });
            } else {
                response = await fetch(apiUrl, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://an-therapy.com",
                        "X-Title": "An Therapy Video Review",
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            { role: "system", content: GEMINI_SYSTEM_PROMPT },
                            { role: "user", content: userPrompt }
                        ],
                        temperature: 0.7,
                    })
                });
            }

            if (!response.ok) {
                const errText = await response.text();
                console.error(`AI API Error (${response.status}):`, errText);

                // Return a friendly message in the 200 response instead of 500ing
                return new Response(
                    JSON.stringify({
                        report: "⚠️ **Bộ não AI của AN đang bận.**\n\nKhông thể kết nối với dịch vụ phân tích (Lỗi: " + response.status + "). Vui lòng thử lại sau giây lát hoặc liên hệ hỗ trợ kỹ thuật.",
                        error: "Raw API error: " + errText.substring(0, 100)
                    }),
                    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }

            const data = await response.json();
            const reportMarkdown = isDirectGemini
                ? (data.candidates?.[0]?.content?.parts?.[0]?.text || "Không thể tạo báo cáo.")
                : (data.choices?.[0]?.message?.content || "Không thể tạo báo cáo.");

            return new Response(
                JSON.stringify({ report: reportMarkdown }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );

        } catch (fetchError) {
            console.error("Fetch Exception:", fetchError);
            return new Response(
                JSON.stringify({
                    report: "⚠️ **Lỗi kết nối mạng.**\n\nKhông thể gửi dữ liệu đến máy chủ AI. Vui lòng kiểm tra lại kết nối internet của bạn.",
                    error: fetchError.message
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

    } catch (error) {
        console.error("Edge Function Top-level Error:", error);
        return new Response(
            JSON.stringify({
                error: error.message,
                report: "❌ **Lỗi hệ thống nghiêm trọng.** Vui lòng thử lại sau."
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});

