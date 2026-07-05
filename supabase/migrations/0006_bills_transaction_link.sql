-- FluxoOS — liga contas a pagar/receber pagas a um lançamento real,
-- para que afetem o saldo das contas e os totais do mês.

alter table public.bills
  add column if not exists account_id uuid references public.accounts(id) on delete set null,
  add column if not exists transaction_id uuid references public.transactions(id) on delete set null;
