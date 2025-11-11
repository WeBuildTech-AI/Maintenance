import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";

import { type ListViewProps } from "./types";

export function ListView({ workOrders }: ListViewProps) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        <div className="bg-card rounded-lg border">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-border text-sm font-medium text-muted-foreground">
            <div className="col-span-1">ID</div>
            <div className="col-span-3">Title</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-2">Assigned To</div>
            <div className="col-span-2">Due Date</div>
          </div>
          {workOrders.map((workOrder) => {
            // ✅ --- FIX START ---
            // 1. Safely get the assignee from the 'assignees' array,
            //    falling back to 'assignedTo' for safety.
            const assignee = workOrder.assignees?.[0] || workOrder.assignedTo;

            // 2. Create a "safe" object to use, defaulting to "Unassigned"
            //    if no one is assigned. This prevents the crash.
            const safeAssignee = assignee || { name: "Unassigned", avatar: null };

            // 3. Use the safe data to get the name, avatar, and fallback.
            const assigneeName = safeAssignee.name;
            const avatarUrl = safeAssignee.avatar;
            const fallback = (assigneeName || "U") // Use "U" if name is also missing
              .split(" ")
              .map((n) => n[0])
              .join("");
            // ✅ --- FIX END ---

            return (
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
                      workOrder.priority === "High" ? "destructive" : "secondary"
                    }
                    className="text-xs"
                  >
                    {workOrder.priority}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      {/* ✅ 4. Use the new safe variables */}
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback>{fallback}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{assigneeName}</span>
                  </div>
                </div>
                <div className="col-span-2 text-sm">{workOrder.dueDate}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}