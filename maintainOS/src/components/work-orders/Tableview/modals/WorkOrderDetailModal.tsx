import React, { useState, useEffect, useRef } from "react";
import {
  CalendarDays,
  ChevronRight,
  Clock,
  Edit,
  Factory,
  MapPin,
  MessageSquare,
  Repeat,
  Maximize2, 
  Minimize2, 
  X, 
  MoreHorizontal, 
  View, 
  ArrowLeft,
  User,
  CheckCircle2, 
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux"; 
import type { AppDispatch } from "../../../../store";
import { 
  deleteWorkOrder,
  patchWorkOrderComplete, 
  markWorkOrderInProgress, 
  updateWorkOrder,
  updateWorkOrderStatus 
} from "../../../../store/workOrders/workOrders.thunks";
import { NewWorkOrderForm } from "../../NewWorkOrderForm/NewWorkOrderFrom";
import TimeOverviewPanel from "../../panels/TimeOverviewPanel";
import OtherCostsPanel from "../../panels/OtherCostsPanel";
import UpdatePartsPanel from "../../panels/UpdatePartsPanel";
import { CommentsSection } from "../../ToDoView/CommentsSection";
import WorkOrderOptionsDropdown from "../../ToDoView/WorkOrderOptionsDropdown";
import toast from "react-hot-toast"; 

import { LinkedProcedurePreview } from "../../ToDoView/LinkedProcedurePreview";

const safeRender = (value: any) => {
  if (!value) return null;
  if (typeof value === "string" || typeof value === "number") return value;
  if (typeof value === "object") {
    return value.name || value.title || value.fullName || value.label || "—";
  }
  return "—";
};

const safeRenderAssignee = (workOrder: any) => {
  if (workOrder.assignedTo) return safeRender(workOrder.assignedTo);
  if (Array.isArray(workOrder.assignees) && workOrder.assignees.length > 0) {
    return safeRender(workOrder.assignees[0]);
  }
  return "Unassigned";
};

function formatModalDateTime(isoString: string) {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    return `${date.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })}, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
  } catch (error) {
    return isoString;
  }
}

export default function WorkOrderDetailModal({
  open,
  onClose,
  workOrder,
  onRefreshWorkOrders,
}: any) {
  if (!open || !workOrder) return null;

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: any) => state.auth?.user);

  const [panel, setPanel] = useState("details");
  const [activeStatus, setActiveStatus] = useState(workOrder.status || "open");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // --- SCROLL & VISIBILITY STATE ---
  const [isProcedureVisible, setIsProcedureVisible] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null); 
  const procedureRef = useRef<HTMLDivElement>(null);       
  const commentTextAreaRef = useRef<HTMLTextAreaElement>(null); // ✅ Ref for Comments

  const hasProcedure = (workOrder.procedures && workOrder.procedures.length > 0) || 
                       (workOrder.procedureIds && workOrder.procedureIds.length > 0);

  const [comment, setComment] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (workOrder) setActiveStatus(workOrder.status || "open");
  }, [workOrder]);

  // --- SCROLL LISTENER ---
  useEffect(() => {
    const container = scrollContainerRef.current;
    const target = procedureRef.current;

    if (!container || !target || !hasProcedure) {
      if (isProcedureVisible) setIsProcedureVisible(false);
      return;
    }

    const handleScroll = () => {
      if (!procedureRef.current || !scrollContainerRef.current) return;
      const containerRect = scrollContainerRef.current.getBoundingClientRect();
      const targetRect = procedureRef.current.getBoundingClientRect();
      
      const isReached = targetRect.top <= (containerRect.bottom - 100); 
      if (isReached !== isProcedureVisible) {
        setIsProcedureVisible(isReached);
      }
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll(); 
    return () => container.removeEventListener("scroll", handleScroll);
  }, [panel, isEditing, hasProcedure, isProcedureVisible]); 

  const handleViewProcedure = () => {
    if (procedureRef.current) {
      procedureRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ✅ SCROLL TO COMMENTS HANDLER
  const handleScrollToComments = () => {
    if (commentTextAreaRef.current) {
      commentTextAreaRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => commentTextAreaRef.current?.focus(), 300);
    }
  };

  const otherCosts = workOrder.otherCosts || [];
  const totalOtherCost = otherCosts.reduce(
    (sum: number, c: any) => sum + Number(c.amount ?? 0),
    0
  );

  const handleClose = () => {
    setPanel("details");
    setIsEditing(false);
    setActiveStatus(workOrder.status || "open");
    setIsExpanded(false);
    setIsProcedureVisible(false);
    onRefreshWorkOrders?.();
    onClose();
  };

  const handleCancelEdit = () => setIsEditing(false);

  const handleDeleteClick = async () => {
    setIsDropdownOpen(false);
    if (window.confirm("Are you sure you want to delete this work order?")) {
      try {
        await dispatch(deleteWorkOrder(workOrder.id)).unwrap();
        onRefreshWorkOrders?.();
        handleClose();
        toast.success("Work order deleted");
      } catch (error) {
        console.error("Failed to delete work order:", error);
        toast.error("Failed to delete work order");
      }
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (activeStatus === newStatus) return;
    
    if (!user?.id) {
        toast.error("User session invalid. Please login.");
        return;
    }

    const prevStatus = activeStatus;
    setActiveStatus(newStatus); 

    try {
      if (newStatus === "done" || newStatus === "completed") {
        await dispatch(patchWorkOrderComplete(workOrder.id)).unwrap();
        toast.success("Work order completed");
      } 
      else {
        await dispatch(
            updateWorkOrderStatus({
                id: workOrder.id,
                authorId: user.id,
                status: newStatus,
            })
        ).unwrap();
        const label = newStatus.replace("_", " ");
        toast.success(`Status updated to ${label.charAt(0).toUpperCase() + label.slice(1)}`);
      }
      
      if (onRefreshWorkOrders) {
        onRefreshWorkOrders();
      }

    } catch (error: any) {
      console.error("Status update failed:", error);
      toast.error(typeof error === 'string' ? error : "Failed to update status");
      setActiveStatus(prevStatus); 
    }
  };

  return (
    <div
      style={{
        position: "fixed", 
        inset: 0, 
        zIndex: 3000, 
        display: "flex",
        alignItems: "center", 
        justifyContent: "center", 
        backgroundColor: "rgba(0,0,0,0.45)",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: "white", 
          width: isExpanded ? "95%" : "900px", 
          height: "90vh",
          overflow: "hidden", 
          borderRadius: "14px", 
          padding: 0, 
          position: "relative",
          boxShadow: "0 25px 40px rgba(0,0,0,0.25)", 
          display: "flex", 
          flexDirection: "column",
          transition: "width 0.3s ease-in-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 grid grid-cols-3 items-center flex-shrink-0 z-10">
          <div className="flex justify-start items-center gap-4">
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-white p-1 rounded-lg hover:bg-white/20 transition">
              {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            {isEditing && (
              <button onClick={handleCancelEdit} className="text-white p-1 rounded-lg hover:bg-white/20 transition flex items-center gap-1 text-sm">
                <ArrowLeft size={20} /> Back
              </button>
            )}
          </div>
          <div className="text-sm font-medium text-center truncate">
            {isEditing ? <span className="font-bold text-base">Edit Work Order</span> : (
              <>Created on <span className="font-bold">{workOrder.createdAt ? new Date(workOrder.createdAt).toLocaleDateString("en-US") : "N/A"}</span></>
            )}
          </div>
          <div className="flex justify-end">
            <button onClick={handleClose} className="text-white p-1 rounded-lg hover:bg-white/20 transition"><X size={24} /></button>
          </div>
        </div>

        {panel === "details" && !isEditing && (
          <div className="p-6 border-b bg-white flex-shrink-0 z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">{workOrder.title}</h2>
              
              <div className="flex items-center gap-2">
                {/* ✅ SCROLL TO COMMENTS BUTTON */}
                <button 
                  onClick={handleScrollToComments}
                  className="bg-white rounded-md px-4 py-2 border border-blue-500 text-blue-600 flex items-center gap-2 cursor-pointer hover:bg-blue-50 font-medium"
                >
                  <MessageSquare size={18} /> Comments
                </button>

                {hasProcedure && isProcedureVisible ? (
                  <button 
                    onClick={() => handleStatusChange("done")} 
                    className="bg-green-600 rounded-md px-4 py-2 border border-green-600 text-white flex items-center gap-2 cursor-pointer hover:bg-green-700 font-medium shadow-sm animate-in fade-in zoom-in duration-200"
                  >
                    <CheckCircle2 size={18} /> Mark as Done
                  </button>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="bg-white rounded-md px-4 py-2 border border-blue-500 text-blue-600 flex items-center gap-2 cursor-pointer hover:bg-blue-50 font-medium">
                    <Edit size={18} /> Edit
                  </button>
                )}

                <div className="relative">
                  <button ref={buttonRef} onClick={() => setIsDropdownOpen((p) => !p)} className="inline-flex items-center rounded p-2 hover:bg-muted relative">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  <WorkOrderOptionsDropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} triggerRef={buttonRef} onDelete={handleDeleteClick} />
                </div>
              </div>
            </div>
            <div className="mt-2.5 flex gap-4 text-sm text-gray-500 px-6 pb-2">
              <span className="flex items-center gap-1"><Repeat size={14} /> {safeRender(workOrder.priority)}</span>
              <span className="flex items-center gap-1"><CalendarDays size={14} /> Due by {workOrder.dueDate ? formatModalDateTime(workOrder.dueDate) : "—"}</span>
            </div>
          </div>
        )}

        <div 
          ref={scrollContainerRef} 
          className="overflow-y-auto relative bg-gray-50"
        >
          {isEditing ? (
            <div className="bg-white">
              <NewWorkOrderForm isEditMode={true} existingWorkOrder={workOrder} editId={workOrder.id} onCancel={handleCancelEdit} onCreate={() => { onRefreshWorkOrders?.(); handleClose(); }} />
            </div>
          ) : (
            <>
              {panel === "parts" && <UpdatePartsPanel onCancel={() => setPanel("details")} />}
              {panel === "time" && <TimeOverviewPanel onCancel={() => setPanel("details")} selectedWorkOrder={workOrder} workOrderId={workOrder.id} />}
              {panel === "cost" && <OtherCostsPanel onCancel={() => setPanel("details")} selectedWorkOrder={workOrder} workOrderId={workOrder.id} />}

              {panel === "details" && (
                <>
                  <div className="p-6 border-b">
                    <h3 className="text-sm font-medium mb-2.5 text-gray-700">Status</h3>
                    <div className="flex items-start justify-between gap-6 border rounded-lg p-4 bg-white sm:flex-row flex-col">
                      <div className="flex gap-4">
                        {[
                          { key: "open", label: "Open", Icon: MessageSquare },
                          { key: "on_hold", label: "On hold", Icon: Edit },
                          { key: "in_progress", label: "In Progress", Icon: Clock },
                          { key: "done", label: "Done", Icon: CalendarDays },
                        ].map(({ key, label, Icon }) => {
                          const active = (activeStatus || "open") === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => handleStatusChange(key)}
                              className={`h-16 w-20 rounded-lg border shadow-md inline-flex flex-col items-center justify-center gap-2 transition-all outline-none ${active ? "bg-orange-600 text-white border-orange-600" : "bg-orange-50 text-sidebar-foreground border-gray-200 hover:bg-orange-100"}`}
                            >
                              <Icon className="h-4 w-4" />
                              <span className="text-xs font-medium leading-none text-center px-2 truncate">{label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex justify-between border-b bg-white">
                    <div><h4 className="text-sm font-medium text-gray-700">Due Date</h4><p className="text-sm text-gray-500">{workOrder.dueDate || "—"}</p></div>
                    <div><h4 className="text-sm font-medium text-gray-700">Priority</h4><p className="text-sm text-gray-500">{safeRender(workOrder.priority)}</p></div>
                    <div><h4 className="text-sm font-medium text-gray-700">Work Order ID</h4><p className="text-sm text-gray-500">{workOrder.id}</p></div>
                  </div>

                  <div className="p-6 border-b bg-white">
                    <h4 className="text-sm font-medium mb-2 text-gray-700">Assigned To</h4>
                    <div className="flex items-center gap-2"><div className="w-6 h-6 bg-gray-200 rounded-full"></div><span className="text-sm text-gray-800">{safeRenderAssignee(workOrder)}</span></div>
                  </div>

                  <div className="p-6 border-b bg-white">
                    <h4 className="text-sm font-medium mb-2 text-gray-700">Description</h4>
                    <p className="text-sm text-gray-500 whitespace-pre-line">{workOrder.description || "No description provided."}</p>
                  </div>

                  <div className="p-6 grid grid-cols-2 gap-6 border-b bg-white">
                    <div><h4 className="text-sm font-medium mb-1.5 text-gray-700">Asset</h4><span className="flex items-center gap-1.5 text-sm text-gray-800"><Factory size={16} className="text-gray-500" />{safeRender(workOrder.asset)}</span></div>
                    <div><h4 className="text-sm font-medium mb-1.5 text-gray-700">Location</h4><span className="flex items-center gap-1.5 text-sm text-gray-800"><MapPin size={16} className="text-gray-500" />{safeRender(workOrder.location)}</span></div>
                    <div><h4 className="text-sm font-medium mb-1.5 text-gray-700">Estimated Time</h4><span className="flex items-center gap-1.5 text-sm text-gray-800"><Clock size={16} className="text-gray-500" />{workOrder.estimated_time || "—"}</span></div>
                    <div><h4 className="text-sm font-medium mb-1.5 text-gray-700">Work Type</h4><span className="flex items-center gap-1.5 text-sm text-gray-800"><CalendarDays size={16} className="text-gray-500" />{safeRender(workOrder.work_type || workOrder.workType)}</span></div>
                  </div>

                  <div className="p-6 border-b bg-white">
                    <h2 className="text-xl font-semibold mb-3 text-gray-900">Time & Cost Tracking</h2>
                    <div className="space-y-2">
                      <div onClick={() => setPanel("parts")} className="flex justify-between items-center py-3 border-b-2 border-yellow-400 cursor-pointer group">
                        <span className="text-sm font-medium text-gray-700">Parts</span>
                        <div className="flex items-center text-sm text-gray-500 group-hover:text-blue-600">Add <ChevronRight className="w-4 h-4 ml-1" /></div>
                      </div>
                      <div onClick={() => setPanel("time")} className="flex justify-between items-center py-3 border-b-2 border-yellow-400 cursor-pointer group">
                        <span className="text-sm font-medium text-gray-700">Time</span>
                        <div className="flex items-center text-sm text-gray-500 group-hover:text-blue-600">Add <ChevronRight className="w-4 h-4 ml-1" /></div>
                      </div>
                      <div onClick={() => setPanel("cost")} className="flex justify-between items-start py-3 border-b-2 border-yellow-400 cursor-pointer group">
                        <span className="text-sm font-medium text-gray-700">Other Costs</span>
                        <div className="text-right">
                          <div className="flex items-center text-sm text-gray-500 group-hover:text-blue-600 justify-end">{otherCosts.length} entries <ChevronRight className="w-4 h-4 ml-1" /></div>
                          <div className="text-base font-semibold text-gray-900 mt-0.5">${totalOtherCost.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {hasProcedure && (
                    <div className="bg-white" ref={procedureRef}>
                      <LinkedProcedurePreview selectedWorkOrder={workOrder} />
                    </div>
                  )}

                  <div className="p-6 flex justify-between text-sm text-gray-600 bg-white border-b border-t">
                    <div className="flex items-center gap-1.5">Created by <User className="w-4 h-4 text-blue-500" /><strong className="font-semibold text-gray-800">{workOrder.createdBy || "System"}</strong> on {formatModalDateTime(workOrder.createdAt)}</div>
                    <div>Last updated on {formatModalDateTime(workOrder.updatedAt)}</div>
                  </div>

                  {/* ✅ Pass Ref to CommentsSection */}
                  <CommentsSection 
                    ref={commentTextAreaRef} 
                    comment={comment} 
                    setComment={setComment} 
                    attachment={attachment} 
                    setAttachment={setAttachment} 
                    fileRef={fileRef} 
                    selectedWorkOrder={workOrder} 
                  />
                  
                  <div className="h-24 flex-shrink-0 bg-white"></div>
                </>
              )}
            </>
          )}
        </div>

        {panel === "details" && !isEditing && hasProcedure && !isProcedureVisible && (
          <div
            style={{
              position: "absolute",
              bottom: "24px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
            }}
          >
            <button 
              onClick={handleViewProcedure} 
              className="flex items-center gap-2 bg-white text-blue-600 border-2 border-yellow-400 hover:bg-blue-50 px-6 py-2 rounded-full shadow-lg font-medium whitespace-nowrap transition-all duration-300 ease-in-out"
            >
              <View size={18} className="text-blue-500" />
              View Procedure
            </button>
          </div>
        )}
      </div>
    </div>
  );
}