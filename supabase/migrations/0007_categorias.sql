-- FluxoOS — Sistema de Categorias (Categoria > Subcategoria > Tags)
-- Substitui as listas fixas de categoria (texto solto) em transactions,
-- card_purchases e bills por uma estrutura de verdade, editável pelo
-- usuário e compartilhada entre os três módulos.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('despesa', 'receita')),
  color text not null default '#64748b',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.subcategories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#64748b',
  created_at timestamptz not null default now()
);

create table if not exists public.transaction_tags (
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (transaction_id, tag_id)
);

create index if not exists categories_user_kind_idx on public.categories (user_id, kind);
create index if not exists subcategories_category_idx on public.subcategories (category_id);
create index if not exists tags_user_idx on public.tags (user_id);

alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.tags enable row level security;
alter table public.transaction_tags enable row level security;

create policy "own categories" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own subcategories" on public.subcategories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own tags" on public.tags
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own transaction_tags" on public.transaction_tags
  for all using (
    exists (
      select 1 from public.transactions t
      where t.id = transaction_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.transactions t
      where t.id = transaction_id and t.user_id = auth.uid()
    )
  );

-- Categorias/subcategorias padrão para um usuário
create or replace function public.seed_default_categories(target_user uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  cat_id uuid;
begin
  insert into public.categories (user_id, name, kind, position)
    values (target_user, 'Moradia', 'despesa', 0) returning id into cat_id;
  insert into public.subcategories (user_id, category_id, name, position) values
    (target_user, cat_id, 'Aluguel', 0),
    (target_user, cat_id, 'Água', 1),
    (target_user, cat_id, 'Luz', 2),
    (target_user, cat_id, 'Internet', 3),
    (target_user, cat_id, 'Condomínio', 4);

  insert into public.categories (user_id, name, kind, position)
    values (target_user, 'Alimentação', 'despesa', 1) returning id into cat_id;
  insert into public.subcategories (user_id, category_id, name, position) values
    (target_user, cat_id, 'Supermercado', 0),
    (target_user, cat_id, 'Restaurante', 1),
    (target_user, cat_id, 'Delivery', 2);

  insert into public.categories (user_id, name, kind, position)
    values (target_user, 'Transporte', 'despesa', 2) returning id into cat_id;
  insert into public.subcategories (user_id, category_id, name, position) values
    (target_user, cat_id, 'Combustível', 0),
    (target_user, cat_id, 'Transporte por app', 1),
    (target_user, cat_id, 'Transporte público', 2);

  insert into public.categories (user_id, name, kind, position)
    values (target_user, 'Saúde', 'despesa', 3) returning id into cat_id;
  insert into public.subcategories (user_id, category_id, name, position) values
    (target_user, cat_id, 'Plano de saúde', 0),
    (target_user, cat_id, 'Farmácia', 1),
    (target_user, cat_id, 'Consultas', 2);

  insert into public.categories (user_id, name, kind, position)
    values (target_user, 'Assinaturas', 'despesa', 4) returning id into cat_id;
  insert into public.subcategories (user_id, category_id, name, position) values
    (target_user, cat_id, 'Streaming', 0),
    (target_user, cat_id, 'Software', 1);

  insert into public.categories (user_id, name, kind, position) values
    (target_user, 'Lazer', 'despesa', 5),
    (target_user, 'Educação', 'despesa', 6),
    (target_user, 'Impostos', 'despesa', 7),
    (target_user, 'Compras', 'despesa', 8),
    (target_user, 'Parcelamentos', 'despesa', 9),
    (target_user, 'Outros', 'despesa', 10);

  insert into public.categories (user_id, name, kind, position) values
    (target_user, 'Salário', 'receita', 0),
    (target_user, 'Freelance', 'receita', 1),
    (target_user, 'Comissão', 'receita', 2),
    (target_user, 'Aluguel recebido', 'receita', 3),
    (target_user, 'Dividendos', 'receita', 4),
    (target_user, 'Cliente', 'receita', 5),
    (target_user, 'Outros', 'receita', 6);
end;
$$;

-- Popula quem já tem conta (idempotente: pula quem já tem categorias)
do $$
declare
  u record;
begin
  for u in select id from auth.users loop
    if not exists (select 1 from public.categories where user_id = u.id) then
      perform public.seed_default_categories(u.id);
    end if;
  end loop;
end $$;

-- Novos cadastros também ganham as categorias padrão
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  perform public.seed_default_categories(new.id);
  return new;
end;
$$;

-- Liga transactions/card_purchases/bills à nova estrutura
alter table public.transactions
  add column if not exists category_id uuid references public.categories(id) on delete set null,
  add column if not exists subcategory_id uuid references public.subcategories(id) on delete set null;
alter table public.card_purchases
  add column if not exists category_id uuid references public.categories(id) on delete set null,
  add column if not exists subcategory_id uuid references public.subcategories(id) on delete set null;
alter table public.bills
  add column if not exists category_id uuid references public.categories(id) on delete set null,
  add column if not exists subcategory_id uuid references public.subcategories(id) on delete set null;

-- Backfill: casa o texto antigo com a subcategoria (herdando a categoria pai)
update public.transactions t
set subcategory_id = s.id, category_id = s.category_id
from public.subcategories s join public.categories c on c.id = s.category_id
where c.user_id = t.user_id and c.kind = t.type and s.name = t.category;

update public.card_purchases p
set subcategory_id = s.id, category_id = s.category_id
from public.subcategories s join public.categories c on c.id = s.category_id
where c.user_id = p.user_id and c.kind = 'despesa' and s.name = p.category;

update public.bills b
set subcategory_id = s.id, category_id = s.category_id
from public.subcategories s join public.categories c on c.id = s.category_id
where c.user_id = b.user_id
  and c.kind = (case when b.direction = 'pagar' then 'despesa' else 'receita' end)
  and s.name = b.category;

-- Backfill: o que sobrou casa direto com a categoria (com os dois apelidos
-- legados de contas a receber normalizados: 'Freela' -> 'Freelance',
-- 'Aluguel' -> 'Aluguel recebido')
update public.transactions t
set category_id = c.id
from public.categories c
where t.category_id is null and c.user_id = t.user_id and c.kind = t.type and c.name = t.category;

update public.card_purchases p
set category_id = c.id
from public.categories c
where p.category_id is null and c.user_id = p.user_id and c.kind = 'despesa' and c.name = p.category;

update public.bills b
set category_id = c.id
from public.categories c
where b.category_id is null
  and c.user_id = b.user_id
  and c.kind = (case when b.direction = 'pagar' then 'despesa' else 'receita' end)
  and c.name = (
    case
      when b.direction = 'receber' and b.category = 'Freela' then 'Freelance'
      when b.direction = 'receber' and b.category = 'Aluguel' then 'Aluguel recebido'
      else b.category
    end
  );

-- Remove as colunas de texto antigas — rodar esta migration só uma vez
alter table public.transactions drop column if exists category;
alter table public.card_purchases drop column if exists category;
alter table public.bills drop column if exists category;
