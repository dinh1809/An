import React, { useMemo, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import {
    BrainCircuit, Save, RotateCcw, ShieldCheck,
    Target, Zap, Clock, ChevronRight, Loader2, CheckCircle2, XCircle, Triangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MarkdownDisplay } from "@/components/ui/MarkdownDisplay";
import { Badge } from "@/components/ui/badge";

// DEPRECATED: Career features moved to _deprecated folder but still used for assessment results
import { AiVocationalService } from '@/_deprecated/career/lib/AiVocationalService';
import { findTopMatches, UserMetrics } from '@/_deprecated/career/lib/CareerEngine';

interface LocationState {
    score?: number;
    type?: string;
    mistakes?: string[];
    timePerQuestion?: number[];
    isCampaign?: boolean;
    previousScores?: any[];
}

const AssessmentResult = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState;
    // NEW: Get session from URL
    const searchParams = new URLSearchParams(location.search);
    // NEW: Get session from URL with robust parsing
    const rawSessionId = searchParams.get('session');
    const sessionId = (rawSessionId && rawSessionId !== 'null' && rawSessionId !== 'undefined') ? rawSessionId : null;

    // State for real data
    const [realMetrics, setRealMetrics] = useState<UserMetrics | null>(null);
    const [zScoreData, setZScoreData] = useState<{ zScore: number, percentile: number } | null>(null);
    const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
    const [currentScore, setCurrentScore] = useState(0);

    const [aiAnalysis, setAiAnalysis] = useState<string>("");
    const [isLoadingAI, setIsLoadingAI] = useState(true);

    // Fetch Session & Calculate Metrics
    useEffect(() => {
        const calculateScience = async () => {
            if (!sessionId) {
                // Fallback to legacy state if no session ID
                if (state?.score) {
                    const base = Math.min(100, (state.score / 100) * 100);
                    setRealMetrics({
                        visual: Math.min(100, base + 15),
                        logic: base,
                        memory: 65,
                        speed: 75,
                        focus: 85
                    });
                }
                setIsLoadingMetrics(false);
                return;
            }

            try {
                // 1. Get User
                const userResponse = await supabase.auth.getUser();
                const user = userResponse.data.user;
                if (!user) {
                    setIsLoadingMetrics(false);
                    return;
                }

                // 2. Fetch Latest Session for EACH game type to link scores
                const { data: allSessions, error: sessionError } = await supabase
                    .from('game_sessions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('completed_at', { ascending: false });

                if (sessionError) throw sessionError;

                // Group by type to get the latest
                const latestByType: Record<string, any> = {};
                allSessions?.forEach(s => {
                    if (!latestByType[s.game_type]) {
                        latestByType[s.game_type] = s;
                    }
                });

                // Find the one that was JUST completed (if sessionId exists)
                const foundSelf = allSessions?.find(s => s.id === sessionId);
                const currentSession = (sessionId && foundSelf) ? latestByType[foundSelf.game_type] : allSessions?.[0];

                if (currentSession) {
                    setCurrentScore(currentSession.final_score || 0);
                }

                // 3. Fetch Global Stats for Z-Score (of the current game)
                if (currentSession) {
                    const { data: globalStats } = await supabase
                        .from('global_stats_view')
                        .select('*')
                        .eq('game_type', currentSession.game_type)
                        .maybeSingle();

                    if (globalStats && currentSession.avg_reaction_time_ms && globalStats.global_std_latency > 0) {
                        const z = (currentSession.avg_reaction_time_ms - globalStats.global_mean_latency) / globalStats.global_std_latency;

                        if (isFinite(z)) {
                            const percentile = Math.round((0.5 * (1 + (z > 0 ? -1 : 1) * Math.sqrt(1 - Math.exp(-2 * z * z / Math.PI)))) * 100);
                            setZScoreData({
                                zScore: parseFloat(z.toFixed(2)),
                                percentile: z < 0 ? Math.max(percentile, 50) : Math.min(percentile, 50)
                            });
                        }
                    }
                }

                // 4. Map to Radar Metrics (Aggregated Linkage)
                // We use weights from different games
                // Mapping logic with safety defaults
                const getScore = (type: string) => latestByType[type]?.final_score || 0;
                const getAccuracy = (type: string) => latestByType[type]?.accuracy_percentage || 70;
                const getSpeed = (type: string) => {
                    const rt = latestByType[type]?.avg_reaction_time_ms;
                    return rt ? Math.min(100, Math.max(0, 100 - (rt / 20))) : 0;
                };

                // Logic: Matrix + Core Rules
                const logic = (getScore('matrix_assessment') / 25 + getScore('stroop_chaos') / 30) / 2 ||
                    getScore('matrix_assessment') / 25 ||
                    getScore('stroop_chaos') / 30 || 50;

                // Visual: Detail Spotter + Logic Matrix
                const visual = (getScore('detail_spotter') / 20 + getScore('matrix_assessment') / 30) / 2 ||
                    getScore('detail_spotter') / 20 || 50;

                // Memory: Piano (Sonic) + Dispatcher (Inhibition)
                const memory = (getAccuracy('sonic_conservatory') + getAccuracy('dispatcher_console')) / 2 ||
                    getAccuracy('sonic_conservatory') ||
                    getAccuracy('dispatcher_console') || 50;

                // Speed: Detail Spotter (Speed) + Dispatcher (Response)
                const speed = (getSpeed('detail_spotter') + getSpeed('dispatcher_console')) / 2 ||
                    getSpeed('detail_spotter') ||
                    getSpeed('dispatcher_console') || 50;

                // Focus: Overall consistency across high-engagement games
                const focus = (getAccuracy('detail_spotter') + getAccuracy('stroop_chaos') + getAccuracy('dispatcher_console')) / 3 || 75;

                const metrics = {
                    visual: Math.min(100, Math.max(30, visual)),
                    logic: Math.min(100, Math.max(30, logic)),
                    memory: Math.min(100, Math.max(30, memory)),
                    speed: Math.min(100, Math.max(30, speed)),
                    focus: Math.min(100, Math.max(30, focus))
                };

                setRealMetrics(metrics);
                console.log("Diagnostic metrics calculated:", metrics);

            } catch (e) {
                console.error("Critical error in calculateScience:", e);
                setIsLoadingMetrics(false);
            } finally {
                setIsLoadingMetrics(false);
            }
        };

        calculateScience();
    }, [sessionId, state]);

    const userMetrics = realMetrics || { visual: 0, logic: 0, memory: 0, speed: 0, focus: 0 };

    // 2. Fetch Job Matches
    const recommendedJobs = useMemo(() => findTopMatches(userMetrics), [userMetrics]);

    // Safety Loading Check
    if (isLoadingMetrics) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center text-teal-500">
                <Loader2 className="w-10 h-10 animate-spin" />
            </div>
        );
    }

    // Safety Data Check
    if (!realMetrics && !state?.score) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-6">
                    <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mx-auto border border-slate-800">
                        <Triangle className="w-10 h-10 text-yellow-500/50 fill-yellow-500/10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-white">No Diagnostic Data</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            We couldn't retrieve your latest assessment session. This usually happens if the session was interrupted or didn't sync correctly.
                        </p>
                    </div>
                    <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                        <Button onClick={() => navigate('/assessment')} variant="outline" className="border-slate-800">
                            Return to Hub
                        </Button>
                        <Button onClick={() => window.location.reload()} className="bg-teal-600">
                            Retry Sync
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Radar Data Formatting
    const radarData = useMemo(() => {
        const state = location.state as LocationState;
        if (state?.isCampaign && state?.previousScores) {
            // Aggregate from campaign
            const scores = state.previousScores;
            // Default base
            let matrixScore = 0;
            let pianoScore = 0;
            let dispatcherScore = 0;

            (scores || []).forEach((s: any) => {
                const sScore = Number(s?.score) || 0;
                if (s?.type === 'matrix') matrixScore = sScore;
                if (s?.type === 'sonic_conservatory') pianoScore = sScore;
                if (s?.type === 'dispatcher_console') dispatcherScore = sScore;
            });

            return [
                { subject: 'Logic', A: Number(matrixScore) || 50, fullMark: 100 },
                { subject: 'Visual', A: Number(Math.min(100, matrixScore + 10)) || 50, fullMark: 100 },
                { subject: 'Memory', A: Number(dispatcherScore) || 50, fullMark: 100 },
                { subject: 'Speed', A: Number(Math.min(100, dispatcherScore + 5)) || 50, fullMark: 100 },
                { subject: 'Music', A: Number(pianoScore) || 50, fullMark: 100 },
                { subject: 'Focus', A: Number((matrixScore + dispatcherScore + pianoScore) / 3) || 50, fullMark: 100 },
            ];
        }

        // Single Game Fallback
        const metrics = userMetrics || { visual: 50, logic: 50, memory: 50, speed: 50, focus: 50 };
        return [
            { subject: 'Logic', A: Number(metrics.logic) || 50, fullMark: 100 },
            { subject: 'Visual', A: Number(metrics.visual) || 50, fullMark: 100 },
            { subject: 'Memory', A: Number(metrics.memory) || 50, fullMark: 100 },
            { subject: 'Speed', A: Number(metrics.speed) || 50, fullMark: 100 },
            { subject: 'Focus', A: Number(metrics.focus) || 50, fullMark: 100 },
        ];
    }, [userMetrics, location.state]);

    // 4. Trigger AI Analysis
    useEffect(() => {
        const fetchAI = async () => {
            setIsLoadingAI(true);
            const advice = await AiVocationalService.generateAdvice(userMetrics);
            setAiAnalysis(advice);
            setIsLoadingAI(false);
        };
        fetchAI();
    }, [userMetrics]);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 font-sans p-6 md:p-12 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-8 pb-12">

                {/* 1. HEADER LOG */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <BrainCircuit className="w-6 h-6 text-teal-500" />
                            <h1 className="text-2xl font-bold tracking-tight text-white font-heading">
                                Cognitive Audit Report
                            </h1>
                        </div>
                        <p className="text-slate-500 font-mono text-sm tracking-wide">
                            LOG ID: #AZ-{Date.now().toString().slice(-8)} • STATUS: COMPLETED
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300"
                            onClick={() => navigate('/assessment')}
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Return to Hub
                        </Button>
                        <Button className="bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_20px_-5px_rgba(20,184,166,0.3)]">
                            <Save className="w-4 h-4 mr-2" />
                            Save to Passport
                        </Button>
                    </div>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* --- LEFT COLUMN (DATA) --- */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 2. RADAR CHART SECTION */}
                        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm overflow-hidden">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg font-medium text-slate-200">
                                    <Target className="w-5 h-5 text-teal-400" />
                                    Performance Vector
                                </CardTitle>
                                <CardDescription className="text-slate-500">
                                    Multi-dimensional analysis of cognitive attributes.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-[350px] flex items-center justify-center relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                        <PolarGrid stroke="#1e293b" />
                                        <PolarAngleAxis
                                            dataKey="subject"
                                            tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }}
                                        />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar
                                            name="Candidate"
                                            dataKey="A"
                                            stroke="#14b8a6"
                                            strokeWidth={3}
                                            fill="#14b8a6"
                                            fillOpacity={0.2}
                                            dot={{ r: 4, fill: '#14b8a6', strokeWidth: 0 }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>

                                <div className="absolute bottom-4 right-4 bg-slate-950/80 p-3 rounded border border-slate-800 text-xs text-slate-400 font-mono text-right">
                                    <div>LATEST SCORE: {Math.round(Number(currentScore) || 0)}</div>
                                    {zScoreData && isFinite(zScoreData.zScore) && (
                                        <>
                                            <div className="text-teal-400 font-bold mt-1">
                                                Z-SCORE: {zScoreData.zScore > 0 ? '+' : ''}{zScoreData.zScore}
                                            </div>
                                            <div className="text-indigo-400">
                                                TOP {Math.max(1, 100 - (Number(zScoreData.percentile) || 50))}%
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 3. AI ANALYSIS BOX */}
                        <Card className="bg-slate-950 border-slate-800 lg:border-l-4 lg:border-l-teal-500 min-h-[300px] flex flex-col">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base text-teal-400 font-mono uppercase tracking-wider">
                                    <Zap className="w-4 h-4" />
                                    AI Insight Generation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1">
                                {isLoadingAI ? (
                                    <div className="h-full flex flex-col items-center justify-center py-12 gap-3">
                                        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                                        <p className="text-slate-500 font-mono text-xs animate-pulse">Consulting AN AI Vocational Brain...</p>
                                    </div>
                                ) : aiAnalysis ? (
                                    <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                                        <MarkdownDisplay content={aiAnalysis} />
                                    </div>
                                ) : (
                                    <div className="text-slate-500 font-mono text-xs italic py-8 text-center bg-slate-900/20 rounded">
                                        No specific insights generated for this profile yet.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* --- RIGHT COLUMN (ACTIONABLE) --- */}
                    <div className="space-y-6">

                        {/* 4. CAREER FIT CARD */}
                        <Card className="bg-slate-900/60 border-slate-800 h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg text-white">
                                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                                    Career Match
                                </CardTitle>
                                <CardDescription>
                                    Roles aligning with your cognitive profile.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {recommendedJobs && recommendedJobs.length > 0 ? (
                                    recommendedJobs.map((match, idx) => (
                                        <div key={idx} className="space-y-2 group cursor-pointer">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-slate-200 group-hover:text-teal-400 transition-colors">
                                                    {match.job.title}
                                                </span>
                                                <span className="font-mono text-sm text-teal-400">{match.matchScore}%</span>
                                            </div>
                                            <Progress value={match.matchScore} className="h-1.5 bg-slate-800" indicatorClassName="bg-gradient-to-r from-teal-500 to-indigo-500" />
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {match.job.tags.map(tag => (
                                                    <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-800 text-slate-400">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center">
                                        <p className="text-slate-500 text-sm">No career matches found yet.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 5. NEXT STEPS PROMPT */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-xl border border-slate-700/50">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-lg">
                                    <Clock className="w-6 h-6 text-blue-400" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-white">Next Session Ready</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Deepen your profile by completing the <strong>Memory Sequence</strong> module for better job matching accuracy.
                                    </p>
                                    <Button size="sm" variant="link" className="text-blue-400 p-0 h-auto hover:text-blue-300" onClick={() => navigate('/assessment/sequence-memory')}>
                                        Start Module <ChevronRight className="w-3 h-3 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
                {/* 6. LOGIC BREAKDOWN (For Matrix) */}
                {state?.type === 'matrix' && (location.state as any)?.matrixHistory && (
                    <div className="lg:col-span-3">
                        <Card className="bg-slate-900/40 border-slate-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <BrainCircuit className="w-5 h-5 text-teal-400" />
                                    Logic Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {((location.state as any)?.matrixHistory || []).map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-slate-950/50 border border-slate-800">
                                            <div className="mt-1">
                                                {item.isCorrect ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-500" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-200 mb-1">
                                                    Sequence #{idx + 1} {item.isCorrect ? <span className="text-green-500 ml-2">PASSED</span> : <span className="text-red-500 ml-2">FAILED</span>}
                                                </h4>
                                                <p className="text-xs text-slate-400 font-mono">
                                                    {item.explanation}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssessmentResult;
