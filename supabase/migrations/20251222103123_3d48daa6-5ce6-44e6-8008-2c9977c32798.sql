-- Create role enum
CREATE TYPE public.app_role AS ENUM ('parent', 'therapist');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'parent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role"
ON public.user_roles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create connections table for parent-therapist linking
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  therapist_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (parent_id, therapist_id)
);

-- Enable RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- RLS policies for connections
CREATE POLICY "Parents can view own connections"
ON public.connections FOR SELECT
USING (auth.uid() = parent_id);

CREATE POLICY "Therapists can view their connections"
ON public.connections FOR SELECT
USING (auth.uid() = therapist_id);

CREATE POLICY "Parents can create connections"
ON public.connections FOR INSERT
WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Both can update connections"
ON public.connections FOR UPDATE
USING (auth.uid() = parent_id OR auth.uid() = therapist_id);

-- Allow therapists to view connected parent's behavior logs
CREATE POLICY "Therapists can view connected parent behavior logs"
ON public.behavior_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.connections
    WHERE connections.therapist_id = auth.uid()
    AND connections.parent_id = behavior_logs.user_id
    AND connections.status = 'accepted'
  )
);

-- Allow therapists to view connected parent's video uploads
CREATE POLICY "Therapists can view connected parent videos"
ON public.video_uploads FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.connections
    WHERE connections.therapist_id = auth.uid()
    AND connections.parent_id = video_uploads.user_id
    AND connections.status = 'accepted'
  )
);

-- Function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Trigger to create default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'parent');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Enable realtime for connections
ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;