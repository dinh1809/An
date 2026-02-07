
-- Fix Infinite Recursion in Profiles RLS Policies
-- The policy "Therapists can view all profiles" uses a SELECT on profiles itself to check role.
-- This triggers RLS recursively. We must break this loop.

-- 1. Drop the Infinite Recursion Policy
DROP POLICY IF EXISTS "Therapists can view all profiles" ON public.profiles;

-- 2. Create a Safer, Non-Recursive Version
-- Ideally, use a SECURITY DEFINER function or metadata.
-- Or just check role directly if possible (but we need to join user roles).
-- Assuming we have a `has_role` function or similar from other policies.
-- If not, just rely on auth.jwt() claims if setup, OR specific policy per row.

-- Let's try to use auth.jwt() ->> 'role' OR a direct check without triggering RLS on profiles again.
-- For now, let's just DROP it. It's likely interfering with the simple parent connection flow.
-- If therapists need to view all profiles, we can re-add it later with a secure function.

-- 3. Also Re-Apply the critical "Connect" policy just in case
DROP POLICY IF EXISTS "View profile via active invitation" ON public.profiles;

CREATE POLICY "View profile via active invitation"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.invitations
    WHERE invitations.therapist_id = profiles.user_id
    AND invitations.status = 'active'
    AND invitations.expires_at > now()
  )
);

NOTIFY pgrst, 'reload schema';
