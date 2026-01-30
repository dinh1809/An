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
import { TrendingUp, Flame, Calendar as CalendarIcon, Target, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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

            <div className="pb-8 space-y-6">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-br from-[#00695C] to-[#004D40] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <StreakCounter days={mockChildProgress.streakDays} className="scale-[3] origin-top-right text-white" />
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-3xl font-extrabold mb-2 tracking-tight text-white">Chào mẹ Tâm! 👋</h2>
                        <p className="text-lg text-teal-50/90 max-w-md">
                            Hôm nay bé Minh Anh đang làm rất tốt. Hãy cùng con hoàn thành nốt các nhiệm vụ nhé!
                        </p>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-bold uppercase tracking-wider text-teal-100/80">
                                    <span>Tiến độ ngày</span>
                                    <span>{mockChildProgress.weeklyProgress}%</span>
                                </div>
                                <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden border border-white/10">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-1000"
                                        style={{ width: `${mockChildProgress.weeklyProgress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 group/card hover:bg-white/15 transition-colors">
                                <div className="p-3 bg-white/20 rounded-lg group-hover/card:scale-110 transition-transform">
                                    <TrendingUp className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-white">{mockChildProgress.completedExercises}</p>
                                    <p className="text-xs font-bold uppercase tracking-tighter text-teal-100/70">Bài tập đã xong</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 group/card hover:bg-white/15 transition-colors">
                                <div className="p-3 bg-orange-400/20 rounded-lg text-orange-300 group-hover/card:scale-110 transition-transform">
                                    <Flame className="h-6 w-6 fill-orange-300" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-white">{mockChildProgress.streakDays}</p>
                                    <p className="text-xs font-bold uppercase tracking-tighter text-teal-100/70">Ngày liên tục</p>
                                </div>
                            </div>
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
