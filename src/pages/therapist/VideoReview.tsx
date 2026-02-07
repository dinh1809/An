
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VideoAnnotationPlayer } from '@/components/therapist/VideoAnnotationPlayer';
import { Card, CardContent } from '@/components/ui/card';
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
    // profiles format depends on join query
}

export default function VideoReview() {
    const [videos, setVideos] = useState<VideoUpload[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<VideoUpload | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                // Fetch videos order by newest
                const { data, error } = await supabase
                    .from('video_uploads')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setVideos(data || []);
                if (data && data.length > 0) {
                    setSelectedVideo(data[0]); // Auto-select newest
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
            <div className="container mx-auto p-0 max-w-7xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-purple-100 rounded-xl">
                        <Video className="text-purple-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Video Review & Feedback</h1>
                        <p className="text-gray-500">Analyze patient videos and provide timestamped feedback.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center p-20">Loading videos...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-250px)]">
                        {/* Sidebar: List of Videos */}
                        <Card className="md:col-span-1 border-0 shadow-lg flex flex-col h-full bg-white dark:bg-gray-900">
                            <div className="p-4 border-b">
                                <h3 className="font-bold text-gray-700">Patient Uploads</h3>
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="divide-y">
                                    {videos.length === 0 ? (
                                        <div className="p-6 text-center text-gray-400">No videos uploaded yet.</div>
                                    ) : (
                                        videos.map(video => (
                                            <div
                                                key={video.id}
                                                onClick={() => setSelectedVideo(video)}
                                                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedVideo?.id === video.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''}`}
                                            >
                                                <h4 className="font-medium text-gray-900 line-clamp-1">{video.title}</h4>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                                                    <Calendar size={12} />
                                                    {new Date(video.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                    <Video size={12} />
                                                    {formatDuration(video.duration_seconds || 0)}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </Card>

                        {/* Main Stage: Player */}
                        <div className="md:col-span-3 h-full overflow-y-auto">
                            {selectedVideo ? (
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border">
                                        <h2 className="text-xl font-bold mb-4">{selectedVideo.title}</h2>
                                        <VideoAnnotationPlayer
                                            videoId={selectedVideo.id}
                                            videoUrl={selectedVideo.file_url}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                    <p className="text-gray-400">Select a video to start review</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </TherapistLayout>
    );
}
