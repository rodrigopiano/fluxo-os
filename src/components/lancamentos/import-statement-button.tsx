"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { parseStatementAction, importTransactionsAction } from "@/lib/actions/statement-import";
import { CategoryFieldSelect, SubcategoryFieldSelect } from "@/components/categorias/category-fields";
import { accountLabel, formatCurrency, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
import type { Account, Category, ImportRow, Subcategory } from "@/lib/types";

export function ImportStatementButton({
  accounts,
  categories,
  subcategories,
}: {
  accounts: Account[];
  categories: Category[];
  subcategories: Subcategory[];
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"upload" | "review">("upload");
  const [accountId, setAccountId] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const activeAccounts = accounts.filter((a) => a.is_active);
  const selectableRows = rows.filter((r) => !r.isDuplicate);
  const duplicateCount = rows.length - selectableRows.length;
  const allSelected =
    selectableRows.length > 0 && selectableRows.every((r) => selected.has(r.externalId));

  function reset() {
    setStep("upload");
    setAccountId(undefined);
    setRows([]);
    setSelected(new Set());
  }

  async function handleAnalyze(formData: FormData) {
    if (!accountId) {
      toast.error("Selecione uma conta.");
      return;
    }
    formData.set("accountId", accountId);
    setPending(true);
    const result = await parseStatementAction(formData);
    setPending(false);
    if (result.error || !result.data) {
      toast.error(result.error ?? "Não foi possível ler o extrato.");
      return;
    }
    setRows(result.data);
    setSelected(new Set(result.data.filter((r) => !r.isDuplicate).map((r) => r.externalId)));
    setStep("review");
  }

  function updateRow(externalId: string, patch: Partial<ImportRow>) {
    setRows((prev) => prev.map((r) => (r.externalId === externalId ? { ...r, ...patch } : r)));
  }

  function toggleRow(externalId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(externalId)) next.delete(externalId);
      else next.add(externalId);
      return next;
    });
  }

  async function handleImport() {
    const toImport = rows.filter((r) => selected.has(r.externalId));
    if (toImport.length === 0) {
      toast.error("Selecione ao menos um lançamento.");
      return;
    }
    setPending(true);
    const formData = new FormData();
    formData.set("accountId", accountId!);
    formData.set("items", JSON.stringify(toImport));
    const result = await importTransactionsAction(formData);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(
      `${result.imported ?? 0} lançamento(s) importado(s)` +
        (result.skipped ? `, ${result.skipped} já existiam.` : "."),
    );
    setOpen(false);
    reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="size-4" />
          Importar extrato
        </Button>
      </DialogTrigger>
      <DialogContent className={step === "review" ? "sm:max-w-2xl" : undefined}>
        <DialogHeader>
          <DialogTitle>
            {step === "upload" ? "Importar extrato (OFX)" : `Revisar ${rows.length} lançamento(s)`}
          </DialogTitle>
        </DialogHeader>

        {step === "upload" ? (
          <form action={handleAnalyze} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="importAccountId">Conta</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger id="importAccountId" className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {activeAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {accountLabel(a)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="file">Arquivo OFX</Label>
              <Input id="file" name="file" type="file" accept=".ofx" required />
              <p className="text-xs text-muted-foreground">
                Exporte o extrato do app ou site do seu banco no formato OFX.
              </p>
            </div>
            <Button type="submit" disabled={pending || !accountId} className="mt-2">
              {pending ? "Analisando..." : "Analisar extrato"}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) =>
                  setSelected(checked ? new Set(selectableRows.map((r) => r.externalId)) : new Set())
                }
              />
              <span className="text-sm text-muted-foreground">
                Selecionar todos ({selectableRows.length} novo(s)
                {duplicateCount > 0 ? `, ${duplicateCount} já importado(s)` : ""})
              </span>
            </div>

            <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto pr-1">
              {rows.map((row) => (
                <div
                  key={row.externalId}
                  className={`rounded-xl border border-border p-3 ${row.isDuplicate ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      className="mt-1"
                      checked={selected.has(row.externalId)}
                      disabled={row.isDuplicate}
                      onCheckedChange={() => toggleRow(row.externalId)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="min-w-0 flex-1 truncate text-sm font-medium">
                          {row.description}
                        </p>
                        {row.isDuplicate ? (
                          <Badge variant="secondary" className="shrink-0">
                            Já importado
                          </Badge>
                        ) : null}
                        <p
                          className={`shrink-0 text-sm font-semibold ${
                            row.type === "despesa" ? "text-red-500" : "text-emerald-500"
                          }`}
                        >
                          {row.type === "despesa" ? "-" : "+"}
                          {formatCurrency(row.amount)}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDate(row.occurredOn)}</p>

                      {!row.isDuplicate ? (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <CategoryFieldSelect
                            categories={categories}
                            kind={row.type}
                            value={row.categoryId}
                            onChange={(next) =>
                              updateRow(row.externalId, { categoryId: next, subcategoryId: null })
                            }
                          />
                          <SubcategoryFieldSelect
                            subcategories={subcategories}
                            categoryId={row.categoryId}
                            value={row.subcategoryId}
                            onChange={(next) => updateRow(row.externalId, { subcategoryId: next })}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={handleImport} disabled={pending || selected.size === 0}>
              {pending ? "Importando..." : `Importar ${selected.size} lançamento(s)`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
