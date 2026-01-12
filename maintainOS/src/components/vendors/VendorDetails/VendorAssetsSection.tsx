import { Box } from "lucide-react";
import { type Vendor } from "../vendors.types";
import { useNavigate } from "react-router-dom"; // ✅ Import Navigation Hook

interface VendorAssetsSectionProps {
  vendor: Vendor;
}

export default function VendorAssetsSection({ vendor }: VendorAssetsSectionProps) {
  const navigate = useNavigate(); // ✅ Initialize Navigation

  // Prefer the populated 'assets' array, fallback to 'assetIds' if necessary
  const hasAssets = (vendor.assets && vendor.assets.length > 0) || (vendor.assetIds && vendor.assetIds.length > 0);

  return (
    <div className="pt-6 mt-6 border-t border-gray-200">
      <h3 className="text-base font-semibold text-gray-900 mb-3">
        Linked Assets ({vendor.assets?.length || vendor.assetIds?.length || 0})
      </h3>

      {hasAssets ? (
        <div className="space-y-3">
          {/* Render Populated Assets */}
          {vendor.assets?.map((asset, i) => (
            <div
              key={asset.id || i}
              onClick={(e) => {
                e.stopPropagation();
                // ✅ UPDATED: Matches your exact URL structure
                navigate(`/assets?assetId=${asset.id}&page=1&limit=50`);
              }}
              className="flex items-center gap-3 bg-gray-50 rounded-md p-3 hover:bg-orange-50 hover:border-orange-200 border border-transparent transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-full border border-orange-100 bg-orange-50 group-hover:bg-white transition-colors">
                <Box className="h-5 w-5 text-orange-500" />
              </div>
              <span className="text-gray-900 text-sm font-medium group-hover:text-orange-700">
                {asset.name}
              </span>
            </div>
          ))}

          {/* Fallback: If only IDs exist and no populated assets */}
          {(!vendor.assets || vendor.assets.length === 0) && vendor.assetIds?.map((id, i) => (
             <div
             key={i}
             onClick={(e) => {
                e.stopPropagation();
                // ✅ UPDATED: Matches your exact URL structure
                navigate(`/assets?assetId=${id}&page=1&limit=50`);
              }}
             className="flex items-center gap-3 bg-gray-50 rounded-md p-3 hover:bg-gray-100 cursor-pointer transition-colors"
           >
             <div className="flex items-center justify-center h-10 w-10 rounded-full border border-gray-200 bg-gray-100">
               <Box className="h-4 w-4 text-gray-400" />
             </div>
             <span className="text-gray-900 text-sm font-medium">
                Asset ID: {id}
             </span>
           </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No assets linked.</p>
      )}
    </div>
  );
}