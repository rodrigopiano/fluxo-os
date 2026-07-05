-- FluxoOS — Módulo 5/6: Contas a Pagar e Contas a Receber

create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  direction text not null check (direction in ('pagar', 'receber')),
  description text not null,
  category text,
  amount numeric(14, 2) not null check (amount > 0),
  due_date date not null,
  status text not null default 'pendente' check (status in ('pendente', 'pago')),
  paid_on date,
  created_at timestamptz not null default now()
);

create index if not exists bills_user_direction_due_idx
  on public.bills (user_id, direction, due_date);

alter table public.bills enable row level security;

create policy "own bills" on public.bills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
