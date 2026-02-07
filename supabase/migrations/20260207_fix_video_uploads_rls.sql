
-- Migration: Add therapist_id to video_uploads and fix RLS
-- This ensures videos are explicitly linked to a therapist for easier querying.

-- 1. Add column if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_uploads' AND column_name = 'therapist_id') THEN 
        ALTER TABLE public.video_uploads ADD COLUMN therapist_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL;
    END IF; 
END $$;

-- 2. Backfill existing videos (The Data Repair)
-- Update video_uploads with the therapist_id from the connections table
UPDATE public.video_uploads v
SET therapist_id = c.therapist_id
FROM public.connections c
WHERE v.user_id = c.parent_id
AND v.therapist_id IS NULL;

-- 3. Update RLS Policies

-- Policy: Therapists can view videos assigned to them
DROP POLICY IF EXISTS "Therapists can view assigned videos" ON public.video_uploads;
CREATE POLICY "Therapists can view assigned videos"
ON public.video_uploads
FOR SELECT
USING (auth.uid() = therapist_id);

-- Ensure Parents can still view their own videos (existing policy might cover this, but good to be safe)
DROP POLICY IF EXISTS "Parents can view own videos" ON public.video_uploads;
CREATE POLICY "Parents can view own videos"
ON public.video_uploads
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Parents can insert videos (with therapist_id)
DROP POLICY IF EXISTS "Parents can insert videos" ON public.video_uploads;
CREATE POLICY "Parents can insert videos"
ON public.video_uploads
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Parents can update their own videos
DROP POLICY IF EXISTS "Parents can update own videos" ON public.video_uploads;
CREATE POLICY "Parents can update own videos"
ON public.video_uploads
FOR UPDATE
USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';
