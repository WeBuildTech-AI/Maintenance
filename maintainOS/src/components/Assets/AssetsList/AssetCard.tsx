import { Factory, MapPin } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Card, CardContent } from "../../ui/card";
import { renderInitials } from "../../utils/renderInitials";
import { useNavigate } from "react-router-dom";

export function AssetCard({
  asset,
  selected,
  onSelect,
  setShowNewAssetForm,
  allLocationData,
}: {
  asset: any;
  selected: boolean;
  onSelect: () => void;
  setShowNewAssetForm: React.Dispatch<React.SetStateAction<boolean>>;
  allLocationData: { name: string }[];

}) {
  asset.status === "Online";
  const navigate = useNavigate()
  return (
    <Card
      className={`cursor-pointer transition-colors ${
        selected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      }`}
      onClick={() => {
        onSelect();
        // navigate(asset.id)
        setShowNewAssetForm(false);
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
              {/* <span className="text-lg">{<Factory />}</span> */}
              <span className="text-lg">
                {renderInitials(asset.name) || <Factory />}
              </span>
            </div>
            <div>
              <h4 className="font-medium capitalize">{asset.name}</h4>
              {asset.location && (
                <div className="flex items-start gap-1 mt-1">
                  <MapPin className="h-3 w-3 mt-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    At {asset.location && asset.location.name}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant="outline"
              className={`gap-1 capitalize ${
                asset.status === "online"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : asset.status === "offline"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-yellow-50 text-yellow-700 border-yellow-200"
              }`}
            >
              <div
                className={`w-2 h-1 rounded-full ${
                  asset.status === "online"
                    ? "bg-green-500"
                    : asset.status === "offline"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              />
              {asset.status}
            </Badge>

            {asset.criticality && (
              <Badge
                variant="outline"
                className={`text-xs capitalize ${
                  asset.criticality === "Critical"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : asset.criticality === "High"
                    ? "bg-orange-50 text-orange-700 border-orange-200"
                    : asset.criticality === "Medium"
                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                    : "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                {asset.criticality}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
