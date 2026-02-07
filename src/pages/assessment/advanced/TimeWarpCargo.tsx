/**
 * 🚂 TIME WARP CARGO
 * ==================
 * N-Back Working Memory Assessment Game
 * 
 * UI: Conveyor belt showing items (Shape + Color)
 * Logic: Compare current item with N positions back
 * Adaptive: N increases from 1 to 3 based on performance
 * 
 * Metrics:
 * - Max N-level reached
 * - Accuracy %
 * - Working Memory Score
 */

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    Brain,
    Play,
    Sparkles,
    Timer,
    Trophy,
    Zap,
    ArrowRight,
    CheckCircle2,
    XCircle,
    RotateCcw,
    Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNBackLogic, type NBackItem, type NBackMetrics } from "./hooks";

// ============================================================================
// CONSTANTS
// ============================================================================

const TRIAL_DURATION = 2500; // ms to respond
const FEEDBACK_DURATION = 600; // ms to show feedback
const SHAPE_COLORS = {
    red: "#EF4444",
    blue: "#3B82F6",
    green: "#10B981",
    yellow: "#F59E0B"
};

// ============================================================================
// SHAPE COMPONENT
// ============================================================================

interface ShapeDisplayProps {
    item: NBackItem;
    size?: number;
    showGlow?: boolean;
    isNBack?: boolean;
}

const ShapeDisplay = ({ item, size = 80, showGlow = false, isNBack = false }: ShapeDisplayProps) => {
    const color = SHAPE_COLORS[item.color];

    const renderShape = () => {
        const baseStyle = {
            width: size,
            height: size,
            backgroundColor: color,
            boxShadow: showGlow ? `0 0 30px ${color}` : "none"
        };

        switch (item.shape) {
            case "circle":
                return <div style={{ ...baseStyle, borderRadius: "50%" }} />;
            case "square":
                return <div style={{ ...baseStyle, borderRadius: size * 0.15 }} />;
            case "triangle":
                return (
                    <div
                        style={{
                            width: 0,
                            height: 0,
                            borderLeft: `${size / 2}px solid transparent`,
                            borderRight: `${size / 2}px solid transparent`,
                            borderBottom: `${size}px solid ${color}`,
                            filter: showGlow ? `drop-shadow(0 0 15px ${color})` : "none"
                        }}
                    />
                );
            case "diamond":
                return (
                    <div
                        style={{
                            ...baseStyle,
                            transform: "rotate(45deg)",
                            width: size * 0.7,
                            height: size * 0.7
                        }}
                    />
                );
        }
    };

    return (
        <motion.div
            className={cn(
                "flex items-center justify-center p-4 rounded-2xl",
                isNBack && "ring-2 ring-violet-500 ring-offset-2 bg-violet-50 dark:bg-violet-950/30"
            )}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            {renderShape()}
        </motion.div>
    );
};

// ============================================================================
// CONVEYOR BELT COMPONENT
// ============================================================================

interface ConveyorBeltProps {
    history: NBackItem[];
    currentItem: NBackItem | null;
    nLevel: number;
    maxVisible?: number;
}

const ConveyorBelt = ({ history, currentItem, nLevel, maxVisible = 5 }: ConveyorBeltProps) => {
    const visibleHistory = history.slice(-maxVisible);
    const nBackIndex = history.length - nLevel;

    return (
        <div className="relative overflow-hidden">
            {/* Belt track */}
            <div className="flex items-center gap-4 py-4 px-2">
                {/* History items (smaller, faded) */}
                {visibleHistory.map((item, idx) => {
                    const actualIndex = history.length - visibleHistory.length + idx;
                    const isNBackItem = actualIndex === nBackIndex && nBackIndex >= 0;

                    return (
                        <motion.div
                            key={item.id}
                            className={cn(
                                "flex-shrink-0 transition-all",
                                isNBackItem && "scale-110"
                            )}
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: isNBackItem ? 1 : 0.4 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <ShapeDisplay
                                item={item}
                                size={isNBackItem ? 50 : 40}
                                isNBack={isNBackItem}
                            />
                            {isNBackItem && (
                                <p className="text-xs text-center mt-1 text-violet-500 font-medium">
                                    {nLevel}-back
                                </p>
                            )}
                        </motion.div>
                    );
                })}

                {/* Arrow indicator */}
                <motion.div
                    className="flex-shrink-0 text-gray-400"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                >
                    <ArrowRight className="w-6 h-6" />
                </motion.div>

                {/* Current item (large, glowing) */}
                <AnimatePresence mode="wait">
                    {currentItem && (
                        <motion.div
                            key={currentItem.id}
                            className="flex-shrink-0"
                            initial={{ x: 100, opacity: 0, scale: 0.5 }}
                            animate={{ x: 0, opacity: 1, scale: 1 }}
                            exit={{ x: -50, opacity: 0, scale: 0.8 }}
                        >
                            <ShapeDisplay item={currentItem} size={80} showGlow />
                            <p className="text-xs text-center mt-2 text-gray-500">Hiện tại</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Belt decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full">
                <motion.div
                    className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"
                    animate={{ x: ["0%", "300%"] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TimeWarpCargo = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        state,
        startGame,
        respondMatch,
        skipResponse,
        nextTrial,
        calculateMetrics,
        resetGame,
        getNBackItem
    } = useNBackLogic();

    // UI State
    const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [shakeScreen, setShakeScreen] = useState(false);
    const [timeProgress, setTimeProgress] = useState(100);
    const [metrics, setMetrics] = useState<NBackMetrics | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [telemetry, setTelemetry] = useState<any[]>([]);

    // Timers
    const trialTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const prevNLevel = useRef<number>(1);
    const startTimeRef = useRef<number>(0);

    // Cleanup timers
    useEffect(() => {
        return () => {
            if (trialTimer.current) clearTimeout(trialTimer.current);
            if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
            if (progressInterval.current) clearInterval(progressInterval.current);
        };
    }, []);

    // Create session on load (if not exists) handling via Start Button
    const handleStartGame = async () => {
        if (!user) return;

        startGame();

        const { data, error } = await supabase
            .from("game_sessions")
            .insert({
                user_id: user.id,
                game_type: "time_warp_cargo",
                started_at: new Date().toISOString()
            })
            .select("id")
            .single();

        if (data) setSessionId(data.id);
        if (error) console.error("Session init failed", error);

        setTelemetry([]);
    };

    // Handle trial timer
    useEffect(() => {
        if (state.phase !== "playing" || !state.currentItem) return;

        // Reset progress
        setTimeProgress(100);
        startTimeRef.current = Date.now();
        const startTime = Date.now();

        // Progress bar countdown
        progressInterval.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / TRIAL_DURATION) * 100);
            setTimeProgress(remaining);
        }, 50);

        // Auto-skip after timeout
        trialTimer.current = setTimeout(() => {
            handleTimeout();
        }, TRIAL_DURATION);

        return () => {
            if (trialTimer.current) clearTimeout(trialTimer.current);
            if (progressInterval.current) clearInterval(progressInterval.current);
        };
    }, [state.currentItem?.id, state.phase]);

    // Check for level up
    useEffect(() => {
        if (state.nLevel > prevNLevel.current) {
            setShowLevelUp(true);
            setTimeout(() => setShowLevelUp(false), 1500);
        }
        prevNLevel.current = state.nLevel;
    }, [state.nLevel]);

    // Calculate metrics when complete
    useEffect(() => {
        if (state.isComplete && sessionId) {
            finishSession();
        }
    }, [state.isComplete]);

    const finishSession = async () => {
        if (!sessionId) return;
        const calculatedMetrics = calculateMetrics();
        setMetrics(calculatedMetrics);

        const advancedMetrics = {
            max_n_level: calculatedMetrics.maxNLevel,
            accuracy_percent: calculatedMetrics.accuracyPercent,
            d_prime: calculatedMetrics.dPrime,
            working_memory_score: calculatedMetrics.workingMemoryScore,
            neuro_trait: "Working Memory Capacity"
        };

        await supabase.from("game_sessions").update({
            completed_at: new Date().toISOString(),
            final_score: state.score,
            accuracy_percentage: calculatedMetrics.accuracyPercent,
            difficulty_level_reached: calculatedMetrics.maxNLevel,
            metrics: calculatedMetrics as any,
            advanced_metrics: advancedMetrics as any,
            telemetry: telemetry as any
        }).eq("id", sessionId);
    };

    // Handle user response
    const handleMatchClick = useCallback(() => {
        if (trialTimer.current) clearTimeout(trialTimer.current);
        if (progressInterval.current) clearInterval(progressInterval.current);

        const reactionTime = Date.now() - startTimeRef.current;
        const isCorrect = respondMatch();
        showFeedback(isCorrect ?? false);

        // Log Telemetry
        setTelemetry(prev => [...prev, {
            type: "response",
            timestamp: Date.now(),
            reaction_time: reactionTime,
            is_correct: isCorrect,
            n_level: state.nLevel,
            trial_index: state.totalTrials
        }]);

    }, [respondMatch, state.nLevel, state.totalTrials]);

    // Handle timeout (no response)
    const handleTimeout = useCallback(() => {
        if (progressInterval.current) clearInterval(progressInterval.current);

        const isCorrect = skipResponse();
        showFeedback(isCorrect ?? false);

        // Log Telemetry (Miss)
        setTelemetry(prev => [...prev, {
            type: "timeout",
            timestamp: Date.now(),
            is_correct: isCorrect,
            n_level: state.nLevel,
            trial_index: state.totalTrials
        }]);

    }, [skipResponse, state.nLevel, state.totalTrials]);

    // Show feedback and advance
    const showFeedback = (isCorrect: boolean) => {
        setFeedback(isCorrect ? "correct" : "incorrect");

        if (!isCorrect) {
            setShakeScreen(true);
            setTimeout(() => setShakeScreen(false), 400);
        }

        feedbackTimer.current = setTimeout(() => {
            setFeedback(null);
            nextTrial();
        }, FEEDBACK_DURATION);
    };

    // Navigate back
    const handleBack = () => {
        navigate("/assessment");
    };

    // Render intro screen
    const renderIntro = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            <Card className="border-violet-200 dark:border-violet-800 overflow-hidden">
                <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <Package className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Time Warp Cargo</h2>
                            <p className="text-violet-100">Kiểm tra Trí nhớ Làm việc</p>
                        </div>
                    </div>
                </div>

                <CardContent className="p-6 space-y-6">
                    {/* How to play */}
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Brain className="w-5 h-5 text-violet-500" />
                            Cách chơi
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30">
                                <div className="w-8 h-8 rounded-full bg-violet-500 text-white flex items-center justify-center font-bold text-sm">1</div>
                                <div>
                                    <p className="font-medium">Quan sát các kiện hàng</p>
                                    <p className="text-sm text-gray-500">Mỗi kiện có hình dạng và màu sắc khác nhau</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30">
                                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">2</div>
                                <div>
                                    <p className="font-medium">So sánh với N bước trước</p>
                                    <p className="text-sm text-gray-500">Kiện hiện tại có giống kiện N bước trước không?</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30">
                                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm">3</div>
                                <div>
                                    <p className="font-medium">Nhấn "Trùng!" nếu giống</p>
                                    <p className="text-sm text-gray-500">Đúng nhiều sẽ tăng độ khó (N tăng lên)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Difficulty levels */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                            <p className="text-lg font-bold text-violet-500">1-Back</p>
                            <p className="text-xs text-gray-500">Dễ</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                            <p className="text-lg font-bold text-purple-500">2-Back</p>
                            <p className="text-xs text-gray-500">Trung bình</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                            <p className="text-lg font-bold text-indigo-500">3-Back</p>
                            <p className="text-xs text-gray-500">Cao thủ</p>
                        </div>
                    </div>

                    <Button
                        onClick={handleStartGame}
                        className="w-full h-14 text-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                    >
                        <Play className="w-5 h-5 mr-2" />
                        Bắt đầu
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );

    // Render playing screen
    const renderPlaying = () => {
        const nBackItem = getNBackItem();

        return (
            <motion.div
                className={cn("space-y-6", shakeScreen && "animate-shake")}
                animate={shakeScreen ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
            >
                {/* Stats bar */}
                <div className="flex items-center justify-between">
                    <Badge className="gap-1 bg-violet-500 px-3 py-1">
                        <Zap className="w-3 h-3" />
                        {state.nLevel}-Back
                    </Badge>
                    <Badge variant="outline" className="gap-1 font-mono">
                        <Timer className="w-3 h-3" />
                        {state.totalTrials}/30
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                        <Trophy className="w-3 h-3" />
                        {state.score}
                    </Badge>
                </div>

                {/* Time progress */}
                <Progress
                    value={timeProgress}
                    className={cn(
                        "h-2 transition-all",
                        timeProgress < 30 && "animate-pulse"
                    )}
                />

                {/* Level up animation */}
                <AnimatePresence>
                    {showLevelUp && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                        >
                            <div className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-2xl">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-8 h-8" />
                                    <div>
                                        <p className="text-sm opacity-80">Level Up!</p>
                                        <p className="text-2xl font-bold">{state.nLevel}-Back</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Conveyor belt */}
                <Card className="overflow-hidden">
                    <CardContent className="p-6">
                        <ConveyorBelt
                            history={state.history}
                            currentItem={state.currentItem}
                            nLevel={state.nLevel}
                        />
                    </CardContent>
                </Card>

                {/* Comparison helper */}
                {nBackItem && (
                    <div className="flex items-center justify-center gap-4 text-center">
                        <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30">
                            <p className="text-xs text-gray-500 mb-2">{state.nLevel} bước trước</p>
                            <ShapeDisplay item={nBackItem} size={40} />
                        </div>
                        <div className="text-2xl text-gray-400">=?</div>
                        {state.currentItem && (
                            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                                <p className="text-xs text-gray-500 mb-2">Hiện tại</p>
                                <ShapeDisplay item={state.currentItem} size={40} />
                            </div>
                        )}
                    </div>
                )}

                {/* Action button */}
                <Button
                    onClick={handleMatchClick}
                    disabled={feedback !== null}
                    className="w-full h-16 text-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:opacity-50"
                >
                    {feedback === "correct" ? (
                        <span className="flex items-center gap-2 text-green-200">
                            <CheckCircle2 className="w-6 h-6" /> Đúng rồi!
                        </span>
                    ) : feedback === "incorrect" ? (
                        <span className="flex items-center gap-2 text-red-200">
                            <XCircle className="w-6 h-6" /> Sai rồi
                        </span>
                    ) : (
                        <>🎯 Trùng!</>
                    )}
                </Button>

                <p className="text-center text-sm text-gray-500">
                    Không nhấn nếu không trùng - hệ thống tự động tiếp tục
                </p>
            </motion.div>
        );
    };

    // Render result screen
    const renderResult = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
        >
            <div className="text-center">
                <motion.div
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 mx-auto mb-4 shadow-xl"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <Brain className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold">Nhiệm vụ Hoàn thành! 🎉</h2>
                <p className="text-gray-500">Kết quả Trí nhớ Làm việc của bạn</p>
            </div>

            <Card>
                <CardContent className="p-6 space-y-4">
                    {/* Main metrics */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-950/30 text-center">
                            <p className="text-sm text-gray-500">Max Level</p>
                            <p className="text-3xl font-bold text-violet-600">
                                {metrics?.maxNLevel}-Back
                            </p>
                            {metrics?.maxNLevel && metrics.maxNLevel >= 2 && (
                                <Badge className="mt-2 bg-violet-500">
                                    🧠 Intellectual Processor
                                </Badge>
                            )}
                        </div>
                        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-center">
                            <p className="text-sm text-gray-500">Độ chính xác</p>
                            <p className="text-3xl font-bold text-purple-600">
                                {metrics?.accuracyPercent}%
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-center">
                            <p className="text-sm text-gray-500">Working Memory Score</p>
                            <p className="text-3xl font-bold text-indigo-600">
                                {metrics?.workingMemoryScore}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-center">
                            <p className="text-sm text-gray-500">Thời gian TB</p>
                            <p className="text-3xl font-bold text-gray-600">
                                {metrics?.avgReactionTimeMs}ms
                            </p>
                        </div>
                    </div>

                    {/* Score */}
                    <div className="text-center pt-4 border-t">
                        <p className="text-sm text-gray-500">Điểm số</p>
                        <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-purple-600">
                            {state.score}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-3">
                <Button variant="outline" onClick={resetGame} className="flex-1">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Chơi lại
                </Button>
                <Button onClick={handleBack} className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600">
                    Tiếp tục
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
            <div className="max-w-lg mx-auto">
                <AnimatePresence mode="wait">
                    {state.phase === "intro" && renderIntro()}
                    {state.phase === "playing" && renderPlaying()}
                    {state.phase === "result" && renderResult()}
                </AnimatePresence>
            </div>

            {/* CSS for shake animation */}
            <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
        </div>
    );
};

export default TimeWarpCargo;
