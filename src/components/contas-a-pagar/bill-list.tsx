"use client";

import { useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/format";
import { BILL_FILTERS, isOverdue, matchesFilter, type BillFilter } from "@/lib/bills";
import { markBillPendingAction, deleteBillAction } from "@/lib/actions/bills";
import { BillFormDialog } from "@/components/contas-a-pagar/bill-form-dialog";
import { MarkPaidDialog } from "@/components/contas-a-pagar/mark-paid-dialog";
import type { Account, Bill, BillDirection } from "@/lib/types";

export function BillList({
  bills,
  direction,
  accounts,
}: {
  bills: Bill[];
  direction: BillDirection;
  accounts: Account[];
}) {
  const [filter, setFilter] = useState<BillFilter>("todas");
  const filtered = bills.filter((b) => matchesFilter(b, filter));

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as BillFilter)}>
        <TabsList className="flex-wrap">
          {BILL_FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          Nenhum lançamento nesse filtro.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((bill) => {
            const overdue = isOverdue(bill);
            const paid = bill.status === "pago";
            return (
              <Card key={bill.id}>
                <CardContent className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{bill.description}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {bill.category ?? "Sem categoria"} · vence {formatDate(bill.due_date)}
                    </p>
                  </div>
                  {paid ? (
                    <Badge className="bg-emerald-500/15 text-emerald-500">🟢 Paga</Badge>
                  ) : overdue ? (
                    <Badge className="bg-red-500/15 text-red-500">🔴 Atrasada</Badge>
                  ) : null}
                  <p className="shrink-0 font-semibold">{formatCurrency(bill.amount)}</p>
                  <div className="flex shrink-0 items-center gap-1">
                    <BillFormDialog direction={direction} bill={bill} />
                    {paid ? (
                      <form action={markBillPendingAction}>
                        <input type="hidden" name="id" value={bill.id} />
                        <input type="hidden" name="direction" value={direction} />
                        <input type="hidden" name="transactionId" value={bill.transaction_id ?? ""} />
                        <Button variant="ghost" size="icon" className="size-8" type="submit">
                          <RotateCcw className="size-4" />
                        </Button>
                      </form>
                    ) : (
                      <MarkPaidDialog bill={bill} direction={direction} accounts={accounts} />
                    )}
                    <form action={deleteBillAction}>
                      <input type="hidden" name="id" value={bill.id} />
                      <input type="hidden" name="direction" value={direction} />
                      <input type="hidden" name="transactionId" value={bill.transaction_id ?? ""} />
                      <Button variant="ghost" size="icon" className="size-8" type="submit">
                        <Trash2 className="size-4" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
