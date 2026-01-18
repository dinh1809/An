import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";

interface PianoKeyProps {
    note: string;
    isBlack?: boolean;
    isActive: boolean; // System playing
    isPressed?: boolean; // User pressing
    status?: "correct" | "wrong" | null; // Feedback status
    onClick: () => void;
    disabled?: boolean;
    className?: string; // Allow custom sizing/positioning
    style?: React.CSSProperties; // Allow inline positioning (left/width)
}

export const PianoKey = ({
    note,
    isBlack = false,
    isActive,
    isPressed,
    status,
    onClick,
    disabled,
    className,
    style
}: PianoKeyProps) => {
    const controls = useAnimation();

    useEffect(() => {
        if (isActive || isPressed) {
            controls.start({
                scale: 0.95,
                y: 2,
                transition: { duration: 0.1 }
            });
        } else {
            controls.start({
                scale: 1,
                y: 0,
                transition: { duration: 0.1 }
            });
        }
    }, [isActive, isPressed, controls]);

    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            animate={controls}
            // Combine base classes with custom className
            className={cn(
                "relative flex items-end justify-center pb-2 select-none touch-manipulation transition-colors duration-100",

                // --- BASE STYLING (Can be overridden by className) ---
                "rounded-b-md shadow-sm border",

                // --- COLORS: BASE ---
                isBlack
                    ? "bg-slate-900 border-slate-700 text-slate-500 z-10"
                    : "bg-white border-slate-300 text-slate-400 z-0",

                // --- COLORS: ACTIVE / FEEDBACK ---

                // System Playing (Teal)
                isActive && (isBlack ? "bg-teal-600 border-teal-500" : "bg-teal-100 border-teal-300"),

                // User Correct (Lime)
                status === "correct" && (isBlack ? "bg-lime-600 border-lime-500" : "bg-lime-100 border-lime-300"),

                // User Wrong (Amber - Warning)
                status === "wrong" && (isBlack ? "bg-amber-600 border-amber-500" : "bg-amber-100 border-amber-300"),

                // Disabled State
                disabled && "cursor-not-allowed opacity-90",

                // Hover State (only if enabled and not active)
                !disabled && !isActive && !status && "hover:brightness-95 active:brightness-90",

                // Custom class applied LAST
                className
            )}
            style={style}
        >
            <span className={cn("mb-2 font-mono opacity-50 text-[10px] md:text-xs", isBlack && "text-white/50")}>
                {note}
            </span>
        </motion.button>
    );
};
