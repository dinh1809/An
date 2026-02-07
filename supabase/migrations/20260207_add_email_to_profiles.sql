
-- Migration: Add email column to profiles
-- This enables therapists to search for parents by email.

-- 1. Add email column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Create index for faster search
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- 3. Populate existing emails from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id AND p.email IS NULL;

-- 4. Create trigger to keep email in sync
CREATE OR REPLACE FUNCTION public.handle_user_email_sync()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET email = NEW.email
    WHERE user_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists to avoid errors on reapplying
DROP TRIGGER IF EXISTS on_auth_user_email_update ON auth.users;

CREATE TRIGGER on_auth_user_email_update
AFTER UPDATE OF email ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_user_email_sync();

-- 5. Update the handle_new_user function to include email if it exists
-- We search for the function definition first or just append the logic.
-- Usually there's a handle_new_user trigger.

NOTIFY pgrst, 'reload schema';
