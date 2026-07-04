import { createClient } from "@/lib/supabase/server";
import { computeAccountBalances } from "@/lib/balances";
import { formatCurrency } from "@/lib/format";
import { AccountFormDialog } from "@/components/contas/account-form-dialog";
import { AccountCard } from "@/components/contas/account-card";
import type { Account, Transaction } from "@/lib/types";

export default async function ContasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: accounts }, { data: transactions }] = await Promise.all([
    supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: true }),
    supabase.from("transactions").select("*").eq("user_id", user!.id),
  ]);

  const accountList = (accounts ?? []) as Account[];
  const balances = computeAccountBalances(accountList, (transactions ?? []) as Transaction[]);
  const total = accountList
    .filter((a) => a.is_active)
    .reduce((sum, a) => sum + (balances.get(a.id) ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contas</h1>
          <p className="text-sm text-muted-foreground">
            Saldo consolidado: <span className="font-medium text-foreground">{formatCurrency(total)}</span>
          </p>
        </div>
        <AccountFormDialog />
      </div>

      {accountList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          Você ainda não tem contas cadastradas. Adicione seu banco, carteira digital ou dinheiro
          em espécie para começar.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {accountList.map((account) => (
            <AccountCard key={account.id} account={account} balance={balances.get(account.id) ?? 0} />
          ))}
        </div>
      )}
    </div>
  );
}
