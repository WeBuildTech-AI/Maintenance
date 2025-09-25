import { AssetAutomations } from "./sections/AssetAutomations";
import { AssetCreatedUpdated } from "./sections/AssetCreatedUpdated";
import { AssetCriticality } from "./sections/AssetCriticality";
import { AssetLocation } from "./sections/AssetLocation";
import { AssetManufacturer } from "./sections/AssetManufacturer";
import { AssetModel } from "./sections/AssetModel";
import { AssetStatusReadings } from "./sections/AssetStatusReadings";
import { AssetSubAssets } from "./sections/AssetSubAssets";
import { AssetWorkOrders } from "./sections/AssetWorkOrders";

export function AssetDetailContent({ asset }: { asset: any }) {
  return (
    <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-8">
      <AssetStatusReadings />
      <AssetLocation asset={asset} />
      <AssetCriticality asset={asset} />
      <AssetManufacturer asset={asset} />
      <div className="pt-4">
        {/* Use in New Work Order button already inside AssetStatusReadings (centered one) - preserved below as in original */}
      </div>
      <AssetModel asset={asset} />
      <AssetSubAssets />
      <AssetAutomations />
      <AssetCreatedUpdated />
      <AssetWorkOrders />
    </div>
  );
}
