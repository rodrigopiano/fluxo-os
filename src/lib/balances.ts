import type { Account, Transaction } from "@/lib/types";

export function computeAccountBalances(
  accounts: Account[],
  transactions: Transaction[],
): Map<string, number> {
  const balances = new Map(accounts.map((account) => [account.id, account.initial_balance]));

  for (const tx of transactions) {
    if (tx.type === "receita") {
      balances.set(tx.account_id, (balances.get(tx.account_id) ?? 0) + tx.amount);
    } else if (tx.type === "despesa") {
      balances.set(tx.account_id, (balances.get(tx.account_id) ?? 0) - tx.amount);
    } else if (tx.type === "transferencia") {
      balances.set(tx.account_id, (balances.get(tx.account_id) ?? 0) - tx.amount);
      if (tx.destination_account_id) {
        balances.set(
          tx.destination_account_id,
          (balances.get(tx.destination_account_id) ?? 0) + tx.amount,
        );
      }
    }
  }

  return balances;
}

export function computeMonthSummary(transactions: Transaction[]) {
  return transactions.reduce(
    (acc, tx) => {
      if (tx.type === "receita") acc.income += tx.amount;
      if (tx.type === "despesa") acc.expense += tx.amount;
      return acc;
    },
    { income: 0, expense: 0 },
  );
}
