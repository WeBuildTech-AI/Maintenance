export function AssetDescription({ asset }: { asset: any }) {
  return (
    <div>
      {asset.description && (
        <div className="border-t ">
          <div className="mt-4">
          <h3 className="font-medium mb-3">Desscription</h3>
          <div className="flex items-center gap-2">
            {/* <MapPin className="h-4 w-4 text-orange-500" /> */}
            <span>{asset.description}</span>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
