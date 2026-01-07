import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AssetLocation({ asset }: { asset: any }) {
  const navigate = useNavigate();

  return (
    <div>
      {asset?.locationId && (
        <div className="border-t">
          <div className="mt-4">
            <h3 className="font-medium mb-3">Location</h3>
            <div 
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 -ml-1 rounded-md transition-colors group"
              onClick={() => {
                const targetId = asset.location?.id || asset.locationId;
                if (targetId) {
                  // ✅ Use 'locationId' query param to ensure the target location is selected/opened
                  navigate(`/locations?locationId=${targetId}`);
                }
              }}
            >
              <MapPin className="h-4 w-4 text-orange-500 group-hover:text-orange-600" />
              <span className="text-gray-700 group-hover:text-orange-600 group-hover:underline">
                {asset.location?.name || "Unknown Location"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}