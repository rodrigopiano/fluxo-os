-- FluxoOS — schema inicial (profiles, accounts, transactions)

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  institution text not null default 'Outro',
  color text not null default '#10b981',
  initial_balance numeric(14, 2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  destination_account_id uuid references public.accounts(id) on delete set null,
  type text not null check (type in ('receita', 'despesa', 'transferencia')),
  amount numeric(14, 2) not null check (amount > 0),
  category text,
  description text,
  occurred_on date not null default current_date,
  created_at timestamptz not null default now(),
  constraint transferencia_precisa_destino check (
    type <> 'transferencia' or destination_account_id is not null
  )
);

create index if not exists transactions_user_occurred_on_idx
  on public.transactions (user_id, occurred_on desc);
create index if not exists accounts_user_idx on public.accounts (user_id);

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own accounts" on public.accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own transactions" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Cria o profile automaticamente quando um usuário se cadastra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
