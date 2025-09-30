import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { formatDateOnly } from "../utils/Date";

export function LocationTable({
  location,
  selectedLocation,
}: {
  location: any[];
  selectedLocation: any;
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
                <th className="w-[16%] px-4 py-3 text-left">Description</th>
                <th className="w-[14%] px-4 py-3 text-left">Address</th>
                <th className="w-[12%] px-4 py-3 text-left">CreatedAt</th>
                <th className="w-[12%] px-4 py-3 text-left">UpdatedAt</th>
                <th className="w-[12%] px-4 py-3 text-left">Teams</th>
                <th className="w-[12%] px-4 py-3 text-left">Vendor</th>
              </tr>
            </thead>
            <tbody>
              {location?.map((location) => (
                <tr
                  key={location.id}
                  className={`border-b border-border transition hover:bg-muted/40 ${
                    location.id === selectedLocation?.id ? "bg-primary/5" : ""
                  }`}
                >
                  {/* Name + Icon */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {location.icon || renderInitials(location.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium capitalize ">
                        {location.name}
                      </span>
                    </div>
                  </td>

                  {/* ID */}
                  <td className="px-4 py-3 text-muted-foreground">
                    {location.id}
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3 text-muted-foreground">
                    {location.description}
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">
                    {location.address}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateOnly(location.createdAt)}
                  </td>
                  {/* Criticality */}

                  {/* Manufacturer */}
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateOnly(location.updatedAt)}
                  </td>

                  {/* Model */}
                  <td className="px-4 py-3 text-muted-foreground">
                    {location.teamsInCharge || "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {location.vendorIds || "-"}
                  </td>
                </tr>
              ))}
              {location.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-6 p-4 text-center text-muted-foreground"
                    colSpan={7}
                  >
                    No Location found.
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
