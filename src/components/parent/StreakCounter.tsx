/**
 * Streak Counter Component
 * Displays the consecutive days streak with flame emoji
 */

import { Flame } from 'lucide-react';

interface StreakCounterProps {
    readonly days: number;
}

export function StreakCounter({ days }: StreakCounterProps) {
    return (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFF3E0] rounded-full border border-[#F57C00]">
            <Flame size={20} className="text-[#F57C00]" fill="#F57C00" />
            <span className="text-sm font-bold text-[#F57C00]">
                {days} ngày liên tục
            </span>
        </div>
    );
}
