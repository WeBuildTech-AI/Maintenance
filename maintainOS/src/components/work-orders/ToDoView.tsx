import { useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  AlertTriangle,
  Edit2,
  MapPin,
  MessageSquare,
  MoreHorizontal,
} from "lucide-react";

import { type ToDoViewProps } from "./types";

export function ToDoView({
  todoWorkOrders,
  doneWorkOrders,
  selectedWorkOrder,
  onSelectWorkOrder,
}: ToDoViewProps) {
  const [activeTab, setActiveTab] = useState<"todo" | "done">("todo");

  const lists = useMemo(
    () => ({
      todo: todoWorkOrders,
      done: doneWorkOrders,
    }),
    [todoWorkOrders, doneWorkOrders]
  );

  const activeList = lists[activeTab];

  const priorityStyles: Record<string, string> = {
    High: "bg-red-100 text-red-700 border-red-200",
    Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Low: "bg-orange-100 text-orange-700 border-orange-200",
    Daily: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const renderStatusBadge = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === "completed" || normalized === "done") {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
          ✓ Done
        </Badge>
      );
    }
    if (normalized === "in progress") {
      return (
        <Badge className="bg-orange-100 text-orange-700 border-orange-200">
          In Progress
        </Badge>
      );
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <div className="flex h-full">
      <div className="w-[420px] border-r border-border bg-card flex flex-col">
        <div className="border-b border-border px-6 pt-6">
          <div className="flex items-center font-medium text-sm text-muted-foreground uppercase tracking-wide">
            To Do
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="flex rounded-full bg-muted/60 p-1 text-sm font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("todo")}
                className={`rounded-full px-4 py-2 transition ${
                  activeTab === "todo"
                    ? "bg-background shadow"
                    : "text-muted-foreground"
                }`}
              >
                To Do ({todoWorkOrders.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("done")}
                className={`rounded-full px-4 py-2 transition ${
                  activeTab === "done"
                    ? "bg-background shadow"
                    : "text-muted-foreground"
                }`}
              >
                Done ({doneWorkOrders.length})
              </button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-primary p-2">
                  Sort: Last Updated
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  Last Updated: Most Recent First
                </DropdownMenuItem>
                <DropdownMenuItem>Priority: Highest First</DropdownMenuItem>
                <DropdownMenuItem>Due Date: Soonest First</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {activeList.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="h-16 w-16 rounded-full border border-dashed border-muted-foreground/30" />
              <div className="space-y-1">
                <p className="text-sm font-medium">No work orders</p>
                <p className="text-xs text-muted-foreground">
                  Switch tabs or create a new work order to get started.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Create Work Order
              </Button>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {activeList.map((workOrder) => {
                const isSelected = selectedWorkOrder.id === workOrder.id;
                return (
                  <Card
                    key={workOrder.id}
                    className={`cursor-pointer border shadow-sm transition hover:shadow ${
                      isSelected ? "border-primary" : ""
                    }`}
                    onClick={() => onSelectWorkOrder(workOrder)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-12 w-12 flex items-center justify-center rounded-full border ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-muted bg-muted/40"
                          }`}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={workOrder.assignedTo.avatar} />
                            <AvatarFallback>
                              {workOrder.assignedTo.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-sm text-foreground">
                                {workOrder.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {activeTab === "done"
                                  ? "Completed by"
                                  : "Assigned to"}{" "}
                                {workOrder.assignedTo.name}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-xs text-muted-foreground"
                            >
                              {workOrder.id}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {renderStatusBadge(workOrder.status)}
                            <Badge
                              variant="outline"
                              className={`flex items-center gap-1 ${
                                priorityStyles[workOrder.priority] ?? ""
                              }`}
                            >
                              ● {workOrder.priority}
                            </Badge>
                            <span className="text-muted-foreground">
                              Due {workOrder.dueDate}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Asset: {workOrder.asset} · Location:{" "}
                            {workOrder.location}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-medium">{selectedWorkOrder.title}</h2>
              <Edit2 className="h-4 w-4 text-primary cursor-pointer" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>🗓 {selectedWorkOrder.priority}</span>
            <span>📅 Due by {selectedWorkOrder.dueDate}</span>
          </div>
        </div>

        {selectedWorkOrder.wasDeleted && (
          <div className="mx-6 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  Work Order was deleted.
                </p>
                {selectedWorkOrder.deletedDate && (
                  <p className="text-sm text-destructive/80">
                    Deleted on {selectedWorkOrder.deletedDate}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Status</h3>
            <Badge
              variant="outline"
              className="text-primary border-primary/20 bg-primary/10"
            >
              🔵 {selectedWorkOrder.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Due Date</h3>
              <p className="text-sm text-muted-foreground">
                {selectedWorkOrder.dueDate}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Work Order ID</h3>
              <p className="text-sm text-muted-foreground">
                {selectedWorkOrder.id}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Assigned To</h3>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={selectedWorkOrder.assignedTo.avatar} />
                <AvatarFallback>
                  {selectedWorkOrder.assignedTo.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">
                {selectedWorkOrder.assignedTo.name}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Asset</h3>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-100 rounded flex items-center justify-center">
                  <span className="text-xs">🏠</span>
                </div>
                <span className="text-sm">{selectedWorkOrder.asset}</span>
                <Select>
                  <SelectTrigger className="w-[80px] h-6 z-40 text-xs bg-white border border-gray-300 rounded-md px-2 flex items-center justify-between">
                    <SelectValue placeholder="Online" />
                  </SelectTrigger>
                  <SelectContent
                    side="top" // Preferred side; Radix flips automatically if not enough space
                    align="start"
                    sideOffset={2} // Gap between trigger and dropdown
                    className="bg-white border border-gray-300 rounded-md shadow-lg z-50"
                  >
                    <SelectItem
                      className="px-2 py-1 hover:bg-gray-100 text-sm"
                      value="online"
                    >
                      Online
                    </SelectItem>
                    <SelectItem
                      className="px-2 py-1 hover:bg-gray-100 text-sm"
                      value="offline"
                    >
                      Offline
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Location</h3>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-muted rounded flex items-center justify-center">
                  <MapPin className="h-2 w-2 text-muted-foreground" />
                </div>
                <span className="text-sm">{selectedWorkOrder.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
