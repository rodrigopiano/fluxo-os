"use client";

import { useState } from "react";
import { ReceiptScanDialog } from "@/components/lancamentos/receipt-scan-dialog";
import { TransactionFormDialog } from "@/components/lancamentos/transaction-form-dialog";
import type { Account, ExtractedReceipt } from "@/lib/types";

export function ScanReceiptButton({ accounts }: { accounts: Account[] }) {
  const [extracted, setExtracted] = useState<ExtractedReceipt | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  return (
    <>
      <ReceiptScanDialog
        onExtracted={(data) => {
          setExtracted(data);
          setReviewOpen(true);
        }}
      />
      {extracted ? (
        <TransactionFormDialog
          accounts={accounts}
          initialValues={extracted}
          open={reviewOpen}
          onOpenChange={setReviewOpen}
        />
      ) : null}
    </>
  );
}
