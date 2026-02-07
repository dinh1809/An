/**
 * Mood Selector Component
 * Following design_rule.md - Touch targets (64x64px) and clear labels
 */

import React from 'react';
import { Smile, Meh, Frown } from 'lucide-react';

interface MoodSelectorProps {
    readonly currentMood: 'happy' | 'neutral' | 'sad';
    readonly onMoodChange: (mood: 'happy' | 'neutral' | 'sad') => void;
}

export function MoodSelector({ currentMood, onMoodChange }: MoodSelectorProps) {
    const moods = [
        { value: 'happy' as const, label: 'Vui vẻ', icon: Smile, color: '#2E7D32' },
        { value: 'neutral' as const, label: 'Bình thường', icon: Meh, color: '#F57C00' },
        { value: 'sad' as const, label: 'Buồn', icon: Frown, color: '#D32F2F' },
    ];

    return (
        <div className="flex gap-4 justify-center">
            {moods.map(({ value, label, icon: Icon, color }) => {
                const isActive = currentMood === value;

                return (
                    <button
                        key={value}
                        onClick={() => onMoodChange(value)}
                        className={`
              flex flex-col items-center gap-2 p-3 rounded-xl
              transition-all duration-200
              ${isActive
                                ? 'bg-[#B2DFDB] scale-110'
                                : 'bg-white border border-[#E5E7EB] hover:border-[#00695C]'
                            }
            `}
                        style={{ minWidth: '64px', minHeight: '64px' }}
                        aria-label={label}
                        aria-pressed={isActive}
                    >
                        <Icon
                            size={32}
                            strokeWidth={2}
                            style={{ color: isActive ? '#00695C' : color }}
                        />
                        <span
                            className={`text-sm font-medium ${isActive ? 'text-[#00695C]' : 'text-[#4B5563]'
                                }`}
                        >
                            {label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
