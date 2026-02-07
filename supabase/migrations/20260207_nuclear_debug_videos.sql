
-- NUCLEAR DEBUG: Show everything about videos

-- 1. List all tables that have 'video' in their name
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE '%video%';

-- 2. Show the last 20 entries in video_uploads from ANYONE
SELECT id, user_id, therapist_id, title, created_at, file_url 
FROM public.video_uploads 
ORDER BY created_at DESC 
LIMIT 20;

-- 3. Check for any active triggers on video_uploads
SELECT  tgname AS trigger_name,
        relname AS table_name,
        CASE WHEN tgenabled = 'O' THEN 'enabled' ELSE 'disabled' END AS status
FROM pg_trigger
JOIN pg_class ON pg_class.oid = tgrelid
WHERE relname = 'video_uploads';
