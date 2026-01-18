// AI Vocational Service
// Secure architecture: Frontend → Supabase Edge Function → OpenRouter API
// No API keys exposed in frontend code

import { UserMetrics } from "./CareerEngine";
import { supabase } from "@/integrations/supabase/client";

export const AiVocationalService = {
    /**
     * Generate career advice using AI via secure Edge Function
     * @param metrics - User's cognitive metrics from assessments
     * @returns AI-generated vocational advice in Vietnamese
     */
    async generateAdvice(metrics: UserMetrics): Promise<string> {
        try {
            console.log("AiVocationalService: Calling Supabase Edge Function 'generate-advice'");
            console.log("Metrics:", metrics);

            // Call Supabase Edge Function (server-side, secure)
            const { data, error } = await supabase.functions.invoke('generate-advice', {
                body: { metrics }
            });

            // Handle function invocation errors
            if (error) {
                console.error("Edge Function invocation error:", error);
                return "**Lỗi kết nối:** Không thể gọi bộ não của AN AI. Vui lòng kiểm tra kết nối và thử lại.";
            }

            // Handle API errors returned in data
            if (data?.error) {
                console.error("Edge Function returned error:", data.error);
                return "**AN AI đang bận xử lý dữ liệu.** Vui lòng thử lại sau vài phút.";
            }

            // Return the advice
            const advice = data?.advice;
            if (!advice || typeof advice !== 'string') {
                console.error("Invalid response format from Edge Function:", data);
                return "**Lỗi định dạng:** Nhận phản hồi không hợp lệ từ AN AI.";
            }

            console.log("Successfully received AI advice");
            return advice;

        } catch (error) {
            console.error("AN AI Exception:", error);

            // Network errors or unexpected failures
            if (error instanceof Error) {
                console.error("Error details:", error.message);
            }

            return "**Lỗi hệ thống:** Không thể kết nối với AN AI. Vui lòng thử lại sau.";
        }
    }
};
