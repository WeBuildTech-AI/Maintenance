import { AlertTriangle, Building2 } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Card, CardContent } from "../../ui/card";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export function MeterCard({
  meter,
  selectedMeter,
  setSelectedMeter,
  handleCancelForm,
  setShowReadingMeter,
}: any) {
  const navigate = useNavigate();

  const renderInitials = (text: string) =>
    text
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  // ------------------------------------------------------
  // NEXT READING LOGIC (WITH OVERDUE SUPPORT)
  // ------------------------------------------------------
  const getNextReading = () => {
    if (!meter?.readings?.length || !meter?.readingFrequency) return "N/A";

    const lastReadingTime = new Date(meter.readings[0].timestamp);
    const time = Number(meter.readingFrequency.time);
    const interval = meter.readingFrequency.interval?.toLowerCase();

    if (isNaN(time)) return "Invalid frequency";

    const nextReading = new Date(lastReadingTime);

    // Apply frequency interval
    switch (interval) {
      case "hours":
      case "hour":
        nextReading.setHours(nextReading.getHours() + time);
        break;
      case "days":
      case "day":
        nextReading.setDate(nextReading.getDate() + time);
        break;
      case "weeks":
      case "week":
        nextReading.setDate(nextReading.getDate() + time * 7);
        break;
      case "minutes":
      case "minute":
        nextReading.setMinutes(nextReading.getMinutes() + time);
        break;
      default:
        return "Invalid interval";
    }

    const now = new Date();

    // 1️⃣ Overdue check → full timestamp
    if (nextReading.getTime() < now.getTime()) {
      return "Overdue";
    }

    // 2️⃣ Today check → compare dates only
    const todayMid = new Date();
    todayMid.setHours(0, 0, 0, 0);

    const nextReadingMid = new Date(nextReading);
    nextReadingMid.setHours(0, 0, 0, 0);

    const isToday = nextReadingMid.getTime() === todayMid.getTime();

    // 3️⃣ Return formatted date
    return isToday
      ? `Today at ${format(nextReading, "HH:mm")}`
      : format(nextReading, "dd/MM/yyyy, HH:mm");
  };

  const nextReadingStatus = getNextReading();

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
        // navigate(`/meters/${meter.id}`);
        setShowReadingMeter(false);
      }}
    >
      <CardContent className="p-4">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{renderInitials(meter.name)}</AvatarFallback>
            </Avatar>
            <h4 className="font-medium text-gray-900">{meter.name}</h4>
          </div>

          {/* OVERDUE BADGE */}
          {nextReadingStatus === "Overdue" && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Overdue
            </Badge>
          )}
        </div>

        {/* INFO SECTION */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            {meter.assetId && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 bg-orange-100 rounded flex items-center justify-center">
                  <Building2 className="h-3 w-3 text-orange-600" />
                </div>
                <span className="capitalize">{meter.asset?.name}</span>
              </div>
            )}

            {meter.locationId && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs">📍</span>
                </div>
                <span className="capitalize">{meter.location?.name}</span>
              </div>
            )}
          </div>

          {/* NEXT READING SECTION */}
          <div className="text-sm text-gray-700">
            Next Reading:{" "}
            {nextReadingStatus === "Overdue" ? (
              <span className="text-red-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Overdue
              </span>
            ) : (
              nextReadingStatus
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
