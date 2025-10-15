import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";

export function MeterTable({
  meter,
  selectedMeter,
}: {
  meter: any[];
  selectedMeter: any;
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
                <th className="w-[18%] px-4 py-3 text-left">Name</th>
                <th className="w-[10%] px-4 py-3 text-left">ID</th>
                <th className="w-[12%] px-4 py-3 text-left">Type</th>
                <th className="w-[15%] px-4 py-3 text-left">Asset</th>
                <th className="w-[15%] px-4 py-3 text-left">Location</th>
                <th className="w-[15%] px-4 py-3 text-left">Last Reading</th>
                <th className="w-[15%] px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {meter.length > 0 ? (
                meter &&
                meter.map((m) => (
                  <tr
                    key={m.id}
                    className={`border-b border-border transition hover:bg-muted/40 ${
                      selectedMeter && m.id === selectedMeter.id
                        ? "bg-primary/5"
                        : ""
                    }`}
                  >
                    {/* Name + Avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {renderInitials(m.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{m.name || "-"}</span>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {m.id || "-"}
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3 capitalize text-muted-foreground">
                      {m.meterType || "-"}
                    </td>

                    {/* Asset */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {(m.asset && m.asset.name) || "-"}
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {(m.location && m.location.name) || "-"}
                    </td>

                    {/* Last Reading */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {`${m.readingFrequency.time} ${m.readingFrequency.interval}` ||
                        "-"}
                    </td>

                    {/* Status */}
                    <td
                      className={`px-4 py-3 font-medium ${
                        m.isOverdue
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {m.status || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-muted-foreground"
                    colSpan={7}
                  >
                    No meters found.
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
