export function AssetManufacturer({ asset }: { asset: any }) {
  return (
    <div>
      {asset?.manufacturer && (
        <div className="border-t">
          <h3 className="font-medium mb-3">Manufacturer</h3>
          <p>{asset?.manufacturer.name}</p>
        </div>
      )}
    </div>
  );
}
