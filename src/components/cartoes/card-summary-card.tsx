import { Eye, EyeOff } from "lucide-react";
import { Card as UiCard, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { availableLimit, currentInvoiceTotal, nextDueDate } from "@/lib/cards";
import { toggleCardActiveAction } from "@/lib/actions/cards";
import { CardFormDialog } from "@/components/cartoes/card-form-dialog";
import { PurchaseFormDialog } from "@/components/cartoes/purchase-form-dialog";
import type { Card, CardPurchase } from "@/lib/types";

export function CardSummaryCard({
  card,
  allCards,
  purchases,
}: {
  card: Card;
  allCards: Card[];
  purchases: CardPurchase[];
}) {
  const available = availableLimit(card, purchases);
  const invoice = currentInvoiceTotal(card, purchases);
  const dueDate = nextDueDate(card);
  const dueDateLabel = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(
    dueDate,
  );

  return (
    <UiCard className={card.is_active ? "" : "opacity-50"}>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="size-10 shrink-0 rounded-full" style={{ backgroundColor: card.color }} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{card.name}</p>
            <p className="text-sm text-muted-foreground">{card.institution}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <CardFormDialog card={card} />
            <form action={toggleCardActiveAction}>
              <input type="hidden" name="id" value={card.id} />
              <input type="hidden" name="isActive" value={String(card.is_active)} />
              <Button variant="ghost" size="icon" className="size-8" type="submit">
                {card.is_active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </Button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Limite</p>
            <p className="font-medium">{formatCurrency(card.credit_limit)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Disponível</p>
            <p className={`font-medium ${available < 0 ? "text-destructive" : ""}`}>
              {formatCurrency(available)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Fatura atual</p>
            <p className="font-medium">{formatCurrency(invoice)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Próximo vencimento</p>
            <p className="font-medium">{dueDateLabel}</p>
          </div>
        </div>

        <PurchaseFormDialog
          cards={allCards}
          defaultCardId={card.id}
          trigger={
            <Button variant="outline" size="sm" className="self-start">
              Nova compra
            </Button>
          }
        />
      </CardContent>
    </UiCard>
  );
}
