"use client";

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
  Users,
  Wrench,
  Briefcase,
  Layers,
  ClipboardList,
  Gauge,
  CheckCircle2,
  PauseCircle,
  RefreshCcw,
  Activity, 
} from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  deleteWorkOrder,
  patchWorkOrderComplete,
  markWorkOrderInProgress,
  updateWorkOrder,
  updateWorkOrderStatus
} from "../../../store/workOrders/workOrders.thunks";

import DeleteWorkOrderModal from "./DeleteWorkOrderModal";

import UpdatePartsPanel from "../panels/UpdatePartsPanel";
import TimeOverviewPanel from "../panels/TimeOverviewPanel";
import OtherCostsPanel from "../panels/OtherCostsPanel";

const renderList = (items: any[], key = "name") => {
  if (!items || !Array.isArray(items) || items.length === 0) return "—";
  return items.map((item) => item[key] || "Unknown").join(", ");
};

const safeRender = (value: any) => {
  if (!value) return null;
  if (typeof value === "string" || typeof value === "number") return value;
  if (typeof value === "object") {
    return value.name || value.title || value.fullName || value.label || "—";
  }
  return "—";
};

function formatModalDateTime(isoString: string) {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    return `${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}, ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  } catch (error) {
    return isoString;
  }
}

/* ---------------------- Recurrence parsing helpers ---------------------- */

const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function ordinal(n: number) {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

function parseRecurrenceRule(raw: any, startDateIso?: string, dueDateIso?: string) {
  if (!raw) return null;
  let rule: any = raw;
  try {
    if (typeof raw === "string") rule = JSON.parse(raw);
  } catch (e) {
    rule = raw;
  }

  if (!rule || !rule.type) return null;
  const type = String(rule.type).toLowerCase();

  if (type === "daily" || type === "day" || type === "daily_by_date") {
    return {
      title: "Repeats every day after completion of this Work Order.",
      short: "Repeats every day after completion of this Work Order."
    };
  }

  if (type === "weekly") {
    const days = Array.isArray(rule.daysOfWeek) ? rule.daysOfWeek : (rule.days || []);
    const mapped = days
      .map((d: number) => (typeof d === "number" ? dayNames[d] : String(d)))
      .filter(Boolean);
    const daysStr = mapped.length ? mapped.join(", ") : "the selected day(s)";
    return {
      title: `Repeats every week on ${daysStr} after completion of this Work Order.`,
      short: `Repeats every week on ${daysStr} after completion of this Work Order.`
    };
  }

  if (type === "monthly_by_date" || type === "monthly") {
    const dayOfMonth = rule.dayOfMonth ?? rule.day ?? null;
    if (dayOfMonth) {
      return {
        title: `Repeats every month on the ${ordinal(Number(dayOfMonth))} day of the month after completion of this Work Order.`,
        short: `Repeats every month on the ${ordinal(Number(dayOfMonth))} day of the month after completion of this Work Order.`
      };
    }
    if (startDateIso) {
      try {
        const d = new Date(startDateIso);
        const day = d.getDate();
        return {
          title: `Repeats every month on the ${ordinal(day)} day of the month after completion of this Work Order.`,
          short: `Repeats every month on the ${ordinal(day)} day of the month after completion of this Work Order.`
        };
      } catch {}
    }
    return {
      title: `Repeats every month after completion of this Work Order.`,
      short: `Repeats every month after completion of this Work Order.`
    };
  }

  if (type === "monthly_by_weekday") {
    const weekOfMonth = rule.weekOfMonth ?? rule.week ?? null;
    const weekday = rule.weekdayOfMonth ?? rule.weekday ?? null; 
    const weekLabel = weekOfMonth === 5 ? "Last" : `${ordinal(Number(weekOfMonth))}`;
    const weekdayLabel = typeof weekday === "number" ? dayNames[weekday] : weekday;
    return {
      title: `Repeats every month on the ${weekLabel} ${weekdayLabel} after completion of this Work Order.`,
      short: `Repeats every month on the ${weekLabel} ${weekdayLabel} after completion of this Work Order.`
    };
  }

  if (type === "yearly") {
    const years = rule.intervalYears ?? rule.interval ?? 1;
    let dateLabel = null;
    const iso = startDateIso ?? dueDateIso;
    if (iso) {
      try {
        const d = new Date(iso);
        const mm = String(d.getMonth() + 1).padStart(2,"0");
        const dd = String(d.getDate()).padStart(2,"0");
        dateLabel = `${mm}/${dd}`;
      } catch {}
    }
    const every = years && Number(years) > 1 ? `every ${years} years` : "every year";
    const onLabel = dateLabel ? ` on ${dateLabel}` : "";
    return {
      title: `Repeats ${every}${onLabel} after completion of this Work Order.`,
      short: `Repeats ${every}${onLabel} after completion of this Work Order.`
    };
  }

  return {
    title: `Repeats based on configured schedule.`,
    short: `Repeats based on configured schedule.`
  };
}

export function WorkOrderDetails({
  selectedWorkOrder,
  selectedAvatarUrl,
  selectedAssignee,
  activeStatus,
  setActiveStatus,
  CopyPageU,
  onEdit,
  onRefreshWorkOrders,
  onOptimisticUpdate,
  onRefreshLogs,
  activePanel,
  setActivePanel,
  // ✅ WO-401 FIX: Receive prop from parent
  onScrollToComments,
}: any) {
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const user = useSelector((state: any) => state.auth?.user);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selectedWorkOrder?.status) {
      setActiveStatus(selectedWorkOrder.status.toLowerCase());
    } else {
      setActiveStatus("open");
    }
  }, [selectedWorkOrder, setActiveStatus]);

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(selectedWorkOrder);
    } else if (selectedWorkOrder?.id) {
      navigate(`/work-orders/${selectedWorkOrder.id}/edit`);
    }
  }, [navigate, onEdit, selectedWorkOrder]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setIsDropdownOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedWorkOrder?.id) return;
    try {
      setIsDeleting(true);
      await dispatch(deleteWorkOrder(selectedWorkOrder.id)).unwrap();
      setIsDeleting(false);
      setShowDeleteModal(false);
      onRefreshWorkOrders?.();
      navigate("/work-orders");
    } catch (err: any) {
      console.error("❌ Failed to delete:", err);
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (activeStatus === newStatus) return;

    const prevStatus = activeStatus;
    setActiveStatus(newStatus);

    if (!user?.id) {
        toast.error("User not authenticated");
        setActiveStatus(prevStatus);
        return;
    }

    if (onOptimisticUpdate && selectedWorkOrder?.id) {
        onOptimisticUpdate(selectedWorkOrder.id, { status: newStatus });
    }

    try {
      if (newStatus === "done" || newStatus === "completed") {
        await dispatch(patchWorkOrderComplete(selectedWorkOrder.id)).unwrap();
        toast.success("Work order completed");
      } 
      else if (
          newStatus === "in_progress" || 
          newStatus === "on_hold" || 
          newStatus === "open"
      ) {
        await dispatch(
          updateWorkOrderStatus({
            id: selectedWorkOrder.id,
            authorId: user.id,
            status: newStatus,
          })
        ).unwrap();
        const label = newStatus.replace("_", " ");
        toast.success(`Status updated to ${label.charAt(0).toUpperCase() + label.slice(1)}`);
      } 
      else {
        await dispatch(
          updateWorkOrder({
            id: selectedWorkOrder.id,
            authorId: user.id,
            data: { status: newStatus as any },
          })
        ).unwrap();
        const label = newStatus.replace("_", " ");
        toast.success(`Status updated to ${label.charAt(0).toUpperCase() + label.slice(1)}`);
      }

      if (onRefreshWorkOrders) {
        onRefreshWorkOrders();
      }

      if (onRefreshLogs) {
        onRefreshLogs();
      }

    } catch (error: any) {
      console.error("Status update failed", error);
      toast.error(error?.message || "Failed to update status");
      setActiveStatus(prevStatus);
    }
  };

  if (activePanel === "parts") {
    return (
      <UpdatePartsPanel
        onCancel={() => setActivePanel("details")}
        workOrderId={selectedWorkOrder?.id}
        selectedWorkOrder={selectedWorkOrder}
        // ✅ ADDED: Refresh handler for realtime updates
        onSaveSuccess={() => {
            if (onRefreshWorkOrders) onRefreshWorkOrders();
            if (onRefreshLogs) onRefreshLogs();
            setActivePanel("details");
        }}
      />
    );
  }

  if (activePanel === "time") {
    return (
      <TimeOverviewPanel
        onCancel={() => setActivePanel("details")}
        workOrderId={selectedWorkOrder?.id}
        selectedWorkOrder={selectedWorkOrder}
        // ✅ ADDED: Refresh handler for realtime updates
        onSaveSuccess={() => {
            if (onRefreshWorkOrders) onRefreshWorkOrders();
            if (onRefreshLogs) onRefreshLogs();
            setActivePanel("details");
        }}
      />
    );
  }

  if (activePanel === "cost") {
    return (
      <OtherCostsPanel
        onCancel={() => setActivePanel("details")}
        workOrderId={selectedWorkOrder?.id}
        selectedWorkOrder={selectedWorkOrder}
        // ✅ ADDED: Refresh handler for realtime updates
        onSaveSuccess={() => {
            if (onRefreshWorkOrders) onRefreshWorkOrders();
            if (onRefreshLogs) onRefreshLogs();
            setActivePanel("details");
        }}
      />
    );
  }

  const assigneesList = selectedWorkOrder.assignees || [];
  if (assigneesList.length === 0 && selectedWorkOrder.assignedTo) {
    assigneesList.push(selectedWorkOrder.assignedTo);
  }

  const recurrenceParsed = parseRecurrenceRule(
    selectedWorkOrder.recurrenceRule,
    selectedWorkOrder.startDate,
    selectedWorkOrder.dueDate
  );
  const originTitle = selectedWorkOrder?.title || null;
  const originId = selectedWorkOrder?.id || null;

  return (
    <>
      <div className="p-6 border-b border-border relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-medium">
              {selectedWorkOrder?.title || "Untitled Work Order"}
            </h2>
            {CopyPageU && <CopyPageU />}
          </div>

          <div className="flex items-center gap-2 relative">
            {/* ✅ WO-401 FIX: onClick scrolls to internal comments */}
            <button 
              className="inline-flex items-center rounded border px-2 py-1.5 text-sm hover:bg-muted"
              onClick={onScrollToComments} 
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments
            </button>

            <button
              className="inline-flex items-center rounded border px-2 py-1.5 text-sm hover:bg-muted"
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>

            <button
              ref={buttonRef}
              onClick={() => setIsDropdownOpen((p) => !p)}
              className="inline-flex items-center rounded p-2 hover:bg-muted relative"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {isDropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-56 mt-2"
                style={{ right: 0, top: "40px" }}
              >
                <ul className="text-sm text-gray-700">
                  <li
                    onClick={() => alert("Mark as unread")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Mark as unread
                  </li>
                  <li
                    onClick={() => alert("Copy to new work order")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Copy to New Work Order
                  </li>
                  <li
                    onClick={() => alert("Save as Template")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Save as Work Order Template
                  </li>
                  <li
                    onClick={() => alert("Export to PDF")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Export to PDF
                  </li>
                  <li
                    onClick={() => alert("Email to Vendors")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Email to Vendors
                  </li>
                  <hr className="my-1 border-gray-200" />
                  <li
                    onClick={handleDeleteClick}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    Delete
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            Due by {selectedWorkOrder.dueDate ? new Date(selectedWorkOrder.dueDate).toLocaleDateString() : "N/A"}
          </span>
        </div>
      </div>

      <DeleteWorkOrderModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />

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
          <div className="flex items-start justify-between gap-6 border rounded-lg p-4 bg-white sm:flex-row flex-col" role="group">
            <div className="flex gap-4">
              {[
                { key: "open", label: "Open", Icon: MessageSquare },
                { key: "on_hold", label: "On hold", Icon: PauseCircle },
                { key: "in_progress", label: "In Progress", Icon: Clock },
                { key: "done", label: "Done", Icon: CheckCircle2 },
              ].map(({ key, label, Icon }) => {
                const currentStatus = (activeStatus || "open").toLowerCase();
                const isActive = currentStatus === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleStatusChange(key)}
                    aria-pressed={isActive}
                    disabled={isDeleting}
                    className={`h-16 w-20 rounded-lg border shadow-md inline-flex flex-col items-center justify-center gap-2 transition-all outline-none focus-visible:ring-[3px] focus-visible:border-ring ${
                      isActive
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

        <div className="flex p-6 justify-between gap-6 border-t pt-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Due Date</h3>
            <p className="text-sm text-muted-foreground">
              {selectedWorkOrder.dueDate ? new Date(selectedWorkOrder.dueDate).toLocaleDateString() : "N/A"}
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

        <div className="border-t p-6">
          <h3 className="text-sm font-medium mb-2">Assigned To</h3>
          <div className="flex flex-wrap gap-3">
            {assigneesList.length > 0 ? (
              assigneesList.map((assignee: any, index: number) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                    <div className="h-6 w-6 rounded-full overflow-hidden bg-gray-200 border border-gray-300">
                      <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-600">
                        {(assignee.fullName || assignee.name || "U").charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <span className="text-sm text-gray-800">
                      {assignee.fullName || assignee.name || "Unknown"}
                    </span>
                </div>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Unassigned</span>
            )}
          </div>
        </div>

        <div className="border-t p-6">
          <h3 className="text-sm font-medium mb-2">Description</h3>
          <p className="text-sm text-muted-foreground">
            {selectedWorkOrder?.description || "No description provided."}
          </p>
        </div>

        <div className="border-t p-6 grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Assets</h3>
            <div className="flex items-start gap-2">
              <Factory className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-sm">
                 {renderList(selectedWorkOrder.assets, "name")}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Location</h3>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {selectedWorkOrder.location?.name || selectedWorkOrder.location || "N/A"}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Estimated Time</h3>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {selectedWorkOrder.estimatedTimeHours ? `${selectedWorkOrder.estimatedTimeHours}h` : "N/A"}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Work Type</h3>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {selectedWorkOrder.workType || "N/A"}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Teams</h3>
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-sm">
                {renderList(selectedWorkOrder.teams, "name")}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Vendors</h3>
            <div className="flex items-start gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-sm">
                {renderList(selectedWorkOrder.vendors, "name")}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Parts</h3>
            <div className="flex items-start gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-sm">
                {renderList(selectedWorkOrder.parts, "name")}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Categories</h3>
            <div className="flex items-start gap-2">
              <Layers className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-sm">
                {renderList(selectedWorkOrder.categories, "name")}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Procedures</h3>
            <div className="flex items-start gap-2">
              <ClipboardList className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-sm">
                {renderList(selectedWorkOrder.procedures, "title")}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Meters</h3>
            <div className="flex items-start gap-2">
              <Gauge className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-sm">
                {renderList(selectedWorkOrder.meters, "name")}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t p-6">
          <h3 className="text-sm font-medium mb-2">Schedule conditions</h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-muted-foreground">
              This Work Order will repeat based on time.
            </span>
          </div>

          <div className="flex items-start gap-3">
            <div style={{ minWidth: 24 }}>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex-1">
              <div className="text-sm text-gray-800 mb-2">
                {recurrenceParsed ? recurrenceParsed.title : "Does not repeat"}
              </div>

              {originTitle && (
                <div className="text-sm mt-1">
                  <span className="text-muted-foreground">Automatically created from </span>
                  <a
                    href={originId ? `/procedures/${originId}` : "#"}
                    className="text-blue-600 underline"
                    onClick={(e) => {
                      e.preventDefault(); 
                    }}
                  >
                    {originTitle}
                  </a>
                  {selectedWorkOrder.dueDate && (
                    <span className="text-muted-foreground"> (due {new Date(selectedWorkOrder.dueDate).toLocaleDateString()})</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t p-6">
          <h3 className="text-2xl font-medium mb-2">Time & Cost Tracking</h3>
          {["Parts", "Time", "Other Costs"].map((label) => {
            
            // ✅ SPECIAL HANDLING FOR PARTS
            if (label === "Parts") {
                const partUsages = selectedWorkOrder?.partUsages || [];
                
                const calculatedPartTotal = partUsages.reduce(
                  (sum: number, item: any) => sum + (Number(item.totalCost) || 0), 
                  0
                );
  
                return (
                  <div key={label} className="border-b last:border-none mb-2">
                    <div className="flex justify-between items-center p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Parts</span>
                        {partUsages.length > 0 && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                            ${calculatedPartTotal.toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      <button
                        className="flex text-sm text-blue-600 items-center gap-1 hover:underline"
                        onClick={() => setActivePanel("parts")}
                      >
                        Add
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
  
                    {partUsages.length > 0 && (
                      <div className="px-3 pb-3 space-y-2">
                        {partUsages.map((usage: any) => (
                          <div 
                            key={usage.id} 
                            className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm shadow-sm"
                          >
                            <div className="mb-2">
                              <div className="font-semibold text-gray-900 flex items-center gap-2">
                                  <Wrench className="h-3 w-3 text-gray-500"/>
                                  {usage.part?.name || "Unknown Part"}
                              </div>
                              <div className="text-xs text-gray-500 ml-5 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {usage.location?.name || "No Location"}
                              </div>
                            </div>
  
                            <div className="grid grid-cols-3 gap-2 bg-white rounded border border-gray-100 p-2 text-xs">
                              <div className="flex flex-col">
                                  <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Qty</span>
                                  <span className="font-medium text-gray-700">{usage.quantity}</span>
                              </div>
                              <div className="flex flex-col border-l pl-2">
                                  <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Unit Cost</span>
                                  <span className="font-medium text-gray-700">${Number(usage.unitCost).toFixed(2)}</span>
                              </div>
                              <div className="flex flex-col text-right border-l pl-2">
                                  <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Total</span>
                                  <span className="font-bold text-green-700">${Number(usage.totalCost).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

            // ✅ SPECIAL HANDLING FOR TIME
            if (label === "Time") {
                const timeEntries = selectedWorkOrder?.timeEntries || [];
                const totalEntries = timeEntries.length;
                const totalMinutes = timeEntries.reduce((acc: number, t: any) => acc + (Number(t.minutes) || 0) + (Number(t.hours) || 0) * 60, 0);
                const h = Math.floor(totalMinutes / 60);
                const m = totalMinutes % 60;
                const displayValue = `${h}h ${m}m`;

                return (
                    <div key={label} className="flex justify-between items-center p-3 mb-2 border-b last:border-none">
                        <span className="text-sm font-medium">{label}</span>
                        {totalEntries === 0 ? (
                            <button
                                className="flex text-sm text-muted-foreground items-center gap-1"
                                onClick={() => setActivePanel("time")}
                            >
                                Add
                                <ChevronRight className="h-4 w-4 font-muted-foreground" />
                            </button>
                        ) : (
                            <div className="flex flex-col items-end justify-end leading-tight">
                                <div className="flex items-end gap-1">
                                    <button
                                        className="flex items-end text-blue-600 text-sm font-medium gap-1"
                                        onClick={() => setActivePanel("time")}
                                    >
                                        <span className="relative" style={{ top: "1px" }}>
                                            {totalEntries} entries
                                        </span>
                                        <ChevronRight
                                            className="h-4 w-4 text-blue-600"
                                            style={{ position: "relative", top: "2px", marginLeft: "4px" }}
                                        />
                                    </button>
                                </div>
                                <p className="text-sm font-semibold text-gray-900" style={{ lineHeight: "1.1", marginTop: "5px" }}>
                                    {displayValue}
                                </p>
                            </div>
                        )}
                    </div>
                );
            }

            // --- OTHER COSTS (Default Fallback) ---
            const isOtherCosts = label === "Other Costs";
            const otherCosts = selectedWorkOrder?.otherCosts || [];
            const totalEntries = otherCosts.length;
            const totalAmount = otherCosts.reduce(
              (sum: number, c: any) => sum + (Number(c.amount ?? c.cost ?? 0) || 0),
              0
            );

            return (
              <div
                key={label}
                className="flex justify-between items-center p-3 mb-2 border-b last:border-none"
              >
                <span className="text-sm font-medium">{label}</span>

                {!isOtherCosts || totalEntries === 0 ? (
                  <button
                    className="flex text-sm text-muted-foreground items-center gap-1"
                    onClick={() => setActivePanel("cost")}
                  >
                    Add
                    <ChevronRight className="h-4 w-4 font-muted-foreground" />
                  </button>
                ) : (
                  <div className="flex flex-col items-end justify-end leading-tight">
                    <div className="flex items-end gap-1">
                      <button
                        className="flex items-end text-blue-600 text-sm font-medium gap-1"
                        onClick={() => setActivePanel("cost")}
                      >
                        <span className="relative" style={{ top: "1px" }}>
                          {totalEntries} entries
                        </span>
                        <ChevronRight
                          className="h-4 w-4 text-blue-600"
                          style={{
                            position: "relative",
                            top: "2px",
                            marginLeft: "4px",
                          }}
                        />
                      </button>
                    </div>
                    <p
                      className="text-sm font-semibold text-gray-900"
                      style={{
                        lineHeight: "1.1",
                        marginTop: "5px",
                      }}
                    >
                      ${totalAmount.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t p-6">
          <div className="flex items-center text-xs">
            <span>Created By</span>
            <div className="ml-2 mr-2 h-6 w-6 inline-flex rounded-full overflow-hidden bg-gray-100">
              <img
                src={selectedAvatarUrl}
                alt={selectedWorkOrder.createdBy || "Creator"}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <span>
              {selectedWorkOrder.createdBy || "System"}
            </span>
            <span className="mx-2">on</span>
            <span>{formatModalDateTime(selectedWorkOrder.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Updated On</span>
            <span className="text-xs">
              {formatModalDateTime(selectedWorkOrder.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}