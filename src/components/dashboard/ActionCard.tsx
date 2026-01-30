/**
 * Action Card Component
 * Following design_rule.md - One primary action, clear hierarchy
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, MessageSquare, Calendar, LucideIcon } from 'lucide-react';
import type { ActionCard as ActionCardType } from '@/data/dashboardData';

interface ActionCardProps {
    readonly card: ActionCardType;
}

const iconMap: Record<string, LucideIcon> = {
    'clipboard-list': ClipboardList,
    'message-square': MessageSquare,
    'calendar': Calendar,
};

export function ActionCard({ card }: ActionCardProps) {
    const navigate = useNavigate();
    const Icon = iconMap[card.icon] || ClipboardList;
    const isPrimary = card.priority === 'primary';

    return (
        <button
            onClick={() => navigate(card.action)}
            className={`
        flex flex-col items-start p-6 rounded-xl
        transition-all duration-200
        hover:scale-[1.02] hover:border-[#00695C]
        ${isPrimary
                    ? 'bg-[#00695C] text-white border-2 border-[#00695C]'
                    : 'bg-white border border-[#E5E7EB]'
                }
      `}
            style={{ minHeight: '160px', minWidth: '280px' }}
        >
            <div className={`
        p-3 rounded-lg mb-4
        ${isPrimary ? 'bg-white/20' : 'bg-[#B2DFDB]'}
      `}>
                <Icon
                    size={32}
                    strokeWidth={2}
                    className={isPrimary ? 'text-white' : 'text-[#00695C]'}
                />
            </div>

            <h3 className={`
        text-lg font-medium mb-2
        ${isPrimary ? 'text-white' : 'text-[#1F2937]'}
      `}>
                {card.title}
            </h3>

            <p className={`
        text-sm mb-4 flex-1
        ${isPrimary ? 'text-white/90' : 'text-[#4B5563]'}
      `}>
                {card.description}
            </p>

            <div className={`
        px-3 py-1 rounded-full text-xs font-medium
        ${isPrimary ? 'bg-white/20 text-white' : 'bg-[#F9FAFB] text-[#4B5563]'}
      `}>
                {card.timeEstimate}
            </div>
        </button>
    );
}
