
import { useState } from "react";
import {
    Play,
    Pause,
    RotateCcw,
    MessageSquare,
    CheckCircle2,
    AlertCircle,
    Flag,
    ChevronRight,
    FileText,
    Mic,
    MoreVertical,
    Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Mock Data
const videoQueue = [
    { id: 1, title: "Bài tập Giao tiếp mắt", parent: "Mẹ Bé Bông", duration: "03:45", status: "Chờ duyệt", date: "Hôm nay, 10:30" },
    { id: 2, title: "Kỹ năng cầm thìa", parent: "Bố Bé Sóc", duration: "02:15", status: "Chờ duyệt", date: "Hôm nay, 09:15" },
    { id: 3, title: "Bắt chước âm thanh", parent: "Mẹ Bé Na", duration: "05:10", status: "Đã xem", date: "Hôm qua" },
];

const mockComments = [
    { time: "0:45", text: "Bé đã bắt đầu có sự chú ý vào mẹ, rất tốt!", type: "praise" },
    { time: "1:20", text: "Chỗ này mẹ nên hạ thấp tầm mắt xuống chút nữa để ngang tầm với bé.", type: "correction" },
    { time: "2:10", text: "Bé duy trì mắt được 3 giây, đây là tiến bộ so với tuần trước.", type: "observation" }
];

export default function TherapistVideoReview() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(45); // seconds
    const [duration] = useState(225); // 3:45 total
    const [selectedVideo, setSelectedVideo] = useState(videoQueue[0]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="h-[calc(100vh-140px)] flex gap-6">

            {/* Left Column: Video Queue (Collapsible possibility in future, fixed for now) */}
            <div className="w-80 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hidden xl:flex">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center justify-between">
                        Danh sách chờ
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">3</Badge>
                    </h3>
                </div>
                <ScrollArea className="flex-1">
                    <div className="divide-y divide-slate-100">
                        {videoQueue.map((video) => (
                            <div
                                key={video.id}
                                onClick={() => setSelectedVideo(video)}
                                className={cn(
                                    "p-4 cursor-pointer hover:bg-slate-50 transition-colors group",
                                    selectedVideo.id === video.id ? "bg-slate-50 border-l-4 border-[#00695C]" : "border-l-4 border-transparent"
                                )}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={cn("font-bold text-sm", selectedVideo.id === video.id ? "text-[#00695C]" : "text-slate-700")}>
                                        {video.title}
                                    </h4>
                                    {video.status === 'Chờ duyệt' && <div className="h-2 w-2 rounded-full bg-emerald-500" />}
                                </div>
                                <p className="text-xs text-slate-500 mb-2">{video.parent}</p>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {video.duration}</span>
                                    <span>{video.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Middle Column: Player */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="bg-black rounded-2xl overflow-hidden shadow-2xl relative flex-1 group">
                    {/* Mock Video Content */}
                    <img
                        src="https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=1200&h=800&fit=crop"
                        alt="Therapy Session"
                        className="w-full h-full object-cover opacity-80"
                    />

                    {/* Overlay Controls */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 space-y-4">
                        {/* Timeline */}
                        <div className="relative group/timeline cursor-pointer">
                            <Slider
                                value={[currentTime]}
                                max={duration}
                                step={1}
                                className="z-10 relative"
                            />
                            {/* Comment Markers on timeline */}
                            <div className="absolute top-1/2 -translate-y-1/2 left-[20%] h-3 w-3 bg-yellow-400 rounded-full border-2 border-black z-0" />
                            <div className="absolute top-1/2 -translate-y-1/2 left-[35%] h-3 w-3 bg-red-400 rounded-full border-2 border-black z-0" />
                        </div>

                        <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-4">
                                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => setIsPlaying(!isPlaying)}>
                                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                                </Button>
                                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                                    <RotateCcw className="h-5 w-5" />
                                </Button>
                                <span className="font-mono text-sm font-medium">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-none gap-2">
                                                <Flag className="h-4 w-4" /> Gắn mốc (M)
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent><p>Phím tắt: M</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-12 border-slate-200 text-slate-700 font-bold justify-start px-4">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-600" />
                        Đạt mục tiêu: Tương tác mắt
                    </Button>
                    <Button variant="outline" className="h-12 border-slate-200 text-slate-700 font-bold justify-start px-4">
                        <AlertCircle className="mr-2 h-5 w-5 text-amber-600" />
                        Lỗi kỹ thuật: Không gian ồn
                    </Button>
                </div>
            </div>

            {/* Right Column: Analysis Panel */}
            <div className="w-96 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">Phân tích chi tiết</h3>
                    <Badge variant="outline" className="font-mono">Draft</Badge>
                </div>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-6">
                        {/* Add New Comment */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm font-medium">
                                <span className="text-slate-500">Nhận xét tại <span className="text-[#00695C] font-bold">{formatTime(currentTime)}</span></span>
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-slate-400">
                                    <Mic className="h-3 w-3" />
                                </Button>
                            </div>
                            <Textarea
                                placeholder="Nhập nhận xét của bác sĩ..."
                                className="min-h-[80px] bg-slate-50 border-slate-200 focus:bg-white transition-all text-sm resize-none"
                            />
                            <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost">Hủy</Button>
                                <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800">Lưu</Button>
                            </div>
                        </div>

                        <Separator />

                        {/* Existing Comments */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dòng thời gian ({mockComments.length})</h4>
                            {mockComments.map((comment, i) => (
                                <div key={i} className="flex gap-3 group">
                                    <div className="mt-1">
                                        <Badge variant="outline" className="font-mono text-[10px] border-slate-200 bg-white text-slate-600 font-bold px-1.5 cursor-pointer hover:bg-[#00695C] hover:text-white transition-colors">
                                            {comment.time}
                                        </Badge>
                                    </div>
                                    <div className="flex-1 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                        <p className="text-sm text-slate-700 leading-relaxed mb-1">{comment.text}</p>
                                        <div className="flex items-center gap-2">
                                            {comment.type === 'praise' && <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none text-[10px] px-1.5 py-0 h-5">Khen ngợi</Badge>}
                                            {comment.type === 'correction' && <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border-none text-[10px] px-1.5 py-0 h-5">Chỉnh sửa</Badge>}
                                            {comment.type === 'observation' && <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none text-[10px] px-1.5 py-0 h-5">Quan sát</Badge>}
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                                        <MoreVertical className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
                    <Button className="w-full bg-[#00695C] hover:bg-[#004D40] text-white font-bold h-11 shadow-lg shadow-[#00695C]/20">
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Hoàn thành & Gửi báo cáo
                    </Button>
                    <Button variant="outline" className="w-full border-slate-200 bg-white text-slate-700 font-bold h-10">
                        <FileText className="mr-2 h-4 w-4" /> Xem bản nháp PDF
                    </Button>
                </div>
            </div>
        </div>
    );
}
