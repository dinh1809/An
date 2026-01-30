/**
 * Priority Badge Component
 * Visual indicator for task/mission priority levels
 */

import { cn } from '@/lib/utils';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

export type Priority = 'urgent' | 'medium' | 'low';

interface PriorityBadgeProps {
    readonly priority: Priority;
    readonly showIcon?: boolean;
}

const priorityConfig: Record<Priority, { label: string; className: string; icon: typeof AlertCircle }> = {
    urgent: {
        label: 'Khẩn cấp',
        className: 'bg-[#FFEBEE] text-[#D32F2F] border-[#D32F2F]',
        icon: AlertCircle,
    },
    medium: {
        label: 'Trung bình',
        className: 'bg-[#FFF3E0] text-[#F57C00] border-[#F57C00]',
        icon: Clock,
    },
    low: {
        label: 'Thấp',
        className: 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]',
        icon: CheckCircle,
    },
};

export function PriorityBadge({ priority, showIcon = true }: PriorityBadgeProps) {
    const config = priorityConfig[priority];
    const Icon = config.icon;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
                config.className
            )}
        >
            {showIcon && <Icon size={12} />}
            {config.label}
        </span>
    );
}
