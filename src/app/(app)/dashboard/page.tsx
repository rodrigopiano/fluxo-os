import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { computeAccountBalances, computeMonthSummary } from "@/lib/balances";
import { daysRemainingInMonth, monthRange, nowInBrazil } from "@/lib/format";
import { totalAssetsValue } from "@/lib/net-worth";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { UpcomingBillsCard } from "@/components/dashboard/upcoming-bills-card";
import { NetWorthCard } from "@/components/dashboard/net-worth-card";
import { EmergencyReserveCard } from "@/components/dashboard/emergency-reserve-card";
import { GoalsSummaryCard } from "@/components/dashboard/goals-summary-card";
import { TransactionList } from "@/components/lancamentos/transaction-list";
import { QuickAddButton } from "@/components/quick-add-button";
import type { Account, Asset, Bill, Card, Goal, Transaction } from "@/lib/types";

function greeting() {
  const hour = nowInBrazil().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: profile },
    { data: accounts },
    { data: transactions },
    { data: bills },
    { data: assets },
    { data: goals },
    { data: cards },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user!.id).single(),
    supabase.from("accounts").select("*").eq("user_id", user!.id),
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user!.id)
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("bills")
      .select("*")
      .eq("user_id", user!.id)
      .eq("direction", "pagar")
      .eq("status", "pendente"),
    supabase.from("assets").select("*").eq("user_id", user!.id),
    supabase.from("goals").select("*").eq("user_id", user!.id),
    supabase.from("cards").select("*").eq("user_id", user!.id),
  ]);

  const accountList = (accounts ?? []) as Account[];
  const transactionList = (transactions ?? []) as Transaction[];
  const billList = (bills ?? []) as Bill[];
  const assetList = (assets ?? []) as Asset[];
  const goalList = (goals ?? []) as Goal[];
  const cardList = (cards ?? []) as Card[];
  const emergencyGoal = goalList.find((g) => g.is_emergency_reserve);
  const otherGoals = goalList.filter((g) => !g.is_emergency_reserve);
  const firstName = (profile?.full_name || user?.email || "").split(" ")[0];

  const balances = computeAccountBalances(accountList, transactionList);
  const totalBalance = accountList
    .filter((a) => a.is_active)
    .reduce((sum, a) => sum + (balances.get(a.id) ?? 0), 0);

  const { start, end } = monthRange();
  const monthTransactions = transactionList.filter(
    (tx) => tx.occurred_on >= start && tx.occurred_on <= end,
  );
  const { income: monthIncome, expense: monthExpense } = computeMonthSummary(monthTransactions);
  const monthSavings = monthIncome - monthExpense;
  const canSpendToday = totalBalance / daysRemainingInMonth();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting()}, {firstName || "por aqui"}.
        </h1>
        <p className="text-sm text-muted-foreground">Aqui está como está sua vida financeira hoje.</p>
      </div>

      <SummaryCards
        totalBalance={totalBalance}
        canSpendToday={canSpendToday}
        monthIncome={monthIncome}
        monthExpense={monthExpense}
        monthSavings={monthSavings}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <UpcomingBillsCard bills={billList} />
        <NetWorthCard netWorth={totalBalance + totalAssetsValue(assetList)} />
        <EmergencyReserveCard goal={emergencyGoal} />
        <GoalsSummaryCard goals={otherGoals} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Últimos lançamentos</h2>
          <Link href="/lancamentos" className="text-sm text-muted-foreground underline underline-offset-4">
            Ver todos
          </Link>
        </div>
        <TransactionList
          transactions={transactionList.slice(0, 5)}
          accounts={accountList}
          cards={cardList}
        />
      </div>

      <QuickAddButton accounts={accountList} cards={cardList} />
    </div>
  );
}
