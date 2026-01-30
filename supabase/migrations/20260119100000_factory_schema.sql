-- 1. Global View for Valid Science (Anonymized Aggregate Stats)
-- This fixes the RLS issue where users could only see their own stats, breaking Z-Score.
CREATE OR REPLACE VIEW public.global_stats_view WITH (security_invoker = false) AS
SELECT 
    game_type,
    AVG(avg_reaction_time_ms) as global_mean_latency,
    STDDEV(avg_reaction_time_ms) as global_std_latency,
    AVG(final_score) as global_mean_score,
    STDDEV(final_score) as global_std_score,
    COUNT(*) as sample_size
FROM 
    game_sessions
GROUP BY 
    game_type;

-- Allow public read access to this view (it returns aggregates only)
GRANT SELECT ON public.global_stats_view TO authenticated, anon;


-- 2. Projects Table (B2B Clients)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    task_type TEXT NOT NULL CHECK (task_type IN ('image_labeling', 'text_verification', 'data_entry', 'content_moderation')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    instructions_markdown TEXT
);

-- 3. Micro-Tasks Table (The Units of Work)
CREATE TABLE IF NOT EXISTS public.micro_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    payload JSONB NOT NULL, -- { "image_url": "...", "text": "..." }
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'completed', 'verified')),
    assigned_user_id UUID REFERENCES auth.users(id), -- Nullable (unassigned)
    golden_answer TEXT, -- If present, this is a Gold Question (QA)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Task Results Table (User Output)
CREATE TABLE IF NOT EXISTS public.task_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.micro_tasks(id),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    result_data JSONB NOT NULL, -- { "label": "cat" }
    time_taken_ms INTEGER,
    jitter_score DECIMAL, -- Mouse jitter metric for stress detection
    is_gold_accurate BOOLEAN, -- Populated if task had golden_answer
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micro_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_results ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Projects: Readable by authenticated users (to list avail work types)
DROP POLICY IF EXISTS "Public projects read" ON public.projects;
CREATE POLICY "Public projects read" ON public.projects FOR SELECT USING (true); 

-- Micro Tasks:
-- Users can see tasks assigned to them OR unassigned tasks (to pick one)
DROP POLICY IF EXISTS "Read assigned or open tasks" ON public.micro_tasks;
CREATE POLICY "Read assigned or open tasks" 
ON public.micro_tasks FOR SELECT 
USING (
    assigned_user_id = auth.uid() OR 
    (assigned_user_id IS NULL AND status = 'pending')
);

-- Users can 'assign' a task to themselves (UPDATE)
DROP POLICY IF EXISTS "Claim task" ON public.micro_tasks;
CREATE POLICY "Claim task"
ON public.micro_tasks FOR UPDATE
USING (assigned_user_id IS NULL)
WITH CHECK (assigned_user_id = auth.uid() AND status = 'assigned');

-- Task Results:
-- Users can insert their own results
DROP POLICY IF EXISTS "Insert own results" ON public.task_results;
CREATE POLICY "Insert own results"
ON public.task_results FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own results
DROP POLICY IF EXISTS "View own results" ON public.task_results;
CREATE POLICY "View own results"
ON public.task_results FOR SELECT
USING (auth.uid() = user_id);

-- 7. Performance Index Functions
CREATE INDEX IF NOT EXISTS idx_micro_tasks_status ON public.micro_tasks(status);
CREATE INDEX IF NOT EXISTS idx_micro_tasks_assigned ON public.micro_tasks(assigned_user_id);
