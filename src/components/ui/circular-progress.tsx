import { cn } from "@/lib/utils";

interface CircularProgressProps {
    value: number;
    size?: number;
    strokeWidth?: number;
    className?: string;
}

export function CircularProgress({
    value,
    size = 40,
    strokeWidth = 4,
    className,
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    // Determine color based on value
    const getColor = (val: number) => {
        if (val >= 80) return "text-emerald-500";
        if (val >= 60) return "text-blue-500";
        if (val >= 40) return "text-yellow-500";
        return "text-slate-400"; // Low score
    };

    return (
        <div className={cn("relative inline-flex items-center justify-center", className)}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-90"
            >
                {/* Background Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-muted/20"
                />
                {/* Progress Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={cn("transition-all duration-1000 ease-out", getColor(value))}
                />
            </svg>
            {/* Percentage Text */}
            <span className="absolute text-xs font-bold text-foreground">
                {Math.round(value)}%
            </span>
        </div>
    );
}
