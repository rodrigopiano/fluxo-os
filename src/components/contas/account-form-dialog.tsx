"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { upsertAccountAction, type FormState } from "@/lib/actions/accounts";
import { INSTITUTIONS, type Account } from "@/lib/types";
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

const PRESET_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7", "#ec4899"];

const initialState: FormState = { error: null };

export function AccountFormDialog({ account }: { account?: Account }) {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(account?.color ?? PRESET_COLORS[0]);
  const [state, action, pending] = useActionState(upsertAccountAction, initialState);
  const wasPending = useRef(false);
  const isEdit = Boolean(account);

  useEffect(() => {
    if (wasPending.current && !pending) {
      if (state.error) {
        toast.error(state.error);
      } else {
        setOpen(false);
        toast.success(isEdit ? "Conta atualizada." : "Conta criada.");
      }
    }
    wasPending.current = pending;
  }, [pending, state, isEdit]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setColor(account?.color ?? PRESET_COLORS[0]);
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
            Nova conta
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar conta" : "Nova conta"}</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4">
          {account ? <input type="hidden" name="id" value={account.id} /> : null}
          <input type="hidden" name="color" value={color} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              defaultValue={account?.name}
              placeholder="Ex: Conta corrente"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="institution">Banco / carteira</Label>
            <Select name="institution" defaultValue={account?.institution ?? INSTITUTIONS[0]}>
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
            <Label htmlFor="initialBalance">Saldo inicial</Label>
            <Input
              id="initialBalance"
              name="initialBalance"
              type="number"
              step="0.01"
              defaultValue={account?.initial_balance ?? 0}
              required
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
