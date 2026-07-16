"use client";

import { useState } from "react";
import { ReceiptScanDialog } from "@/components/lancamentos/receipt-scan-dialog";
import { TransactionFormDialog } from "@/components/lancamentos/transaction-form-dialog";
import type { Account, ExtractedReceipt } from "@/lib/types";

export function ScanReceiptButton({ accounts }: { accounts: Account[] }) {
  const [queue, setQueue] = useState<ExtractedReceipt[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [lastAccountId, setLastAccountId] = useState<string | undefined>();

  const currentItem = queue[queueIndex];

  function handleSaved(accountId?: string) {
    if (accountId) setLastAccountId(accountId);
    if (queueIndex + 1 < queue.length) {
      setQueueIndex((i) => i + 1);
    } else {
      setQueue([]);
      setQueueIndex(0);
      setReviewOpen(false);
    }
  }

  return (
    <>
      <ReceiptScanDialog
        onExtracted={(items) => {
          setQueue(items);
          setQueueIndex(0);
          setReviewOpen(true);
        }}
      />
      {currentItem ? (
        <TransactionFormDialog
          key={queueIndex}
          accounts={accounts}
          initialValues={currentItem}
          defaultAccountId={lastAccountId}
          subtitle={queue.length > 1 ? `Item ${queueIndex + 1} de ${queue.length}` : undefined}
          open={reviewOpen}
          onOpenChange={(next) => {
            setReviewOpen(next);
            if (!next) {
              setQueue([]);
              setQueueIndex(0);
            }
          }}
          onSaved={handleSaved}
        />
      ) : null}
    </>
  );
}
