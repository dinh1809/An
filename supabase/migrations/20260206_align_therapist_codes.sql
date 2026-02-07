-- Migration: Align Therapist Codes with UI Logic
-- This ensures the DB uses the EXACT SAME logic as the UI fallback (first 6 chars of UUID)

-- 1. Redefine the function to match JS: 'DR-' + UUID_START(6)
CREATE OR REPLACE FUNCTION public.generate_deterministic_therapist_code(user_uuid UUID)
RETURNS TEXT 
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- Extract first 6 characters of UUID string (excluding the hyphens if we want strictly 6 chars)
  -- Actually, UUIDs start with hex chars. We just take the first 6.
  RETURN 'DR-' || upper(substr(user_uuid::text, 1, 6));
END;
$$;

-- 2. Force update ALL existing codes to this new standard
-- This will fix the mismatch where UI shows one code and DB has another (or none)
UPDATE public.profiles
SET 
  therapist_code = public.generate_deterministic_therapist_code(user_id),
  updated_at = now()
WHERE (role = 'therapist' OR role = 'specialist');

-- 3. Ensure RLS allows parents to find therapists by this code
-- We'll drop and recreate to be 100% sure
DROP POLICY IF EXISTS "Allow search therapist profiles by code or phone" ON public.profiles;
CREATE POLICY "Allow search therapist profiles by code or phone"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  therapist_code IS NOT NULL 
  OR auth.uid() = user_id
);

-- 4. Force schema reload
NOTIFY pgrst, 'reload schema';
