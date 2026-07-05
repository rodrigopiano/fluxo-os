"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { upsertCardAction, type FormState } from "@/lib/actions/cards";
import { INSTITUTIONS, type Card } from "@/lib/types";
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

const PRESET_COLORS = ["#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

const initialState: FormState = { error: null };

export function CardFormDialog({ card }: { card?: Card }) {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(card?.color ?? PRESET_COLORS[0]);
  const [pending, setPending] = useState(false);
  const isEdit = Boolean(card);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const result = await upsertCardAction(initialState, formData);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      setOpen(false);
      toast.success(isEdit ? "Cartão atualizado." : "Cartão criado.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setColor(card?.color ?? PRESET_COLORS[0]);
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
            Novo cartão
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar cartão" : "Novo cartão"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          {card ? <input type="hidden" name="id" value={card.id} /> : null}
          <input type="hidden" name="color" value={color} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              defaultValue={card?.name}
              placeholder="Ex: Nubank Ultravioleta"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="institution">Banco</Label>
            <Select name="institution" defaultValue={card?.institution ?? INSTITUTIONS[0]}>
              <SelectTrigger id="institution" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INSTITUTIONS.map((institution) => (
                  <SelectItem key={institution} value={institution}>
                    {institution}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="creditLimit">Limite</Label>
            <Input
              id="creditLimit"
              name="creditLimit"
              type="number"
              step="0.01"
              min="0"
              defaultValue={card?.credit_limit ?? 0}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="closingDay">Dia de fechamento</Label>
              <Input
                id="closingDay"
                name="closingDay"
                type="number"
                min="1"
                max="28"
                defaultValue={card?.closing_day ?? 1}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dueDay">Dia de vencimento</Label>
              <Input
                id="dueDay"
                name="dueDay"
                type="number"
                min="1"
                max="28"
                defaultValue={card?.due_day ?? 10}
                required
              />
            </div>
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
