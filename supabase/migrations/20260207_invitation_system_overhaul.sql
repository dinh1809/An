
-- Migration: Full Overhaul of Connection System (Reverse Handshake)

-- 1. Create a secure table for storing 6-digit invite codes
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,  -- The 6-digit code
    therapist_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '48 hours')
);

-- 2. Reset and Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Therapists can manage their own codes
CREATE POLICY "Therapists manage own codes"
ON public.invitations
FOR ALL
USING (auth.uid() = therapist_id);

-- Policy: Everyone (Authenticated) can read codes (to validate)
-- This is safe because codes are random and short-lived.
CREATE POLICY "Public read codes"
ON public.invitations
FOR SELECT
USING (auth.role() = 'authenticated');

-- 3. The "Handshake" Function (RPC)
-- This atomicaly validates the code and creates the connection.
CREATE OR REPLACE FUNCTION public.connect_via_invite(code_input TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Critical: Bypasses RLS to insert connection securely
SET search_path = public
AS $$
DECLARE
    invite_record RECORD;
    new_connection_id UUID;
BEGIN
    -- A. Find the Valid Invite
    SELECT * INTO invite_record
    FROM public.invitations
    WHERE code = code_input
    AND status = 'active'
    AND expires_at > now();

    IF invite_record.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Mã không hợp lệ hoặc đã hết hạn.');
    END IF;

    -- B. Prevent Self-Connection (Optional but good)
    IF invite_record.therapist_id = auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'message', 'Bạn không thể kết nối với chính mình.');
    END IF;

    -- C. Create/Ensure Connection
    -- We use ON CONFLICT to handle re-tries gracefully
    INSERT INTO public.connections (parent_id, therapist_id, status)
    VALUES (auth.uid(), invite_record.therapist_id, 'accepted')
    ON CONFLICT (parent_id, therapist_id) 
    DO UPDATE SET status = 'accepted'
    RETURNING id INTO new_connection_id;

    -- D. Mark Invite Used (Optional: Comment out this line if you want reusable codes)
    -- UPDATE public.invitations SET status = 'used' WHERE id = invite_record.id;

    -- E. Success
    RETURN jsonb_build_object('success', true, 'message', 'Kết nối thành công!', 'therapist_id', invite_record.therapist_id);

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'message', 'Lỗi hệ thống: ' || SQLERRM);
END;
$$;

NOTIFY pgrst, 'reload schema';
