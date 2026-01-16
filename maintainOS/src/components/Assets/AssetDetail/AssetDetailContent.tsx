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
import { AssetPart } from "./sections/AssetPart";
import { AssetTeams } from "./sections/AssetTeams";
import { Button } from "../../ui/button";
import { Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {  useState } from "react";
import { format, subDays } from "date-fns";
import { WorkOrderHistoryChart } from "../../utils/WorkOrderHistoryChart";
// import { AssetWorkOrders } from "./sections/AssetWorkOrders";

interface Asset {
  id: number | string;
  name: string;
  updatedAt: string;
  createdAt: string;
  location: {
    id: number | string;
    name: string;
  };
  workOrders: {
    id: number | string;
    name: string;
  };
  // ... any other properties your asset has
}

interface AssetDetailContentProps {
  asset: Asset;
  fetchAssetsData: () => void;
  setSeeMoreAssetStatus: boolean;
  createdUser: string;
  updatedUser: string; // Added to match previous requirements
}

// Helper type for Date Range
type DateRange = { startDate: string; endDate: string };

export function AssetDetailContent({
  asset,
  fetchAssetsData,
  setSeeMoreAssetStatus,
  createdUser,
  updatedUser, // Added to match previous requirements
}: AssetDetailContentProps) {
  const navigate = useNavigate();

  // Manage multiple date ranges by ID
  const [chartDateRanges, setChartDateRanges] = useState<
    Record<string, DateRange>
  >({
    "work-order-history": {
      startDate: format(subDays(new Date(), 7), "MM/dd/yyyy"), // Ensure format matches what Chart expects (MM/dd/yyyy)
      endDate: format(new Date(), "MM/dd/yyyy"),
    },
  });

  const filters = {
    assetIds: asset.id,
  };

  // Handler to update only the specific chart ID
  const handleDateRangeChange = (id: string, start: Date, end: Date) => {
    setChartDateRanges((prev) => ({
      ...prev,
      [id]: {
        startDate: format(start, "MM/dd/yyyy"),
        endDate: format(end, "MM/dd/yyyy"),
      },
    }));
  };

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AssetStatusReadings
          asset={asset}
          fetchAssetsData={fetchAssetsData}
          setSeeMoreAssetStatus={setSeeMoreAssetStatus}
        />
        <AssetLocation asset={asset} />
        <AssetCriticality asset={asset} />
        <AssetManufacturer asset={asset} />
        <AssetDescription asset={asset} />
        <AssetQrCode asset={asset} />
        <AssetTeams asset={asset} />
        <AssetType asset={asset} />
        <AssetSubAssets />
        <AssetVendor asset={asset} />
        <AssetPart asset={asset} />

        <WorkOrderHistoryChart
          id="work-order-history" 
          title="Work Order History"
          workOrderHistory={asset?.workOrders}
          filters={filters}
          dateRange={chartDateRanges["work-order-history"]} 
          onDateRangeChange={handleDateRangeChange} 
          groupByField="createdAt"
          lineName="Created"
          lineColor="#0091ff"
        />

        {/* <AssetAutomations /> */}
        <AssetCreatedUpdated 
            asset={asset} 
            createdUser={createdUser} 
            updatedUser={updatedUser} 
        />
      </div>

      {/* Center bottom floating button */}
      <div
        style={{
          position: "absolute",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      >
        <Button
          variant="outline"
          onClick={() => 
            // Prefill logic: Pass the asset data through navigation state
            navigate("/work-orders/create", { 
              state: { 
                prefilledAsset: { id: asset.id, name: asset.name } 
              } 
            })
          }
          className="text-yellow-600 cursor-pointer border-2 border-yellow-400 hover:bg-yellow-50 px-8 py-3 rounded-full shadow-lg bg-white font-medium whitespace-nowrap"
        >
          <Building2 className="w-5 h-5 mr-2" />
          Use in New Work Order
        </Button>
      </div>
    </div>
  );
}