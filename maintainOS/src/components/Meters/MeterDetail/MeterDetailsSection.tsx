import { Tag, Clock, Calendar, Play } from "lucide-react";
import { format } from "date-fns";
import { formatDate } from "../../utils/Date";

export function MeterDetailsSection({ selectedMeter }: any) {
  const getNextReading = () => {
    if (!selectedMeter?.readings?.length || !selectedMeter?.readingFrequency)
      return "N/A";

    const lastReadingTime = new Date(
      selectedMeter.readings && selectedMeter.readings[0].timestamp
    );
    const time = Number(
      selectedMeter.readingFrequency && selectedMeter.readingFrequency.time
    ); // ✅ ensure it's numeric
    const interval =
      selectedMeter.readingFrequency &&
      selectedMeter.readingFrequency.interval?.toLowerCase();

    if (isNaN(time)) return "Invalid frequency";

    const nextReading = new Date(lastReadingTime);

    // ✅ Add interval properly
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

    // ✅ Check if next reading is today
    const isToday =
      nextReading.getDate() === now.getDate() &&
      nextReading.getMonth() === now.getMonth() &&
      nextReading.getFullYear() === now.getFullYear();

    return isToday
      ? `Today at ${format(nextReading, "HH:mm")}`
      : format(nextReading, "dd MMM yyyy, HH:mm");
  };

  return (
    <div>
      <h2 className="text-lg font-medium mb-6">Meter Details</h2>
      <div className="grid grid-cols-2 gap-6">
        {/* Measurement Unit */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Measurement Unit
          </h3>
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="text-base">
              {selectedMeter.measurement && selectedMeter.measurement.name}
            </span>
          </div>
        </div>

        {/* Last Reading */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Last Reading
          </h3>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-base">
              {selectedMeter?.readings?.length > 0
                ? `${selectedMeter.readings[0].value ?? "-"} ${
                    selectedMeter?.measurement?.name || ""
                  }`
                : "No readings available"}
            </span>
          </div>
        </div>

        {/* Last Reading On */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Last Reading On
          </h3>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-base">
              {selectedMeter?.readings?.length > 0 ? 
                formatDate(selectedMeter.readings[0].timestamp) : "N/A"}
            </span>
          </div>
        </div>

        {/* Reading Frequency */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Reading Frequency
          </h3>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-base">
              {`${selectedMeter?.readingFrequency?.time || "-"} ${
                selectedMeter?.readingFrequency?.interval || "-"
              }`}
            </span>
          </div>
        </div>

        {/* ✅ Next Reading (Fixed) */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Next Reading
          </h3>
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4 text-muted-foreground" />
            <span className="text-base">{getNextReading()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
