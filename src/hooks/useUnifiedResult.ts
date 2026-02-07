/**
 * 🔄 USE UNIFIED RESULT HOOK
 * ==========================
 * Data layer for the Unified Result Page
 * 
 * Fetches and aggregates:
 * - Latest game session (just finished)
 * - All game sessions for aggregated profile
 * - Calculates cognitive profile
 * - Generates teaching strategies
 * - Suggests development directions
 */

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// ============================================================================
// TYPES
// ============================================================================

export interface CognitiveProfile {
    visual: number;      // 1-5 scale
    auditory: number;    // 1-5 scale
    movement: number;    // 1-5 scale
    logic: number;       // 1-5 scale
}

export interface TeachingStrategy {
    key: string;
    name_vi: string;
    method: string;
    tools: string[];
    tips: string[];
    icon: string;
}

export interface DevelopmentDirection {
    id: string;
    name_vi: string;
    description: string;
    activities: string[];
    match_score: number;
    icon: string;
}

export interface Milestone {
    month: number;
    phase: string;
    title_vi: string;
    description_vi: string;
    activities: string[];
    icon: string;
}

export interface GameSession {
    id: string;
    game_type: string;
    final_score: number;
    accuracy_percentage: number;
    avg_reaction_time_ms: number;
    completed_at: string;
}

export interface UnifiedResultData {
    // Current game result
    currentGame: GameSession | null;

    // Aggregated profile
    profile: CognitiveProfile;
    primaryStrength: string;
    strengths: string[];

    // Teaching & Development
    strategy: TeachingStrategy;
    directions: DevelopmentDirection[];
    milestones: Milestone[];

    // Meta
    childName: string;
    completedGames: number;
    totalGames: number;
    isComprehensive: boolean;
    aiAnalysis: string | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TEACHING_STRATEGIES: Record<string, TeachingStrategy> = {
    high_visual: {
        key: "high_visual",
        name_vi: "Học qua Thị giác",
        method: "Visual Schedules / TEACCH",
        tools: ["Flashcards", "Mindmaps", "Biểu đồ màu sắc", "Video hướng dẫn"],
        tips: [
            "Sử dụng hình ảnh minh họa cho mọi khái niệm",
            "Tạo lịch trình bằng hình ảnh",
            "Dùng màu sắc để phân loại thông tin"
        ],
        icon: "eye"
    },
    high_auditory: {
        key: "high_auditory",
        name_vi: "Học qua Thính giác",
        method: "Audio-based Learning",
        tools: ["Podcast", "Audiobook", "Nhạc cụ", "Ghi âm bài học"],
        tips: [
            "Đọc to bài học cho con nghe",
            "Sử dụng nhịp điệu/vần để ghi nhớ",
            "Cho phép con tự nói lại nội dung đã học"
        ],
        icon: "volume-2"
    },
    high_movement: {
        key: "high_movement",
        name_vi: "Học qua Vận động",
        method: "Kinesthetic / Hands-on Learning",
        tools: ["Lego/Xếp hình", "Đất nặn", "Thí nghiệm thực hành", "Trò chơi vận động"],
        tips: [
            "Nghỉ giải lao vận động mỗi 15-20 phút",
            "Dùng đồ vật thật để minh họa",
            "Kết hợp học với hoạt động thể chất"
        ],
        icon: "move"
    },
    high_logic: {
        key: "high_logic",
        name_vi: "Học qua Hệ thống",
        method: "Structured / Systematic Learning",
        tools: ["Sơ đồ tư duy", "Bảng tính", "Coding (Scratch)", "Lập trình Robot"],
        tips: [
            "Chia nhỏ bài học thành các bước rõ ràng",
            "Đưa ra quy tắc cụ thể, nhất quán",
            "Giải thích logic đằng sau mọi việc"
        ],
        icon: "cpu"
    },
    balanced: {
        key: "balanced",
        name_vi: "Học đa phương thức",
        method: "Multimodal Learning",
        tools: ["Kết hợp nhiều phương pháp", "Thay đổi linh hoạt"],
        tips: [
            "Thử nghiệm nhiều cách tiếp cận khác nhau",
            "Quan sát phản hồi của con để điều chỉnh",
            "Kết hợp hình ảnh + âm thanh + thực hành"
        ],
        icon: "layers"
    }
};

const DIRECTION_CLUSTERS: Record<string, Omit<DevelopmentDirection, "match_score">> = {
    technical_system: {
        id: "technical_system",
        name_vi: "Kỹ thuật & Hệ thống",
        description: "Thiên hướng làm việc với máy móc, quy trình, hệ thống logic",
        activities: ["Lập trình Scratch/Python", "Lego Robotics", "Lắp ráp mô hình"],
        icon: "settings"
    },
    visual_creative: {
        id: "visual_creative",
        name_vi: "Sáng tạo & Thị giác",
        description: "Thiên hướng nghệ thuật, thiết kế, sáng tạo thị giác",
        activities: ["Vẽ tranh", "Chụp ảnh", "Làm phim ngắn", "Digital Art"],
        icon: "palette"
    },
    research_analysis: {
        id: "research_analysis",
        name_vi: "Nghiên cứu & Phân tích",
        description: "Thiên hướng tìm hiểu sâu, phân tích dữ liệu, quan sát chi tiết",
        activities: ["Thí nghiệm khoa học", "Quan sát thiên nhiên", "Thu thập bộ sưu tập"],
        icon: "search"
    },
    craft_hands_on: {
        id: "craft_hands_on",
        name_vi: "Thủ công & Thực hành",
        description: "Thiên hướng làm việc với tay, tạo ra sản phẩm hữu hình",
        activities: ["Gốm sứ", "Đan lát", "Làm bánh", "Chăm sóc cây"],
        icon: "hammer"
    },
    nature_environment: {
        id: "nature_environment",
        name_vi: "Thiên nhiên & Môi trường",
        description: "Thiên hướng yêu thích động vật, thực vật, hoạt động ngoài trời",
        activities: ["Làm vườn", "Chăm thú cưng", "Đi bộ đường dài", "Cắm trại"],
        icon: "leaf"
    }
};

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

function normalizeToFive(value: number, min: number, max: number): number {
    const clamped = Math.max(min, Math.min(max, value));
    return 1 + ((clamped - min) / (max - min)) * 4;
}

function calculateProfileFromSessions(sessions: GameSession[]): CognitiveProfile {
    // Only use completed sessions (with non-null scores)
    const completedSessions = sessions.filter(s => s.final_score !== null && s.final_score > 0);

    // Group by game type - take the BEST score for each type
    const byType: Record<string, GameSession> = {};
    completedSessions.forEach(s => {
        if (!byType[s.game_type] || (s.final_score || 0) > (byType[s.game_type].final_score || 0)) {
            byType[s.game_type] = s;
        }
    });

    // Helper functions
    const getScore = (type: string) => byType[type]?.final_score || 0;
    const getAccuracy = (type: string) => byType[type]?.accuracy_percentage || 0;
    const getSpeed = (type: string) => {
        const rt = byType[type]?.avg_reaction_time_ms;
        // Lower reaction time = better. Convert to 0-100 score (500ms great, 2000ms poor)
        return rt && rt > 0 ? Math.min(100, Math.max(0, 100 - ((rt - 300) / 17))) : 0;
    };

    // Calculate raw scores (0-100 scale)
    // Visual: detail_spotter, matrix_assessment, flux_matrix (visual pattern)
    const visualScores = [
        getScore("detail_spotter") > 0 ? Math.min(100, getScore("detail_spotter") / 10) : 0,
        getAccuracy("matrix_assessment"),
        byType["flux_matrix"] ? 70 : 0 // If played, give base score
    ].filter(s => s > 0);
    const visualRaw = visualScores.length > 0 ? visualScores.reduce((a, b) => a + b, 0) / visualScores.length : 50;

    // Logic: matrix_logic, command_override (inhibition), flux_matrix (rule switching)
    const logicScores = [
        getAccuracy("matrix_logic"),
        getScore("command_override") > 0 ? Math.min(100, getScore("command_override") / 10) : 0,
        getAccuracy("stroop_chaos"),
        getAccuracy("flux_matrix")
    ].filter(s => s > 0);
    const logicRaw = logicScores.length > 0 ? logicScores.reduce((a, b) => a + b, 0) / logicScores.length : 50;

    // Auditory: sonic_conservatory (sequence memory)
    const auditoryRaw = getAccuracy("sonic_conservatory") || (getScore("sonic_conservatory") > 0 ? Math.min(100, getScore("sonic_conservatory") / 5) : 50);

    // Movement/Speed: reaction-time-based from multiple games
    const movementScores = [
        getSpeed("detail_spotter"),
        getSpeed("dispatcher_console"),
        getSpeed("command_override")
    ].filter(s => s > 0);
    const movementRaw = movementScores.length > 0 ? movementScores.reduce((a, b) => a + b, 0) / movementScores.length : 50;

    // Normalize 0-100 to 1-5 scale
    const visual = normalizeToFive(visualRaw, 0, 100);
    const logic = normalizeToFive(logicRaw, 0, 100);
    const auditory = normalizeToFive(auditoryRaw, 0, 100);
    const movement = normalizeToFive(movementRaw, 0, 100);

    console.log("Profile calculation:", { visualRaw, logicRaw, auditoryRaw, movementRaw }); // Debug

    return {
        visual: Math.max(1, Math.min(5, visual)),
        auditory: Math.max(1, Math.min(5, auditory)),
        movement: Math.max(1, Math.min(5, movement)),
        logic: Math.max(1, Math.min(5, logic))
    };
}

function getPrimaryStrength(profile: CognitiveProfile): string {
    const entries = Object.entries(profile);
    return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
}

function getStrengths(profile: CognitiveProfile, threshold = 3.5): string[] {
    return Object.entries(profile)
        .filter(([, score]) => score >= threshold)
        .map(([domain]) => domain);
}

function generateStrategy(profile: CognitiveProfile): TeachingStrategy {
    const primary = getPrimaryStrength(profile);
    const strategyMap: Record<string, string> = {
        visual: "high_visual",
        auditory: "high_auditory",
        movement: "high_movement",
        logic: "high_logic"
    };
    return TEACHING_STRATEGIES[strategyMap[primary]] || TEACHING_STRATEGIES.balanced;
}

function suggestDirections(profile: CognitiveProfile): DevelopmentDirection[] {
    const requiredTraits: Record<string, Record<string, number>> = {
        technical_system: { logic: 4, visual: 3 },
        visual_creative: { visual: 4, movement: 2 },
        research_analysis: { logic: 4, visual: 4 },
        craft_hands_on: { movement: 4, visual: 3 },
        nature_environment: { movement: 4, auditory: 2 }
    };

    const directions: DevelopmentDirection[] = [];

    for (const [clusterId, cluster] of Object.entries(DIRECTION_CLUSTERS)) {
        const required = requiredTraits[clusterId] || {};
        const totalWeight = Object.values(required).reduce((a, b) => a + b, 0);
        let matchPoints = 0;

        for (const [trait, requiredLevel] of Object.entries(required)) {
            const actualLevel = profile[trait as keyof CognitiveProfile] || 3;
            if (actualLevel >= requiredLevel) {
                matchPoints += requiredLevel;
            } else {
                matchPoints += actualLevel * (actualLevel / requiredLevel);
            }
        }

        const matchScore = totalWeight > 0 ? (matchPoints / totalWeight) * 100 : 50;

        directions.push({
            ...cluster,
            match_score: Math.round(matchScore * 10) / 10
        });
    }

    return directions.sort((a, b) => b.match_score - a.match_score).slice(0, 3);
}

function translateDomain(domain: string): string {
    const translations: Record<string, string> = {
        visual: "Thị giác",
        auditory: "Thính giác",
        movement: "Vận động",
        logic: "Logic/Hệ thống"
    };
    return translations[domain] || domain;
}

function generateMilestones(primary: string, direction: DevelopmentDirection | null): Milestone[] {
    const activities = direction?.activities || [];

    return [
        {
            month: 1,
            phase: "Khám phá",
            title_vi: "Khám phá điểm mạnh",
            description_vi: `Thử nghiệm các hoạt động phù hợp với năng lực ${translateDomain(primary)}`,
            activities: activities.slice(0, 2),
            icon: "compass"
        },
        {
            month: 3,
            phase: "Xây dựng",
            title_vi: "Xây dựng kỹ năng nền tảng",
            description_vi: "Tập trung phát triển kỹ năng cốt lõi thông qua luyện tập có cấu trúc",
            activities: activities.slice(1, 3),
            icon: "hammer"
        },
        {
            month: 6,
            phase: "Ứng dụng",
            title_vi: "Ứng dụng thực tế",
            description_vi: "Tham gia hoạt động thực tế, kết nối với đối tác hỗ trợ",
            activities: ["Tham gia CLB/Trung tâm", "Dự án nhỏ thực tế"],
            icon: "rocket"
        }
    ];
}

// ============================================================================
// MAIN HOOK
// ============================================================================

const CORE_GAME_TYPES = [
    "detail_spotter",
    "stroop_chaos",
    "sonic_conservatory",
    "matrix_logic",
    "dispatcher_console"
];

function generateAIAnalysis(
    profile: CognitiveProfile,
    primaryStrength: string,
    strategy: TeachingStrategy,
    directions: DevelopmentDirection[],
    childName: string,
    isComprehensive: boolean
): string {
    const strengthName = translateDomain(primaryStrength);
    const topDirection = directions[0].name_vi;

    // Helper for profile summary
    const profileSummary = Object.entries(profile)
        .map(([key, value]) => `- ${translateDomain(key)}: ${value.toFixed(1)}/5`)
        .join("\n");

    const disclaimer = !isComprehensive
        ? "\n> *Lưu ý: Dữ liệu hiện tại chưa đầy đủ (dưới 3 bài kiểm tra cốt lõi). Kết quả phân tích chỉ mang tính chất tham khảo sơ bộ.*"
        : "";

    return `
### BÁO CÁO PHÂN TÍCH CHUYÊN SÂU ${!isComprehensive ? "(SƠ BỘ)" : ""}
**Học viên:** ${childName}
**Ngày báo cáo:** ${new Date().toLocaleDateString("vi-VN")}
${disclaimer}

---

#### 1. ĐIỂM MẠNH & CẤU TRÚC NHẬN THỨC
Dựa trên dữ liệu vi-mô từ các bài kiểm tra, ${childName} thể hiện ưu thế rõ rệt ở vùng năng lực **${strengthName}**.

**Chi tiết chỉ số:**
${profileSummary}

Điều này cho thấy não bộ của con có xu hướng xử lý thông tin hiệu quả nhất thông qua kênh **${strengthName}**. Khả năng tiếp nhận sẽ tăng cao khi thông tin được mã hóa dưới dạng ${primaryStrength === "visual" ? "hình ảnh, biểu đồ và màu sắc" : primaryStrength === "auditory" ? "âm thanh, lời nói và nhịp điệu" : "vận động, thao tác và thực hành"}.

---

#### 2. CHIẾN LƯỢC GIÁO DỤC ĐỀ XUẤT (${strategy.name_vi})
Để kích hoạt tối đa tiềm năng, gia đình nên áp dụng phương pháp **${strategy.method}**.
- **Công cụ:** Sử dụng các công cụ như **${strategy.tools.slice(0, 2).join(" và ")}** để hỗ trợ việc học.
- **Phương pháp tiếp cận:** ${strategy.tips[0]}

---

#### 3. LĨNH VỰC TIỀM NĂNG
Dựa trên sự kết hợp giữa điểm mạnh ${strengthName} và các chỉ số bổ trợ, lĩnh vực phù hợp nhất để phát triển hiện tại là: **${topDirection}**.
Đây là lĩnh vực mà con có thể duy trì sự tập trung cao (Hyper-focus) và phát huy tối đa năng lực tự nhiên.

*Báo cáo được tạo tự động bởi Hệ Thống Phân Tích Neuro-Logic (Dr. An AI).*
`;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useUnifiedResult() {
    const [searchParams] = useSearchParams();
    const { user, loading: authLoading } = useAuth();

    const sessionId = searchParams.get("session");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentGame, setCurrentGame] = useState<GameSession | null>(null);
    const [allSessions, setAllSessions] = useState<GameSession[]>([]);
    const [childName, setChildName] = useState("Con");

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            // Wait for auth to initialize
            if (authLoading) return;

            console.log("🔍 useUnifiedResult: Starting data fetch, user:", user?.id);

            if (!user) {
                console.log("❌ No user - setting loading false");
                setLoading(false);
                return;
            }

            try {
                // Fetch all game sessions
                const { data: sessions, error: sessionsError } = await supabase
                    .from("game_sessions")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("completed_at", { ascending: false });

                console.log("📊 Sessions fetched:", sessions?.length || 0, "items");

                if (sessionsError) {
                    console.error("❌ Sessions error:", sessionsError);
                    throw sessionsError;
                }

                if (sessions && sessions.length > 0) {
                    setAllSessions(sessions as GameSession[]);

                    // Find current session if sessionId provided
                    if (sessionId) {
                        const current = sessions.find(s => s.id === sessionId);
                        if (current) {
                            setCurrentGame(current as GameSession);
                        }
                    } else {
                        // Use most recent
                        setCurrentGame(sessions[0] as GameSession);
                    }
                } else {
                    console.log("⚠️ No sessions found for user");
                }

                // Try to get child name from profiles table instead
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("id", user.id)
                    .maybeSingle();

                if (profile?.full_name) {
                    setChildName(profile.full_name);
                }

            } catch (err) {
                console.error("Failed to fetch result data:", err);
                setError("Không thể tải dữ liệu kết quả");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, sessionId, authLoading]);

    // Calculate derived data
    const resultData = useMemo((): UnifiedResultData | null => {
        if (loading || allSessions.length === 0) return null;

        const profile = calculateProfileFromSessions(allSessions);
        const primaryStrength = getPrimaryStrength(profile);
        const strengths = getStrengths(profile);
        const strategy = generateStrategy(profile);
        const directions = suggestDirections(profile);
        const milestones = generateMilestones(primaryStrength, directions[0]);

        // Count unique game types completed
        const uniqueTypes = new Set(allSessions.map(s => s.game_type));

        // Determine isComprehensive
        // We consider it comprehensive if user has played at least 3 distinct CORE games
        const playedCoreGames = CORE_GAME_TYPES.filter(type => uniqueTypes.has(type));
        // Use 3 as threshold for now to be less strict during testing, or check against param
        const isComprehensive = playedCoreGames.length >= 3;

        // NEW: Always generate analysis if there is at least one game, but add a disclaimer if not comprehensive
        const aiAnalysis = generateAIAnalysis(
            profile,
            primaryStrength,
            strategy,
            directions,
            childName,
            isComprehensive
        );

        return {
            currentGame,
            profile,
            primaryStrength,
            strengths,
            strategy,
            directions,
            milestones,
            childName,
            completedGames: uniqueTypes.size,
            totalGames: 9,
            isComprehensive,
            aiAnalysis
        };
    }, [loading, allSessions, currentGame, childName]);

    return {
        loading,
        error,
        data: resultData,
        translateDomain
    };
}

export type { UnifiedResultData as ResultData };
