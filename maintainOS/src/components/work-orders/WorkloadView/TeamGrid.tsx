import { TeamRow } from "./TeamRow";

interface TeamGridProps {
  filteredAssignees: any[];
  weekMeta: any[];
  gridTemplateColumns: string;
  onTaskDrop: (task: any, assignee: any, day: any) => void; // 👈 new
}

export function TeamGrid({
  filteredAssignees,
  weekMeta,
  gridTemplateColumns,
  onTaskDrop,
}: TeamGridProps) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      {/* Header Row */}
      <div
        className="grid min-w-[800px] border-b border-border"
        style={{ gridTemplateColumns }}
      >
        <div className="p-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Team Member
        </div>
        {weekMeta.map((day) => (
          <div
            key={day.key}
            className={`border-l p-4 text-center ${
              day.isToday ? "bg-primary/5" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`text-sm font-medium ${
                  day.isToday ? "text-primary" : "text-foreground"
                }`}
              >
                {day.day}
              </div>
              <div
                className={`text-xs ${
                  day.isToday ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {day.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rows */}
      {filteredAssignees.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          No team members match filters.
        </div>
      ) : (
        filteredAssignees.map((a, i) => (
          <TeamRow
            key={a.name}
            assignee={a}
            gridTemplateColumns={gridTemplateColumns}
            isLast={i === filteredAssignees.length - 1}
            onTaskDrop={onTaskDrop} // 👈 pass handler
          />
        ))
      )}
    </div>
  );
}
