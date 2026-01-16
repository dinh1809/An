
// Neurodiversity Career Passport - Vector Matching Engine
// Based on "PROJECT "AN": NEURODIVERSITY CAREER PASSPORT" v2.0

export type JobProfile = {
    id: string;
    title: string;
    category: "Technology" | "Logistics" | "Creative" | "Administrative" | "Manufacturing";
    tags: string[];
    requirements: {
        visual: number; // 0-10
        logic: number;
        memory: number;
        speed: number;
        focus: number;
    };
    description: string;
    whyMeTemplate: string; // Template for dynamic insight
};

export type UserMetrics = {
    visual: number; // 0-100
    logic: number;
    memory: number;
    speed: number;
    focus: number;
};

export type JobMatch = {
    job: JobProfile;
    matchScore: number; // 0-100%
    insight: string;
};

// Database of Neurodiverse-Friendly Jobs
export const JOB_DATABASE: JobProfile[] = [
    // --- TECH & DATA ---
    {
        id: "tech_labeler",
        title: "AI Data Labeler",
        category: "Technology",
        tags: ["Remote", "Detail-Oriented", "Visual"],
        requirements: { visual: 9, logic: 5, memory: 4, speed: 7, focus: 8 },
        description: "Annotation and tagging of images/videos to train Artificial Intelligence models.",
        whyMeTemplate: "Khả năng xử lý hình ảnh vượt trội (Visual {visual}/10) giúp bạn phát hiện chi tiết mà AI bỏ lỡ."
    },
    {
        id: "tech_qa",
        title: "Software QA Tester",
        category: "Technology",
        tags: ["Hybrid", "Logical", "Repetitive"],
        requirements: { visual: 7, logic: 8, memory: 6, speed: 5, focus: 9 },
        description: "Execute test cases to find bugs in software applications. Requires patience and logic.",
        whyMeTemplate: "Tư duy logic mạch lạc ({logic}/10) và sự tập trung cao độ giúp bạn tìm ra các lỗi phần mềm phức tạp."
    },
    {
        id: "tech_coder",
        title: "Backend Developer (Junior)",
        category: "Technology",
        tags: ["Remote", "Logical", "Deep Work"],
        requirements: { visual: 4, logic: 9, memory: 8, speed: 5, focus: 8 },
        description: "Write and maintain server-side infrastructure. Ideal for pattern thinkers.",
        whyMeTemplate: "Khả năng ghi nhớ chuỗi ({memory}/10) và logic thuật toán xuất sắc là nền tảng của một lập trình viên giỏi."
    },

    // --- LOGISTICS & WAREHOUSE ---
    {
        id: "log_packer",
        title: "Precision Packer",
        category: "Logistics",
        tags: ["Active", "Spatial", "Warehouse"],
        requirements: { visual: 8, logic: 6, memory: 5, speed: 8, focus: 7 },
        description: "Efficiently pack goods ensuring safety and space optimization.",
        whyMeTemplate: "Tốc độ xử lý ({speed}/10) và tư duy không gian giúp bạn đóng gói hàng hóa nhanh và chính xác."
    },
    {
        id: "log_controller",
        title: "Inventory Controller",
        category: "Logistics",
        tags: ["Quiet Env", "Organized", "Memory"],
        requirements: { visual: 6, logic: 7, memory: 9, speed: 5, focus: 8 },
        description: "Track stock levels and manage inventory databases.",
        whyMeTemplate: "Trí nhớ làm việc tuyệt vời ({memory}/10) giúp bạn nắm bắt vị trí và số lượng hàng hóa dễ dàng."
    },

    // --- CREATIVE & ART ---
    {
        id: "art_retoucher",
        title: "Photo Editor / Retoucher",
        category: "Creative",
        tags: ["Creative", "Visual", "Remote"],
        requirements: { visual: 10, logic: 4, memory: 5, speed: 6, focus: 9 },
        description: "Enhance and retouch digital images with pixel-perfect precision.",
        whyMeTemplate: "Đôi mắt 'đại bàng' ({visual}/10) cho phép bạn chỉnh sửa những chi tiết hình ảnh nhỏ nhất."
    },
    {
        id: "art_3d_modeler",
        title: "3D Prop Modeler",
        category: "Creative",
        tags: ["Creative", "Spatial", "Hybrid"],
        requirements: { visual: 9, logic: 7, memory: 6, speed: 5, focus: 7 },
        description: "Create 3D objects for games or architectural visualization.",
        whyMeTemplate: "Sự kết hợp giữa tư duy không gian ({visual}/10) và logic ({logic}/10) rất hợp với thiết kế 3D."
    },

    // --- ADMINISTRATIVE ---
    {
        id: "admin_data_entry",
        title: "Precision Data Entry",
        category: "Administrative",
        tags: ["Quiet Env", "Typing", "Routine"],
        requirements: { visual: 6, logic: 5, memory: 4, speed: 9, focus: 8 },
        description: "Input data into systems with high speed and zero errors.",
        whyMeTemplate: "Tốc độ xử lý thần tốc ({focus}/10) biến bạn thành cỗ máy nhập liệu hiệu quả."
    },
    {
        id: "admin_archivist",
        title: "Digital Archivist",
        category: "Administrative",
        tags: ["Quiet Env", "Organized", "History"],
        requirements: { visual: 5, logic: 8, memory: 7, speed: 4, focus: 8 },
        description: "Organize and catalog digital records systematically.",
        whyMeTemplate: "Sự ngăn nắp và tư duy phân loại ({logic}/10) giúp bạn quản lý kho dữ liệu khổng lồ."
    },

    // --- MANUFACTURING ---
    {
        id: "mfg_assembler",
        title: "Micro-Electronics Assembler",
        category: "Manufacturing",
        tags: ["Hands-on", "Focus", "Detail"],
        requirements: { visual: 8, logic: 5, memory: 6, speed: 6, focus: 10 },
        description: "Assemble tiny electronic components requiring steady hands and immense focus.",
        whyMeTemplate: "Sự tập trung cao độ ({focus}/10) là yếu tố then chốt để lắp ráp các linh kiện vi mạch."
    },
    {
        id: "mfg_qc",
        title: "Quality Control Inspector",
        category: "Manufacturing",
        tags: ["Factory", "Visual", "Compliance"],
        requirements: { visual: 10, logic: 6, memory: 5, speed: 7, focus: 8 },
        description: "inspect products for defects using visual aids and tools.",
        whyMeTemplate: "Không một lỗi nhỏ nào có thể qua mắt bạn nhờ chỉ số Visual ({visual}/10) tuyệt đối."
    }
];

// Normalize metrics to 0-10 scale
const normalize = (val: number) => Math.min(10, Math.max(1, Math.round(val / 10)));

export const findTopMatches = (rawMetrics: UserMetrics): JobMatch[] => {
    // 1. Normalize User Metrics
    const userScore = {
        visual: normalize(rawMetrics.visual),
        logic: normalize(rawMetrics.logic),
        memory: normalize(rawMetrics.memory),
        speed: normalize(rawMetrics.speed),
        focus: normalize(rawMetrics.focus)
    };

    // 2. Calculate Match Scores
    const results = JOB_DATABASE.map(job => {
        // Vector Distance (Simplified Euclidean-ish or Weighted Sum)
        // Here we use a Similarity Index: 100 - sum(abs(User - Job)) * weight
        // But to prioritize STRENGTHS, we assume:
        // If Job requires High Skill (8+), User MUST match or exceed to get high score.
        // If Job requires Low Skill, User exceeding it is fine (no penalty).

        let totalDiff = 0;
        const weights = { visual: 1, logic: 1, memory: 1, speed: 1, focus: 1 }; // Can vary later

        const diff = (u: number, r: number) => {
            // If user meets requirement, penalty is 0. 
            // If user is below requirement, penalty is the difference squared (high punishment).
            if (u >= r) return 0;
            return (r - u) * 2;
        };

        totalDiff += diff(userScore.visual, job.requirements.visual);
        totalDiff += diff(userScore.logic, job.requirements.logic);
        totalDiff += diff(userScore.memory, job.requirements.memory);
        totalDiff += diff(userScore.speed, job.requirements.speed);
        totalDiff += diff(userScore.focus, job.requirements.focus);

        // Initial Score based on punishment
        let matchScore = 100 - (totalDiff * 2);

        // Bonus for exceptional overlay
        if (userScore.visual > 8 && job.requirements.visual > 7) matchScore += 5;
        if (userScore.logic > 8 && job.requirements.logic > 7) matchScore += 5;
        if (userScore.memory > 8 && job.requirements.memory > 7) matchScore += 5;

        // Clamp 0-100
        matchScore = Math.min(99, Math.max(10, matchScore));

        // Generate Insight
        const insight = job.whyMeTemplate
            .replace("{visual}", userScore.visual.toString())
            .replace("{logic}", userScore.logic.toString())
            .replace("{memory}", userScore.memory.toString())
            .replace("{speed}", userScore.speed.toString())
            .replace("{focus}", userScore.focus.toString());

        return { job, matchScore, insight };
    });

    // 3. Sort and Return Top 3
    return results
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3);
};
