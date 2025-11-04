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

// You should import this interface from a shared types file
// or from your main Assets.tsx component if you export it there.
interface Asset {
  id: number | string;
  name: string;
  updatedAt: string;
  createdAt: string;
  location: {
    id: number | string;
    name: string;
  };
  // ... any other properties your asset has
}

interface AssetDetailContentProps {
  asset: Asset; // Use your specific Asset type
  fetchAssetsData: () => void;
  setSeeMoreAssetStatus:boolean
}

export function AssetDetailContent({
  asset,
  fetchAssetsData,
  setSeeMoreAssetStatus,
}: AssetDetailContentProps) {
  return (
    <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6">
      {/* 3. Now the prop can be passed down successfully */}
      <AssetStatusReadings asset={asset} fetchAssetsData={fetchAssetsData} setSeeMoreAssetStatus={setSeeMoreAssetStatus}/>

      <AssetLocation asset={asset} />
      <AssetCriticality asset={asset} />
      <AssetManufacturer asset={asset} />
      <AssetDescription asset={asset} />
      <AssetQrCode asset={asset} />
      <AssetType asset={asset} />
      <AssetSubAssets />
      <AssetVendor asset={asset} />
      <AssetAutomations />
      <AssetCreatedUpdated asset={asset} />
    </div>
  );
}
