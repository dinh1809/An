-- Create video_feedback table for timestamped comments on videos
CREATE TABLE IF NOT EXISTS public.video_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES public.video_uploads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    timestamp DOUBLE PRECISION NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_feedback_video_id ON public.video_feedback(video_id);
CREATE INDEX IF NOT EXISTS idx_video_feedback_user_id ON public.video_feedback(user_id);

-- Enable RLS
ALTER TABLE public.video_feedback ENABLE ROW LEVEL SECURITY;

-- Policies:
-- 1. Therapists can insert feedback
CREATE POLICY "Therapists can insert feedback" 
ON public.video_feedback
FOR INSERT 
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid() 
        AND p.role = 'therapist'
    )
);

-- 2. Therapists and Parents can view feedback for their videos
CREATE POLICY "Users can view relevant feedback" 
ON public.video_feedback
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.video_uploads v
        LEFT JOIN public.connections c ON v.user_id = c.parent_id
        WHERE v.id = video_feedback.video_id
        AND (
            v.user_id = auth.uid() -- Parent who uploaded video
            OR c.therapist_id = auth.uid() -- Therapist connected to that parent
        )
    )
);

-- 3. Users can delete their own feedback
CREATE POLICY "Users can delete own feedback" 
ON public.video_feedback
FOR DELETE
TO authenticated
USING (user_id = auth.uid());
