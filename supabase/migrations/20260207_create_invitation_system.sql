
-- Migration: Secure Invitation System (The "Reverse Handshake")
-- Replaces flaky email search with a robust, code-based invitation system.

-- 1. Create table for invitations
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE, -- The magic code (e.g., XC9-22A)
    therapist_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    student_name TEXT, -- Optional: Who is this invite for?
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '48 hours')
);

-- 2. Secure RLS Policies
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Therapist can view/create their own invites
CREATE POLICY "Therapists can manage their invitations"
ON public.invitations
FOR ALL
USING (auth.uid() = therapist_id);

-- Parents can ONLY find an invite by exact code match (enforced via function/RPC is safer, but this allows specific lookup)
-- We will rely on the RPC function for the actual connection logic to be 100% secure.

-- 3. RPC Function: The "Handshake" Logic
-- This function validates the code and creates the connection in one atomic transaction.
CREATE OR REPLACE FUNCTION public.redeem_invite(invite_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to ensure smooth connection creation
SET search_path = public
AS $$
DECLARE
    invite_record RECORD;
    existing_connection RECORD;
    result JSONB;
BEGIN
    -- A. Find the invitation
    SELECT * INTO invite_record
    FROM public.invitations
    WHERE code = invite_code
    AND status = 'active'
    AND expires_at > now();

    -- B. Validation
    IF invite_record.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Mã mời không hợp lệ hoặc đã hết hạn.');
    END IF;

    -- C. Check for existing connection
    SELECT * INTO existing_connection
    FROM public.connections
    WHERE parent_id = auth.uid()
    AND therapist_id = invite_record.therapist_id;

    IF existing_connection.id IS NOT NULL THEN
         -- Already connected? Just return success or specific message
        IF existing_connection.status = 'accepted' THEN
            RETURN jsonb_build_object('success', false, 'message', 'Bạn đã kết nối với chuyên gia này rồi.');
        ELSE
             -- If pending, maybe auto-accept? For now, just say pending.
            RETURN jsonb_build_object('success', false, 'message', 'Yêu cầu kết nối đang chờ duyệt.');
        END IF;
    END IF;

    -- D. Execute the Handshake (Create Connection)
    INSERT INTO public.connections (parent_id, therapist_id, status)
    VALUES (auth.uid(), invite_record.therapist_id, 'pending'); 
    -- Note: You might want 'accepted' immediately if the therapist generated the code? 
    -- Let's stick to 'pending' for safety, OR 'accepted' if this is a direct invite.
    -- Decision: 'accepted' makes sense since Therapist initiated it.
    -- UPGRADE: Auto-accept for streamlined flow.
    UPDATE public.connections 
    SET status = 'accepted' 
    WHERE parent_id = auth.uid() AND therapist_id = invite_record.therapist_id;

    -- E. Mark invite as used
    UPDATE public.invitations
    SET status = 'used'
    WHERE id = invite_record.id;

    -- F. Success
    RETURN jsonb_build_object('success', true, 'message', 'Kết nối thành công!', 'therapist_id', invite_record.therapist_id);

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'message', 'Lỗi hệ thống: ' || SQLERRM);
END;
$$;

NOTIFY pgrst, 'reload schema';
