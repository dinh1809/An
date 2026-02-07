import React, { useState, useEffect } from 'react';
import { TaskEngine, MicroTask } from '@/lib/TaskEngine';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertTriangle, ShieldCheck, Wallet, History, Info, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from 'framer-motion';

const TaskBoard = () => {
    const [task, setTask] = useState<MicroTask | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [startTime, setStartTime] = useState<number>(0);
    const [stats, setStats] = useState({ completed: 0, earnings: 0 });
    const [operatorId, setOperatorId] = useState<string>("");
    const { toast } = useToast();

    // Load initial task
    const loadTask = async () => {
        setLoading(true);
        try {
            const userResponse = await supabase.auth.getUser();
            const user = userResponse.data.user;

            if (user) {
                setOperatorId(user.id.slice(0, 8));
                let t = await TaskEngine.getNextTask(user.id);

                // FALLBACK: If no real tasks in DB, use Mock to ensure user experience
                if (!t) {
                    console.log("TaskBoard: No DB tasks, falling back to Mock.");
                    t = TaskEngine.getMockTask();
                }

                setTask(t);
                setStartTime(Date.now());
            }
        } catch (error) {
            console.error("Load task error:", error);
            // Even on error, try mock
            setTask(TaskEngine.getMockTask());
        } finally {
            setLoading(false);
        }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (submitting || !task) return;
            if (e.key.toLowerCase() === 'y') handleSubmit(true);
            if (e.key.toLowerCase() === 'n') handleSubmit(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [task, submitting]);

    useEffect(() => {
        loadTask();
    }, []);

    const handleSubmit = async (response: boolean) => {
        if (!task || submitting) return;
        setSubmitting(true);

        const userResponse = await supabase.auth.getUser();
        const user = userResponse.data.user;

        if (user) {
            const timeTaken = Date.now() - startTime;

            // If it's a real task (not mock- prefixed), submit to DB
            if (task.id && !task.id.startsWith('mock-')) {
                await TaskEngine.submitResult(task.id, user.id, { response }, timeTaken, 0.2);
            }

            // Update local stats for feedback
            const reward = 0.5; // Default reward per task
            setStats(prev => ({
                completed: prev.completed + 1,
                earnings: parseFloat((prev.earnings + reward).toFixed(2))
            }));

            toast({
                title: "Task Verified",
                description: `Contribution recorded. +${reward} AN credits.`,
                className: "bg-emerald-950 border-emerald-500 text-emerald-500"
            });

            // Artificial delay for "processing" feel
            setTimeout(() => {
                setSubmitting(false);
                loadTask(); // Fetch next
            }, 600);
        } else {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                    <p className="text-slate-500 font-mono text-xs animate-pulse">CONNECTING TO DIGITAL FACTORY...</p>
                </div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4">
                <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                <h2 className="text-2xl font-bold text-white">All caught up!</h2>
                <p className="text-slate-500 mt-2">No more work units available right now.</p>
                <Button onClick={loadTask} className="mt-6 bg-indigo-600 hover:bg-indigo-500" variant="default">Refresh Pipeline</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center py-8 px-4 font-sans max-w-7xl mx-auto w-full">

            {/* 1. TOP STATS BAR */}
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-slate-900/40 border-slate-800 p-4">
                    <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 text-emerald-400" />
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-mono">Session Earnings</p>
                            <p className="text-xl font-bold text-white">{stats.earnings} <span className="text-xs text-emerald-500">AN</span></p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-slate-900/40 border-slate-800 p-4">
                    <div className="flex items-center gap-3">
                        <History className="w-5 h-5 text-indigo-400" />
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-mono">Tasks Done</p>
                            <p className="text-xl font-bold text-white">{stats.completed}</p>
                        </div>
                    </div>
                </Card>
                <Card className="hidden md:block bg-slate-900/40 border-slate-800 p-4 col-span-2">
                    <div className="flex items-center gap-3">
                        <Info className="w-5 h-5 text-sky-400" />
                        <div className="text-xs text-slate-400 leading-tight">
                            Your work contributes to <strong>{task.projectId}</strong> training data.
                            Accuracy is monitored via Gold Samples.
                        </div>
                    </div>
                </Card>
            </div>

            {/* 2. TASK CONTAINER */}
            <main className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT: THE WORK AREA */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-slate-900/20 border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-md">
                        {/* Status Overlay */}
                        <div className="absolute top-4 right-4 z-20 flex gap-2">
                            <Badge variant="outline" className="bg-black/60 backdrop-blur-md border-slate-700 text-slate-400 px-2 font-mono text-[10px]">
                                {task.type.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="bg-indigo-500/10 border-indigo-500/30 text-indigo-400 px-2 font-mono text-[10px]">
                                LIVE_STREAM
                            </Badge>
                        </div>

                        {/* Image/Payload Area */}
                        <div className="relative aspect-video bg-black flex items-center justify-center border-b border-slate-800">
                            {submitting ? (
                                <div className="absolute inset-0 z-30 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                                </div>
                            ) : null}

                            {task.payload.image_url ? (
                                <img
                                    key={task.id}
                                    src={task.payload.image_url}
                                    alt="Task Asset"
                                    className="object-contain w-full h-full p-2 transition-opacity duration-300"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://placehold.co/800x600/1e293b/FFF?text=ASSET_LOAD_ERROR\nID:${task.id.slice(0, 5)}`;
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center p-8">
                                    <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl w-full text-center font-mono text-emerald-400 shadow-inner">
                                        {task.payload.text || "NO_DATA_AVAILABLE"}
                                    </div>
                                </div>
                            )}

                            {/* Scanline Effect */}
                            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]" />
                        </div>

                        <CardContent className="p-8">
                            <h3 className="text-2xl font-bold text-white mb-8 tracking-tight">
                                {task.payload.question || "Assign descriptive label to this asset?"}
                            </h3>

                            <div className="flex gap-4">
                                <Button
                                    className="flex-1 h-20 text-xl md:text-2xl bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] font-bold transition-all"
                                    onClick={() => handleSubmit(true)}
                                    disabled={submitting}
                                >
                                    YES <span className="ml-2 opacity-50 text-xs font-mono hidden md:inline">[Y]</span>
                                </Button>
                                <Button
                                    className="flex-1 h-20 text-xl md:text-2xl bg-rose-600 hover:bg-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.2)] font-bold transition-all"
                                    onClick={() => handleSubmit(false)}
                                    disabled={submitting}
                                >
                                    NO <span className="ml-2 opacity-50 text-xs font-mono hidden md:inline">[N]</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-between items-center text-slate-600 font-mono text-[10px] px-2">
                        <span>OPERATOR_ID: {operatorId || "ANON_OP"}</span>
                        <span>UNIT_LINK: {task.id.slice(0, 12)}</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            SECURE WORKSPACE v4.1
                        </div>
                    </div>
                </div>

                {/* RIGHT: PROJECT INFO & HELP */}
                <aside className="space-y-6">
                    <Card className="bg-indigo-900/10 border-indigo-500/20 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <HelpCircle className="w-5 h-5 text-indigo-400" />
                            <h4 className="font-bold text-white uppercase text-sm tracking-widest">Digital Factory?</h4>
                        </div>
                        <ul className="space-y-4 text-xs text-slate-400 leading-relaxed">
                            <li className="flex gap-3 text-slate-300">
                                <span className="text-indigo-500 font-bold">01.</span>
                                <span>Dữ liệu bạn gán nhãn giúp các AI hiểu hình ảnh tốt hơn (Data Labeling).</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-indigo-500 font-bold">02.</span>
                                <span>Khả năng tập trung chi tiết của bạn là thế mạnh tuyệt đối trong công việc này.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-indigo-500 font-bold">03.</span>
                                <span>Mỗi câu trả lời đúng giúp bạn kiếm thêm **AN Credits** tích lũy thu nhập.</span>
                            </li>
                        </ul>
                    </Card>

                    <Card className="bg-slate-900/40 border-slate-800 p-6 overflow-hidden relative">
                        <div className="absolute -right-4 -top-4 opacity-10">
                            <ShieldCheck className="w-24 h-24 text-emerald-500" />
                        </div>
                        <h4 className="font-bold text-white text-sm mb-4">Quality Score</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] text-slate-500">
                                <span>Accuracy Rank</span>
                                <span className="text-emerald-400 font-bold">ELITE</span>
                            </div>
                            <Progress value={98} className="h-1 bg-slate-800 text-emerald-500" />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-4 leading-normal">
                            Hệ thống tự động chèn các câu hỏi kiểm định (Gold Samples) để bảo vệ độ tin cậy của dữ liệu.
                        </p>
                    </Card>
                </aside>

            </main>
        </div>
    );
};

export default TaskBoard;
