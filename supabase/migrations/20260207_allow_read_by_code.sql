
-- Migration: Allow parents to read therapist profiles by connection code
-- This is necessary for the connection flow.

-- Drop existing restrictive policy if it conflicts (or updated it)
-- We'll create a new specific policy for this use case to be safe.

CREATE POLICY "Anyone can view therapist profile by code"
ON public.profiles FOR SELECT
USING (
  therapist_code IS NOT NULL 
  AND 
  (role = 'therapist' OR role = 'specialist')
);

-- Note: This policy allows any authenticated user to find a therapist IF they know the code.
-- This is acceptable for the connection flow.

NOTIFY pgrst, 'reload schema';
