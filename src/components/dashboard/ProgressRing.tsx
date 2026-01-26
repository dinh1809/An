/**
 * Progress Ring Component
 * Following design_rule.md - Visual hierarchy and emotional design
 */

import React from 'react';

interface ProgressRingProps {
    readonly completed: number;
    readonly total: number;
    readonly size?: number;
    readonly strokeWidth?: number;
}

export function ProgressRing({
    completed,
    total,
    size = 200,
    strokeWidth = 12
}: ProgressRingProps) {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#E5E7EB"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#00695C"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-[#1F2937]">
                    {completed}
                </span>
                <span className="text-sm text-[#4B5563]">
                    out of {total}
                </span>
                <span className="text-xs text-[#4B5563] mt-1">
                    exercises completed
                </span>
            </div>
        </div>
    );
}
