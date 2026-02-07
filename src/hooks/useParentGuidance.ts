/**
 * 👨‍👩‍👧 USE PARENT GUIDANCE HOOK
 * ==============================
 * Data layer for the Parent Guidance Page
 * 
 * Extends useUnifiedResult with:
 * - FAQ content
 * - Activity suggestions
 * - Next steps timeline
 * - Support resources
 */

import { useMemo } from "react";
import { useUnifiedResult, type CognitiveProfile, type TeachingStrategy, type Milestone, type DevelopmentDirection } from "./useUnifiedResult";

// ============================================================================
// TYPES
// ============================================================================

export interface FAQ {
    id: string;
    question: string;
    answer: string;
}

export interface Activity {
    id: string;
    title: string;
    description: string;
    duration: string;
    icon: string;
    difficulty: "easy" | "medium" | "hard";
}

export interface NextStep {
    id: string;
    order: number;
    title: string;
    description: string;
    status: "done" | "current" | "upcoming";
}

export interface SupportResource {
    type: "phone" | "email" | "website";
    label: string;
    value: string;
}

export interface ParentGuidanceData {
    // Child info
    childName: string;
    childAge?: number;

    // Cognitive profile
    profile: CognitiveProfile;
    primaryStrength: string;
    strengths: string[];

    // Teaching
    strategy: TeachingStrategy;

    // Development
    directions: DevelopmentDirection[];
    milestones: Milestone[];

    // Parent-specific content
    faqs: FAQ[];
    suggestedActivities: Activity[];
    nextSteps: NextStep[];
    supportResources: SupportResource[];

    // Meta
    completedGames: number;
    totalGames: number;
    lastUpdated: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PARENT_FAQS: FAQ[] = [
    {
        id: "q1",
        question: "Kết quả này có chính xác không?",
        answer: "Kết quả đánh giá dựa trên dữ liệu từ các bài chơi game. Đây là xu hướng tham khảo để xây dựng kế hoạch giáo dục cá nhân hóa, không thay thế cho chẩn đoán y khoa chính thức. Để có đánh giá toàn diện, vui lòng tham khảo ý kiến chuyên gia tâm lý hoặc bác sĩ."
    },
    {
        id: "q2",
        question: "Làm thế nào để hỗ trợ con tốt nhất?",
        answer: "Dựa vào điểm mạnh của con, hãy tập trung vào các hoạt động phù hợp với cách học ưu thế (thị giác, thính giác, vận động, logic). Sử dụng các công cụ và mẹo được gợi ý trong phần 'Chiến lược giảng dạy'. Quan trọng nhất là kiên nhẫn và tạo môi trường học tập thoải mái."
    },
    {
        id: "q3",
        question: "Con nên học nghề gì trong tương lai?",
        answer: "Chúng tôi không đưa ra khuyến nghị nghề nghiệp cụ thể vì tiềm năng của mỗi trẻ có thể thay đổi theo thời gian. Thay vào đó, chúng tôi gợi ý các hướng phát triển phù hợp với năng lực hiện tại để con có thể khám phá và phát triển toàn diện."
    },
    {
        id: "q4",
        question: "Có nên cho con học thêm các kỹ năng khác?",
        answer: "Nên! Mặc dù tập trung vào điểm mạnh là quan trọng, việc phát triển đa dạng kỹ năng giúp con linh hoạt hơn. Hãy bắt đầu từ điểm mạnh để xây dựng sự tự tin, sau đó dần dần mở rộng sang các lĩnh vực khác với sự hỗ trợ phù hợp."
    },
    {
        id: "q5",
        question: "Làm sao để theo dõi tiến bộ của con?",
        answer: "Bạn có thể cho con chơi lại các bài đánh giá định kỳ (mỗi 2-3 tháng) để theo dõi sự thay đổi. Ngoài ra, hãy ghi chú các quan sát hàng tuần về hành vi, sở thích và tiến bộ của con trong các hoạt động thực tế."
    }
];

const SUPPORT_RESOURCES: SupportResource[] = [
    { type: "phone", label: "Hotline hỗ trợ", value: "1900-0000" },
    { type: "email", label: "Email tư vấn", value: "support@an-platform.vn" },
    { type: "website", label: "Tài liệu hướng dẫn", value: "https://an-platform.vn/guides" }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateActivities(profile: CognitiveProfile, primaryStrength: string): Activity[] {
    const activities: Record<string, Activity[]> = {
        visual: [
            {
                id: "v1",
                title: "Ghép hình mẫu",
                description: "Tìm và ghép các mẫu hình ảnh phức tạp, rèn kỹ năng quan sát chi tiết",
                duration: "15-20 phút",
                icon: "puzzle",
                difficulty: "easy"
            },
            {
                id: "v2",
                title: "Vẽ mindmap",
                description: "Vẽ sơ đồ tư duy với màu sắc và hình ảnh để ghi nhớ bài học",
                duration: "30 phút",
                icon: "palette",
                difficulty: "medium"
            },
            {
                id: "v3",
                title: "Digital Art",
                description: "Sáng tạo nghệ thuật số với tablet hoặc máy tính",
                duration: "45 phút",
                icon: "pencil",
                difficulty: "hard"
            }
        ],
        auditory: [
            {
                id: "a1",
                title: "Nghe nhạc cổ điển",
                description: "Thư giãn và phát triển thính giác với Mozart, Beethoven",
                duration: "20 phút",
                icon: "music",
                difficulty: "easy"
            },
            {
                id: "a2",
                title: "Học qua Podcast",
                description: "Nghe các chương trình giáo dục phù hợp lứa tuổi",
                duration: "30 phút",
                icon: "headphones",
                difficulty: "medium"
            },
            {
                id: "a3",
                title: "Học nhạc cụ",
                description: "Bắt đầu với piano, guitar hoặc ukulele",
                duration: "45 phút",
                icon: "music",
                difficulty: "hard"
            }
        ],
        movement: [
            {
                id: "m1",
                title: "Xếp Lego",
                description: "Xây dựng mô hình theo hướng dẫn hoặc sáng tạo tự do",
                duration: "30 phút",
                icon: "box",
                difficulty: "easy"
            },
            {
                id: "m2",
                title: "Thí nghiệm khoa học",
                description: "Các thí nghiệm STEM đơn giản tại nhà",
                duration: "45 phút",
                icon: "flask",
                difficulty: "medium"
            },
            {
                id: "m3",
                title: "Lập trình Robot",
                description: "Lắp ráp và lập trình robot giáo dục (Lego Mindstorms)",
                duration: "60 phút",
                icon: "robot",
                difficulty: "hard"
            }
        ],
        logic: [
            {
                id: "l1",
                title: "Sudoku cho trẻ",
                description: "Giải các bài Sudoku từ dễ đến khó",
                duration: "15 phút",
                icon: "grid",
                difficulty: "easy"
            },
            {
                id: "l2",
                title: "Scratch coding",
                description: "Học lập trình cơ bản với Scratch.mit.edu",
                duration: "40 phút",
                icon: "code",
                difficulty: "medium"
            },
            {
                id: "l3",
                title: "Dự án Python",
                description: "Tự tạo game hoặc ứng dụng đơn giản",
                duration: "60 phút",
                icon: "terminal",
                difficulty: "hard"
            }
        ]
    };

    return activities[primaryStrength] || activities.visual;
}

function generateNextSteps(completedGames: number, totalGames: number): NextStep[] {
    const steps: NextStep[] = [
        {
            id: "step1",
            order: 1,
            title: "Hoàn thành đánh giá",
            description: `Đã hoàn thành ${completedGames}/${totalGames} bài kiểm tra`,
            status: completedGames >= 3 ? "done" : "current"
        },
        {
            id: "step2",
            order: 2,
            title: "Xem kết quả phân tích",
            description: "Hiểu về điểm mạnh và năng lực của con",
            status: completedGames >= 3 ? "done" : "upcoming"
        },
        {
            id: "step3",
            order: 3,
            title: "Lên kế hoạch học tập",
            description: "Áp dụng chiến lược giảng dạy phù hợp",
            status: completedGames >= 6 ? "current" : "upcoming"
        },
        {
            id: "step4",
            order: 4,
            title: "Kết nối chuyên gia",
            description: "Tham khảo ý kiến từ nhà tâm lý hoặc trị liệu viên",
            status: "upcoming"
        }
    ];

    return steps;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useParentGuidance() {
    const { loading, error, data: unifiedData, translateDomain } = useUnifiedResult();

    const guidanceData = useMemo((): ParentGuidanceData | null => {
        if (!unifiedData) return null;

        const suggestedActivities = generateActivities(
            unifiedData.profile,
            unifiedData.primaryStrength
        );

        const nextSteps = generateNextSteps(
            unifiedData.completedGames,
            unifiedData.totalGames
        );

        return {
            // From unified result
            childName: unifiedData.childName,
            profile: unifiedData.profile,
            primaryStrength: unifiedData.primaryStrength,
            strengths: unifiedData.strengths,
            strategy: unifiedData.strategy,
            directions: unifiedData.directions,
            milestones: unifiedData.milestones,
            completedGames: unifiedData.completedGames,
            totalGames: unifiedData.totalGames,

            // Parent-specific
            faqs: PARENT_FAQS,
            suggestedActivities,
            nextSteps,
            supportResources: SUPPORT_RESOURCES,
            lastUpdated: new Date().toISOString()
        };
    }, [unifiedData]);

    return {
        loading,
        error,
        data: guidanceData,
        translateDomain
    };
}
