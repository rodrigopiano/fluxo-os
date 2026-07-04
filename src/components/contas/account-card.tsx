import { EyeOff, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { toggleAccountActiveAction } from "@/lib/actions/accounts";
import { AccountFormDialog } from "@/components/contas/account-form-dialog";
import type { Account } from "@/lib/types";

export function AccountCard({ account, balance }: { account: Account; balance: number }) {
  return (
    <Card className={account.is_active ? "" : "opacity-50"}>
      <CardContent className="flex items-center gap-4">
        <span
          className="size-10 shrink-0 rounded-full"
          style={{ backgroundColor: account.color }}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{account.name}</p>
          <p className="text-sm text-muted-foreground">{account.institution}</p>
        </div>
        <div className="text-right">
          <p className={`font-semibold ${balance < 0 ? "text-destructive" : ""}`}>
            {formatCurrency(balance)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <AccountFormDialog account={account} />
          <form action={toggleAccountActiveAction}>
            <input type="hidden" name="id" value={account.id} />
            <input type="hidden" name="isActive" value={String(account.is_active)} />
            <Button variant="ghost" size="icon" className="size-8" type="submit">
              {account.is_active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
