/**
 * ⚡ COMMAND OVERRIDE
 * ====================
 * Stroop Test for Inhibition Control
 * 
 * UI: Words "GO" / "STOP" in conflicting colors
 * Rule: Follow COLOR, ignore TEXT
 *   - Green = Click/Respond
 *   - Red = Don't Click/Withhold
 *   - Yellow = Be cautious
 * 
 * Metrics:
 * - Impulse Errors (clicking when Red)
 * - Reaction Time
 * - Zen Master Achievement (<10% impulse errors)
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
    Play,
    Shield,
    Timer,
    Trophy,
    Zap,
    ArrowRight,
    CheckCircle2,
    XCircle,
    RotateCcw,
    Hand,
    AlertTriangle,
    Flame
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStroopLogic, type StroopItem, type StroopMetrics } from "./hooks";

// ============================================================================
// CONSTANTS
// ============================================================================

const FEEDBACK_DURATION = 400; // ms to show feedback
const WORD_COLORS = {
    green: { bg: "#10B981", text: "#10B981", label: "Xanh lá" },
    red: { bg: "#EF4444", text: "#EF4444", label: "Đỏ" },
    yellow: { bg: "#F59E0B", text: "#F59E0B", label: "Vàng" }
};

// Sound effects (simple beeps using Web Audio API)
const playSound = (type: "correct" | "incorrect" | "impulse") => {
    if (typeof AudioContext === "undefined") return;

    try {
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        switch (type) {
            case "correct":
                oscillator.frequency.value = 880; // High pitch
                oscillator.type = "sine";
                gainNode.gain.value = 0.1;
                break;
            case "incorrect":
                oscillator.frequency.value = 220; // Low buzz
                oscillator.type = "square";
                gainNode.gain.value = 0.05;
                break;
            case "impulse":
                oscillator.frequency.value = 150; // Very low
                oscillator.type = "sawtooth";
                gainNode.gain.value = 0.1;
                break;
        }

        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.15);
    } catch (e) {
        // Audio not supported, just continue silently
    }
};

// ============================================================================
// STROOP WORD DISPLAY
// ============================================================================

interface StroopWordProps {
    item: StroopItem;
    showPulse?: boolean;
    isOverdrive?: boolean;
}

const StroopWord = ({ item, showPulse = false, isOverdrive = false }: StroopWordProps) => {
    const colorStyle = WORD_COLORS[item.color];

    return (
        <motion.div
            className={cn(
                "relative flex items-center justify-center min-h-[200px] rounded-3xl",
                isOverdrive && "animate-pulse"
            )}
            style={{
                background: isOverdrive
                    ? `radial-gradient(circle, ${colorStyle.bg}20 0%, transparent 70%)`
                    : undefined
            }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
            {/* Glow effect */}
            {isOverdrive && (
                <motion.div
                    className="absolute inset-0 rounded-3xl"
                    style={{
                        boxShadow: `0 0 60px ${colorStyle.bg}40, 0 0 120px ${colorStyle.bg}20`,
                    }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                />
            )}

            {/* The word */}
            <motion.span
                className="text-7xl sm:text-8xl font-black tracking-wider select-none"
                style={{ color: colorStyle.text }}
                animate={showPulse ? { scale: [1, 1.05, 1] } : undefined}
                transition={{ duration: 0.3 }}
            >
                {item.word}
            </motion.span>

            {/* Incongruent indicator (subtle) */}
            {!item.isCongruent && (
                <motion.div
                    className="absolute -top-2 -right-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Xung đột
                    </Badge>
                </motion.div>
            )}
        </motion.div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CommandOverride = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        state,
        startGame,
        respond,
        withhold,
        nextTrial,
        calculateMetrics,
        getDisplayTime,
        resetGame
    } = useStroopLogic();

    // UI State
    const [feedback, setFeedback] = useState<"correct" | "incorrect" | "impulse" | null>(null);
    const [shakeScreen, setShakeScreen] = useState(false);
    const [timeProgress, setTimeProgress] = useState(100);
    const [metrics, setMetrics] = useState<StroopMetrics | null>(null);

    // Telemetry State
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [telemetry, setTelemetry] = useState<any[]>([]);

    // Timers
    const trialTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef<number>(0);

    // Cleanup
    useEffect(() => {
        return () => {
            if (trialTimer.current) clearTimeout(trialTimer.current);
            if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
            if (progressInterval.current) clearInterval(progressInterval.current);
        };
    }, []);

    // Start Game & Session
    const handleStartGame = async () => {
        if (!user) return;

        startGame();

        const { data, error } = await supabase
            .from("game_sessions")
            .insert({
                user_id: user.id,
                game_type: "command_override",
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

        const displayTime = getDisplayTime();
        setTimeProgress(100);
        startTimeRef.current = Date.now();
        const startTime = Date.now();

        // Progress countdown
        progressInterval.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / displayTime) * 100);
            setTimeProgress(remaining);
        }, 30);

        // Auto-timeout
        trialTimer.current = setTimeout(() => {
            handleTimeout();
        }, displayTime);

        return () => {
            if (trialTimer.current) clearTimeout(trialTimer.current);
            if (progressInterval.current) clearInterval(progressInterval.current);
        };
    }, [state.currentItem?.id, state.phase]);

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
            inhibition_score: calculatedMetrics.inhibitionScore,
            impulse_error_rate: calculatedMetrics.impulseErrorRate,
            stroop_effect_ms: calculatedMetrics.stroopEffect,
            avg_reaction_time_ms: calculatedMetrics.avgReactionTimeMs,
            neuro_trait: "Inhibition Control"
        };

        await supabase.from("game_sessions").update({
            completed_at: new Date().toISOString(),
            final_score: state.score,
            accuracy_percentage: Math.round(100 - calculatedMetrics.impulseErrorRate), // Approximation
            difficulty_level_reached: Math.round(state.speedMultiplier * 10),
            metrics: calculatedMetrics as any,
            advanced_metrics: advancedMetrics as any,
            telemetry: telemetry as any
        }).eq("id", sessionId);
    };

    // Handle user click (respond)
    const handleClick = useCallback(() => {
        if (trialTimer.current) clearTimeout(trialTimer.current);
        if (progressInterval.current) clearInterval(progressInterval.current);

        const reactionTime = Date.now() - startTimeRef.current;
        const isCorrect = respond();
        if (isCorrect === null) return;

        if (isCorrect) {
            setFeedback("correct");
            playSound("correct");
        } else {
            // Impulse error - clicked when should have stopped
            setFeedback("impulse");
            playSound("impulse");
            setShakeScreen(true);
            setTimeout(() => setShakeScreen(false), 400);
        }

        // Log Telemetry
        setTelemetry(prev => [...prev, {
            type: "response",
            timestamp: Date.now(),
            reaction_time: reactionTime,
            is_correct: isCorrect,
            trial_index: state.totalTrials,
            word: state.currentItem?.word,
            color: state.currentItem?.color,
            is_congruent: state.currentItem?.isCongruent
        }]);

        advanceAfterFeedback();
    }, [respond, state.totalTrials, state.currentItem]);

    // Handle timeout (withhold response)
    const handleTimeout = useCallback(() => {
        if (progressInterval.current) clearInterval(progressInterval.current);

        const isCorrect = withhold();
        if (isCorrect === null) return;

        if (isCorrect) {
            setFeedback("correct");
            playSound("correct");
        } else {
            // Omission error - should have clicked
            setFeedback("incorrect");
            playSound("incorrect");
        }

        // Log Telemetry
        setTelemetry(prev => [...prev, {
            type: "timeout", // withhold
            timestamp: Date.now(),
            is_correct: isCorrect,
            trial_index: state.totalTrials,
            word: state.currentItem?.word,
            color: state.currentItem?.color,
            is_congruent: state.currentItem?.isCongruent
        }]);

        advanceAfterFeedback();
    }, [withhold, state.totalTrials, state.currentItem]);

    // Advance to next trial after feedback
    const advanceAfterFeedback = () => {
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
            <Card className="border-emerald-200 dark:border-emerald-800 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <Shield className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Command Override</h2>
                            <p className="text-emerald-100">Kiểm tra Kiểm soát Xung động</p>
                        </div>
                    </div>
                </div>

                <CardContent className="p-6 space-y-6">
                    {/* The Rule */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-emerald-500" />
                            Quy tắc Vàng
                        </h3>
                        <p className="text-lg">
                            Nhìn <strong>MÀU SẮC</strong>, bỏ qua <strong>CHỮ VIẾT</strong>!
                        </p>
                    </div>

                    {/* Color rules */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border-2 border-green-300 text-center">
                            <div className="w-12 h-12 rounded-full bg-green-500 mx-auto mb-2" />
                            <p className="font-bold text-green-700">Xanh lá = BẤM</p>
                            <Hand className="w-6 h-6 mx-auto mt-2 text-green-500" />
                        </div>
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border-2 border-red-300 text-center">
                            <div className="w-12 h-12 rounded-full bg-red-500 mx-auto mb-2" />
                            <p className="font-bold text-red-700">Đỏ = DỪNG</p>
                            <XCircle className="w-6 h-6 mx-auto mt-2 text-red-500" />
                        </div>
                    </div>

                    {/* Example */}
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                            <strong>Ví dụ:</strong> Nếu thấy chữ "STOP" màu <span className="text-green-600 font-bold">XANH LÁ</span> →
                            Bạn vẫn phải <strong>BẤM</strong> vì màu xanh là "đi"!
                        </p>
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30">
                        <Flame className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                            <strong>Chế độ Overdrive:</strong> Chơi tốt sẽ tăng tốc độ. Sẵn sàng chưa?
                        </p>
                    </div>

                    <Button
                        onClick={handleStartGame}
                        className="w-full h-14 text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    >
                        <Play className="w-5 h-5 mr-2" />
                        Bắt đầu thử thách
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );

    // Render playing screen
    const renderPlaying = () => (
        <motion.div
            className={cn("space-y-6", shakeScreen && "animate-shake")}
            animate={shakeScreen ? { x: [-15, 15, -15, 15, 0] } : {}}
            transition={{ duration: 0.4 }}
        >
            {/* Stats bar */}
            <div className="flex items-center justify-between">
                <Badge className={cn(
                    "gap-1 px-3 py-1",
                    state.isOverdriveMode
                        ? "bg-orange-500 animate-pulse"
                        : "bg-emerald-500"
                )}>
                    {state.isOverdriveMode ? (
                        <>
                            <Flame className="w-3 h-3" />
                            OVERDRIVE
                        </>
                    ) : (
                        <>
                            <Zap className="w-3 h-3" />
                            x{state.speedMultiplier.toFixed(1)}
                        </>
                    )}
                </Badge>
                <Badge variant="outline" className="gap-1 font-mono">
                    <Timer className="w-3 h-3" />
                    {state.totalTrials}/40
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
                    timeProgress < 30 && "[&>div]:bg-red-500"
                )}
            />

            {/* The word display */}
            <Card className={cn(
                "overflow-hidden transition-all duration-300",
                state.isOverdriveMode && "ring-4 ring-orange-400 ring-offset-4 ring-offset-orange-50"
            )}>
                <CardContent className="p-8">
                    <AnimatePresence mode="wait">
                        {state.currentItem && (
                            <StroopWord
                                key={state.currentItem.id}
                                item={state.currentItem}
                                showPulse={feedback !== null}
                                isOverdrive={state.isOverdriveMode}
                            />
                        )}
                    </AnimatePresence>

                    {/* Feedback overlay */}
                    <AnimatePresence>
                        {feedback && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className={cn(
                                    "absolute inset-0 flex items-center justify-center rounded-xl",
                                    feedback === "correct" && "bg-green-500/20",
                                    feedback === "incorrect" && "bg-gray-500/20",
                                    feedback === "impulse" && "bg-red-500/30"
                                )}
                            >
                                {feedback === "correct" && (
                                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                                )}
                                {feedback === "incorrect" && (
                                    <XCircle className="w-16 h-16 text-gray-500" />
                                )}
                                {feedback === "impulse" && (
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 0.2 }}
                                        className="text-center"
                                    >
                                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
                                        <p className="text-red-600 font-bold mt-2">Impulse!</p>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>

            {/* Action button */}
            <Button
                onClick={handleClick}
                disabled={feedback !== null}
                className={cn(
                    "w-full h-20 text-2xl font-bold transition-all",
                    state.isOverdriveMode
                        ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                )}
            >
                <Hand className="w-8 h-8 mr-3" />
                BẤM
            </Button>

            <p className="text-center text-sm text-gray-500">
                Không bấm nếu màu ĐỎ - Tự động tiếp tục khi hết giờ
            </p>
        </motion.div>
    );

    // Render result screen
    const renderResult = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
        >
            <div className="text-center">
                <motion.div
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 mx-auto mb-4 shadow-xl"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <Shield className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold">Thử thách Hoàn thành! 🎯</h2>
                <p className="text-gray-500">Kết quả Kiểm soát Xung động</p>
            </div>

            <Card>
                <CardContent className="p-6 space-y-4">
                    {/* Main metrics */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-center">
                            <p className="text-sm text-gray-500">Điểm Inhibition</p>
                            <p className="text-3xl font-bold text-emerald-600">
                                {metrics?.inhibitionScore}
                            </p>
                            {metrics?.zenMasterAchieved && (
                                <Badge className="mt-2 bg-emerald-500">
                                    🧘 Zen Master
                                </Badge>
                            )}
                        </div>
                        <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-center">
                            <p className="text-sm text-gray-500">Thời gian TB</p>
                            <p className="text-3xl font-bold text-teal-600">
                                {metrics?.avgReactionTimeMs}ms
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className={cn(
                            "p-4 rounded-xl text-center",
                            (metrics?.impulseErrorRate || 0) < 15
                                ? "bg-green-50 dark:bg-green-950/30"
                                : "bg-red-50 dark:bg-red-950/30"
                        )}>
                            <p className="text-sm text-gray-500">Lỗi Xung động</p>
                            <p className={cn(
                                "text-3xl font-bold",
                                (metrics?.impulseErrorRate || 0) < 15 ? "text-green-600" : "text-red-600"
                            )}>
                                {metrics?.impulseErrorRate}%
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-center">
                            <p className="text-sm text-gray-500">Stroop Effect</p>
                            <p className="text-3xl font-bold text-purple-600">
                                {metrics?.stroopEffect}ms
                            </p>
                        </div>
                    </div>

                    {/* Score */}
                    <div className="text-center pt-4 border-t">
                        <p className="text-sm text-gray-500">Điểm số</p>
                        <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
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
                <Button onClick={handleBack} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600">
                    Tiếp tục
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </motion.div>
    );

    return (
        <div className={cn(
            "min-h-screen p-4 sm:p-6 transition-colors duration-500",
            state.isOverdriveMode
                ? "bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 dark:from-gray-900 dark:via-red-950/20 dark:to-gray-900"
                : "bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"
        )}>
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
          25% { transform: translateX(-15px); }
          50% { transform: translateX(15px); }
          75% { transform: translateX(-15px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
        </div>
    );
};

export default CommandOverride;
