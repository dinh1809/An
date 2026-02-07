
-- Debug V2: Manually insert a video USING the therapist_id from the connection
-- Based on your screenshot:
-- parent_id: 'b2b022ed-5f0a-40f2-801e-b9c4c1d99be3'
-- therapist_id: '4e64433c-a10a-4a13-8b0c-8a00b0d5221a'

INSERT INTO public.video_uploads (
    user_id,
    title,
    file_url,
    file_path,
    duration_seconds,
    therapist_id
) VALUES (
    'b2b022ed-5f0a-40f2-801e-b9c4c1d99be3', 
    'Test Video Manual V2 (With Therapist)',
    'https://res.cloudinary.com/demo/video/upload/dog.mp4',
    'manual_test_v2_path',
    20,
    '4e64433c-a10a-4a13-8b0c-8a00b0d5221a' -- Actual Therapist ID
);

-- Check if it was inserted
SELECT * FROM public.video_uploads WHERE title = 'Test Video Manual V2 (With Therapist)';
