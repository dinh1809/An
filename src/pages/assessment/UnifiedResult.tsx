/**
 * 🎯 UNIFIED RESULT PAGE
 * ======================
 * Trang kết quả thống nhất cho dự án An
 * 
 * Features:
 * - Vietnamese-first UI
 * - Toggle: Player View ↔ Parent View
 * - Tabs: Kết quả | Hồ sơ | Hướng đi | Cách dạy | Lộ trình
 * - Radar Chart (Recharts)
 * - Development Directions (Ethical - no job titles)
 * - Teaching Strategies
 * - Growth Plan Timeline
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
    Users,
    User,
    RotateCcw,
    Trophy,
    Zap,
    type LucideIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { useUnifiedResult, type CognitiveProfile, type DevelopmentDirection, type Milestone } from "@/hooks/useUnifiedResult";

// ============================================================================
// ICON MAP
// ============================================================================

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
    rocket: Rocket,
    "trending-up": TrendingUp,
    award: Award
};

// ============================================================================
// COMPONENTS
// ============================================================================

interface ScoreDisplayProps {
    score: number;
    label: string;
}

const ScoreDisplay = ({ score, label }: ScoreDisplayProps) => {
    return (
        <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="text-center"
        >
            <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                {/* Outer ring */}
                <svg className="absolute w-full h-full -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r="58"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-slate-200 dark:text-slate-700"
                    />
                    <motion.circle
                        cx="64"
                        cy="64"
                        r="58"
                        fill="none"
                        stroke="url(#scoreGradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(score / 100) * 364} 364`}
                        initial={{ strokeDasharray: "0 364" }}
                        animate={{ strokeDasharray: `${(score / 100) * 364} 364` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                    <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#14B8A6" />
                            <stop offset="100%" stopColor="#A855F7" />
                        </linearGradient>
                    </defs>
                </svg>
                {/* Score number */}
                <motion.span
                    className="text-4xl font-bold text-slate-800 dark:text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {Math.round(score)}
                </motion.span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        </motion.div>
    );
};

interface StrengthCardProps {
    domain: string;
    score: number;
    isStrength: boolean;
    translateFn: (d: string) => string;
}

const StrengthCard = ({ domain, score, isStrength, translateFn }: StrengthCardProps) => {
    const IconComponent = domain === "visual" ? Eye
        : domain === "auditory" ? Ear
            : domain === "movement" ? Move
                : Cpu;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
        >
            <Card className={cn(
                "relative overflow-hidden transition-all",
                isStrength && "ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-slate-900"
            )}>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            isStrength
                                ? "bg-gradient-to-br from-teal-400 to-purple-500"
                                : "bg-slate-100 dark:bg-slate-800"
                        )}>
                            <IconComponent className={cn(
                                "w-6 h-6",
                                isStrength ? "text-white" : "text-slate-500"
                            )} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {translateFn(domain)}
                            </p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                {score.toFixed(1)}
                                <span className="text-sm font-normal text-slate-400">/5</span>
                            </p>
                        </div>
                        {isStrength && (
                            <Badge className="bg-teal-500 text-white">
                                Điểm mạnh
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

interface DirectionCardProps {
    direction: DevelopmentDirection;
    index: number;
    isTop: boolean;
}

const DirectionCard = ({ direction, index, isTop }: DirectionCardProps) => {
    const DirectionIcon = ICON_MAP[direction.icon] || Target;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Card className={cn(
                "transition-all hover:shadow-lg",
                isTop && "ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-slate-900"
            )}>
                <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                            isTop
                                ? "bg-gradient-to-br from-teal-400 to-purple-500"
                                : "bg-slate-100 dark:bg-slate-800"
                        )}>
                            <DirectionIcon className={cn(
                                "w-6 h-6",
                                isTop ? "text-white" : "text-slate-500"
                            )} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-slate-800 dark:text-white">
                                    {direction.name_vi}
                                </h4>
                                <Badge variant="outline" className="text-teal-600 border-teal-500">
                                    {direction.match_score}%
                                </Badge>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                {direction.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {direction.activities.map((activity, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                        {activity}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

interface MilestoneCardProps {
    milestone: Milestone;
    index: number;
}

const MilestoneCard = ({ milestone, index }: MilestoneCardProps) => {
    const MilestoneIcon = ICON_MAP[milestone.icon] || Compass;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className="relative"
        >
            {/* Timeline line */}
            {index < 2 && (
                <div className="absolute left-6 top-16 w-0.5 h-16 bg-gradient-to-b from-teal-500 to-transparent" />
            )}

            <Card className="overflow-hidden">
                <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <MilestoneIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                    Tháng {milestone.month}
                                </Badge>
                                <span className="text-xs text-slate-400">{milestone.phase}</span>
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white mb-1">
                                {milestone.title_vi}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                {milestone.description_vi}
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {milestone.activities.map((activity, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                        {activity}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UnifiedResult = () => {
    const navigate = useNavigate();
    const { loading, error, data, translateDomain } = useUnifiedResult();

    const [viewMode, setViewMode] = useState<"player" | "parent">("player");
    const [activeTab, setActiveTab] = useState("result");

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                    <Brain className="w-16 h-16 text-teal-500" />
                </motion.div>
            </div>
        );
    }

    // Error state
    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
                <Card className="max-w-md text-center">
                    <CardContent className="p-8">
                        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                            <Zap className="w-8 h-8 text-amber-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                            Chưa có dữ liệu
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            Bạn cần hoàn thành ít nhất một bài đánh giá để xem kết quả.
                        </p>
                        <Button onClick={() => navigate("/assessment")} className="bg-teal-500 hover:bg-teal-600">
                            Bắt đầu đánh giá
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Radar chart data
    const radarData = [
        { domain: "Thị giác", value: data.profile.visual, fullMark: 5 },
        { domain: "Thính giác", value: data.profile.auditory, fullMark: 5 },
        { domain: "Vận động", value: data.profile.movement, fullMark: 5 },
        { domain: "Logic", value: data.profile.logic, fullMark: 5 }
    ];

    const StrategyIcon = ICON_MAP[data.strategy.icon] || Brain;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* ============ HEADER ============ */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg text-slate-800 dark:text-white">
                                    Kết quả Đánh giá
                                </h1>
                                <p className="text-sm text-slate-500">
                                    {data.childName} • {data.completedGames}/{data.totalGames} bài
                                </p>
                            </div>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant={viewMode === "player" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setViewMode("player")}
                                className={viewMode === "player" ? "bg-teal-500 hover:bg-teal-600" : ""}
                            >
                                <User className="w-4 h-4 mr-1" />
                                Người chơi
                            </Button>
                            <Button
                                variant={viewMode === "parent" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setViewMode("parent")}
                                className={viewMode === "parent" ? "bg-purple-500 hover:bg-purple-600" : ""}
                            >
                                <Users className="w-4 h-4 mr-1" />
                                Phụ huynh
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ============ MAIN CONTENT ============ */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Disclaimer */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 mb-6"
                >
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        ⚡ <strong>Lưu ý:</strong> Kết quả này là xu hướng tham khảo để xây dựng kế hoạch giáo dục,
                        không thay thế chẩn đoán y khoa. Vui lòng tham khảo ý kiến chuyên gia.
                    </p>
                </motion.div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className={cn(
                        "grid w-full mb-6",
                        (data.isComprehensive && viewMode === "parent") ? "grid-cols-5" : "grid-cols-2"
                    )}>
                        <TabsTrigger value="result" className="flex items-center gap-1">
                            <Trophy className="w-4 h-4" />
                            <span className="hidden sm:inline">Kết quả</span>
                        </TabsTrigger>
                        <TabsTrigger value="profile" className="flex items-center gap-1">
                            <Brain className="w-4 h-4" />
                            <span className="hidden sm:inline">Hồ sơ</span>
                        </TabsTrigger>

                        {(data.isComprehensive && viewMode === "parent") && (
                            <>
                                <TabsTrigger value="direction" className="flex items-center gap-1">
                                    <Target className="w-4 h-4" />
                                    <span className="hidden sm:inline">Hướng đi</span>
                                </TabsTrigger>
                                <TabsTrigger value="teaching" className="flex items-center gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    <span className="hidden sm:inline">Cách dạy</span>
                                </TabsTrigger>
                                <TabsTrigger value="plan" className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span className="hidden sm:inline">Lộ trình</span>
                                </TabsTrigger>
                            </>
                        )}
                    </TabsList>

                    {/* ============ TAB 1: RESULT ============ */}
                    <TabsContent value="result">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* AI ANALYSIS CARD (Parent + Comprehensive Only) */}
                            {(data.isComprehensive && viewMode === "parent" && data.aiAnalysis) && (
                                <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-slate-900 overflow-hidden">
                                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-3 flex items-center gap-3">
                                        <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                                        <h3 className="font-bold text-white text-lg">Phân Tích Chuyên Sâu Dr. An AI</h3>
                                    </div>
                                    <CardContent className="p-6">
                                        <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                                            {data.aiAnalysis}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {data.currentGame ? (
                                <Card>
                                    <CardContent className="p-8 text-center">
                                        <ScoreDisplay
                                            score={data.currentGame.final_score}
                                            label={`Điểm ${data.currentGame.game_type.replace(/_/g, " ")}`}
                                        />

                                        <div className="grid grid-cols-3 gap-4 mt-6">
                                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                                <p className="text-xs text-slate-500 mb-1">Độ chính xác</p>
                                                <p className="text-lg font-bold text-slate-800 dark:text-white">
                                                    {Math.round(data.currentGame.accuracy_percentage || 0)}%
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                                <p className="text-xs text-slate-500 mb-1">Thời gian phản xạ</p>
                                                <p className="text-lg font-bold text-slate-800 dark:text-white">
                                                    {Math.round(data.currentGame.avg_reaction_time_ms || 0)}ms
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                                <p className="text-xs text-slate-500 mb-1">Đã hoàn thành</p>
                                                <p className="text-lg font-bold text-slate-800 dark:text-white">
                                                    {data.completedGames}/{data.totalGames}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex justify-center gap-3 mt-6">
                                            <Button variant="outline" onClick={() => navigate("/assessment")}>
                                                <RotateCcw className="w-4 h-4 mr-2" />
                                                Tiếp tục đánh giá
                                            </Button>
                                            <Button className="bg-teal-500 hover:bg-teal-600">
                                                <Download className="w-4 h-4 mr-2" />
                                                Lưu kết quả
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="p-8 text-center">
                                        <p className="text-slate-500">Chưa có dữ liệu bài vừa chơi</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Quick Summary - Only show if NOT comprehensive parent view (since AI report covers it) */}
                            {(!data.isComprehensive || viewMode === "player") && (
                                <Card className="bg-gradient-to-r from-teal-50 to-purple-50 dark:from-teal-950/30 dark:to-purple-950/30 border-teal-200 dark:border-teal-800">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                                                <Lightbulb className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg mb-1 text-slate-800 dark:text-white">Tổng quan</h3>
                                                <p className="text-slate-600 dark:text-slate-300">
                                                    {data.childName} có xu hướng{" "}
                                                    <strong className="text-teal-600 dark:text-teal-400">
                                                        {translateDomain(data.primaryStrength)}
                                                    </strong>{" "}
                                                    nổi bật. Điều này cho thấy con sẽ tiếp thu tốt nhất khi được học theo phương pháp{" "}
                                                    <strong className="text-purple-600 dark:text-purple-400">
                                                        {data.strategy.name_vi}
                                                    </strong>.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </motion.div>
                    </TabsContent>

                    {/* ============ TAB 2: PROFILE ============ */}
                    <TabsContent value="profile">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Radar Chart */}
                            <Card>
                                <CardHeader className="text-center pb-2">
                                    <CardTitle className="text-xl">Biểu đồ Năng lực</CardTitle>
                                    <CardDescription>
                                        Xu hướng nhận thức và học tập của {data.childName}
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
                                {Object.entries(data.profile).map(([domain, score]) => (
                                    <StrengthCard
                                        key={domain}
                                        domain={domain}
                                        score={score}
                                        isStrength={data.strengths.includes(domain)}
                                        translateFn={translateDomain}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </TabsContent>

                    {/* ============ TAB 3: DIRECTION (Comprehensive + Parent Only) ============ */}
                    {(data.isComprehensive && viewMode === "parent") && (
                        <TabsContent value="direction">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <Target className="w-5 h-5 text-teal-500" />
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                                        Hướng phát triển phù hợp
                                    </h3>
                                </div>

                                {data.directions.map((direction, idx) => (
                                    <DirectionCard
                                        key={direction.id}
                                        direction={direction}
                                        index={idx}
                                        isTop={idx === 0}
                                    />
                                ))}
                            </motion.div>
                        </TabsContent>
                    )}

                    {/* ============ TAB 4: TEACHING (Comprehensive + Parent Only) ============ */}
                    {(data.isComprehensive && viewMode === "parent") && (
                        <TabsContent value="teaching">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Hero Teaching Card */}
                                <Card className="overflow-hidden border-2 border-teal-200 dark:border-teal-800">
                                    <div className="bg-gradient-to-r from-teal-500 to-purple-500 p-6 text-white">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                                                <StrategyIcon className="w-8 h-8 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-teal-100 text-sm">
                                                    Cách dạy phù hợp nhất cho {data.childName}
                                                </p>
                                                <h2 className="text-2xl font-bold">{data.strategy.name_vi}</h2>
                                                <p className="text-teal-100">{data.strategy.method}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-6 space-y-6">
                                        {/* Tools */}
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                                <Hammer className="w-4 h-4 text-teal-500" />
                                                Công cụ nên dùng
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {data.strategy.tools.map((tool, i) => (
                                                    <Badge key={i} variant="secondary" className="px-3 py-1">
                                                        {tool}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Tips */}
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                                <Lightbulb className="w-4 h-4 text-amber-500" />
                                                Mẹo thực hành
                                            </h3>
                                            <ul className="space-y-3">
                                                {data.strategy.tips.map((tip, i) => (
                                                    <li key={i} className="flex items-start gap-3">
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                        <span className="text-slate-600 dark:text-slate-300">{tip}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </TabsContent>
                    )}

                    {/* ============ TAB 5: PLAN (Comprehensive + Parent Only) ============ */}
                    {(data.isComprehensive && viewMode === "parent") && (
                        <TabsContent value="plan">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar className="w-5 h-5 text-teal-500" />
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                                        Lộ trình phát triển 6 tháng
                                    </h3>
                                </div>

                                {data.milestones.map((milestone, idx) => (
                                    <MilestoneCard
                                        key={milestone.month}
                                        milestone={milestone}
                                        index={idx}
                                    />
                                ))}

                                {/* CTA */}
                                <Card className="mt-6 bg-gradient-to-r from-teal-500 to-purple-500">
                                    <CardContent className="p-6 text-center text-white">
                                        <h3 className="font-bold text-xl mb-2">Sẵn sàng bắt đầu?</h3>
                                        <p className="text-teal-100 mb-4">
                                            Lưu lộ trình và nhận hướng dẫn chi tiết qua email
                                        </p>
                                        <div className="flex justify-center gap-3">
                                            <Button variant="secondary" className="bg-white text-teal-600 hover:bg-teal-50">
                                                <Download className="w-4 h-4 mr-2" />
                                                Lưu PDF
                                            </Button>
                                            <Button variant="secondary" className="bg-white text-purple-600 hover:bg-purple-50">
                                                <Share2 className="w-4 h-4 mr-2" />
                                                Chia sẻ
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </TabsContent>
                    )}
                </Tabs>
            </div>

            {/* ============ FOOTER ============ */}
            <footer className="py-8 text-center">
                <p className="text-xs text-slate-400 font-mono">
                    AN PLATFORM • PHIÊN BẢN 4.0 • BẢO MẬT AES-256
                </p>
            </footer>
        </div>
    );
};

export default UnifiedResult;
