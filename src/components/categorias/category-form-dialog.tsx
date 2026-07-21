"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { upsertCategoryAction, type FormState } from "@/lib/actions/categories";
import type { Category, CategoryKind } from "@/lib/types";
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

const PRESET_COLORS = ["#64748b", "#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

const initialState: FormState = { error: null };

export function CategoryFormDialog({
  kind,
  category,
}: {
  kind: CategoryKind;
  category?: Category;
}) {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(category?.color ?? PRESET_COLORS[0]);
  const [pending, setPending] = useState(false);
  const isEdit = Boolean(category);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const result = await upsertCategoryAction(initialState, formData);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      setOpen(false);
      toast.success(isEdit ? "Categoria atualizada." : "Categoria criada.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setColor(category?.color ?? PRESET_COLORS[0]);
      }}
    >
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="size-8">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="size-4" />
            Nova categoria
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar categoria" : "Nova categoria"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          {category ? <input type="hidden" name="id" value={category.id} /> : null}
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="color" value={color} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              defaultValue={category?.name}
              placeholder="Ex: Educação"
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Cor</Label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setColor(preset)}
                  className="size-7 rounded-full ring-offset-2 ring-offset-background transition-shadow"
                  style={{
                    backgroundColor: preset,
                    boxShadow: color === preset ? "0 0 0 2px var(--ring)" : "none",
                  }}
                  aria-label={preset}
                />
              ))}
            </div>
          </div>

          <Button type="submit" disabled={pending} className="mt-2">
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
