
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
            throw new Error("Invalid annotations data");
        }

        // Validate Environment
        const openRouterKey = Deno.env.get("OPENROUTER_API_KEY");
        const geminiKey = Deno.env.get("GEMINI_API_KEY");
        const apiKey = openRouterKey || geminiKey;

        if (!apiKey) {
            console.error("Configuration Error: Missing OPENROUTER_API_KEY or GEMINI_API_KEY");
            return new Response(
                JSON.stringify({ error: "Hệ thống chưa cấu hình API Key. Vui lòng chạy lệnh: npx supabase secrets set GEMINI_API_KEY=your_key" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Determine which API to call
        const isDirectGemini = !openRouterKey && apiKey.startsWith("AIza");
        const apiUrl = isDirectGemini
            ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`
            : "https://openrouter.ai/api/v1/chat/completions";

        console.log(`Calling ${isDirectGemini ? 'Google Gemini' : 'OpenRouter'} API for ${patient_name}...`);

        // Construct Payload
        const observationsText = annotations.map((a: any) => `- Tại ${a.timestamp}: ${a.note}`).join("\n");
        const userPrompt = `Tên Bệnh nhân: ${patient_name || "Bé"}\n\nCác quan sát thô từ video:\n${observationsText}\n\nHãy tạo báo cáo tiến độ lâm sàng bằng tiếng Việt dựa trên các quan sát trên.`;

        let response;
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
                    "X-Title": "An Therapy AI",
                },
                body: JSON.stringify({
                    model: "google/gemini-2.0-flash-exp:free",
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
            console.error("AI API Error Details:", errText);
            let errorMessage = `AI Provider Error: ${response.status}`;
            try {
                const errJson = JSON.parse(errText);
                errorMessage = isDirectGemini
                    ? (errJson.error?.message || errorMessage)
                    : (errJson.error?.message || errorMessage);
            } catch (e) { }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        const reportMarkdown = isDirectGemini
            ? (data.candidates?.[0]?.content?.parts?.[0]?.text || "Không thể tạo báo cáo.")
            : (data.choices?.[0]?.message?.content || "Không thể tạo báo cáo.");

        return new Response(
            JSON.stringify({ report: reportMarkdown }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error generating report:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
