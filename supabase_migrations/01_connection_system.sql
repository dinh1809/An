
-- 1. ADD COLUMNS TO PROFILES
-- invite_code: Unique 6-char code for therapists (e.g., 'A1B2C3')
-- therapist_id: FK pointing to the therapist for patients
alter table public.profiles 
add column if not exists invite_code text unique,
add column if not exists therapist_id uuid references public.profiles(id);

-- 2. FUNCTION TO GENERATE UNIQUE CODE
-- Generates a random 6-character alphanumeric code
create or replace function public.generate_invite_code()
returns trigger as $$
declare
  new_code text;
  exists boolean;
begin
  -- Only generate for therapists and if code is missing
  if new.role = 'therapist' and new.invite_code is null then
    loop
      -- Generate random uppercase string of length 6
      select upper(substring(md5(random()::text) from 1 for 6)) into new_code;
      
      -- Check uniqueness
      select count(*) > 0 into exists from public.profiles where invite_code = new_code;
      
      -- Exit if unique
      exit when not exists;
    end loop;
    
    new.invite_code := new_code;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- 3. TRIGGER FOR AUTO-GENERATION
drop trigger if exists on_profile_created_generate_code on public.profiles;
create trigger on_profile_created_generate_code
before insert or update on public.profiles
for each row execute function public.generate_invite_code();

-- 4. RPC FUNCTION FOR SAFER CONNECTION
-- This allows a parent to call a function to link themselves by code
-- instead of needing permission to read all therapist profiles.
create or replace function public.connect_patient_to_therapist(code_input text)
returns json as $$
declare
  therapist_record record;
begin
  -- Find therapist by code
  select id, first_name, last_name 
  into therapist_record
  from public.profiles 
  where invite_code = upper(code_input) 
  and role = 'therapist'
  limit 1;

  if therapist_record.id is null then
    return json_build_object('success', false, 'message', 'Code not found');
  end if;

  -- Update the calling user's profile
  update public.profiles 
  set therapist_id = therapist_record.id 
  where id = auth.uid();

  return json_build_object(
    'success', true, 
    'message', 'Connected successfully',
    'therapist_name', coalesce(therapist_record.first_name || ' ' || therapist_record.last_name, 'Doctor')
  );
end;
$$ language plpgsql security definer;

-- 5. RLS POLICIES FOR DATA PRIVACY (CLOSED LOOP)

-- A. Profiles: Therapists can see their own patients
create policy "Therapists view their patients"
on public.profiles for select
using (
  auth.uid() = therapist_id
  or
  id = auth.uid() -- Can always see self
);

-- B. Video Uploads: Therapists can ONLY see videos from patients linked to them
-- (Assuming RLS is enabled on video_uploads)
drop policy if exists "Therapists view patient videos" on public.video_uploads;
create policy "Therapists view patient videos"
on public.video_uploads for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = video_uploads.user_id -- The patient who owns the video
    and p.therapist_id = auth.uid()    -- Is linked to the current therapist
  )
  or
  user_id = auth.uid() -- Can always see own videos
);

-- C. Appointments: Same logic (Optional, depending on your needs)
-- Assuming appointments table exists
-- create policy... (similar logic)
