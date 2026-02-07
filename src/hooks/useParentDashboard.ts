import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DashboardMetrics {
    completedExercises: number;
    totalExercises: number;
    streakDays: number; // Mocked
    xpTotal: number;    // Mocked
}

export interface ExerciseItem {
    id: string;
    title: string;
    doctor_name: string;
    is_completed: boolean;
    assigned_at: string;
}

export interface AppointmentItem {
    id: string;
    start_time: string;
    end_time: string;
    title: string | null;
    therapist_name: string;
}

export function useParentDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        completedExercises: 0,
        totalExercises: 0,
        streakDays: 0,
        xpTotal: 0
    });
    const [exercises, setExercises] = useState<ExerciseItem[]>([]);
    const [appointment, setAppointment] = useState<AppointmentItem | null>(null);
    const [moodToday, setMoodToday] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchDashboardData = async () => {
            try {
                // Parallel fetching for performance
                const [exercisesRes, appointmentRes, moodRes] = await Promise.all([
                    // 1. Fetch Exercises
                    supabase
                        .from("exercises")
                        .select("*")
                        .eq("user_id", user.id)
                        .order("assigned_at", { ascending: false })
                        .limit(10),

                    // 2. Fetch Upcoming Appointment
                    supabase
                        .from("appointments")
                        .select(`
                            id, start_time, end_time, title, therapist_id
                        `)
                        .or(`parent_id.eq.${user.id},therapist_id.eq.${user.id}`)
                        .gte("start_time", new Date().toISOString())
                        .order("start_time", { ascending: true })
                        .limit(1)
                        .maybeSingle(),

                    // 3. Fetch Mood Today
                    supabase
                        .from("behavior_logs")
                        .select("mood, logged_at")
                        .eq("user_id", user.id)
                        .order("logged_at", { ascending: false })
                        .limit(1)
                        .maybeSingle()
                ]);

                if (exercisesRes.error) throw exercisesRes.error;

                // Process Exercises
                const loadedExercises: ExerciseItem[] = (exercisesRes.data || []).map(ex => ({
                    id: ex.id,
                    title: ex.title,
                    doctor_name: ex.doctor_name,
                    is_completed: ex.is_completed || false,
                    assigned_at: ex.assigned_at
                }));

                const completedCount = loadedExercises.filter(e => e.is_completed).length;
                const totalCount = loadedExercises.length;

                // Process Appointment - TYPE GUARDED
                let upcomingAppt: AppointmentItem | null = null;
                if (appointmentRes.data) {
                    const rawAppt = appointmentRes.data;
                    // Simplified: No join processing for stability
                    const therapistName = "Bác sĩ điều trị";

                    upcomingAppt = {
                        id: rawAppt.id,
                        start_time: rawAppt.start_time,
                        end_time: rawAppt.end_time,
                        title: rawAppt.title,
                        therapist_name: therapistName
                    };
                }

                // Process Mood
                // Check if the mood log is actually from "today"
                let currentMood = null;
                if (moodRes.data) {
                    const logDate = new Date(moodRes.data.logged_at).toDateString();
                    const today = new Date().toDateString();
                    if (logDate === today) {
                        currentMood = moodRes.data.mood;
                    }
                }

                setExercises(loadedExercises);
                setAppointment(upcomingAppt);
                setMoodToday(currentMood);
                setMetrics({
                    completedExercises: completedCount,
                    totalExercises: totalCount,
                    streakDays: 5,
                    xpTotal: 1250
                });

            } catch (err: any) {
                console.error("Error fetching dashboard data:", err);
                setError(err.message || "Failed to fetch dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    return {
        metrics,
        exercises,
        appointment,
        moodToday,
        loading,
        error
    };
}
