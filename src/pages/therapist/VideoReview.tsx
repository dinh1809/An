
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VideoAnnotationPlayer } from '@/components/therapist/VideoAnnotationPlayer';
import { Card } from '@/components/ui/card';
import { Video, Calendar, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TherapistLayout } from '@/components/layout/TherapistLayout';

interface VideoUpload {
    id: string;
    title: string;
    file_url: string;
    duration_seconds: number;
    created_at: string;
    user_id: string;
    profiles?: {
        full_name: string;
    };
}

export default function VideoReview() {
    const [videos, setVideos] = useState<VideoUpload[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<VideoUpload | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                // Fetch videos order by newest with patient profile join
                const { data, error } = await supabase
                    .from('video_uploads')
                    .select('*, profiles:user_id(full_name)')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Use type assertion to bypass relation detection issue in TS
                const formattedVideos = (data as any[]).map(v => ({
                    ...v,
                    profiles: v.profiles || { full_name: 'Bệnh nhân ẩn danh' }
                })) as VideoUpload[];

                setVideos(formattedVideos);
                if (formattedVideos.length > 0) {
                    setSelectedVideo(formattedVideos[0]); // Auto-select newest
                }
            } catch (err) {
                console.error("Error loading videos:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    const formatDuration = (secs: number) => {
        const mins = Math.floor(secs / 60);
        return `${mins}m ${secs % 60}s`;
    };

    return (
        <TherapistLayout>
            <div className="w-full px-6 py-4">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-purple-100 rounded-2xl">
                        <Video className="text-purple-600" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">PHÂN TÍCH VIDEO & NHẬN XÉT</h1>
                        <p className="text-lg text-gray-500 font-medium">Theo dõi và đánh giá quá trình luyện tập của bệnh nhân qua video.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center p-20 text-xl font-bold text-purple-600 animate-pulse">
                        Đang tải danh sách video...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 h-[calc(100vh-220px)]">
                        {/* Sidebar: List of Videos */}
                        <Card className="md:col-span-1 lg:col-span-1 border-0 shadow-2xl flex flex-col h-full bg-white dark:bg-gray-900 rounded-[32px] overflow-hidden">
                            <div className="p-6 border-b bg-gray-50/50">
                                <h3 className="text-lg font-black text-gray-800 uppercase tracking-wider">Danh sách video</h3>
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="divide-y divide-gray-100">
                                    {videos.length === 0 ? (
                                        <div className="p-10 text-center text-gray-400 font-medium italic">Chưa có video nào được tải lên.</div>
                                    ) : (
                                        videos.map(video => (
                                            <div
                                                key={video.id}
                                                onClick={() => setSelectedVideo(video)}
                                                className={`p-6 cursor-pointer hover:bg-purple-50/50 transition-all duration-300 ${selectedVideo?.id === video.id ? 'bg-purple-50 border-r-4 border-purple-600' : ''}`}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <User size={14} className="text-purple-500" />
                                                    <span className="text-sm font-black text-purple-700 uppercase tracking-tighter">
                                                        {video.profiles?.full_name || 'Bệnh nhân ẩn danh'}
                                                    </span>
                                                </div>
                                                <h4 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight mb-3">{video.title}</h4>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                                                        <Calendar size={14} className="opacity-70" />
                                                        {new Date(video.created_at).toLocaleDateString('vi-VN')}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                                                        <Video size={14} className="opacity-70" />
                                                        {formatDuration(video.duration_seconds || 0)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </Card>

                        {/* Main Stage: Player */}
                        <div className="md:col-span-3 lg:col-span-4 h-full">
                            {selectedVideo ? (
                                <div className="h-full">
                                    <VideoAnnotationPlayer
                                        videoId={selectedVideo.id}
                                        videoUrl={selectedVideo.file_url}
                                        patientId={selectedVideo.user_id}
                                        patientName={selectedVideo.profiles?.full_name || 'Bệnh nhân'}
                                        className="h-full"
                                    />
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-[32px] border-4 border-dashed border-gray-200">
                                    <div className="p-6 bg-gray-100 rounded-full mb-4">
                                        <Video size={48} className="text-gray-400" />
                                    </div>
                                    <p className="text-2xl font-black text-gray-400">Chọn một video để bắt đầu đánh giá</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </TherapistLayout>
    );
}
