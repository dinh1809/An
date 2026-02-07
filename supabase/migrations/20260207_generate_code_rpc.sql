
-- Migration: Secure RPC function for generating therapist codes
-- This function runs with SECURITY DEFINER to bypass client-side RLS restrictions on UPDATE.

CREATE OR REPLACE FUNCTION public.generate_therapist_code(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- 1. Security check: Ensure the caller is the user they claim to be
  IF auth.uid() != user_uuid THEN
    RAISE EXCEPTION 'Unauthorized: You can only generate a code for yourself.';
  END IF;

  -- 2. Generate a deterministic code based on UUID (consistent with trigger logic)
  -- Format: DR-XXXXXX (first 6 chars of MD5 hash of UUID)
  new_code := 'DR-' || upper(substr(md5(user_uuid::text), 1, 6));

  -- 3. Update the profile with elevated privileges
  UPDATE public.profiles
  SET therapist_code = new_code
  WHERE user_id = user_uuid;

  -- 4. Return the generated code
  RETURN new_code;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to generate code: %', SQLERRM;
END;
$$;

NOTIFY pgrst, 'reload schema';
