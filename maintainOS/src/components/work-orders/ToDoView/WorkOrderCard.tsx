"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Lock,
  PauseCircle,
  RefreshCcw,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

// ✅ Import Store & Thunks
import type { AppDispatch } from "../../../store";
import {
  patchWorkOrderComplete,
  markWorkOrderInProgress,
  updateWorkOrder
} from "../../../store/workOrders/workOrders.thunks";
import toast from "react-hot-toast";

// Helper to generate consistent colors from strings
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};

export function WorkOrderCard({
  wo,
  selectedWorkOrder,
  onSelectWorkOrder,
  onRefresh,
}: any) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: any) => state.auth?.user);
  const isSelected = selectedWorkOrder?.id === wo.id;

  // 🧠 LOGICAL AVATAR: BASED ON TITLE (Not Assignee)
  const getTitleInitials = (title: string) => {
    if (!title) return "WO";
    const parts = title.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const titleInitials = getTitleInitials(wo.title);
  
  // Generate a soft background color based on the title so it's consistent but distinct
  // We use a fixed set of colors for better UI than random hex
  const colors = [
    "bg-red-100 text-red-700 border-red-200",
    "bg-orange-100 text-orange-700 border-orange-200",
    "bg-amber-100 text-amber-700 border-amber-200",
    "bg-green-100 text-green-700 border-green-200",
    "bg-emerald-100 text-emerald-700 border-emerald-200",
    "bg-teal-100 text-teal-700 border-teal-200",
    "bg-cyan-100 text-cyan-700 border-cyan-200",
    "bg-blue-100 text-blue-700 border-blue-200",
    "bg-indigo-100 text-indigo-700 border-indigo-200",
    "bg-violet-100 text-violet-700 border-violet-200",
    "bg-purple-100 text-purple-700 border-purple-200",
    "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
    "bg-pink-100 text-pink-700 border-pink-200",
    "bg-rose-100 text-rose-700 border-rose-200",
  ];
  
  // Simple hash function to pick a color index
  const hash = wo.title.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const colorClass = colors[hash % colors.length];

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

  // ✅ Status Handler
  const handleStatusChange = async (newStatus: string) => {
    setStatusOpen(false);
    if (wo.status === newStatus) return;

    try {
      if (newStatus === "done" || newStatus === "completed") {
        await dispatch(patchWorkOrderComplete(wo.id)).unwrap();
        toast.success("Work order completed");
      } else if (newStatus === "in_progress") {
        await dispatch(markWorkOrderInProgress(wo.id)).unwrap();
        toast.success("Work order in progress");
      } else {
        if (!user?.id) {
          toast.error("User not found. Cannot update status.");
          return;
        }
        await dispatch(
          updateWorkOrder({
            id: wo.id,
            authorId: user.id,
            data: { status: newStatus as any },
          })
        ).unwrap();
        toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
      }

      if (onRefresh) {
        onRefresh();
      }

    } catch (error: any) {
      console.error("Failed to update status:", error);
      toast.error(typeof error === "string" ? error : "Failed to update status");
    }
  };

  return (
    <div
      onClick={() => onSelectWorkOrder(wo)}
      className={`cursor-pointer border rounded shadow-sm hover:shadow transition relative group ${isSelected ? "border-primary bg-blue-50/30" : "border-gray-200 bg-white"
        }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">

          {/* ✅ LOGICAL AVATAR: TITLE INITIALS */}
          <div className="relative flex-shrink-0">
            <div
              className={`h-10 w-10 flex items-center justify-center rounded-full border overflow-hidden shadow-sm ${colorClass}`}
            >
              <span className="text-xs font-bold leading-none">
                {titleInitials}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              {/* TITLE */}
              <p
                className="font-medium text-sm text-gray-900 truncate leading-tight"
                title={wo.title || "Untitled Work Order"}
              >
                {wo.title || "Untitled Work Order"}
              </p>

              {/* WO Badge */}
              {wo.code && (
                <span className="flex-shrink-0 inline-flex items-center justify-center rounded border px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 border-gray-200">
                  {wo.code}
                </span>
              )}
            </div>

            {/* Status + Priority */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusOpen(!statusOpen);
                  }}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium transition-colors ${currentStatus.bg} ${currentStatus.border} ${currentStatus.color} hover:opacity-90`}
                >
                  <StatusIcon size={12} />
                  <span>{currentStatus.label}</span>
                  <ChevronDown size={10} className={`transition-transform opacity-70 ${statusOpen ? "rotate-180" : ""}`} />
                </button>

                {statusOpen && (
                  <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-xl z-50 py-1">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(option.value);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 text-gray-700 whitespace-nowrap transition-colors"
                      >
                        <option.icon size={12} className={option.color} />
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Priority */}
              {wo.priority && wo.priority !== "None" && (
                <span
                  className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium border ${priorityStyles[wo.priority] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}
                >
                  {wo.priority}
                </span>
              )}

              {/* Due Date */}
              {wo.dueDate && (
                <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                  Due {formatDate(wo.dueDate)}
                </span>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}