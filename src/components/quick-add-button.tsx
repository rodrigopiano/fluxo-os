import { Plus } from "lucide-react";
import { TransactionFormDialog } from "@/components/lancamentos/transaction-form-dialog";
import { Button } from "@/components/ui/button";
import type { Account, Card } from "@/lib/types";

export function QuickAddButton({ accounts, cards }: { accounts: Account[]; cards: Card[] }) {
  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-8 md:right-8">
      <TransactionFormDialog
        accounts={accounts}
        cards={cards}
        trigger={
          <Button size="icon" className="size-14 rounded-full shadow-lg">
            <Plus className="size-6" />
          </Button>
        }
      />
    </div>
  );
}
