import {
  AlertTriangle,
  Building2,
  CalendarClock,
  Gauge,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { renderInitials } from "../../utils/renderInitials";

export function MeterCard({
  meter,
  selectedMeter,
  setSelectedMeter,
  setShowReadingMeter,
}: any) {
  // ------------------------------------------------------
  // NEXT READING LOGIC
  // ------------------------------------------------------
  const getNextReading = () => {
    if (!meter?.readings?.length || !meter?.readingFrequency)
      return { text: "N/A", isOverdue: false };

    const lastReadingTime = new Date(meter.readings[0].timestamp);
    const time = Number(meter.readingFrequency.time);
    const interval = meter.readingFrequency.interval?.toLowerCase();

    if (isNaN(time)) return { text: "Invalid frequency", isOverdue: false };

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
        return { text: "Invalid interval", isOverdue: false };
    }

    const now = new Date();

    // 1️⃣ Overdue check
    if (nextReading.getTime() < now.getTime()) {
      return { text: "Overdue", isOverdue: true };
    }

    // 2️⃣ Today check
    const todayMid = new Date();
    todayMid.setHours(0, 0, 0, 0);
    const nextReadingMid = new Date(nextReading);
    nextReadingMid.setHours(0, 0, 0, 0);
    const isToday = nextReadingMid.getTime() === todayMid.getTime();

    return {
      text: isToday
        ? `Today, ${format(nextReading, "HH:mm")}`
        : format(nextReading, "MMM dd, HH:mm"),
      isOverdue: false,
    };
  };

  const { text: readingText, isOverdue } = getNextReading();
  const isSelected = selectedMeter?.id === meter.id;

  return (
    <div
      onClick={() => {
        setSelectedMeter(meter);
        setShowReadingMeter(false);
      }}
      // ✅ Consistent Yellow Theme Styling
      className={`cursor-pointer border rounded-lg p-3 mb-3 transition-all duration-200 hover:shadow-md ${
        isSelected
          ? "border-yellow-400 bg-yellow-50 ring-1 ring-yellow-400"
          : "border-gray-200 bg-white hover:border-yellow-200"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* ✅ Icon Wrapper: Circular with Gauge Icon */}
        <div
          className={`h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full border ${
            isSelected
              ? "bg-white border-yellow-200 text-yellow-600"
              : "bg-gray-50 border-gray-100 text-gray-500"
          }`}
        >
          {/* Use Initials if available, else generic Gauge icon */}
          {renderInitials(meter.name) ? (
            <span className="text-xs font-bold">
              {renderInitials(meter.name)}
            </span>
          ) : (
            <Gauge size={20} />
          )}
        </div>

        {/* ✅ Content Column */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Title + Overdue Badge */}
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-md font-semibold text-gray-900 truncate leading-tight capitalize">
              {meter.name}
            </h3>

            {isOverdue && (
              <span className="flex-shrink-0 inline-flex items-center text-xs gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-200 uppercase">
                <AlertTriangle size={10} />
                Overdue
              </span>
            )}
          </div>

          {/* Row 2: Location / Asset Info */}
          <div className="mt-1 space-y-0.5">
            {meter.asset && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500 truncate">
                <Building2 size={12} className="text-gray-400" />
                <span>{meter.asset.name}</span>
              </div>
            )}
            {meter.location && (
              <div className="flex items-center gap-1.5 text-sm mt-1 text-xs text-gray-500 truncate">
                <MapPin size={12} className="text-gray-400" />
                <span>{meter.location.name}</span>
              </div>
            )}
          </div>

          {/* Row 3: Next Reading Footer */}
          <div
            className={`mt-2 pt-4 border-t border-dashed flex items-center gap-2 text-xs font-medium ${
              isSelected ? "border-yellow-200" : "border-gray-100"
            }`}
          >
            <CalendarClock
              size={13}
              className={isOverdue ? "text-red-500" : "text-gray-400"}
            />
            <span className={isOverdue ? "text-red-600" : "text-gray-600"}>
              Next: {readingText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
