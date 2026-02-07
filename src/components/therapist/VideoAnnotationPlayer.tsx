
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
                throw error;
            }

            // Always show the dialog if we have a report (even if it's an error message report)
            if (data && data.report) {
                setReportContent(data.report);
                setShowReportDialog(true);
            } else {
                throw new Error("AI không phản hồi. Vui lòng thử lại sau.");
            }
        } catch (err: any) {
            console.error("AI Full Error Details:", err);

            const errorMsg = err.message || "";
            let description = "Không thể kết nối với Edge Function. Vui lòng kiểm tra lại kết nối mạng hoặc deploy function.";

            if (errorMsg.includes("404")) {
                description = "Chưa tìm thấy Edge Function trên server. Vui lòng chạy lệnh deploy.";
            } else if (errorMsg.includes("non-2xx")) {
                description = "Lỗi hệ thống AI (500). Vui lòng thử lại sau giây lát.";
            }

            toast({
                title: "Lỗi kết nối AI",
                description: description,
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
        <div className={cn("grid grid-cols-1 xl:grid-cols-5 gap-8 min-h-[500px] w-full", className)}>
            {/* Left/Middle: Video Player and Controls */}
            <div className="xl:col-span-3 flex flex-col gap-6">
                <div className="relative rounded-[40px] overflow-hidden bg-[#0A0A0B] aspect-video group shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border-[6px] border-white/5 flex-0 shrink-0">
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full h-full object-contain"
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        crossOrigin="anonymous"
                        playsInline
                        controls
                    />
                </div>

                {/* Info Bar & Quick Add */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-white/80 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl shadow-purple-500/5 border border-white/40 gap-6">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center justify-center w-20 h-20 bg-purple-600 text-white rounded-[24px] shadow-lg shadow-purple-600/30">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-0.5">Time</span>
                            <span className="text-xl font-black tabular-nums tracking-tighter leading-none">
                                {formatTime(currentTime)}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                <p className="text-[11px] font-black text-purple-400 uppercase tracking-[0.2em] leading-none">Session Monitoring</p>
                            </div>
                            <p className="text-2xl font-black text-gray-900 tracking-tight leading-none">{patientName}</p>
                        </div>
                    </div>

                    <Button
                        onClick={() => setIsCommentBoxOpen(true)}
                        size="lg"
                        className="bg-purple-600 hover:bg-purple-700 text-white gap-4 rounded-[24px] h-16 px-10 shadow-xl shadow-purple-600/20 text-lg font-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus size={28} strokeWidth={3} />
                        THÊM GHI CHÚ
                    </Button>
                </div>

                {/* Add Comment Input Modal/Box */}
                <AnimatePresence>
                    {isCommentBoxOpen && (
                        <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-[32px] border-2 border-purple-200/50 shadow-2xl space-y-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                        <MessageSquare size={22} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">Chi tiết quan sát</h4>
                                        <p className="text-sm font-bold text-purple-500">Tại thời điểm {formatTime(currentTime)}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsCommentBoxOpen(false)} className="rounded-full hover:bg-purple-100/50">
                                    <X size={20} className="text-gray-400" />
                                </Button>
                            </div>
                            <Textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Ghi nhận hành vi, phản ứng hoặc tiến triển của bé tại đây..."
                                className="min-h-[160px] text-lg bg-white border-purple-100/50 focus:ring-purple-500 rounded-[24px] p-6 leading-relaxed shadow-inner"
                                autoFocus
                            />
                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="ghost" onClick={() => setIsCommentBoxOpen(false)} className="rounded-2xl h-14 px-8 font-bold text-gray-400">Hủy bỏ</Button>
                                <Button onClick={handleSaveComment} className="bg-purple-600 hover:bg-purple-700 text-white rounded-[20px] h-14 px-10 font-black text-lg shadow-lg shadow-purple-600/20">Lưu nhận xét</Button>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right Side: Timeline & Analysis */}
            <div className="xl:col-span-2 flex flex-col h-full bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden min-h-[500px]">
                <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter leading-none">Ghi chú lâm sàng</h3>
                            <p className="text-sm font-bold text-gray-400">{comments.length} quan sát đã ghi nhận</p>
                        </div>
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                            <Sparkles size={24} />
                        </div>
                    </div>

                    <Button
                        size="lg"
                        className="w-full gap-4 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white rounded-[24px] h-16 shadow-xl shadow-purple-600/20 font-black text-lg transition-all hover:shadow-2xl hover:shadow-purple-600/30 hover:-translate-y-0.5"
                        onClick={generateReport}
                        disabled={generatingReport || comments.length === 0}
                    >
                        {generatingReport ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                            <div className="relative">
                                <Sparkles size={24} className="animate-pulse" />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                            </div>
                        )}
                        {generatingReport ? "AI ĐANG PHÂN TÍCH..." : "XUẤT BÁO CÁO AI"}
                    </Button>
                </div>

                <div className="mx-8 h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent" />

                <ScrollArea className="flex-1 px-8 py-6">
                    <div className="space-y-4 pb-8">
                        {comments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 text-center opacity-60">
                                <div className="p-8 bg-gray-50 rounded-[32px] mb-6 transform -rotate-3">
                                    <MessageSquare className="text-gray-300" size={48} strokeWidth={1.5} />
                                </div>
                                <p className="text-xl font-black text-gray-400 tracking-tight">Trống</p>
                                <p className="text-sm text-gray-400 font-medium max-w-[200px] mt-2 italic leading-relaxed">
                                    Thêm ghi chú trong khi xem video để AI có thể phân tích
                                </p>
                            </div>
                        ) : (
                            comments.map((comment, idx) => (
                                <div
                                    key={comment.id}
                                    className="group p-6 rounded-[28px] bg-white border border-gray-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 cursor-pointer relative"
                                    onClick={() => seekTo(comment.timestamp)}
                                >
                                    <div className="flex items-start gap-5">
                                        <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex flex-col items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                                            <span className="text-[9px] font-black uppercase opacity-60">T+</span>
                                            <span className="text-sm font-black tabular-nums leading-none">
                                                {formatTime(comment.timestamp)}
                                            </span>
                                        </div>
                                        <div className="flex-1 space-y-2 pt-1">
                                            <p className="text-lg font-bold text-gray-800 leading-snug group-hover:text-gray-900">{comment.content}</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-[2px] bg-purple-200 rounded-full" />
                                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em]">Observation #{idx + 1}</p>
                                            </div>
                                        </div>
                                        <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight size={20} className="text-purple-400" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>

                <div className="p-8 bg-gray-50/50 backdrop-blur-sm border-t border-gray-100">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] text-center">
                        Clinical AI Analysis &copy; 2026
                    </p>
                </div>
            </div>

            {/* AI Report Dialog */}
            <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden rounded-[40px] p-0 border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] bg-white">
                    <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-950 p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400/10 rounded-full -ml-16 -mb-16 blur-2xl" />

                        <DialogHeader className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                                    <Sparkles size={24} className="text-purple-200" />
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-purple-200">AI CLINICAL ASSISTANT</span>
                            </div>
                            <DialogTitle className="text-4xl font-black uppercase tracking-tight leading-none mb-2">BÁO CÁO TIẾN ĐỘ</DialogTitle>
                            <DialogDescription className="text-purple-100/80 text-lg font-medium">
                                Tổng hợp từ {comments.length} quan sát lâm sàng cho bé <span className="text-white font-black">{patientName}</span>.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <ScrollArea className="max-h-[calc(92vh-280px)]">
                        <div className="p-10">
                            <div className="bg-white p-12 rounded-[32px] shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 prose prose-lg dark:prose-invert max-w-none 
                                prose-headings:text-purple-900 prose-headings:font-black prose-headings:tracking-tight
                                prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-gray-900
                                prose-ul:list-disc prose-li:text-gray-600">
                                <ReactMarkdown>{reportContent || ''}</ReactMarkdown>
                            </div>
                        </div>
                    </ScrollArea>

                    <div className="flex flex-col sm:flex-row justify-end gap-4 p-10 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100 items-center">
                        <Button
                            variant="ghost"
                            onClick={() => setShowReportDialog(false)}
                            className="rounded-2xl h-14 px-8 font-black text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest text-xs"
                        >
                            Chỉnh sửa thêm
                        </Button>
                        <Button
                            onClick={saveReport}
                            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white rounded-[24px] h-16 px-12 font-black text-xl shadow-2xl shadow-purple-600/30 transition-all hover:scale-[1.03] active:scale-95"
                        >
                            GỬI BÁO CÁO NGAY
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

