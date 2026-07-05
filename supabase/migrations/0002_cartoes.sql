-- FluxoOS — Módulo 4: Cartões

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  institution text not null default 'Outro',
  color text not null default '#a855f7',
  credit_limit numeric(14, 2) not null default 0,
  closing_day smallint not null check (closing_day between 1 and 28),
  due_day smallint not null check (due_day between 1 and 28),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.card_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  description text not null,
  category text,
  amount numeric(14, 2) not null check (amount > 0),
  installments_total smallint not null default 1 check (installments_total between 1 and 48),
  purchased_on date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists card_purchases_card_idx
  on public.card_purchases (card_id, purchased_on desc);
create index if not exists cards_user_idx on public.cards (user_id);

alter table public.cards enable row level security;
alter table public.card_purchases enable row level security;

create policy "own cards" on public.cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own card_purchases" on public.card_purchases
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
