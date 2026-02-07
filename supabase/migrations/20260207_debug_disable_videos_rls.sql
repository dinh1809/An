
-- Debug: Temporarily DISABLE RLS for video_uploads

-- This script completely unlocks the table for reading by ANYONE (even parents can see other parents' videos if they query directly, but only temporarily for debugging).
-- DO NOT LEAVE THIS DISABLED IN PRODUCTION.

ALTER TABLE public.video_uploads DISABLE ROW LEVEL SECURITY;

-- Also, check if any videos exist at all
SELECT * FROM public.video_uploads LIMIT 10;
