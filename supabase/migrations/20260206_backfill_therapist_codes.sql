-- Migration: Backfill missing therapist codes
-- This ensures all profiles with role 'therapist' have a unique therapist_code

-- 1. First, ensure the generation function exists (re-defining for safety)
CREATE OR REPLACE FUNCTION public.generate_unique_therapist_code()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate code in DR-XXXXXX format
    new_code := 'DR-' || upper(substr(md5(random()::text), 1, 6));
    
    -- Check if it's actually unique
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE therapist_code = new_code) INTO code_exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- 2. Backfill existing therapists who have a NULL code
-- We use a CTE to ensure each row gets a unique call to the function
WITH missing_codes AS (
    SELECT id 
    FROM public.profiles 
    WHERE (role = 'therapist' OR role = 'specialist') 
    AND (therapist_code IS NULL OR therapist_code = '')
)
UPDATE public.profiles p
SET 
  therapist_code = public.generate_unique_therapist_code(),
  updated_at = now()
FROM missing_codes mc
WHERE p.id = mc.id;

-- 3. Update the trigger function to be even more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  user_name TEXT;
  new_code TEXT;
BEGIN
  -- Extract role from metadata, default to 'parent'
  user_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'parent');
  user_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', '');
  
  -- Generate code only for therapists
  IF user_role = 'therapist' OR user_role = 'specialist' THEN
    new_code := public.generate_unique_therapist_code();
  ELSE
    new_code := NULL;
  END IF;
  
  -- Insert or Update profile
  INSERT INTO public.profiles (user_id, full_name, role, therapist_code, updated_at)
  VALUES (NEW.id, user_name, user_role, new_code, now())
  ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = CASE WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END,
    therapist_code = COALESCE(profiles.therapist_code, EXCLUDED.therapist_code),
    updated_at = now();
    
  RETURN NEW;
END;
$$;

-- 4. Grant execute on the generation function so it can be used in RPC if needed
GRANT EXECUTE ON FUNCTION public.generate_unique_therapist_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_unique_therapist_code() TO service_role;

-- 5. Force schema reload
NOTIFY pgrst, 'reload schema';
