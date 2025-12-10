import { Package } from "lucide-react"; 
import { type Item } from "./inventory.types";
import { mockLocations } from "./inventory.types"; // Keep for fallback if needed

export function PartCard({
  item,
  selected,
  onSelect,
}: {
  item: Item | any; 
  selected: boolean;
  onSelect: () => void;
}) {
  // 1. Calculate Stock logic (Same as before)
  const totalStock =
    item.locations?.reduce(
      (acc: number, loc: any) => acc + (loc.unitsInStock || 0),
      0
    ) ?? 
    item.unitsInStock ?? 
    0;

  // 2. Get Location Name logic
  const locationName = 
    item.locations?.[0]?.name || 
    item.locations?.[0]?.locationName || 
    mockLocations.find((l) => l.id === item.locationId)?.name || 
    "-";

  return (
    <div
      onClick={onSelect}
      // ✅ Same container style as LibraryCard
      className={`cursor-pointer border rounded-lg shadow-sm hover:shadow-md transition mb-2 ${
        selected
          ? "border-blue-500 bg-blue-50" // Selected style (Blue)
          : "border-gray-200 bg-white hover:bg-gray-50" // Default style
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* ✅ Icon Wrapper (Same circular design) */}
          <div
            className={`h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-full border ${
              selected
                ? "border-blue-300 bg-blue-100 text-blue-600"
                : "border-gray-200 bg-gray-100 text-gray-500"
            }`}
          >
             <Package size={24} />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              
              {/* Title & Description Area */}
              <div className="min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {locationName}
                </p>
              </div>

              {/* ✅ Badge (Same style as 'fields' badge) */}
              <span className="inline-flex flex-shrink-0 items-center rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600">
                {totalStock} units
              </span>
            </div>
            
            {/* Extra Info (Cost) */}
            <p className="text-xs text-gray-400 mt-1">
               ${(item.unitCost || 0).toFixed(2)} / unit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}