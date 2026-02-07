
import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Plus, MessageSquare, Loader2, Sparkles, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';
import { AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

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
    patientId: string;
    patientName: string;
    className?: string;
}

export const VideoAnnotationPlayer: React.FC<VideoAnnotationPlayerProps> = ({
    videoId,
    videoUrl,
    patientId,
    patientName,
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
    const [generatingReport, setGeneratingReport] = useState(false);
    const [reportContent, setReportContent] = useState<string | null>(null);
    const [showReportDialog, setShowReportDialog] = useState(false);
    const { toast } = useToast();

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
                const { data, error } = await supabase
                    .from('video_feedback' as any)
                    .select('*')
                    .eq('video_id', videoId)
                    .order('timestamp', { ascending: true });

                if (error) {
                    setComments([]);
                } else {
                    setComments(data as unknown as VideoFeedback[]);
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

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const seekTo = (seconds: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = seconds;
        }
    };

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

            const savedComment: VideoFeedback = {
                ...(data as any),
            };

            setComments(prev => [...prev, savedComment].sort((a, b) => a.timestamp - b.timestamp));
            setNewComment("");
            setIsCommentBoxOpen(false);

            toast({
                title: "Đã lưu ghi chú",
                description: `Tại thời điểm ${formatTime(timestamp)}`,
            });
        } catch (err) {
            console.error("Failed to save comment:", err);
            toast({
                title: "Lỗi lưu ghi chú",
                variant: "destructive"
            });
        }
    };

    const generateReport = async () => {
        if (comments.length === 0) {
            toast({
                title: "Chưa có ghi chú",
                description: "Vui lòng thêm ghi chú vào video trước khi tạo báo cáo.",
                variant: "destructive"
            })
            return;
        }

        setGeneratingReport(true);
        try {
            console.log("Invoking AI for patient:", patientName, "at function: generate-clinical-report");

            const { data, error } = await supabase.functions.invoke('generate-clinical-report', {
                body: {
                    annotations: comments.map(c => ({
                        timestamp: formatTime(c.timestamp),
                        note: c.content
                    })),
                    patient_name: patientName
                }
            });

            if (error) {
                console.error("Supabase Function Error Object:", error);

                // Check if it's a deployment/not found error
                const errorMsg = error.message || "";
                if (errorMsg.includes("Failed to send a request") || errorMsg.includes("404")) {
                    throw new Error("Chưa tìm thấy Edge Function trên server. Bạn cần chạy lệnh 'npx supabase functions deploy generate-clinical-report' để kích hoạt AI.");
                }
                throw error;
            }

            if (!data || !data.report) {
                throw new Error("AI returned empty report");
            }

            setReportContent(data.report);
            setShowReportDialog(true);
        } catch (err: any) {
            console.error("AI Full Error Details:", err);
            toast({
                title: "Lỗi kết nối AI",
                description: err.message || "Không thể kết nối với Edge Function. Vui lòng kiểm tra lại kết nối mạng hoặc deploy function.",
                variant: "destructive"
            });
        } finally {
            setGeneratingReport(false);
        }
    };

    const saveReport = async () => {
        if (!reportContent || !user) return;

        try {
            const { error } = await (supabase as any)
                .from('clinical_reports')
                .insert({
                    therapist_id: user.id,
                    patient_id: patientId, // FIXED: Now uses the correct patientId from props
                    video_id: videoId,
                    content: reportContent,
                    status: 'published',
                    raw_annotations: comments
                });

            if (error) throw error;

            toast({
                title: "Đã xuất bản báo cáo! 🚀",
                description: `Báo cáo về ${patientName} đã được gửi tới phụ huynh.`,
            });
            setShowReportDialog(false);
        } catch (err) {
            console.error("Save Error:", err);
            toast({
                title: "Lỗi lưu báo cáo",
                variant: "destructive"
            });
        }
    };

    return (
        <div className={cn("grid grid-cols-1 lg:grid-cols-4 gap-8 h-full", className)}>
            {/* Left/Middle: Video Player and Controls */}
            <div className="lg:col-span-3 space-y-6 flex flex-col h-full">
                <div className="relative rounded-[32px] overflow-hidden bg-black aspect-video group shadow-2xl border-4 border-white/10 flex-1">
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full h-full object-contain"
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onClick={togglePlay}
                        crossOrigin="anonymous"
                        playsInline
                        controls
                    />
                </div>

                {/* Info Bar & Quick Add */}
                <div className="flex justify-between items-center bg-white p-6 rounded-[24px] shadow-sm border">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 text-purple-700 rounded-xl font-black text-lg tabular-nums">
                            {formatTime(currentTime)}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Đang xem</p>
                            <p className="text-xl font-black text-gray-900">{patientName}</p>
                        </div>
                    </div>

                    <Button
                        onClick={() => setIsCommentBoxOpen(true)}
                        size="lg"
                        className="bg-purple-600 hover:bg-purple-700 text-white gap-3 rounded-2xl h-14 px-8 shadow-lg shadow-purple-600/20 text-lg font-black"
                    >
                        <Plus size={24} />
                        THÊM GHI CHÚ
                    </Button>
                </div>

                {/* Add Comment Input Modal/Box */}
                <AnimatePresence>
                    {isCommentBoxOpen && (
                        <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-[24px] border-2 border-purple-200 shadow-xl space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-black bg-purple-600 text-white px-3 py-1.5 rounded-lg shadow-md">
                                        NHẬN XÉT: {formatTime(currentTime)}
                                    </span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsCommentBoxOpen(false)} className="rounded-full">
                                    <X size={20} />
                                </Button>
                            </div>
                            <Textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Mô tả những gì bạn thấy tại thời điểm này... (ví dụ: Bé giao tiếp mắt tốt, Bé chưa giữ được thăng bằng...)"
                                className="min-h-[120px] text-lg bg-white border-purple-100 focus:ring-purple-500 rounded-xl p-4 leading-relaxed"
                                autoFocus
                            />
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setIsCommentBoxOpen(false)} className="rounded-xl h-12 px-6">Hủy</Button>
                                <Button onClick={handleSaveComment} className="bg-purple-600 text-white rounded-xl h-12 px-8 font-bold">Lưu ghi chú</Button>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right Side: Timeline & Analysis */}
            <div className="lg:col-span-1 flex flex-col h-full bg-white dark:bg-gray-900 rounded-[32px] border shadow-xl overflow-hidden">
                <div className="p-6 border-b bg-gray-50/50 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageSquare size={20} className="text-purple-600" />
                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Ghi chú ({comments.length})</h3>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        className="w-full gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl h-14 shadow-lg shadow-purple-600/20 font-black text-md"
                        onClick={generateReport}
                        disabled={generatingReport || comments.length === 0}
                    >
                        {generatingReport ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Sparkles size={20} />
                        )}
                        {generatingReport ? "ĐANG PHÂN TÍCH..." : "AI TẠO BÁO CÁO"}
                    </Button>
                </div>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {comments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                                <div className="p-4 bg-gray-50 rounded-full mb-3">
                                    <MessageSquare className="text-gray-300" size={32} />
                                </div>
                                <p className="text-gray-400 font-bold">Chưa có ghi chú nào.</p>
                                <p className="text-xs text-gray-400 mt-1">Dùng công cụ "Thêm ghi chú" khi đang xem video.</p>
                            </div>
                        ) : (
                            comments.map((comment, idx) => (
                                <div
                                    key={comment.id}
                                    className="group p-5 rounded-2xl bg-white border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer relative"
                                    onClick={() => seekTo(comment.timestamp)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-black tabular-nums shrink-0">
                                            {formatTime(comment.timestamp)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-lg font-medium text-gray-800 leading-relaxed mb-2">{comment.content}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Ghi chú #{idx + 1}</p>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-purple-400 transition-colors mt-1" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* AI Report Dialog */}
            <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] p-0 border-none shadow-2xl">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black uppercase tracking-tight">Dự thảo Báo cáo Tiến độ (AI)</DialogTitle>
                            <DialogDescription className="text-purple-100 text-lg opacity-90">
                                Dựa trên {comments.length} quan sát klin lâm sàng về bé {patientName}.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8">
                        <div className="bg-gray-50 p-10 rounded-[28px] border border-gray-100 shadow-inner prose prose-lg dark:prose-invert max-w-none prose-headings:text-purple-700 prose-headings:font-black">
                            <ReactMarkdown>{reportContent || ''}</ReactMarkdown>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 p-8 bg-gray-50 border-t items-center">
                        <Button variant="ghost" onClick={() => setShowReportDialog(false)} className="rounded-xl h-12 px-6 font-bold text-gray-500">Đóng để sửa lại</Button>
                        <Button onClick={saveReport} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 px-10 font-black text-lg shadow-lg shadow-purple-600/20">XÁC NHẬN & GỬI BÁO CÁO</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
