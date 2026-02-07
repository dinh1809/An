-- ============================================================================
-- MIGRATION: Add Telemetry & Advanced Metrics to Game Sessions
-- Date: 2026-02-06
-- Purpose: Support Neuro-Logic Framework with granular data storage
-- ============================================================================

-- 1. Add 'telemetry' column for raw event logs (clicks, mouse moves, etc.)
ALTER TABLE public.game_sessions
ADD COLUMN IF NOT EXISTS telemetry JSONB DEFAULT '[]';

COMMENT ON COLUMN public.game_sessions.telemetry IS 'Granular event logs (click_times, mouse_paths) for deep neuro-analysis';

-- 2. Add 'advanced_metrics' column for calculated neuro-traits
ALTER TABLE public.game_sessions
ADD COLUMN IF NOT EXISTS advanced_metrics JSONB DEFAULT '{}';

COMMENT ON COLUMN public.game_sessions.advanced_metrics IS 'Derived Neuro-Logic metrics (scan_efficiency, switch_cost, etc.)';

-- 3. Add index for faster analysis on game types
CREATE INDEX IF NOT EXISTS idx_game_sessions_type_metrics
ON public.game_sessions(game_type)
INCLUDE (advanced_metrics);
