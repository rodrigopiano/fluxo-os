"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { upsertCardPurchaseAction, type FormState } from "@/lib/actions/cards";
import { toLocalISODate } from "@/lib/format";
import type { Card, CardPurchase, Category, Subcategory } from "@/lib/types";
import { CategoryFieldSelect, SubcategoryFieldSelect } from "@/components/categorias/category-fields";
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

export function PurchaseFormDialog({
  cards,
  categories,
  subcategories,
  purchase,
  defaultCardId,
  trigger,
}: {
  cards: Card[];
  categories: Category[];
  subcategories: Subcategory[];
  purchase?: CardPurchase;
  defaultCardId?: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(purchase?.category_id ?? null);
  const [subcategoryId, setSubcategoryId] = useState<string | null>(purchase?.subcategory_id ?? null);
  const isEdit = Boolean(purchase);
  const activeCards = cards.filter((c) => c.is_active);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const result = await upsertCardPurchaseAction(initialState, formData);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      setOpen(false);
      toast.success(isEdit ? "Compra atualizada." : "Compra adicionada.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setCategoryId(purchase?.category_id ?? null);
          setSubcategoryId(purchase?.subcategory_id ?? null);
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2">
            <Plus className="size-4" />
            Nova compra
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar compra" : "Nova compra"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          {purchase ? <input type="hidden" name="id" value={purchase.id} /> : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              name="description"
              defaultValue={purchase?.description}
              placeholder="Ex: Notebook"
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="cardId">Cartão</Label>
            <Select name="cardId" defaultValue={purchase?.card_id ?? defaultCardId}>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Valor total</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={purchase?.amount}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="installmentsTotal">Parcelas</Label>
              <Input
                id="installmentsTotal"
                name="installmentsTotal"
                type="number"
                min="1"
                max="48"
                defaultValue={purchase?.installments_total ?? 1}
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
                kind="despesa"
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="purchasedOn">Data</Label>
            <Input
              id="purchasedOn"
              name="purchasedOn"
              type="date"
              defaultValue={purchase?.purchased_on ?? toLocalISODate(new Date())}
              required
            />
          </div>

          <Button type="submit" disabled={pending || activeCards.length === 0} className="mt-2">
            {pending ? "Salvando..." : "Salvar"}
          </Button>
          {activeCards.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Cadastre um cartão antes de lançar compras.
            </p>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
