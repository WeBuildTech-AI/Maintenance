"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Lock,
  PauseCircle,
  RefreshCcw,
  CheckCircle2,
  ChevronDown,
  AlertCircle
} from "lucide-react";

import type { AppDispatch } from "../../../store";
import {
  patchWorkOrderComplete,
  markWorkOrderInProgress,
  updateWorkOrder,
  updateWorkOrderStatus // ✅ Import new thunk
} from "../../../store/workOrders/workOrders.thunks";
import toast from "react-hot-toast";

export function WorkOrderCard({
  wo,
  selectedWorkOrder,
  onSelectWorkOrder,
  onRefresh,
}: any) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: any) => state.auth?.user);
  const isSelected = selectedWorkOrder?.id === wo.id;

  const getTitleInitials = (title: string) => {
    if (!title) return "WO";
    const parts = title.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const titleInitials = getTitleInitials(wo.title);
  
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
  
  const hash = wo.title.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const colorClass = colors[hash % colors.length];

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

  // Removed formatDate helper as it is no longer used for Due Date display in this card

  const isOverdue = useMemo(() => {
    if (!wo.dueDate) return false;
    if (wo.status === "done" || wo.status === "completed") return false;
    
    const due = new Date(wo.dueDate);
    const now = new Date();
    return due < now; 
  }, [wo.dueDate, wo.status]);

  const handleStatusChange = async (newStatus: string) => {
    setStatusOpen(false);
    if (wo.status === newStatus) return;

    if (!user?.id) {
        toast.error("User not found. Cannot update status.");
        return;
    }

    try {
      if (newStatus === "done" || newStatus === "completed") {
        await dispatch(patchWorkOrderComplete(wo.id)).unwrap();
        toast.success("Work order completed");
      } 
      // ✅ Use New Status API
      else if (
          newStatus === "in_progress" || 
          newStatus === "on_hold" || 
          newStatus === "open"
      ) {
        await dispatch(
            updateWorkOrderStatus({
                id: wo.id,
                authorId: user.id,
                status: newStatus
            })
        ).unwrap();
        toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
      }
      else {
        // Fallback
         await dispatch(
          updateWorkOrder({
            id: wo.id,
            authorId: user.id,
            data: { status: newStatus as any },
          })
        ).unwrap();
        toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
      }

      // ✅ Force Refresh immediately after successful API call
      if (onRefresh) {
        onRefresh();
      }

    } catch (error: any) {
      console.error("Failed to update status:", error);
      toast.error(typeof error === "string" ? error : "Failed to update status");
    }
  };

  const assignees = wo.assignees || [];
  const displayAssignees = assignees.slice(0, 3);
  const remainingAssignees = assignees.length - 3;

  const formatPriority = (priority?: string) => {
    if (!priority) return null;
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };


  return (
    <div
      onClick={() => onSelectWorkOrder(wo)}
      className={`cursor-pointer border rounded shadow-sm hover:shadow transition relative group ${isSelected ? "border-primary bg-blue-50/30" : "border-gray-200 bg-white"
        }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">

          <div className="relative flex-shrink-0">
            <div
              className={`h-10 w-10 flex items-center justify-center rounded-full border overflow-hidden shadow-sm ${colorClass}`}
            >
              <span className="text-xs font-bold leading-none">
                {titleInitials}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p
                className="font-medium text-sm text-gray-900 truncate leading-tight"
                title={wo.title || "Untitled Work Order"}
              >
                {wo.title || "Untitled Work Order"}
              </p>

              {wo.code && (
                <span className="flex-shrink-0 inline-flex items-center justify-center rounded border px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 border-gray-200">
                  {wo.code}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
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

              {wo.priority && wo.priority !== "None" && (
                <span
                  className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium border ${priorityStyles[wo.priority] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}
                >
                {formatPriority(wo.priority)}
                </span>
              )}

              {isOverdue && (
                <span className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-red-100 text-red-700 border border-red-200 ml-auto">
                    <AlertCircle size={10} /> Overdue
                </span>
              )}

              {!isOverdue && assignees.length > 0 && (
                  <div className="flex items-center -space-x-2 ml-auto">
                     {displayAssignees.map((u: any, i: number) => (
                         <div 
                            key={u.id || i} 
                            className="w-6 h-6 rounded-full border border-white bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-600 overflow-hidden"
                            title={u.fullName || u.name}
                         >
                             {u.avatar ? (
                                 <img src={u.avatar} alt={u.fullName} className="w-full h-full object-cover" />
                             ) : (
                                 (u.fullName || u.name || "?")[0].toUpperCase()
                             )}
                         </div>
                     ))}
                     {remainingAssignees > 0 && (
                         <div className="w-6 h-6 rounded-full border border-white bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600">
                            +{remainingAssignees}
                         </div>
                     )}
                  </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}