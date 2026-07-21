import type { Tag, Transaction } from "@/lib/types";

type TransactionRow = Transaction & {
  transaction_tags?: { tag: Tag }[];
};

export function withTransactionTags(rows: TransactionRow[]): Transaction[] {
  return rows.map(({ transaction_tags, ...tx }) => ({
    ...tx,
    tags: (transaction_tags ?? []).map((t) => t.tag),
  }));
}
