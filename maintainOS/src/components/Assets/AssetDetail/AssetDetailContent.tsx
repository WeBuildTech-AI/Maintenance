import type { all } from "axios";
import { AssetAutomations } from "./sections/AssetAutomations";
import { AssetCreatedUpdated } from "./sections/AssetCreatedUpdated";
import { AssetCriticality } from "./sections/AssetCriticality";
import { AssetDescription } from "./sections/AssetDescription";
import { AssetLocation } from "./sections/AssetLocation";
import { AssetManufacturer } from "./sections/AssetManufacturer";
// import { AssetModel } from "./sections/AssetModel";
import { AssetQrCode } from "./sections/AssetQrCode";
import { AssetStatusReadings } from "./sections/AssetStatusReadings";
import { AssetSubAssets } from "./sections/AssetSubAssets";
import { AssetVendor } from "./sections/AssetVendor";
import { AssetType } from "./sections/AssetType";
// import { AssetWorkOrders } from "./sections/AssetWorkOrders";

export function AssetDetailContent(
  { asset }: { asset: any },
  allLocationData?: { name: string }[]
) {
  console.log("AssetDetailContent - allLocationData:", allLocationData);
  return (
    <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6">
      <AssetStatusReadings asset={asset} />
      {/* <AssetStatus asset={asset} /> */}
      <AssetLocation asset={asset} />
      <AssetCriticality asset={asset} />
      <AssetManufacturer asset={asset} />
      {/* <div className="pt-4"> */}
      {/* Use in New Work Order button already inside AssetStatusReadings (centered one) - preserved below as in original */}
      {/* </div> */}

      {/* <AssetModel asset={asset} /> */}
      <AssetDescription asset={asset} />
      <AssetQrCode asset={asset} />
      <AssetType asset={asset} />
      <AssetSubAssets />
      <AssetVendor asset={asset} />
      <AssetAutomations />
      <AssetCreatedUpdated asset={asset} />
      {/* <AssetWorkOrders /> */}
    </div>
  );
}
