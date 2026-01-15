// PartCard.tsx
import { Package } from "lucide-react";
import { type Item } from "./inventory.types";
import { mockLocations } from "./inventory.types"; 
import { formatINR } from "../utils/dollar_rupee_convert";

export function PartCard({
  item,
  selected,
  onSelect,
}: {
  item: Item | any; 
  selected: boolean;
  onSelect: () => void;
}) {
  // 1. Calculate Stock
  const totalStock =
    item.locations?.reduce(
      (acc: number, loc: any) => acc + (loc.unitsInStock || 0),
      0
    ) ?? 
    item.unitsInStock ?? 
    0;

  // 2. Get Location Name
  const locationName = 
    item.locations?.[0]?.name || 
    item.locations?.[0]?.locationName || 
    mockLocations.find((l) => l.id === item.locationId)?.name || 
    "-";

  return (
    <div
      onClick={onSelect}
      // ✅ Exact styling from Library Card (Yellow theme for selection)
      className={`cursor-pointer border rounded-lg p-4 mb-3 transition-all duration-200 hover:shadow-md ${
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
          <Package size={20} />
        </div>

        {/* ✅ Content Column */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Title + Badge */}
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate leading-tight">
              {item.name || "Untitled Part"}
            </h3>
            {/* Badge (Pill) */}
            <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 whitespace-nowrap">
              {totalStock} units
            </span>
          </div>

          {/* Row 2: Location (Description equivalent) */}
          <p className="text-xs text-gray-500 mt-1 truncate">
            {locationName}
          </p>

          {/* Row 3: Cost (Footer equivalent) */}
         <p className="text-xs text-gray-400 mt-2">
            {formatINR(item.unitCost || 0)} / unit
          </p>
        </div>
      </div>
    </div>
  );
}