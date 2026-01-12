import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AssetLocation({ asset }: { asset: any }) {
  const navigate = useNavigate();

  return (
    <div>
      {/* Check if location data exists */}
      {(asset?.locationId || asset?.location) && (
        <div className="border-t">
          <div className="mt-4">
            <h3 className="font-medium mb-3">Location</h3>
            <div 
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 -ml-1 rounded-md transition-colors group"
              onClick={(e) => {
                // Prevent bubbling
                e.stopPropagation();

                // 🔍 DEBUGGING LOGS
                console.log("--- AssetLocation Click Debug ---");
                console.log("Asset Object:", asset);
                console.log("asset.location:", asset.location);
                console.log("asset.locationId:", asset.locationId);

                // ID Resolution Logic
                const targetId = asset.location?.id || asset.locationId;
                console.log("Resolved Target ID:", targetId);

                if (targetId) {
                  // Construct Path
                  const targetPath = `/locations/${targetId}`;
                  console.log("Navigating to Path:", targetPath);
                  
                  // Navigate
                  navigate(targetPath);
                } else {
                  console.warn("❌ No valid Location ID found to navigate!");
                }
              }}
            >
              <MapPin className="h-4 w-4 text-orange-500 group-hover:text-orange-600" />
              <span className="text-gray-700 group-hover:text-orange-600 group-hover:underline">
                {asset.location?.name || "View Location"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}