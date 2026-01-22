import { Factory, MapPin, Activity } from "lucide-react";
import { renderInitials } from "../../utils/renderInitials";
import { formatLabel } from "../../utils/asset_formater";

export function AssetCard({
  
  asset,
  selected,
  onSelect,
}: {
  
  asset: any;
  selected: boolean;
  onSelect: () => void;
  // Removed unused props for cleaner component
  setShowNewAssetForm?: any;
  allLocationData?: any;
}) {
  

  return (
    <div
      onClick={onSelect}
      // ✅ Exact styling from Inventory PartCard (Yellow theme for selection)
      className={`cursor-pointer border  rounded-lg p-4 mb-3 transition-all duration-200 hover:shadow-md ${
        selected
          ? "border-yellow-400 bg-yellow-50 ring-1 ring-yellow-400"
          : "border-gray-200 bg-white hover:border-yellow-200"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* ✅ Icon Wrapper: Circular with icon */}
        <div
          className={`h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full border ${
            selected
              ? "bg-white border-yellow-200 text-yellow-600"
              : "bg-gray-50 border-gray-100 text-gray-500"
          }`}
        >
          {renderInitials(asset.name) || <Factory size={20} />}
        </div>

        {/* ✅ Content Column */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Title + Status Badge */}
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate leading-tight capitalize">
              {asset.name || "Untitled Asset"}
            </h3>

            {/* Status Pill */}
            <span
              className={`flex-shrink-0 inline-flex justify-center items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border uppercase ${
                asset.status === "online" || asset.status === "Online"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : asset.status === "offline" || asset.status === "Offline"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-yellow-50 text-yellow-700 border-yellow-200"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 p-1 rounded-full ${
                  asset.status === "online" || asset.status === "Online"
                    ? "bg-green-500"
                    : asset.status === "offline" || asset.status === "Offline"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              />
              {formatLabel(asset.status) || "Unknown"}

            </span>
          </div>

          {/* Row 2: Location */}
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 truncate">
            <MapPin size={12} />
            <span>
              {asset.location?.name
                ? `At ${asset.location.name}`
                : "No Location Assigned"}
            </span>
          </div>

          {/* Row 3: Criticality (Footer) */}
          {asset.criticality && (
            <div className="flex items-center text-xs gap-2 mt-2 ">
              <span
                className={`text-[10px] px-1.5 py-0.5 p-2 rounded border capitalize ${
                  asset.criticality === "Critical"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : asset.criticality === "High"
                    ? "bg-orange-50 text-orange-700 border-orange-200"
                    : "bg-gray-50 text-gray-600 border-gray-200"
                }`}
              >
                {asset.criticality} Priority
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
