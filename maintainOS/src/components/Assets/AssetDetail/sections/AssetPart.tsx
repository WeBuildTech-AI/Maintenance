import { MapPin } from "lucide-react";

export function AssetPart({ asset }: { asset: any }) {
  return (
    <div>
      {asset?.parts && asset.parts.length > 0 && (
        <div className="border-t mt-4">
          <h3 className="font-medium mb-3 mt-4">Asset Part</h3>
          <div className="space-y-2">
            {asset.parts.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
