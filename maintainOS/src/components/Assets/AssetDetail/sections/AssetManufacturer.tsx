export function AssetManufacturer({ asset }: { asset: any }) {
  return (
    <div>
      <h3 className="font-medium mb-3">Manufacturer</h3>
      <p>{asset.manufacturer}</p>
    </div>
  );
}
