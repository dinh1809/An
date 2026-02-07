
-- FINAL Email Sync Migration
-- Resolves the issue where new registrations don't have their email synced to profiles.

-- 1. Ensure email column and index exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- 2. Update the handle_new_user function to include email
-- This handles initial registration
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
  -- Safely extract values from metadata
  user_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'parent');
  user_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', '');
  
  -- Generate therapist code if role is therapist
  IF user_role = 'therapist' THEN
    new_code := 'DR-' || upper(substr(md5(random()::text), 1, 6));
  ELSE
    new_code := NULL;
  END IF;
  
  -- Insert profile (including email from auth.users)
  INSERT INTO public.profiles (user_id, full_name, role, therapist_code, email)
  VALUES (NEW.id, user_name, user_role, new_code, LOWER(NEW.email))
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    email = EXCLUDED.email, -- Ensure email is updated if profile already exists
    therapist_code = COALESCE(profiles.therapist_code, EXCLUDED.therapist_code);
    
  -- Also insert into user_roles table if it exists
  BEGIN
    -- Note: This assumes app_role type exists. If it fails, the trigger still continues.
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, user_role::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user error: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- 3. Ensure the update trigger is also active (for later email changes)
CREATE OR REPLACE FUNCTION public.handle_user_email_sync()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET email = LOWER(NEW.email)
    WHERE user_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_email_update ON auth.users;
CREATE TRIGGER on_auth_user_email_update
AFTER UPDATE OF email ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_user_email_sync();

-- 4. CRITICAL: Backfill ALL missing emails right now
-- This fixes users who just registered before this fix was applied.
UPDATE public.profiles p
SET email = LOWER(u.email)
FROM auth.users u
WHERE p.user_id = u.id 
AND (p.email IS NULL OR p.email != LOWER(u.email));

NOTIFY pgrst, 'reload schema';
