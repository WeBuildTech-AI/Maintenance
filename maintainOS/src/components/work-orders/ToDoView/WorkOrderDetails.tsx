"use client";

import {
  AlertTriangle,
  CalendarDays,
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
  UserCircle2,
} from "lucide-react";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  deleteWorkOrder,
  patchWorkOrderComplete,
  updateWorkOrder,
  updateWorkOrderStatus,
} from "../../../store/workOrders/workOrders.thunks";

import { workOrderService } from "../../../store/workOrders/workOrders.service";
import { formatDate } from "./../../utils/dateUtils";

import DeleteWorkOrderModal from "./DeleteWorkOrderModal";
import UpdatePartsPanel from "../panels/UpdatePartsPanel";
import TimeOverviewPanel from "../panels/TimeOverviewPanel";
import OtherCostsPanel from "../panels/OtherCostsPanel";
import { Tooltip } from "../../ui/tooltip";


// --- Helper Functions ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDurationDetailed = (totalMinutes: number) => {
  if (!totalMinutes) return "0h 0m 00s";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  const seconds = 0;
  return `${hours}h ${minutes}m ${seconds.toString().padStart(2, "0")}s`;
};


const formatText = (value?: string) => {
  if (!value) return "N/A";
  return value.charAt(0).toUpperCase() + value.slice(1);
};//upper case first letter of  priority

const formatDecimalHoursToDisplay = (hours: any) => {
  if (hours === undefined || hours === null || hours === "") return "N/A";
  const num = Number(hours);
  if (isNaN(num)) return "N/A";
  
  const h = Math.floor(num);
  const m = Math.round((num - h) * 60);
  
  if (h === 0 && m === 0) return "0h 0m";
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};
const renderClickableList = (
  items: any[],
  navigate: any,
  linkGenerator: (id: string) => string,
  key = "name"
) => {
  if (!items || !Array.isArray(items) || items.length === 0) return "—";
  return items.map((item, i) => (
    <span key={item.id || i}>
      <span
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          navigate(linkGenerator(item.id));
        }}
        className="text-blue-600 hover:underline cursor-pointer"
      >
        {item[key] || "Unknown"}
      </span>
      {i < items.length - 1 && ", "}
    </span>
  ));
};

const renderAssetList = (assets: any[], navigate: any) => {
  if (!assets || !Array.isArray(assets) || assets.length === 0) return "—";
  return (
    <div className="flex flex-col gap-2">
      {assets.map((asset, i) => (
        <div key={asset.id || i} className="flex flex-col">
          <span
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/assets?assetId=${asset.id}`);
            }}
            className="text-blue-600 hover:underline cursor-pointer font-medium"
          >
            {asset.name || "Unknown Asset"}
          </span>
          {asset.status && (
            <div className="mt-1 flex items-center">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                asset.status.toLowerCase() === 'online' 
                  ? 'bg-green-100 text-green-700' 
                  : asset.status.toLowerCase() === 'offline' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {asset.status === 'doNotTrack' ? 'Not Tracked' : asset.status.charAt(0).toUpperCase() + asset.status.slice(1).replace("_", " ")}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const renderList = (items: any[], key = "name") => {
  if (!items || !Array.isArray(items) || items.length === 0) return "—";
  return items.map((item) => item[key] || "Unknown").join(", ");
};

function parseRecurrenceRule(raw: any, startDateIso?: string, dueDateIso?: string) {
  if (!raw) return null;
  let rule: any = raw;
  try { if (typeof raw === "string") rule = JSON.parse(raw); } catch (e) { rule = raw; }
  if (!rule || !rule.type) return null;
  
  const type = String(rule.type).toLowerCase();
  if (type.includes("daily")) return { title: "Repeats daily.", short: "Daily" };
  if (type.includes("weekly")) return { title: "Repeats weekly.", short: "Weekly" };
  if (type.includes("monthly")) return { title: "Repeats monthly.", short: "Monthly" };
  if (type.includes("yearly")) return { title: "Repeats yearly.", short: "Yearly" };
  
  return { title: "Repeats based on schedule.", short: "Custom" };
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
  activePanel,
  setActivePanel,
  onScrollToComments,
  onStatusChangeSuccess,
  onScrollToProcedure,
}: any) {
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const user = useSelector((state: any) => state.auth?.user);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [createdByName, setCreatedByName] = useState<string>("System");
  const [updatedByName, setUpdatedByName] = useState<string>("System");

  // Financials Calculation
  const financials = useMemo(() => {
    if (!selectedWorkOrder) return { partsCost: 0, timeCost: 0, otherCost: 0, totalCost: 0, totalMinutes: 0 };

    const parts = selectedWorkOrder.partUsages || [];
    const partsCost = parts.reduce((sum: number, p: any) => sum + (Number(p.totalCost) || Number(p.unitCost) * Number(p.quantity) || 0), 0);

    const timeEntries = selectedWorkOrder.timeEntries || [];
    const totalMinutes = timeEntries.reduce((acc: number, t: any) => acc + (Number(t.minutes) || 0) + (Number(t.hours) || 0) * 60, 0);
    const timeCost = timeEntries.reduce((sum: number, t: any) => {
      const duration = (Number(t.hours) || 0) + (Number(t.minutes) || 0) / 60;
      return sum + duration * (Number(t.hourlyRate) || 0);
    }, 0);

    const otherCosts = selectedWorkOrder.otherCosts || [];
    const otherCost = otherCosts.reduce((sum: number, c: any) => sum + (Number(c.amount || c.cost) || 0), 0);

    return { partsCost, timeCost, otherCost, totalCost: partsCost + timeCost + otherCost, totalMinutes };
  }, [selectedWorkOrder]);

  useEffect(() => {
    if (selectedWorkOrder?.status) setActiveStatus(selectedWorkOrder.status.toLowerCase());
    else setActiveStatus("open");
  }, [selectedWorkOrder, setActiveStatus]);

  const handleEdit = useCallback(() => {
    if (onEdit) onEdit(selectedWorkOrder);
    else if (selectedWorkOrder?.id) navigate(`/work-orders/${selectedWorkOrder.id}/edit`);
  }, [navigate, onEdit, selectedWorkOrder]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Assignee Logic
  const assigneesList = selectedWorkOrder.assignees || [];
  if (assigneesList.length === 0 && selectedWorkOrder.assignedTo) {
    assigneesList.push(selectedWorkOrder.assignedTo);
  }

  // User Name Fetching
  useEffect(() => {
    const fetchName = async (userId: string | undefined, setFn: (s: string) => void) => {
      if (!userId) { setFn("System"); return; }
      const inAssignees = assigneesList.find((a: any) => a.id === userId);
      if (inAssignees) { setFn(inAssignees.fullName || inAssignees.name); return; }
      try {
        const userData = await workOrderService.fetchUserById(userId);
        setFn(userData.fullName || "Unknown");
      } catch (error) { setFn("Unknown"); }
    };
    fetchName(selectedWorkOrder.createdBy, setCreatedByName);
    fetchName(selectedWorkOrder.updatedBy, setUpdatedByName);
  }, [selectedWorkOrder.createdBy, selectedWorkOrder.updatedBy, assigneesList]);

  const handleDeleteClick = () => { setShowDeleteModal(true); setIsDropdownOpen(false); };

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

  const [isShaking, setIsShaking] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (activeStatus === newStatus) return;
    const prevStatus = activeStatus;
    setActiveStatus(newStatus);

    if (!user?.id) { toast.error("User not authenticated"); setActiveStatus(prevStatus); return; }

    if (onOptimisticUpdate && selectedWorkOrder?.id) {
      onOptimisticUpdate(selectedWorkOrder.id, { status: newStatus });
    }

    try {
      if (newStatus === "done" || newStatus === "completed") {
        await dispatch(patchWorkOrderComplete(selectedWorkOrder.id)).unwrap();
        toast.success("Work order completed");
      } else if (["in_progress", "on_hold", "open"].includes(newStatus)) {
        await dispatch(updateWorkOrderStatus({ id: selectedWorkOrder.id, authorId: user.id, status: newStatus })).unwrap();
        toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
      } else {
        await dispatch(updateWorkOrder({ id: selectedWorkOrder.id, authorId: user.id, data: { status: newStatus as any } })).unwrap();
        toast.success(`Status updated`);
      }

      if (onStatusChangeSuccess) onStatusChangeSuccess();

      if (onRefreshWorkOrders) onRefreshWorkOrders();

    } catch (error: any) {
      console.error("Status update failed", error);
      
      const errorMessage = 
        (typeof error === 'string' && error) ||
        error?.message || 
        error?.data?.message || 
        error?.response?.data?.message || 
        "";

      // Matches: "Required procedure fields are missing"
      if (
        errorMessage === "Required procedure fields are missing" || 
        errorMessage.includes("Required procedure fields are missing")
      ) {
         // 1. Toast
         toast.error("Complete Required Procedure Fields");
         
         // 2. Vibrate
         if (navigator.vibrate) {
            navigator.vibrate(200);
         }

         // 3. Shake Button
         setIsShaking(true);
         setTimeout(() => setIsShaking(false), 500);

         // 4. Scroll to Procedure
         if (onScrollToProcedure) {
          onScrollToProcedure();
         }

      } else {
         toast.error(errorMessage || "Failed to update status");
      }
      
      setActiveStatus(prevStatus);
    }
  };

  // --- Panels ---
  if (activePanel === "parts") {
    return <UpdatePartsPanel onCancel={() => setActivePanel("details")} workOrderId={selectedWorkOrder?.id} selectedWorkOrder={selectedWorkOrder} onSaveSuccess={() => { if (onRefreshWorkOrders) onRefreshWorkOrders(); setActivePanel("details"); }} />;
  }
  if (activePanel === "time") {
    return <TimeOverviewPanel onCancel={() => setActivePanel("details")} workOrderId={selectedWorkOrder?.id} selectedWorkOrder={selectedWorkOrder} onSaveSuccess={() => { if (onRefreshWorkOrders) onRefreshWorkOrders(); setActivePanel("details"); }} />;
  }
  if (activePanel === "cost") {
    return <OtherCostsPanel onCancel={() => setActivePanel("details")} workOrderId={selectedWorkOrder?.id} selectedWorkOrder={selectedWorkOrder} onSaveSuccess={() => { if (onRefreshWorkOrders) onRefreshWorkOrders(); setActivePanel("details"); }} />;
  }

  const recurrenceParsed = parseRecurrenceRule(selectedWorkOrder.recurrenceRule, selectedWorkOrder.startDate, selectedWorkOrder.dueDate);
  const originTitle = selectedWorkOrder?.title || null;
  const originId = selectedWorkOrder?.id || null;

  return (
    <>
      <div className="p-6 border-b border-border relative">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-medium">{selectedWorkOrder?.title || "Untitled Work Order"}</h2>
            <Tooltip text="Copy Link">
              <CopyPageU oonClick={() => { const url = `${window.location.origin}/work-orders/${selectedWorkOrder?.id}`; navigator.clipboard.writeText(url); toast.success("Link copied!"); }} />
            </Tooltip>
          </div>
          <div className="flex items-center gap-2 relative">
            <button className="inline-flex items-center rounded border px-2 py-1.5 text-sm hover:bg-muted" onClick={onScrollToComments}>
              <MessageSquare className="h-4 w-4 mr-2" /> Comments
            </button>
            <button className="inline-flex items-center rounded border px-2 py-1.5 text-sm hover:bg-muted" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" /> Edit
            </button>
            <button ref={buttonRef} onClick={() => setIsDropdownOpen((p) => !p)} className="inline-flex items-center rounded p-2 hover:bg-muted relative">
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {isDropdownOpen && (
              <div ref={dropdownRef} className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-56 mt-2" style={{ right: 0, top: "40px" }}>
                <ul className="text-sm text-gray-700">
                  <li onClick={() => alert("Mark as unread")} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Mark as unread</li>
                  <li onClick={() => alert("Copy to new work order")} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Copy to New Work Order</li>
                  <li onClick={handleDeleteClick} className="px-4 py-2 text-red-600 hover:bg-red-50 cursor-pointer border-t">Delete</li>
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Due by {formatDate(selectedWorkOrder.dueDate)}</span>
        </div>
      </div>

      <DeleteWorkOrderModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleConfirmDelete} />


      {selectedWorkOrder.wasDeleted && (
        <div className="mx-6 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Work Order was deleted.</p>
            {selectedWorkOrder.deletedDate && <p className="text-sm text-destructive/80">Deleted on {selectedWorkOrder.deletedDate}</p>}
          </div>
        </div>
      )}

      <div className="flex-1 p-6 space-y-6">
        {/* Status Buttons */}
        <div>
          <h3 className="text-sm font-medium mb-2">Status</h3>
          <div className="flex items-start justify-between gap-6 border rounded-lg p-4 bg-white sm:flex-row flex-col">
            <div className="flex gap-4">
              {[{ key: "open", label: "Open", Icon: MessageSquare }, { key: "on_hold", label: "On hold", Icon: PauseCircle }, { key: "in_progress", label: "In Progress", Icon: Clock }, { key: "done", label: "Done", Icon: CheckCircle2 }].map(({ key, label, Icon }) => {
                const isActive = (activeStatus || "open").toLowerCase() === key;
                return (
                  <button 
                    key={key} 
                    type="button" 
                    onClick={() => handleStatusChange(key)} 
                    disabled={isDeleting} 
                    className={`h-16 w-20 rounded-lg border shadow-md inline-flex flex-col items-center justify-center gap-2 transition-all outline-none ${
                      isActive ? "bg-orange-600 text-white border-orange-600" : "bg-orange-50 text-sidebar-foreground border-gray-200 hover:bg-orange-100"
                    } ${activeStatus === key && isShaking ? "shake-animation" : ""}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium leading-none text-center px-2 truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="flex p-6 justify-between gap-6 border-t pt-6">
          <div><h3 className="text-sm font-medium mb-2">Due Date</h3><p className="text-sm text-muted-foreground">{formatDate(selectedWorkOrder.dueDate)}</p></div>
          <div><h3 className="text-sm font-medium mb-2">Priority</h3><p className="text-sm text-muted-foreground">{formatText(selectedWorkOrder.priority)}</p></div>
          <div><h3 className="text-sm font-medium mb-2">Work Order ID</h3><p className="text-sm text-muted-foreground">{selectedWorkOrder.id || "N/A"}</p></div>
        </div>

        {/* Assigned To */}
        <div className="border-t p-6">
          <h3 className="text-sm font-medium mb-2">Assigned To</h3>
          <div className="flex flex-wrap gap-3">
            {assigneesList.length > 0 ? assigneesList.map((assignee: any, index: number) => (
              <div key={index} className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                <div className="h-6 w-6 rounded-full overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600">
                  {(assignee.fullName || assignee.name || "U").charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-800">{assignee.fullName || assignee.name || "Unknown"}</span>
              </div>
            )) : <span className="text-sm text-muted-foreground">Unassigned</span>}
          </div>
        </div>

        {/* Description */}
        <div className="border-t p-6">
          <h3 className="text-sm font-medium mb-2">Description</h3>
          <p className="text-sm text-muted-foreground">{selectedWorkOrder?.description || "No description provided."}</p>
        </div>

        {/* Details Grid (Clickable) */}
        <div className="border-t p-6 grid grid-cols-2 gap-6">
          <div><h3 className="text-sm font-medium mb-2">Assets</h3><div className="flex items-start gap-2"><Factory className="h-4 w-4 text-muted-foreground mt-0.5" /><span className="text-sm">{renderAssetList(selectedWorkOrder.assets, navigate)}</span></div></div>
          <div><h3 className="text-sm font-medium mb-2">Location</h3><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-sm"><span onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (selectedWorkOrder.location?.id) navigate(`/locations/${selectedWorkOrder.location.id}`); }} className={selectedWorkOrder.location?.id ? "text-blue-600 hover:underline cursor-pointer" : ""}>{selectedWorkOrder.location?.name || selectedWorkOrder.location || "N/A"}</span></span></div></div>
          <div><h3 className="text-sm font-medium mb-2">Estimated Time</h3><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{formatDecimalHoursToDisplay(selectedWorkOrder.estimatedTimeHours)}</span></div></div>
          <div><h3 className="text-sm font-medium mb-2">Work Type</h3><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{selectedWorkOrder.workType || "N/A"}</span></div></div>
          <div><h3 className="text-sm font-medium mb-2">Teams</h3><div className="flex items-start gap-2"><Users className="h-4 w-4 text-muted-foreground mt-0.5" /><span className="text-sm">{renderClickableList(selectedWorkOrder.teams, navigate, (id) => `/teams/${id}`)}</span></div></div>
          <div><h3 className="text-sm font-medium mb-2">Vendors</h3><div className="flex items-start gap-2"><Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" /><span className="text-sm">{renderClickableList(selectedWorkOrder.vendors, navigate, (id) => `/vendors/${id}`)}</span></div></div>
          <div><h3 className="text-sm font-medium mb-2">Parts</h3><div className="flex items-start gap-2"><Wrench className="h-4 w-4 text-muted-foreground mt-0.5" /><span className="text-sm">{renderClickableList(selectedWorkOrder.parts, navigate, (id) => `/inventory/${id}`)}</span></div></div>
          <div><h3 className="text-sm font-medium mb-2">Categories</h3><div className="flex items-start gap-2"><Layers className="h-4 w-4 text-muted-foreground mt-0.5" /><span className="text-sm">{renderClickableList(selectedWorkOrder.categories, navigate, (id) => `/categories/${id}`)}</span></div></div>
          <div><h3 className="text-sm font-medium mb-2">Procedures</h3><div className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-muted-foreground mt-0.5" /><span className="text-sm">{renderClickableList(selectedWorkOrder.procedures, navigate, (id) => `/library/${id}`, "title")}</span></div></div>
          
          {selectedWorkOrder.meters && selectedWorkOrder.meters.length > 0 && (
            <div><h3 className="text-sm font-medium mb-2">Meters</h3><div className="flex items-start gap-2"><Gauge className="h-4 w-4 text-muted-foreground mt-0.5" /><span className="text-sm">{selectedWorkOrder.meters.map((meter: any, i: number) => (<span key={meter.id || i}><span onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/meters?meterId=${meter.id}`); }} className="text-blue-600 hover:underline cursor-pointer">{meter.name || "Unknown Meter"}</span>{i < selectedWorkOrder.meters.length - 1 && ", "}</span>))}</span></div></div>
          )}
        </div>

        {/* Schedule */}
        <div className="border-t p-6">
          <h3 className="text-sm font-medium mb-2">Schedule conditions</h3>
          <div className="flex items-start gap-3">
            <div style={{ minWidth: 24 }}><CalendarDays className="h-4 w-4 text-muted-foreground" /></div>
            <div className="flex-1">
              <div className="text-sm text-gray-800 mb-2">{recurrenceParsed ? recurrenceParsed.title : "Does not repeat"}</div>
              {originTitle && <div className="text-sm mt-1"><span className="text-muted-foreground">Created from </span><a href="#" className="text-blue-600 underline">{originTitle}</a></div>}
            </div>
          </div>
        </div>

        {/* Time & Cost Section */}
        <div className="border-t p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Time & Cost Tracking</h3>
          
          {/* Parts */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold text-gray-900">Parts <span className="text-gray-500 font-normal">({selectedWorkOrder.partUsages?.length || 0})</span></h4>
              <button onClick={() => setActivePanel("parts")} className="text-sm text-blue-600 font-medium hover:underline">Add / Edit</button>
            </div>
            <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr><th className="px-4 py-2 font-medium text-gray-500 text-xs">Part</th><th className="px-4 py-2 font-medium text-gray-500 text-xs">Location</th><th className="px-4 py-2 font-medium text-gray-500 text-xs text-right">Qty</th><th className="px-4 py-2 font-medium text-gray-500 text-xs text-right">Cost</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {selectedWorkOrder.partUsages?.length === 0 ? <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-400 italic">No parts added</td></tr> : 
                        selectedWorkOrder.partUsages?.map((p: any, i: number) => (
                            <tr key={i} className="bg-white">
                                <td className="px-4 py-3 text-gray-900 font-medium">{p.part?.name || "Unknown"}</td>
                                <td className="px-4 py-3 text-gray-600">{p.location?.name || "—"}</td>
                                <td className="px-4 py-3 text-gray-900 text-right">{p.quantity}</td>
                                <td className="px-4 py-3 text-gray-900 text-right">{formatCurrency(Number(p.unitCost) || 0)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-white border-t border-gray-200">
                        <tr><td colSpan={3} className="px-4 py-3 font-medium text-gray-900">Parts Cost</td><td className="px-4 py-3 font-medium text-gray-900 text-right">{formatCurrency(financials.partsCost)}</td></tr>
                    </tfoot>
                </table>
            </div>
          </div>

          {/* Time - ✅ Added Button to Header Row */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold text-gray-900">Time</h4>
              <button 
                 onClick={() => setActivePanel("time")} 
                 className="text-sm text-blue-600 font-medium hover:underline"
              >
                 Add Time
              </button>
            </div>
            {/* Total Duration Row */}
            <div className="flex justify-between items-center py-2 ">
                <span className="text-sm text-gray-900">Total Duration</span>
                <button 
                  onClick={() => setActivePanel("time")}
                  className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline"
                >
                  {formatDurationDetailed(financials.totalMinutes)}
                </button>
            </div>
            {/* Time Cost Row */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-900">Time Cost</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(financials.timeCost)}</span>
            </div>
          </div>

          {/* Other Costs */}
          <div className="mb-6"><div className="flex justify-between items-center mb-2"><h4 className="text-sm font-semibold text-gray-900">Other Costs</h4><button onClick={() => setActivePanel("cost")} className="text-sm text-blue-600 font-medium hover:underline">Add Other Cost</button></div><div className="flex justify-between items-center py-2 border-b border-gray-100"><span className="text-sm text-gray-900">Other Costs Total</span><span className="text-sm font-medium text-gray-900">{formatCurrency(financials.otherCost)}</span></div></div>
          
          <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center mt-4 border border-gray-200">
            <span className="text-sm font-semibold text-gray-900">Total Work Order Cost</span><span className="text-lg font-bold text-gray-900">{formatCurrency(financials.totalCost)}</span>
          </div>
        </div>

        {/* ✅ Activity Log Removed */}
        <div className="border-t p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-1 text-sm "><UserCircle2 className="w-4 h-4 text-yellow-500" /><span>Created {createdByName ? `by ${createdByName}` : ""}</span><span>{formatDate(selectedWorkOrder.createdAt, true)}</span></div>
            <div className="flex items-center gap-1 text-sm "><UserCircle2 className="w-4 h-4 text-yellow-500" /><span>Last Updated {updatedByName ? `by ${updatedByName}` : ""}</span><span>{formatDate(selectedWorkOrder.updatedAt, true)}</span></div>
          </div>
        </div>
      </div>
    </>
  );
}