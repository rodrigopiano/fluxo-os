import type { Category, CategoryKind, Subcategory, Tag, Transaction } from "@/lib/types";

type TransactionRow = Transaction & {
  transaction_tags?: { tag: Tag }[];
};

export function withTransactionTags(rows: TransactionRow[]): Transaction[] {
  return rows.map(({ transaction_tags, ...tx }) => ({
    ...tx,
    tags: (transaction_tags ?? []).map((t) => t.tag),
  }));
}

export function describeCategories(
  categories: Category[],
  subcategories: Subcategory[],
  kind: CategoryKind,
) {
  return categories
    .filter((c) => c.kind === kind)
    .map((c) => {
      const subs = subcategories.filter((s) => s.category_id === c.id).map((s) => s.name);
      return subs.length > 0 ? `${c.name} (${subs.join(", ")})` : c.name;
    })
    .join("; ");
}
