"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { upsertSubcategoryAction, type FormState } from "@/lib/actions/categories";
import type { Subcategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
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

export function SubcategoryFormDialog({
  categoryId,
  subcategory,
}: {
  categoryId: string;
  subcategory?: Subcategory;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const isEdit = Boolean(subcategory);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const result = await upsertSubcategoryAction(initialState, formData);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      setOpen(false);
      toast.success(isEdit ? "Subcategoria atualizada." : "Subcategoria criada.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="size-7">
            <Pencil className="size-3.5" />
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <Plus className="size-3.5" />
            Subcategoria
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar subcategoria" : "Nova subcategoria"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          {subcategory ? <input type="hidden" name="id" value={subcategory.id} /> : null}
          <input type="hidden" name="categoryId" value={categoryId} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              defaultValue={subcategory?.name}
              placeholder="Ex: Farmácia"
              required
              autoFocus
            />
          </div>

          <Button type="submit" disabled={pending} className="mt-2">
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
