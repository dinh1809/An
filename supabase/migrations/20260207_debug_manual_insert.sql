
-- Debug: Manually insert a video for a specific patient to test constraints
-- Replace 'b2b022ed-5f0a-40f2-801e-b9c4c1d99be3' with the patient ID you saw in your URL if it's different.

INSERT INTO public.video_uploads (
    user_id,
    title,
    file_url,
    file_path,
    duration_seconds,
    therapist_id
) VALUES (
    'b2b022ed-5f0a-40f2-801e-b9c4c1d99be3', -- User ID from your screenshot
    'Test Video Manual Insert',
    'https://res.cloudinary.com/demo/video/upload/dog.mp4', -- Dummy Video
    'manual_test_path',
    10,
    NULL -- Try NULL first to avoid FK constraint issues. If this works, then try with therapist_id.
);

-- Check if it was inserted
SELECT * FROM public.video_uploads WHERE title = 'Test Video Manual Insert';
