import { MapPin } from "lucide-react";

export function AssetVendor({ asset }: { asset: any }) {
  return (
    <div>
      {asset?.vendorId && (
        <div className="border-t">
          <div className="mt-4">
            <h3 className="font-medium mb-3">Vendor(1)</h3>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span>{asset.vendorId}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
