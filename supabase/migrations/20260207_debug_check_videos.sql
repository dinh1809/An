
-- Debug Script: Check video uploads and connections

-- 1. Check if any videos exist for the specific parent (replace with parent_id from URL if known, or just list all)
SELECT * FROM public.video_uploads ORDER BY created_at DESC LIMIT 5;

-- 2. Check the specific connection again to be sure
SELECT * FROM public.connections 
WHERE status = 'accepted' 
LIMIT 5;

-- 3. Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'video_uploads';
