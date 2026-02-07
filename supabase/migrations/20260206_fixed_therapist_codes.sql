-- Migration: Deterministic and Fixed Therapist Codes
-- Ensures every therapist has a FIXED code that doesn't change and persists correctly.

-- 1. Create a function to generate a deterministic code from a UUID
CREATE OR REPLACE FUNCTION public.generate_deterministic_therapist_code(user_uuid UUID)
RETURNS TEXT 
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- Use the first 8 characters of the MD5 hash of the UUID
  -- This is stable for the same UUID and highly likely to be unique
  RETURN 'DR-' || upper(substr(md5(user_uuid::text), 1, 6));
END;
$$;

-- 2. Backfill ALL therapists (and specialists) with deterministic codes if they don't have one
-- This ensures the code is FIXED and matches the logic we will use in the UI fallback
UPDATE public.profiles
SET 
  therapist_code = public.generate_deterministic_therapist_code(user_id),
  updated_at = now()
WHERE (role = 'therapist' OR role = 'specialist')
AND (therapist_code IS NULL OR therapist_code = '');

-- 3. Update the trigger to use the same deterministic logic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  user_name TEXT;
  fixed_code TEXT;
BEGIN
  -- Extract values
  user_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'parent');
  user_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', '');
  
  -- Use deterministic code for therapists
  IF user_role = 'therapist' OR user_role = 'specialist' THEN
    fixed_code := public.generate_deterministic_therapist_code(NEW.id);
  ELSE
    fixed_code := NULL;
  END IF;
  
  -- Insert/Update profile
  INSERT INTO public.profiles (user_id, full_name, role, therapist_code, updated_at)
  VALUES (NEW.id, user_name, user_role, fixed_code, now())
  ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = CASE WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END,
    therapist_code = COALESCE(profiles.therapist_code, EXCLUDED.therapist_code),
    updated_at = now();
    
  RETURN NEW;
END;
$$;

-- 4. Explicitly allow users to update their own therapist_code (fixing potential RLS issues)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can update own therapist code'
  ) THEN
    CREATE POLICY "Users can update own therapist code" ON public.profiles
      FOR UPDATE TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- 5. Force schema reload
NOTIFY pgrst, 'reload schema';
