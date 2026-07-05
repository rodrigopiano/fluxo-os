import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";
import { accountBalanceHistory, accountsTotalBalance, totalAssetsValue } from "@/lib/net-worth";
import { ASSET_CATEGORY_LABELS, type Account, type Asset, type AssetCategory, type Transaction } from "@/lib/types";
import { AssetFormDialog } from "@/components/patrimonio/asset-form-dialog";
import { AssetList } from "@/components/patrimonio/asset-list";
import { NetWorthChart } from "@/components/patrimonio/net-worth-chart";
import { Card, CardContent } from "@/components/ui/card";

export default async function PatrimonioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: accounts }, { data: transactions }, { data: assets }] = await Promise.all([
    supabase.from("accounts").select("*").eq("user_id", user!.id),
    supabase.from("transactions").select("*").eq("user_id", user!.id),
    supabase.from("assets").select("*").eq("user_id", user!.id).order("created_at"),
  ]);

  const accountList = (accounts ?? []) as Account[];
  const transactionList = (transactions ?? []) as Transaction[];
  const assetList = (assets ?? []) as Asset[];

  const accountsTotal = accountsTotalBalance(accountList, transactionList);
  const assetsTotal = totalAssetsValue(assetList);
  const netWorth = accountsTotal + assetsTotal;
  const history = accountBalanceHistory(accountList, transactionList);

  const byCategory = assetList.reduce(
    (acc, asset) => {
      acc[asset.category] = (acc[asset.category] ?? 0) + asset.current_value;
      return acc;
    },
    {} as Record<AssetCategory, number>,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Patrimônio</h1>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{formatCurrency(netWorth)}</p>
        </div>
        <AssetFormDialog />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Dinheiro (contas)</p>
            <p className="mt-1 font-semibold">{formatCurrency(accountsTotal)}</p>
          </CardContent>
        </Card>
        {(Object.entries(ASSET_CATEGORY_LABELS) as [AssetCategory, string][])
          .filter(([category]) => byCategory[category])
          .map(([category, label]) => (
            <Card key={category}>
              <CardContent>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 font-semibold">{formatCurrency(byCategory[category])}</p>
              </CardContent>
            </Card>
          ))}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Evolução do saldo das contas</h2>
        <Card>
          <CardContent>
            <NetWorthChart points={history} />
            <p className="mt-2 text-xs text-muted-foreground">
              Aproximação baseada no histórico de lançamentos das suas contas — ainda não inclui
              histórico de outros ativos.
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Ativos</h2>
        <AssetList assets={assetList} />
      </div>
    </div>
  );
}
