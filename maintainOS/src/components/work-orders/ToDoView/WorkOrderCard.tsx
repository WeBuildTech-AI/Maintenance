"use client";
/* eslint-disable @next/next/no-img-element */

export function WorkOrderCard({
  wo,
  selectedWorkOrder,
  onSelectWorkOrder,
  safeAssignee,
  getInitials,
  activeTab,
}: any) {
  const assignee = safeAssignee(wo);
  const avatarUrl =
    assignee?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      assignee?.fullName || assignee?.name || "User"
    )}`;
  const assigneeName = assignee?.fullName || assignee?.name || "Unassigned";
  const isSelected = selectedWorkOrder?.id === wo.id;

  const renderStatusBadge = (status: string) => {
    const normalized = status?.toLowerCase();
    if (normalized === "completed" || normalized === "done")
      return (
        <span className="inline-flex items-center rounded border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
          ✓ Done
        </span>
      );
    if (normalized === "in progress")
      return (
        <span className="inline-flex items-center rounded border border-orange-200 bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
          In Progress
        </span>
      );
    return (
      <span className="inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium">
        {status || "N/A"}
      </span>
    );
  };

  const priorityStyles: Record<string, string> = {
    High: "bg-red-100 text-red-700 border-red-200",
    Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Low: "bg-orange-100 text-orange-700 border-orange-200",
    Daily: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <div
      onClick={() => onSelectWorkOrder(wo)}
      className={`cursor-pointer border rounded shadow-sm hover:shadow transition ${
        isSelected ? "border-primary" : "border"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar wrapper */}
          <div
            className={`h-12 w-12 flex items-center justify-center rounded-full border ${
              isSelected
                ? "border-primary bg-primary/10"
                : "border-muted bg-muted/40"
            }`}
          >
            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={assigneeName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs">
                  {getInitials(assigneeName)}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-sm text-foreground">
                  {wo.title || "Untitled Work Order"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeTab === "done" ? "Completed by" : "Assigned to"}{" "}
                  {assigneeName}
                </p>
              </div>
              <span className="inline-flex items-center rounded border px-2 py-0.5 text-xs">
                {"WO-001"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {renderStatusBadge(wo.status)}
              <span
                className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium ${
                  priorityStyles[wo.priority] ?? ""
                }`}
              >
                ● {wo.priority || "Low"}
              </span>
              <span className="text-muted-foreground">
                Due {wo.dueDate || "—"}
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Asset: {wo.assets?.[0]?.name || "N/A"} · Location:{" "}
              {wo.location?.name || wo.location || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
