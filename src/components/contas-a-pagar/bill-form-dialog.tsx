"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { upsertBillAction, type FormState } from "@/lib/actions/bills";
import { toLocalISODate } from "@/lib/format";
import type { Bill, BillDirection, Category, Subcategory } from "@/lib/types";
import { CategoryFieldSelect, SubcategoryFieldSelect } from "@/components/categorias/category-fields";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  categories,
  subcategories,
}: {
  direction: BillDirection;
  bill?: Bill;
  categories: Category[];
  subcategories: Subcategory[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(bill?.category_id ?? null);
  const [subcategoryId, setSubcategoryId] = useState<string | null>(bill?.subcategory_id ?? null);
  const isEdit = Boolean(bill);
  const kind = direction === "pagar" ? "despesa" : "receita";
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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setCategoryId(bill?.category_id ?? null);
          setSubcategoryId(bill?.subcategory_id ?? null);
        }
      }}
    >
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

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="categoryId">Categoria</Label>
              <CategoryFieldSelect
                id="categoryId"
                categories={categories}
                kind={kind}
                value={categoryId}
                onChange={(next) => {
                  setCategoryId(next);
                  setSubcategoryId(null);
                }}
              />
              <input type="hidden" name="categoryId" value={categoryId ?? ""} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="subcategoryId">Subcategoria</Label>
              <SubcategoryFieldSelect
                id="subcategoryId"
                subcategories={subcategories}
                categoryId={categoryId}
                value={subcategoryId}
                onChange={setSubcategoryId}
              />
              <input type="hidden" name="subcategoryId" value={subcategoryId ?? ""} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isRecurring"
              name="isRecurring"
              defaultChecked={bill?.is_recurring}
            />
            <Label htmlFor="isRecurring" className="font-normal">
              Repetir todo mês (cria a próxima automaticamente ao marcar como paga)
            </Label>
          </div>

          <Button type="submit" disabled={pending} className="mt-2">
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
