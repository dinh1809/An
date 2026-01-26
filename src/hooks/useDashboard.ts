/**
 * Dashboard Hook
 * Following react:components skill - Logic isolation pattern
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { DashboardMetrics, UpcomingAppointment } from '@/data/dashboardData';

export function useDashboard() {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [appointments, setAppointments] = useState<UpcomingAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch exercises data
                const { data: exercises, error: exercisesError } = await supabase
                    .from('exercises')
                    .select('*')
                    .eq('user_id', user.id)
                    .gte('assigned_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

                if (exercisesError) throw exercisesError;

                // Calculate metrics
                const completed = exercises?.filter(e => e.is_completed).length || 0;
                const total = exercises?.length || 0;

                // Fetch mood data (if exists)
                const { data: moodData } = await supabase
                    .from('mood_logs')
                    .select('mood')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                // Fetch streak data
                const { data: streakData } = await supabase
                    .from('user_stats')
                    .select('current_streak')
                    .eq('user_id', user.id)
                    .single();

                setMetrics({
                    completedExercises: completed,
                    totalExercises: total,
                    currentMood: (moodData?.mood as 'happy' | 'neutral' | 'sad') || 'neutral',
                    streakDays: streakData?.current_streak || 0,
                    weeklyCompletionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
                });

                // Fetch upcoming appointments (mock for now)
                // TODO: Replace with real appointments table
                setAppointments([]);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const updateMood = async (mood: 'happy' | 'neutral' | 'sad') => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('mood_logs')
                .insert({
                    user_id: user.id,
                    mood,
                    logged_at: new Date().toISOString(),
                });

            if (error) throw error;

            setMetrics(prev => prev ? { ...prev, currentMood: mood } : null);
        } catch (err) {
            console.error('Error updating mood:', err);
        }
    };

    return {
        metrics,
        appointments,
        loading,
        error,
        updateMood,
    };
}
