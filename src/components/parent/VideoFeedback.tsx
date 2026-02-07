
import React from 'react';
import { Play, MessageCircle, Info, Lightbulb, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Comment {
    timestamp: number;
    text: string;
    type: 'praise' | 'correction' | 'observation';
}

interface VideoFeedbackProps {
    readonly videoTitle: string;
    readonly date: string;
    readonly videoUrl: string;
    readonly therapistName: string;
    readonly comments: Comment[];
    readonly explanation: string;
    readonly suggestions: string[];
}

export function VideoFeedback({
    videoTitle,
    date,
    videoUrl,
    therapistName,
    comments,
    explanation,
    suggestions
}: VideoFeedbackProps) {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Left: Video Player & Timed Comments */}
            <div className="lg:col-span-2 space-y-4">
                <Card className="overflow-hidden border-none shadow-xl bg-black rounded-2xl relative group">
                    <div className="aspect-video w-full bg-slate-900 flex items-center justify-center">
                        <img
                            src="https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800&h=450&fit=crop"
                            alt="Video Thumbnail"
                            className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Button size="lg" className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 border-none group-hover:scale-110 transition-all">
                                <Play className="h-8 w-8 text-white fill-white" />
                            </Button>
                        </div>
                    </div>
                    {/* Timestamp Markers on Progress Bar (visual only) */}
                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/20">
                        {comments.map((c, i) => (
                            <div
                                key={i}
                                className="absolute top-0 w-1.5 h-full bg-primary"
                                style={{ left: `${(c.timestamp / 300) * 100}%` }} // assuming 5 min video
                            />
                        ))}
                    </div>
                </Card>

                <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <MessageCircle size={16} /> Phản hồi theo thời gian
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {comments.map((comment, index) => (
                            <Card key={index} className="p-3 border-none bg-white shadow-soft hover:shadow-md transition-all cursor-pointer group">
                                <div className="flex gap-3">
                                    <div className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded h-fit tabular-nums">
                                        {formatTime(comment.timestamp)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-foreground leading-snug">
                                            {comment.text}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Explanation & Suggestions */}
            <div className="lg:col-span-1 space-y-6">
                {/* Easy Explanation Card */}
                <Card className="p-6 border-none bg-gradient-to-br from-[#00695C] to-[#004D40] text-white shadow-xl rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Info size={20} />
                        </div>
                        <h3 className="font-bold text-lg">Giải thích chuyên môn</h3>
                    </div>
                    <div className="space-y-4">
                        <p className="text-white/90 text-sm leading-relaxed">
                            {explanation}
                        </p>

                        <div className="pt-4 border-t border-white/10">
                            <TooltipProvider>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Thuật ngữ y khoa</p>
                                <div className="flex flex-wrap gap-2">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-none cursor-help">Joint Attention</Badge>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white text-primary p-3 rounded-xl shadow-2xl border-none max-w-xs">
                                            <p className="font-bold mb-1">Dịch: Chú ý chung</p>
                                            <p className="text-xs">Là khi bé và mẹ cùng nhìn vào một vật và cùng chia sẻ sự quan tâm về vật đó.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-none cursor-help">Social Reciprocity</Badge>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white text-primary p-3 rounded-xl shadow-2xl border-none max-w-xs">
                                            <p className="font-bold mb-1">Dịch: Tương tác qua lại</p>
                                            <p className="text-xs">Cách bé phản ứng lại lời nói/hành động của mẹ một cách tự nhiên.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </TooltipProvider>
                        </div>
                    </div>
                </Card>

                {/* Suggestions Card */}
                <Card className="p-6 border-none shadow-xl bg-white rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                            <Lightbulb size={20} />
                        </div>
                        <h3 className="font-bold text-lg text-foreground">Gợi ý chỉnh bài tập</h3>
                    </div>
                    <ul className="space-y-3">
                        {suggestions.map((suggestion, i) => (
                            <li key={i} className="flex gap-3 items-start group">
                                <div className="mt-1 size-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <ChevronRight size={14} />
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {suggestion}
                                </p>
                            </li>
                        ))}
                    </ul>
                    <Button className="w-full mt-6 bg-primary hover:bg-primary/90 text-white rounded-xl h-12 font-bold shadow-lg shadow-primary/20">
                        Thực hành lại ngay
                    </Button>
                </Card>
            </div>
        </div>
    );
}
