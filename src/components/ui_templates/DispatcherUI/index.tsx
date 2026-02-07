import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Radio,
    Terminal,
    Trophy,
    Play,
    ArrowRight,
    Wifi,
    WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GameLayout, GameFooter } from "@/components/game";

// ============================================================================
// TYPES
// ============================================================================
export type DispatcherPhase = "intro" | "memorize" | "input" | "feedback" | "completed";

export interface DispatcherUIProps {
    // Game State
    phase: DispatcherPhase;
    level: number;
    levelTitle: string;

    // Code Display
    currentCode: string;
    inputCode: string;

    // Feedback
    result: "authorized" | "denied" | null;

    // Stats
    passedLevels: number;
    totalLevels: number;

    // Handlers
    onStart: () => void;
    onKeyInput: (key: string) => void;
    onExit: () => void;

    // Children (Custom Keypad - Optional)
    children?: ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================
export const DispatcherUI = ({
    phase,
    level,
    levelTitle,
    currentCode,
    inputCode,
    result,
    passedLevels,
    totalLevels,
    onStart,
    onKeyInput,
    onExit,
    children,
}: DispatcherUIProps) => {
    return (
        <GameLayout className="bg-slate-950 text-amber-500 font-mono overflow-hidden relative selection:bg-amber-500 selection:text-black">
            {/* CRT Scanline Overlay */}
            <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20" />
            <div className="pointer-events-none fixed inset-0 z-40 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent animate-scan" style={{ backgroundSize: '100% 8px' }} />

            <div className="flex-1 flex flex-col items-center justify-center p-4">

                {/* Header */}
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
                            OP_LEVEL: {levelTitle.toUpperCase()}
                        </Badge>
                    </div>
                </div>

                {/* Main Display */}
                <div className="w-full max-w-lg relative z-20">
                    <AnimatePresence mode="wait">

                        {/* ============================================ */}
                        {/* INTRO SCREEN */}
                        {/* ============================================ */}
                        {phase === "intro" && (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="border-2 border-amber-900 bg-black/80 p-6 shadow-[0_0_20px_rgba(245,158,11,0.1)] rounded-xl backdrop-blur-xl"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
                                    <Terminal className="w-8 h-8 text-black" />
                                </div>

                                <h2 className="text-lg font-bold mb-4 text-center">TÍN HIỆU ĐẾN...</h2>

                                <ul className="text-sm space-y-2 mb-8 text-amber-600">
                                    <li className="flex gap-2">&gt; <span className="text-amber-400">GHI NHỚ</span> mã tín hiệu.</li>
                                    <li className="flex gap-2">&gt; <span className="text-amber-400">CHỜ</span> tín hiệu biến mất.</li>
                                    <li className="flex gap-2">&gt; <span className="text-amber-400">NHẬP LẠI</span> để xác nhận.</li>
                                </ul>

                                <Button
                                    onClick={onStart}
                                    className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold text-lg tracking-wider rounded-xl shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.02]"
                                >
                                    <Play className="w-5 h-5 mr-2" />
                                    BẮT ĐẦU ĐÁNH GIÁ
                                </Button>
                            </motion.div>
                        )}

                        {/* ============================================ */}
                        {/* COMPLETED SCREEN */}
                        {/* ============================================ */}
                        {phase === "completed" && (
                            <motion.div
                                key="completed"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center border-2 border-amber-500 p-8 bg-amber-950/20 rounded-xl"
                            >
                                <h2 className="text-2xl font-bold mb-2">SEQUENCE TERMINATED</h2>
                                <p className="text-amber-400 text-xl mb-6">
                                    PASSED: {passedLevels} / {totalLevels}
                                </p>
                                <Button
                                    onClick={onExit}
                                    variant="outline"
                                    className="border-amber-500 text-amber-500 hover:bg-amber-900/50 rounded-none"
                                >
                                    RETURN TO HUB
                                </Button>
                            </motion.div>
                        )}

                        {/* ============================================ */}
                        {/* GAMEPLAY SCREENS (memorize/input/feedback) */}
                        {/* ============================================ */}
                        {(phase === "memorize" || phase === "input" || phase === "feedback") && (
                            <motion.div
                                key="gameplay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                {/* THE SCREEN */}
                                <div className={cn(
                                    "h-32 mb-6 border-4 border-slate-800 bg-black flex items-center justify-center relative overflow-hidden transition-all duration-300 rounded-lg",
                                    result === "authorized" && "border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]",
                                    result === "denied" && "border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.4)]"
                                )}>
                                    {/* Noise Overlay for Input Phase */}
                                    {phase === "input" && (
                                        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-amber-900/20 to-transparent mix-blend-screen pointer-events-none" />
                                    )}

                                    {/* Memorize Phase - Show Code */}
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

                                    {/* Input Phase - Show User Input */}
                                    {phase === "input" && (
                                        <div className="text-3xl md:text-4xl tracking-[0.3em] text-amber-300/80 animate-pulse">
                                            {inputCode}<span className="animate-blink">_</span>
                                        </div>
                                    )}

                                    {/* Feedback Phase - Show Result */}
                                    {phase === "feedback" && (
                                        <motion.div
                                            initial={{ scale: 0.9 }}
                                            animate={{ scale: 1 }}
                                            className={cn(
                                                "text-2xl font-bold tracking-widest px-4 py-2 border-2 rounded",
                                                result === "authorized" ? "text-amber-400 border-amber-400" : "text-red-500 border-red-500"
                                            )}
                                        >
                                            {result === "authorized" ? "AUTHORIZED" : "ACCESS DENIED"}
                                        </motion.div>
                                    )}
                                </div>

                                {/* Signal Status Indicator */}
                                <div className="flex justify-center gap-4 mb-4">
                                    <div className={cn(
                                        "flex items-center gap-2 text-xs",
                                        phase === "memorize" ? "text-amber-500" : "text-slate-600"
                                    )}>
                                        <Wifi className="w-4 h-4" />
                                        RECEIVING
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-2 text-xs",
                                        phase === "input" ? "text-amber-500" : "text-slate-600"
                                    )}>
                                        <WifiOff className="w-4 h-4" />
                                        SIGNAL LOST
                                    </div>
                                </div>

                                {/* Keypad (Passed as Children or Default) */}
                                <div className={cn(
                                    "transition-opacity duration-300",
                                    phase === "memorize" ? "opacity-30 grayscale pointer-events-none" : "opacity-100"
                                )}>
                                    {children}
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>

            <GameFooter />
        </GameLayout>
    );
};

export default DispatcherUI;
