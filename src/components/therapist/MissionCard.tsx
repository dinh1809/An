/**
 * Mission Card Component
 * Gamified task card for therapist dashboard
 * Follows the "Priority Missions" design from STITCH_PROMPTS_SPEC
 */

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MissionPriority = 'urgent' | 'medium' | 'low';

interface MissionCardProps {
    readonly title: string;
    readonly description: string;
    readonly priority: MissionPriority;
    readonly badge?: string;
    readonly icon: LucideIcon;
    readonly actionLabel: string;
    readonly onAction: () => void;
    readonly time?: string;
}

const priorityStyles: Record<MissionPriority, { border: string; badge: string; button: string }> = {
    urgent: {
        border: 'border-[#D32F2F]',
        badge: 'bg-[#FFEBEE] text-[#D32F2F] border-[#D32F2F]',
        button: 'bg-[#00695C] text-white hover:bg-[#004D40]',
    },
    medium: {
        border: 'border-[#F57C00]',
        badge: 'bg-[#FFF3E0] text-[#F57C00] border-[#F57C00]',
        button: 'bg-white text-[#00695C] border border-[#00695C] hover:bg-[#E0F2F1]',
    },
    low: {
        border: 'border-[#E5E7EB]',
        badge: 'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB]',
        button: 'bg-white text-[#4B5563] border border-[#E5E7EB] hover:bg-[#F9FAFB]',
    },
};

export function MissionCard({
    title,
    description,
    priority,
    badge,
    icon: Icon,
    actionLabel,
    onAction,
    time,
}: MissionCardProps) {
    const styles = priorityStyles[priority];

    return (
        <div
            className={cn(
                'bg-white rounded-xl p-6 border-l-4 transition-all hover:shadow-sm',
                styles.border
            )}
        >
            {/* Icon + Title Row */}
            <div className="flex items-start gap-4 mb-3">
                <div className="p-3 bg-[#E0F2F1] rounded-lg">
                    <Icon size={24} className="text-[#00695C]" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-medium text-[#1F2937] mb-1">{title}</h3>
                    <p className="text-sm text-[#4B5563]">{description}</p>
                </div>
            </div>

            {/* Badge + Time */}
            <div className="flex items-center gap-2 mb-4">
                {badge && (
                    <span
                        className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium border',
                            styles.badge
                        )}
                    >
                        {badge}
                    </span>
                )}
                {time && (
                    <span className="text-xs text-[#4B5563]">
                        {time}
                    </span>
                )}
            </div>

            {/* Action Button */}
            <button
                onClick={onAction}
                className={cn(
                    'w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors',
                    styles.button
                )}
            >
                {actionLabel}
            </button>
        </div>
    );
}
