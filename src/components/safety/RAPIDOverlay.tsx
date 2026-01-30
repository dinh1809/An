import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X } from 'lucide-react';

const RAPIDOverlay = () => {
    const [isActive, setIsActive] = useState(false);
    const [mousePositions, setMousePositions] = useState<{ x: number, y: number, t: number }[]>([]);

    // SOS Trigger
    const triggerSOS = () => setIsActive(true);
    const disableSOS = () => setIsActive(false);

    // Jitter Detection Logic
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isActive) return;

        const now = Date.now();
        const pos = { x: e.clientX, y: e.clientY, t: now };

        setMousePositions(prev => {
            // Keep last 1 second of data
            const recent = [...prev, pos].filter(p => now - p.t < 1000);

            // Analyze jitter if enough points
            if (recent.length > 20) {
                let jitter = 0;
                for (let i = 1; i < recent.length; i++) {
                    const dx = Math.abs(recent[i].x - recent[i - 1].x);
                    const dy = Math.abs(recent[i].y - recent[i - 1].y);
                    // Add sharp turns/erratic movements Logic
                    jitter += (dx + dy);
                }

                // Threshold for panic (arbitrary for demo)
                // If moving too fast/erratically
                if (jitter > 8000) {
                    // console.log("High Jitter detected!", jitter);
                    triggerSOS(); // Uncomment to enable auto-trigger
                }
            }
            return recent;
        });
    }, [isActive]);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove]);

    return (
        <>
            {/* SOS Trigger Button (Always Visible) */}
            <button
                onClick={triggerSOS}
                className="fixed bottom-6 right-6 z-[9999] bg-rose-500 hover:bg-rose-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center group"
                aria-label="SOS Protocol"
            >
                <ShieldAlert className="w-6 h-6" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap group-hover:ml-2">
                    SOS Protocol
                </span>
            </button>

            {/* Full Screen Safety Overlay */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] bg-black/95 flex flex-col items-center justify-center text-center p-4"
                    >
                        {/* 4-7-8 Breathing Animation */}
                        <div className="relative mb-12">
                            {/* Outer Circle (Breath Indicator) */}
                            <motion.div
                                className="w-64 h-64 rounded-full bg-cyan-500/20"
                                animate={{
                                    scale: [1, 1.5, 1.5, 1], // Inhale (4s), Hold (7s), Exhale (8s) - Speeded up for UX
                                }}
                                transition={{
                                    duration: 19, // 4+7+8
                                    times: [0, 0.2, 0.55, 1],
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />

                            {/* Inner Circle */}
                            <motion.div
                                className="absolute inset-0 m-auto w-32 h-32 rounded-full bg-cyan-400 blur-xl"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                            />

                            <div className="absolute inset-0 flex items-center justify-center text-cyan-200 font-mono text-xl tracking-widest">
                                BREATHE
                            </div>
                        </div>

                        <p className="text-slate-400 font-mono mb-8 max-w-md">
                            System paused. Signal detected. Focus on the circle.
                        </p>

                        <button
                            onClick={disableSOS}
                            className="text-slate-600 hover:text-white transition-colors flex items-center gap-2 mt-8 text-sm"
                        >
                            <X className="w-4 h-4" />
                            I am calm now
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default RAPIDOverlay;
