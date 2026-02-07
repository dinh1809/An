-- FIX: Safe handle_new_user trigger for signup
-- This replaces the existing trigger with a more robust version

-- Drop and recreate the trigger function with proper error handling
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
  
  -- Insert profile (with ON CONFLICT to handle edge cases)
  INSERT INTO public.profiles (user_id, full_name, role, therapist_code)
  VALUES (NEW.id, user_name, user_role, new_code)
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    therapist_code = COALESCE(profiles.therapist_code, EXCLUDED.therapist_code);
    
  -- Also insert into user_roles table if it exists
  BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, user_role::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Ignore if user_roles doesn't exist or has different structure
    NULL;
  END;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't block user creation
  RAISE WARNING 'handle_new_user error: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Force schema reload
NOTIFY pgrst, 'reload schema';
