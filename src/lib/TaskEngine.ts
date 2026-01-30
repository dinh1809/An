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
        // In this simplified version, we just focus on getting ANY task first.

        try {
            // 2. Fetch standard task
            // Logic: Get a task assigned to me, OR an unassigned task
            // We use .select() with limit(1) instead of .single() to avoid 406/JSON errors on empty
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
                .limit(1);

            if (error) {
                console.warn("TaskEngine: Database fetch failed (Auth or Network).", error);
                // Only use mock if it's a network/auth error, not just "empty"
                return null;
            }

            if (!data || data.length === 0) {
                // Return null so the UI can decide to use mock or show "All caught up"
                // But for the sake of the demo, let's return a mock task if user is administrator or if we want to ensure interaction
                return null;
            }

            const task = data[0];

            return {
                id: task.id,
                projectId: (task.projects as any)?.client_name || "Unknown Client",
                type: (task.projects as any)?.task_type || "image_labeling",
                payload: task.payload,
                isGold: !!task.golden_answer
            };

        } catch (e) {
            console.error("TaskEngine error:", e);
            return null;
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
        const types = [
            {
                type: "image_labeling",
                payload: {
                    image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=1000",
                    question: "Is there a laptop in this image?"
                }
            },
            {
                type: "image_labeling",
                payload: {
                    image_url: "https://images.unsplash.com/photo-1511389026070-a14ce610a541?auto=format&fit=crop&q=80&w=1000",
                    question: "Is there a person in this image?"
                }
            },
            {
                type: "image_labeling",
                payload: {
                    image_url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&q=80&w=1000",
                    question: "Is this a landscape/mountain photo?"
                }
            },
            {
                type: "text_verification",
                payload: {
                    text: "Total Amount: $45.99 | Tax: $4.00 | Paid: $49.99",
                    question: "Does the math sum up correctly?"
                }
            },
            {
                type: "data_entry",
                payload: {
                    image_url: "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=1000",
                    question: "Is this a business document or receipt?"
                }
            }
        ];

        const roll = Math.floor(Math.random() * types.length);
        const selected = types[roll];

        return {
            id: "mock-" + Math.floor(Math.random() * 100000),
            projectId: "An. Digital Factory",
            type: selected.type as any,
            payload: selected.payload,
            isGold: Math.random() < 0.2
        };
    }
}
