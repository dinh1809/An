/**
 * Family Hub - Daily Quest Dashboard for Parents
 * Route: /parent/hub
 */

import { MasterTopbar } from '@/components/layout/MasterTopbar';
import { DailyQuestCard } from '@/components/parent/DailyQuestCard';
import { StreakCounter } from '@/components/parent/StreakCounter';
import {
    mockChildProgress,
    mockDailyQuests,
    mockParentActivities,
} from '@/data/parentMockData';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function FamilyHub() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleQuestAction = (questId: string) => {
        const quest = mockDailyQuests.find((q) => q.id === questId);

        if (quest?.type === 'exercise') {
            navigate(`/parent/exercise/${questId}`);
        } else {
            toast({
                title: 'Coming Soon',
                description: 'Tính năng này đang được phát triển',
            });
        }
    };

    // Mock weekly data for chart
    const weeklyData = [
        { day: 'T2', completed: 4 },
        { day: 'T3', completed: 5 },
        { day: 'T4', completed: 3 },
        { day: 'T5', completed: 6 },
        { day: 'T6', completed: 5 },
        { day: 'T7', completed: 4 },
        { day: 'CN', completed: 3 },
    ];

    return (
        <div className="min-h-screen">
            <MasterTopbar
                title={`Gia đình bé ${mockChildProgress.childName}`}
                showSearch={false}
                rightContent={<StreakCounter days={mockChildProgress.streakDays} />}
            />

            <div className="pt-24 px-8 pb-8 space-y-6">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-[#00695C] to-[#004D40] rounded-xl p-8 text-white">
                    <h2 className="text-2xl font-bold mb-2">Chào mẹ Tâm! 👋</h2>
                    <p className="text-lg opacity-90">
                        Tuần này bé đã hoàn thành{' '}
                        <span className="font-bold">{mockChildProgress.weeklyProgress}%</span> mục tiêu
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                        <div className="text-center">
                            <p className="text-3xl font-bold">{mockChildProgress.completedExercises}</p>
                            <p className="text-sm opacity-80">Bài tập đã xong</p>
                        </div>
                        <div className="h-12 w-px bg-white/30" />
                        <div className="text-center">
                            <p className="text-3xl font-bold">{mockChildProgress.streakDays}</p>
                            <p className="text-sm opacity-80">Ngày liên tục</p>
                        </div>
                    </div>
                </div>

                {/* Daily Quests Grid */}
                <div>
                    <h3 className="text-xl font-bold text-[#1F2937] mb-4">Nhiệm vụ hôm nay</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockDailyQuests.map((quest) => (
                            <DailyQuestCard
                                key={quest.id}
                                title={quest.title}
                                description={quest.description}
                                duration={quest.duration}
                                status={quest.status}
                                emoji={quest.icon}
                                onAction={() => handleQuestAction(quest.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Weekly Progress Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Progress Chart */}
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                        <h3 className="text-lg font-bold text-[#1F2937] mb-4">
                            Bài tập tuần này
                        </h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={weeklyData}>
                                <XAxis dataKey="day" stroke="#4B5563" />
                                <YAxis stroke="#4B5563" />
                                <Bar dataKey="completed" fill="#00695C" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                        <h3 className="text-lg font-bold text-[#1F2937] mb-4">
                            Hoạt động gần đây
                        </h3>
                        <div className="space-y-3">
                            {mockParentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-[#F3F4F6] last:border-0">
                                    <div className="h-2 w-2 rounded-full bg-[#00695C] mt-2 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm text-[#1F2937]">
                                            <span className="font-medium">{activity.actor}</span> {activity.action}
                                        </p>
                                        <p className="text-xs text-[#4B5563] mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
