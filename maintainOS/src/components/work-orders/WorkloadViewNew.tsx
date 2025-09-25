import { type Dispatch, type SetStateAction, useMemo, useState } from "react";

import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  GripVertical,
  List,
  Lock,
  MoreHorizontal,
  Search,
  UserCheck,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Input } from "../ui/input";
import { Progress } from "../ui/progress";
import { ScrollArea } from "../ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "../ui/utils";

import type { WorkOrder } from "./types";

const HOURS_PER_DAY = 7;
const MS_IN_DAY = 1000 * 60 * 60 * 24;

interface WorkloadViewNewProps {
  workOrders: WorkOrder[];
  weekOffset: number;
  setWeekOffset: Dispatch<SetStateAction<number>>;
}

interface WeekMeta {
  key: string;
  label: string;
  dayName: string;
  date: Date;
  isToday: boolean;
  isWeekend: boolean;
}

interface ScheduledTask {
  id: string;
  title: string;
  estimatedHours: number;
  priority: string;
  status: string;
  asset?: string;
  location?: string;
  locked?: boolean;
  isFromWorkOrder?: boolean;
}

interface DaySchedule {
  key: string;
  dayName: string;
  label: string;
  isToday: boolean;
  isWeekend: boolean;
  capacityHours: number;
  assignedHours: number;
  hoursLeft: number;
  utilization: number;
  tasks: ScheduledTask[];
}

interface UserCapacityRow {
  name: string;
  avatar?: string;
  team?: string;
  weeklyCapacity: number;
  assignedHours: number;
  utilization: number;
  pendingReschedules: number;
  days: DaySchedule[];
}

interface InternalUserRow {
  name: string;
  avatar?: string;
  team?: string;
  days: Array<{
    key: string;
    capacityHours: number;
    assignedHours: number;
    tasks: ScheduledTask[];
    isWeekend: boolean;
    isToday: boolean;
    dayName: string;
    label: string;
  }>;
  totalAssignedHours: number;
  pendingReschedules: number;
}

interface UnscheduledOrderCard {
  id: string;
  title: string;
  priority: string;
  status: string;
  dueLabel: string;
  daysUntil: number;
  estimatedHours: number;
  asset?: string;
  location?: string;
}

interface DefaultUserSeed {
  name: string;
  avatar: string;
  team: string;
  pendingReschedules?: number;
  baselineAssignments: Array<{
    id: string;
    dayOffset: number;
    hours: number;
    title: string;
    priority: string;
    status: string;
    locked?: boolean;
    asset?: string;
    location?: string;
  }>;
}

const DEFAULT_USER_SEEDS: DefaultUserSeed[] = [
  {
    name: "Zach Brown",
    avatar:
      "https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=64&h=64&fit=crop&crop=faces",
    team: "Maintenance",
    baselineAssignments: [
      {
        id: "seed-zach-1",
        dayOffset: 0,
        hours: 3,
        title: "Monthly - HVAC - Maintenance",
        priority: "Medium",
        status: "Scheduled",
        locked: true,
        asset: "HVAC-02",
        location: "Molding Bay",
      },
      {
        id: "seed-zach-2",
        dayOffset: 2,
        hours: 1,
        title: "Weekly - Site Walk",
        priority: "Daily",
        status: "Scheduled",
        locked: true,
        location: "Production Floor",
      },
    ],
  },
  {
    name: "Juan Gustavo",
    avatar:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=64&h=64&fit=crop&crop=faces",
    team: "Facilities",
    baselineAssignments: [
      {
        id: "seed-juan-1",
        dayOffset: 1,
        hours: 2.5,
        title: "Weekly - CNC Machine Inspection",
        priority: "High",
        status: "Scheduled",
        locked: true,
        asset: "CNC-04",
        location: "Machining Wing",
      },
      {
        id: "seed-juan-2",
        dayOffset: 3,
        hours: 3,
        title: "Monthly - Injection Molding Calibration",
        priority: "Medium",
        status: "Scheduled",
        locked: true,
        location: "Line 2",
      },
    ],
  },
  {
    name: "Gail Frampton",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=64&h=64&fit=crop&crop=faces",
    team: "Production",
    baselineAssignments: [
      {
        id: "seed-gail-1",
        dayOffset: 0,
        hours: 4,
        title: "[Weekly] 3D Printer Maintenance",
        priority: "High",
        status: "Scheduled",
        locked: true,
        asset: "3DP-01",
        location: "R&D Lab",
      },
      {
        id: "seed-gail-2",
        dayOffset: 2,
        hours: 2,
        title: "[Repair] Water Jet Cutter",
        priority: "High",
        status: "Scheduled",
        locked: true,
        asset: "WJC-07",
        location: "Fabrication",
      },
    ],
  },
  {
    name: "Johnston Sharp",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=faces",
    team: "Maintenance",
    baselineAssignments: [
      {
        id: "seed-johnston-1",
        dayOffset: 2,
        hours: 3.5,
        title: "[Repair] Wrapper",
        priority: "Medium",
        status: "Scheduled",
        locked: true,
        location: "Packaging",
      },
      {
        id: "seed-johnston-2",
        dayOffset: 3,
        hours: 2,
        title: "[Monthly] Gear Hobbing Calibration",
        priority: "Medium",
        status: "Scheduled",
        locked: true,
        location: "Gear Shop",
      },
    ],
  },
  {
    name: "Gary Cox",
    avatar:
      "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=64&h=64&fit=crop&crop=faces",
    team: "Maintenance",
    baselineAssignments: [
      {
        id: "seed-gary-1",
        dayOffset: 1,
        hours: 1.5,
        title: "[Repair] Shot Blasting Booth",
        priority: "High",
        status: "Scheduled",
        locked: true,
        location: "Finishing",
      },
      {
        id: "seed-gary-2",
        dayOffset: 4,
        hours: 3,
        title: "[Monthly] Delta Robot Calibration",
        priority: "Medium",
        status: "Scheduled",
        locked: true,
        location: "Assembly",
      },
    ],
  },
  {
    name: "Osvaldo Jimenez",
    avatar:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=64&h=64&fit=crop&crop=faces",
    team: "Facilities",
    pendingReschedules: 1,
    baselineAssignments: [
      {
        id: "seed-osvaldo-1",
        dayOffset: 0,
        hours: 3,
        title: "[Repair] Air Compressor",
        priority: "High",
        status: "Scheduled",
        locked: true,
        asset: "COMP-02",
        location: "Compressor Room",
      },
      {
        id: "seed-osvaldo-2",
        dayOffset: 3,
        hours: 3.5,
        title: "[Weekly] CNC Machine Inspection",
        priority: "High",
        status: "Scheduled",
        locked: true,
        asset: "CNC-02",
        location: "Machining Wing",
      },
    ],
  },
];

const UNSCHEDULED_FALLBACK: UnscheduledOrderCard[] = [
  {
    id: "unscheduled-hvac",
    title: "Monthly - HVAC - Maintenance",
    priority: "High",
    status: "Open",
    dueLabel: "Due in 4 days",
    daysUntil: 4,
    estimatedHours: 5,
    asset: "HVAC-03",
    location: "North Wing",
  },
  {
    id: "unscheduled-robot",
    title: "[Weekly] Delta Robot Calibration",
    priority: "Medium",
    status: "Open",
    dueLabel: "Due in 2 days",
    daysUntil: 2,
    estimatedHours: 3,
    asset: "DR-01",
    location: "Assembly Line",
  },
  {
    id: "unscheduled-extrusion",
    title: "[Repair] Extrusion Machine",
    priority: "High",
    status: "On Hold",
    dueLabel: "Overdue by 1 day",
    daysUntil: -1,
    estimatedHours: 4,
    asset: "EXT-09",
    location: "Plastics",
  },
  {
    id: "unscheduled-inspection",
    title: "[Monthly] Industrial Oven Inspection",
    priority: "Medium",
    status: "Open",
    dueLabel: "Due in 6 days",
    daysUntil: 6,
    estimatedHours: 2.5,
    asset: "OVN-04",
    location: "Heat Treat",
  },
  {
    id: "unscheduled-filter",
    title: "[Daily] Site Walk",
    priority: "Daily",
    status: "Open",
    dueLabel: "Due today",
    daysUntil: 0,
    estimatedHours: 1,
    location: "Facility Wide",
  },
];

export function WorkloadViewNew({
  workOrders,
  weekOffset,
  setWeekOffset,
}: WorkloadViewNewProps) {
  const [viewMode, setViewMode] = useState<"users" | "work-orders">("users");
  const [unscheduledSearch, setUnscheduledSearch] = useState("");
  const [dueFilter, setDueFilter] = useState<"all" | "next15">("next15");
  const [selectedUnscheduledId, setSelectedUnscheduledId] = useState<string | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});

  const {
    weekMeta,
    weekRangeLabel,
    userRows,
    unscheduledOrders,
    totalCapacity,
    totalAssigned,
    averageUtilization,
    dailyTotals,
    summaryCounts,
  } = useMemo(() => {
    const normalizeDate = (date: Date) => {
      const normalized = new Date(date);
      normalized.setHours(0, 0, 0, 0);
      return normalized;
    };

    const getStartOfWeek = (date: Date) => {
      const start = normalizeDate(date);
      const day = start.getDay();
      const diffToMonday = (day + 6) % 7;
      start.setDate(start.getDate() - diffToMonday);
      return start;
    };

    const today = normalizeDate(new Date());
    const baseWeekStart = getStartOfWeek(today);
    const weekStart = new Date(baseWeekStart);
    if (weekOffset !== 0) {
      weekStart.setDate(weekStart.getDate() + weekOffset * 7);
    }
    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const weekMeta: WeekMeta[] = weekDays.map((dayName, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const normalizedDate = normalizeDate(date);
      return {
        key: normalizedDate.toISOString(),
        label: normalizedDate.getDate().toString(),
        dayName,
        date: normalizedDate,
        isToday: normalizedDate.getTime() === today.getTime(),
        isWeekend: index >= 5,
      };
    });

    const weekRangeLabel = (() => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const startLabel = weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      const endLabel = weekEnd.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      if (weekStart.getFullYear() === weekEnd.getFullYear()) {
        return `${startLabel} - ${endLabel}, ${weekEnd.getFullYear()}`;
      }
      return `${startLabel}, ${weekStart.getFullYear()} - ${endLabel}, ${weekEnd.getFullYear()}`;
    })();

    const userMap = initializeBaselineUsers(weekMeta);

    const unscheduledFromWorkOrders = workOrders
      .filter((order) => !order.isCompleted)
      .map((order, index) => convertWorkOrderToUnscheduled(order, index));

    // Merge unique unscheduled cards with fallbacks to keep the panel populated.
    const mergedUnscheduled = mergeUnscheduled(unscheduledFromWorkOrders, UNSCHEDULED_FALLBACK);

    // Blend live work orders into the schedule for their assignees so the grid feels connected to data.
    workOrders.forEach((order, index) => {
      const assigneeName = order.assignedTo?.name ?? "Unassigned";
      const assigneeTeam = order.assignedTo?.team ?? "General";
      const assigneeAvatar = order.assignedTo?.avatar;

      const row = userMap.get(assigneeName) ??
        createEmptyUserRow({
          name: assigneeName,
          avatar: assigneeAvatar,
          team: assigneeTeam,
          weekMeta,
        });

      if (!row.avatar && assigneeAvatar) {
        row.avatar = assigneeAvatar;
      }
      if (!row.team && assigneeTeam) {
        row.team = assigneeTeam;
      }

      const estimatedHours = getEstimatedHours(order, index);
      const dayIndex = getDayIndexForWorkOrder(order, weekMeta, index);
      const day = row.days[dayIndex];

      day.assignedHours += estimatedHours;
      day.tasks.push({
        id: order.id,
        title: order.title,
        estimatedHours,
        priority: order.priority,
        status: order.status,
        asset: order.asset,
        location: order.location,
        locked: true,
        isFromWorkOrder: true,
      });

      row.totalAssignedHours += estimatedHours;
      if (order.wasDeleted) {
        row.pendingReschedules += 1;
      }

      userMap.set(assigneeName, row);
    });

    const userRows: UserCapacityRow[] = Array.from(userMap.values()).map((row) => {
      const days: DaySchedule[] = row.days.map((day) => {
        const hoursLeft = day.capacityHours - day.assignedHours;
        const utilization = day.capacityHours > 0
          ? Math.min(100, (day.assignedHours / day.capacityHours) * 100)
          : 0;
        const sortedTasks = [...day.tasks].sort((a, b) => b.estimatedHours - a.estimatedHours);
        return {
          key: day.key,
          dayName: day.dayName,
          label: day.label,
          isToday: day.isToday,
          isWeekend: day.isWeekend,
          capacityHours: day.capacityHours,
          assignedHours: day.assignedHours,
          hoursLeft,
          utilization,
          tasks: sortedTasks,
        };
      });

      const weeklyCapacity = days.reduce((sum, day) => sum + day.capacityHours, 0);
      const utilization = weeklyCapacity > 0
        ? Math.min(100, (row.totalAssignedHours / weeklyCapacity) * 100)
        : 0;

      return {
        name: row.name,
        avatar: row.avatar,
        team: row.team,
        weeklyCapacity,
        assignedHours: row.totalAssignedHours,
        utilization,
        pendingReschedules: row.pendingReschedules,
        days,
      };
    });

    const totalCapacity = userRows.reduce((sum, user) => sum + user.weeklyCapacity, 0);
    const totalAssigned = userRows.reduce((sum, user) => sum + user.assignedHours, 0);
    const averageUtilization = totalCapacity > 0 ? Math.round((totalAssigned / totalCapacity) * 100) : 0;

    const dailyTotals = weekMeta.map((meta, index) => {
      const capacity = userRows.reduce((sum, user) => sum + (user.days[index]?.capacityHours ?? 0), 0);
      const assigned = userRows.reduce((sum, user) => sum + (user.days[index]?.assignedHours ?? 0), 0);
      const utilization = capacity > 0 ? Math.round((assigned / capacity) * 100) : 0;
      return {
        key: meta.key,
        label: meta.label,
        dayName: meta.dayName,
        isToday: meta.isToday,
        isWeekend: meta.isWeekend,
        capacity,
        assigned,
        utilization,
        hoursLeft: capacity - assigned,
      };
    });

    const summaryCounts = {
      overdue: mergedUnscheduled.filter((order) => order.daysUntil < 0).length,
      dueSoon: mergedUnscheduled.filter((order) => order.daysUntil >= 0 && order.daysUntil <= 3).length,
      open: workOrders.filter((order) => order.status === "Open").length,
      onHold: workOrders.filter((order) => order.status === "On Hold").length,
      inProgress: workOrders.filter((order) => order.status === "In Progress").length,
      totalUnscheduled: mergedUnscheduled.length,
      weekRangeLabel,
    };

    return {
      weekMeta,
      weekRangeLabel,
      userRows,
      unscheduledOrders: mergedUnscheduled,
      totalCapacity,
      totalAssigned,
      averageUtilization,
      dailyTotals,
      summaryCounts,
    };
  }, [weekOffset, workOrders]);

  const filteredUnscheduled = useMemo(() => {
    return unscheduledOrders.filter((order) => {
      const matchesSearch = unscheduledSearch.trim().length === 0
        || order.title.toLowerCase().includes(unscheduledSearch.toLowerCase());
      const matchesDueWindow = dueFilter === "all" || order.daysUntil <= 15;
      return matchesSearch && matchesDueWindow;
    });
  }, [unscheduledOrders, unscheduledSearch, dueFilter]);

  const selectedUnscheduled = selectedUnscheduledId
    ? unscheduledOrders.find((order) => order.id === selectedUnscheduledId)
    : null;

  const gridTemplateColumns = "300px repeat(7, minmax(140px, 1fr))";

  const handleToggleUser = (name: string) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [name]: !(prev[name] ?? true),
    }));
  };

  return (
    <div className="flex h-full w-full bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Workload View</h2>
              <p className="text-sm text-muted-foreground">{summaryCounts.weekRangeLabel}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-full border border-border bg-background p-1">
                <Button
                  variant={viewMode === "users" ? "default" : "ghost"}
                  size="sm"
                  className="gap-2 rounded-full"
                  onClick={() => setViewMode("users")}
                >
                  <Users className="h-4 w-4" />
                  Users
                </Button>
                <Button
                  variant={viewMode === "work-orders" ? "default" : "ghost"}
                  size="sm"
                  className="gap-2 rounded-full"
                  onClick={() => setViewMode("work-orders")}
                >
                  <List className="h-4 w-4" />
                  Work Orders
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setWeekOffset((prev) => prev - 1)}
                  aria-label="Previous week"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWeekOffset(0)}
                  disabled={weekOffset === 0}
                >
                  This Week
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setWeekOffset((prev) => prev + 1)}
                  aria-label="Next week"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-6 px-6 py-6">

            <Card className="rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-base font-semibold">Unscheduled Work Orders</CardTitle>
                  <CardDescription>
                    Review work orders that are not yet placed on the workload grid.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  {summaryCounts.totalUnscheduled} items
                </Badge>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex items-center justify-between gap-3 overflow-x-auto">
                  <SummaryPill
                    label="Overdue"
                    value={summaryCounts.overdue}
                    tone="destructive"
                  />
                  <SummaryPill
                    label="Due Soon"
                    value={summaryCounts.dueSoon}
                    tone="warning"
                  />
                  <SummaryPill label="Open" value={summaryCounts.open} tone="info" />
                  <SummaryPill
                    label="On Hold"
                    value={summaryCounts.onHold}
                    tone="muted"
                  />
                  <SummaryPill
                    label="In Progress"
                    value={summaryCounts.inProgress}
                    tone="neutral"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardContent className="px-0">
                <div className="grid divide-x border-b border-border" style={{ gridTemplateColumns }}>
                  <div className="space-y-3 px-6 py-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Total Resource Capacity
                    </p>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-2xl font-semibold text-foreground">
                        {formatHours(totalAssigned)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / {formatHours(totalCapacity)} Capacity
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Weekly Utilization</span>
                        <span>{averageUtilization}%</span>
                      </div>
                      <Progress value={averageUtilization} className="mt-2" />
                    </div>
                  </div>
                  {dailyTotals.map((day) => (
                  <div
                    key={day.key}
                    className={cn(
                      "px-4 py-4",
                      day.isToday && "bg-primary/5",
                      day.isWeekend && "bg-muted/40",
                    )}
                    style={day.isWeekend ? weekendBackgroundStyle : undefined}
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className={day.isToday ? "text-primary" : undefined}>
                        {day.dayName.slice(0, 3)}
                      </span>
                      <span className={day.isToday ? "text-primary" : undefined}>{day.label}</span>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                      <span className="text-lg font-semibold text-foreground">
                        {day.utilization}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {day.hoursLeft >= 0
                          ? `${formatHours(day.hoursLeft)} left`
                          : `Over by ${formatHours(Math.abs(day.hoursLeft))}`}
                      </span>
                    </div>
                    <Progress value={day.utilization} className="mt-3 h-1.5" />
                  </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            

            <div className="rounded-xl border">
              <div className="grid items-center border-b border-border bg-muted/40" style={{ gridTemplateColumns }}>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <List className="h-4 w-4" />
                    User Capacity
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2 text-xs">
                    <UserCheck className="h-4 w-4" />
                    Manage Teams
                  </Button>
                </div>
                {weekMeta.map((day) => (
                  <div
                    key={day.key}
                    className={cn(
                      "border-l border-border px-4 py-3 text-center",
                      day.isToday && "bg-primary/5",
                      day.isWeekend && "bg-muted/40",
                    )}
                    style={day.isWeekend ? weekendBackgroundStyle : undefined}
                  >
                    <div className={cn(
                      "text-sm font-medium",
                      day.isToday ? "text-primary" : "text-foreground",
                    )}
                    >
                      {day.dayName.slice(0, 3)}
                    </div>
                    <div className={cn(
                      "text-xs",
                      day.isToday ? "text-primary" : "text-muted-foreground",
                    )}
                    >
                      {day.label}
                    </div>
                  </div>
                ))}
              </div>

              {userRows.length === 0 && (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  No team members available for this week.
                </div>
              )}

              {userRows.map((user, index) => {
                const expanded = expandedUsers[user.name] ?? true;
                return (
                  <div
                    key={user.name}
                    className={cn("grid", index > 0 && "border-t border-border")}
                    style={{ gridTemplateColumns }}
                  >
                    <div className="px-4 py-4">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleUser(user.name)}
                          className="mt-1 rounded-full border border-border bg-background p-1 text-muted-foreground hover:text-foreground"
                          aria-label={expanded ? "Collapse user" : "Expand user"}
                        >
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              !expanded && "-rotate-90",
                            )}
                          />
                        </button>
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{user.name}</p>
                              {user.team && (
                                <p className="text-xs text-muted-foreground">{user.team}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="text-sm font-semibold text-foreground">
                                  {formatHours(user.assignedHours)} / {formatHours(user.weeklyCapacity)} Capacity
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {Math.round(user.utilization)}% utilized
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Quick Edit</DropdownMenuItem>
                                  <DropdownMenuItem>View Schedule</DropdownMenuItem>
                                  <DropdownMenuItem>Open Profile</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <Progress value={user.utilization} />
                          {user.pendingReschedules > 0 && (
                            <div className="flex items-start gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3 text-xs text-amber-700">
                              <AlertCircle className="mt-0.5 h-4 w-4" />
                              <span>
                                {user.pendingReschedules} incomplete work order{user.pendingReschedules > 1 ? "s" : ""} to reschedule
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {user.days.map((day) => (
                      <div
                        key={`${user.name}-${day.key}`}
                        className={cn(
                          "border-l border-border px-3 py-3",
                          day.isToday && "bg-primary/5",
                          day.isWeekend && "bg-muted/40",
                        )}
                        style={day.isWeekend ? weekendBackgroundStyle : undefined}
                      >
                        <div className="space-y-2">
                          <div
                            className={cn(
                              "rounded-lg border px-2 py-2 text-center text-xs font-semibold shadow-sm",
                              day.capacityHours === 0
                                ? "border-dashed border-muted-foreground/40 bg-muted text-muted-foreground"
                                : day.hoursLeft < 0
                                ? "border-red-200 bg-red-50 text-red-700"
                                : day.hoursLeft <= 1
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-primary/30 bg-primary/10 text-primary",
                            )}
                          >
                            {renderCapacityLabel(day)}
                          </div>

                          {expanded && day.tasks.length > 0 && (
                            <div className="space-y-2">
                              {day.tasks.slice(0, 3).map((task) => (
                                <div
                                  key={task.id}
                                  className="rounded-lg border border-border/40 bg-background px-2 py-1 text-xs shadow-sm"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="truncate font-medium text-foreground" title={task.title}>
                                      {task.title}
                                    </span>
                                    <Badge variant="outline" className="text-[10px] uppercase">
                                      {task.priority || "N/A"}
                                    </Badge>
                                  </div>
                                  <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                                    <span>{task.estimatedHours.toFixed(1)}h</span>
                                    <div className="flex items-center gap-2">
                                      {task.locked && <Lock className="h-3 w-3" />}
                                      {task.asset && <span>{task.asset}</span>}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {day.tasks.length > 3 && (
                                <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted px-2 py-1 text-center text-[10px] text-muted-foreground">
                                  +{day.tasks.length - 3} more
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {viewMode === "work-orders" && (
              <Card className="rounded-xl border border-dashed border-primary/40 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Work Order Timeline (Preview)</CardTitle>
                  <CardDescription>
                    A condensed daily timeline highlighting the same data grouped by work order.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {weeklyTimelineFromUsers(userRows, weekMeta).map((day) => (
                    <div key={day.key} className="space-y-2 rounded-lg border border-border/40 bg-background p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-semibold text-foreground">
                            {day.dayName} • {day.label}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {day.totalTasks} task{day.totalTasks === 1 ? "" : "s"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {day.tasks.map((task) => (
                          <div
                            key={`${day.key}-${task.id}`}
                            className="flex items-center gap-2 rounded-full border border-border/40 bg-muted px-3 py-1 text-xs"
                          >
                            <span className="font-medium text-foreground">{task.title}</span>
                            <Badge variant="secondary" className="text-[10px] uppercase">
                              {task.owner}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>

      <aside className="hidden w-[340px] border-l border-border bg-card lg:flex lg:flex-col">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Unscheduled Work Orders</h3>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-xs"
              onClick={() => setDueFilter((prev) => (prev === "all" ? "next15" : "all"))}
            >
              <Filter className="h-4 w-4" />
              {dueFilter === "next15" ? "Due in 15 days" : "All"}
            </Button>
          </div>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={unscheduledSearch}
              onChange={(event) => setUnscheduledSearch(event.target.value)}
              placeholder="Search work orders..."
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-3 px-5 py-4">
            {filteredUnscheduled.length === 0 && (
              <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted px-3 py-4 text-center text-xs text-muted-foreground">
                No work orders match the current filters.
              </div>
            )}
            {filteredUnscheduled.map((order) => {
              const isSelected = selectedUnscheduledId === order.id;
              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSelectedUnscheduledId(order.id)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-3 text-left text-sm transition-colors",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background hover:bg-muted",
                  )}
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                    <span>{order.dueLabel}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{order.title}</span>
                    <Badge variant={order.priority === "High" ? "destructive" : "outline"} className="text-[10px] uppercase">
                      {order.priority}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{order.status}</span>
                    <span>{order.estimatedHours.toFixed(1)}h</span>
                  </div>
                  {(order.asset || order.location) && (
                    <div className="mt-1 text-[10px] text-muted-foreground">
                      {order.asset && <span className="mr-1">{order.asset}</span>}
                      {order.location && <span>• {order.location}</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>

        {selectedUnscheduled && (
          <div className="border-t border-border px-5 py-4">
            <h4 className="text-sm font-semibold text-foreground">{selectedUnscheduled.title}</h4>
            <div className="mt-3 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>{selectedUnscheduled.dueLabel}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Status:</span> {selectedUnscheduled.status}
              </div>
              <div>
                <span className="font-medium text-foreground">Estimated Time:</span> {selectedUnscheduled.estimatedHours.toFixed(1)}h
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Schedule Work Order
              </Button>
              <Button variant="outline" className="w-full">
                Open Work Order
              </Button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function initializeBaselineUsers(weekMeta: WeekMeta[]): Map<string, InternalUserRow> {
  const map = new Map<string, InternalUserRow>();

  DEFAULT_USER_SEEDS.forEach((seed) => {
    const row = createEmptyUserRow({
      name: seed.name,
      avatar: seed.avatar,
      team: seed.team,
      pendingReschedules: seed.pendingReschedules,
      weekMeta,
    });

    seed.baselineAssignments.forEach((assignment) => {
      const dayIndex = clampDayOffset(assignment.dayOffset, weekMeta.length);
      const day = row.days[dayIndex];
      day.assignedHours += assignment.hours;
      day.tasks.push({
        id: assignment.id,
        title: assignment.title,
        estimatedHours: assignment.hours,
        priority: assignment.priority,
        status: assignment.status,
        asset: assignment.asset,
        location: assignment.location,
        locked: assignment.locked,
      });
      row.totalAssignedHours += assignment.hours;
    });

    map.set(seed.name, row);
  });

  return map;
}

function createEmptyUserRow({
  name,
  avatar,
  team,
  pendingReschedules,
  weekMeta,
}: {
  name: string;
  avatar?: string;
  team?: string;
  pendingReschedules?: number;
  weekMeta: WeekMeta[];
}): InternalUserRow {
  return {
    name,
    avatar,
    team,
    pendingReschedules: pendingReschedules ?? 0,
    totalAssignedHours: 0,
    days: weekMeta.map((meta) => ({
      key: meta.key,
      capacityHours: meta.isWeekend ? 0 : HOURS_PER_DAY,
      assignedHours: 0,
      tasks: [],
      isWeekend: meta.isWeekend,
      isToday: meta.isToday,
      dayName: meta.dayName,
      label: meta.label,
    })),
  };
}

function clampDayOffset(dayOffset: number, length: number): number {
  if (Number.isNaN(dayOffset)) return 0;
  if (dayOffset < 0) return 0;
  if (dayOffset >= length) return length - 1;
  return dayOffset;
}

function getEstimatedHours(order: WorkOrder, index: number): number {
  const priority = order.priority?.toLowerCase() ?? "";
  const base = priority.includes("high")
    ? 4.5
    : priority.includes("daily")
    ? 2
    : priority.includes("low")
    ? 2.5
    : priority.includes("medium")
    ? 3.5
    : 3;
  const variance = (stringHash(order.id + index) % 3) * 0.5;
  return Math.round((base + variance) * 10) / 10;
}

function getDayIndexForWorkOrder(order: WorkOrder, weekMeta: WeekMeta[], index: number): number {
  if (!order.dueDate) {
    return stringHash(order.id + index) % weekMeta.length;
  }

  const parsed = Date.parse(order.dueDate);
  if (!Number.isNaN(parsed)) {
    const normalized = new Date(parsed);
    normalized.setHours(0, 0, 0, 0);
    const diff = Math.round((normalized.getTime() - weekMeta[0].date.getTime()) / MS_IN_DAY);
    if (diff >= 0 && diff < weekMeta.length) {
      return diff;
    }
  }

  const dueLower = order.dueDate.toLowerCase();
  if (dueLower.includes("today")) return weekMeta.findIndex((meta) => meta.isToday) || 0;
  if (dueLower.includes("tomorrow")) {
    const todayIndex = weekMeta.findIndex((meta) => meta.isToday);
    return todayIndex >= 0 ? Math.min(todayIndex + 1, weekMeta.length - 1) : 1;
  }
  if (dueLower.includes("yesterday")) {
    const todayIndex = weekMeta.findIndex((meta) => meta.isToday);
    return todayIndex > 0 ? todayIndex - 1 : 0;
  }
  const match = dueLower.match(/in (\d+) day/);
  if (match) {
    const days = Number(match[1]);
    return Math.min(Math.max(days, 0), weekMeta.length - 1);
  }

  return stringHash(order.dueDate + order.id + index) % weekMeta.length;
}

function convertWorkOrderToUnscheduled(order: WorkOrder, index: number): UnscheduledOrderCard {
  const { dueLabel, daysUntil } = deriveDueLabel(order.dueDate, index);
  return {
    id: order.id,
    title: order.title,
    priority: order.priority,
    status: order.status,
    dueLabel,
    daysUntil,
    estimatedHours: getEstimatedHours(order, index),
    asset: order.asset,
    location: order.location,
  };
}

function deriveDueLabel(dueDate: string, index: number): { dueLabel: string; daysUntil: number } {
  if (!dueDate) {
    return { dueLabel: "Due date not set", daysUntil: 30 };
  }

  const lower = dueDate.toLowerCase();
  if (lower.includes("today")) {
    return { dueLabel: "Due today", daysUntil: 0 };
  }
  if (lower.includes("tomorrow")) {
    return { dueLabel: "Due tomorrow", daysUntil: 1 };
  }
  if (lower.includes("yesterday")) {
    return { dueLabel: "Overdue by 1 day", daysUntil: -1 };
  }
  const inDaysMatch = lower.match(/in (\d+) day/);
  if (inDaysMatch) {
    const days = Number(inDaysMatch[1]);
    return { dueLabel: `Due in ${days} day${days === 1 ? "" : "s"}` , daysUntil: days };
  }
  const parsed = Date.parse(dueDate);
  if (!Number.isNaN(parsed)) {
    const diff = Math.round((parsed - Date.now()) / MS_IN_DAY);
    return {
      dueLabel: diff < 0 ? `Overdue by ${Math.abs(diff)} day${Math.abs(diff) === 1 ? "" : "s"}` : `Due in ${diff} day${diff === 1 ? "" : "s"}`,
      daysUntil: diff,
    };
  }
  const fallback = (stringHash(dueDate + index) % 20) - 2;
  return {
    dueLabel: fallback < 0 ? `Overdue by ${Math.abs(fallback)} day${Math.abs(fallback) === 1 ? "" : "s"}` : `Due in ${fallback} day${fallback === 1 ? "" : "s"}`,
    daysUntil: fallback,
  };
}

function mergeUnscheduled(primary: UnscheduledOrderCard[], fallback: UnscheduledOrderCard[]): UnscheduledOrderCard[] {
  const byId = new Map<string, UnscheduledOrderCard>();
  [...fallback, ...primary].forEach((item) => {
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  });
  const merged = Array.from(byId.values());
  merged.sort((a, b) => {
    if (a.daysUntil < 0 && b.daysUntil >= 0) return -1;
    if (b.daysUntil < 0 && a.daysUntil >= 0) return 1;
    if (a.priority === b.priority) {
      return a.daysUntil - b.daysUntil;
    }
    if (a.priority === "High") return -1;
    if (b.priority === "High") return 1;
    return a.priority.localeCompare(b.priority);
  });
  return merged;
}

function formatHours(value: number): string {
  const totalMinutes = Math.round(value * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0 && minutes === 0) {
    return "0h";
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

function renderCapacityLabel(day: DaySchedule): string {
  if (day.capacityHours === 0 && day.assignedHours === 0) {
    return "Off";
  }
  if (day.hoursLeft < 0) {
    const overbooked = Math.abs(day.hoursLeft);
    const hours = Math.floor(overbooked);
    const minutes = Math.round((overbooked - hours) * 60);
    const minutesLabel = minutes > 0 ? `${minutes.toString().padStart(2, "0")}m` : "00m";
    return `Over by ${hours}:${minutesLabel}`;
  }
  const hours = Math.floor(day.hoursLeft);
  const minutes = Math.round((day.hoursLeft - hours) * 60);
  return `${hours}:${minutes.toString().padStart(2, "0")} left`;
}

const weekendBackgroundStyle = {
  backgroundImage:
    "repeating-linear-gradient(-45deg, rgba(148, 163, 184, 0.18) 0px, rgba(148, 163, 184, 0.18) 10px, transparent 10px, transparent 20px)",
};

function stringHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function weeklyTimelineFromUsers(users: UserCapacityRow[], weekMeta: WeekMeta[]): Array<{
  key: string;
  dayName: string;
  label: string;
  totalTasks: number;
  tasks: Array<{ id: string; title: string; owner: string }>;
}> {
  return weekMeta.map((dayMeta, index) => {
    const tasks: Array<{ id: string; title: string; owner: string }> = [];
    users.forEach((user) => {
      const day = user.days[index];
      if (!day) return;
      day.tasks.forEach((task) => {
        tasks.push({ id: task.id, title: task.title, owner: user.name });
      });
    });
    return {
      key: dayMeta.key,
      dayName: dayMeta.dayName,
      label: dayMeta.label,
      totalTasks: tasks.length,
      tasks,
    };
  });
}

function SummaryPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "destructive" | "warning" | "info" | "muted" | "neutral";
}) {
  const toneClasses = {
    destructive: "border-red-200 bg-red-50 text-red-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    info: "border-primary/40 bg-primary/10 text-primary",
    muted: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300",
    neutral: "border-border bg-background text-foreground",
  };

  return (
    <div className={cn("rounded-lg border px-3 py-3", toneClasses[tone])}>
      <div className="text-[11px] font-semibold uppercase tracking-wide">{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}
