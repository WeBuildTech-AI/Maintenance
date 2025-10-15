import { AlertTriangle, Building2 } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Card, CardContent } from "../../ui/card";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { useNavigate } from "react-router-dom";

export function MeterCard({
  meter,
  selectedMeter,
  setSelectedMeter,
  handleCancelForm,
}: any) {
  const renderInitials = (text: string) =>
    text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const navigate = useNavigate();
  return (
    <Card
      key={meter.id}
      className={`cursor-pointer transition-colors ${
        selectedMeter?.id === meter.id
          ? "border-0 bg-primary/5"
          : "hover:bg-muted/50"
      }`}
      onClick={() => {
        setSelectedMeter(meter);
        navigate(`/meters/${meter.id}`);
      }}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{renderInitials(meter.name)}</AvatarFallback>
            </Avatar>
            <h4 className="font-medium text-gray-900">{meter.name}</h4>
            {/* <h4 className="font-medium text-gray-900">{meter.id}</h4> */}
          </div>

          {/* {meter.isOverdue && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Overdue
            </Badge>
          )} */}
        </div>

        {/* Asset & Location Info */}
        <div className="space-y-2">
          {meter.assetId && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-5 h-5 bg-orange-100 rounded flex items-center justify-center">
                <Building2 className="h-3 w-3 text-orange-600" />
              </div>
              <span className="capitalize">
                {meter.asset && meter.asset.name}
              </span>
            </div>
          )}

          {meter.locationId && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs">📍</span>
              </div>
              <span className="capitalize">
                {meter.location && meter.location.name}
              </span>
            </div>
          )}
        </div>

        {/* Last Reading */}
        {meter.readingFrequency && (
          <div className="mt-3 text-sm text-gray-500">
            Last Reading:{" "}
            {`${meter.readingFrequency.time} ${meter.readingFrequency.interval}`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
