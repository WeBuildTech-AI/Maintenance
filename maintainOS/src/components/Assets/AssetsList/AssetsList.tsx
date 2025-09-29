import { ChevronDown } from "lucide-react";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { AssetCard } from "./AssetCard";
import Loader from "../../Loader/Loader";

export function AssetsList({
  assets,
  selectedAsset,
  setSelectedAsset,
  setShowNewAssetForm,
  loading,
}: {
  assets: any[];
  selectedAsset: any | null;
  setSelectedAsset: (a: any) => void;
  setShowNewAssetForm: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="w-112 border ml-2 mr-3 border-border bg-card flex flex-col min-h-0">
      <div className="p-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort By:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary p-2 h-auto"
              >
                Name: Ascending Order
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Name: Ascending Order</DropdownMenuItem>
              <DropdownMenuItem>Name: Descending Order</DropdownMenuItem>
              <DropdownMenuItem>Status</DropdownMenuItem>
              <DropdownMenuItem>Location</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {loading ? (
        <>
          <Loader />
        </>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="">
              {assets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  selected={selectedAsset?.id === asset.id}
                  onSelect={() => setSelectedAsset(asset)}
                  setShowNewAssetForm={setShowNewAssetForm}
                />
              ))}

              {assets.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded border-dashed"></div>
                  </div>
                  <p className="text-muted-foreground mb-2">No assets found</p>
                  <Button variant="link" className="text-primary p-0">
                    Create the first asset
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
