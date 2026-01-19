-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    partner_name TEXT NOT NULL, -- Tên công ty
    description TEXT,
    location TEXT, -- (NEW) Ví dụ: Hà Nội, Remote
    salary_range TEXT, -- (NEW) Ví dụ: 15-20 triệu
    neuro_traits TEXT[], -- Tags: ['Visual_Detail', 'High_Focus']
    neuro_score INT DEFAULT 50, -- Điểm phù hợp (Z-Score match)
    external_url TEXT, -- Link gốc để ứng tuyển
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS (Security is non-negotiable)
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
-- Policy: Ai cũng xem được (Public Read)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.opportunities;
CREATE POLICY "Enable read access for all users" 
ON public.opportunities FOR SELECT 
USING (true);

-- Policy: Chỉ Service Role (Backend/Seed Script) mới được ghi/sửa
DROP POLICY IF EXISTS "Enable insert for service_role only" ON public.opportunities;
CREATE POLICY "Enable insert for service_role only" 
ON public.opportunities FOR INSERT 
TO service_role 
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for service_role only" ON public.opportunities;
CREATE POLICY "Enable update for service_role only" 
ON public.opportunities FOR UPDATE 
TO service_role 
USING (true);
