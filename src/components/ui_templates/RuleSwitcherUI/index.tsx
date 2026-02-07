import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Brain,
    Timer,
    Trophy,
    Play,
    Zap,
    Shuffle,
    ArrowRight,
    Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GameLayout, GameHeader, GameFooter } from "@/components/game";

// ============================================================================
// TYPES
// ============================================================================
export type RuleType = "text" | "color" | "shape";

export interface RuleSwitcherUIProps {
    // Game State
    phase: "intro" | "countdown" | "playing" | "completed";
    countdown: number;
    timeRemaining: number;
    totalTime: number;
    score: number;
    round: number;
    totalRounds: number;

    // Rule Info
    currentRule: RuleType;
    ruleLabel: string;

    // Stats
    streak: number;
    accuracy: number;

    // Handlers
    onStart: () => void;

    // Children (Card Display Area)
    children: ReactNode;

    // Feedback
    showFeedback?: boolean;
    isCorrect?: boolean;
}

// ============================================================================
// HELPER: Rule Badge Color
// ============================================================================
const getRuleBadgeStyles = (rule: RuleType) => {
    switch (rule) {
        case "text":
            return "from-blue-500 to-cyan-500 shadow-blue-500/30";
        case "color":
            return "from-pink-500 to-rose-500 shadow-pink-500/30";
        case "shape":
            return "from-amber-500 to-orange-500 shadow-amber-500/30";
    }
};

// ============================================================================
// COMPONENT
// ============================================================================
export const RuleSwitcherUI = ({
    phase,
    countdown,
    timeRemaining,
    totalTime,
    score,
    round,
    totalRounds,
    currentRule,
    ruleLabel,
    streak,
    accuracy,
    onStart,
    children,
    showFeedback,
    isCorrect,
}: RuleSwitcherUIProps) => {
    return (
        <GameLayout className="bg-gradient-to-br from-slate-950 via-pink-950/10 to-slate-950">
            {/* Header - Only show during gameplay */}
            {phase === "playing" && (
                <GameHeader
                    title="Hỗn Loạn Stroop"
                    subtitle={`Vòng ${round}/${totalRounds}`}
                    icon={<Brain className="w-5 h-5" />}
                    score={score}
                    accuracy={accuracy}
                    timer={timeRemaining}
                    gradient="from-pink-500 to-rose-500"
                />
            )}

            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-xl">
                    <AnimatePresence mode="wait">

                        {/* ============================================ */}
                        {/* INTRO SCREEN */}
                        {/* ============================================ */}
                        {phase === "intro" && (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <Card className="bg-slate-900/80 border-slate-700/50 p-8 sm:p-12 text-center backdrop-blur-xl shadow-2xl">
                                    {/* Icon */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.2 }}
                                        className="w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/30"
                                    >
                                        <Brain className="w-12 h-12 text-white" />
                                    </motion.div>

                                    {/* Title */}
                                    <h2 className="text-3xl text-white font-bold mb-2">
                                        Hỗn Loạn Stroop
                                    </h2>
                                    <p className="text-pink-400 text-sm font-medium mb-6">
                                        Cognitive Flexibility Index (CFI)
                                    </p>

                                    {/* Stats Preview */}
                                    <div className="grid grid-cols-3 gap-4 mb-8">
                                        <div className="bg-slate-800/50 rounded-xl p-3">
                                            <div className="text-2xl font-bold text-pink-400">60s</div>
                                            <div className="text-xs text-slate-400">Thời gian</div>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-xl p-3">
                                            <div className="text-2xl font-bold text-rose-400">3</div>
                                            <div className="text-xs text-slate-400">Quy tắc</div>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-xl p-3">
                                            <div className="text-2xl font-bold text-orange-400">🔥</div>
                                            <div className="text-xs text-slate-400">Streak</div>
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <div className="bg-slate-800/30 rounded-xl p-4 mb-8 text-left">
                                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                            <Shuffle className="w-4 h-4 text-pink-400" />
                                            Quy tắc thay đổi liên tục!
                                        </h3>
                                        <ul className="space-y-2 text-sm text-slate-300">
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-400 font-bold">CHỮ:</span>
                                                Chọn theo nội dung chữ viết
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-pink-400 font-bold">MÀU:</span>
                                                Chọn theo màu sắc của chữ
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-amber-400 font-bold">HÌNH:</span>
                                                Chọn theo hình dạng khung
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Start Button */}
                                    <Button
                                        onClick={onStart}
                                        size="lg"
                                        className="w-full h-14 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-lg font-semibold shadow-lg shadow-pink-500/30 transition-all hover:scale-[1.02]"
                                    >
                                        <Play className="w-5 h-5 mr-2" />
                                        Bắt Đầu Đánh Giá
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Card>
                            </motion.div>
                        )}

                        {/* ============================================ */}
                        {/* COUNTDOWN SCREEN */}
                        {/* ============================================ */}
                        {phase === "countdown" && (
                            <motion.div
                                key="countdown"
                                className="text-center"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.5 }}
                            >
                                <motion.div
                                    className="text-9xl font-bold text-pink-500"
                                    key={countdown}
                                    initial={{ scale: 1.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    {countdown}
                                </motion.div>
                                <p className="text-slate-400 mt-4 text-lg">Chuẩn bị...</p>
                            </motion.div>
                        )}

                        {/* ============================================ */}
                        {/* PLAYING SCREEN */}
                        {/* ============================================ */}
                        {phase === "playing" && (
                            <motion.div
                                key="playing"
                                className="space-y-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                {/* Current Rule Banner */}
                                <motion.div
                                    key={currentRule}
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className={cn(
                                        "text-center py-3 px-6 rounded-2xl bg-gradient-to-r shadow-lg mx-auto w-fit",
                                        getRuleBadgeStyles(currentRule)
                                    )}
                                >
                                    <span className="text-white font-bold text-lg">
                                        {ruleLabel}
                                    </span>
                                </motion.div>

                                {/* Stats Bar */}
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="gap-1 px-3 py-1 border-pink-500/50 text-pink-400">
                                        <Zap className="w-3 h-3" />
                                        Vòng {round}/{totalRounds}
                                    </Badge>

                                    <div className="flex items-center gap-2">
                                        <Timer className="w-4 h-4 text-slate-400" />
                                        <span className={cn(
                                            "font-mono text-lg font-bold",
                                            timeRemaining <= 10 && "text-red-500 animate-pulse"
                                        )}>
                                            {timeRemaining}s
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        {streak > 0 && (
                                            <Badge variant="secondary" className="gap-1 px-2 py-1 font-mono text-xs bg-orange-500/20 text-orange-400">
                                                <Flame className="w-3 h-3" />
                                                {streak}x
                                            </Badge>
                                        )}
                                        <Badge className="gap-1 bg-gradient-to-r from-pink-500 to-rose-500 px-3 py-1">
                                            <Trophy className="w-3 h-3" />
                                            CFI: {score}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Time Progress */}
                                <Progress
                                    value={(timeRemaining / totalTime) * 100}
                                    className="h-2"
                                />

                                {/* Game Area (Passed as Children) */}
                                <div className="relative">
                                    {children}
                                </div>

                                {/* Feedback Overlay */}
                                <AnimatePresence>
                                    {showFeedback && (
                                        <motion.div
                                            className={cn(
                                                "absolute inset-0 flex items-center justify-center pointer-events-none",
                                                isCorrect ? "text-emerald-500" : "text-red-500"
                                            )}
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <span className="text-6xl font-bold">
                                                {isCorrect ? "✓" : "✗"}
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>

            <GameFooter />
        </GameLayout>
    );
};

export default RuleSwitcherUI;
