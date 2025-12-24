// import type { all } from "axios";
// import { AssetAutomations } from "./sections/AssetAutomations";
// import { AssetCreatedUpdated } from "./sections/AssetCreatedUpdated";
// import { AssetCriticality } from "./sections/AssetCriticality";
// import { AssetDescription } from "./sections/AssetDescription";
// import { AssetLocation } from "./sections/AssetLocation";
// import { AssetManufacturer } from "./sections/AssetManufacturer";
// // import { AssetModel } from "./sections/AssetModel";
// import { AssetQrCode } from "./sections/AssetQrCode";
// import { AssetStatusReadings } from "./sections/AssetStatusReadings";
// import { AssetSubAssets } from "./sections/AssetSubAssets";
// import { AssetVendor } from "./sections/AssetVendor";
// import { AssetType } from "./sections/AssetType";
// import { AssetPart } from "./sections/AssetPart";
// import { AssetTeams } from "./sections/AssetTeams";
// import { Button } from "../../ui/button";
// import { Building2, Upload } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { CreatedVsCompletedChart } from "../../Reporting/WorkOrders/CreatedVsCompletedChart";
// import { useMemo, useState } from "react";
// import { format, subDays } from "date-fns";
// import { WorkOrderHistoryChart } from "../../utils/WorkOrderHistoryChart";
// // import { AssetWorkOrders } from "./sections/AssetWorkOrders";

// interface Asset {
//   id: number | string;
//   name: string;
//   updatedAt: string;
//   createdAt: string;
//   location: {
//     id: number | string;
//     name: string;
//   };
//   workOrders: {
//     id: number | string;
//     name: string;
//   };
//   // ... any other properties your asset has
// }

// interface AssetDetailContentProps {
//   asset: Asset; // Use your specific Asset type
//   fetchAssetsData: () => void;
//   setSeeMoreAssetStatus: boolean;
//   createdUser: string;
// }

// export function AssetDetailContent({
//   asset,
//   fetchAssetsData,
//   setSeeMoreAssetStatus,
//   createdUser,
// }: AssetDetailContentProps) {
//   const navigate = useNavigate();
//   const [dateRange] = useState({
//     startDate: format(subDays(new Date(), 90), "dd/MM/yyyy"),
//     endDate: format(new Date(), "dd/MM/yyyy"),
//   });

//   const filters = {
//     assetIds: asset.id,
//   };

//   return (
//     <div className="relative flex flex-col flex-1 min-h-0">
//       {/* Scrollable content */}
//       <div className="flex-1 overflow-y-auto p-6 space-y-6">
//         <AssetStatusReadings
//           asset={asset}
//           fetchAssetsData={fetchAssetsData}
//           setSeeMoreAssetStatus={setSeeMoreAssetStatus}
//         />
//         <AssetLocation asset={asset} />
//         <AssetCriticality asset={asset} />
//         <AssetManufacturer asset={asset} />
//         <AssetDescription asset={asset} />
//         <AssetQrCode asset={asset} />
//         <AssetTeams asset={asset} />
//         <AssetType asset={asset} />
//         <AssetSubAssets />
//         <AssetVendor asset={asset} />
//         <AssetPart asset={asset} />
//         <WorkOrderHistoryChart
//           title="Work Order History"
//           workOrderHistory={asset?.workOrders}
//           filters={filters}
//           dateRange={dateRange}
//           groupByField="createdAt"
//           lineName="Created"
//           lineColor="#0091ff"
//         />

//         {/* <AssetAutomations /> */}
//         <AssetCreatedUpdated asset={asset} createdUser={createdUser} />
//       </div>

//       {/* Center bottom floating button */}
//       <div
//         style={{
//           position: "absolute",
//           bottom: "24px",
//           left: "50%",
//           transform: "translateX(-50%)",
//           zIndex: 10,
//         }}
//       >
//         <Button
//           variant="outline"
//           onClick={() => navigate("/work-orders/create")}
//           className="text-yellow-600 cursor-pointer border-2 border-yellow-400 hover:bg-yellow-50 px-8 py-3 rounded-full shadow-lg bg-white font-medium whitespace-nowrap"
//         >
//           <Building2 className="w-5 h-5 mr-2" />
//           Use in New Work Order
//         </Button>
//       </div>
//     </div>
//   );
// }

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
import { AssetPart } from "./sections/AssetPart";
import { AssetTeams } from "./sections/AssetTeams";
import { Button } from "../../ui/button";
import { Building2, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
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
}

// Helper type for Date Range
type DateRange = { startDate: string; endDate: string };

export function AssetDetailContent({
  asset,
  fetchAssetsData,
  setSeeMoreAssetStatus,
  createdUser,
}: AssetDetailContentProps) {
  const navigate = useNavigate();

  // [!code ++] Manage multiple date ranges by ID
  const [chartDateRanges, setChartDateRanges] = useState<
    Record<string, DateRange>
  >({
    "work-order-history": {
      startDate: format(subDays(new Date(), 7), "MM/dd/yyyy"), // Ensure format matches what Chart expects (MM/dd/yyyy)
      endDate: format(new Date(), "MM/dd/yyyy"),
    },
    // You can add more IDs here if you have more charts, e.g.:
    // "reading-history": { ... }
  });

  const filters = {
    assetIds: asset.id,
  };

  // [!code ++] Handler to update only the specific chart ID
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
          id="work-order-history" // [!code ++] Pass a unique ID
          title="Work Order History"
          workOrderHistory={asset?.workOrders}
          filters={filters}
          dateRange={chartDateRanges["work-order-history"]} // [!code ++] Use specific range
          onDateRangeChange={handleDateRangeChange} // [!code ++] Pass handler
          groupByField="createdAt"
          lineName="Created"
          lineColor="#0091ff"
        />

        {/* <AssetAutomations /> */}
        <AssetCreatedUpdated asset={asset} createdUser={createdUser} />
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
          onClick={() => navigate("/work-orders/create")}
          className="text-yellow-600 cursor-pointer border-2 border-yellow-400 hover:bg-yellow-50 px-8 py-3 rounded-full shadow-lg bg-white font-medium whitespace-nowrap"
        >
          <Building2 className="w-5 h-5 mr-2" />
          Use in New Work Order
        </Button>
      </div>
    </div>
  );
}
