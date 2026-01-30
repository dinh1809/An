import { supabase } from "@/integrations/supabase/client";

interface RawSessionData {
    timestamps: number[]; // Reaction times in ms
    errors: number[];     // Indices of errors or timestamps of errors
}

interface UserPerformanceMetrics {
    consistency: number;     // Standard deviation of reaction times (lower is better)
    resilience: number;      // Recovery speed after errors
    zScore: number | null;   // Comparison against global population
    meanReactionTime: number;
    accuracy: number;
}

export class NeuroStats {
    /**
     * Calculate Consistency (Standard Deviation of Reaction Times)
     * Lower value means more consistent/stable attention.
     */
    static calculateConsistency(times: number[]): number {
        if (!times || times.length === 0) return 0;

        // Filter out outliers (e.g., > 3000ms which might be distraction) for pure processing speed stability
        const validTimes = times.filter(t => t < 3000);
        if (validTimes.length === 0) return 0;

        const mean = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
        const variance = validTimes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / validTimes.length;

        return Math.sqrt(variance);
    }

    /**
     * Calculate Resilience (Recovery Speed)
     * Measures how quickly user returns to baseline speed after an error.
     * A lower ratio means better resilience (1.0 = immediate recovery).
     */
    static calculateResilience(times: number[], errorIndices: number[]): number {
        if (!times || times.length === 0 || !errorIndices || errorIndices.length === 0) return 1.0;

        const mean = times.reduce((a, b) => a + b, 0) / times.length;
        let recoveryFactors: number[] = [];

        errorIndices.forEach(errorIdx => {
            // Look at the trial immediately AFTER the error
            const nextTrialIdx = errorIdx + 1;
            if (nextTrialIdx < times.length) {
                const recoveryTime = times[nextTrialIdx];
                // Ratio of recovery time to average time. 
                // >1.0 means they slowed down (hesitation/rumination). <1.0 means they sped up (impulsivity? or high resilience).
                recoveryFactors.push(recoveryTime / mean);
            }
        });

        if (recoveryFactors.length === 0) return 1.0; // No recovery data available

        // Average return to baseline factor
        return recoveryFactors.reduce((a, b) => a + b, 0) / recoveryFactors.length;
    }

    /**
     * Dynamic Scoring (Z-Score)
     * Compares user's value against global statistics.
     * Z = (X - μ) / σ
     */
    static computeZScore(userValue: number, globalMean: number, globalStdDev: number): number {
        if (globalStdDev === 0) return 0;
        return (userValue - globalMean) / globalStdDev;
    }

    /**
     * Fetch Global Stats for specific game type to enable Z-Score calculation
     * This is a placeholder for DB integration.
     */
    /**
     * Fetch Global Stats for specific game type to enable Z-Score calculation
     * Uses the 'global_stats_view' to bypass RLS restrictions on raw user data.
     */
    static async fetchGlobalStats(gameType: string): Promise<{ mean: number, stdDev: number } | null> {
        try {
            const { data, error } = await supabase
                .from('global_stats_view')
                .select('global_mean_latency, global_std_latency')
                .eq('game_type', gameType)
                .single();

            if (error || !data) return null;

            return {
                mean: data.global_mean_latency,
                stdDev: data.global_std_latency
            };
        } catch (e) {
            console.error("Failed to fetch global stats", e);
            return null;
        }
    }

    /**
     * Comprehensive Analysis
     */
    static async analyzeSession(
        gameType: string,
        raw: RawSessionData
    ): Promise<UserPerformanceMetrics> {
        const consistency = this.calculateConsistency(raw.timestamps);

        // Assume errorIndices are passed in raw.errors
        // If raw.errors stores timestamps, conversion logic needed. 
        // Here we assume raw.errors stores the indices of trials that were errors.
        const resilience = this.calculateResilience(raw.timestamps, raw.errors);

        const meanReactionTime = raw.timestamps.length > 0
            ? raw.timestamps.reduce((a, b) => a + b, 0) / raw.timestamps.length
            : 0;

        const accuracy = raw.timestamps.length > 0
            ? ((raw.timestamps.length - raw.errors.length) / raw.timestamps.length) * 100
            : 0;

        // Get Z-Score
        let zScore = null;
        const globalStats = await this.fetchGlobalStats(gameType);
        if (globalStats) {
            // Note: For reaction time, Lower is Better.
            // A standard Z-score: (User - Mean) / StdDev.
            // If User (300ms) < Mean (500ms), Z is negative.
            // We might want to invert this for "Performance Score" where higher is better.
            // Or keep it raw statistical Z-score. Let's keep raw Z-score.
            // Z < 0 implies faster than average (Good). Z > 0 implies slower (Bad).
            zScore = this.computeZScore(meanReactionTime, globalStats.mean, globalStats.stdDev);
        }

        return {
            consistency,
            resilience,
            zScore,
            meanReactionTime,
            accuracy
        };
    }
}
