import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
    readonly days: number;
    readonly className?: string;
}

export function StreakCounter({ days, className }: StreakCounterProps) {
    return (
        <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 bg-[#FFF3E0] rounded-full border border-[#F57C00]",
            className
        )}>
            <Flame size={20} className="text-[#F57C00]" fill="#F57C00" />
            <span className="text-sm font-bold text-[#F57C00]">
                {days} ngày liên tục
            </span>
        </div>
    );
}
