import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";

import { type ListViewProps } from "./types";

export function ListView({ workOrders }: ListViewProps) {
  return (
    <div className="flex-1">
      <div className="p-6">
        <div className="bg-card rounded-lg border">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-border text-sm font-medium text-muted-foreground sticky top-0 bg-card z-10">
            <div className="col-span-1">ID</div>
            <div className="col-span-3">Title</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-2">Assigned To</div>
            <div className="col-span-2">Due Date</div>
          </div>

          {/* Scrollable rows */}
          <div className="max-h-96 overflow-y-auto">
            {workOrders.map((workOrder) => (
              <div
                key={workOrder.id}
                className="grid grid-cols-12 gap-4 p-4 border-b border-border last:border-b-0 hover:bg-muted/50 cursor-pointer"
              >
                <div className="col-span-1 text-sm">{workOrder.id}</div>
                <div className="col-span-3 font-medium">{workOrder.title}</div>
                <div className="col-span-2">
                  <Badge variant="outline" className="text-xs">
                    {workOrder.status}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <Badge
                    variant={
                      workOrder.priority === "High"
                        ? "destructive"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {workOrder.priority}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={workOrder.assignedTo.avatar} />
                      <AvatarFallback>
                        {workOrder.assignedTo.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{workOrder.assignedTo.name}</span>
                  </div>
                </div>
                <div className="col-span-2 text-sm">{workOrder.dueDate}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
