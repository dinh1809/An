-- Seed Data for Project An: Digital Factory

-- 1. Create a Work Project
INSERT INTO public.projects (id, client_name, task_type, status)
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'NeuroTech AI Corp', 'image_labeling', 'active')
ON CONFLICT (id) DO NOTHING;

-- 2. Create Micro-Tasks
-- Normal Tasks
INSERT INTO public.micro_tasks (project_id, payload, status)
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '{"image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca4", "question": "Is there a laptop in this image?"}', 'pending'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '{"image_url": "https://images.unsplash.com/photo-1511389026070-a14ce610a541", "question": "Is the person smiling?"}', 'pending'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '{"image_url": "https://images.unsplash.com/photo-1493246507139-91e8fad9978e", "question": "Is this a landscape shot?"}', 'pending'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '{"image_url": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f", "question": "Do you see a blue pen?"}', 'pending');

-- Gold Question (QA Check)
INSERT INTO public.micro_tasks (project_id, payload, status, golden_answer)
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '{"image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca4", "question": "Is there a laptop in this image? (QA Check)"}', 'pending', 'yes');

-- 3. Mock Global Stats for Science Validation
-- Generate 100 fake sessions to populate the view statistics
DO $$
DECLARE
    i INT;
    score INT;
    speed INT;
BEGIN
    FOR i IN 1..100 LOOP
        score := floor(random() * 50 + 50); -- 50-100
        speed := floor(random() * 600 + 200); -- 200-800ms
        
        -- Insert into game_sessions directly (bypassing specific game logic tables for stats only)
        INSERT INTO public.game_sessions (user_id, game_type, final_score, avg_reaction_time_ms, completed_at)
        VALUES 
        ('00000000-0000-0000-0000-000000000000', 'detail_spotter', score, speed, NOW());
    END LOOP;
END $$;
