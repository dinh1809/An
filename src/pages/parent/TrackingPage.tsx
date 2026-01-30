import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ParentLayout } from '@/components/layout/ParentLayout';
import {
    Play,
    PlayCircle,
    Video,
    VideoOff,
    Calendar,
    Clock,
    MapPin,
    Check,
    ChevronRight,
    Plus,
    BookOpen,
    Save,
    MoreVertical,
    Wifi
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { VideoFeedback } from '@/components/parent/VideoFeedback';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TherapySession {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    isToday: boolean;
}

interface ExerciseVideo {
    id: string;
    title: string;
    date: string;
    status: 'reviewed' | 'pending';
    thumbnail?: string;
}

export default function TrackingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cooperationLevel, setCooperationLevel] = useState(4);
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
    const [supportLevels, setSupportLevels] = useState({
        independent: false,
        verbal: true,
        physical: false
    });

    // Mock data for upcoming sessions
    const upcomingSessions: TherapySession[] = [
        {
            id: '1',
            title: 'Trị liệu ngôn ngữ',
            date: 'Hôm nay',
            time: '14:00',
            location: 'Online session',
            isToday: true
        },
        {
            id: '2',
            title: 'Vận động thô',
            date: '15 Th11',
            time: '09:30',
            location: 'Tại trung tâm',
            isToday: false
        }
    ];

    // Mock data for history
    const sessionHistory = [
        { id: '1', title: 'Giao tiếp mắt', date: '12/11', duration: '45 phút' },
        { id: '2', title: 'Nhận biết màu', date: '10/11', duration: '30 phút' }
    ];

    // Mock data for submitted videos
    const submittedVideos: ExerciseVideo[] = [
        { id: '1', title: 'Bài tập 12/11', date: '12/11', status: 'reviewed' },
        { id: '2', title: 'Bài tập 13/11', date: '13/11', status: 'pending' }
    ];

    const cooperationLabels = ['Từ chối', 'Miễn cưỡng', 'Trung bình', 'Tốt', 'Rất tốt'];

    return (
        <ParentLayout>
            {/* Main Grid Layout - 3 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: Schedule Management */}
                <aside className="lg:col-span-3 space-y-6">
                    {/* Header */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Quản lý Lịch điều trị
                        </h3>
                        <button
                            onClick={() => navigate('/parent/schedule')}
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-dashed border-[#00695C]/30 text-[#00695C] font-bold hover:bg-[#00695C]/5 hover:border-[#00695C] transition-all group"
                        >
                            <Plus size={20} className="group-hover:scale-110 transition-transform" />
                            Đề xuất lịch mới
                        </button>
                    </div>

                    {/* Upcoming Sessions */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-3">
                            Sắp diễn ra
                        </h4>
                        {upcomingSessions.map((session) => (
                            <div
                                key={session.id}
                                className={`bg-white dark:bg-[#1a2e2c] p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden ${session.isToday
                                    ? 'border-[#00695C]/20'
                                    : 'border-gray-100 dark:border-gray-800'
                                    }`}
                            >
                                {session.isToday && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00695C]"></div>
                                )}
                                <div className="flex gap-3">
                                    <div className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg min-w-[3.5rem] ${session.isToday
                                        ? 'bg-[#00695C]/10 text-[#00695C]'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                                        }`}>
                                        <span className="text-xs font-bold uppercase">{session.date}</span>
                                        <span className={`text-lg font-extrabold ${session.isToday ? 'text-gray-900 dark:text-white' : ''}`}>
                                            {session.time}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <h5 className="font-bold text-gray-900 dark:text-white text-sm">
                                            {session.title}
                                        </h5>
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            {session.location.includes('Online') ? (
                                                <Wifi size={12} />
                                            ) : (
                                                <MapPin size={12} />
                                            )}
                                            {session.location}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Session History */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                        <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-3">
                            Lịch sử trị liệu
                        </h4>
                        {sessionHistory.map((session) => (
                            <div
                                key={session.id}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a2e2c] transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                                        <Check size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                            {session.title}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {session.date} • {session.duration}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-gray-300" />
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Center Column: Daily Exercise or Video Feedback */}
                <section className="lg:col-span-6 space-y-6">
                    {selectedVideoId ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="ghost"
                                    onClick={() => setSelectedVideoId(null)}
                                    className="gap-2 text-primary font-bold hover:text-primary hover:bg-primary/10"
                                >
                                    <ChevronRight size={18} className="rotate-180" /> Quay lại bài tập
                                </Button>
                                <div className="text-right">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Phản hồi từ chuyên gia</h2>
                                    <p className="text-xs text-muted-foreground italic">Duyệt bởi BS. Nguyễn Văn An</p>
                                </div>
                            </div>

                            <VideoFeedback
                                videoTitle="Bài tập 12/11"
                                date="12/11/2024"
                                videoUrl="#"
                                therapistName="BS. Nguyễn Văn An"
                                comments={[
                                    { timestamp: 45, text: "Bé đã bắt đầu có sự chú ý vào mẹ, rất tốt!", type: 'praise' },
                                    { timestamp: 120, text: "Chỗ này mẹ nên hạ thấp tầm mắt xuống chút nữa để bé dễ nhìn hơn.", type: 'correction' },
                                    { timestamp: 185, text: "Bé duy trì mắt được 3 giây, một tiến bộ vượt bậc.", type: 'observation' }
                                ]}
                                explanation="Thông qua video, chúng tôi nhận thấy khả năng 'Joint Attention' (Chú ý chung) của bé đã cải thiện. Tuy nhiên, bé vẫn cần hỗ trợ về 'Social Reciprocity' (Tương tác qua lại) để phản ứng nhanh hơn với lời gọi của mẹ."
                                suggestions={[
                                    "Mẹ hãy giữ món đồ chơi ở ngay giữa hai mắt của mình thay vì để lệch sang bên.",
                                    "Khen ngợi bé ngay giây đầu tiên khi bé nhìn vào mắt bạn.",
                                    "Giảm bớt tiếng ồn xung quanh để bé tập trung tối đa vào giọng nói của mẹ."
                                ]}
                            />
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                        Bài tập mỗi ngày
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Lộ trình cá nhân hóa cho bé <span className="font-bold text-[#00695C]">Minh Anh</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1 border border-red-100 dark:border-red-900/30">
                                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                        REC Off
                                    </span>
                                </div>
                            </div>

                            {/* Video Player Card */}
                            <div className="bg-white dark:bg-[#1a2e2c] rounded-2xl p-1 shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden group cursor-pointer">
                                    {/* Video Thumbnail */}
                                    <div className="w-full h-full bg-gradient-to-br from-[#00695C]/20 to-[#004D40]/40 flex items-center justify-center">
                                        <img
                                            src="https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800&h=450&fit=crop"
                                            alt="Therapy session"
                                            className="w-full h-full object-cover opacity-60"
                                        />
                                    </div>

                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full mb-4">
                                            <div className="bg-[#00695C] hover:bg-[#004D40] text-white rounded-full p-6 hover:scale-105 transition-transform duration-300 shadow-xl">
                                                <Play size={32} fill="white" />
                                            </div>
                                        </div>
                                        <p className="text-white font-bold text-xl drop-shadow-md">
                                            Kỹ thuật: Duy trì giao tiếp mắt
                                        </p>
                                        <p className="text-white/80 text-sm mt-1 font-medium bg-black/30 px-3 py-1 rounded-full backdrop-blur-md">
                                            Thời lượng: 5:30
                                        </p>
                                    </div>

                                    {/* Smart Camera Indicator */}
                                    <div className="absolute top-4 right-4 w-32 h-24 bg-black/60 backdrop-blur-md rounded-lg border border-white/20 flex flex-col items-center justify-center z-20 shadow-lg">
                                        <div className="size-8 rounded-full bg-white/10 flex items-center justify-center mb-1">
                                            <VideoOff size={18} className="text-white/70" />
                                        </div>
                                        <span className="text-[10px] font-bold text-white/70 uppercase tracking-wide">
                                            Smart Camera
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700/50">
                                        <div className="h-full w-0 bg-[#00695C] transition-all duration-1000 group-hover:w-[8%]"></div>
                                    </div>
                                </div>

                                {/* Video Controls */}
                                <div className="p-4 flex flex-col sm:flex-row items-center gap-4">
                                    <div className="flex-1 w-full">
                                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                            <Video size={20} className="text-[#00695C]" />
                                            <span className="leading-tight">
                                                Hệ thống sẽ <strong>tự động ghi hình</strong> và tải lên để chuyên gia đánh giá.
                                            </span>
                                        </div>
                                    </div>
                                    <button className="w-full sm:w-auto px-8 py-3.5 bg-[#00695C] hover:bg-[#004D40] text-white text-base font-bold rounded-xl shadow-lg shadow-[#00695C]/20 hover:shadow-[#00695C]/40 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                                        <PlayCircle size={20} />
                                        Bắt đầu bài tập
                                    </button>
                                </div>
                            </div>

                            {/* Instructions Card */}
                            <div className="bg-white dark:bg-[#1a2e2c] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[#00695C]/10 rounded-lg text-[#00695C]">
                                            <BookOpen size={20} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                            Hướng dẫn thực hiện
                                        </h3>
                                    </div>
                                    <button className="text-sm font-bold text-[#00695C] hover:underline">
                                        Tải PDF
                                    </button>
                                </div>

                                {/* Steps */}
                                <div className="space-y-8 relative">
                                    {/* Vertical Line */}
                                    <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-100 dark:bg-gray-800 z-0"></div>

                                    {/* Step 1 */}
                                    <div className="flex gap-4 relative z-10">
                                        <div className="flex-shrink-0 size-8 rounded-full bg-white dark:bg-[#1a2e2c] border-2 border-[#00695C] text-[#00695C] font-bold flex items-center justify-center text-sm shadow-sm">
                                            1
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-base">
                                                Chuẩn bị môi trường
                                            </h4>
                                            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                                Tìm một không gian yên tĩnh, ít phiền nhiễu. Ngồi đối diện với trẻ ngang tầm mắt, đảm bảo ánh sáng chiếu vào khuôn mặt bạn để trẻ dễ quan sát.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="flex gap-4 relative z-10">
                                        <div className="flex-shrink-0 size-8 rounded-full bg-white dark:bg-[#1a2e2c] border-2 border-[#00695C] text-[#00695C] font-bold flex items-center justify-center text-sm shadow-sm">
                                            2
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-base">
                                                Kích thích sự chú ý
                                            </h4>
                                            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                                Đưa một món đồ chơi trẻ thích lên ngang tầm mắt của bạn. Gọi tên trẻ một cách rõ ràng và vui vẻ. Chờ đợi phản ứng ánh mắt trong vòng 3-5 giây.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="flex gap-4 relative z-10">
                                        <div className="flex-shrink-0 size-8 rounded-full bg-white dark:bg-[#1a2e2c] border-2 border-[#00695C] text-[#00695C] font-bold flex items-center justify-center text-sm shadow-sm">
                                            3
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-base">
                                                Củng cố hành vi
                                            </h4>
                                            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                                Ngay khi trẻ nhìn vào mắt bạn, hãy khen ngợi ngay lập tức ("Giỏi lắm!", "Con nhìn mẹ kìa!") và thưởng đồ chơi cho trẻ. Lặp lại quá trình này 5-10 lần.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </section>

                {/* Right Column: Quick Check & Videos */}
                <aside className="lg:col-span-3 space-y-6">
                    {/* Quick Check Card */}
                    <div className="bg-white dark:bg-[#1a2e2c] rounded-2xl p-5 shadow-lg shadow-[#00695C]/5 border border-[#00695C]/20 relative overflow-hidden">
                        {/* Top Gradient Bar */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00695C] to-emerald-400"></div>

                        <div className="flex items-center gap-2 mb-6">
                            <Check size={24} className="text-[#00695C]" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Bảng kiểm nhanh
                            </h3>
                        </div>

                        <form className="space-y-6">
                            {/* Cooperation Level */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Mức độ hợp tác
                                    </label>
                                    <span className="text-xs font-bold text-[#00695C] bg-[#00695C]/10 px-2 py-0.5 rounded">
                                        {cooperationLabels[cooperationLevel - 1]}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    value={cooperationLevel}
                                    onChange={(e) => setCooperationLevel(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00695C]"
                                />
                                <div className="flex justify-between mt-1 text-[10px] text-gray-400 font-medium">
                                    <span>Từ chối</span>
                                    <span>Hợp tác</span>
                                </div>
                            </div>

                            {/* Support Level */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                                    Mức độ hỗ trợ
                                </label>
                                <div className="space-y-2.5">
                                    {[
                                        { key: 'independent', label: 'Độc lập hoàn toàn' },
                                        { key: 'verbal', label: 'Nhắc nhở lời nói' },
                                        { key: 'physical', label: 'Cầm tay chỉ việc' }
                                    ].map((option) => (
                                        <label key={option.key} className="cursor-pointer block">
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={supportLevels[option.key as keyof typeof supportLevels]}
                                                onChange={(e) => setSupportLevels({
                                                    ...supportLevels,
                                                    [option.key]: e.target.checked
                                                })}
                                            />
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent peer-checked:border-[#00695C] peer-checked:bg-[#00695C]/5 transition-all">
                                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 peer-checked:text-[#00695C]">
                                                    {option.label}
                                                </span>
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${supportLevels[option.key as keyof typeof supportLevels]
                                                    ? 'bg-[#00695C] border-[#00695C]'
                                                    : 'border-gray-300 dark:border-gray-600'
                                                    }`}>
                                                    {supportLevels[option.key as keyof typeof supportLevels] && (
                                                        <Check size={14} className="text-white" />
                                                    )}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Save Button */}
                            <button
                                type="button"
                                className="w-full bg-[#00695C] hover:bg-[#004D40] text-white font-bold py-3.5 rounded-xl mt-2 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                <Save size={18} />
                                Lưu kết quả
                            </button>
                        </form>
                    </div>

                    {/* Submitted Videos */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between pb-1">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                Quản lý Video đã gửi
                            </h3>
                            <button className="text-xs font-bold text-[#00695C] uppercase tracking-wide hover:underline">
                                Tất cả
                            </button>
                        </div>

                        {submittedVideos.map((video) => (
                            <div
                                key={video.id}
                                onClick={() => video.status === 'reviewed' && setSelectedVideoId(video.id)}
                                className={cn(
                                    "flex items-start gap-3 p-3 bg-white dark:bg-[#1a2e2c] rounded-xl border border-gray-200 dark:border-gray-700 transition-all cursor-pointer group shadow-sm",
                                    video.status === 'reviewed' ? "hover:border-primary/50 hover:shadow-md" : "opacity-75 cursor-not-allowed"
                                )}
                            >
                                <div className="relative w-16 h-12 shrink-0">
                                    <div className="w-full h-full rounded-lg bg-gray-200 dark:bg-gray-700 bg-cover bg-center"
                                        style={{
                                            backgroundImage: `url('https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=100&h=75&fit=crop')`
                                        }}
                                    ></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-[#00695C] transition-colors">
                                            {video.title}
                                        </p>
                                        <MoreVertical size={14} className="text-gray-300" />
                                    </div>
                                    <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded border ${video.status === 'reviewed'
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800'
                                        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800'
                                        }`}>
                                        <span className={`size-1.5 rounded-full ${video.status === 'reviewed'
                                            ? 'bg-green-500'
                                            : 'bg-yellow-500 animate-pulse'
                                            }`}></span>
                                        <span className={`text-[10px] font-bold uppercase tracking-wide ${video.status === 'reviewed'
                                            ? 'text-green-700 dark:text-green-400'
                                            : 'text-yellow-700 dark:text-yellow-400'
                                            }`}>
                                            {video.status === 'reviewed' ? 'Đã có phản hồi' : 'Chờ phản hồi'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        </ParentLayout>
    );
}
