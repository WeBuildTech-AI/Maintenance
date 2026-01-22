import { Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AssetVendor({ asset }: { asset: any }) {
  const navigate = useNavigate();

  return (
    <div>
      {asset?.vendor && (
        <div className="border-t">
          <div className="mt-4">
            <h3 className="font-medium mb-3">Vendor(1)</h3>
            <div
              className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors group"
              onClick={() => {
                if (asset.vendor.id) {
                  navigate(`/vendors/${asset.vendor.id}`);
                }
              }}
            >
              <Building2 className="h-4 w-4 text-orange-500 group-hover:text-blue-600" />
              <span className="group-hover:underline">
                {asset.vendor.name || "-"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
