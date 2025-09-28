import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";

export function PartTable({
  inventory,
  setSelectedId,
}: {
  inventory: any[];
  setSelectedId: string;
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
                <th className="w-[12%] px-4 py-3 text-left">Part ID</th>
                <th className="w-[12%] px-4 py-3 text-left">Unit Cost</th>
                <th className="w-[12%] px-4 py-3 text-left">Stock</th>
                <th className="w-[12%] px-4 py-3 text-left">Location</th>
                <th className="w-[20%] px-4 py-3 text-left">Vendors</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length > 0 ? (
                inventory.map((part) => (
                  <tr
                    key={part.id}
                    className={`border-b border-border transition hover:bg-muted/40 ${
                      part.id === setSelectedId ? "bg-primary/5" : ""
                    }`}
                    // className="border-b border-border transition hover:bg-muted/40"
                  >
                    {/* NAME + Avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {renderInitials(part.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{part.name}</span>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {part.id}
                    </td>

                    {/* Unit Cost */}
                    <td className="px-4 py-3 text-muted-foreground">
                      ${part.unitCost.toFixed(2)}
                    </td>

                    {/* Stock info */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {part.unitsInStock} / Min {part.minInStock}
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {part.locationId} – {part.area}
                    </td>

                    {/* Vendors */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {part.vendors && part.vendors.length > 0
                        ? part.vendors.map((v) => (
                            <div key={v.vendorId}>
                              {v.vendorId} ({v.orderingPartNumber})
                            </div>
                          ))
                        : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-muted-foreground"
                    colSpan={6}
                  >
                    No parts found.
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
