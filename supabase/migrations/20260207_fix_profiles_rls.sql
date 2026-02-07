
-- Migration: Emergency RLS fix for Profiles
-- This ensures users can create their own profiles if the trigger fails.
-- It also allows therapists to find parents by email.

-- 1. Allow users to INSERT their own profile if it's missing
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 2. Allow users to UPDATE their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- 3. Allow users to READ their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- 4. Allow Therapists to READ emails of parents (Crucial for connection by email)
-- Updated to include both role = 'therapist' and role = 'specialist'
DROP POLICY IF EXISTS "Therapists can search parents by email" ON public.profiles;
CREATE POLICY "Therapists can search parents by email"
ON public.profiles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND (role = 'therapist' OR role = 'specialist')
    )
    OR
    auth.uid() = user_id
);

NOTIFY pgrst, 'reload schema';
