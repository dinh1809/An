
-- Debug: Check Table Structure & Constraints for video_uploads
SELECT * FROM information_schema.columns 
WHERE table_name = 'video_uploads';

-- Check constraints
SELECT conname, contype, pg_get_constraintdef(c.oid)
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE n.nspname = 'public' AND conrelid = 'public.video_uploads'::regclass;
