-- Add location columns to profiles table for therapist discovery
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision,
ADD COLUMN IF NOT EXISTS clinic_address text,
ADD COLUMN IF NOT EXISTS clinic_name text,
ADD COLUMN IF NOT EXISTS is_public_profile boolean DEFAULT false;

-- Create a security definer function to check if user is therapist
CREATE OR REPLACE FUNCTION public.is_therapist(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'therapist'::app_role
  )
$$;

-- Create RLS policy to allow parents to view therapist profiles that are public
CREATE POLICY "Parents can view public therapist profiles"
ON public.profiles
FOR SELECT
USING (
  -- User viewing their own profile
  auth.uid() = user_id
  OR
  -- Authenticated users can view public therapist profiles with location
  (
    is_public_profile = true 
    AND latitude IS NOT NULL 
    AND longitude IS NOT NULL
    AND public.has_role(user_id, 'therapist')
  )
);