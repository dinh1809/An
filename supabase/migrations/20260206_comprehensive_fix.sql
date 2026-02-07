-- COMPREHENSIVE FIX: Foreign Keys & RLS
-- This script fixes the root causes of "Bad Request" and "Invalid Code" errors.

-- 1. Fix 'connections' table missing Foreign Keys (Causes 400 Bad Request)
-- We first check if the constraints exist to avoid errors, then add them if missing.
DO $$
BEGIN
    -- Add foreign key for therapist_id referencing profiles(user_id)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'connections_therapist_id_fkey') THEN
        ALTER TABLE public.connections
        ADD CONSTRAINT connections_therapist_id_fkey
        FOREIGN KEY (therapist_id)
        REFERENCES public.profiles(user_id)
        ON DELETE CASCADE;
    END IF;

    -- Add foreign key for parent_id referencing profiles(user_id)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'connections_parent_id_fkey') THEN
        ALTER TABLE public.connections
        ADD CONSTRAINT connections_parent_id_fkey
        FOREIGN KEY (parent_id)
        REFERENCES public.profiles(user_id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Force Re-apply RLS Policy for Searching Therapists (Fixes "Invalid Code")
-- We drop and recreate specifically to ensure the SELECT permission is granted.
DROP POLICY IF EXISTS "Allow search therapist profiles by code or phone" ON public.profiles;

CREATE POLICY "Allow search therapist profiles by code or phone"
ON public.profiles FOR SELECT TO authenticated
USING (
  -- Allow finding any profile that has a code (therapists)
  therapist_code IS NOT NULL 
  OR 
  -- Or allow finding yourself
  auth.uid() = user_id
);

-- 3. Ensure Data Consistency (Fixes "Not Found" due to mismatched codes)
-- Re-run the code synchronization to match the UI logic (first 6 chars of user_id)
UPDATE public.profiles
SET therapist_code = 'DR-' || upper(substr(user_id::text, 1, 6))
WHERE (role = 'therapist' OR role = 'specialist');

-- 4. Reload Schema Cache
NOTIFY pgrst, 'reload schema';
