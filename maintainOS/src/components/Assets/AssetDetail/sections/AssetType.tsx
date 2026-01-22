import { Tag } from "lucide-react";


export function AssetType({ asset }: { asset: any }) {
  return (
    <div>
      {asset?.assetTypes && asset.assetTypes.length > 0 && (
        <div className="border-t mt-4">
          <h3 className="font-medium mb-3 mt-4">Asset Type</h3>
          <div className="space-y-2">
            {asset.assetTypes.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-orange-500" />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
