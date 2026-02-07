-- Add therapist_code and phone columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS therapist_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create function to generate unique therapist code
CREATE OR REPLACE FUNCTION public.generate_therapist_code()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := 'DR-' || upper(substr(md5(random()::text), 1, 6));
    SELECT EXISTS(SELECT 1 FROM profiles WHERE therapist_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Update handle_new_user function to auto-generate therapist_code for therapists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  new_code TEXT;
BEGIN
  user_role := NEW.raw_user_meta_data ->> 'role';
  
  IF user_role = 'therapist' THEN
    new_code := generate_therapist_code();
    INSERT INTO public.profiles (user_id, full_name, role, therapist_code)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', 'therapist', new_code);
  ELSE
    INSERT INTO public.profiles (user_id, full_name, role)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', COALESCE(user_role, 'parent'));
  END IF;
  
  RETURN NEW;
END;
$$;

-- Generate codes for existing therapists who don't have one
UPDATE public.profiles p
SET therapist_code = public.generate_therapist_code()
FROM public.user_roles ur
WHERE p.user_id = ur.user_id 
  AND ur.role = 'therapist'::app_role
  AND p.therapist_code IS NULL;

-- RLS Policy: Allow authenticated users to search therapists by code or phone
CREATE POLICY "Allow search therapist profiles by code or phone"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  therapist_code IS NOT NULL 
  OR auth.uid() = user_id
);