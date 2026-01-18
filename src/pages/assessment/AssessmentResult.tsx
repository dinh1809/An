import React, { useMemo, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import {
    BrainCircuit, Save, RotateCcw, ShieldCheck,
    Target, Zap, Clock, ChevronRight, Loader2, CheckCircle2, XCircle
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MarkdownDisplay } from "@/components/ui/MarkdownDisplay";
import { Badge } from "@/components/ui/badge";

import { AiVocationalService } from '@/lib/AiVocationalService';
import { findTopMatches, UserMetrics } from '@/lib/CareerEngine';

interface LocationState {
    score: number;
    type: string;
    mistakes?: string[];
    timePerQuestion?: number[];
}

const AssessmentResult = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState;

    const [aiAnalysis, setAiAnalysis] = useState<string>("");
    const [isLoadingAI, setIsLoadingAI] = useState(true);

    const score = state?.score || 0;

    // 1. Calculate Core Metrics based on game playback
    const userMetrics: UserMetrics = useMemo(() => {
        // Logic to derive 0-100 metrics from game results
        // For Matrix/Raven: Focus on Logic and Visual
        const base = Math.min(100, (score / 100) * 100); // Assuming 100 is max raw score

        return {
            visual: Math.min(100, base + 15), // Raven assessment is high visual
            logic: base,
            memory: 65, // Baseline
            speed: 75,  // Baseline
            focus: 85   // Baseline
        };
    }, [score]);

    // 2. Fetch Job Matches
    const recommendedJobs = useMemo(() => findTopMatches(userMetrics), [userMetrics]);

    // 3. Radar Data Formatting
    const radarData = useMemo(() => {
        if (location.state?.isCampaign && location.state?.previousScores) {
            // Aggregate from campaign
            const scores = location.state.previousScores;
            // Default base
            let matrixScore = 0;
            let pianoScore = 0;
            let dispatcherScore = 0;

            scores.forEach((s: any) => {
                if (s.type === 'matrix') matrixScore = s.score;
                if (s.type === 'sonic_conservatory') pianoScore = s.score;
                if (s.type === 'dispatcher_console') dispatcherScore = s.score;
            });

            return [
                { subject: 'Logic', A: matrixScore, fullMark: 100 },
                { subject: 'Visual', A: Math.min(100, matrixScore + 10), fullMark: 100 },
                { subject: 'Memory', A: dispatcherScore, fullMark: 100 },
                { subject: 'Speed', A: Math.min(100, dispatcherScore + 5), fullMark: 100 }, // Dispatcher implies speed
                { subject: 'Music', A: pianoScore, fullMark: 100 }, // New Dimension
                { subject: 'Focus', A: (matrixScore + dispatcherScore + pianoScore) / 3, fullMark: 100 },
            ];
        }

        // Single Game Fallback
        return [
            { subject: 'Logic', A: userMetrics.logic, fullMark: 100 },
            { subject: 'Visual', A: userMetrics.visual, fullMark: 100 },
            { subject: 'Memory', A: userMetrics.memory, fullMark: 100 },
            { subject: 'Speed', A: userMetrics.speed, fullMark: 100 },
            { subject: 'Focus', A: userMetrics.focus, fullMark: 100 },
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
        <div className="min-h-screen bg-[#020617] text-slate-100 font-sans p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8">

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

                                <div className="absolute bottom-4 right-4 bg-slate-950/80 p-2 rounded border border-slate-800 text-xs text-slate-400 font-mono">
                                    AVG SCORE: {Math.round(score)}
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
                                ) : (
                                    <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                                        <MarkdownDisplay content={aiAnalysis} />
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
                                {recommendedJobs.map((match, idx) => (
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
                                ))}
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
                {state.type === 'matrix' && (location.state as any)?.matrixHistory && (
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
                                    {((location.state as any).matrixHistory).map((item: any, idx: number) => (
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
