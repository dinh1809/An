/**
 * Daily Quest Card Component
 * Gamified task card for parent daily missions
 */

import { LucideIcon, Lock, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyQuestCardProps {
    readonly title: string;
    readonly description: string;
    readonly duration: number;
    readonly status: 'pending' | 'completed' | 'locked';
    readonly emoji: string;
    readonly onAction: () => void;
}

const statusConfig = {
    pending: {
        buttonClass: 'bg-[#00695C] text-white hover:bg-[#004D40]',
        buttonLabel: 'Bắt đầu',
        icon: Clock,
        iconClass: 'text-[#F57C00]',
    },
    completed: {
        buttonClass: 'bg-[#E8F5E9] text-[#2E7D32] cursor-default',
        buttonLabel: 'Đã xong',
        icon: CheckCircle,
        iconClass: 'text-[#2E7D32]',
    },
    locked: {
        buttonClass: 'bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed',
        buttonLabel: 'Chưa khả dụng',
        icon: Lock,
        iconClass: 'text-[#9CA3AF]',
    },
};

export function DailyQuestCard({
    title,
    description,
    duration,
    status,
    emoji,
    onAction,
}: DailyQuestCardProps) {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <div
            className={cn(
                'bg-white rounded-xl p-6 border border-[#E5E7EB] transition-all',
                status === 'pending' && 'hover:border-[#00695C] hover:shadow-sm'
            )}
        >
            {/* Emoji Icon */}
            <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{emoji}</div>
                <div className="flex-1">
                    <h3 className="text-lg font-medium text-[#1F2937] mb-1">{title}</h3>
                    <p className="text-sm text-[#4B5563]">{description}</p>
                </div>
            </div>

            {/* Duration Badge */}
            <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-[#4B5563]" />
                <span className="text-sm text-[#4B5563]">⏱ {duration} phút</span>
            </div>

            {/* Action Button */}
            <button
                onClick={() => status !== 'locked' && status !== 'completed' && onAction()}
                disabled={status === 'locked' || status === 'completed'}
                className={cn(
                    'w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2',
                    config.buttonClass
                )}
            >
                <Icon size={18} />
                {config.buttonLabel}
            </button>
        </div>
    );
}
