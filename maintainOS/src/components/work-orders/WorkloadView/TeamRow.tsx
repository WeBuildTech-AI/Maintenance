import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";

interface TeamRowProps {
  assignee: any;
  gridTemplateColumns: string;
  isLast: boolean;
  onTaskDrop?: (task: any, assignee: any, day: any) => void;
}

export function TeamRow({ assignee, gridTemplateColumns, isLast, onTaskDrop }: TeamRowProps) {
  return (
    <div
      className={`grid ${!isLast ? "border-b border-border" : ""}`}
      style={{ gridTemplateColumns }}
    >
      {/* Left side: User Info */}
      <div className="bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={assignee.avatar} />
            <AvatarFallback>
              {assignee.name.split(" ").map((n: string) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium leading-tight text-foreground">
              {assignee.name}
            </p>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {assignee.team}
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{assignee.totalHours}h/week</span>
              <span>•</span>
              <span>{Math.round(assignee.avgUtilization)}% avg</span>
            </div>

            {/* Progress bar inside the user card */}
            <div className="mt-2 w-full bg-blue-100 h-2 rounded-sm relative overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-orange-600"
                style={{
                  width: `${Math.min(assignee.avgUtilization || 0, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Per-Day Schedule */}
      {assignee.weeklySchedule.map((d: any) => (
        <div
          key={d.day}
          className="border-l border-border p-3 flex flex-col items-center justify-center gap-1"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const data = e.dataTransfer.getData("application/json");
            if (data) {
              const task = JSON.parse(data);
              if (typeof onTaskDrop === "function") {
                onTaskDrop(task, assignee, d);
              }
            }
          }}
        >
          {/* Utilization Bar */}
          <div className="w-full bg-blue-100 border border-gray-200 h-8 rounded-sm relative overflow-hidden">
            {/* Fill bar */}
            <div
              className="absolute left-0 top-0 h-full bg-orange-600"
              style={{ width: `${Math.min(d.utilization || 0, 100)}%` }}
            />
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-black">
                {d.remaining || "0:00 left"}
              </span>
            </div>
          </div>

          {/* Task List */}
          {d.tasks && d.tasks.length > 0 && (
            <div className="w-full mt-1 space-y-1">
              {d.tasks.map((t: any, i: number) => (
                <div
                  key={i}
                  className="truncate rounded bg-primary/10 px-2 py-1 text-xs text-primary text-center"
                  title={t.title}
                >
                  {t.title}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
