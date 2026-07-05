import type { Account, Asset, Transaction } from "@/lib/types";
import { computeAccountBalances } from "@/lib/balances";
import { nowInBrazil, toLocalISODate } from "@/lib/format";

export function totalAssetsValue(assets: Asset[]): number {
  return assets.reduce((sum, a) => sum + a.current_value, 0);
}

export function accountsTotalBalance(accounts: Account[], transactions: Transaction[]): number {
  const balances = computeAccountBalances(accounts, transactions);
  return accounts.filter((a) => a.is_active).reduce((sum, a) => sum + (balances.get(a.id) ?? 0), 0);
}

export type MonthPoint = { label: string; value: number };

/**
 * Aproximação da evolução do patrimônio: saldo consolidado das contas ao
 * final de cada um dos últimos `months` meses, a partir do histórico de
 * transações. Não inclui assets (sem histórico ainda).
 */
export function accountBalanceHistory(
  accounts: Account[],
  transactions: Transaction[],
  months = 6,
  reference: Date = nowInBrazil(),
): MonthPoint[] {
  const points: MonthPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthEnd = new Date(reference.getFullYear(), reference.getMonth() - i + 1, 0);
    const cutoff = toLocalISODate(monthEnd);
    const upToCutoff = transactions.filter((tx) => tx.occurred_on <= cutoff);
    const value = accountsTotalBalance(accounts, upToCutoff);
    const label = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(monthEnd);
    points.push({ label, value });
  }

  return points;
}
