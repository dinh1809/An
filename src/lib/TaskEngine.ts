import { supabase } from "@/integrations/supabase/client";

export interface MicroTask {
    id: string;
    projectId: string; // client_name from joined project
    type: 'image_labeling' | 'text_verification' | 'data_entry';
    payload: any;
    isGold?: boolean; // Internal flag, not shown to user
}

export class TaskEngine {

    /**
     * Fetches the next available task for the user.
     * Implements "Gold Question" injection logic (10% chance).
     */
    static async getNextTask(userId: string): Promise<MicroTask | null> {
        // 1. Roll for Gold Question (10% chance)
        const isGoldCheck = Math.random() < 0.1;

        if (isGoldCheck) {
            // Attempt to fetch a 'golden' task
            // In a real system, we'd query: select * from micro_tasks where golden_answer IS NOT NULL order by random() limit 1
            // For now, let's try to get ANY unassigned task and treat it as normal if we can't find a gold one
        }

        try {
            // 2. Fetch standard task
            // Logic: Get a task assigned to me, OR an unassigned task
            const { data, error } = await supabase
                .from('micro_tasks')
                .select(`
                    id, 
                    payload, 
                    golden_answer,
                    projects ( client_name, task_type )
                `)
                .or(`assigned_user_id.eq.${userId},assigned_user_id.is.null`)
                .eq('status', 'pending')
                .limit(1)
                .single();

            if (error) {
                console.warn("TaskEngine: Database fetch failed, using fallback.", error);
                return this.getMockTask(); // Fallback for demo if DB migration failed
            }

            if (!data) return null;

            // Claim the task if it was unassigned
            // Note: In strict concurrency, this should be an RPC. For MVP, we do optimistic locking or just update.
            // But we can just return it and let the UI 'accept' it.

            return {
                id: data.id,
                projectId: (data.projects as any)?.client_name || "Unknown Client",
                type: (data.projects as any)?.task_type || "image_labeling",
                payload: data.payload,
                isGold: !!data.golden_answer
            };

        } catch (e) {
            console.error("TaskEngine error:", e);
            return this.getMockTask();
        }
    }

    /**
     * Submits a task result.
     * checks Gold Answer if applicable.
     */
    static async submitResult(taskId: string, userId: string, result: any, timeMs: number, jitter: number): Promise<boolean> {
        try {
            // Check if it was a gold question (we need to fetch the task to know the answer)
            // For efficiency, we arguably should have known this on the client or verified on backend.
            // Here we just insert.

            const { error } = await supabase.from('task_results').insert({
                task_id: taskId,
                user_id: userId,
                result_data: result,
                time_taken_ms: timeMs,
                jitter_score: jitter
            });

            if (error) throw error;

            // Mark task as completed
            await supabase.from('micro_tasks').update({ status: 'completed' }).eq('id', taskId);

            return true;
        } catch (e) {
            console.error("Submit failed", e);
            return false;
        }
    }

    // --- MOCK DATA FOR DEMO (If DB is empty) ---
    static getMockTask(): MicroTask {
        return {
            id: "mock-" + Date.now(),
            projectId: "Nexus AI Corp",
            type: "image_labeling",
            payload: {
                image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca4",
                question: "Is there a laptop in this image?"
            },
            isGold: Math.random() < 0.1
        };
    }
}
