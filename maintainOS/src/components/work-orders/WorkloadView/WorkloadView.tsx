import {
  type Dispatch,
  type SetStateAction,
  useMemo,
  useState,
  useEffect,
} from "react";
import { CapacityOverview, HeaderControls, TeamGrid } from ".";
import type { WorkOrder } from "./types";

import { WorkOrderStatusDrawer } from "./WorkOrderDrawer";
import WorkOrderStatusSummary from "./WorkOrderStatusSummary";

/* ------------------------------- Props/Types ------------------------------- */
interface WorkloadViewProps {
  workOrders: WorkOrder[];
  weekOffset: number;
  setWeekOffset: Dispatch<SetStateAction<number>>;
}
type SortOption = "name-asc" | "utilization-desc" | "utilization-asc";

/* ------------------------------- Constants ------------------------------- */
const HOURS_PER_DAY = 8;

/* ------------------------------- Component ------------------------------- */
export function WorkloadView({
  workOrders,
  weekOffset,
  setWeekOffset,
}: WorkloadViewProps) {
  /* Week Meta (dates etc.) */
  const { weekRangeLabel, weekMeta } = useMemo(() => {
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const normalizeDate = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const getStartOfWeek = (date: Date) => {
      const start = normalizeDate(date);
      const day = start.getDay();
      const diffToMonday = (day + 6) % 7; // Monday as start
      start.setDate(start.getDate() - diffToMonday);
      return start;
    };

    const today = normalizeDate(new Date());
    const weekStart = getStartOfWeek(today);
    if (weekOffset !== 0) weekStart.setDate(weekStart.getDate() + weekOffset * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekMeta = weekDays.map((label, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const normalized = normalizeDate(d);
      return {
        key: normalized.toISOString(),
        day: label,
        date: normalized,
        label: normalized.getDate().toString(),
        isToday: normalized.getTime() === today.getTime(),
      };
    });

    const weekRangeLabel = `${weekStart.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })} - ${weekEnd.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })}, ${weekEnd.getFullYear()}`;

    return { weekRangeLabel, weekMeta };
  }, [weekOffset]);

  /* ---------------- Assignees state (important for drop updates) ---------------- */
  const [assignees, setAssignees] = useState<any[]>([]);

  useEffect(() => {
    const uniqueNames = new Set(workOrders.map((wo) => wo.assignedTo.name));
    const computed = [...uniqueNames].map((name) => {
      const assigneeData = workOrders.find(
        (wo) => wo.assignedTo.name === name
      )?.assignedTo;
      const assigneeWorkOrders = workOrders.filter(
        (wo) => wo.assignedTo.name === name
      );

      const weeklySchedule = weekMeta.map((day) => {
        const scheduledHours = 0; // 👈 start empty
        const tasks: any[] = []; // 👈 no pre-assigned tasks
        return {
          day: day.day,
          date: day.date,
          scheduledHours,
          tasks,
          utilization: 0,
        };
      });

      const totalHours = weeklySchedule.reduce((s, d) => s + d.scheduledHours, 0);
      const avgUtilization = (totalHours / (HOURS_PER_DAY * 7)) * 100;

      return {
        name,
        avatar: assigneeData?.avatar,
        team: assigneeData?.team ?? "Unassigned",
        weeklySchedule,
        totalHours,
        avgUtilization,
      };
    });

    setAssignees(computed);
  }, [weekMeta, workOrders]);

  /* ---------------- Filters & Sorting ---------------- */
  const [teamFilter, setTeamFilter] = useState("all");
  const [sortOption, setSortOption] = useState<SortOption>("name-asc");

  const availableTeams = useMemo(
    () => Array.from(new Set(assignees.map((a) => a.team))).sort(),
    [assignees]
  );

  const filteredAssignees = useMemo(() => {
    const list =
      teamFilter === "all" ? assignees : assignees.filter((a) => a.team === teamFilter);
    const sorted = [...list];

    switch (sortOption) {
      case "utilization-desc":
        sorted.sort((a, b) => b.avgUtilization - a.avgUtilization);
        break;
      case "utilization-asc":
        sorted.sort((a, b) => a.avgUtilization - b.avgUtilization);
        break;
      default:
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }, [assignees, teamFilter, sortOption]);

  /* ---------------- Totals ---------------- */
  const totalScheduledHours = filteredAssignees.reduce(
    (s, a) => s + a.totalHours,
    0
  );
  const totalCapacity = filteredAssignees.length * 8 * weekMeta.length;
  const averageUtilization =
    totalCapacity > 0 ? Math.round((totalScheduledHours / totalCapacity) * 100) : 0;

  const dailyTotals = weekMeta.map((day, i) => {
    const totalHours = filteredAssignees.reduce(
      (s, a) => s + (a.weeklySchedule[i]?.scheduledHours ?? 0),
      0
    );
    const capacity = filteredAssignees.length * 8;
    const utilization = capacity > 0 ? Math.round((totalHours / capacity) * 100) : 0;
    return { ...day, totalHours, capacity, utilization };
  });

  const gridTemplateColumns = "minmax(240px,1.6fr) repeat(7,minmax(0,1fr))";

  /* ---------------- Status Summary ---------------- */
  const mockStatusData = {
    unscheduledCount: 33,
    statusCounts: {
      overdue: 3,
      dueSoon: 24,
      open: 0,
      onHold: 5,
      inProgress: 1,
    },
  };

  /* ---------------- Drawer State ---------------- */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const handleStatusClick = (status: string) => {
    setSelectedStatus(status);
    setDrawerOpen(true);
  };

  /* ---------------- Handle Task Drop ---------------- */
  const handleTaskDrop = (task: any, assignee: any, day: any) => {
    const estHours = parseInt(task.estTime) || 1; // "2h" → 2
    setAssignees((prev) =>
      prev.map((a) =>
        a.name === assignee.name
          ? {
              ...a,
              weeklySchedule: a.weeklySchedule.map((d: any) =>
                d.day === day.day
                  ? {
                      ...d,
                      utilization: Math.min(
                        (d.utilization || 0) + (estHours / HOURS_PER_DAY) * 100,
                        100
                      ),
                      tasks: [...(d.tasks || []), task],
                    }
                  : d
              ),
            }
          : a
      )
    );
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="flex flex-col lg:flex-row h-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Left Side */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <HeaderControls
          weekRangeLabel={weekRangeLabel}
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
          teamFilter={teamFilter}
          setTeamFilter={setTeamFilter}
          sortOption={sortOption}
          setSortOption={setSortOption}
          availableTeams={availableTeams}
        />

        <CapacityOverview
          totalScheduledHours={totalScheduledHours}
          totalCapacity={totalCapacity}
          averageUtilization={averageUtilization}
          dailyTotals={dailyTotals}
          gridTemplateColumns={gridTemplateColumns}
        />

        <WorkOrderStatusSummary
          unscheduledCount={mockStatusData.unscheduledCount}
          statusCounts={mockStatusData.statusCounts}
          onStatusClick={handleStatusClick}
        />

        <TeamGrid
          filteredAssignees={filteredAssignees}
          weekMeta={weekMeta}
          gridTemplateColumns={gridTemplateColumns}
          onTaskDrop={handleTaskDrop} // 👈 pass handler
        />
      </div>

      {/* Drawer */}
      <WorkOrderStatusDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        status={selectedStatus}
      />
    </div>
  );
}
