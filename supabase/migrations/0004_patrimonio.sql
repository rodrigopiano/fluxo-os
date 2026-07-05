-- FluxoOS — Módulo 7: Patrimônio

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (
    category in ('investimento', 'imovel', 'veiculo', 'consorcio', 'empresa', 'outro')
  ),
  name text not null,
  current_value numeric(14, 2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists assets_user_idx on public.assets (user_id);

alter table public.assets enable row level security;

create policy "own assets" on public.assets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
