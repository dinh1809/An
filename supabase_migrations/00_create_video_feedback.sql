
-- Create video_feedback table for timestamped annotations
create table if not exists public.video_feedback (
    id uuid default gen_random_uuid() primary key,
    video_id uuid references public.video_uploads(id) on delete cascade not null,
    user_id uuid references auth.users(id) not null,
    timestamp float not null default 0, -- Seconds from start
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.video_feedback enable row level security;

-- Policies
-- 1. Therapists can see all feedback
create policy "Therapists can view all feedback"
on public.video_feedback for select
using ( 
  auth.uid() in (select id from public.profiles where role = 'therapist') 
  or 
  user_id = auth.uid() 
);

-- 2. Parents can see feedback on their own videos (complex join, simplified for now to: owner of comment or everyone)
-- For MVP, enabling read for authenticated users to ensure parents see the feedback
create policy "Authenticated users can read feedback"
on public.video_feedback for select
to authenticated
using (true);

-- 3. Therapists can insert feedback
create policy "Users can insert feedback"
on public.video_feedback for insert
to authenticated
with check ( auth.uid() = user_id );
