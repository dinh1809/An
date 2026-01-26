/**
 * Unified Dashboard - Main Page
 * Following design_rule.md and react:components skill
 * 
 * Design Philosophy: "One screen, one question, one action"
 * Answers: 1) How is my child doing? 2) What should I do next? 3) Who can help?
 */

import React from 'react';
import { ParentLayout } from '@/components/layout/ParentLayout';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { MoodSelector } from '@/components/dashboard/MoodSelector';
import { ActionCard } from '@/components/dashboard/ActionCard';
import { useDashboard } from '@/hooks/useDashboard';
import { mockActionCards, mockTherapist, emergencyContact } from '@/data/dashboardData';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone, MessageCircle } from 'lucide-react';

export default function UnifiedDashboard() {
    const { metrics, loading, updateMood } = useDashboard();

    if (loading) {
        return (
            <ParentLayout>
                <div className="space-y-8">
                    <Skeleton className="h-12 w-64" />
                    <Skeleton className="h-64 w-full rounded-xl" />
                    <div className="grid md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-40 rounded-xl" />
                        ))}
                    </div>
                </div>
            </ParentLayout>
        );
    }

    const completionPercentage = metrics
        ? Math.round((metrics.completedExercises / metrics.totalExercises) * 100)
        : 0;

    return (
        <ParentLayout>
            <div className="max-w-[900px] mx-auto space-y-8">

                {/* HERO SECTION - "Today's Snapshot" */}
                <section className="space-y-6">
                    <div>
                        <h1 className="text-[32px] font-bold text-[#1F2937] leading-[40px]">
                            Chào buổi sáng! 👋
                        </h1>
                        <p className="text-base text-[#4B5563] mt-2">
                            Đây là tiến độ hôm nay của bé
                        </p>
                    </div>

                    {/* Primary Metric Card */}
                    <div className="bg-white rounded-xl p-8 border border-[#E5E7EB]">
                        <div className="flex flex-col items-center">
                            <ProgressRing
                                completed={metrics?.completedExercises || 0}
                                total={metrics?.totalExercises || 10}
                                size={200}
                                strokeWidth={12}
                            />

                            <div className="mt-6 text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#B2DFDB] rounded-full">
                                    <span className="text-sm font-medium text-[#00695C]">
                                        {completionPercentage}% hoàn thành
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mood Indicator */}
                    <div className="bg-white rounded-xl p-6 border border-[#E5E7EB]">
                        <h2 className="text-xl font-medium text-[#1F2937] mb-4 text-center">
                            Tâm trạng hôm nay
                        </h2>
                        <MoodSelector
                            currentMood={metrics?.currentMood || 'neutral'}
                            onMoodChange={updateMood}
                        />
                    </div>
                </section>

                {/* ACTION SECTION - "What's Next?" */}
                <section className="space-y-4">
                    <h2 className="text-xl font-medium text-[#1F2937]">
                        Hành động tiếp theo
                    </h2>

                    <div className="grid md:grid-cols-3 gap-4">
                        {mockActionCards.map(card => (
                            <ActionCard key={card.id} card={card} />
                        ))}
                    </div>
                </section>

                {/* SUPPORT SECTION - "Your Care Team" */}
                <section className="space-y-4">
                    <h2 className="text-xl font-medium text-[#1F2937]">
                        Kết nối nhanh
                    </h2>

                    {/* Therapist Card */}
                    <div className="bg-white rounded-xl p-6 border border-[#E5E7EB] hover:border-[#00695C] transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-[#B2DFDB] flex items-center justify-center">
                                    <span className="text-2xl font-bold text-[#00695C]">
                                        {mockTherapist.name.charAt(0)}
                                    </span>
                                </div>
                                {mockTherapist.isOnline && (
                                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#2E7D32] rounded-full border-2 border-white" />
                                )}
                            </div>

                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-[#1F2937]">
                                    {mockTherapist.name}
                                </h3>
                                <p className="text-sm text-[#4B5563] mb-2">
                                    {mockTherapist.credentials}
                                </p>
                                <p className="text-sm text-[#4B5563] italic">
                                    "{mockTherapist.lastMessage}"
                                </p>
                                <p className="text-xs text-[#4B5563] mt-1">
                                    {mockTherapist.lastMessageTime}
                                </p>
                            </div>

                            <button className="px-4 py-2 border border-[#00695C] text-[#00695C] rounded-lg hover:bg-[#00695C] hover:text-white transition-colors flex items-center gap-2">
                                <MessageCircle size={20} />
                                <span className="text-sm font-medium">Nhắn tin</span>
                            </button>
                        </div>
                    </div>

                    {/* Emergency Resources */}
                    <div className="bg-[#FEF2F2] rounded-xl p-6 border border-[#FCA5A5]">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-[#D32F2F] mb-1">
                                    Hỗ trợ khẩn cấp
                                </h3>
                                <p className="text-sm text-[#4B5563]">
                                    {emergencyContact.description}
                                </p>
                                <p className="text-2xl font-bold text-[#D32F2F] mt-2">
                                    {emergencyContact.hotline}
                                </p>
                            </div>
                            <button className="px-6 py-3 bg-[#D32F2F] text-white rounded-lg hover:bg-[#B71C1C] transition-colors flex items-center gap-2">
                                <Phone size={20} />
                                <span className="font-medium">Gọi ngay</span>
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        </ParentLayout>
    );
}
