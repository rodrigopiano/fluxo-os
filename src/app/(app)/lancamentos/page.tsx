import { createClient } from "@/lib/supabase/server";
import { TransactionFormDialog } from "@/components/lancamentos/transaction-form-dialog";
import { TransactionList } from "@/components/lancamentos/transaction-list";
import { ScanReceiptButton } from "@/components/lancamentos/scan-receipt-button";
import type { Account, Transaction } from "@/lib/types";

export default async function LancamentosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: accounts }, { data: transactions }] = await Promise.all([
    supabase.from("accounts").select("*").eq("user_id", user!.id).order("created_at"),
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user!.id)
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  const accountList = (accounts ?? []) as Account[];
  const transactionList = (transactions ?? []) as Transaction[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Lançamentos</h1>
        <div className="flex gap-2">
          <ScanReceiptButton accounts={accountList} />
          <TransactionFormDialog accounts={accountList} />
        </div>
      </div>

      <TransactionList transactions={transactionList} accounts={accountList} />
    </div>
  );
}
