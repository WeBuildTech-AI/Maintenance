"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useRef, useEffect } from "react";
import {
  Lock,
  PauseCircle,
  RefreshCcw,
  CheckCircle2,
  ChevronDown
} from "lucide-react";

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

  // --- Status Dropdown Logic ---
  const [statusOpen, setStatusOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statusOptions = [
    { label: "Open", value: "open", icon: Lock, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
    { label: "On Hold", value: "on_hold", icon: PauseCircle, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
    { label: "In Progress", value: "in_progress", icon: RefreshCcw, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    { label: "Done", value: "done", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  ];

  const currentStatus =
    statusOptions.find(s => s.value === wo.status?.toLowerCase()) || statusOptions[0];
  const StatusIcon = currentStatus.icon;

  const priorityStyles: Record<string, string> = {
    High: "bg-red-100 text-red-700 border-red-200",
    Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Low: "bg-orange-100 text-orange-700 border-orange-200",
    Daily: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div
      onClick={() => onSelectWorkOrder(wo)}
      className={`cursor-pointer border rounded shadow-sm hover:shadow transition relative group ${isSelected ? "border-primary" : "border"
        }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">

          {/* Avatar */}
          <div
            className={`h-12 w-12 flex items-center justify-center rounded-full border ${isSelected
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

          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-3">


              {/* TITLE (Updated: fixed char limit + tooltip) */}
              <p
                className="font-medium text-xs text-foreground truncate max-w-[200px]"
                title={wo.title || "Untitled Work Order"}
              >
                {(() => {
                  const full = wo.title || "Untitled Work Order";
                  const limit = 25;

                  return full.length > limit ? full.substring(0, limit) + "..." : full;
                })()}
              </p>


              {/* WO Badge (Fixed overflow) */}
              <span
                className="
                  inline-flex items-center justify-center
                  rounded border px-2 py-0.5 text-xs font-medium
                  shrink-0 max-w-[80px] truncate text-center
                  bg-yellow-50 border-yellow-200 text-yellow-700
                "
                title={wo.code || "WO-001"}
              >
                {wo.code || "WO-001"}
              </span>
            </div>

            {/* Status + Priority */}
            <div className="flex items-center gap-2 text-xs flex-wrap">

              {/* Status Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusOpen(!statusOpen);
                  }}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded border ${currentStatus.bg} ${currentStatus.border} ${currentStatus.color} font-medium transition-colors hover:opacity-80`}
                >
                  <StatusIcon size={12} />
                  <span>{currentStatus.label}</span>
                  <ChevronDown size={10} className={`transition-transform ${statusOpen ? "rotate-180" : ""}`} />
                </button>

                {statusOpen && (
                  <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Update status:", option.value);
                          setStatusOpen(false);
                        }}
                        className="w-full flex flex-row items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 text-gray-700 whitespace-nowrap"
                      >
                        <option.icon size={12} className={option.color} />
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Priority */}
              <span
                className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${priorityStyles[wo.priority] ?? ""
                  }`}
              >
                ● {wo.priority || "Low"}
              </span>

              {/* Due Date */}
              <span className="text-muted-foreground">
                Due {formatDate(wo.dueDate)}
              </span>
            </div>

            {/* Asset + Location */}
            <p className="text-xs text-muted-foreground truncate">
              Asset: {wo.assets?.[0]?.name || "N/A"} · Location:{" "}
              {wo.location?.name || wo.location || "N/A"}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
