import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Eye,
    Timer,
    Trophy,
    Play,
    Sparkles,
    ScanEye,
    ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GameLayout, GameHeader, GameFooter } from "@/components/game";

// ============================================================================
// TYPES
// ============================================================================
export interface DetailSpotterUIProps {
    // Game State
    phase: "intro" | "countdown" | "playing";
    countdown: number;
    timeRemaining: number;
    totalTime: number;
    score: number;
    level: number;

    // Stats
    accuracy: number;
    lastReactionTime: number;

    // Tier Info
    tierLabel: string;
    tierEmoji: string;
    tierColor: string;
    gridSize: number;

    // Handlers
    onStart: () => void;

    // Children (Game Grid)
    children: ReactNode;

    // Score Feedback
    showScoreFeedback?: boolean;
    lastScoreGain?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================
export const DetailSpotterUI = ({
    phase,
    countdown,
    timeRemaining,
    totalTime,
    score,
    level,
    accuracy,
    lastReactionTime,
    tierLabel,
    tierEmoji,
    tierColor,
    gridSize,
    onStart,
    children,
    showScoreFeedback,
    lastScoreGain,
}: DetailSpotterUIProps) => {
    return (
        <GameLayout className="bg-gradient-to-br from-slate-950 via-violet-950/20 to-slate-950">
            {/* Header - Only show during gameplay */}
            {phase === "playing" && (
                <GameHeader
                    title="Thợ Săn Chi Tiết"
                    subtitle={`Level ${level}`}
                    icon={<ScanEye className="w-5 h-5" />}
                    score={score}
                    accuracy={accuracy}
                    timer={timeRemaining}
                    gradient="from-violet-500 to-indigo-500"
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
                                        className="w-24 h-24 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/30"
                                    >
                                        <ScanEye className="w-12 h-12 text-white" />
                                    </motion.div>

                                    {/* Title */}
                                    <h2 className="text-3xl text-white font-bold mb-2">
                                        Thợ Săn Chi Tiết
                                    </h2>
                                    <p className="text-violet-400 text-sm font-medium mb-6">
                                        Visual Processing Index (VPI)
                                    </p>

                                    {/* Stats Preview */}
                                    <div className="grid grid-cols-3 gap-4 mb-8">
                                        <div className="bg-slate-800/50 rounded-xl p-3">
                                            <div className="text-2xl font-bold text-violet-400">60s</div>
                                            <div className="text-xs text-slate-400">Thời gian</div>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-xl p-3">
                                            <div className="text-2xl font-bold text-indigo-400">12</div>
                                            <div className="text-xs text-slate-400">Cấp độ</div>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-xl p-3">
                                            <div className="text-2xl font-bold text-purple-400">∞</div>
                                            <div className="text-xs text-slate-400">Điểm tối đa</div>
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <div className="bg-slate-800/30 rounded-xl p-4 mb-8 text-left">
                                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                            <Eye className="w-4 h-4 text-violet-400" />
                                            Hướng dẫn
                                        </h3>
                                        <ul className="space-y-2 text-sm text-slate-300">
                                            <li className="flex items-start gap-2">
                                                <span className="text-violet-400">•</span>
                                                Tìm hình ảnh khác biệt trong lưới
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-violet-400">•</span>
                                                Level 1-3: Tìm góc xoay khác
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-violet-400">•</span>
                                                Level 4-7: Tìm hình bị lật ngược
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-violet-400">•</span>
                                                Level 8+: Tìm tổ hợp màu-hình duy nhất
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Start Button */}
                                    <Button
                                        onClick={onStart}
                                        size="lg"
                                        className="w-full h-14 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white text-lg font-semibold shadow-lg shadow-violet-500/30 transition-all hover:scale-[1.02]"
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
                                    className="text-9xl font-bold text-violet-500"
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
                                {/* Stats Bar */}
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="gap-1 px-3 py-1 border-violet-500/50 text-violet-400">
                                        <Sparkles className="w-3 h-3" />
                                        Level {level}
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
                                        <Badge variant="secondary" className="gap-1 px-2 py-1 font-mono text-xs bg-slate-800">
                                            ⚡ {Math.round(lastReactionTime)}ms
                                        </Badge>
                                        <Badge className="gap-1 bg-gradient-to-r from-violet-500 to-indigo-500 px-3 py-1">
                                            <Trophy className="w-3 h-3" />
                                            VPI: {score}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Time Progress */}
                                <Progress
                                    value={(timeRemaining / totalTime) * 100}
                                    className="h-2"
                                />

                                {/* Difficulty Indicator */}
                                <div className="text-center">
                                    <span className={cn("text-sm font-medium", tierColor)}>
                                        {tierEmoji} {tierLabel}
                                    </span>
                                    <div className="text-xs text-slate-500 mt-1">
                                        Lưới {gridSize}×{gridSize}
                                    </div>
                                </div>

                                {/* Game Grid (Passed as Children) */}
                                <div className="relative">
                                    {children}
                                </div>

                                {/* Score Feedback */}
                                <AnimatePresence>
                                    {showScoreFeedback && lastScoreGain && (
                                        <motion.div
                                            className="text-center"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <span className="text-emerald-500 font-bold">
                                                +{lastScoreGain} điểm +1s
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

export default DetailSpotterUI;
