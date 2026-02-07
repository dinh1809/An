/**
 * Mission Control Dashboard
 * Gamified dashboard for therapists following STITCH_PROMPTS_SPEC
 * Route: /therapist/dashboard
 */

import { MasterTopbar } from '@/components/layout/MasterTopbar';
import { MissionCard } from '@/components/therapist/MissionCard';
import { HealthBar } from '@/components/therapist/HealthBar';
import { PriorityBadge } from '@/components/therapist/PriorityBadge';
import { mockMissions, mockActivityLogs, mockPatients } from '@/data/therapistMockData';
import { Video, FileEdit, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const iconMap = {
    video_review: Video,
    plan_update: FileEdit,
    parent_meeting: Users,
    report_due: TrendingUp,
};

export default function MissionControlDashboard() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleMissionAction = (missionId: string) => {
        const mission = mockMissions.find(m => m.id === missionId);

        if (mission?.type === 'video_review') {
            navigate(`/therapist/video/${mission.patientId}`);
        } else {
            toast({
                title: 'Coming Soon',
                description: 'Tính năng này đang được phát triển',
            });
        }
    };

    // Calculate caseload health
    const totalPatients = mockPatients.length;
    const avgProgress = Math.round(
        mockPatients.reduce((sum, p) => sum + p.progressPercentage, 0) / totalPatients
    );

    return (
        <div className="min-h-screen">
            <MasterTopbar
                title="Trung tâm điều hành"
                rightContent={
                    <div className="flex items-center gap-2">
                        <HealthBar value={avgProgress} label="" showPercentage />
                    </div>
                }
            />

            <div className="pt-24 px-8 pb-8 space-y-6">
                {/* Welcome Hero Card */}
                <div className="bg-gradient-to-r from-[#00695C] to-[#004D40] rounded-xl p-8 text-white">
                    <h2 className="text-2xl font-bold mb-2">
                        Chào BS. Minh! 👋
                    </h2>
                    <p className="text-lg opacity-90">
                        Bạn có <span className="font-bold">{mockMissions.length} nhiệm vụ quan trọng</span> hôm nay
                    </p>
                </div>

                {/* Priority Missions Grid */}
                <div>
                    <h3 className="text-xl font-bold text-[#1F2937] mb-4">Nhiệm vụ ưu tiên</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockMissions.map((mission) => (
                            <MissionCard
                                key={mission.id}
                                title={mission.title}
                                description={mission.description}
                                priority={mission.priority}
                                badge={mission.badge}
                                icon={iconMap[mission.type]}
                                actionLabel={
                                    mission.type === 'video_review' ? 'Duyệt ngay' :
                                        mission.type === 'plan_update' ? 'Cập nhật' :
                                            mission.type === 'parent_meeting' ? 'Vào phòng họp' :
                                                'Xem chi tiết'
                                }
                                onAction={() => handleMissionAction(mission.id)}
                                time={mission.time}
                            />
                        ))}
                    </div>
                </div>

                {/* Team Pulse Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Activity Feed */}
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                        <h3 className="text-lg font-bold text-[#1F2937] mb-4">Hoạt động gần đây</h3>
                        <div className="space-y-3">
                            {mockActivityLogs.map((log) => (
                                <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-[#F3F4F6] last:border-0">
                                    <div className="h-2 w-2 rounded-full bg-[#00695C] mt-2 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm text-[#1F2937]">
                                            <span className="font-medium">{log.actor}</span> {log.action}{' '}
                                            {log.target && <span className="text-[#00695C]">{log.target}</span>}
                                        </p>
                                        <p className="text-xs text-[#4B5563] mt-1">{log.timestamp}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                        <h3 className="text-lg font-bold text-[#1F2937] mb-4">Tổng quan nhanh</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                                <div>
                                    <p className="text-sm text-[#4B5563]">Tổng bệnh nhân</p>
                                    <p className="text-2xl font-bold text-[#1F2937]">{totalPatients}</p>
                                </div>
                                <Users size={32} className="text-[#00695C]" />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                                <div>
                                    <p className="text-sm text-[#4B5563]">Cần duyệt video</p>
                                    <p className="text-2xl font-bold text-[#D32F2F]">3</p>
                                </div>
                                <Video size={32} className="text-[#D32F2F]" />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                                <div>
                                    <p className="text-sm text-[#4B5563]">Tiến độ trung bình</p>
                                    <p className="text-2xl font-bold text-[#2E7D32]">{avgProgress}%</p>
                                </div>
                                <TrendingUp size={32} className="text-[#2E7D32]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
