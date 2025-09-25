import { Button } from "../../../ui/button";

export function AssetSubAssets() {
  return (
    <div className="border-t border-border pt-8">
      <h3 className="font-medium mb-3">Sub-Assets (0)</h3>
      <p className="text-muted-foreground mb-4">Add sub elements inside this Asset</p>
      <Button variant="link" className="text-orange-600 hover:text-orange-700 p-0 h-auto">
        Create Sub-Asset
      </Button>
    </div>
  );
}
