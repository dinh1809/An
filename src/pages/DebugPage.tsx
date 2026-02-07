/**
 * Debug Page - Check database directly
 * Navigate to /debug to use
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const DebugPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [sessions, setSessions] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loadingSessions, setLoadingSessions] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            if (authLoading) return;

            console.log("Debug: user =", user);
            setLoadingSessions(true);

            if (!user) {
                setSessions([]);
                setLoadingSessions(false);
                return;
            }

            try {
                const { data, error: fetchError } = await supabase
                    .from("game_sessions")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("started_at", { ascending: false });

                console.log("Debug: Fetch result", { data, fetchError });

                if (fetchError) {
                    setError(`Supabase error: ${fetchError.message}`);
                } else {
                    setSessions(data || []);
                }
            } catch (err: any) {
                setError(`Exception: ${err.message}`);
            } finally {
                setLoadingSessions(false);
            }
        };

        fetchSessions();
    }, [user, authLoading]);

    if (authLoading) {
        return <div className="p-8 text-center text-slate-500">Checking authentication...</div>;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">🔍 Database Debug</h1>

            <div className="bg-slate-100 p-4 rounded-lg mb-6">
                <h2 className="font-semibold mb-2">User Status:</h2>
                <pre className="text-sm">{user ? `Logged in as: ${user.id}` : "❌ NOT LOGGED IN"}</pre>
            </div>

            {loadingSessions && <p>Loading sessions...</p>}

            {error && (
                <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <h2 className="font-semibold mb-2">Game Sessions ({sessions.length}):</h2>

            {sessions.length === 0 ? (
                <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg">
                    No sessions found for this user. Play a game first!
                </div>
            ) : (
                <div className="space-y-4">
                    {sessions.map((session, idx) => (
                        <div key={session.id} className="bg-white border rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="font-mono text-xs text-slate-400">{session.id}</span>
                                    <h3 className="font-bold text-lg">{session.game_type}</h3>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-teal-600">
                                        {session.final_score ?? "NULL"}
                                    </div>
                                    <div className="text-sm text-slate-500">final_score</div>
                                </div>
                            </div>
                            <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                                <div>
                                    <span className="text-slate-500">Accuracy:</span> {session.accuracy_percentage ?? "NULL"}%
                                </div>
                                <div>
                                    <span className="text-slate-500">RT:</span> {session.avg_reaction_time_ms ?? "NULL"}ms
                                </div>
                                <div>
                                    <span className="text-slate-500">Completed:</span> {session.completed_at ? "✅" : "❌"}
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-slate-400">
                                Started: {session.started_at}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-8 p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold mb-2">Quick Actions:</h3>
                <a href="/assessment" className="text-teal-600 underline mr-4">Go to Assessment</a>
                <a href="/assessment/result" className="text-teal-600 underline">Go to Result Page</a>
            </div>
        </div>
    );
};

export default DebugPage;
