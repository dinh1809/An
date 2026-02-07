-- ============================================================================
-- MIGRATION: FUTURE GROWTH ENGINE - Database Schema Refactoring
-- Date: 2026-02-05
-- Purpose: Transform career-matching system into science-backed growth engine
-- ============================================================================

-- ============================================================================
-- 1. COGNITIVE ASSESSMENTS TABLE
-- Stores raw metrics from the 3 assessment mini-games
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cognitive_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    child_name TEXT NOT NULL,
    
    -- Session metadata
    session_started_at TIMESTAMPTZ NOT NULL,
    session_completed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Pattern Recognition Game (Task 1) Metrics
    pattern_accuracy DECIMAL(5,2) DEFAULT 0,        -- 0-100%
    pattern_avg_time_ms INT DEFAULT 0,              -- Average response time in ms
    pattern_total_trials INT DEFAULT 0,             -- Number of trials completed
    
    -- Reaction/Focus Game (Task 2) Metrics
    reaction_accuracy DECIMAL(5,2) DEFAULT 0,       -- Hit rate on correct targets
    reaction_avg_time_ms INT DEFAULT 0,             -- Average reaction time
    impulse_errors INT DEFAULT 0,                    -- False positives count
    attention_consistency DECIMAL(5,2) DEFAULT 0,   -- Consistency score 0-100
    
    -- Preference Game (Task 3) Metrics
    visual_preference_score DECIMAL(5,2) DEFAULT 0,  -- 0-100% visual choices
    auditory_preference_score DECIMAL(5,2) DEFAULT 0, -- 0-100% auditory choices
    
    -- Derived interaction metrics
    interaction_intensity DECIMAL(5,2) DEFAULT 0,   -- Mouse/touch activity level
    
    -- Full telemetry (for research/debugging)
    raw_telemetry JSONB DEFAULT '{}',
    
    -- Calculated profile (1-5 scale)
    profile_visual DECIMAL(3,2) DEFAULT 3.0,
    profile_auditory DECIMAL(3,2) DEFAULT 3.0,
    profile_movement DECIMAL(3,2) DEFAULT 3.0,
    profile_logic DECIMAL(3,2) DEFAULT 3.0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_cognitive_assessments_user 
ON public.cognitive_assessments(user_id);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_cognitive_assessments_date 
ON public.cognitive_assessments(session_completed_at);


-- ============================================================================
-- 2. TEACHING STRATEGIES TABLE (Reference Data)
-- Maps cognitive traits to recommended teaching methods
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.teaching_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Strategy identification
    trait_key TEXT UNIQUE NOT NULL,  -- e.g., 'high_visual', 'high_auditory'
    name_vi TEXT NOT NULL,           -- Vietnamese display name
    
    -- Method details
    method TEXT NOT NULL,            -- e.g., 'Visual Schedules / TEACCH'
    tools TEXT[] DEFAULT '{}',       -- Array of recommended tools
    tips TEXT[] DEFAULT '{}',        -- Array of actionable tips
    
    -- UI metadata
    icon TEXT DEFAULT 'book',        -- Lucide icon name
    color TEXT DEFAULT '#14B8A6',    -- Theme color
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial teaching strategies
INSERT INTO public.teaching_strategies (trait_key, name_vi, method, tools, tips, icon) VALUES
(
    'high_visual',
    'Học qua Thị giác',
    'Visual Schedules / TEACCH',
    ARRAY['Flashcards', 'Mindmaps', 'Biểu đồ màu sắc', 'Video hướng dẫn'],
    ARRAY['Sử dụng hình ảnh minh họa cho mọi khái niệm', 'Tạo lịch trình bằng hình ảnh', 'Dùng màu sắc để phân loại thông tin'],
    'eye'
),
(
    'high_auditory',
    'Học qua Thính giác',
    'Audio-based Learning',
    ARRAY['Podcast', 'Audiobook', 'Nhạc cụ', 'Ghi âm bài học'],
    ARRAY['Đọc to bài học cho con nghe', 'Sử dụng nhịp điệu/vần để ghi nhớ', 'Cho phép con tự nói lại nội dung đã học'],
    'volume-2'
),
(
    'high_movement',
    'Học qua Vận động',
    'Kinesthetic / Hands-on Learning',
    ARRAY['Lego/Xếp hình', 'Đất nặn', 'Thí nghiệm thực hành', 'Trò chơi vận động'],
    ARRAY['Nghỉ giải lao vận động mỗi 15-20 phút', 'Dùng đồ vật thật để minh họa', 'Kết hợp học với hoạt động thể chất'],
    'move'
),
(
    'high_logic',
    'Học qua Hệ thống',
    'Structured / Systematic Learning',
    ARRAY['Sơ đồ tư duy', 'Bảng tính', 'Coding (Scratch)', 'Lập trình Robot'],
    ARRAY['Chia nhỏ bài học thành các bước rõ ràng', 'Đưa ra quy tắc cụ thể, nhất quán', 'Giải thích logic đằng sau mọi việc'],
    'cpu'
),
(
    'balanced',
    'Học đa phương thức',
    'Multimodal Learning',
    ARRAY['Kết hợp nhiều phương pháp', 'Thay đổi linh hoạt'],
    ARRAY['Thử nghiệm nhiều cách tiếp cận khác nhau', 'Quan sát phản hồi của con để điều chỉnh', 'Kết hợp hình ảnh + âm thanh + thực hành'],
    'layers'
)
ON CONFLICT (trait_key) DO UPDATE SET
    name_vi = EXCLUDED.name_vi,
    method = EXCLUDED.method,
    tools = EXCLUDED.tools,
    tips = EXCLUDED.tips,
    icon = EXCLUDED.icon,
    updated_at = NOW();


-- ============================================================================
-- 3. PARTNERS TABLE (Replaces "Opportunities/Jobs")
-- Educational centers, clubs, vocational programs
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Partner identification
    name TEXT NOT NULL,
    slug TEXT UNIQUE,                -- URL-friendly identifier
    
    -- Classification
    type TEXT NOT NULL CHECK (type IN ('center', 'club', 'vocational', 'online', 'community')),
    focus_area TEXT NOT NULL CHECK (focus_area IN ('STEM', 'Art', 'Craft', 'Nature', 'Social', 'Sports', 'Mixed')),
    
    -- Support capabilities
    support_level TEXT DEFAULT 'B' CHECK (support_level IN ('A', 'B', 'C')),
    -- A = High support (1:1 or 1:2 ratio)
    -- B = Medium support (small group 3-6)
    -- C = Low support (mainstream with accommodations)
    
    -- Details
    description TEXT,
    description_vi TEXT,             -- Vietnamese description
    address TEXT,
    city TEXT DEFAULT 'Hà Nội',
    contact_phone TEXT,
    contact_email TEXT,
    website TEXT,
    
    -- Matching criteria (weighted scores for algorithm)
    cognitive_fit JSONB DEFAULT '{
        "visual": 3,
        "auditory": 3,
        "movement": 3,
        "logic": 3
    }',
    
    -- Age range
    min_age INT DEFAULT 6,
    max_age INT DEFAULT 18,
    
    -- Status
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_partners_type ON public.partners(type);
CREATE INDEX IF NOT EXISTS idx_partners_focus ON public.partners(focus_area);
CREATE INDEX IF NOT EXISTS idx_partners_support ON public.partners(support_level);
CREATE INDEX IF NOT EXISTS idx_partners_city ON public.partners(city);

-- Seed example partners
INSERT INTO public.partners (name, slug, type, focus_area, support_level, description_vi, city, cognitive_fit) VALUES
(
    'FabLab Hà Nội',
    'fablab-hanoi',
    'center',
    'STEM',
    'B',
    'Không gian sáng tạo với các lớp học lập trình Scratch, Robot, và in 3D dành cho trẻ em.',
    'Hà Nội',
    '{"visual": 4, "auditory": 2, "movement": 3, "logic": 5}'
),
(
    'Câu Lạc Bộ Nghệ Thuật Sáng Tạo',
    'clb-nghe-thuat-sang-tao',
    'club',
    'Art',
    'A',
    'CLB dạy vẽ, gốm, và nghệ thuật số với tỷ lệ 1:3, phù hợp cho trẻ cần hỗ trợ đặc biệt.',
    'Hà Nội',
    '{"visual": 5, "auditory": 2, "movement": 4, "logic": 2}'
),
(
    'Farm Xanh Trải Nghiệm',
    'farm-xanh',
    'community',
    'Nature',
    'B',
    'Nông trại giáo dục, trẻ được học làm vườn, chăm sóc vật nuôi trong môi trường thiên nhiên.',
    'Hà Nội',
    '{"visual": 3, "auditory": 2, "movement": 5, "logic": 2}'
),
(
    'Xưởng Thủ Công Sài Gòn',
    'xuong-thu-cong-sg',
    'vocational',
    'Craft',
    'A',
    'Đào tạo nghề thủ công (gỗ, da, may) cho thanh thiếu niên đa dạng thần kinh.',
    'Hồ Chí Minh',
    '{"visual": 4, "auditory": 1, "movement": 5, "logic": 3}'
),
(
    'Code4Kids Online',
    'code4kids',
    'online',
    'STEM',
    'C',
    'Nền tảng học lập trình trực tuyến với bài học tương tác và mentor 1:1 mỗi tuần.',
    'Online',
    '{"visual": 4, "auditory": 3, "movement": 1, "logic": 5}'
)
ON CONFLICT (slug) DO NOTHING;


-- ============================================================================
-- 4. GROWTH PLANS TABLE
-- Links user to generated 6-12 month development plan
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.growth_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Linked records
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES public.cognitive_assessments(id) ON DELETE SET NULL,
    
    -- Plan metadata
    child_name TEXT NOT NULL,
    plan_duration_months INT DEFAULT 6 CHECK (plan_duration_months IN (6, 12)),
    
    -- Generated content (JSONB for flexibility)
    profile JSONB NOT NULL,          -- Cognitive profile snapshot
    strategy JSONB NOT NULL,         -- Teaching strategy details
    directions JSONB NOT NULL,       -- Top 3 broad direction clusters
    milestones JSONB NOT NULL,       -- Time-based milestones
    
    -- Matched partners (array of partner IDs)
    recommended_partners UUID[] DEFAULT '{}',
    
    -- Plan status
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    
    -- Progress tracking
    current_phase TEXT DEFAULT 'exploration',
    last_review_date DATE,
    notes TEXT,
    
    -- Sharing
    shared_with_therapist BOOLEAN DEFAULT false,
    therapist_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_growth_plans_user ON public.growth_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_growth_plans_status ON public.growth_plans(status);


-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.cognitive_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teaching_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_plans ENABLE ROW LEVEL SECURITY;

-- COGNITIVE ASSESSMENTS policies
DROP POLICY IF EXISTS "Users can view own assessments" ON public.cognitive_assessments;
CREATE POLICY "Users can view own assessments"
ON public.cognitive_assessments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own assessments" ON public.cognitive_assessments;
CREATE POLICY "Users can insert own assessments"
ON public.cognitive_assessments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own assessments" ON public.cognitive_assessments;
CREATE POLICY "Users can update own assessments"
ON public.cognitive_assessments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- TEACHING STRATEGIES policies (public read)
DROP POLICY IF EXISTS "Teaching strategies are public" ON public.teaching_strategies;
CREATE POLICY "Teaching strategies are public"
ON public.teaching_strategies FOR SELECT
USING (true);

-- PARTNERS policies (public read for active partners)
DROP POLICY IF EXISTS "Active partners are public" ON public.partners;
CREATE POLICY "Active partners are public"
ON public.partners FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "Service role can manage partners" ON public.partners;
CREATE POLICY "Service role can manage partners"
ON public.partners FOR ALL
TO service_role
USING (true);

-- GROWTH PLANS policies
DROP POLICY IF EXISTS "Users can view own plans" ON public.growth_plans;
CREATE POLICY "Users can view own plans"
ON public.growth_plans FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own plans" ON public.growth_plans;
CREATE POLICY "Users can insert own plans"
ON public.growth_plans FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own plans" ON public.growth_plans;
CREATE POLICY "Users can update own plans"
ON public.growth_plans FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);


-- ============================================================================
-- 6. UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_cognitive_assessments_updated_at ON public.cognitive_assessments;
CREATE TRIGGER update_cognitive_assessments_updated_at
    BEFORE UPDATE ON public.cognitive_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teaching_strategies_updated_at ON public.teaching_strategies;
CREATE TRIGGER update_teaching_strategies_updated_at
    BEFORE UPDATE ON public.teaching_strategies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partners_updated_at ON public.partners;
CREATE TRIGGER update_partners_updated_at
    BEFORE UPDATE ON public.partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_growth_plans_updated_at ON public.growth_plans;
CREATE TRIGGER update_growth_plans_updated_at
    BEFORE UPDATE ON public.growth_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- 7. COMMENTS (Documentation)
-- ============================================================================
COMMENT ON TABLE public.cognitive_assessments IS 'Raw metrics from the 3 assessment mini-games + calculated cognitive profile';
COMMENT ON TABLE public.teaching_strategies IS 'Reference table mapping cognitive traits to teaching methods (TEACCH, Visual Learning, etc.)';
COMMENT ON TABLE public.partners IS 'Educational partners: centers, clubs, vocational programs - replaces the old "opportunities" table';
COMMENT ON TABLE public.growth_plans IS 'Generated 6-12 month development plans for each child';

COMMENT ON COLUMN public.partners.support_level IS 'A=High (1:1), B=Medium (small group), C=Low (mainstream)';
COMMENT ON COLUMN public.partners.cognitive_fit IS 'Weighted scores for matching algorithm (1-5 scale per domain)';
COMMENT ON COLUMN public.growth_plans.milestones IS 'Time-based milestones with phases: exploration, building, application';
