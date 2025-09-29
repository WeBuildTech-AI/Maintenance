import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react"; // 👈 Edit icon
import CapacityModal from "./Modal/CapacityModal"; // 👈 Import the modal
import ConfirmModal from "./Modal/ConfirmModal";
import TaskAssignModal from "./Modal/TaskAssignModal";


interface TeamRowProps {
  assignee: any;
  gridTemplateColumns: string;
  isLast: boolean;
  onTaskDrop?: (task: any, assignee: any, day: any) => void;
  onTaskResize?: (
    assigneeName: string,
    taskTitle: string,
    newStartDay: string,
    newEndDay: string
  ) => void;
}

const HOURS_PER_DAY = 8;

// ⏱️ format hours into "H:MM left"
function formatRemainingTime(hours: number) {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${m.toString().padStart(2, "0")} left`;
}

export function TeamRow({
  assignee,
  gridTemplateColumns,
  isLast,
  onTaskDrop,
  onTaskResize,
}: TeamRowProps) {
  const [stretching, setStretching] = useState<{
    task: any | null;
    startDay: string | null;
    currentDay: string | null;
    instanceId: string | null;
  }>({ task: null, startDay: null, currentDay: null, instanceId: null });
  const [showEdit, setShowEdit] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // 👇 NEW: selected task state for the assignment modal
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  const rowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onUp = () => {
      if (
        stretching.task &&
        stretching.startDay &&
        stretching.currentDay &&
        stretching.instanceId
      ) {
        const start = stretching.startDay;
        const end = stretching.currentDay;
        const order = (d: string) =>
          ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(d);
        const [s, e] = order(start) <= order(end) ? [start, end] : [end, start];

        // Pass the instance ID along with the resize info
        onTaskResize?.(assignee.name, stretching.task.title, s, e);
      }
      setStretching({
        task: null,
        startDay: null,
        currentDay: null,
        instanceId: null,
      });
    };
    document.addEventListener("mouseup", onUp);
    return () => document.removeEventListener("mouseup", onUp);
  }, [stretching, onTaskResize, assignee.name]);

  // Helper to check if a task spans across multiple days
  const getTaskSpan = (task: any) => {
    if (!task.startDay || !task.endDay) return null;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const startIdx = days.indexOf(task.startDay);
    const endIdx = days.indexOf(task.endDay);
    if (startIdx === -1 || endIdx === -1) return null;
    return { startIdx, endIdx, spanLength: endIdx - startIdx + 1 };
  };

  // Group tasks by their unique identity (for multi-day rendering)
  const processedTasks = new Set<string>();

  // Calculate vertical positions for all tasks to prevent overlap
  const calculateTaskPositions = (daySchedule: any[]) => {
    const positionMap = new Map<string, number>();
    const seenTasks = new Set<string>();
    let currentRow = 0;

    daySchedule.forEach((dayData: any) => {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const currentDayIdx = days.indexOf(dayData.day);

      dayData.tasks?.forEach((task: any) => {
        const instanceId =
          task.instanceId || `${task.title}-${task.startDay}-${task.endDay}`;
        const taskKey = instanceId;

        if (seenTasks.has(taskKey)) return;

        const span = getTaskSpan(task);

        if (span && span.spanLength > 1) {
          if (currentDayIdx === span.startIdx) {
            positionMap.set(taskKey, currentRow++);
            seenTasks.add(taskKey);
          }
        } else {
          positionMap.set(taskKey, currentRow++);
          seenTasks.add(taskKey);
        }
      });
    });

    return positionMap;
  };

  const taskPositions = calculateTaskPositions(assignee.weeklySchedule);

  // 👇 NEW: helper to open the assignment modal with prefilled data
  const openTaskModal = (t: any) => {
    // ensure we keep whatever fields already exist on the task (startDate, dueDate, etc.)
    const merged = {
      ...t,
      // normalize possible field names
      dueDay: t.dueDay ?? t.endDay,
    };
    setSelectedTask(merged);
  };

  return (
    <>
      <div
        ref={rowRef}
        className={`grid ${!isLast ? "border-b border-border" : ""}`}
        style={{ gridTemplateColumns }}
      >
        {/* Left side: User Info */}
        <div
          className="bg-muted/30 p-4 relative hover:bg-muted/40 transition-colors"
          onMouseEnter={() => setShowEdit(true)}
          onMouseLeave={() => setShowEdit(false)}
        >
          {/* Edit Icon - only for hovered card */}
          {showEdit && (
            <button
              className="absolute top-2 right-2"
              onClick={() => setIsModalOpen(true)} // 👈 open modal
            >
              <Pencil size={12} className="text-gray-500 hover:text-primary" />
            </button>
          )}

          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={assignee.avatar} />
              <AvatarFallback>
                {assignee.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
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

              {/* Progress bar */}
              <div className="mt-2 w-full bg-blue-100 h-2 rounded-sm relative overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-orange-600"
                  style={{
                    width: `${Math.min(assignee.avgUtilization || 0, 100)}%`,
                  }}
                />
              </div>

              {/* 👇 Incomplete Work Order Card */}
              {assignee?.incompleteTasks > 0 && (
                <div className="mt-3 border border-red-300 bg-white rounded-md px-3 py-2 text-xs text-red-700 flex items-center shadow-sm">
                  {assignee.incompleteTasks} incomplete work order
                  {assignee.incompleteTasks > 1 ? "s" : ""} to reschedule
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Per-Day Schedule */}
        {assignee.weeklySchedule.map((d: any, dayIndex: number) => {
          const inPreview = (() => {
            if (
              !stretching.task ||
              !stretching.startDay ||
              !stretching.currentDay ||
              !stretching.instanceId
            )
              return false;
            const order = (x: string) =>
              ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(x);
            const s = order(stretching.startDay);
            const c = order(stretching.currentDay);
            const dd = order(d.day);
            return dd >= Math.min(s, c) && dd <= Math.max(s, c);
          })();

          const remainingHours = Math.max(
            HOURS_PER_DAY - (d.scheduledHours || 0),
            0
          );

          return (
            <div
              key={d.day}
              data-day={d.day}
              className={`border-l border-border p-3 flex flex-col gap-1 relative ${
                inPreview ? "outline outline-2 outline-orange-400" : ""
              }`}
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
              onMouseEnter={() => {
                if (stretching.task) {
                  setStretching((s) => ({ ...s, currentDay: d.day }));
                }
              }}
            >
              {/* Utilization Bar */}
              <div className="w-full bg-blue-100 border border-gray-200 h-8 rounded-sm relative overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-orange-600"
                  style={{ width: `${Math.min(d.utilization || 0, 100)}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-black">
                    {formatRemainingTime(remainingHours)}
                  </span>
                </div>
              </div>

              {/* Task List - Render multi-day tasks as stretched badges */}
              {d.tasks && d.tasks.length > 0 && (
                <div
                  className="w-full mt-1 relative"
                  style={{ minHeight: `${d.tasks.length * 28}px` }}
                >
                  {d.tasks.map((t: any, i: number) => {
                    const instanceId =
                      t.instanceId ||
                      `${t.title}-${t.startDay}-${t.endDay}`;
                    const taskKey = instanceId;
                    const span = getTaskSpan(t);
                    const position = taskPositions.get(taskKey) ?? 0;

                    const isBeingStretched =
                      stretching.instanceId === instanceId;

                    if (span && span.spanLength > 1) {
                      const days = [
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                        "Sun",
                      ];
                      const currentDayIdx = days.indexOf(d.day);

                      if (
                        currentDayIdx !== span.startIdx ||
                        processedTasks.has(taskKey)
                      ) {
                        return null;
                      }
                      processedTasks.add(taskKey);

                      return (
                        <div
                          key={i}
                          className={`absolute left-0 rounded px-2 py-1 text-xs text-primary font-medium z-10 group transition-colors overflow-hidden ${
                            isBeingStretched
                              ? "bg-primary/30 ring-2 ring-primary"
                              : "bg-primary/10 hover:bg-primary/20"
                          }`}
                          style={{
                            width: `calc(${
                              span.spanLength * 100
                            }% + ${(span.spanLength - 1) * 13}px)`,
                            top: `${position * 28}px`,
                          }}
                          title={`${t.title} (${t.startDay} - ${t.endDay})`}
                          // 👇 NEW: open modal on click
                          onClick={() => openTaskModal(t)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate flex-1">{t.title}</span>
                            <div className="flex items-center gap-1 ml-2">
                              <span className="text-[10px] opacity-70 whitespace-nowrap">
                                {span.spanLength}d
                              </span>
                              <button
                                className="w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 hover:bg-primary/30 rounded cursor-move"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setStretching({
                                    task: t,
                                    startDay: t.startDay || d.day,
                                    currentDay: t.endDay || d.day,
                                    instanceId: instanceId,
                                  });
                                }}
                                title="Drag to resize"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={i}
                        className={`absolute left-0 right-0 rounded px-2 py-1 text-xs text-primary group transition-colors ${
                          isBeingStretched
                            ? "bg-primary/30 ring-2 ring-primary"
                            : "bg-primary/10 hover:bg-primary/20"
                        }`}
                        style={{
                          top: `${position * 28}px`,
                        }}
                        title={t.title}
                        // 👇 NEW: open modal on click
                        onClick={() => openTaskModal(t)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate flex-1" title={t.title}>
                            {t.title.length > 7
                              ? `${t.title.substring(0, 7)}..`
                              : t.title}
                          </span>
                          <button
                            className="w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 hover:bg-primary/30 rounded cursor-move ml-1"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setStretching({
                                task: t,
                                startDay: t.startDay || d.day,
                                currentDay: t.endDay || d.day,
                                instanceId: instanceId,
                              });
                            }}
                            title="Drag to resize"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Capacity Modal */}
      <CapacityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        assigneeName={assignee.name}
        onRequestConfirm={() => {
          setIsModalOpen(false);
          setShowConfirm(true);
        }}
      />

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          setShowConfirm(false);
          // final save logic can go here
        }}
      />

      {/* 👇 NEW: Task Assign Modal (prefilled) */}
      <TaskAssignModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        defaultAssignees={[
          // row assignee + any existing on the task
          assignee.name,
          ...(selectedTask?.assignees || []),
        ]}
        onSave={(updated) => {
          // Optional: handle persist/update in parent via callback
          // console.log("Saved", updated);
        }}
      />
    </>
  );
}
