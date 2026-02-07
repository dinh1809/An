import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    BrainCircuit,
    Trophy,
    Play,
    ArrowRight,
    Grid3X3,
    Puzzle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GameLayout, GameHeader, GameFooter } from "@/components/game";

// ============================================================================
// TYPES
// ============================================================================
export interface MatrixUIProps {
    // Game State
    phase: "intro" | "playing" | "completed";
    currentRound: number;
    totalRounds: number;
    score: number;

    // Stats
    accuracy: number;

    // Handlers
    onStart: () => void;
    onBack: () => void;

    // Children (Matrix Grid + Options)
    children: ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================
export const MatrixUI = ({
    phase,
    currentRound,
    totalRounds,
    score,
    accuracy,
    onStart,
    onBack,
    children,
}: MatrixUIProps) => {
    return (
        <GameLayout className="bg-[#020617]">
            {/* Header - Show during gameplay */}
            {phase === "playing" && (
                <GameHeader
                    title="Ma Trận Logic"
                    subtitle={`Câu ${currentRound}/${totalRounds}`}
                    icon={<BrainCircuit className="w-5 h-5" />}
                    score={score}
                    accuracy={accuracy}
                    gradient="from-teal-500 to-cyan-500"
                    onBack={onBack}
                />
            )}

            {/* Progress Bar */}
            {phase === "playing" && (
                <Progress
                    value={(currentRound / totalRounds) * 100}
                    className="h-0.5 rounded-none bg-slate-900"
                />
            )}

            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-lg">
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
                                        className="w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/30"
                                    >
                                        <BrainCircuit className="w-12 h-12 text-white" />
                                    </motion.div>

                                    {/* Title */}
                                    <h2 className="text-3xl text-white font-bold mb-2">
                                        Ma Trận Logic
                                    </h2>
                                    <p className="text-teal-400 text-sm font-medium mb-6">
                                        Abstract Reasoning Index (ARI)
                                    </p>

                                    {/* Stats Preview */}
                                    <div className="grid grid-cols-3 gap-4 mb-8">
                                        <div className="bg-slate-800/50 rounded-xl p-3">
                                            <div className="text-2xl font-bold text-teal-400">{totalRounds}</div>
                                            <div className="text-xs text-slate-400">Câu hỏi</div>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-xl p-3">
                                            <div className="text-2xl font-bold text-cyan-400">3×3</div>
                                            <div className="text-xs text-slate-400">Ma trận</div>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-xl p-3">
                                            <div className="text-2xl font-bold text-emerald-400">6</div>
                                            <div className="text-xs text-slate-400">Lựa chọn</div>
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <div className="bg-slate-800/30 rounded-xl p-4 mb-8 text-left">
                                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                            <Puzzle className="w-4 h-4 text-teal-400" />
                                            Hướng dẫn
                                        </h3>
                                        <ul className="space-y-2 text-sm text-slate-300">
                                            <li className="flex items-start gap-2">
                                                <span className="text-teal-400">1.</span>
                                                Quan sát ma trận 3×3 với ô trống
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-teal-400">2.</span>
                                                Phân tích quy luật theo hàng/cột
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-teal-400">3.</span>
                                                Chọn mảnh ghép phù hợp nhất
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Start Button */}
                                    <Button
                                        onClick={onStart}
                                        size="lg"
                                        className="w-full h-14 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-lg font-semibold shadow-lg shadow-teal-500/30 transition-all hover:scale-[1.02]"
                                    >
                                        <Play className="w-5 h-5 mr-2" />
                                        Bắt Đầu Đánh Giá
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Card>
                            </motion.div>
                        )}

                        {/* ============================================ */}
                        {/* PLAYING SCREEN */}
                        {/* ============================================ */}
                        {phase === "playing" && (
                            <motion.div
                                key="playing"
                                className="space-y-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                {/* Instruction */}
                                <div className="text-center space-y-1">
                                    <h3 className="text-slate-300 text-sm font-medium">
                                        Chọn mảnh ghép còn thiếu
                                    </h3>
                                    <p className="text-slate-500 text-xs">
                                        Phân tích quy luật của các hình
                                    </p>
                                </div>

                                {/* Matrix + Options (Passed as Children) */}
                                <div className="space-y-6">
                                    {children}
                                </div>
                            </motion.div>
                        )}

                        {/* ============================================ */}
                        {/* COMPLETED SCREEN */}
                        {/* ============================================ */}
                        {phase === "completed" && (
                            <motion.div
                                key="completed"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <Card className="bg-slate-900/80 border-slate-700/50 p-8 backdrop-blur-xl">
                                    <Trophy className="w-16 h-16 text-teal-500 mx-auto mb-4" />
                                    <h2 className="text-2xl text-white font-bold mb-2">
                                        Hoàn Thành!
                                    </h2>
                                    <p className="text-slate-400 mb-4">
                                        Điểm số: {score}
                                    </p>
                                    <p className="text-teal-400 text-lg font-semibold">
                                        Độ chính xác: {accuracy}%
                                    </p>
                                </Card>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>

            <GameFooter />
        </GameLayout>
    );
};

export default MatrixUI;
