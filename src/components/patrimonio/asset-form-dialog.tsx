"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { upsertAssetAction, type FormState } from "@/lib/actions/assets";
import { ASSET_CATEGORY_LABELS, type Asset, type AssetCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
const CATEGORY_OPTIONS = Object.entries(ASSET_CATEGORY_LABELS) as [AssetCategory, string][];

export function AssetFormDialog({ asset }: { asset?: Asset }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const isEdit = Boolean(asset);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const result = await upsertAssetAction(initialState, formData);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      setOpen(false);
      toast.success(isEdit ? "Ativo atualizado." : "Ativo adicionado.");
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
            Novo ativo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar ativo" : "Novo ativo"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          {asset ? <input type="hidden" name="id" value={asset.id} /> : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              defaultValue={asset?.name}
              placeholder="Ex: Apartamento, Tesouro Selic"
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Categoria</Label>
            <Select name="category" defaultValue={asset?.category ?? CATEGORY_OPTIONS[0][0]}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="currentValue">Valor atual</Label>
            <Input
              id="currentValue"
              name="currentValue"
              type="number"
              step="0.01"
              min="0"
              defaultValue={asset?.current_value ?? 0}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea id="notes" name="notes" defaultValue={asset?.notes ?? ""} rows={2} />
          </div>

          <Button type="submit" disabled={pending} className="mt-2">
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
