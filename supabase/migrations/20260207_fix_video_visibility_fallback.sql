
-- Migration: Enhanced Video Visibility Policy (Fallback for existing uploads)

-- Policy: Therapists can view videos of connected patients EVEN IF therapist_id is NULL
-- This acts as a fallback to the direct therapist_id check.

DROP POLICY IF EXISTS "Therapists can view videos of connected patients" ON public.video_uploads;

CREATE POLICY "Therapists can view videos of connected patients"
ON public.video_uploads
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.connections c
        WHERE c.parent_id = video_uploads.user_id
        AND c.therapist_id = auth.uid()
        AND c.status = 'accepted'
    )
    OR
    (auth.uid() = therapist_id) -- Keep the direct check for performance
);

NOTIFY pgrst, 'reload schema';
