
-- Update RLS to allow reading therapist profiles through valid invitations
-- This is critical for the `Connect.tsx` fetch logic to work (which joins profiles on invitations).

-- Drop old conflict policy if needed
DROP POLICY IF EXISTS "Public view for active invitations" ON public.profiles;

-- Create New Policy for Profiles
-- Allow anyone to read a profile IF it is linked to an ACTIVE invitation
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

-- Also ensure Invitations are readable
DROP POLICY IF EXISTS "Public read codes" ON public.invitations;
CREATE POLICY "Public read codes" ON public.invitations
FOR SELECT USING (auth.role() = 'authenticated');

NOTIFY pgrst, 'reload schema';
