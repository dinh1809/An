/**
 * 🔮 FLUX MATRIX
 * ==============
 * Wisconsin Card Sorting Test for Cognitive Flexibility
 * 
 * UI: 4 Target bins + 1 Active card to sort
 * Logic: Hidden rule (COLOR/SHAPE/NUMBER) changes after 5 correct
 * 
 * Metrics:
 * - Perseverative Errors (clinging to old rule)
 * - Categories Completed
 * - Flexibility Index
 * - Adaptive Solver Achievement (flexibility > 0.8)
 */

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    Play,
    Shuffle,
    Timer,
    Trophy,
    Zap,
    ArrowRight,
    CheckCircle2,
    XCircle,
    RotateCcw,
    HelpCircle,
    Brain,
    Layers,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    useWisconsinLogic,
    type WisconsinCard,
    type TargetBin,
    type WisconsinMetrics
} from "./hooks";

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
    red: "#EF4444",
    blue: "#3B82F6",
    green: "#10B981",
    yellow: "#F59E0B"
};

const FEEDBACK_DURATION = 800;

// ============================================================================
// SHAPE RENDERER
// ============================================================================

interface ShapeProps {
    shape: WisconsinCard["shape"];
    color: WisconsinCard["color"];
    size?: number;
    count?: number;
}

const ShapeRenderer = ({ shape, color, size = 40, count = 1 }: ShapeProps) => {
    const colorHex = COLORS[color];

    const renderSingleShape = (key: number, smaller = false) => {
        const actualSize = smaller ? size * 0.7 : size;

        switch (shape) {
            case "circle":
                return (
                    <div
                        key={key}
                        style={{
                            width: actualSize,
                            height: actualSize,
                            backgroundColor: colorHex,
                            borderRadius: "50%"
                        }}
                    />
                );
            case "square":
                return (
                    <div
                        key={key}
                        style={{
                            width: actualSize,
                            height: actualSize,
                            backgroundColor: colorHex,
                            borderRadius: actualSize * 0.15
                        }}
                    />
                );
            case "triangle":
                return (
                    <div
                        key={key}
                        style={{
                            width: 0,
                            height: 0,
                            borderLeft: `${actualSize / 2}px solid transparent`,
                            borderRight: `${actualSize / 2}px solid transparent`,
                            borderBottom: `${actualSize}px solid ${colorHex}`
                        }}
                    />
                );
            case "star":
                return (
                    <div
                        key={key}
                        className="relative"
                        style={{ width: actualSize, height: actualSize }}
                    >
                        <svg viewBox="0 0 24 24" fill={colorHex} width={actualSize} height={actualSize}>
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    </div>
                );
        }
    };

    // Layout for multiple shapes
    const getGridLayout = () => {
        switch (count) {
            case 1:
                return "grid-cols-1";
            case 2:
                return "grid-cols-2";
            case 3:
                return "grid-cols-3";
            case 4:
                return "grid-cols-2";
            default:
                return "grid-cols-1";
        }
    };

    return (
        <div className={cn("grid gap-1 place-items-center", getGridLayout())}>
            {Array.from({ length: count }, (_, i) => renderSingleShape(i, count > 1))}
        </div>
    );
};

// ============================================================================
// CARD COMPONENT
// ============================================================================

interface GameCardProps {
    card: WisconsinCard | TargetBin;
    onClick?: () => void;
    isActive?: boolean;
    isCorrect?: boolean | null;
    isBin?: boolean;
    binIndex?: number;
}

const GameCard = ({
    card,
    onClick,
    isActive = false,
    isCorrect = null,
    isBin = false,
    binIndex
}: GameCardProps) => {
    const count = "count" in card ? card.count : 1;

    return (
        <motion.div
            className={cn(
                "relative cursor-pointer transition-all",
                isBin && "hover:scale-105"
            )}
            onClick={onClick}
            whileHover={isBin ? { scale: 1.05 } : undefined}
            whileTap={isBin ? { scale: 0.95 } : undefined}
        >
            <div
                className={cn(
                    "p-4 rounded-xl border-2 transition-all flex items-center justify-center min-h-[100px]",
                    isBin ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700" : "bg-white dark:bg-gray-900",
                    isActive && "ring-4 ring-indigo-400 ring-offset-2 shadow-xl",
                    isCorrect === true && "border-green-500 bg-green-50 dark:bg-green-950/30",
                    isCorrect === false && "border-red-500 bg-red-50 dark:bg-red-950/30"
                )}
            >
                <ShapeRenderer
                    shape={card.shape}
                    color={card.color}
                    count={count}
                    size={isBin ? 35 : 50}
                />
            </div>

            {/* Bin number */}
            {isBin && typeof binIndex === "number" && (
                <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center">
                    {binIndex + 1}
                </div>
            )}

            {/* Feedback overlay */}
            <AnimatePresence>
                {isCorrect !== null && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                            "absolute inset-0 flex items-center justify-center rounded-xl",
                            isCorrect ? "bg-green-500/30" : "bg-red-500/30"
                        )}
                    >
                        {isCorrect ? (
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        ) : (
                            <XCircle className="w-10 h-10 text-red-500" />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const FluxMatrix = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        state,
        startGame,
        selectBin,
        nextTrial,
        calculateMetrics,
        resetGame
    } = useWisconsinLogic();

    // UI State
    const [selectedBin, setSelectedBin] = useState<number | null>(null);
    const [shakeCard, setShakeCard] = useState(false);
    const [metrics, setMetrics] = useState<WisconsinMetrics | null>(null);
    const [showRuleChangeHint, setShowRuleChangeHint] = useState(false);

    // Telemetry State
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [telemetry, setTelemetry] = useState<any[]>([]);
    const startTimeRef = useRef<number>(0);

    // Track rule changes for hints
    const prevCategoriesCompleted = useState(0);

    // Start Game & Session
    const handleStartGame = async () => {
        if (!user) return;

        startGame();
        startTimeRef.current = Date.now();

        const { data, error } = await supabase
            .from("game_sessions")
            .insert({
                user_id: user.id,
                game_type: "flux_matrix",
                started_at: new Date().toISOString()
            })
            .select("id")
            .single();

        if (data) setSessionId(data.id);
        if (error) console.error("Session init failed", error);

        setTelemetry([]);
    };

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
            flexibility_index: calculatedMetrics.flexibilityIndex,
            perseverative_errors: calculatedMetrics.perseverativeErrors,
            categories_completed: calculatedMetrics.categoriesCompleted,
            conceptual_level_responses: calculatedMetrics.conceptualLevelResponses,
            neuro_trait: "Cognitive Flexibility"
        };

        await supabase.from("game_sessions").update({
            completed_at: new Date().toISOString(),
            final_score: state.score,
            accuracy_percentage: Math.round(calculatedMetrics.conceptualLevelResponses),
            difficulty_level_reached: calculatedMetrics.categoriesCompleted,
            metrics: calculatedMetrics as any,
            advanced_metrics: advancedMetrics as any,
            telemetry: telemetry as any
        }).eq("id", sessionId);
    };

    // Show hint when rule changes
    useEffect(() => {
        if (state.categoriesCompleted > prevCategoriesCompleted[0] && state.categoriesCompleted > 0) {
            setShowRuleChangeHint(true);
            setTimeout(() => setShowRuleChangeHint(false), 2000);
        }
        prevCategoriesCompleted[0] = state.categoriesCompleted;
    }, [state.categoriesCompleted]);

    // Handle feedback and advance
    useEffect(() => {
        if (state.showFeedback) {
            if (state.lastFeedback === "incorrect") {
                setShakeCard(true);
                setTimeout(() => setShakeCard(false), 400);
            }

            const timer = setTimeout(() => {
                setSelectedBin(null);
                nextTrial();
                startTimeRef.current = Date.now(); // Reset timer for next trial
            }, FEEDBACK_DURATION);

            return () => clearTimeout(timer);
        }
    }, [state.showFeedback, state.lastFeedback, nextTrial]);

    // Handle bin selection
    const handleBinSelect = useCallback((binIndex: number) => {
        if (state.showFeedback) return;

        const reactionTime = Date.now() - startTimeRef.current;
        setSelectedBin(binIndex);
        const isCorrect = selectBin(binIndex);

        // Log Telemetry
        setTelemetry(prev => [...prev, {
            type: "response",
            timestamp: Date.now(),
            reaction_time: reactionTime,
            is_correct: isCorrect,
            trial_index: state.totalTrials,
            current_rule: state.currentRule,
            card_shape: state.currentCard?.shape,
            bin_selected: binIndex
        }]);

    }, [selectBin, state.showFeedback, state.totalTrials, state.currentRule, state.currentCard]);

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
            <Card className="border-indigo-200 dark:border-indigo-800 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-violet-600 p-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <Shuffle className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Flux Matrix</h2>
                            <p className="text-indigo-100">Kiểm tra Tư duy Linh hoạt</p>
                        </div>
                    </div>
                </div>

                <CardContent className="p-6 space-y-6">
                    {/* How to play */}
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Brain className="w-5 h-5 text-indigo-500" />
                            Cách chơi
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30">
                                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm">1</div>
                                <div>
                                    <p className="font-medium">Xếp lá bài vào đúng ô</p>
                                    <p className="text-sm text-gray-500">Có 4 ô với các hình dạng/màu sắc/số lượng khác nhau</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30">
                                <div className="w-8 h-8 rounded-full bg-violet-500 text-white flex items-center justify-center font-bold text-sm">2</div>
                                <div>
                                    <p className="font-medium">Tìm quy luật ẩn</p>
                                    <p className="text-sm text-gray-500">Có thể là Màu sắc, Hình dạng, hoặc Số lượng</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30">
                                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">3</div>
                                <div>
                                    <p className="font-medium">Thích nghi khi quy luật thay đổi!</p>
                                    <p className="text-sm text-gray-500">
                                        <strong className="text-orange-600">Quan trọng:</strong> Quy luật sẽ đổi ngẫu nhiên - bạn phải tự phát hiện!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Key insight */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200">
                        <div className="flex items-start gap-3">
                            <HelpCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-amber-800 dark:text-amber-200">Mẹo</p>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    Khi đột nhiên bị sai dù đã đúng nhiều lần - đó là dấu hiệu quy luật đã thay đổi. Hãy thử cách khác!
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleStartGame}
                        className="w-full h-14 text-lg bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
                    >
                        <Play className="w-5 h-5 mr-2" />
                        Bắt đầu
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );

    // Render playing screen
    const renderPlaying = () => (
        <motion.div className="space-y-6">
            {/* Stats bar */}
            <div className="flex items-center justify-between">
                <Badge className="gap-1 bg-indigo-500 px-3 py-1">
                    <Layers className="w-3 h-3" />
                    Danh mục: {state.categoriesCompleted}
                </Badge>
                <Badge variant="outline" className="gap-1 font-mono">
                    <Timer className="w-3 h-3" />
                    {state.totalTrials}/64
                </Badge>
                <Badge variant="secondary" className="gap-1">
                    <Trophy className="w-3 h-3" />
                    {state.score}
                </Badge>
            </div>

            {/* Progress */}
            <Progress
                value={(state.totalTrials / 64) * 100}
                className="h-2"
            />

            {/* Rule change hint */}
            <AnimatePresence>
                {showRuleChangeHint && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center p-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span className="font-medium">Quy luật đã thay đổi!</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Target bins */}
            <div className="grid grid-cols-4 gap-3">
                {state.targetBins.map((bin, idx) => (
                    <GameCard
                        key={bin.id}
                        card={bin}
                        isBin
                        binIndex={idx}
                        onClick={() => handleBinSelect(idx)}
                        isCorrect={
                            selectedBin === idx && state.showFeedback
                                ? state.lastFeedback === "correct"
                                : null
                        }
                    />
                ))}
            </div>

            {/* Arrow and active card */}
            <div className="flex flex-col items-center gap-4">
                <motion.div
                    className="text-gray-400"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                >
                    <ArrowRight className="w-8 h-8 rotate-[-90deg]" />
                </motion.div>

                {/* Active card to sort */}
                <AnimatePresence mode="wait">
                    {state.currentCard && (
                        <motion.div
                            key={state.currentCard.id}
                            initial={{ scale: 0.5, opacity: 0, y: 50 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                y: 0,
                                x: shakeCard ? [-10, 10, -10, 10, 0] : 0
                            }}
                            exit={{ scale: 0.5, opacity: 0, y: -50 }}
                            className="w-32"
                        >
                            <GameCard
                                card={state.currentCard}
                                isActive
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Streak indicator */}
            <div className="flex justify-center gap-2">
                {Array.from({ length: 5 }, (_, i) => (
                    <motion.div
                        key={i}
                        className={cn(
                            "w-4 h-4 rounded-full transition-all",
                            i < state.streakForRuleChange
                                ? "bg-indigo-500"
                                : "bg-gray-200 dark:bg-gray-700"
                        )}
                        animate={i < state.streakForRuleChange ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ delay: i * 0.1 }}
                    />
                ))}
                <span className="text-xs text-gray-500 ml-2">
                    {state.streakForRuleChange}/5 đến chuyển quy luật
                </span>
            </div>

            {/* Hint text */}
            <p className="text-center text-sm text-gray-500">
                Bấm vào ô phù hợp để xếp lá bài
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
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 mx-auto mb-4 shadow-xl"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <Shuffle className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold">Matrix Decoded! 🧩</h2>
                <p className="text-gray-500">Kết quả Tư duy Linh hoạt</p>
            </div>

            <Card>
                <CardContent className="p-6 space-y-4">
                    {/* Main metrics */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-center">
                            <p className="text-sm text-gray-500">Flexibility Index</p>
                            <p className="text-3xl font-bold text-indigo-600">
                                {(metrics?.flexibilityIndex ?? 0).toFixed(2)}
                            </p>
                            {metrics?.adaptiveSolverAchieved && (
                                <Badge className="mt-2 bg-indigo-500">
                                    🔄 Adaptive Solver
                                </Badge>
                            )}
                        </div>
                        <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-950/30 text-center">
                            <p className="text-sm text-gray-500">Danh mục</p>
                            <p className="text-3xl font-bold text-violet-600">
                                {metrics?.categoriesCompleted}/6
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className={cn(
                            "p-4 rounded-xl text-center",
                            (metrics?.perseverativeErrors || 0) < 10
                                ? "bg-green-50 dark:bg-green-950/30"
                                : "bg-orange-50 dark:bg-orange-950/30"
                        )}>
                            <p className="text-sm text-gray-500">Lỗi Bướng</p>
                            <p className={cn(
                                "text-3xl font-bold",
                                (metrics?.perseverativeErrors || 0) < 10 ? "text-green-600" : "text-orange-600"
                            )}>
                                {metrics?.perseverativeErrors}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Perseverative Errors</p>
                        </div>
                        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-center">
                            <p className="text-sm text-gray-500">Conceptual</p>
                            <p className="text-3xl font-bold text-purple-600">
                                {metrics?.conceptualLevelResponses}%
                            </p>
                        </div>
                    </div>

                    {/* Interpretation */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {(metrics?.flexibilityIndex ?? 0) >= 0.8 ? (
                                <>
                                    <strong className="text-indigo-600">Xuất sắc!</strong> Bạn thích nghi nhanh với thay đổi và ít mắc lỗi bướng bỉnh.
                                </>
                            ) : (metrics?.flexibilityIndex ?? 0) >= 0.5 ? (
                                <>
                                    <strong className="text-violet-600">Tốt!</strong> Bạn có khả năng chuyển đổi tư duy. Có thể cải thiện bằng cách ít bám vào quy tắc cũ.
                                </>
                            ) : (
                                <>
                                    <strong className="text-purple-600">Đang phát triển.</strong> Việc chuyển đổi giữa các quy tắc cần luyện tập thêm.
                                </>
                            )}
                        </p>
                    </div>

                    {/* Score */}
                    <div className="text-center pt-4 border-t">
                        <p className="text-sm text-gray-500">Điểm số</p>
                        <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-600">
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
                <Button onClick={handleBack} className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-600">
                    Hoàn thành
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
            <div className="max-w-lg mx-auto">
                <AnimatePresence mode="wait">
                    {state.phase === "intro" && renderIntro()}
                    {state.phase === "playing" && renderPlaying()}
                    {state.phase === "result" && renderResult()}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default FluxMatrix;
