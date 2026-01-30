-- Create appointment status enum
CREATE TYPE public.appointment_status AS ENUM ('available', 'booked', 'completed', 'cancelled');

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id UUID NOT NULL,
  parent_id UUID,
  title TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status appointment_status NOT NULL DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Therapists can view their own appointments
CREATE POLICY "Therapists can view own appointments"
ON public.appointments FOR SELECT
USING (auth.uid() = therapist_id);

-- Parents can view appointments they're booked into
CREATE POLICY "Parents can view their booked appointments"
ON public.appointments FOR SELECT
USING (auth.uid() = parent_id);

-- Therapists can create appointments
CREATE POLICY "Therapists can create appointments"
ON public.appointments FOR INSERT
WITH CHECK (auth.uid() = therapist_id);

-- Therapists can update their own appointments
CREATE POLICY "Therapists can update own appointments"
ON public.appointments FOR UPDATE
USING (auth.uid() = therapist_id);

-- Therapists can delete their own appointments
CREATE POLICY "Therapists can delete own appointments"
ON public.appointments FOR DELETE
USING (auth.uid() = therapist_id);

-- Create trigger for updated_at
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();