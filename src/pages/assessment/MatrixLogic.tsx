import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MatrixUI } from "@/components/ui_templates/MatrixUI";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

// Types
type Shape = "square" | "circle" | "triangle" | "star" | "diamond" | "cross";
type Color = "red" | "blue" | "green" | "yellow" | "purple" | "orange";

interface MatrixItem {
    id: string;
    shape: Shape;
    color: Color;
    count: number;
}

interface MatrixProblem {
    grid: (MatrixItem | null)[]; // 3x3 grid, one null (missing)
    options: MatrixItem[];
    correctOptionIndex: number;
    logicDescription: string;
}

export default function MatrixLogic() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();

    // State
    const [phase, setPhase] = useState<"intro" | "playing" | "completed">("intro");
    const [currentRound, setCurrentRound] = useState(1);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [problem, setProblem] = useState<MatrixProblem | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);

    // Stats
    const [startTime, setStartTime] = useState<number>(0);
    const [telemetry, setTelemetry] = useState<any[]>([]);

    const TOTAL_ROUNDS = 10;

    // Generate Problem
    const generateProblem = (round: number): MatrixProblem => {
        // Logic 1: Row Consistency (Shape same in row)
        // Logic 2: Column Consistency (Color same in col)
        // Logic 3: Progression (Count increases 1,2,3)

        // MVP: Simple Row Consistency (Shape) + Col Consistency (Color)
        const shapes: Shape[] = ["square", "circle", "triangle", "star", "diamond", "cross"];
        const colors: Color[] = ["red", "blue", "green", "yellow", "purple", "orange"];

        // Randomize row shapes
        const rowShapes = [
            shapes[Math.floor(Math.random() * shapes.length)],
            shapes[Math.floor(Math.random() * shapes.length)],
            shapes[Math.floor(Math.random() * shapes.length)]
        ];

        // Randomize col colors
        const colColors = [
            colors[Math.floor(Math.random() * colors.length)],
            colors[Math.floor(Math.random() * colors.length)],
            colors[Math.floor(Math.random() * colors.length)]
        ];

        const grid: (MatrixItem | null)[] = [];

        // Fill grid 3x3
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                grid.push({
                    id: `${r}-${c}`,
                    shape: rowShapes[r],
                    color: colColors[c],
                    count: 1
                });
            }
        }

        // Remove last item (bottom-right)
        const correctItem = grid[8]!;
        grid[8] = null;

        // Generate Options (5 distractors + 1 correct)
        const options: MatrixItem[] = [];
        const correctIndex = Math.floor(Math.random() * 6);

        for (let i = 0; i < 6; i++) {
            if (i === correctIndex) {
                options.push(correctItem);
            } else {
                // Distractor: Wrong shape OR Wrong color
                const isWrongShape = Math.random() > 0.5;
                options.push({
                    id: `opt-${i}`,
                    shape: isWrongShape ? shapes.find(s => s !== correctItem.shape)! : correctItem.shape,
                    color: !isWrongShape ? colors.find(c => c !== correctItem.color)! : correctItem.color,
                    count: 1
                });
            }
        }

        return {
            grid,
            options,
            correctOptionIndex: correctIndex,
            logicDescription: "Row=Shape, Col=Color"
        };
    };

    // Start Game
    const handleStart = async () => {
        if (authLoading) return;

        if (!user) {
            console.warn("User not logged in, using mock session");
            const mockId = "mock-session-" + Date.now();
            setSessionId(mockId);
            setPhase("playing");
            setCorrectCount(0);
            setScore(0);
            setCurrentRound(1);
            setTelemetry([]);
            loadRound(1);
            return;
        }

        try {
            // Create Session
            const { data: session, error } = await supabase
                .from("game_sessions")
                .insert({
                    user_id: user.id,
                    game_type: "matrix_logic",
                    started_at: new Date().toISOString()
                })
                .select("id")
                .maybeSingle();

            if (error) {
                console.error("Session create failed", error);
                const mockId = "mock-session-" + Date.now();
                setSessionId(mockId);
            } else if (session) {
                setSessionId(session.id);
            } else {
                setSessionId("mock-session-" + Date.now());
            }

            setPhase("playing");
            setCorrectCount(0);
            setScore(0);
            setCurrentRound(1);
            setTelemetry([]);
            loadRound(1);
        } catch (e) {
            console.error("Exception in handleStart:", e);
            setSessionId("mock-session-" + Date.now());
            setPhase("playing");
            loadRound(1);
        }
    };

    const loadRound = (round: number) => {
        setProblem(generateProblem(round));
        setStartTime(Date.now());
    };

    const handleOptionSelect = async (index: number) => {
        if (!problem) return;

        const reactionTime = Date.now() - startTime;
        const isCorrect = index === problem.correctOptionIndex;

        // Log Telemetry
        setTelemetry(prev => [...prev, {
            round: currentRound,
            reaction_time_ms: reactionTime,
            is_correct: isCorrect,
            logic_type: problem.logicDescription
        }]);

        if (isCorrect) {
            setCorrectCount(prev => prev + 1);
            setScore(prev => prev + 100 + Math.max(0, 1000 - reactionTime)); // Speed bonus
        }

        // Next round or Finish
        if (currentRound >= TOTAL_ROUNDS) {
            finishGame();
        } else {
            setCurrentRound(prev => prev + 1);
            loadRound(currentRound + 1);
        }
    };

    const finishGame = async () => {
        if (!sessionId || sessionId.startsWith("mock-session")) {
            setPhase("completed");
            return;
        }

        const finalAccuracy = (correctCount / TOTAL_ROUNDS) * 100;

        // Neuro-Logic Advanced Metrics
        const avgReactionTime = telemetry.reduce((sum, t) => sum + t.reaction_time_ms, 0) / telemetry.length;

        const advancedMetrics = {
            pattern_recognition_score: Math.round(finalAccuracy), // Raw accuracy for now
            reasoning_speed_ms: Math.round(avgReactionTime),
            neuro_trait: "Fluid Intelligence"
        };

        await supabase.from("game_sessions").update({
            completed_at: new Date().toISOString(),
            final_score: score,
            accuracy_percentage: finalAccuracy,
            difficulty_level_reached: 1, // MVP
            advanced_metrics: advancedMetrics as any,
            telemetry: telemetry as any
        }).eq("id", sessionId);

        setPhase("completed");
    };

    return (
        <MatrixUI
            phase={phase}
            currentRound={currentRound}
            totalRounds={TOTAL_ROUNDS}
            score={score}
            accuracy={Math.round((correctCount / Math.max(1, currentRound - 1)) * 100)} // Show current moving avg
            onStart={handleStart}
            onBack={() => navigate("/assessment")}
        >
            {problem && (
                <div className="flex flex-col gap-8">
                    {/* Grid */}
                    <div className="grid grid-cols-3 gap-2 w-64 h-64 mx-auto bg-slate-800 p-2 rounded-xl">
                        {problem.grid.map((item, idx) => (
                            <div key={idx} className="bg-slate-700/50 rounded-lg flex items-center justify-center border border-slate-600/30">
                                {item ? (
                                    <div className={`w-8 h-8 rounded-full ${getColorClass(item.color)} ${getShapeClass(item.shape)}`} />
                                ) : (
                                    <div className="text-2xl font-bold text-teal-500/50">?</div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-3 gap-4">
                        {problem.options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(idx)}
                                className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl flex items-center justify-center transition-all border border-slate-700 hover:border-teal-500/50"
                            >
                                <div className={`w-8 h-8 rounded-full ${getColorClass(opt.color)} ${getShapeClass(opt.shape)}`} />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </MatrixUI>
    );
}

// Helpers
function getColorClass(c: Color) {
    const map = {
        red: "bg-red-500",
        blue: "bg-blue-500",
        green: "bg-green-500",
        yellow: "bg-yellow-500",
        purple: "bg-purple-500",
        orange: "bg-orange-500"
    };
    return map[c];
}

function getShapeClass(s: Shape) {
    // CSS shapes
    if (s === "square") return "rounded-none";
    if (s === "circle") return "rounded-full";
    if (s === "triangle") return "clip-triangle"; // Need custom class
    return "rounded-md";
}
