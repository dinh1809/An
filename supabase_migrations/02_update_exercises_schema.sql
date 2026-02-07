-- Add notes and therapist_id to exercises table
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS therapist_id uuid REFERENCES auth.users(id);

-- Update RLS policies if necessary (assuming public for now but ideally restricted)
-- For this project, we seem to rely on simple logic or existing policies.
-- Let's make sure exercises are viewable by the user and assigned by the therapist.
