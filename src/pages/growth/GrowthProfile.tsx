/**
 * 🌟 GROWTH PROFILE DASHBOARD
 * ============================
 * The 3-Layer Result Dashboard:
 * 
 * Layer 1: Strength Radar Chart (Visual, Auditory, Logic, Movement)
 * Layer 2: Teaching Strategy Cards ("How to teach this child")
 * Layer 3: Broad Direction + 6-Month Growth Plan + Partner Suggestions
 * 
 * Ethical: Vietnamese language, no medical terms, supportive framing
 */

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Tooltip as RechartsTooltip
} from "recharts";
import {
    Brain,
    Eye,
    Ear,
    Move,
    Cpu,
    Lightbulb,
    BookOpen,
    Target,
    Calendar,
    MapPin,
    Users,
    Sparkles,
    Download,
    Share2,
    ChevronRight,
    CheckCircle2,
    Compass,
    Hammer,
    Rocket,
    TrendingUp,
    Award,
    Layers,
    Settings,
    Palette,
    Search,
    Leaf,
    type LucideIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface CognitiveProfile {
    visual: number;
    auditory: number;
    movement: number;
    logic: number;
}

interface TeachingStrategy {
    key: string;
    name_vi: string;
    method: string;
    tools: string[];
    tips: string[];
    icon: string;
}

interface BroadDirection {
    id: string;
    name_vi: string;
    description: string;
    activities: string[];
    match_score: number;
    icon: string;
}

interface Milestone {
    month: number;
    phase: string;
    title_vi: string;
    description_vi: string;
    activities: string[];
    icon: string;
}

interface Partner {
    id: string;
    name: string;
    type: string;
    focus_area: string;
    support_level: string;
    description_vi: string;
    city: string;
}

interface AssessmentData {
    id: string;
    child_name: string;
    profile_visual: number;
    profile_auditory: number;
    profile_movement: number;
    profile_logic: number;
    pattern_accuracy: number;
    reaction_avg_time_ms: number;
    attention_consistency: number;
    visual_preference_score: number;
    auditory_preference_score: number;
    created_at: string;
}

// ============================================================================
// CONSTANTS (From Python Engine - Replicated for Frontend)
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

const DIRECTION_CLUSTERS: Record<string, Omit<BroadDirection, "match_score">> = {
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

const ICON_MAP: Record<string, LucideIcon> = {
    eye: Eye,
    "volume-2": Ear,
    move: Move,
    cpu: Cpu,
    layers: Layers,
    settings: Settings,
    palette: Palette,
    search: Search,
    hammer: Hammer,
    leaf: Leaf,
    compass: Compass,
    tool: Hammer,
    rocket: Rocket,
    "trending-up": TrendingUp,
    award: Award
};

// ============================================================================
// CALCULATION FUNCTIONS (Frontend version of Python Engine)
// ============================================================================

function calculateProfile(data: AssessmentData): CognitiveProfile {
    // Normalize raw metrics to 1-5 scale
    const normalizeToFive = (value: number, min: number, max: number): number => {
        const clamped = Math.max(min, Math.min(max, value));
        return 1 + ((clamped - min) / (max - min)) * 4;
    };

    // Visual: Pattern accuracy + Visual preference
    const visualFromPattern = normalizeToFive(data.pattern_accuracy || 50, 30, 95);
    const visualFromPref = normalizeToFive(data.visual_preference_score || 50, 20, 80);
    const visual = visualFromPattern * 0.6 + visualFromPref * 0.4;

    // Auditory: Auditory preference + Attention consistency
    const auditoryFromPref = normalizeToFive(data.auditory_preference_score || 50, 20, 80);
    const auditoryFromAttention = normalizeToFive(data.attention_consistency || 50, 30, 90);
    const auditory = auditoryFromPref * 0.6 + auditoryFromAttention * 0.4;

    // Movement: Inverse of reaction time (faster = higher)
    const reactionScore = normalizeToFive(1000 - (data.reaction_avg_time_ms || 500), 200, 700);
    const movement = reactionScore;

    // Logic: Pattern accuracy + attention
    const logic = normalizeToFive(data.pattern_accuracy || 50, 40, 98);

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

function getStrengths(profile: CognitiveProfile, threshold = 4.0): string[] {
    return Object.entries(profile)
        .filter(([, score]) => score >= threshold)
        .map(([domain]) => domain);
}

function generateStrategy(profile: CognitiveProfile): TeachingStrategy {
    const strengths = getStrengths(profile);
    const primary = getPrimaryStrength(profile);

    if (strengths.length === 0) {
        return TEACHING_STRATEGIES.balanced;
    }

    const strategyMap: Record<string, string> = {
        visual: "high_visual",
        auditory: "high_auditory",
        movement: "high_movement",
        logic: "high_logic"
    };

    return TEACHING_STRATEGIES[strategyMap[primary]] || TEACHING_STRATEGIES.balanced;
}

function suggestDirections(profile: CognitiveProfile): BroadDirection[] {
    const requiredTraits: Record<string, Record<string, number>> = {
        technical_system: { logic: 4, visual: 3 },
        visual_creative: { visual: 4, movement: 2 },
        research_analysis: { logic: 4, visual: 4 },
        craft_hands_on: { movement: 4, visual: 3 },
        nature_environment: { movement: 4, auditory: 2 }
    };

    const directions: BroadDirection[] = [];

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

function generateMilestones(primary: string, direction: BroadDirection | null): Milestone[] {
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
            icon: "tool"
        },
        {
            month: 5,
            phase: "Ứng dụng",
            title_vi: "Ứng dụng trong thực tế",
            description_vi: "Tham gia hoạt động thực tế, kết nối với đối tác hỗ trợ",
            activities: ["Tham gia CLB/Trung tâm", "Dự án nhỏ thực tế"],
            icon: "rocket"
        }
    ];
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const GrowthProfile = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const assessmentId = searchParams.get("assessment");

    const [loading, setLoading] = useState(true);
    const [assessment, setAssessment] = useState<AssessmentData | null>(null);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [activeTab, setActiveTab] = useState("strengths");

    // Fetch assessment data
    useEffect(() => {
        const fetchData = async () => {
            if (!assessmentId) {
                toast.error("Không tìm thấy kết quả đánh giá");
                navigate("/growth/assessment");
                return;
            }

            try {
                // Fetch assessment
                const { data: assessmentData, error: assessmentError } = await supabase
                    .from("cognitive_assessments")
                    .select("*")
                    .eq("id", assessmentId)
                    .single();

                if (assessmentError) throw assessmentError;
                setAssessment(assessmentData as AssessmentData);

                // Fetch partners
                const { data: partnersData } = await supabase
                    .from("partners")
                    .select("*")
                    .eq("is_active", true)
                    .limit(5);

                if (partnersData) {
                    setPartners(partnersData as Partner[]);
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
                toast.error("Không thể tải kết quả");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [assessmentId, navigate]);

    // Calculate profile and derived data
    const profileData = useMemo(() => {
        if (!assessment) return null;

        const profile = calculateProfile(assessment);
        const strategy = generateStrategy(profile);
        const directions = suggestDirections(profile);
        const milestones = generateMilestones(getPrimaryStrength(profile), directions[0]);
        const strengths = getStrengths(profile);

        return { profile, strategy, directions, milestones, strengths };
    }, [assessment]);

    // Radar chart data
    const radarData = useMemo(() => {
        if (!profileData) return [];
        return [
            { domain: "Thị giác", value: profileData.profile.visual, fullMark: 5 },
            { domain: "Thính giác", value: profileData.profile.auditory, fullMark: 5 },
            { domain: "Vận động", value: profileData.profile.movement, fullMark: 5 },
            { domain: "Logic", value: profileData.profile.logic, fullMark: 5 }
        ];
    }, [profileData]);

    // Save growth plan to DB
    const saveGrowthPlan = async () => {
        if (!user || !assessment || !profileData) return;

        try {
            const { error } = await supabase.from("growth_plans").insert({
                user_id: user.id,
                assessment_id: assessment.id,
                child_name: assessment.child_name,
                plan_duration_months: 6,
                profile: profileData.profile,
                strategy: profileData.strategy,
                directions: profileData.directions,
                milestones: profileData.milestones,
                status: "active"
            });

            if (error) throw error;
            toast.success("Đã lưu Kế hoạch Phát triển!");
        } catch (err) {
            console.error("Failed to save plan:", err);
            toast.error("Không thể lưu kế hoạch");
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                    <Brain className="w-16 h-16 text-primary-500" />
                </motion.div>
            </div>
        );
    }

    if (!assessment || !profileData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="p-6 text-center">
                    <p>Không tìm thấy dữ liệu đánh giá</p>
                    <Button onClick={() => navigate("/growth/assessment")} className="mt-4">
                        Làm bài đánh giá mới
                    </Button>
                </Card>
            </div>
        );
    }

    const StrategyIcon = ICON_MAP[profileData.strategy.icon] || Brain;

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg">Hồ sơ Phát triển</h1>
                                <p className="text-sm text-gray-500">
                                    {assessment.child_name || "Con"}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={saveGrowthPlan}>
                                <Download className="w-4 h-4 mr-1" />
                                Lưu
                            </Button>
                            <Button variant="outline" size="sm">
                                <Share2 className="w-4 h-4 mr-1" />
                                Chia sẻ
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Disclaimer Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
                >
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        ⚡ <strong>Lưu ý:</strong> Kết quả này là xu hướng tham khảo để xây dựng kế hoạch giáo dục,
                        không thay thế chẩn đoán y khoa. Vui lòng tham khảo ý kiến chuyên gia.
                    </p>
                </motion.div>

                {/* Tab Navigation */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3 w-full mb-6">
                        <TabsTrigger value="strengths" className="flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            <span className="hidden sm:inline">Điểm mạnh</span>
                        </TabsTrigger>
                        <TabsTrigger value="teaching" className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            <span className="hidden sm:inline">Cách dạy</span>
                        </TabsTrigger>
                        <TabsTrigger value="plan" className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            <span className="hidden sm:inline">Lộ trình</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* ============= LAYER 1: STRENGTHS ============= */}
                    <TabsContent value="strengths">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Radar Chart */}
                            <Card className="overflow-hidden">
                                <CardHeader className="text-center pb-2">
                                    <CardTitle className="text-xl">Biểu đồ Năng lực</CardTitle>
                                    <CardDescription>
                                        Xu hướng nhận thức và học tập của {assessment.child_name || "con"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-72 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                                                <PolarGrid strokeDasharray="3 3" />
                                                <PolarAngleAxis
                                                    dataKey="domain"
                                                    tick={{ fill: "#64748b", fontSize: 12 }}
                                                />
                                                <PolarRadiusAxis
                                                    angle={30}
                                                    domain={[0, 5]}
                                                    tick={{ fontSize: 10 }}
                                                />
                                                <Radar
                                                    name="Năng lực"
                                                    dataKey="value"
                                                    stroke="#14B8A6"
                                                    fill="#14B8A6"
                                                    fillOpacity={0.5}
                                                    strokeWidth={2}
                                                />
                                                <RechartsTooltip
                                                    formatter={(value: number) => [`${value.toFixed(1)}/5`, "Điểm"]}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Strength Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(profileData.profile).map(([domain, score]) => {
                                    const isStrength = score >= 4;
                                    const IconComponent = domain === "visual" ? Eye
                                        : domain === "auditory" ? Ear
                                            : domain === "movement" ? Move
                                                : Cpu;

                                    return (
                                        <motion.div
                                            key={domain}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <Card
                                                className={cn(
                                                    "relative overflow-hidden transition-all",
                                                    isStrength && "ring-2 ring-primary-500 ring-offset-2"
                                                )}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={cn(
                                                                "w-12 h-12 rounded-xl flex items-center justify-center",
                                                                isStrength
                                                                    ? "bg-gradient-to-br from-primary-400 to-secondary-500"
                                                                    : "bg-gray-100 dark:bg-gray-800"
                                                            )}
                                                        >
                                                            <IconComponent
                                                                className={cn(
                                                                    "w-6 h-6",
                                                                    isStrength ? "text-white" : "text-gray-500"
                                                                )}
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm text-gray-500">
                                                                {translateDomain(domain)}
                                                            </p>
                                                            <p className="text-2xl font-bold">
                                                                {score.toFixed(1)}
                                                                <span className="text-sm font-normal text-gray-400">/5</span>
                                                            </p>
                                                        </div>
                                                        {isStrength && (
                                                            <Badge className="bg-primary-500">
                                                                Điểm mạnh
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Quick Summary */}
                            <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-950/30 dark:to-secondary-950/30 border-primary-200">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                                            <Lightbulb className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">Tổng quan</h3>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                {assessment.child_name || "Con"} có xu hướng{" "}
                                                <strong className="text-primary-600">
                                                    {translateDomain(getPrimaryStrength(profileData.profile))}
                                                </strong>{" "}
                                                nổi bật. Điều này cho thấy con sẽ tiếp thu tốt nhất
                                                khi được học theo phương pháp{" "}
                                                <strong className="text-secondary-600">
                                                    {profileData.strategy.name_vi}
                                                </strong>.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>

                    {/* ============= LAYER 2: TEACHING STRATEGY ============= */}
                    <TabsContent value="teaching">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Hero Teaching Card */}
                            <Card className="overflow-hidden border-2 border-primary-200 dark:border-primary-800">
                                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                                            <StrategyIcon className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-primary-100 text-sm">Cách dạy phù hợp nhất cho {assessment.child_name || "con"}</p>
                                            <h2 className="text-2xl font-bold">{profileData.strategy.name_vi}</h2>
                                            <p className="text-primary-100">{profileData.strategy.method}</p>
                                        </div>
                                    </div>
                                </div>
                                <CardContent className="p-6 space-y-6">
                                    {/* Tools */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <Hammer className="w-4 h-4 text-primary-500" />
                                            Công cụ nên dùng
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {profileData.strategy.tools.map((tool, i) => (
                                                <Badge key={i} variant="secondary" className="px-3 py-1">
                                                    {tool}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tips */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <Lightbulb className="w-4 h-4 text-amber-500" />
                                            Mẹo thực hành
                                        </h3>
                                        <ul className="space-y-3">
                                            {profileData.strategy.tips.map((tip, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                    <span className="text-gray-600 dark:text-gray-300">{tip}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Broad Directions */}
                            <div>
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-primary-500" />
                                    Hướng phát triển phù hợp
                                </h3>
                                <div className="space-y-3">
                                    {profileData.directions.map((direction, idx) => {
                                        const DirectionIcon = ICON_MAP[direction.icon] || Target;
                                        return (
                                            <motion.div
                                                key={direction.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                            >
                                                <Card className={cn(
                                                    "transition-all hover:shadow-lg",
                                                    idx === 0 && "ring-2 ring-primary-500 ring-offset-2"
                                                )}>
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start gap-4">
                                                            <div className={cn(
                                                                "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                                                                idx === 0
                                                                    ? "bg-gradient-to-br from-primary-400 to-secondary-500"
                                                                    : "bg-gray-100 dark:bg-gray-800"
                                                            )}>
                                                                <DirectionIcon className={cn(
                                                                    "w-6 h-6",
                                                                    idx === 0 ? "text-white" : "text-gray-500"
                                                                )} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="font-semibold">{direction.name_vi}</h4>
                                                                    <Badge variant={idx === 0 ? "default" : "outline"} className="text-xs">
                                                                        {direction.match_score}% phù hợp
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                                    {direction.description}
                                                                </p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {direction.activities.slice(0, 3).map((activity, i) => (
                                                                        <Badge key={i} variant="secondary" className="text-xs">
                                                                            {activity}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </TabsContent>

                    {/* ============= LAYER 3: GROWTH PLAN ============= */}
                    <TabsContent value="plan">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Timeline */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-primary-500" />
                                        Lộ trình 6 tháng
                                    </CardTitle>
                                    <CardDescription>
                                        Kế hoạch phát triển phù hợp cho {assessment.child_name || "con"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative">
                                        {/* Timeline line */}
                                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

                                        <div className="space-y-8">
                                            {profileData.milestones.map((milestone, idx) => {
                                                const MilestoneIcon = ICON_MAP[milestone.icon] || Target;
                                                return (
                                                    <motion.div
                                                        key={milestone.month}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.15 }}
                                                        className="relative flex gap-4"
                                                    >
                                                        <div className={cn(
                                                            "relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                                                            idx === 0
                                                                ? "bg-gradient-to-br from-primary-400 to-secondary-500"
                                                                : "bg-white dark:bg-gray-800 border-2 border-primary-300"
                                                        )}>
                                                            <MilestoneIcon className={cn(
                                                                "w-5 h-5",
                                                                idx === 0 ? "text-white" : "text-primary-500"
                                                            )} />
                                                        </div>
                                                        <div className="flex-1 pb-2">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Badge variant="outline" className="text-xs">
                                                                    Tháng {milestone.month}-{milestone.month + 1}
                                                                </Badge>
                                                                <span className="text-sm font-medium text-primary-600">
                                                                    {milestone.phase}
                                                                </span>
                                                            </div>
                                                            <h4 className="font-semibold text-lg mb-1">
                                                                {milestone.title_vi}
                                                            </h4>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                                {milestone.description_vi}
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {milestone.activities.map((activity, i) => (
                                                                    <Badge key={i} className="bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                                                                        {activity}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Partner Suggestions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-secondary-500" />
                                        Đối tác Hỗ trợ Gợi ý
                                    </CardTitle>
                                    <CardDescription>
                                        Các trung tâm và CLB phù hợp với xu hướng của con
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {partners.length > 0 ? (
                                        <div className="space-y-3">
                                            {partners.map((partner) => (
                                                <div
                                                    key={partner.id}
                                                    className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-secondary-100 dark:bg-secondary-900 flex items-center justify-center flex-shrink-0">
                                                        <MapPin className="w-5 h-5 text-secondary-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-medium">{partner.name}</h4>
                                                            <Badge variant="outline" className="text-xs capitalize">
                                                                {partner.type}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                            {partner.description_vi}
                                                        </p>
                                                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {partner.city}
                                                            </span>
                                                            <Badge className="text-xs" variant="secondary">
                                                                {partner.focus_area}
                                                            </Badge>
                                                            <Badge className="text-xs bg-emerald-100 text-emerald-700">
                                                                Hỗ trợ cấp {partner.support_level}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>Chưa có đối tác nào trong khu vực của bạn</p>
                                            <p className="text-sm mt-1">Hệ thống đang được cập nhật liên tục</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* CTA */}
                            <Card className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white border-0">
                                <CardContent className="p-6 text-center">
                                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-90" />
                                    <h3 className="text-xl font-bold mb-2">Lưu Kế hoạch Phát triển</h3>
                                    <p className="text-primary-100 mb-4">
                                        Lưu lại để theo dõi tiến trình và chia sẻ với chuyên gia
                                    </p>
                                    <div className="flex justify-center gap-3">
                                        <Button
                                            onClick={saveGrowthPlan}
                                            className="bg-white text-primary-600 hover:bg-primary-50"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Lưu Kế hoạch
                                        </Button>
                                        <Button variant="outline" className="border-white text-white hover:bg-white/20">
                                            <Share2 className="w-4 h-4 mr-2" />
                                            Chia sẻ
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default GrowthProfile;
