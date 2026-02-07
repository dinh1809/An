import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface CareerMatch {
    title: string;
    matchPercent: number;
    description: string;
    icon: "code" | "palette" | "check-circle" | "brain" | "rocket";
}

interface NeuroProfile {
    visualSpatial: number;
    inhibitionControl: number;
    workingMemory: number;
    flexibility: number;
    attention: number;
}

// Initialize the Gemini client
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export const aiService = {
    async generateCareerInsights(profile: NeuroProfile): Promise<CareerMatch[]> {
        if (!genAI) {
            console.warn("Gemini API key is missing, using fallback careers");
            return getFallbackCareers(profile);
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
You are "Dr. An", an expert Neurodiversity Career Counselor. 
Analyze the following neuro-cognitive profile from a game-based assessment:

- Visual-Spatial (Detail Spotter): ${profile.visualSpatial}/100
- Inhibition Control (Command Override): ${profile.inhibitionControl}/100
- Working Memory (Time Warp): ${profile.workingMemory}/100
- Cognitive Flexibility (Flux Matrix): ${profile.flexibility}/100
- Divided Attention (Dispatcher): ${profile.attention}/100

Based on these metrics, suggest 3 NON-TRADITIONAL, strengths-based careers suitable for a neurodiverse individual (Autism/ADHD).
Focus on roles like Data Labeling, QA Testing, creative tech, or specialized logistics.

Return strictly a JSON array with objects containing:
- title: Job title (in Vietnamese if possible)
- matchPercent: A calculated match percentage (0-100) based on the profile
- description: A 1-sentence personalized explanation why they fit this role in Vietnamese (e.g., "Khả năng phát hiện chi tiết của bạn rất phù hợp với...")
- icon: "code" | "palette" | "check-circle" | "brain" | "rocket" (choose best fit)

Do not include markdown formatting like \`\`\`json. Just the raw JSON array.
        `.trim();

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (!text) return getFallbackCareers(profile);

            // Clean markdown if present
            const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

            return JSON.parse(cleanText);

        } catch (error) {
            console.error("AI Generation Failed:", error);
            return getFallbackCareers(profile);
        }
    }
};

// Fallback logic if AI fails (basic rule-based matching)
function getFallbackCareers(profile: NeuroProfile): CareerMatch[] {
    const matches: CareerMatch[] = [];

    // High Visual -> QC / Data
    if (profile.visualSpatial > 70) {
        matches.push({
            title: "AI Data Labeler",
            matchPercent: profile.visualSpatial,
            description: "Khả năng phát hiện chi tiết của bạn cực kỳ phù hợp để gán nhãn dữ liệu cho AI.",
            icon: "check-circle"
        });
    }

    // High Memory -> Coding / Logs
    if (profile.workingMemory > 70) {
        matches.push({
            title: "Backend Developer",
            matchPercent: profile.workingMemory,
            description: "Trí nhớ làm việc tốt giúp bạn xử lý các thuật toán phức tạp.",
            icon: "code"
        });
    }

    // High Flexibility -> Design / UX
    if (profile.flexibility > 70) {
        matches.push({
            title: "UX/UI Designer",
            matchPercent: profile.flexibility,
            description: "Tư duy linh hoạt giúp bạn thấu hiểu nhiều luồng trải nghiệm người dùng.",
            icon: "palette"
        });
    }

    // High Inhibition -> QA / Testing
    if (profile.inhibitionControl > 70) {
        matches.push({
            title: "QA Tester",
            matchPercent: profile.inhibitionControl,
            description: "Khả năng kiểm soát xung động giúp bạn kiên nhẫn tìm lỗi phần mềm.",
            icon: "brain"
        });
    }

    // Fill if empty
    if (matches.length === 0) {
        matches.push({
            title: "Quality Assurance",
            matchPercent: 65,
            description: "Sự cẩn trọng của bạn là tài sản quý giá cho việc kiểm thử sản phẩm.",
            icon: "check-circle"
        });
    }

    return matches.slice(0, 3);
}
