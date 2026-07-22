-- FluxoOS — Importar extrato bancário (OFX)
alter table public.transactions add column if not exists external_id text;

create unique index if not exists transactions_account_external_id_idx
  on public.transactions (account_id, external_id)
  where external_id is not null;
