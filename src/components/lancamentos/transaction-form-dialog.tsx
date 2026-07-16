"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { upsertTransactionAction, type FormState } from "@/lib/actions/transactions";
import { upsertCardPurchaseAction, type FormState as CardFormState } from "@/lib/actions/cards";
import { accountLabel, toLocalISODate } from "@/lib/format";
import {
  CATEGORIES,
  type Account,
  type Card as CreditCard,
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
const cardInitialState: CardFormState = { error: null };

type PaymentMethod = "debito" | "credito";

export function TransactionFormDialog({
  accounts,
  cards,
  transaction,
  trigger,
  initialValues,
  defaultAccountId,
  subtitle,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  onSaved,
}: {
  accounts: Account[];
  cards: CreditCard[];
  transaction?: Transaction;
  trigger?: React.ReactNode;
  initialValues?: ExtractedReceipt;
  defaultAccountId?: string;
  subtitle?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaved?: (accountId?: string) => void;
}) {
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? openProp : internalOpen;
  const setOpen = isControlled ? (onOpenChangeProp ?? (() => {})) : setInternalOpen;

  const defaultType = transaction?.type ?? initialValues?.type ?? "despesa";
  const [type, setType] = useState<TransactionType>(defaultType);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("debito");
  const [pending, setPending] = useState(false);
  const isEdit = Boolean(transaction);
  const isCreditPurchase = !isEdit && type === "despesa" && paymentMethod === "credito";

  async function handleSubmit(formData: FormData) {
    setPending(true);

    if (isCreditPurchase) {
      const result = await upsertCardPurchaseAction(cardInitialState, formData);
      setPending(false);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Compra lançada no cartão.");
      if (onSaved) onSaved();
      else setOpen(false);
      return;
    }

    const result = await upsertTransactionAction(initialState, formData);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Lançamento atualizado." : "Lançamento adicionado.");
    if (onSaved) {
      onSaved(formData.get("accountId")?.toString());
    } else {
      setOpen(false);
    }
  }

  const activeAccounts = accounts.filter((a) => a.is_active);
  const activeCards = cards.filter((c) => c.is_active);
  const categories = type === "transferencia" ? [] : CATEGORIES[type];
  const noOptionsAvailable = isCreditPurchase ? activeCards.length === 0 : activeAccounts.length === 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setType(defaultType);
          setPaymentMethod("debito");
        }
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
          {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
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

          {!isEdit && type === "despesa" ? (
            <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              <TabsList className="w-full">
                <TabsTrigger value="debito" className="flex-1">
                  Débito
                </TabsTrigger>
                <TabsTrigger value="credito" className="flex-1">
                  Crédito
                </TabsTrigger>
              </TabsList>
            </Tabs>
          ) : null}

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
            {isCreditPurchase ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="cardId">Cartão</Label>
                <Select name="cardId">
                  <SelectTrigger id="cardId" className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCards.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Label htmlFor="accountId">{type === "transferencia" ? "De" : "Conta"}</Label>
                <Select name="accountId" defaultValue={transaction?.account_id ?? defaultAccountId}>
                  <SelectTrigger id="accountId" className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeAccounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {accountLabel(a)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
                        {accountLabel(a)}
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

          {isCreditPurchase ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="installmentsTotal">Parcelas</Label>
              <Input
                id="installmentsTotal"
                name="installmentsTotal"
                type="number"
                min="1"
                max="48"
                defaultValue={1}
                required
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="occurredOn">Data</Label>
            <Input
              id="occurredOn"
              name={isCreditPurchase ? "purchasedOn" : "occurredOn"}
              type="date"
              defaultValue={
                transaction?.occurred_on ?? initialValues?.occurredOn ?? toLocalISODate(new Date())
              }
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">{isCreditPurchase ? "Descrição" : "Descrição (opcional)"}</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={transaction?.description ?? initialValues?.description ?? ""}
              rows={2}
              required={isCreditPurchase}
            />
          </div>

          <Button type="submit" disabled={pending || noOptionsAvailable} className="mt-2">
            {pending ? "Salvando..." : "Salvar"}
          </Button>
          {noOptionsAvailable ? (
            <p className="text-center text-sm text-muted-foreground">
              {isCreditPurchase
                ? "Cadastre um cartão antes de lançar uma compra no crédito."
                : "Cadastre uma conta antes de lançar movimentações."}
            </p>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
