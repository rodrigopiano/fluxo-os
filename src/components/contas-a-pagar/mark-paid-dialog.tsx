"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { markBillPaidAction, type FormState } from "@/lib/actions/bills";
import { accountLabel } from "@/lib/format";
import type { Account, Bill, BillDirection } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const initialState: FormState = { error: null };

export function MarkPaidDialog({
  bill,
  direction,
  accounts,
}: {
  bill: Bill;
  direction: BillDirection;
  accounts: Account[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const activeAccounts = accounts.filter((a) => a.is_active);
  const noun = direction === "pagar" ? "paga" : "recebida";

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const result = await markBillPaidAction(initialState, formData);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      setOpen(false);
      toast.success(`Conta marcada como ${noun} e lançada na conta.`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <Check className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Marcar &quot;{bill.description}&quot; como {noun}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={bill.id} />
          <input type="hidden" name="direction" value={direction} />
          <Select name="accountId">
            <SelectTrigger className="w-full">
              <SelectValue placeholder={direction === "pagar" ? "De qual conta saiu?" : "Em qual conta entrou?"} />
            </SelectTrigger>
            <SelectContent>
              {activeAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {accountLabel(account)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={pending || activeAccounts.length === 0}>
            {pending ? "Salvando..." : "Confirmar"}
          </Button>
          {activeAccounts.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Cadastre uma conta antes de confirmar este pagamento.
            </p>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
