"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { upsertBillAction, type FormState } from "@/lib/actions/bills";
import { toLocalISODate } from "@/lib/format";
import { BILL_CATEGORIES, type Bill, type BillDirection } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export function BillFormDialog({
  direction,
  bill,
}: {
  direction: BillDirection;
  bill?: Bill;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const isEdit = Boolean(bill);
  const categories = BILL_CATEGORIES[direction];
  const noun = direction === "pagar" ? "conta" : "recebimento";

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const result = await upsertBillAction(initialState, formData);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      setOpen(false);
      toast.success(isEdit ? `${noun} atualizada.` : `${noun} adicionada.`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="size-8">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="size-4" />
            {direction === "pagar" ? "Nova conta a pagar" : "Novo recebimento"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? "Editar"
              : direction === "pagar"
                ? "Nova conta a pagar"
                : "Novo recebimento"}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          {bill ? <input type="hidden" name="id" value={bill.id} /> : null}
          <input type="hidden" name="direction" value={direction} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              name="description"
              defaultValue={bill?.description}
              placeholder={direction === "pagar" ? "Ex: Conta de luz" : "Ex: Salário"}
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={bill?.amount}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dueDate">Vencimento</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={bill?.due_date ?? toLocalISODate(new Date())}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Categoria</Label>
            <Select name="category" defaultValue={bill?.category ?? undefined}>
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

          <Button type="submit" disabled={pending} className="mt-2">
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
