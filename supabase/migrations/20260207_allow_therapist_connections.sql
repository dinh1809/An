-- Migration: Allow therapists to insert connections
-- This allows therapists to link with parents directly by inserting into the connections table.

-- 1. Add INSERT policy for therapists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'connections' AND policyname = 'Therapists can create connections'
    ) THEN
        CREATE POLICY "Therapists can create connections"
        ON public.connections FOR INSERT
        WITH CHECK (
            -- The person inserting must be the therapist
            auth.uid() = therapist_id
            AND
            -- And they must have the therapist/specialist role
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE user_id = auth.uid()
                AND (role = 'therapist' OR role = 'specialist')
            )
        );
    END IF;
END $$;

-- 2. Add policy to allow therapists to search parent profiles by email
-- This is necessary for the frontend to find the parent's user_id before connecting
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Therapists can search parents by email'
    ) THEN
        CREATE POLICY "Therapists can search parents by email"
        ON public.profiles FOR SELECT
        USING (
            -- Only therapists/specialists can use this broad search
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE user_id = auth.uid()
                AND (role = 'therapist' OR role = 'specialist')
            )
            OR
            -- Or if it's their own profile
            auth.uid() = user_id
        );
    END IF;
END $$;

-- 3. Reload schema
NOTIFY pgrst, 'reload schema';
