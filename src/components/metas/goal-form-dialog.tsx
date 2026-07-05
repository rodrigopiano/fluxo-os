"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { upsertGoalAction, type FormState } from "@/lib/actions/goals";
import type { Goal } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const initialState: FormState = { error: null };

export function GoalFormDialog({ goal }: { goal?: Goal }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const isEdit = Boolean(goal);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const result = await upsertGoalAction(initialState, formData);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      setOpen(false);
      toast.success(isEdit ? "Meta atualizada." : "Meta criada.");
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
            Nova meta
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar meta" : "Nova meta"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          {goal ? <input type="hidden" name="id" value={goal.id} /> : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              defaultValue={goal?.name}
              placeholder="Ex: Reserva de emergência, Entrada do imóvel"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="targetAmount">Valor alvo</Label>
              <Input
                id="targetAmount"
                name="targetAmount"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={goal?.target_amount}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="currentAmount">Valor atual</Label>
              <Input
                id="currentAmount"
                name="currentAmount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={goal?.current_amount ?? 0}
                required
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              name="isEmergencyReserve"
              defaultChecked={goal?.is_emergency_reserve}
            />
            Esta é a minha reserva de emergência
          </label>

          <Button type="submit" disabled={pending} className="mt-2">
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
