import { AssetDetailContent } from "./AssetDetailContent";
import { AssetDetailHeader } from "./AssetDetailHeader";

export function AssetDetail({ asset }: { asset: any }) {
  return (
    <div className="h-full border mr-3 flex flex-col min-h-0">
      <AssetDetailHeader asset={asset} />
      <AssetDetailContent asset={asset} />
    </div>
  );
}
