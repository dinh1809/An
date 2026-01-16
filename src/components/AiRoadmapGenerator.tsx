
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, Loader2 } from "lucide-react";
import { AiVocationalService } from "@/lib/AiVocationalService";
import { UserMetrics } from "@/lib/CareerEngine";
import { MarkdownDisplay } from "./ui/MarkdownDisplay";

interface AiRoadmapGeneratorProps {
    metrics: UserMetrics;
}

export function AiRoadmapGenerator({ metrics }: AiRoadmapGeneratorProps) {
    const [advice, setAdvice] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        setAdvice(null);
        try {
            const result = await AiVocationalService.generateAdvice(metrics);
            setAdvice(result);
        } catch (err) {
            setAdvice("Có lỗi khi kết nối với AN AI. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleGenerate();
    }, [metrics.visual, metrics.logic]);

    return (
        <Card className="w-full bg-gradient-to-br from-slate-900 to-slate-950 border-violet-500/30 p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-[50px] pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-violet-600/20 border border-violet-500/40 shadow-glow">
                            <Sparkles className="w-5 h-5 text-violet-300 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white font-heading tracking-tight">
                                AN AI ANALYTICS
                            </h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-sans font-semibold">Tư vấn nghề nghiệp chuyên sâu</p>
                        </div>
                    </div>

                    {loading && (
                        <Badge variant="outline" className="border-violet-500 text-violet-400 animate-pulse gap-2 px-3 py-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
                        </Badge>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-slate-800/50 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-800/50 rounded w-5/6"></div>
                        <div className="h-4 bg-slate-800/50 rounded w-2/3"></div>
                        <div className="h-20 bg-slate-800/20 rounded w-full mt-6"></div>
                    </div>
                ) : advice ? (
                    <div className="w-full overflow-hidden">
                        <MarkdownDisplay content={advice} />
                    </div>
                ) : !loading && (
                    <div className="text-center py-8">
                        <Button onClick={handleGenerate} variant="outline" className="border-violet-500/50 hover:bg-violet-900/20 text-violet-300 px-6 font-heading">
                            <Brain className="w-4 h-4 mr-2" />
                            Yêu cầu AN AI phân tích lại
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
}
