import { Card, CardContent } from "../../ui/card";
import { Avatar, AvatarFallback } from "../../ui/avatar";

export function AssetTable({
  assets,
  selectedAsset,
}: {
  assets: any[];
  selectedAsset: any;
}) {
  const renderInitials = (text: string) =>
    text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <div className="flex-1 overflow-auto p-2">
      <Card className="overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-muted/60 border-b text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-[20%] px-4 py-3 text-left">Name</th>
                <th className="w-[12%] px-4 py-3 text-left">ID</th>
                <th className="w-[16%] px-4 py-3 text-left">Status</th>
                <th className="w-[14%] px-4 py-3 text-left">Location</th>
                <th className="w-[12%] px-4 py-3 text-left">Criticality</th>
                <th className="w-[12%] px-4 py-3 text-left">Manufacturer</th>
                {/* <th className="w-[12%] px-4 py-3 text-left">Model</th> */}
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr
                  key={asset.id}
                  className={`border-b border-border transition hover:bg-muted/40 ${
                    asset.id === selectedAsset?.id ? "bg-primary/5" : ""
                  }`}
                >
                  {/* Name + Icon */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {asset.icon || renderInitials(asset.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{asset.name}</span>
                    </div>
                  </td>

                  {/* ID */}
                  <td className="px-4 py-3 text-muted-foreground">
                    {asset.id || "-"}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
                        asset.status
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          asset.status ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      {asset.status ?? "—"}
                    </span>
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3 text-muted-foreground">
                    {(asset.location.name) || "-"}
                  </td>

                  {/* Criticality */}
                  <td className="px-4 py-3 cursor-pointer capitalize text-muted-foreground">
                    {asset.criticality || "-"}
                  </td>

                  {/* Manufacturer */}
                  <td className="px-4 py-3 text-muted-foreground cursor-capitalize">
                    {asset.manufacturer.name || "-"}
                  </td>

                  {/* Model */}
                  {/* <td className="px-4 py-3 text-muted-foreground">
                    {asset.model || "-"}
                  </td> */}
                </tr>
              ))}
              {assets.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-muted-foreground"
                    colSpan={7}
                  >
                    No assets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
