import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Vendor } from "./vendors.types";

export function VendorTable({
  vendors,
  selectedVendorId,
}: {
  vendors: Vendor[];
  selectedVendorId: string;
}) {
  const renderInitials = (text: string) =>
    text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <div className="flex-1 overflow-auto p-6">
      <Card className="overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-muted/60 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-[20%] px-4 py-3 text-left">Name</th>
                <th className="w-[12%] px-4 py-3 text-left">ID</th>
                <th className="w-[16%] px-4 py-3 text-left">Parts</th>
                <th className="w-[16%] px-4 py-3 text-left">Locations</th>
                <th className="w-[12%] px-4 py-3 text-left">Created</th>
                <th className="w-[12%] px-4 py-3 text-left">Updated</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  className={`border-b border-border transition hover:bg-muted/40 ${
                    vendor.id === selectedVendorId ? "bg-primary/5" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{renderInitials(vendor.name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{vendor.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{vendor.id}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {vendor.partsSummary ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {vendor.locations.map((loc) => loc.name).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(vendor.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(vendor.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {vendors.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-muted-foreground" colSpan={6}>
                    No vendors found.
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
