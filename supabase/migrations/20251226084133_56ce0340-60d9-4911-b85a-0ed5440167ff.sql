-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;

-- Update the function to read role from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  selected_role app_role;
BEGIN
  -- Extract role from user metadata, default to 'parent' if not provided
  selected_role := COALESCE(
    (NEW.raw_user_meta_data ->> 'role')::app_role,
    'parent'::app_role
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, selected_role);
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();