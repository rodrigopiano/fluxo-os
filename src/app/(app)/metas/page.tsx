import { createClient } from "@/lib/supabase/server";
import { computeMonthSummary } from "@/lib/balances";
import { monthRange } from "@/lib/format";
import { GoalFormDialog } from "@/components/metas/goal-form-dialog";
import { GoalCard } from "@/components/metas/goal-card";
import type { Goal, Transaction } from "@/lib/types";

export default async function MetasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: goals }, { data: transactions }] = await Promise.all([
    supabase.from("goals").select("*").eq("user_id", user!.id).order("created_at"),
    supabase.from("transactions").select("*").eq("user_id", user!.id),
  ]);

  const goalList = (goals ?? []) as Goal[];
  const { start, end } = monthRange();
  const monthTransactions = ((transactions ?? []) as Transaction[]).filter(
    (tx) => tx.occurred_on >= start && tx.occurred_on <= end,
  );
  const { income, expense } = computeMonthSummary(monthTransactions);
  const monthlySavings = income - expense;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Metas</h1>
        <GoalFormDialog />
      </div>

      {goalList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          Nenhuma meta cadastrada ainda. Crie uma reserva de emergência, entrada do imóvel, ou
          qualquer objetivo financeiro.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {goalList.map((goal) => (
            <GoalCard key={goal.id} goal={goal} monthlySavings={monthlySavings} />
          ))}
        </div>
      )}
    </div>
  );
}
