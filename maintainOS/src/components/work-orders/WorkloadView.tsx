import { Dispatch, SetStateAction, useMemo, useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

import { WorkOrder } from "./types";

interface WorkloadViewProps {
  workOrders: WorkOrder[];
  weekOffset: number;
  setWeekOffset: Dispatch<SetStateAction<number>>;
}

type SortOption = "name-asc" | "utilization-desc" | "utilization-asc";

const HOURS_PER_DAY = 8;

export function WorkloadView({ workOrders, weekOffset, setWeekOffset }: WorkloadViewProps) {
  const { weekRangeLabel, weekMeta, assignees } = useMemo(() => {
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
    const weekStart = getStartOfWeek(today);
    if (weekOffset !== 0) {
      weekStart.setDate(weekStart.getDate() + weekOffset * 7);
    }
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekMeta = weekDays.map((dayLabel, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const normalizedDate = normalizeDate(date);
      return {
        key: `${normalizedDate.toISOString()}`,
        day: dayLabel,
        date: normalizedDate,
        label: normalizedDate.getDate().toString(),
        isToday: normalizedDate.getTime() === today.getTime(),
      };
    });

    const weekRangeLabel = (() => {
      const startLabel = weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      const endLabel = weekEnd.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      if (weekStart.getFullYear() === weekEnd.getFullYear()) {
        return `${startLabel} - ${endLabel}, ${weekEnd.getFullYear()}`;
      }
      return `${startLabel}, ${weekStart.getFullYear()} - ${endLabel}, ${weekEnd.getFullYear()}`;
    })();

    const assignees = Array.from(new Set(workOrders.map((wo) => wo.assignedTo.name))).map((name) => {
      const assigneeData = workOrders.find((wo) => wo.assignedTo.name === name)?.assignedTo;
      const assigneeWorkOrders = workOrders.filter((wo) => wo.assignedTo.name === name);

      const weeklySchedule = weekMeta.map((dayMeta) => {
        const scheduledHours = Math.floor(Math.random() * HOURS_PER_DAY) + 1;
        const tasks = assigneeWorkOrders.slice(0, Math.min(2, assigneeWorkOrders.length));
        return {
          day: dayMeta.day,
          date: dayMeta.date,
          scheduledHours,
          tasks,
          utilization: Math.min((scheduledHours / HOURS_PER_DAY) * 100, 100),
        };
      });

      const totalHours = weeklySchedule.reduce((sum, day) => sum + day.scheduledHours, 0);
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

    return {
      weekRangeLabel,
      weekMeta,
      assignees,
    };
  }, [weekOffset, workOrders]);

  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("name-asc");

  const availableTeams = useMemo(() => {
    return Array.from(new Set(assignees.map((assignee) => assignee.team))).sort();
  }, [assignees]);

  const filteredAssignees = useMemo(() => {
    const matchesTeam = teamFilter === "all"
      ? assignees
      : assignees.filter((assignee) => assignee.team === teamFilter);

    const sorted = [...matchesTeam];
    switch (sortOption) {
      case "utilization-desc":
        sorted.sort((a, b) => b.avgUtilization - a.avgUtilization);
        break;
      case "utilization-asc":
        sorted.sort((a, b) => a.avgUtilization - b.avgUtilization);
        break;
      default:
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return sorted;
  }, [assignees, sortOption, teamFilter]);

  const totalScheduledHours = useMemo(
    () => filteredAssignees.reduce((sum, assignee) => sum + assignee.totalHours, 0),
    [filteredAssignees],
  );

  const dailyTotals = useMemo(() => {
    return weekMeta.map((dayMeta, index) => {
      const totalHours = filteredAssignees.reduce(
        (sum, assignee) => sum + (assignee.weeklySchedule[index]?.scheduledHours ?? 0),
        0,
      );
      const capacity = filteredAssignees.length * HOURS_PER_DAY;
      const utilization = capacity > 0 ? Math.round((totalHours / capacity) * 100) : 0;

      return {
        key: dayMeta.key,
        day: dayMeta.day,
        label: dayMeta.label,
        isToday: dayMeta.isToday,
        totalHours,
        capacity,
        utilization,
      };
    });
  }, [filteredAssignees, weekMeta]);

  const totalCapacity = filteredAssignees.length * HOURS_PER_DAY * weekMeta.length;
  const averageUtilization = totalCapacity > 0 ? Math.round((totalScheduledHours / totalCapacity) * 100) : 0;
  const gridTemplateColumns = "minmax(240px, 1.6fr) repeat(7, minmax(0, 1fr))";

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium">Team Workload</h2>
              <p className="text-sm text-muted-foreground">{weekRangeLabel}</p>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
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
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-green-500" />
                  <span>Under 6h</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-yellow-500" />
                  <span>6-8h</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-red-500" />
                  <span>Over 8h</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {availableTeams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A–Z)</SelectItem>
                <SelectItem value="utilization-desc">Utilization (High → Low)</SelectItem>
                <SelectItem value="utilization-asc">Utilization (Low → High)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-6 overflow-hidden rounded-lg border bg-card">
          <div className="grid" style={{ gridTemplateColumns }}>
            <div className="border-r border-border p-6">
              <p className="text-sm font-semibold text-muted-foreground">Total Resource Capacity</p>
              <div className="mt-3 flex flex-wrap items-baseline gap-2">
                <span className="text-2xl font-semibold text-foreground">{totalScheduledHours}h</span>
                <span className="text-sm text-muted-foreground">/ {totalCapacity || 0}h Capacity</span>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Weekly Utilization</span>
                  <span>{averageUtilization}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-primary/10">
                  <div
                    className="h-full rounded-full bg-primary/40"
                    style={{ width: `${Math.min(averageUtilization, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {dailyTotals.map((day) => (
              <div
                key={day.key}
                className={`border-l border-border p-4 ${day.isToday ? "bg-primary/5" : "bg-background"}`}
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className={day.isToday ? "text-primary" : undefined}>{day.day}</span>
                  <span className={day.isToday ? "text-primary" : undefined}>{day.label}</span>
                </div>
                <div className="mt-3 rounded-md border border-primary/10 bg-primary/5 p-3">
                  <div className="flex items-center justify-between text-xs text-primary">
                    <span>{day.totalHours}h</span>
                    <span>{day.capacity || 0}h</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-primary/20">
                    <div
                      className={`h-full rounded-full ${
                        day.utilization >= 110
                          ? "bg-red-400"
                          : day.utilization >= 90
                          ? "bg-yellow-400"
                          : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(day.utilization, 130)}%` }}
                    />
                  </div>
                  <div className="mt-2 text-center text-xs text-muted-foreground">{day.utilization}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="grid border-b border-border" style={{ gridTemplateColumns }}>
            <div className="p-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">Team Member</div>
            {weekMeta.map((dayMeta) => (
              <div
                key={dayMeta.key}
                className={`border-l border-border p-4 text-center ${dayMeta.isToday ? "bg-primary/5" : ""}`}
              >
                <div className={`text-sm font-medium ${dayMeta.isToday ? "text-primary" : "text-foreground"}`}>
                  {dayMeta.day}
                </div>
                <div className={`text-xs ${dayMeta.isToday ? "text-primary" : "text-muted-foreground"}`}>
                  {dayMeta.label}
                </div>
              </div>
            ))}
          </div>

          {filteredAssignees.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No team members match the selected filters.
            </div>
          )}

          {filteredAssignees.map((assignee, userIndex) => (
            <div
              key={assignee.name}
              className={`grid ${userIndex < filteredAssignees.length - 1 ? "border-b border-border" : ""}`}
              style={{ gridTemplateColumns }}
            >
              <div className="bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={assignee.avatar} />
                    <AvatarFallback>
                      {assignee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-tight text-foreground">{assignee.name}</p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{assignee.team}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{assignee.totalHours}h/week</span>
                      <span>•</span>
                      <span>{Math.round(assignee.avgUtilization)}% avg</span>
                    </div>
                  </div>
                </div>
              </div>

              {assignee.weeklySchedule.map((daySchedule) => (
                <div key={daySchedule.day} className="border-l border-border p-3">
                  <div className="flex flex-col items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        daySchedule.scheduledHours <= 6
                          ? "border-green-200 bg-green-50 text-green-700"
                          : daySchedule.scheduledHours <= 8
                          ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      {daySchedule.scheduledHours}h
                    </Badge>
                    <div className="w-full space-y-1">
                      {daySchedule.tasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className="truncate rounded bg-primary/10 px-2 py-1 text-xs text-primary"
                          title={task.title}
                        >
                          {task.title.length > 18 ? `${task.title.slice(0, 18)}…` : task.title}
                        </div>
                      ))}
                      {daySchedule.tasks.length > 2 && (
                        <div className="rounded bg-muted px-2 py-1 text-center text-xs text-muted-foreground">
                          +{daySchedule.tasks.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-medium">{totalScheduledHours}</div>
              <p className="text-sm text-muted-foreground">Total Hours Scheduled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-medium">{averageUtilization}%</div>
              <p className="text-sm text-muted-foreground">Average Utilization</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-medium">
                {filteredAssignees.filter((assignee) => assignee.avgUtilization > 80).length}
              </div>
              <p className="text-sm text-muted-foreground">Overallocated</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-medium">
                {filteredAssignees.filter((assignee) => assignee.avgUtilization < 60).length}
              </div>
              <p className="text-sm text-muted-foreground">Underutilized</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
