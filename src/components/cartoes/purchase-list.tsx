import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format";
import { installmentSchedule, installmentsElapsed } from "@/lib/cards";
import { deleteCardPurchaseAction } from "@/lib/actions/cards";
import { PurchaseFormDialog } from "@/components/cartoes/purchase-form-dialog";
import type { Card as CardType, CardPurchase, Category, Subcategory } from "@/lib/types";

export function PurchaseList({
  purchases,
  cards,
  categories,
  subcategories,
}: {
  purchases: CardPurchase[];
  cards: CardType[];
  categories: Category[];
  subcategories: Subcategory[];
}) {
  const cardById = new Map(cards.map((c) => [c.id, c]));

  if (purchases.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
        Nenhuma compra registrada ainda.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {purchases.map((purchase) => {
        const card = cardById.get(purchase.card_id);
        const isInstallment = purchase.installments_total > 1;
        const elapsed = card ? installmentsElapsed(purchase, card) : 0;
        const installmentAmount = card ? installmentSchedule(purchase, card)[0]?.amount : purchase.amount;

        return (
          <Card key={purchase.id}>
            <CardContent className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{purchase.description}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {card?.name} ·{" "}
                  {purchase.subcategory?.name ?? purchase.category?.name ?? "Sem categoria"} ·{" "}
                  {formatDate(purchase.purchased_on)}
                  {isInstallment ? ` · ${Math.min(elapsed + 1, purchase.installments_total)}/${purchase.installments_total}` : ""}
                </p>
              </div>
              <p className="shrink-0 font-semibold">
                {formatCurrency(isInstallment ? (installmentAmount ?? purchase.amount) : purchase.amount)}
              </p>
              <div className="flex shrink-0 items-center gap-1">
                <PurchaseFormDialog
                  cards={cards}
                  categories={categories}
                  subcategories={subcategories}
                  purchase={purchase}
                  trigger={
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  }
                />
                <form action={deleteCardPurchaseAction}>
                  <input type="hidden" name="id" value={purchase.id} />
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
