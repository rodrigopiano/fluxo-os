import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { deleteAssetAction } from "@/lib/actions/assets";
import { AssetFormDialog } from "@/components/patrimonio/asset-form-dialog";
import { ASSET_CATEGORY_LABELS, type Asset } from "@/lib/types";

export function AssetList({ assets }: { assets: Asset[] }) {
  if (assets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
        Nenhum ativo cadastrado ainda. Adicione investimentos, imóveis, veículos ou outros bens.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {assets.map((asset) => (
        <Card key={asset.id}>
          <CardContent className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{asset.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {ASSET_CATEGORY_LABELS[asset.category]}
              </p>
            </div>
            <p className="shrink-0 font-semibold">{formatCurrency(asset.current_value)}</p>
            <div className="flex shrink-0 items-center gap-1">
              <AssetFormDialog asset={asset} />
              <form action={deleteAssetAction}>
                <input type="hidden" name="id" value={asset.id} />
                <Button variant="ghost" size="icon" className="size-8" type="submit">
                  <Trash2 className="size-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
