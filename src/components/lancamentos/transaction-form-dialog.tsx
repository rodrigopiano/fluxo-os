"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { upsertTransactionAction, type FormState } from "@/lib/actions/transactions";
import { toLocalISODate } from "@/lib/format";
import {
  CATEGORIES,
  type Account,
  type ExtractedReceipt,
  type Transaction,
  type TransactionType,
} from "@/lib/types";
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

export function TransactionFormDialog({
  accounts,
  transaction,
  trigger,
  initialValues,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: {
  accounts: Account[];
  transaction?: Transaction;
  trigger?: React.ReactNode;
  initialValues?: ExtractedReceipt;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? openProp : internalOpen;
  const setOpen = isControlled ? (onOpenChangeProp ?? (() => {})) : setInternalOpen;

  const defaultType = transaction?.type ?? initialValues?.type ?? "despesa";
  const [type, setType] = useState<TransactionType>(defaultType);
  const [pending, setPending] = useState(false);
  const isEdit = Boolean(transaction);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const result = await upsertTransactionAction(initialState, formData);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      setOpen(false);
      toast.success(isEdit ? "Lançamento atualizado." : "Lançamento adicionado.");
    }
  }

  const activeAccounts = accounts.filter((a) => a.is_active);
  const categories = type === "transferencia" ? [] : CATEGORIES[type];

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setType(defaultType);
      }}
    >
      {isControlled ? null : (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button className="gap-2">
              <Plus className="size-4" />
              Novo lançamento
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar lançamento" : "Novo lançamento"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
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
              defaultValue={transaction?.amount ?? initialValues?.amount ?? undefined}
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
                <Select
                  name="category"
                  defaultValue={transaction?.category ?? initialValues?.category ?? undefined}
                >
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
              defaultValue={
                transaction?.occurred_on ?? initialValues?.occurredOn ?? toLocalISODate(new Date())
              }
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={transaction?.description ?? initialValues?.description ?? ""}
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
