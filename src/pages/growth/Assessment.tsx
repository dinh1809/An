/**
 * 🧠 GROWTH ENGINE - Assessment Mini-Games
 * =========================================
 * A series of 3 game-based tasks to measure cognitive traits:
 * 
 * Task 1: Pattern Recognition (Raven's matrices - simplified)
 * Task 2: Reaction/Focus (Click when target appears)
 * Task 3: Preference (This or That - Visual vs Auditory)
 * 
 * Ethical: Uses supportive Vietnamese language, no medical terms
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    Brain,
    Sparkles,
    ArrowRight,
    Play,
    CheckCircle2,
    Eye,
    Ear,
    Target,
    Zap,
    Shapes,
    type LucideIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface GameMetrics {
    // Task 1: Pattern
    pattern_accuracy: number;
    pattern_avg_time_ms: number;
    pattern_total_trials: number;

    // Task 2: Reaction
    reaction_accuracy: number;
    reaction_avg_time_ms: number;
    impulse_errors: number;
    attention_consistency: number;

    // Task 3: Preference
    visual_preference_score: number;
    auditory_preference_score: number;

    // Derived
    interaction_intensity: number;
}

type AssessmentPhase = "intro" | "task1" | "task2" | "task3" | "complete";

interface PatternCell {
    id: number;
    shape: "circle" | "square" | "triangle";
    color: string;
    filled: boolean;
}

interface PreferenceChoice {
    id: number;
    question: string;
    optionA: { label: string; type: "visual"; icon: LucideIcon };
    optionB: { label: string; type: "auditory"; icon: LucideIcon };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PATTERN_COLORS = ["#8B5CF6", "#14B8A6", "#F59E0B", "#EC4899"];
const SHAPES: Array<"circle" | "square" | "triangle"> = ["circle", "square", "triangle"];

const PREFERENCE_QUESTIONS: PreferenceChoice[] = [
    {
        id: 1,
        question: "Khi học cách làm điều gì mới, con thích:",
        optionA: { label: "Xem video hướng dẫn", type: "visual", icon: Eye },
        optionB: { label: "Nghe ai đó giải thích", type: "auditory", icon: Ear }
    },
    {
        id: 2,
        question: "Khi nhớ một câu chuyện, con thường:",
        optionA: { label: "Nhớ hình ảnh/cảnh trong câu chuyện", type: "visual", icon: Eye },
        optionB: { label: "Nhớ lời thoại/âm thanh", type: "auditory", icon: Ear }
    },
    {
        id: 3,
        question: "Khi chờ đợi, con thích:",
        optionA: { label: "Xem tranh/hình ảnh", type: "visual", icon: Eye },
        optionB: { label: "Nghe nhạc/podcast", type: "auditory", icon: Ear }
    },
    {
        id: 4,
        question: "Khi ai đó đưa chỉ dẫn, con dễ hiểu hơn nếu:",
        optionA: { label: "Họ vẽ/chỉ trên hình", type: "visual", icon: Eye },
        optionB: { label: "Họ nói từng bước rõ ràng", type: "auditory", icon: Ear }
    },
    {
        id: 5,
        question: "Game con thích nhất thường là:",
        optionA: { label: "Game nhiều hình ảnh đẹp", type: "visual", icon: Eye },
        optionB: { label: "Game có nhạc/âm thanh hay", type: "auditory", icon: Ear }
    }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const GrowthAssessment = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Assessment State
    const [phase, setPhase] = useState<AssessmentPhase>("intro");
    const [childName, setChildName] = useState("");
    const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

    // Metrics collection
    const [metrics, setMetrics] = useState<GameMetrics>({
        pattern_accuracy: 0,
        pattern_avg_time_ms: 0,
        pattern_total_trials: 0,
        reaction_accuracy: 0,
        reaction_avg_time_ms: 0,
        impulse_errors: 0,
        attention_consistency: 0,
        visual_preference_score: 0,
        auditory_preference_score: 0,
        interaction_intensity: 50
    });

    // Task 1: Pattern Recognition
    const [patternLevel, setPatternLevel] = useState(1);
    const [patternGrid, setPatternGrid] = useState<PatternCell[][]>([]);
    const [patternOptions, setPatternOptions] = useState<PatternCell[]>([]);
    const [patternCorrectAnswer, setPatternCorrectAnswer] = useState(0);
    const [patternTrials, setPatternTrials] = useState<{ correct: boolean; time: number }[]>([]);
    const patternStartTime = useRef<number>(0);

    // Task 2: Reaction
    const [reactionState, setReactionState] = useState<"waiting" | "ready" | "target" | "clicked">("waiting");
    const [reactionTargetVisible, setReactionTargetVisible] = useState(false);
    const [reactionResults, setReactionResults] = useState<{ time: number; correct: boolean }[]>([]);
    const [reactionRound, setReactionRound] = useState(0);
    const [reactionTargetShape, setReactionTargetShape] = useState<"circle" | "square">("circle");
    const reactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reactionStartTime = useRef<number>(0);
    const REACTION_ROUNDS = 10;

    // Task 3: Preference
    const [preferenceIndex, setPreferenceIndex] = useState(0);
    const [preferenceChoices, setPreferenceChoices] = useState<("visual" | "auditory")[]>([]);

    // Mouse movement tracking for interaction_intensity
    const mouseMoves = useRef<number>(0);

    useEffect(() => {
        const handleMouseMove = () => {
            mouseMoves.current += 1;
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // =========================================================================
    // TASK 1: PATTERN RECOGNITION (Simplified Raven's Matrices)
    // =========================================================================

    const generatePatternPuzzle = useCallback((level: number) => {
        // Generate a 3x3 grid with a pattern, last cell is missing
        const grid: PatternCell[][] = [];
        const baseShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        const baseColor = PATTERN_COLORS[Math.floor(Math.random() * PATTERN_COLORS.length)];

        // Simple patterns for children:
        // Level 1: Same shape, same color everywhere, find the missing one
        // Level 2: Shape changes per row
        // Level 3: Color changes per column

        for (let row = 0; row < 3; row++) {
            const gridRow: PatternCell[] = [];
            for (let col = 0; col < 3; col++) {
                const id = row * 3 + col;

                // Last cell is the question mark
                if (row === 2 && col === 2) {
                    gridRow.push({
                        id,
                        shape: "circle", // placeholder
                        color: "#e2e8f0",
                        filled: false // This is the missing piece
                    });
                } else {
                    let shape: "circle" | "square" | "triangle" = baseShape;
                    let color = baseColor;

                    if (level >= 2) {
                        // Different shape per row
                        shape = SHAPES[row % SHAPES.length];
                    }
                    if (level >= 3) {
                        // Different color per column
                        color = PATTERN_COLORS[col % PATTERN_COLORS.length];
                    }

                    gridRow.push({
                        id,
                        shape,
                        color,
                        filled: true
                    });
                }
            }
            grid.push(gridRow);
        }

        // Generate answer options (one correct + 3 distractors)
        const correctAnswer: PatternCell = {
            id: 8,
            shape: level >= 2 ? SHAPES[2 % SHAPES.length] : baseShape,
            color: level >= 3 ? PATTERN_COLORS[2 % PATTERN_COLORS.length] : baseColor,
            filled: true
        };

        const distractors: PatternCell[] = SHAPES.filter(s => s !== correctAnswer.shape)
            .slice(0, 2)
            .map((shape, i) => ({
                id: 9 + i,
                shape,
                color: PATTERN_COLORS[(i + 1) % PATTERN_COLORS.length],
                filled: true
            }));

        // Add one more distractor with correct shape but wrong color
        distractors.push({
            id: 12,
            shape: correctAnswer.shape,
            color: PATTERN_COLORS.find(c => c !== correctAnswer.color) || PATTERN_COLORS[0],
            filled: true
        });

        const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);
        const correctIndex = options.findIndex(o =>
            o.shape === correctAnswer.shape && o.color === correctAnswer.color
        );

        setPatternGrid(grid);
        setPatternOptions(options);
        setPatternCorrectAnswer(correctIndex);
        patternStartTime.current = Date.now();
    }, []);

    const handlePatternAnswer = (selectedIndex: number) => {
        const time = Date.now() - patternStartTime.current;
        const correct = selectedIndex === patternCorrectAnswer;

        setPatternTrials(prev => [...prev, { correct, time }]);

        if (patternLevel < 5) {
            // Next level
            setPatternLevel(prev => prev + 1);
            generatePatternPuzzle(patternLevel + 1);
        } else {
            // Calculate metrics and move to next task
            const correctTrials = patternTrials.filter(t => t.correct).length + (correct ? 1 : 0);
            const avgTime = patternTrials.reduce((sum, t) => sum + t.time, time) / (patternTrials.length + 1);

            setMetrics(prev => ({
                ...prev,
                pattern_accuracy: (correctTrials / 5) * 100,
                pattern_avg_time_ms: avgTime,
                pattern_total_trials: 5
            }));

            setPhase("task2");
        }
    };

    // Start Task 1
    useEffect(() => {
        if (phase === "task1") {
            generatePatternPuzzle(1);
        }
    }, [phase, generatePatternPuzzle]);

    // =========================================================================
    // TASK 2: REACTION/FOCUS TEST
    // =========================================================================

    const startReactionRound = useCallback(() => {
        setReactionState("waiting");
        setReactionTargetVisible(false);

        // Random delay before showing target (1-3 seconds)
        const delay = 1000 + Math.random() * 2000;

        reactionTimer.current = setTimeout(() => {
            // 70% chance target, 30% chance distractor
            const isTarget = Math.random() > 0.3;
            setReactionTargetShape(isTarget ? "circle" : "square");
            setReactionTargetVisible(true);
            setReactionState("ready");
            reactionStartTime.current = Date.now();

            // Auto-fail if no click within 2 seconds
            reactionTimer.current = setTimeout(() => {
                if (reactionState === "ready") {
                    handleReactionClick(true); // Timeout
                }
            }, 2000);
        }, delay);
    }, [reactionState]);

    const handleReactionClick = (isTimeout = false) => {
        if (reactionTimer.current) {
            clearTimeout(reactionTimer.current);
        }

        const time = isTimeout ? 2000 : Date.now() - reactionStartTime.current;
        const wasTarget = reactionTargetShape === "circle";
        const correct = !isTimeout && wasTarget;
        const wasImpulseError = !isTimeout && !wasTarget; // Clicked on distractor

        if (wasImpulseError) {
            setMetrics(prev => ({
                ...prev,
                impulse_errors: prev.impulse_errors + 1
            }));
        }

        setReactionResults(prev => [...prev, { time, correct }]);
        setReactionState("clicked");
        setReactionTargetVisible(false);

        setTimeout(() => {
            if (reactionRound < REACTION_ROUNDS - 1) {
                setReactionRound(prev => prev + 1);
                startReactionRound();
            } else {
                // Calculate reaction metrics
                const validResults = reactionResults.filter(r => r.correct);
                const avgTime = validResults.length > 0
                    ? validResults.reduce((sum, r) => sum + r.time, 0) / validResults.length
                    : 1000;

                // Calculate consistency (lower variance = higher consistency)
                const times = validResults.map(r => r.time);
                const variance = times.length > 1
                    ? times.reduce((sum, t) => sum + Math.pow(t - avgTime, 2), 0) / times.length
                    : 0;
                const consistency = Math.max(0, 100 - (variance / 100));

                setMetrics(prev => ({
                    ...prev,
                    reaction_accuracy: (validResults.length / REACTION_ROUNDS) * 100,
                    reaction_avg_time_ms: avgTime,
                    attention_consistency: consistency
                }));

                setPhase("task3");
            }
        }, 800);
    };

    useEffect(() => {
        if (phase === "task2" && reactionRound === 0) {
            setTimeout(() => startReactionRound(), 1000);
        }
    }, [phase, reactionRound, startReactionRound]);

    // Cleanup reaction timers
    useEffect(() => {
        return () => {
            if (reactionTimer.current) {
                clearTimeout(reactionTimer.current);
            }
        };
    }, []);

    // =========================================================================
    // TASK 3: PREFERENCE (This or That)
    // =========================================================================

    const handlePreferenceChoice = (choice: "visual" | "auditory") => {
        const newChoices = [...preferenceChoices, choice];
        setPreferenceChoices(newChoices);

        if (preferenceIndex < PREFERENCE_QUESTIONS.length - 1) {
            setPreferenceIndex(prev => prev + 1);
        } else {
            // Calculate preference scores
            const visualCount = newChoices.filter(c => c === "visual").length;
            const auditoryCount = newChoices.filter(c => c === "auditory").length;

            // Calculate interaction intensity from mouse movements
            const intensity = Math.min(100, (mouseMoves.current / 100) * 50 + 25);

            setMetrics(prev => ({
                ...prev,
                visual_preference_score: (visualCount / PREFERENCE_QUESTIONS.length) * 100,
                auditory_preference_score: (auditoryCount / PREFERENCE_QUESTIONS.length) * 100,
                interaction_intensity: intensity
            }));

            setPhase("complete");
        }
    };

    // =========================================================================
    // SAVE & COMPLETE
    // =========================================================================

    const saveAssessmentAndNavigate = async () => {
        if (!user) {
            toast.error("Vui lòng đăng nhập để lưu kết quả");
            return;
        }

        try {
            // Save to cognitive_assessments table
            const { data, error } = await supabase
                .from("cognitive_assessments")
                .insert({
                    user_id: user.id,
                    child_name: childName || "Con",
                    session_started_at: sessionStartTime?.toISOString() || new Date().toISOString(),
                    session_completed_at: new Date().toISOString(),
                    pattern_accuracy: metrics.pattern_accuracy,
                    pattern_avg_time_ms: metrics.pattern_avg_time_ms,
                    pattern_total_trials: metrics.pattern_total_trials,
                    reaction_accuracy: metrics.reaction_accuracy,
                    reaction_avg_time_ms: metrics.reaction_avg_time_ms,
                    impulse_errors: metrics.impulse_errors,
                    attention_consistency: metrics.attention_consistency,
                    visual_preference_score: metrics.visual_preference_score,
                    auditory_preference_score: metrics.auditory_preference_score,
                    interaction_intensity: metrics.interaction_intensity,
                    raw_telemetry: {
                        pattern_trials: patternTrials,
                        reaction_results: reactionResults,
                        preference_choices: preferenceChoices
                    }
                })
                .select("id")
                .single();

            if (error) throw error;

            // Navigate to Growth Profile with assessment ID
            navigate(`/growth/profile?assessment=${data.id}`);

        } catch (err) {
            console.error("Failed to save assessment:", err);
            toast.error("Không thể lưu kết quả. Vui lòng thử lại.");
        }
    };

    // =========================================================================
    // RENDER FUNCTIONS
    // =========================================================================

    const renderShape = (cell: PatternCell, size: number = 40) => {
        const style = {
            width: size,
            height: size,
            backgroundColor: cell.filled ? cell.color : "transparent",
            border: cell.filled ? "none" : "3px dashed #94a3b8"
        };

        switch (cell.shape) {
            case "circle":
                return <div style={{ ...style, borderRadius: "50%" }} />;
            case "square":
                return <div style={{ ...style, borderRadius: 4 }} />;
            case "triangle":
                return (
                    <div
                        style={{
                            width: 0,
                            height: 0,
                            borderLeft: `${size / 2}px solid transparent`,
                            borderRight: `${size / 2}px solid transparent`,
                            borderBottom: `${size}px solid ${cell.filled ? cell.color : "#94a3b8"}`
                        }}
                    />
                );
        }
    };

    const getProgressPercent = () => {
        switch (phase) {
            case "intro": return 0;
            case "task1": return (patternLevel / 5) * 33;
            case "task2": return 33 + (reactionRound / REACTION_ROUNDS) * 33;
            case "task3": return 66 + ((preferenceIndex + 1) / PREFERENCE_QUESTIONS.length) * 34;
            case "complete": return 100;
        }
    };

    // =========================================================================
    // MAIN RENDER
    // =========================================================================

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            {/* Header with Progress */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b">
                <div className="max-w-2xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-primary-500" />
                            <span className="font-medium text-sm">Đánh giá xu hướng phát triển</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            {phase === "task1" && `Trò chơi 1/3`}
                            {phase === "task2" && `Trò chơi 2/3`}
                            {phase === "task3" && `Trò chơi 3/3`}
                            {phase === "complete" && `Hoàn thành!`}
                        </Badge>
                    </div>
                    <Progress value={getProgressPercent()} className="h-2" />
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8">
                <AnimatePresence mode="wait">

                    {/* ============= INTRO SCREEN ============= */}
                    {phase === "intro" && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <motion.div
                                    className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 mx-auto mb-6 shadow-xl"
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                >
                                    <Brain className="w-12 h-12 text-white" />
                                </motion.div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    Khám phá Điểm mạnh
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300">
                                    3 trò chơi ngắn giúp tìm ra cách học phù hợp nhất với con
                                </p>
                            </div>

                            <Card className="border-primary-200 dark:border-primary-800">
                                <CardContent className="pt-6 space-y-4">
                                    {/* Game previews */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-4 p-4 rounded-xl bg-violet-50 dark:bg-violet-950/30">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-violet-500 flex items-center justify-center">
                                                <Shapes className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Trò 1: Tìm quy luật</p>
                                                <p className="text-sm text-gray-500">Tìm mảnh còn thiếu trong bức tranh</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center">
                                                <Target className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Trò 2: Phản xạ nhanh</p>
                                                <p className="text-sm text-gray-500">Chạm khi thấy hình tròn xuất hiện</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
                                                <Zap className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Trò 3: Chọn điều con thích</p>
                                                <p className="text-sm text-gray-500">Không có đúng sai, chỉ có sở thích!</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Child name input */}
                                    <div className="pt-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Tên con (không bắt buộc)
                                        </label>
                                        <input
                                            type="text"
                                            value={childName}
                                            onChange={(e) => setChildName(e.target.value)}
                                            placeholder="Ví dụ: Minh"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>

                                    <Button
                                        onClick={() => {
                                            setSessionStartTime(new Date());
                                            setPhase("task1");
                                        }}
                                        className="w-full h-14 text-lg bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                                    >
                                        <Play className="w-5 h-5 mr-2" />
                                        Bắt đầu khám phá
                                    </Button>

                                    <p className="text-xs text-center text-gray-500">
                                        Thời gian: khoảng 5-7 phút
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* ============= TASK 1: PATTERN ============= */}
                    {phase === "task1" && (
                        <motion.div
                            key="task1"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <Badge className="mb-2 bg-violet-500">Trò chơi 1</Badge>
                                <h2 className="text-2xl font-bold">Tìm mảnh còn thiếu</h2>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Quan sát quy luật và chọn đáp án đúng
                                </p>
                            </div>

                            {/* Pattern Grid */}
                            <Card className="overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-3 gap-3 max-w-[200px] mx-auto mb-8">
                                        {patternGrid.flat().map((cell) => (
                                            <motion.div
                                                key={cell.id}
                                                className={cn(
                                                    "aspect-square rounded-lg flex items-center justify-center",
                                                    cell.filled
                                                        ? "bg-gray-100 dark:bg-gray-800"
                                                        : "bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600"
                                                )}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: cell.id * 0.05 }}
                                            >
                                                {cell.filled ? (
                                                    renderShape(cell, 36)
                                                ) : (
                                                    <span className="text-2xl text-gray-400">?</span>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Answer Options */}
                                    <p className="text-center text-sm text-gray-500 mb-4">
                                        Chọn mảnh phù hợp:
                                    </p>
                                    <div className="grid grid-cols-4 gap-3 max-w-[280px] mx-auto">
                                        {patternOptions.map((option, idx) => (
                                            <motion.button
                                                key={option.id}
                                                onClick={() => handlePatternAnswer(idx)}
                                                className="aspect-square rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:shadow-lg transition-all flex items-center justify-center"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 + idx * 0.1 }}
                                            >
                                                {renderShape(option, 32)}
                                            </motion.button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-center">
                                <Badge variant="outline" className="text-sm">
                                    Câu {patternLevel}/5
                                </Badge>
                            </div>
                        </motion.div>
                    )}

                    {/* ============= TASK 2: REACTION ============= */}
                    {phase === "task2" && (
                        <motion.div
                            key="task2"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <Badge className="mb-2 bg-teal-500">Trò chơi 2</Badge>
                                <h2 className="text-2xl font-bold">Phản xạ nhanh</h2>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Chạm vào <span className="text-teal-500 font-bold">HÌNH TRÒN</span> khi nó xuất hiện
                                </p>
                                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                                    ⚠️ Không chạm hình vuông!
                                </p>
                            </div>

                            <Card className="overflow-hidden">
                                <CardContent className="p-6">
                                    {/* Target area */}
                                    <motion.div
                                        className={cn(
                                            "relative w-48 h-48 mx-auto rounded-2xl flex items-center justify-center transition-colors duration-300",
                                            reactionState === "waiting" && "bg-gray-100 dark:bg-gray-800",
                                            reactionState === "ready" && "bg-teal-50 dark:bg-teal-950/30",
                                            reactionState === "clicked" && reactionResults[reactionResults.length - 1]?.correct
                                                ? "bg-emerald-100 dark:bg-emerald-950/30"
                                                : reactionState === "clicked"
                                                    ? "bg-amber-100 dark:bg-amber-950/30"
                                                    : ""
                                        )}
                                        onClick={() => {
                                            if (reactionState === "ready" && reactionTargetVisible) {
                                                handleReactionClick();
                                            }
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <AnimatePresence>
                                            {reactionTargetVisible && (
                                                <motion.div
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0, opacity: 0 }}
                                                    className={cn(
                                                        "w-24 h-24 cursor-pointer",
                                                        reactionTargetShape === "circle"
                                                            ? "rounded-full bg-teal-500"
                                                            : "rounded-lg bg-red-400"
                                                    )}
                                                />
                                            )}
                                        </AnimatePresence>

                                        {reactionState === "waiting" && !reactionTargetVisible && (
                                            <motion.div
                                                animate={{ opacity: [0.5, 1, 0.5] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                                className="text-gray-400"
                                            >
                                                <Target className="w-16 h-16" />
                                            </motion.div>
                                        )}

                                        {reactionState === "clicked" && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute inset-0 flex items-center justify-center"
                                            >
                                                {reactionResults[reactionResults.length - 1]?.correct ? (
                                                    <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                                                ) : (
                                                    <span className="text-4xl">🙈</span>
                                                )}
                                            </motion.div>
                                        )}
                                    </motion.div>

                                    {/* Instructions */}
                                    <div className="mt-6 text-center">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {reactionState === "waiting" && "Chuẩn bị..."}
                                            {reactionState === "ready" && reactionTargetShape === "circle" && "CHẠM NGAY!"}
                                            {reactionState === "ready" && reactionTargetShape === "square" && "Đừng chạm!"}
                                            {reactionState === "clicked" && reactionResults[reactionResults.length - 1]?.correct && (
                                                <span className="text-emerald-500 font-bold">
                                                    Tuyệt vời! {reactionResults[reactionResults.length - 1]?.time}ms
                                                </span>
                                            )}
                                            {reactionState === "clicked" && !reactionResults[reactionResults.length - 1]?.correct && (
                                                <span className="text-amber-500">Không sao, tiếp tục thôi!</span>
                                            )}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-center">
                                <Badge variant="outline" className="text-sm">
                                    Lượt {reactionRound + 1}/{REACTION_ROUNDS}
                                </Badge>
                            </div>
                        </motion.div>
                    )}

                    {/* ============= TASK 3: PREFERENCE ============= */}
                    {phase === "task3" && (
                        <motion.div
                            key="task3"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <Badge className="mb-2 bg-amber-500">Trò chơi 3</Badge>
                                <h2 className="text-2xl font-bold">Con thích gì hơn?</h2>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Không có đúng sai - chỉ có sở thích của con!
                                </p>
                            </div>

                            <Card>
                                <CardContent className="p-6">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={preferenceIndex}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="space-y-6"
                                        >
                                            <p className="text-center text-lg font-medium">
                                                {PREFERENCE_QUESTIONS[preferenceIndex].question}
                                            </p>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {/* Option A - Visual */}
                                                <motion.button
                                                    onClick={() => handlePreferenceChoice("visual")}
                                                    className="p-6 rounded-2xl border-2 border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 hover:border-violet-500 hover:shadow-lg transition-all text-left"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center">
                                                            <Eye className="w-5 h-5 text-white" />
                                                        </div>
                                                        <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
                                                            Nhìn / Xem
                                                        </span>
                                                    </div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {PREFERENCE_QUESTIONS[preferenceIndex].optionA.label}
                                                    </p>
                                                </motion.button>

                                                {/* Option B - Auditory */}
                                                <motion.button
                                                    onClick={() => handlePreferenceChoice("auditory")}
                                                    className="p-6 rounded-2xl border-2 border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/30 hover:border-teal-500 hover:shadow-lg transition-all text-left"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
                                                            <Ear className="w-5 h-5 text-white" />
                                                        </div>
                                                        <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
                                                            Nghe / Nói
                                                        </span>
                                                    </div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {PREFERENCE_QUESTIONS[preferenceIndex].optionB.label}
                                                    </p>
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </CardContent>
                            </Card>

                            <div className="flex justify-center">
                                <Badge variant="outline" className="text-sm">
                                    Câu {preferenceIndex + 1}/{PREFERENCE_QUESTIONS.length}
                                </Badge>
                            </div>
                        </motion.div>
                    )}

                    {/* ============= COMPLETE ============= */}
                    {phase === "complete" && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6 text-center"
                        >
                            <motion.div
                                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 mx-auto shadow-xl"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <Sparkles className="w-12 h-12 text-white" />
                            </motion.div>

                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    Tuyệt vời! 🎉
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {childName ? `${childName} đã hoàn thành` : "Con đã hoàn thành"} bài khám phá xu hướng
                                </p>
                            </div>

                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    {/* Quick stats preview */}
                                    <div className="grid grid-cols-2 gap-4 text-left">
                                        <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-950/30">
                                            <p className="text-sm text-gray-500">Nhận diện mẫu</p>
                                            <p className="text-2xl font-bold text-violet-600">
                                                {Math.round(metrics.pattern_accuracy)}%
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30">
                                            <p className="text-sm text-gray-500">Phản xạ TB</p>
                                            <p className="text-2xl font-bold text-teal-600">
                                                {Math.round(metrics.reaction_avg_time_ms)}ms
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t">
                                        <p className="text-xs text-gray-500 italic">
                                            "Kết quả này là xu hướng tham khảo để xây dựng kế hoạch giáo dục,
                                            không thay thế chẩn đoán y khoa."
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Button
                                onClick={saveAssessmentAndNavigate}
                                className="w-full h-14 text-lg bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                            >
                                Xem Hồ sơ Phát triển
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
};

export default GrowthAssessment;
