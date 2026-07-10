-- Featured (promoted) courses. Admin curates an ordered list of published
-- courses to highlight on the storefront. Safe to re-run.

create table if not exists public.featured_courses (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  constraint featured_courses_course_id_key unique (course_id)
);

create index if not exists featured_courses_position_idx
  on public.featured_courses (position);

alter table public.featured_courses enable row level security;

-- Publicly readable: the learner app promotes these on the storefront.
drop policy if exists "Featured courses are public" on public.featured_courses;
create policy "Featured courses are public"
  on public.featured_courses for select
  using (true);

-- Only admins can add / reorder / remove featured courses.
drop policy if exists "Admin can manage featured courses" on public.featured_courses;
create policy "Admin can manage featured courses"
  on public.featured_courses for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'ADMIN'::user_role
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'ADMIN'::user_role
    )
  );
