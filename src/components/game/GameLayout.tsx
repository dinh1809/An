/**
 * 🎮 GAME LAYOUT COMPONENTS
 * =========================
 * Shared UI components for all assessment games
 * 
 * Based on Stitch design system:
 * - Glassmorphism style
 * - Teal/Purple gradient accents
 * - Consistent header/footer
 */

import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Clock,
    Target,
    Zap,
    ShieldCheck,
    Trophy,
    Volume2,
    VolumeX,
    Pause,
    Play,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export interface GameLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export interface GameHeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    timer?: number; // seconds remaining
    score?: number;
    level?: number;
    maxLevel?: number;
    streak?: number;
    accuracy?: number;
    onBack?: () => void;
    onPause?: () => void;
    onMute?: () => void;
    isMuted?: boolean;
    isPaused?: boolean;
    showBackButton?: boolean;
    gradient?: string;
}

export interface GameProgressBarProps {
    current: number;
    total: number;
    label?: string;
    color?: "teal" | "purple" | "amber" | "rose";
}

export interface GameFooterProps {
    showVersion?: boolean;
}

export interface GameInstructionProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    onStart: () => void;
    buttonText?: string;
    tips?: string[];
}

export interface GameResultProps {
    score: number;
    accuracy?: number;
    avgReactionTime?: number;
    maxLevel?: number;
    onContinue: () => void;
    onRetry?: () => void;
    title?: string;
    subtitle?: string;
}

// ============================================================================
// GAME LAYOUT
// ============================================================================

export const GameLayout: React.FC<GameLayoutProps> = ({ children, className }) => {
    return (
        <div className={cn(
            "min-h-screen bg-gradient-to-br",
            "from-slate-50 via-white to-teal-50/30",
            "dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
            "flex flex-col",
            className
        )}>
            {children}
        </div>
    );
};

// ============================================================================
// GAME HEADER
// ============================================================================

export const GameHeader: React.FC<GameHeaderProps> = ({
    title,
    subtitle,
    icon,
    timer,
    score,
    level,
    maxLevel,
    streak,
    accuracy,
    onBack,
    onPause,
    onMute,
    isMuted = false,
    isPaused = false,
    showBackButton = true,
    gradient = "from-teal-500 to-purple-500"
}) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate("/assessment");
        }
    };

    // Format timer as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <header className={cn(
            "sticky top-0 z-50",
            "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl",
            "border-b border-slate-200/50 dark:border-slate-700/50"
        )}>
            <div className="max-w-4xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Left: Back + Title */}
                    <div className="flex items-center gap-3 min-w-0">
                        {showBackButton && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleBack}
                                className="shrink-0"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        )}

                        {icon && (
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                "bg-gradient-to-br", gradient,
                                "text-white shadow-lg"
                            )}>
                                {icon}
                            </div>
                        )}

                        <div className="min-w-0">
                            <h1 className="font-bold text-slate-800 dark:text-white truncate">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Center: Stats */}
                    <div className="hidden sm:flex items-center gap-3">
                        {timer !== undefined && (
                            <Badge variant="outline" className={cn(
                                "gap-1 font-mono",
                                timer <= 10 ? "border-rose-500 text-rose-500" : "border-teal-500 text-teal-600"
                            )}>
                                <Clock className="w-3 h-3" />
                                {formatTime(timer)}
                            </Badge>
                        )}

                        {score !== undefined && (
                            <Badge className="bg-teal-500 text-white gap-1">
                                <Target className="w-3 h-3" />
                                {score}
                            </Badge>
                        )}

                        {level !== undefined && (
                            <Badge variant="outline" className="gap-1 border-purple-500 text-purple-600">
                                <Zap className="w-3 h-3" />
                                Lv.{level}{maxLevel ? `/${maxLevel}` : ''}
                            </Badge>
                        )}

                        {streak !== undefined && streak > 0 && (
                            <Badge className="bg-amber-500 text-white gap-1">
                                🔥 {streak}
                            </Badge>
                        )}
                    </div>

                    {/* Right: Controls */}
                    <div className="flex items-center gap-2">
                        {onMute && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onMute}
                                className="shrink-0"
                            >
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </Button>
                        )}

                        {onPause && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onPause}
                                className="shrink-0"
                            >
                                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Mobile Stats Row */}
                <div className="flex sm:hidden items-center justify-center gap-2 mt-2 pb-1">
                    {timer !== undefined && (
                        <Badge variant="outline" className={cn(
                            "gap-1 font-mono text-xs",
                            timer <= 10 ? "border-rose-500 text-rose-500" : ""
                        )}>
                            <Clock className="w-3 h-3" />
                            {formatTime(timer)}
                        </Badge>
                    )}
                    {score !== undefined && (
                        <Badge className="bg-teal-500 text-white gap-1 text-xs">
                            {score} điểm
                        </Badge>
                    )}
                    {level !== undefined && (
                        <Badge variant="outline" className="gap-1 text-xs">
                            Lv.{level}
                        </Badge>
                    )}
                </div>
            </div>
        </header>
    );
};

// ============================================================================
// GAME PROGRESS BAR
// ============================================================================

export const GameProgressBar: React.FC<GameProgressBarProps> = ({
    current,
    total,
    label,
    color = "teal"
}) => {
    const percentage = total > 0 ? (current / total) * 100 : 0;

    const colorClasses = {
        teal: "bg-teal-500",
        purple: "bg-purple-500",
        amber: "bg-amber-500",
        rose: "bg-rose-500"
    };

    return (
        <div className="w-full px-4 py-2">
            {label && (
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{label}</span>
                    <span className="font-mono">{current}/{total}</span>
                </div>
            )}
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                    className={cn("h-full rounded-full", colorClasses[color])}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>
        </div>
    );
};

// ============================================================================
// GAME INSTRUCTION SCREEN
// ============================================================================

export const GameInstruction: React.FC<GameInstructionProps> = ({
    title,
    description,
    icon,
    onStart,
    buttonText = "Bắt Đầu",
    tips = []
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex items-center justify-center p-6"
        >
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                {icon && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30"
                    >
                        {icon}
                    </motion.div>
                )}

                {/* Title */}
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                    {title}
                </h2>

                {/* Description */}
                <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                    {description}
                </p>

                {/* Tips */}
                {tips.length > 0 && (
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 mb-6 text-left">
                        <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2">
                            💡 Mẹo:
                        </h4>
                        <ul className="space-y-1">
                            {tips.map((tip, idx) => (
                                <li key={idx} className="text-sm text-slate-500 dark:text-slate-400 flex items-start gap-2">
                                    <span className="text-teal-500 mt-1">•</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Start Button */}
                <Button
                    size="lg"
                    onClick={onStart}
                    className={cn(
                        "w-full h-14 text-lg font-semibold",
                        "bg-gradient-to-r from-teal-500 to-purple-500",
                        "hover:from-teal-600 hover:to-purple-600",
                        "text-white shadow-lg shadow-teal-500/30",
                        "transition-all duration-300 hover:scale-[1.02]"
                    )}
                >
                    <Play className="w-5 h-5 mr-2" />
                    {buttonText}
                </Button>
            </div>
        </motion.div>
    );
};

// ============================================================================
// GAME RESULT SCREEN
// ============================================================================

export const GameResult: React.FC<GameResultProps> = ({
    score,
    accuracy,
    avgReactionTime,
    maxLevel,
    onContinue,
    onRetry,
    title = "Hoàn thành!",
    subtitle = "Bạn đã hoàn thành bài đánh giá"
}) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex items-center justify-center p-6"
        >
            <div className="max-w-md w-full text-center">
                {/* Trophy Icon */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30"
                >
                    <Trophy className="w-12 h-12" />
                </motion.div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                    {title}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    {subtitle}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="text-3xl font-bold text-teal-500 mb-1">{score}</div>
                        <div className="text-xs text-slate-500">Điểm số</div>
                    </div>

                    {accuracy !== undefined && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="text-3xl font-bold text-purple-500 mb-1">{Math.round(accuracy)}%</div>
                            <div className="text-xs text-slate-500">Độ chính xác</div>
                        </div>
                    )}

                    {avgReactionTime !== undefined && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="text-3xl font-bold text-amber-500 mb-1">{Math.round(avgReactionTime)}</div>
                            <div className="text-xs text-slate-500">ms Phản xạ</div>
                        </div>
                    )}

                    {maxLevel !== undefined && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="text-3xl font-bold text-rose-500 mb-1">Lv.{maxLevel}</div>
                            <div className="text-xs text-slate-500">Cấp độ cao nhất</div>
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    {onRetry && (
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={onRetry}
                            className="flex-1"
                        >
                            Chơi lại
                        </Button>
                    )}
                    <Button
                        size="lg"
                        onClick={onContinue}
                        className={cn(
                            "flex-1",
                            "bg-gradient-to-r from-teal-500 to-purple-500",
                            "hover:from-teal-600 hover:to-purple-600",
                            "text-white"
                        )}
                    >
                        Tiếp tục
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

// ============================================================================
// GAME FOOTER
// ============================================================================

export const GameFooter: React.FC<GameFooterProps> = ({ showVersion = true }) => {
    return (
        <footer className="py-4 text-center">
            {showVersion && (
                <div className="flex items-center justify-center gap-2 text-slate-400">
                    <ShieldCheck className="w-3 h-3" />
                    <p className="text-[10px] font-mono tracking-wider">
                        AN PLATFORM • v4.0
                    </p>
                </div>
            )}
        </footer>
    );
};

// ============================================================================
// GAME AREA (Main play area with consistent styling)
// ============================================================================

export interface GameAreaProps {
    children: React.ReactNode;
    className?: string;
    centered?: boolean;
}

export const GameArea: React.FC<GameAreaProps> = ({
    children,
    className,
    centered = true
}) => {
    return (
        <main className={cn(
            "flex-1",
            centered && "flex items-center justify-center",
            "p-4 sm:p-6",
            className
        )}>
            {children}
        </main>
    );
};

// ============================================================================
// GAME CARD (For instruction cards, option cards)
// ============================================================================

export interface GameCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    selected?: boolean;
    disabled?: boolean;
    gradient?: string;
}

export const GameCard: React.FC<GameCardProps> = ({
    children,
    className,
    onClick,
    selected = false,
    disabled = false,
    gradient
}) => {
    return (
        <motion.div
            whileHover={!disabled ? { scale: 1.02 } : undefined}
            whileTap={!disabled ? { scale: 0.98 } : undefined}
            onClick={disabled ? undefined : onClick}
            className={cn(
                "rounded-2xl p-6 transition-all duration-200",
                "bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl",
                "border border-slate-200/50 dark:border-slate-700/50",
                onClick && !disabled && "cursor-pointer hover:shadow-lg",
                selected && "ring-2 ring-teal-500 border-teal-400",
                disabled && "opacity-50 cursor-not-allowed",
                gradient && `bg-gradient-to-br ${gradient}`,
                className
            )}
        >
            {children}
        </motion.div>
    );
};
