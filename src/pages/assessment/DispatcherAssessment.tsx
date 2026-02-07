import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, Terminal, Hash, ChevronRight, AlertTriangle, Trash2, CheckCircle2, RotateCcw, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useGameSoundContext } from "@/hooks/useGameSound";
import { GameLayout, GameFooter } from "@/components/game";

// ----------------------------------------------------------------------
// TYPES & CONFIG
// ----------------------------------------------------------------------
type Phase = "intro" | "memorize" | "input" | "feedback" | "completed";

// Level Config
const LEVELS = [
    { level: 1, length: 3, type: "numeric", time: 2000, title: "Intern" },
    { level: 2, length: 5, type: "alphanumeric", time: 2500, title: "Junior" },
    { level: 3, length: 7, type: "mixed", time: 3000, title: "Senior" },
    { level: 4, length: 9, type: "mixed", time: 2200, title: "Master" },
];

const DispatcherAssessment = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const location = useLocation();
    const { playSound, triggerHaptic } = useGameSoundContext();
    const sessionIdRef = useRef<string | null>(null);
    const timeoutsRef = useRef<number[]>([]);

    useEffect(() => {
        return () => {
            timeoutsRef.current.forEach(clearTimeout);
        };
    }, []);

    // --------------------------------------------------------------------
    // STATE
    // --------------------------------------------------------------------
    const [phase, setPhase] = useState<Phase>("intro");
    const [level, setLevel] = useState(1);
    const [currentCode, setCurrentCode] = useState("");
    const [inputCode, setInputCode] = useState("");
    const [result, setResult] = useState<"authorized" | "denied" | null>(null);

    // Metrics
    const [maxSpan, setMaxSpan] = useState(0);
    const [totalErrors, setTotalErrors] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [reactionBusiness, setReactionBusiness] = useState<number[]>([]); // Store reaction times
    const [levelResults, setLevelResults] = useState<{ level: number, status: 'pass' | 'fail' }[]>([]);
    const [telemetry, setTelemetry] = useState<any[]>([]);

    // --------------------------------------------------------------------
    // LOGIC
    // --------------------------------------------------------------------
    const generateCode = useCallback((lvl: number) => {
        const length = LEVELS[lvl - 1].length;
        const type = LEVELS[lvl - 1].type;
        let chars = "0123456789";
        if (type === "alphanumeric") chars += "ABCDEFGHJKLMNPQRSTUVWXYZ"; // No I, O to avoid confusion
        if (type === "mixed") chars += "#@&";

        let result = "";
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }, []);

    const createSession = async () => {
        if (!user) {
            console.warn("User not logged in, using mock session");
            sessionIdRef.current = "mock-session-" + Date.now();
            return;
        }

        try {
            const { data, error } = await supabase.from("game_sessions").insert({
                user_id: user.id,
                game_type: "dispatcher_console",
                started_at: new Date().toISOString()
            }).select("id").maybeSingle();

            if (error) {
                console.error("Failed to create session:", error);
                sessionIdRef.current = "mock-session-" + Date.now();
            } else if (data) {
                sessionIdRef.current = data.id;
            } else {
                sessionIdRef.current = "mock-session-" + Date.now();
            }
        } catch (e) {
            console.error("Exception in createSession:", e);
            sessionIdRef.current = "mock-session-" + Date.now();
        }
    };

    const startLevel = useCallback(async (lvl: number) => {
        setLevel(lvl);
        setInputCode("");
        setResult(null);
        const code = generateCode(lvl);
        setCurrentCode(code);

        setPhase("memorize");

        const displayTime = LEVELS[lvl - 1].time;
        playTone(800, 0.1, "square"); // Beep

        const timeout = setTimeout(() => {
            setPhase("input");
            setStartTime(Date.now());
        }, displayTime);
        timeoutsRef.current.push(timeout as unknown as number);
    }, [generateCode]);

    const handleInput = (char: string) => {
        if (phase !== "input") return;

        // Beep
        if (char !== "DEL") playTone(1200, 0.05, "sawtooth");
        triggerHaptic(30);

        // Log telemetry
        setTelemetry(prev => [...prev, {
            timestamp: Date.now(),
            char,
            level
        }]);

        if (char === "DEL") {
            setInputCode(prev => prev.slice(0, -1));
            return;
        }

        if (char === "ENTER") {
            verifyCode();
            return;
        }

        if (inputCode.length < currentCode.length) {
            setInputCode(prev => prev + char);
        }
    };

    const verifyCode = () => {
        setPhase("feedback");
        const responseTime = Date.now() - startTime;
        setReactionBusiness(prev => [...prev, responseTime]);

        if (inputCode === currentCode) {
            // Success
            setResult("authorized");
            setLevelResults(prev => [...prev, { level, status: 'pass' }]);
            playTone(600, 0.1, "sine"); // Success chord logic

            const beepTimeout = setTimeout(() => playTone(800, 0.1, "sine"), 100);
            timeoutsRef.current.push(beepTimeout as unknown as number);

            setMaxSpan(currentCode.length);

            const nextLevelTimeout = setTimeout(() => {
                if (level < 4) {
                    startLevel(level + 1);
                } else {
                    finishGame();
                }
            }, 1500);
            timeoutsRef.current.push(nextLevelTimeout as unknown as number);
        } else {
            // Fail
            setResult("denied");
            setLevelResults(prev => [...prev, { level, status: 'fail' }]);
            setTotalErrors(prev => prev + 1);
            playTone(150, 0.4, "sawtooth"); // Error buzz

            const finishTimeout = setTimeout(() => {
                // Retry same level but new code? Or Game Over?
                // For now, strict game over on fail to emulate high stakes
                finishGame();
            }, 2000);
            timeoutsRef.current.push(finishTimeout as unknown as number);
        }
    };

    const finishGame = async () => {
        setPhase("completed");
        if (!sessionIdRef.current) return;

        // Skip DB update for mock sessions
        if (sessionIdRef.current.startsWith("mock-session")) return;

        if (!user) return;

        const avgTime = reactionBusiness.reduce((a, b) => a + b, 0) / reactionBusiness.length || 0;

        // Neuro-Logic Metrics
        // Typing Speed (CPM)
        // We can estimate from telemetry or avgTime per char.
        // Approx: Avg time includes wait? No, responseTime = Input Start to Verify.
        // So chars / (time/1000/60)
        // Let's use avg response time per level length to estimate.

        const advancedMetrics = {
            max_span: maxSpan,
            total_errors: totalErrors,
            avg_response_time_ms: Math.round(avgTime),
            neuro_trait: "Verbal Working Memory"
        };

        const metrics = {
            max_span: maxSpan,
            total_errors: totalErrors,
            avg_response_time: avgTime,
            highest_level: level
        };

        await supabase.from("game_sessions").update({
            completed_at: new Date().toISOString(),
            final_score: maxSpan * 10,
            difficulty_level_reached: level,
            metrics: metrics,
            advanced_metrics: advancedMetrics as any,
            telemetry: telemetry as any
        }).eq("id", sessionIdRef.current);

        const query = new URLSearchParams(window.location.search);
        const mode = query.get('mode');

        if (mode === 'campaign') {
            const prevScores = location.state?.previousScores || [];
            navigate(`/assessment/result`, {
                state: {
                    score: maxSpan * 10,
                    type: 'dispatcher_console',
                    metrics: metrics,
                    previousScores: [...prevScores, { type: 'dispatcher_console', score: maxSpan * 10, metrics: metrics }],
                    isCampaign: true
                }
            });
        } else {
            navigate(`/assessment/result?session=${sessionIdRef.current}`, {
                state: { score: maxSpan * 10, type: 'dispatcher_console', metrics: metrics }
            });
        }
    };

    const handleStart = async () => {
        await createSession();
        startLevel(1);
    };

    // Simple Audio Helper (Duplicated from useAudioSynth for simplicity/self-containment or could reuse hook)
    // Let's use standard AudioContext manually for the harsh "beep" sounds suited for this theme.
    const audioCtx = useRef<AudioContext | null>(null);
    const playTone = (freq: number, dur: number, type: OscillatorType) => {
        if (!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioCtx.current.state === "suspended") audioCtx.current.resume();

        const osc = audioCtx.current.createOscillator();
        const gain = audioCtx.current.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(audioCtx.current.destination);
        osc.start();
        osc.stop(audioCtx.current.currentTime + dur);
    };

    // --------------------------------------------------------------------
    // RENDER HELPERS
    // --------------------------------------------------------------------

    // Custom Keypad
    const renderKeypad = () => {
        const levelConfig = LEVELS[level - 1];
        const isAlphanumeric = levelConfig.type !== "numeric";

        // Numeric Grid
        const numKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "CLR", "0", "DEL"];

        // Alpha Grid (Simplified QWERTY subset or relevant chars)
        // For "Alphanumeric", we need letters.
        // To save space on mobile, maybe just show the chars that MIGHT appear? No, that gives it away.
        // Let's show a full pseudo-keyboard for Alpha levels.
        // Actually, distinct rows: Numbers Top, QWERTY below.
        const alphaKeys = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");

        return (
            <div className="w-full max-w-md mx-auto mt-4 px-2">
                {/* If simple numeric level */}
                {levelConfig.type === "numeric" ? (
                    <div className="grid grid-cols-3 gap-3">
                        {numKeys.map(k => (
                            <Button
                                key={k}
                                onClick={() => k === "CLR" ? setInputCode("") : handleInput(k)}
                                className={cn(
                                    "h-16 text-xl font-mono font-bold border-amber-500/30 text-amber-500 bg-black hover:bg-amber-900/20 active:bg-amber-500 active:text-black",
                                    k === "DEL" && "text-red-500 border-red-500/30"
                                )}
                                variant="outline"
                            >
                                {k}
                            </Button>
                        ))}
                        <Button
                            className="col-span-3 h-16 mt-2 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xl tracking-widest"
                            onClick={() => handleInput("ENTER")}
                        >
                            TRANSMIT
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {/* Compact Number Row */}
                        <div className="flex gap-1 justify-center">
                            {"1234567890".split("").map(n => (
                                <button key={n} onClick={() => handleInput(n)} className="w-8 h-10 border border-amber-900/50 text-amber-500 bg-black active:bg-amber-500 active:text-black font-mono rounded">
                                    {n}
                                </button>
                            ))}
                        </div>
                        {/* Alphas */}
                        <div className="flex flex-wrap gap-1 justify-center px-1">
                            {alphaKeys.map(char => (
                                <button key={char} onClick={() => handleInput(char)} className="w-8 h-12 border border-amber-900/50 text-amber-500 bg-black active:bg-amber-500 active:text-black font-mono rounded">
                                    {char}
                                </button>
                            ))}
                        </div>
                        {/* Special Chars if Mixed */}
                        {levelConfig.type === "mixed" && (
                            <div className="flex gap-2 justify-center mt-2">
                                {"#@&".split("").map(s => (
                                    <button key={s} onClick={() => handleInput(s)} className="w-12 h-10 border border-amber-500 text-amber-400 bg-slate-900 active:bg-amber-500 active:text-black font-bold">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <Button variant="outline" className="text-red-500 border-red-900 hover:bg-red-950" onClick={() => handleInput("DEL")}>
                                <Trash2 className="w-4 h-4 mr-2" /> DELETE
                            </Button>
                            <Button className="bg-amber-600 hover:bg-amber-500 text-black font-bold" onClick={() => handleInput("ENTER")}>
                                SEND
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        )
    };

    return (
        <GameLayout className="bg-slate-950 text-amber-500 font-mono overflow-hidden relative selection:bg-amber-500 selection:text-black">
            {/* CRT Scanline Overlay */}
            <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20" />
            <div className="pointer-events-none fixed inset-0 z-40 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent animate-scan" style={{ backgroundSize: '100% 8px' }} />

            <div className="flex-1 flex flex-col items-center justify-center p-4">

                {/* HEADER */}
                <div className="w-full max-w-lg mb-8 flex justify-between items-end border-b-2 border-amber-900/50 pb-2">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <Radio className={cn("w-5 h-5", phase === "memorize" && "animate-pulse")} />
                            DISPATCH_CONSOLE_V4
                        </h1>
                        <p className="text-xs text-amber-700">SECURE CHANNEL // ENCRYPTED</p>
                    </div>
                    <div className="text-right">
                        <Badge variant="outline" className="border-amber-500 text-amber-500 font-mono rounded-none px-2">
                            OP_LEVEL: {LEVELS[level - 1]?.title.toUpperCase()}
                        </Badge>
                    </div>
                </div>

                {/* MAIN DISPLAY */}
                <div className="w-full max-w-lg relative z-20">
                    {phase === "intro" ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-2 border-amber-900 bg-black/80 p-6 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                            <Terminal className="w-12 h-12 mb-4 text-amber-600" />
                            <h2 className="text-lg font-bold mb-4">INCOMING TRANSMISSION...</h2>
                            <ul className="text-sm space-y-2 mb-8 text-amber-600">
                                <li className="flex gap-2">&gt; <span className="text-amber-400">MEMORIZE</span> the signal code.</li>
                                <li className="flex gap-2">&gt; <span className="text-amber-400">WAIT</span> for signal loss.</li>
                                <li className="flex gap-2">&gt; <span className="text-amber-400">RE-ENTER</span> data to verify.</li>
                            </ul>
                            <Button
                                onClick={handleStart}
                                disabled={authLoading}
                                className="w-full h-12 bg-amber-600 hover:bg-amber-500 text-black font-bold font-mono tracking-wider rounded-none"
                            >
                                {authLoading ? "SYNCHRONIZING..." : "INITIATE SEQUENCE"}
                            </Button>
                        </motion.div>
                    ) : phase === "completed" ? (
                        <div className="text-center border-2 border-amber-500 p-8 bg-amber-950/20">
                            <h2 className="text-2xl font-bold mb-2">SEQUENCE TERMINATED</h2>
                            <p className="text-amber-400 text-xl mb-6">
                                PASSED: {levelResults.filter(r => r.status === 'pass').length} / {LEVELS.length}
                            </p>
                            <Button onClick={() => navigate('/assessment')} variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-900/50 rounded-none">
                                RETURN TO HUB
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* THE SCREEN */}
                            <div className={cn(
                                "h-32 mb-6 border-4 border-slate-800 bg-black flex items-center justify-center relative overflow-hidden transition-all duration-300",
                                result === "authorized" && "border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]",
                                result === "denied" && "border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.4)]"
                            )}>
                                {/* NOISE OVERLAY */}
                                {phase === "input" && (
                                    <div className="absolute inset-0 opacity-10 bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] bg-cover mix-blend-screen pointer-events-none" />
                                )}

                                {phase === "memorize" && (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 1.5, opacity: 0 }}
                                        className="text-4xl md:text-5xl font-black tracking-[0.5em] text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]"
                                    >
                                        {currentCode}
                                    </motion.div>
                                )}

                                {phase === "input" && (
                                    <div className="text-3xl md:text-4xl tracking-[0.3em] text-amber-300/80 animate-pulse">
                                        {inputCode}<span className="animate-blink">_</span>
                                    </div>
                                )}

                                {phase === "feedback" && (
                                    <motion.div
                                        initial={{ scale: 0.9 }}
                                        animate={{ scale: 1 }}
                                        className={cn("text-2xl font-bold tracking-widest px-4 py-2 border-2",
                                            result === "authorized" ? "text-amber-400 border-amber-400" : "text-red-500 border-red-500"
                                        )}
                                    >
                                        {result === "authorized" ? "AUTHORIZED" : "ACCESS DENIED"}
                                    </motion.div>
                                )}
                            </div>

                            {/* VIRTUAL KEYPAD (Visible only in Input phase for better focus, or always enabled but inactive?) */}
                            {/* Always visible to prevent layout shift, but disabled logic handled in click */}
                            <div className={cn("transition-opacity duration-300", phase === "memorize" ? "opacity-30 grayscale pointer-events-none" : "opacity-100")}>
                                {renderKeypad()}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <GameFooter />
        </GameLayout>
    );
};

export default DispatcherAssessment;
