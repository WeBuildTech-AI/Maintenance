"use client";
/* eslint-disable @next/next/no-img-element */

import {
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  Clock,
  Edit,
  Factory,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Repeat,
} from "lucide-react";

import { useCallback } from "react"; // ✅ added for stable handler
import { useNavigate } from "react-router-dom"; // ✅ added

export function WorkOrderDetails({
  selectedWorkOrder,
  selectedAvatarUrl,
  selectedAssignee,
  activeStatus,
  setActiveStatus,
  CopyPageU,
  // ✅ added new optional prop for edit handler
  onEdit,
}: any) {
  const navigate = useNavigate(); // ✅ added

  // ✅ If parent doesn't handle edit, navigate directly
  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(selectedWorkOrder);
    } else if (selectedWorkOrder?.id) {
      navigate(`/work-orders/${selectedWorkOrder.id}/edit`);
    }
  }, [navigate, onEdit, selectedWorkOrder]);

  return (
    <>
      {/* HEADER */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-medium">
              {selectedWorkOrder?.title || "Untitled Work Order"}
            </h2>
            <CopyPageU />
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center rounded border px-2 py-1.5 text-sm hover:bg-muted">
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments
            </button>

            {/* ✅ connected Edit button to trigger parent handler or navigate */}
            <button
              className="inline-flex items-center rounded border px-2 py-1.5 text-sm hover:bg-muted"
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>

            <button className="inline-flex items-center rounded p-2 hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* HEADER DETAILS */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <Repeat className="h-3 w-3" />
            {selectedWorkOrder.priority} -
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            Due by {selectedWorkOrder.dueDate}
          </span>
        </div>
      </div>

      {/* DELETED WARNING */}
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

      {/* STATUS PANEL */}
      <div className="flex-1 p-6 space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-2">Status</h3>
          <div
            className="flex items-start justify-between gap-6 border rounded-lg p-4 bg-white sm:flex-row flex-col"
            role="group"
          >
            <div className="flex gap-4">
              {[
                { key: "open", label: "Open", Icon: MessageSquare },
                { key: "on_hold", label: "On hold", Icon: Edit },
                { key: "in_progress", label: "In Progress", Icon: Clock },
                { key: "done", label: "Done", Icon: CalendarDays },
              ].map(({ key, label, Icon }) => {
                const active = activeStatus === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveStatus(key)}
                    aria-pressed={active}
                    className={`h-16 w-20 rounded-lg border shadow-md inline-flex flex-col items-center justify-center gap-2 transition-all outline-none focus-visible:ring-[3px] focus-visible:border-ring ${
                      active
                        ? "bg-orange-600 text-white border-orange-600"
                        : "bg-orange-50 text-sidebar-foreground border-gray-200 hover:bg-orange-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium leading-none text-center px-2 truncate">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Due Date, Priority and Work Order Id */}
        <div className="flex p-6 justify-between gap-6 border-t pt-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Due Date</h3>
            <p className="text-sm text-muted-foreground">
              {selectedWorkOrder.dueDate || "N/A"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Priority</h3>
            <p className="text-sm text-muted-foreground">
              {selectedWorkOrder.priority || "N/A"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Work Order ID</h3>
            <p className="text-sm text-muted-foreground">
              {selectedWorkOrder.id || "N/A"}
            </p>
          </div>
        </div>

        {/* Assigned To */}
        <div className="border-t p-6">
          <h3 className="text-sm font-medium mb-2">Assigned To</h3>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full overflow-hidden bg-gray-100">
              <img
                src={selectedAvatarUrl}
                alt={selectedAssignee?.fullName || selectedAssignee?.name || "U"}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <span className="text-sm">
              {selectedAssignee?.fullName ||
                selectedAssignee?.name ||
                "Unassigned"}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="border-t p-6">
          <h3 className="text-sm font-medium mb-2">Description</h3>
          <p className="text-sm text-muted-foreground">
            {selectedWorkOrder?.description || "No description provided."}
          </p>
        </div>

        {/* Asset & Location & Estimated Time & Work Type */}
        <div className="border-t p-6 grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Asset</h3>
            <div className="flex items-center gap-2">
              <Factory className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {selectedWorkOrder.assets?.[0]?.name || "N/A"}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Location</h3>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {selectedWorkOrder.location?.name ||
                  selectedWorkOrder.location ||
                  "N/A"}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Estimated Time</h3>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {selectedWorkOrder.estimated_time || "N/A"}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Work Type</h3>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {selectedWorkOrder.work_type || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Schedule conditions */}
        <div className="border-t p-6">
          <h3 className="text-sm font-medium mb-2">Schedule conditions</h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-muted-foreground">
              This Work Order will repeat based on time.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Repeats every week on Monday after completion of this Work Order.
            </span>
          </div>
        </div>

        {/* Time & Cost Tracking */}
        <div className="border-t p-6">
          <h3 className="text-2xl font-medium mb-2">Time & Cost Tracking</h3>

          {["Parts", "Time", "Other Costs"].map((label) => (
            <div
              key={label}
              className="flex justify-between items-center p-3 mb-2 border-b last:border-none"
            >
              <span className="text-sm font-medium ">{label}</span>
              <button className="flex text-sm text-muted-foreground items-center gap-1">
                Add
                <ChevronRight className="h-4 w-4 font-muted-foreground" />
              </button>
            </div>
          ))}
        </div>

        {/* Created / Updated */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t p-6">
          <div className="flex items-center text-xs">
            <span>Created By</span>
            <div className="ml-2 mr-2 h-6 w-6 inline-flex rounded-full overflow-hidden bg-gray-100">
              <img
                src={selectedAvatarUrl}
                alt="creator"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <span>
              {selectedWorkOrder.createdBy ||
                selectedAssignee?.name ||
                "Unassigned"}
            </span>
            <span className="mx-2">on</span>
            <span>{selectedWorkOrder.createdAt || "N/A"}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Updated On</span>
            <span className="text-xs">
              {selectedWorkOrder.updatedAt || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
