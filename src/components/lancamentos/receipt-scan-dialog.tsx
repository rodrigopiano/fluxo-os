"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { extractReceiptAction } from "@/lib/actions/receipts";
import type { ExtractedReceipt } from "@/lib/types";
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

export function ReceiptScanDialog({
  onExtracted,
}: {
  onExtracted: (items: ExtractedReceipt[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const result = await extractReceiptAction(formData);
    setPending(false);

    if (result.error || !result.data) {
      toast.error(result.error ?? "Não foi possível ler o comprovante.");
      return;
    }

    setOpen(false);
    setFileName(null);
    onExtracted(result.data);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setFileName(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Camera className="size-4" />
          Escanear comprovante
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Escanear comprovante</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="file">Foto ou imagem do comprovante</Label>
            <Input
              ref={inputRef}
              id="file"
              name="file"
              type="file"
              accept="image/*"
              capture="environment"
              required
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
            <p className="text-xs text-muted-foreground">
              PIX, boleto, nota fiscal ou recibo. PDF ainda não é suportado — use uma foto ou print.
            </p>
          </div>

          <Button type="submit" disabled={pending || !fileName}>
            {pending ? "Analisando..." : "Analisar comprovante"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
