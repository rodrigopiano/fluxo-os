-- FluxoOS — Módulo 8: Metas

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(14, 2) not null check (target_amount > 0),
  current_amount numeric(14, 2) not null default 0,
  is_emergency_reserve boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists goals_user_idx on public.goals (user_id);

alter table public.goals enable row level security;

create policy "own goals" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
