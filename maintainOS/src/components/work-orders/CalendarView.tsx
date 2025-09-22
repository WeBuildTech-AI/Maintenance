import { WorkOrder } from "./types";

interface CalendarViewProps {
  workOrders: WorkOrder[];
}

export function CalendarView(_: CalendarViewProps) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        <div className="bg-card rounded-lg border">
          <div className="p-4 border-b border-border">
            <h3 className="font-medium">September 2025</h3>
          </div>
          <div className="grid grid-cols-7 gap-px bg-border">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="bg-card p-3 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const dayNumber = i - 0;
              const isToday = dayNumber === 19;
              const hasWorkOrder = dayNumber === 19 || dayNumber === 20 || dayNumber === 18;

              return (
                <div key={i} className="bg-card p-3 h-24 border-r border-b border-border">
                  {dayNumber > 0 && dayNumber <= 30 && (
                    <>
                      <div className={`text-sm ${isToday ? "font-medium text-primary" : ""}`}>{dayNumber}</div>
                      {hasWorkOrder && (
                        <div className="mt-1">
                          <div className="text-xs bg-primary/10 text-primary px-1 py-0.5 rounded truncate">
                            {dayNumber === 19 && "Daily inspection"}
                            {dayNumber === 20 && "Pump maintenance"}
                            {dayNumber === 18 && "Filter replacement"}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
