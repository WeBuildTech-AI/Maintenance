export function AssetModel({ asset }: { asset: any }) {
  return (
    <div className="border-t border-border pt-8">
      <h3 className="font-medium mb-3">Model</h3>
      <p>{asset.model}</p>
    </div>
  );
}
