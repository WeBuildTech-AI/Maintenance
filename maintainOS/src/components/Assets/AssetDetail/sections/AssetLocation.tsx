import { MapPin } from "lucide-react";

export function AssetLocation({
  asset,
  allLocationData,
}: {
  asset: any;
  allLocationData?: { name: string }[];
}) {
  const locationName = Array.isArray(allLocationData)
    ? allLocationData.find((loc) => String(loc.id) === String(asset.locationId))
        ?.name
    : null;

  return (
    <div>
      {asset?.locationId && (
        <div className="border-t">
          <div className="mt-4">
            <h3 className="font-medium mb-3">Location</h3>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span>{locationName || "No Location Found"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
