
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, ClipboardCheck, Clock, Laptop, ChevronRight } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { findTopMatches, UserMetrics, JobMatch } from "@/lib/CareerEngine";
import { generateVocationalPlan, VocationalPlan } from "@/lib/NeuroEngine";
import { AiRoadmapGenerator } from "@/components/AiRoadmapGenerator";

export default function AssessmentResult() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session");
    const [loading, setLoading] = useState(true);
    const [sessionData, setSessionData] = useState<any>(null);
    const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
    const [vocationalPlan, setVocationalPlan] = useState<VocationalPlan | null>(null);
    const [metricsData, setMetricsData] = useState<UserMetrics | null>(null);

    useEffect(() => {
        async function fetchResult() {
            // 1. Lấy user hiện tại
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return navigate("/login");

            // 2. Lấy session game
            let query = supabase
                .from('game_sessions')
                .select('*')
                .eq('user_id', user.id);

            if (sessionId) {
                query = query.eq('id', sessionId);
            } else {
                query = query.order('completed_at', { ascending: false });
            }

            const { data, error } = await query.limit(1).maybeSingle();

            if (error || !data) {
                console.error("Không tìm thấy kết quả:", error);
            } else {
                setSessionData(data);

                // --- METRICS CALCULATION ---
                const metrics = data.metrics || {};
                const userMetrics: UserMetrics = {
                    visual: data.accuracy_percentage || 50,
                    logic: metrics.stroop_score
                        ? Math.min(100, (metrics.stroop_score / 10) + 50)
                        : (metrics.accuracy_incongruent || 60),
                    memory: metrics.max_span_reached
                        ? Math.min(100, metrics.max_span_reached * 12)
                        : 50,
                    speed: data.avg_reaction_time_ms
                        ? Math.min(100, Math.max(10, 150 - (data.avg_reaction_time_ms / 10)))
                        : 50,
                    focus: data.accuracy_percentage ? data.accuracy_percentage : 70
                };

                setMetricsData(userMetrics);

                // 1. Job Matching
                const matches = findTopMatches(userMetrics);
                setJobMatches(matches);

                // 2. Vocational Plan Generation
                const plan = generateVocationalPlan(userMetrics);
                setVocationalPlan(plan);
            }
            setLoading(false);
        }
        fetchResult();
    }, [navigate, sessionId]);

    if (loading) return <div className="h-screen flex items-center justify-center text-white bg-slate-900">Đang tính toán kết quả...</div>;

    if (!sessionData) return (
        <div className="h-screen flex flex-col items-center justify-center text-white bg-slate-900 gap-4 font-heading">
            <h2 className="text-xl">Chưa có dữ liệu bài test nào!</h2>
            <Button onClick={() => navigate("/assessment")}>Chơi ngay</Button>
        </div>
    );

    // Radar Data
    const metrics = sessionData.metrics || {};
    const radarData = [
        { subject: 'Độ chính xác', A: sessionData.accuracy_percentage || 50, fullMark: 100 },
        { subject: 'Phản xạ', A: Math.max(10, 100 - ((sessionData.avg_reaction_time_ms || 1000) / 20)), fullMark: 100 },
        { subject: 'Logic', A: metrics.stroop_interference_score ? Math.max(10, 100 - (metrics.stroop_interference_score / 10)) : 60, fullMark: 100 },
        { subject: 'Trí nhớ', A: (metrics.max_span_reached || 5) * 10, fullMark: 100 },
        { subject: 'Linh hoạt', A: metrics.total_switches ? Math.min(100, metrics.total_switches * 10) : 70, fullMark: 100 },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 flex flex-col items-center justify-center font-sans">
            <div className="w-full max-w-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
                <h1 className="text-3xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-brand font-heading">
                    Hồ Sơ Năng Lực Thần Kinh
                </h1>
                <p className="text-slate-400 text-center mb-8 uppercase tracking-widest text-xs">Phân tích kết quả: {sessionData.game_type}</p>

                {/* RADAR CHART */}
                <div className="w-full h-[250px] mb-8 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Bạn" dataKey="A" stroke="#189cab" fill="#189cab" fillOpacity={0.5} strokeWidth={3} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* AI COACH SECTION */}
                {metricsData && (
                    <div className="w-full mb-8">
                        <AiRoadmapGenerator metrics={metricsData} />
                    </div>
                )}

                {/* JOB MATCHING SECTION */}
                <div className="grid grid-cols-1 gap-4 w-full mb-8">
                    {jobMatches.length > 0 ? (
                        <>
                            <h3 className="text-lg font-bold text-teal-400 flex items-center gap-2 font-heading">
                                <Briefcase className="w-5 h-5" /> Kết Nối Việc Làm (AN AI)
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {jobMatches.slice(0, 2).map((match) => (
                                    <Card key={match.job.id} className="p-4 bg-slate-800/60 border-slate-700 hover:border-violet-500/50 transition-all">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-white text-sm font-heading">{match.job.title}</h4>
                                            <span className="font-black text-primary text-sm">{Math.round(match.matchScore)}%</span>
                                        </div>
                                        <p className="text-slate-400 text-xs line-clamp-2 italic font-sans text-sm">"{match.insight}"</p>
                                    </Card>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="p-4 bg-slate-800 rounded text-center text-sm text-slate-400 font-sans">Đang phân tích dữ liệu...</div>
                    )}
                </div>

                {/* VOCATIONAL TRAINING PLAN (STATIC RULE-BASED) */}
                {vocationalPlan && (
                    <div className="w-full mb-8 opacity-80 hover:opacity-100 transition-opacity">
                        <h3 className="text-lg font-bold text-secondary flex items-center gap-2 mb-3 font-heading">
                            <ClipboardCheck className="w-5 h-5" /> Chương Trình Đào Tạo Cơ Bản (Rule-Based)
                        </h3>

                        <Card className="bg-slate-800/80 border-l-4 border-l-secondary border-y-0 border-r-0 p-4 mb-4">
                            <p className="font-bold text-white text-sm mb-1 font-heading">{vocationalPlan.focusArea}</p>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans">{vocationalPlan.summary}</p>
                        </Card>

                        <div className="space-y-3">
                            {vocationalPlan.dailyTasks.map((task) => (
                                <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 text-violet-400">
                                        {task.title.includes("Nhập Liệu") || task.title.includes("Ghi Chú") ? <Laptop size={20} /> :
                                            task.title.includes("Deep Work") ? <Clock size={20} /> : <Briefcase size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="text-sm font-bold text-slate-200 font-heading">{task.title}</h4>
                                        </div>
                                        <p className="text-xs text-slate-400 font-sans">{task.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full">
                    <Button className="flex-1 h-12 bg-primary hover:bg-primary/90 font-bold font-heading text-white" onClick={() => navigate("/assessment/matrix")}>Chơi tiếp</Button>
                    <Button variant="outline" className="flex-1 h-12 border-slate-700 text-slate-300 font-heading" onClick={() => navigate("/parent/home")}>Lưu Hồ Sơ</Button>
                </div>
            </div>
        </div>
    );
}
