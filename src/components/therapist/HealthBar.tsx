/**
 * Health Bar Component
 * Visual indicator for "Caseload Health" metric
 * Shows percentage-based health with color coding
 */

import { cn } from '@/lib/utils';

interface HealthBarProps {
    readonly value: number; // 0-100
    readonly label?: string;
    readonly showPercentage?: boolean;
}

function getHealthColor(value: number): { bar: string; text: string; bg: string } {
    if (value >= 80) {
        return {
            bar: 'bg-[#2E7D32]',
            text: 'text-[#2E7D32]',
            bg: 'bg-[#E8F5E9]',
        };
    } else if (value >= 50) {
        return {
            bar: 'bg-[#F57C00]',
            text: 'text-[#F57C00]',
            bg: 'bg-[#FFF3E0]',
        };
    } else {
        return {
            bar: 'bg-[#D32F2F]',
            text: 'text-[#D32F2F]',
            bg: 'bg-[#FFEBEE]',
        };
    }
}

export function HealthBar({ value, label = 'Caseload Health', showPercentage = true }: HealthBarProps) {
    const colors = getHealthColor(value);
    const clampedValue = Math.min(100, Math.max(0, value));

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#1F2937]">{label}</span>
                {showPercentage && (
                    <span className={cn('text-sm font-bold', colors.text)}>
                        {clampedValue}%
                    </span>
                )}
            </div>

            <div className={cn('w-full h-2 rounded-full overflow-hidden', colors.bg)}>
                <div
                    className={cn('h-full rounded-full transition-all duration-500', colors.bar)}
                    style={{ width: `${clampedValue}%` }}
                />
            </div>
        </div>
    );
}
