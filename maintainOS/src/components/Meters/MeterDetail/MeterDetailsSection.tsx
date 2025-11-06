import { Tag, Clock, Calendar, Play } from "lucide-react";
import { formatDate } from "../../utils/Date";

export function MeterDetailsSection({ selectedMeter }: any) {
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
              {selectedMeter.measurement && selectedMeter?.measurement?.name}
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
              {`${selectedMeter?.readingFrequency?.time} ${selectedMeter?.readingFrequency?.interval}`}
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
              {formatDate(selectedMeter.updatedAt)}
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
            <span className="text-base">Every 1 hour</span>
          </div>
        </div>

        {/* Next Reading */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Next Reading
          </h3>
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4 text-muted-foreground" />
            <span className="text-base">Today by 14:28</span>
          </div>
        </div>
      </div>
    </div>
  );
}
