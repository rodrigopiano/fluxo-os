-- FluxoOS — Recorrência em Contas a Pagar/Receber
alter table public.bills
  add column if not exists is_recurring boolean not null default false;
