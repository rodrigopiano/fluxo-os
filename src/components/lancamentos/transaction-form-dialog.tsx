"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { upsertTransactionAction, type FormState } from "@/lib/actions/transactions";
import { CATEGORIES, type Account, type Transaction, type TransactionType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionFormDialog({
  accounts,
  transaction,
  trigger,
}: {
  accounts: Account[];
  transaction?: Transaction;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "despesa");
  const [state, action, pending] = useActionState(upsertTransactionAction, initialState);
  const wasPending = useRef(false);
  const isEdit = Boolean(transaction);

  useEffect(() => {
    if (wasPending.current && !pending) {
      if (state.error) {
        toast.error(state.error);
      } else {
        setOpen(false);
        toast.success(isEdit ? "Lançamento atualizado." : "Lançamento adicionado.");
      }
    }
    wasPending.current = pending;
  }, [pending, state, isEdit]);

  const activeAccounts = accounts.filter((a) => a.is_active);
  const categories = type === "transferencia" ? [] : CATEGORIES[type];

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setType(transaction?.type ?? "despesa");
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2">
            <Plus className="size-4" />
            Novo lançamento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar lançamento" : "Novo lançamento"}</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4">
          {transaction ? <input type="hidden" name="id" value={transaction.id} /> : null}
          <input type="hidden" name="type" value={type} />

          <Tabs value={type} onValueChange={(v) => setType(v as TransactionType)}>
            <TabsList className="w-full">
              <TabsTrigger value="receita" className="flex-1">
                Receita
              </TabsTrigger>
              <TabsTrigger value="despesa" className="flex-1">
                Despesa
              </TabsTrigger>
              <TabsTrigger value="transferencia" className="flex-1">
                Transferência
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={transaction?.amount}
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="accountId">{type === "transferencia" ? "De" : "Conta"}</Label>
              <Select name="accountId" defaultValue={transaction?.account_id}>
                <SelectTrigger id="accountId" className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {activeAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {type === "transferencia" ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="destinationAccountId">Para</Label>
                <Select
                  name="destinationAccountId"
                  defaultValue={transaction?.destination_account_id ?? undefined}
                >
                  <SelectTrigger id="destinationAccountId" className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeAccounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select name="category" defaultValue={transaction?.category ?? undefined}>
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="occurredOn">Data</Label>
            <Input
              id="occurredOn"
              name="occurredOn"
              type="date"
              defaultValue={transaction?.occurred_on ?? todayISO()}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={transaction?.description ?? ""}
              rows={2}
            />
          </div>

          <Button type="submit" disabled={pending || activeAccounts.length === 0} className="mt-2">
            {pending ? "Salvando..." : "Salvar"}
          </Button>
          {activeAccounts.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Cadastre uma conta antes de lançar movimentações.
            </p>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
