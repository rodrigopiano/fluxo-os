import { ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format";
import { deleteTransactionAction } from "@/lib/actions/transactions";
import { TransactionFormDialog } from "@/components/lancamentos/transaction-form-dialog";
import type { Account, Card as CreditCard, Category, Subcategory, Tag, Transaction } from "@/lib/types";

const TYPE_META = {
  receita: { icon: ArrowUpCircle, color: "text-emerald-500", sign: "+" },
  despesa: { icon: ArrowDownCircle, color: "text-red-500", sign: "-" },
  transferencia: { icon: ArrowLeftRight, color: "text-blue-400", sign: "" },
} as const;

export function TransactionList({
  transactions,
  accounts,
  cards,
  categories,
  subcategories,
  tags,
}: {
  transactions: Transaction[];
  accounts: Account[];
  cards: CreditCard[];
  categories: Category[];
  subcategories: Subcategory[];
  tags: Tag[];
}) {
  const accountById = new Map(accounts.map((a) => [a.id, a]));

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
        Nenhum lançamento por aqui ainda. Adicione sua primeira receita ou despesa.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {transactions.map((tx) => {
        const meta = TYPE_META[tx.type];
        const Icon = meta.icon;
        const account = accountById.get(tx.account_id);
        const destination = tx.destination_account_id
          ? accountById.get(tx.destination_account_id)
          : undefined;

        return (
          <Card key={tx.id}>
            <CardContent className="flex items-center gap-3">
              <Icon className={`size-5 shrink-0 ${meta.color}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {tx.description ||
                    tx.category?.name ||
                    (tx.type === "transferencia" ? "Transferência" : "Lançamento")}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {account?.name}
                  {destination ? ` → ${destination.name}` : ""}
                  {tx.subcategory?.name ? ` · ${tx.subcategory.name}` : tx.category?.name ? ` · ${tx.category.name}` : ""}
                  {" · "}
                  {formatDate(tx.occurred_on)}
                </p>
              </div>
              <p className={`shrink-0 font-semibold ${meta.color}`}>
                {meta.sign}
                {formatCurrency(tx.amount)}
              </p>
              <div className="flex shrink-0 items-center gap-1">
                <TransactionFormDialog
                  accounts={accounts}
                  cards={cards}
                  categories={categories}
                  subcategories={subcategories}
                  tags={tags}
                  transaction={tx}
                  trigger={
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  }
                />
                <form action={deleteTransactionAction}>
                  <input type="hidden" name="id" value={tx.id} />
                  <Button variant="ghost" size="icon" className="size-8" type="submit">
                    <Trash2 className="size-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
