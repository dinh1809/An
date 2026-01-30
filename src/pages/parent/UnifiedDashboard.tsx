import React, { useState, useEffect } from 'react';
import { ParentLayout } from '@/components/layout/ParentLayout';
import { useDashboard } from '@/hooks/useDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import {
    CheckCircle2,
    PlayCircle,
    Video,
    Dumbbell,
    Calendar as CalendarIcon,
    MessageCircle,
    ArrowRight,
    TrendingUp,
    Clock,
    Check,
    Sparkles,
    Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function UnifiedDashboard() {
    const { user } = useAuth();
    const { metrics, loading: dashboardLoading } = useDashboard();
    const [exercises, setExercises] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchExercises = async () => {
            const { data } = await supabase
                .from('exercises')
                .select('*')
                .eq('user_id', user.id)
                .order('assigned_at', { ascending: false })
                .limit(3);

            if (data) setExercises(data);
            setLoading(false);
        };

        fetchExercises();
    }, [user]);

    if (dashboardLoading || loading) {
        return (
            <ParentLayout>
                <div className="space-y-6 animate-pulse">
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
                        <Skeleton className="h-80 rounded-2xl" />
                    </div>
                </div>
            </ParentLayout>
        );
    }

    const completedCount = metrics?.completedExercises || 0;
    const totalCount = metrics?.totalExercises || 5;
    const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    const toggleExercise = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('exercises')
            .update({ is_completed: !currentStatus })
            .eq('id', id);

        if (!error) {
            setExercises(exercises.map(ex =>
                ex.id === id ? { ...ex, is_completed: !currentStatus } : ex
            ));
        }
    };

    return (
        <ParentLayout>
            {/* Hero Progress Section */}
            <section className="mb-8">
                <div className="bg-gradient-to-r from-[#00695C] to-[#00897B] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={20} className="text-[#13ecda]" />
                                <span className="text-sm font-medium text-[#B2DFDB]">Chào mừng trở lại!</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">
                                Tiến độ hôm nay
                            </h1>
                            <p className="text-[#B2DFDB] mb-4">
                                Hoàn thành các nhiệm vụ để đạt mục tiêu ngày!
                            </p>

                            {/* Progress Bar */}
                            <div className="flex items-center gap-4">
                                <div className="flex-1 bg-white/20 rounded-full h-3">
                                    <div
                                        className="bg-[#13ecda] h-3 rounded-full transition-all duration-700"
                                        style={{ width: `${progressPercent}% ` }}
                                    ></div>
                                </div>
                                <span className="text-xl font-bold">{completedCount}/{totalCount}</span>
                            </div>
                        </div>

                        {/* Motivational Message */}
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 md:min-w-[280px]">
                            <div className="p-3 bg-[#13ecda] rounded-full">
                                <TrendingUp size={24} className="text-[#00695C]" />
                            </div>
                            <div>
                                <p className="font-bold text-lg">
                                    {progressPercent >= 100 ? "Xuất sắc!" : "Tuyệt vời!"}
                                </p>
                                <p className="text-sm text-[#B2DFDB]">
                                    {progressPercent >= 100
                                        ? "Bạn đã hoàn thành mục tiêu!"
                                        : "Bạn đang làm rất tốt!"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Tasks & Schedule */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Daily Tasks */}
                    <div className="bg-white dark:bg-[#1a2e2c] rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a403d] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#2a403d] flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#E0F2F1] dark:bg-[#13ecda]/20 rounded-lg">
                                    <CheckCircle2 size={20} className="text-[#00695C] dark:text-[#13ecda]" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Nhiệm vụ hàng ngày</h2>
                            </div>
                            <button className="text-sm font-medium text-[#00695C] dark:text-[#13ecda] hover:underline">
                                Xem tất cả →
                            </button>
                        </div>

                        <div className="divide-y divide-gray-50 dark:divide-[#2a403d]">
                            {exercises.length > 0 ? (
                                exercises.map((exercise) => (
                                    <label
                                        key={exercise.id}
                                        className={`flex items - center gap - 4 px - 6 py - 4 cursor - pointer transition - colors hover: bg - gray - 50 dark: hover: bg - [#203633] ${exercise.is_completed ? 'bg-[#E0F2F1]/50 dark:bg-[#13ecda]/5' : ''
                                            } `}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={exercise.is_completed}
                                            onChange={() => toggleExercise(exercise.id, exercise.is_completed)}
                                            className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 text-[#00695C] focus:ring-[#00695C] focus:ring-offset-0"
                                        />
                                        <div className="flex-1">
                                            <p className={`font - medium ${exercise.is_completed
                                                    ? 'text-gray-400 line-through'
                                                    : 'text-gray-900 dark:text-white'
                                                } `}>
                                                {exercise.title}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {exercise.doctor_name || '5 phút thực hành'}
                                            </p>
                                        </div>
                                        {exercise.is_completed ? (
                                            <Check size={20} className="text-[#00695C] dark:text-[#13ecda]" />
                                        ) : (
                                            <PlayCircle size={20} className="text-gray-300" />
                                        )}
                                    </label>
                                ))
                            ) : (
                                <div className="px-6 py-12 text-center">
                                    <div className="p-4 bg-gray-50 dark:bg-[#152523] rounded-full w-fit mx-auto mb-4">
                                        <CheckCircle2 size={32} className="text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400">Chưa có nhiệm vụ nào hôm nay</p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Hãy liên hệ với chuyên gia để được giao bài tập</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Schedule */}
                    <div className="bg-white dark:bg-[#1a2e2c] rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a403d] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#2a403d] flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#E0F2F1] dark:bg-[#13ecda]/20 rounded-lg">
                                    <CalendarIcon size={20} className="text-[#00695C] dark:text-[#13ecda]" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Lịch điều trị sắp tới</h2>
                            </div>
                            <button className="text-sm font-medium text-[#00695C] dark:text-[#13ecda] hover:underline">
                                Xem lịch →
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 bg-[#F8FAFB] dark:bg-[#152523] rounded-xl border border-gray-100 dark:border-[#2a403d]">
                                {/* Date */}
                                <div className="flex flex-col items-center justify-center bg-white dark:bg-[#1a2e2c] rounded-xl shadow-sm w-16 h-16 border border-gray-100 dark:border-[#2a403d]">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Th.01</span>
                                    <span className="text-2xl font-bold text-[#00695C] dark:text-[#13ecda]">26</span>
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 dark:text-white">Buổi trị liệu định kỳ</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        <Clock size={14} />
                                        <span>14:00 - 15:00</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-6 h-6 rounded-full bg-[#00695C] flex items-center justify-center text-white text-xs font-bold">
                                            N
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Dr. Nguyễn Minh</span>
                                    </div>
                                </div>

                                {/* Action */}
                                <button className="w-full sm:w-auto px-6 py-3 bg-[#00695C] hover:bg-[#00796B] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                                    Tham gia
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Quick Actions & Info */}
                <div className="space-y-6">

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-[#1a2e2c] rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a403d] p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Lối tắt nhanh</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex flex-col items-center gap-3 p-4 rounded-xl bg-[#F8FAFB] dark:bg-[#152523] hover:bg-[#E0F2F1] dark:hover:bg-[#1a2e2c] border border-transparent hover:border-[#00695C]/20 transition-all group">
                                <div className="p-3 bg-white dark:bg-[#1a2e2c] rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                                    <Video size={24} className="text-[#00695C] dark:text-[#13ecda]" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quay Video</span>
                            </button>

                            <button className="flex flex-col items-center gap-3 p-4 rounded-xl bg-[#F8FAFB] dark:bg-[#152523] hover:bg-[#E0F2F1] dark:hover:bg-[#1a2e2c] border border-transparent hover:border-[#00695C]/20 transition-all group">
                                <div className="p-3 bg-white dark:bg-[#1a2e2c] rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                                    <Dumbbell size={24} className="text-[#00695C] dark:text-[#13ecda]" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bài Tập</span>
                            </button>

                            <button className="flex flex-col items-center gap-3 p-4 rounded-xl bg-[#F8FAFB] dark:bg-[#152523] hover:bg-[#E0F2F1] dark:hover:bg-[#1a2e2c] border border-transparent hover:border-[#00695C]/20 transition-all group">
                                <div className="p-3 bg-white dark:bg-[#1a2e2c] rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                                    <CalendarIcon size={24} className="text-[#00695C] dark:text-[#13ecda]" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Đặt Lịch</span>
                            </button>

                            <button className="flex flex-col items-center gap-3 p-4 rounded-xl bg-[#F8FAFB] dark:bg-[#152523] hover:bg-[#E0F2F1] dark:hover:bg-[#1a2e2c] border border-transparent hover:border-[#00695C]/20 transition-all group">
                                <div className="p-3 bg-white dark:bg-[#1a2e2c] rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                                    <MessageCircle size={24} className="text-[#00695C] dark:text-[#13ecda]" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nhắn Tin</span>
                            </button>
                        </div>
                    </div>

                    {/* Community Card */}
                    <div className="bg-gradient-to-br from-[#E0F2F1] to-[#B2DFDB] dark:from-[#1a2e2c] dark:to-[#152523] rounded-2xl p-6 border border-[#B2DFDB] dark:border-[#2a403d]">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-white dark:bg-[#00695C] rounded-lg">
                                <Users size={20} className="text-[#00695C] dark:text-[#13ecda]" />
                            </div>
                            <h3 className="font-bold text-[#00695C] dark:text-[#13ecda]">Cộng đồng Cha Mẹ</h3>
                        </div>
                        <p className="text-sm text-[#00695C]/80 dark:text-gray-300 mb-4">
                            Chia sẻ kinh nghiệm và nhận hỗ trợ từ các phụ huynh khác.
                        </p>
                        <button className="w-full py-3 bg-[#00695C] hover:bg-[#00796B] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                            Tham gia ngay
                            <ArrowRight size={16} />
                        </button>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-white dark:bg-[#1a2e2c] rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a403d] p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Hỗ trợ khẩn cấp</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Hotline 24/7</p>
                        <a
                            href="tel:1900xxxx"
                            className="flex items-center justify-center gap-2 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                            📞 1900-xxxx
                        </a>
                    </div>
                </div>
            </div>
        </ParentLayout>
    );
}
