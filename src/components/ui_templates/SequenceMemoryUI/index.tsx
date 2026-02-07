import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Music,
    Volume2,
    Trophy,
    Play,
    ArrowRight,
    CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GameLayout, GameHeader, GameFooter } from "@/components/game";

// ============================================================================
// TYPES
// ============================================================================
export type SequencePhase = "intro" | "listen" | "play" | "feedback" | "completed";

export interface SequenceMemoryUIProps {
    // Game State
    phase: SequencePhase;
    round: number;
    maxRounds: number;

    // Stats
    correctNotes: number;
    totalNotes: number;
    accuracy: number;

    // UI State
    currentPlayingNote?: number; // Index of note being played/highlighted
    isListening: boolean;

    // Handlers
    onStart: () => void;

    // Children (Piano Keys Area)
    children: ReactNode;

    // Progress indicators
    progressMarkers?: boolean[]; // true = correct, false = wrong for each note
}

// ============================================================================
// COMPONENT
// ============================================================================
export const SequenceMemoryUI = ({
    phase,
    round,
    maxRounds,
    correctNotes,
    totalNotes,
    accuracy,
    isListening,
    onStart,
    children,
    progressMarkers = [],
}: SequenceMemoryUIProps) => {
    return (
        <GameLayout className="bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950">
            {/* Header - show during gameplay */}
            {phase !== "intro" && phase !== "completed" && (
                <GameHeader
                    title="Nhà Soạn Nhạc"
                    subtitle={`Vòng ${round}/${maxRounds}`}
                    icon={<Music className="w-5 h-5" />}
                    accuracy={accuracy}
                    gradient="from-indigo-500 to-purple-500"
                />
            )}

            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-5xl">
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
                                className="max-w-2xl mx-auto"
                            >
                                <Card className="bg-slate-900/80 border-slate-700/50 p-8 sm:p-12 text-center backdrop-blur-xl shadow-2xl">
                                    {/* Icon */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.2 }}
                                        className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30"
                                    >
                                        <Music className="w-12 h-12 text-white" />
                                    </motion.div>

                                    {/* Title */}
                                    <h2 className="text-3xl text-white font-bold mb-2">
                                        Nhà Soạn Nhạc
                                    </h2>
                                    <p className="text-indigo-400 text-sm font-medium mb-6">
                                        Working Memory Capacity (WMC)
                                    </p>

                                    {/* Stats Preview */}
                                    <div className="grid grid-cols-3 gap-4 mb-8">
                                        <div className="bg-slate-800/50 rounded-xl p-3">
                                            <div className="text-2xl font-bold text-indigo-400">{maxRounds}</div>
                                            <div className="text-xs text-slate-400">Vòng</div>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-xl p-3">
                                            <div className="text-2xl font-bold text-purple-400">2</div>
                                            <div className="text-xs text-slate-400">Quãng 8</div>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-xl p-3">
                                            <div className="text-2xl font-bold text-pink-400">🎹</div>
                                            <div className="text-xs text-slate-400">Piano</div>
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <div className="bg-slate-800/30 rounded-xl p-4 mb-8 text-left">
                                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                            <Volume2 className="w-4 h-4 text-indigo-400" />
                                            Hướng dẫn
                                        </h3>
                                        <ul className="space-y-2 text-sm text-slate-300">
                                            <li className="flex items-start gap-2">
                                                <span className="text-indigo-400">1.</span>
                                                Lắng nghe giai điệu được phát
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-indigo-400">2.</span>
                                                Chơi lại đúng thứ tự các nốt
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-indigo-400">3.</span>
                                                Chuỗi dài hơn mỗi vòng
                                            </li>
                                        </ul>
                                        <p className="text-teal-400 text-xs mt-3">
                                            * Có thể sai. Tiếp tục chơi cho đến khi hoàn thành cả chuỗi.
                                        </p>
                                    </div>

                                    {/* Start Button */}
                                    <Button
                                        onClick={onStart}
                                        size="lg"
                                        className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-lg font-semibold shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02]"
                                    >
                                        <Play className="w-5 h-5 mr-2" />
                                        Bắt Đầu Đánh Giá
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Card>
                            </motion.div>
                        )}

                        {/* ============================================ */}
                        {/* GAMEPLAY SCREENS (listen/play/feedback) */}
                        {/* ============================================ */}
                        {(phase === "listen" || phase === "play" || phase === "feedback") && (
                            <motion.div
                                key="gameplay"
                                className="space-y-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                {/* Phase Indicator */}
                                <div className="text-center">
                                    <motion.div
                                        key={phase}
                                        initial={{ y: -10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className={cn(
                                            "inline-flex items-center gap-2 px-6 py-2 rounded-full text-lg font-semibold",
                                            phase === "listen" && "bg-indigo-500/20 text-indigo-400",
                                            phase === "play" && "bg-purple-500/20 text-purple-400",
                                            phase === "feedback" && "bg-emerald-500/20 text-emerald-400"
                                        )}
                                    >
                                        {phase === "listen" && (
                                            <>
                                                <Volume2 className="w-5 h-5 animate-pulse" />
                                                Đang phát giai điệu...
                                            </>
                                        )}
                                        {phase === "play" && (
                                            <>
                                                <Music className="w-5 h-5" />
                                                Đến lượt bạn chơi!
                                            </>
                                        )}
                                        {phase === "feedback" && (
                                            <>
                                                <CheckCircle2 className="w-5 h-5" />
                                                Hoàn thành!
                                            </>
                                        )}
                                    </motion.div>
                                </div>

                                {/* Progress Markers */}
                                {progressMarkers.length > 0 && (
                                    <div className="flex justify-center gap-2">
                                        {progressMarkers.map((correct, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className={cn(
                                                    "w-3 h-3 rounded-full",
                                                    correct ? "bg-emerald-500" : "bg-red-500"
                                                )}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Stats Bar */}
                                <div className="flex items-center justify-between max-w-2xl mx-auto">
                                    <Badge variant="outline" className="gap-1 px-3 py-1 border-indigo-500/50 text-indigo-400">
                                        <Music className="w-3 h-3" />
                                        Vòng {round}/{maxRounds}
                                    </Badge>

                                    <Badge className="gap-1 bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1">
                                        <Trophy className="w-3 h-3" />
                                        Đúng: {correctNotes}/{totalNotes}
                                    </Badge>
                                </div>

                                {/* Piano Area (Passed as Children) */}
                                <div className="relative">
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
                                className="text-center max-w-md mx-auto"
                            >
                                <Card className="bg-slate-900/80 border-slate-700/50 p-8 backdrop-blur-xl">
                                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                                    <h2 className="text-2xl text-white font-bold mb-2">
                                        Hoàn Thành!
                                    </h2>
                                    <p className="text-slate-400 mb-4">
                                        Độ chính xác: {accuracy}%
                                    </p>
                                    <p className="text-indigo-400 text-lg font-semibold">
                                        {correctNotes}/{totalNotes} nốt đúng
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

export default SequenceMemoryUI;
