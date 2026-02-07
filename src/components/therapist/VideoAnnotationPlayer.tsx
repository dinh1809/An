
import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Plus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

// Placeholder type until DB migration is run
export interface VideoFeedback {
    id: string;
    video_id: string;
    user_id: string; // The therapist who wrote the comment
    timestamp: number; // Seconds
    content: string;
    created_at: string;
    therapist_name?: string; // Optional join
}

interface VideoAnnotationPlayerProps {
    videoId: string;
    videoUrl: string;
    className?: string;
}

export const VideoAnnotationPlayer: React.FC<VideoAnnotationPlayerProps> = ({
    videoId,
    videoUrl,
    className
}) => {
    const { user } = useAuth();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [comments, setComments] = useState<VideoFeedback[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);

    // Format seconds to MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Fetch comments
    useEffect(() => {
        const fetchComments = async () => {
            if (!videoId) return;
            setLoadingComments(true);
            try {
                // In a real scenario, we'd join with profiles to get names
                // For MVP, we just fetch the raw table 'video_feedback'
                // NOTE: This will fail until the table exists. We'll simulate empty for now if it errors.
                const { data, error } = await supabase
                    .from('video_feedback' as any)
                    .select('*')
                    .eq('video_id', videoId)
                    .order('timestamp', { ascending: true });

                if (error) {
                    // console.warn("Could not fetch feedback (Table might remain to be created):", error);
                    setComments([]);
                } else {
                    setComments(data as VideoFeedback[]);
                }
            } catch (err) {
                console.error(err);
                setComments([]);
            } finally {
                setLoadingComments(false);
            }
        };

        fetchComments();
    }, [videoId]);

    // Handle Time Update
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    // Play/Pause
    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    // Jump to timestamp
    const seekTo = (seconds: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = seconds;
            // Optionally auto-play
            // videoRef.current.play();
            // setIsPlaying(true);
        }
    };

    // Save Comment
    const handleSaveComment = async () => {
        if (!newComment.trim() || !user) return;

        const timestamp = videoRef.current?.currentTime || 0;

        try {
            const { data, error } = await supabase
                .from('video_feedback' as any)
                .insert({
                    video_id: videoId,
                    user_id: user.id,
                    timestamp: timestamp,
                    content: newComment,
                })
                .select()
                .single();

            if (error) throw error;

            // Optimistic update or reuse fetched data
            const savedComment: VideoFeedback = {
                ...data,
                // Add any mock fields if necessary
            };

            setComments(prev => [...prev, savedComment].sort((a, b) => a.timestamp - b.timestamp));
            setNewComment("");
            setIsCommentBoxOpen(false);

        } catch (err) {
            console.error("Failed to save comment:", err);
            alert("Could not save comment. Ensure database table 'video_feedback' exists.");
        }
    };

    return (
        <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6", className)}>
            {/* Left: Video Player */}
            <div className="lg:col-span-2 space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video group shadow-lg">
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full h-full object-contain"
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onClick={togglePlay}
                    />

                    {/* Custom Controls Overlay (Simple) */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-4">
                        <button onClick={togglePlay} className="text-white hover:text-purple-400">
                            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>
                        <div className="text-white text-sm font-mono">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                        <input
                            type="range"
                            min="0"
                            max={duration}
                            value={currentTime}
                            onChange={(e) => seekTo(Number(e.target.value))}
                            className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                {/* Quick Add Button */}
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        Playing: {formatTime(currentTime)}
                    </div>
                    <Button
                        onClick={() => setIsCommentBoxOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                    >
                        <Plus size={16} />
                        Add Note at {formatTime(currentTime)}
                    </Button>
                </div>

                {/* Add Comment Input */}
                {isCommentBoxOpen && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-purple-100 dark:border-purple-900 animation-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                @ {formatTime(currentTime)}
                            </span>
                            <button onClick={() => setIsCommentBoxOpen(false)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                        </div>
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Describe what you observe here (e.g. 'Good eye contact', 'Struggling with balance')..."
                            className="mb-3 bg-white"
                        />
                        <div className="flex justify-end">
                            <Button size="sm" onClick={handleSaveComment}>Save Note</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Feedback Timeline */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col h-[500px]">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                    <MessageSquare size={18} className="text-purple-600" />
                    <h3 className="font-bold">Session Notes</h3>
                    <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{comments.length}</span>
                </div>

                <ScrollArea className="flex-1 p-4">
                    {comments.length === 0 ? (
                        <div className="text-center text-gray-400 py-10 text-sm">
                            <p>No notes yet.</p>
                            <p>Watch the video and add observations.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    onClick={() => seekTo(comment.timestamp)}
                                    className="group p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/10 cursor-pointer transition-all"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded">
                                            {formatTime(comment.timestamp)}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {comment.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
};
