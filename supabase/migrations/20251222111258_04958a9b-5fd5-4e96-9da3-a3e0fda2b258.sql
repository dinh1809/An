-- Add UPDATE policy to user_roles so users can change their role during signup
CREATE POLICY "Users can update own role"
ON public.user_roles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);