import { Badge } from "../../../ui/badge";

export function AssetCriticality({ asset }: { asset: any }) {
  const c = asset.criticality;
  const classes =
    c === "Critical"
      ? "bg-red-50 text-red-700 border-red-200"
      : c === "High"
      ? "bg-orange-50 text-orange-700 border-orange-200"
      : c === "Medium"
      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
      : "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <div>
      {
        <div className="border-t">
          {asset.criticality && (
            <div className="mt-4">
              <h3 className="font-medium mb-3">Criticality</h3>
              <Badge
                variant="outline"
                className={`inline-flex w-fit ${classes}`}
              >
                {c || "None"}
              </Badge>
            </div>
          )}
        </div>
      }
    </div>
  );
}
