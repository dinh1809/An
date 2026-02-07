-- Add metrics JSONB column to game_sessions for storing game-specific metrics
ALTER TABLE public.game_sessions
ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.game_sessions.metrics IS 'Game-specific metrics stored as JSONB. Content varies by game_type:
- detail_spotter: {}
- stroop_chaos: {total_trials, stroop_interference_score, switch_cost_ms, accuracy_congruent, accuracy_incongruent, perseverative_errors, total_switches}
- sequence_memory: {max_forward_span, max_reverse_span, total_errors, distraction_resistance}';