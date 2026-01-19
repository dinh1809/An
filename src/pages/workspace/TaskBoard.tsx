import React, { useState, useEffect } from 'react';
import { TaskEngine, MicroTask } from '@/lib/TaskEngine';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const TaskBoard = () => {
    const [task, setTask] = useState<MicroTask | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [startTime, setStartTime] = useState<number>(0);

    // Load initial task
    const loadTask = async () => {
        setLoading(true);
        const user = (await supabase.auth.getUser()).data.user;
        if (user) {
            const t = await TaskEngine.getNextTask(user.id);
            setTask(t);
            setStartTime(Date.now());
        }
        setLoading(false);
    };

    useEffect(() => {
        loadTask();
    }, []);

    const handleSubmit = async (response: boolean) => {
        if (!task) return;
        setSubmitting(true);
        const user = (await supabase.auth.getUser()).data.user;

        if (user) {
            const timeTaken = Date.now() - startTime;
            // Mock jitter for now
            await TaskEngine.submitResult(task.id, user.id, { response }, timeTaken, 0.2);

            // Artificial delay for "processing" feel
            setTimeout(() => {
                setSubmitting(false);
                loadTask(); // Fetch next
            }, 500);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800">All caught up!</h2>
                <p className="text-slate-500 mt-2">No more tasks available right now.</p>
                <Button onClick={loadTask} className="mt-6" variant="outline">Refresh</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center py-12 px-4 transition-colors duration-500">
            {/* FOCUS HEADER */}
            <div className="w-full max-w-2xl flex justify-between items-center mb-8 opacity-50 hover:opacity-100 transition-opacity">
                <span className="font-mono text-xs uppercase tracking-widest text-slate-400">
                    Project: {task.projectId}
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-slate-400">
                    ID: {task.id.slice(0, 8)}
                </span>
            </div>

            {/* TASK CARD */}
            <Card className="w-full max-w-2xl bg-slate-800 border-slate-700 shadow-2xl overflow-hidden">
                <div className="relative aspect-video bg-black flex items-center justify-center p-4">
                    {task.payload.image_url ? (
                        <img
                            src={task.payload.image_url}
                            alt="Task"
                            className="object-contain w-full h-full"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://placehold.co/600x400/1e293b/FFF?text=Image+Load+Error";
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="bg-slate-900 border border-slate-700 p-8 rounded-xl max-w-lg w-full font-mono text-emerald-400">
                                {task.payload.text || "No text data provided"}
                            </div>
                        </div>
                    )}
                </div>

                <CardContent className="p-8">
                    <h3 className="text-xl font-medium text-white mb-6">
                        {task.payload.question || "Does this image match the criteria?"}
                    </h3>

                    <div className="flex gap-4">
                        <Button
                            className="flex-1 h-14 text-lg bg-emerald-600 hover:bg-emerald-500"
                            onClick={() => handleSubmit(true)}
                            disabled={submitting}
                        >
                            YES (Safe)
                        </Button>
                        <Button
                            className="flex-1 h-14 text-lg bg-rose-600 hover:bg-rose-500"
                            onClick={() => handleSubmit(false)}
                            disabled={submitting}
                        >
                            NO (Violates)
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <p className="mt-8 text-slate-500 text-sm font-mono">
                Press 'Y' for YES • Press 'N' for NO
            </p>
        </div>
    );
};

export default TaskBoard;
