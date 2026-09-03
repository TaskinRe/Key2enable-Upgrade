-- ============================================================
-- Mood Entries Consolidation Migration
-- Run this in your MAIN Supabase project's SQL editor.
-- (You can now retire the separate mood-check-pi Supabase project
--  once you've migrated/exported anything you want to keep from it.)
-- ============================================================

-- 1. Add a QR token to students. This is what gets printed on the
--    student's card — NOT the raw students.id — so a scanned/guessed
--    token can't be used to enumerate or target other student records.
alter table students
  add column if not exists qr_token uuid not null default gen_random_uuid();

create unique index if not exists students_qr_token_idx
  on students (qr_token);

-- 2. Drop the old table if it exists in a half-built state from
--    earlier experiments (student_id-based, no constraints). Comment
--    this out if you already have real data in it you want to keep —
--    in that case, migrate manually instead of dropping.
drop table if exists mood_entries;

create table mood_entries (
  id uuid primary key default gen_random_uuid(),
  student_id integer not null references students(id) on delete cascade,
  group_id integer references groups(id) on delete set null,
  mood text not null check (mood in ('happy', 'sad', 'tired', 'excited', 'calm')),
  entry_date date not null default current_date,
  month text not null,           -- e.g. "September 2026" — kept for backward
                                  -- compatibility with existing dashboard queries
  created_at timestamptz not null default now(),

  -- One check-in per student per day. Re-scanning the same day
  -- updates the existing row instead of creating a duplicate.
  unique (student_id, entry_date)
);

create index if not exists mood_entries_student_idx on mood_entries (student_id);
create index if not exists mood_entries_group_idx on mood_entries (group_id);
create index if not exists mood_entries_date_idx on mood_entries (entry_date);

-- 3. Row Level Security (same pattern as the rest of your audit's
--    Stage 3). The backend uses the service role key and bypasses RLS
--    for the routes it already scopes in application code — this is
--    a defense-in-depth backstop, not the primary control.
alter table mood_entries enable row level security;

create policy "Teachers see mood entries for their students"
on mood_entries for select
using (
  student_id in (
    select s.id from students s
    join group_teachers gt on gt.group_id = s.group_id
    join teachers t on t.id = gt.teacher_id
    where t.clerk_user_id = auth.uid()::text
  )
);

create policy "Students see their own mood entries"
on mood_entries for select
using (
  student_id in (
    select id from students where clerk_user_id = auth.uid()::text
  )
);

-- No insert/update/delete policies for authenticated/anon roles —
-- all writes go through the backend's service role via the guarded
-- POST /mood-entries/kiosk endpoint, never directly from the browser.
