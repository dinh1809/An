-- Allow authenticated users to read therapist roles (needed for FindTherapist map)
-- This allows parents to query which users are therapists to display on the map

CREATE POLICY "Authenticated users can view therapist roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (role = 'therapist'::app_role);