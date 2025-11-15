import React, { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  Clock,
  Edit,
  Factory,
  MapPin,
  MessageSquare,
  Repeat,
  Maximize2, // Expand
  Minimize2, // Collapse
  X, // Close
  MoreHorizontal, // Three Dots
  View, // View Procedure Icon
  ArrowLeft,
  User,
} from "lucide-react";

// ✅ 1. IMPORT DISPATCH and THUNK
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../../store"; // Path adjust karein agar zaroori ho
import { deleteWorkOrder } from "../../../../store/workOrders/workOrders.thunks";

// ✅ 2. IMPORT THE REUSABLE "NEW WORK ORDER FORM"
import { NewWorkOrderForm } from "../../NewWorkOrderForm/NewWorkOrderFrom";

// ✅ 3. IMPORT THE *REAL* PANELS (for panel switching)
import TimeOverviewPanel from "../../panels/TimeOverviewPanel";
import OtherCostsPanel from "../../panels/OtherCostsPanel";
import UpdatePartsPanel from "../../panels/UpdatePartsPanel";

// ✅ 4. IMPORT COMMENTS SECTION
import { CommentsSection } from "../../ToDoView/CommentsSection";


// --- Sub-Panels (Tailwind) ---
// (Aapka original code)
function PartsPanel({ onBack }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900">Parts</h2>
      <p className="mt-2.5 text-gray-500">
        (Demo Panel) Parts management UI goes here…
      </p>

      <button
        onClick={onBack}
        className="mt-5 px-4 py-2 border rounded-md cursor-pointer bg-gray-50 text-gray-700 hover:bg-gray-100"
      >
        Back
      </button>
    </div>
  );
}

function TimePanel({ onBack }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900">Time Overview</h2>
      <p className="mt-2.5 text-gray-500">
        (Demo Panel) Time overview UI goes here…
      </p>

      <button
        onClick={onBack}
        className="mt-5 px-4 py-2 border rounded-md cursor-pointer bg-gray-50 text-gray-700 hover:bg-gray-100"
      >
        Back
      </button>
    </div>
  );
}



function CostPanel({ onBack, workOrder }) {
  const total = (workOrder.otherCosts || []).reduce(
    (sum, x) => sum + Number(x.amount || 0),
    0
  );

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900">Other Costs</h2>
      <p className="mt-2.5 text-gray-500">
        {workOrder.otherCosts?.length || 0} entries
      </p>

      <p className="mt-2.5 text-lg font-semibold text-gray-900">
        ${total.toFixed(2)}
      </p>

      <button
        onClick={onBack}
        className="mt-5 px-4 py-2 border rounded-md cursor-pointer bg-gray-50 text-gray-700 hover:bg-gray-100"
      >
        Back
      </button>
    </div>
  );
}

// ✅ ADDED: Date formatting helper
function formatModalDateTime(isoString) {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${formattedDate}, ${formattedTime}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return isoString;
  }
}

// --- Main Modal (Hybrid: Inline frame, Tailwind content) ---
// ✅ ADDED 'onRefresh' prop
export default function WorkOrderDetailsModal({ open, onClose, workOrder,  onRefreshWorkOrders }) {
  if (!open || !workOrder) return null;

  const [panel, setPanel] = useState("details");
  const [activeStatus, setActiveStatus] = useState(workOrder.status);
  const [isExpanded, setIsExpanded] = useState(false); // <-- Resize state
  
  // ✅ 5. ADD 'isEditing' STATE TO SWITCH VIEWS
  const [isEditing, setIsEditing] = useState(false);
  
  // ✅ 6. ADD STATE FOR COMMENTS
  const [comment, setComment] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const commentTextAreaRef = useRef<HTMLTextAreaElement>(null);

  // ✅ 7. ADD STATE AND REFS FOR DROPDOWN (Aapke snippet se)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // ✅ 9. SETUP DISPATCH
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (workOrder) {
      setActiveStatus(workOrder.status);
    }
  }, [workOrder]);

  // ✅ 10. ADD EFFECT TO CLOSE DROPDOWN ON OUTSIDE CLICK (Aapke snippet se)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);


  const otherCosts = workOrder.otherCosts || [];
  const totalOtherCost = otherCosts.reduce(
    (sum, c) => sum + Number(c.amount ?? 0),
    0
  );

  const handleClose = () => {
    setPanel("details");
    setIsEditing(false); // <-- Reset edit state
    setActiveStatus(workOrder.status); // Reset status on close
    setIsExpanded(false); // Reset expansion
    onClose();
    onRefreshWorkOrders?.(); // ✅ Call refresh on close
  };
  
  // ✅ 11. ADD HANDLER TO EXIT EDIT MODE
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // ✅ 12. ADD DELETE HANDLER (API ke saath)
  const handleDeleteClick = async () => {
    setIsDropdownOpen(false);
    if (window.confirm("Are you sure you want to delete this work order?")) {
      try {
        await dispatch(deleteWorkOrder(workOrder.id)).unwrap();
        handleClose(); // Delete ke baad modal band kar dein (jo refresh trigger karega)
      } catch (error) {
        console.error("Failed to delete work order:", error);
        // Aap yahaan toast notification dikha sakte hain
      }
    }
  };

  return (
    // Backdrop (Inline Style)
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999999, // High z-index
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.45)", // Black overlay
      }}
      onClick={handleClose}
    >
      {/* Modal Box (Inline Style) */}
      <div
        style={{
          background: "white",
          width: isExpanded ? "95%" : "900px", // <-- Dynamic width
          height: "90vh", // <-- FIXED Height
          overflow: "hidden", // <-- Correct, content inside scrolls
          borderRadius: "14px",
          padding: 0,
          position: "relative", // <-- Correct, for floating button
          boxShadow: "0 25px 40px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s ease-in-out", // <-- Resize animation
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- 1. NAYA BLUE HEADER (TAILWIND) [FIXED] --- */}
        <div className="bg-blue-600 text-white px-6 py-4 grid grid-cols-3 items-center flex-shrink-0 z-10">
          {/* LEFT — EXPAND ICON & BACK BUTTON */}
          <div className="flex justify-start items-center gap-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)} // <-- Resize toggle
              className="text-white p-1 rounded-lg hover:bg-white/20 transition"
            >
              {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            {/* ✅ 13. Show 'Back' button only in edit mode */}
            {isEditing && (
              <button
                onClick={handleCancelEdit}
                className="text-white p-1 rounded-lg hover:bg-white/20 transition flex items-center gap-1 text-sm"
              >
                <ArrowLeft size={20} />
                Back
              </button>
            )}
          </div>

          {/* CENTER DATE / TITLE */}
          <div className="text-sm font-medium text-center truncate"> {/* Added truncate */}
            {/* ✅ 14. Show 'Edit Work Order' title when editing */}
            {isEditing ? (
              <span className="font-bold text-base">Edit Work Order</span>
            ) : (
              <>
                Created on{" "}
                <span className="font-bold">
                  {workOrder.createdOn
                    ? new Date(workOrder.createdOn).toLocaleDateString("en-US")
                    : "N/A"}
                </span>
              </>
            )}
          </div>

          {/* RIGHT — CLOSE BUTTON */}
          <div className="flex justify-end">
            <button
              onClick={handleClose}
              className="text-white p-1 rounded-lg hover:bg-white/20 transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* --- 2. WHITE HEADER (TAILWIND) [FIXED] --- */}
        {/* ✅ 15. Only show when NOT editing */}
        {panel === "details" && !isEditing && (
          <div className="p-6 border-b bg-white flex-shrink-0 z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                {workOrder.title}
              </h2>

              {/* --- Header Buttons --- */}
              <div className="flex items-center gap-2">
                <button className="bg-white rounded-md px-4 py-2 border border-blue-500 text-blue-600 flex items-center gap-2 cursor-pointer hover:bg-blue-50 font-medium">
                  <MessageSquare size={18} />
                  Comments
                </button>
                {/* ✅ 16. THIS 'Edit' BUTTON NOW SETS 'isEditing' TO TRUE */}
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-white rounded-md px-4 py-2 border border-blue-500 text-blue-600 flex items-center gap-2 cursor-pointer hover:bg-blue-50 font-medium"
                >
                  <Edit size={18} />
                  Edit
                </button>
                
                {/* ✅ 17. REPLACED BUTTON WITH YOUR SNIPPET */}
                <div className="relative"> {/* Wrapper for positioning */}
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
                      className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-72 mt-2" // ✅ Updated to w-72
                      style={{ right: 0, top: "40px" }} // User's inline CSS
                    >
                      <ul className="text-sm text-gray-700">
                        <li
                          onClick={() => { alert("Mark as unread"); setIsDropdownOpen(false); }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          Mark as unread
                        </li>
                        <li
                          onClick={() => { alert("Copy to new work order"); setIsDropdownOpen(false); }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          Copy to New Work Order
                        </li>
                        <li
                          onClick={() => { alert("Save as Template"); setIsDropdownOpen(false); }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          Save as Work Order Template
                        </li>
                        <li
                          onClick={() => { alert("Export to PDF"); setIsDropdownOpen(false); }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          Export to PDF
                        </li>
                        <li
                          onClick={() => { alert("Email to Vendors"); setIsDropdownOpen(false); }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          Email to Vendors
                        </li>
                        <hr className="my-1 border-gray-200" />
                        <li
                          onClick={handleDeleteClick} // ✅ Connected real delete handler
                          className="px-4 py-2 text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          Delete
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                {/* ✅ END OF REPLACEMENT */}

              </div>
            </div>
            <div className="mt-2.5 flex gap-4 text-sm text-gray-500 px-6 pb-2">
              <span className="flex items-center gap-1">
                <Repeat size={14} /> {workOrder.priority}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays size={14} /> Due by {workOrder.dueDate}
              </span>
            </div>
          </div>
        )}

        {/* --- 3. SCROLLABLE CONTENT AREA (TAILWIND) --- */}
        <div className="overflow-y-auto relative bg-gray-50"> {/* ✅ Added bg-gray-50 */}
          
          {/* ✅ 18. Main conditional rendering logic */}
          {isEditing ? (
            // --- EDITING PANEL ---
            <div className="bg-white">
              <NewWorkOrderForm
                isEditMode={true}
                existingWorkOrder={workOrder}
                editId={workOrder.id}
                onCancel={handleCancelEdit} // "Cancel" button acts as "Back"
                onCreate={() => {
                  handleClose(); // Close modal on successful update
                }}
              />
            </div>
          ) : (
            // --- DETAILS PANEL ---
            <>
              {/* PANELS (Tailwind) */}
              {/* ✅ 19. Use REAL panels instead of demo panels */}
              {panel === "parts" && (
                <UpdatePartsPanel onCancel={() => setPanel("details")} />
              )}
              {panel === "time" && (
                <TimeOverviewPanel
                  onCancel={() => setPanel("details")}
                  selectedWorkOrder={workOrder}
                  workOrderId={workOrder.id}
                />
              )}
              {panel === "cost" && (
                <OtherCostsPanel
                  onCancel={() => setPanel("details")}
                  selectedWorkOrder={workOrder}
                  workOrderId={workOrder.id}
                />
              )}

              {/* MAIN DETAILS PANEL (Tailwind) */}
              {panel === "details" && (
                <>
                  {/* STATUS PANEL (Tailwind) */}
                  <div className="p-6 border-b">
                    <h3 className="text-sm font-medium mb-2.5 text-gray-700">
                      Status
                    </h3>
                    <div
                      className="flex items-start justify-between gap-6 border rounded-lg p-4 bg-white sm:flex-row flex-col"
                      role="group"
                    >
                      <div className="flex gap-4">
                        {[
                          { key: "open", label: "Open", Icon: MessageSquare },
                          { key: "on_hold", label: "On hold", Icon: Edit },
                          {
                            key: "in_progress",
                            label: "In Progress",
                            Icon: Clock,
                          },
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

                  {/* META SECTION (Tailwind) */}
                  <div className="p-6 flex justify-between border-b bg-white">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Due Date
                      </h4>
                      <p className="text-sm text-gray-500">{workOrder.dueDate}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Priority
                      </h4>
                      <p className="text-sm text-gray-500">{workOrder.priority}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Work Order ID
                      </h4>
                      <p className="text-sm text-gray-500">{workOrder.id}</p>
                    </div>
                  </div>

                  {/* ASSIGNED (Tailwind) */}
                  <div className="p-6 border-b bg-white">
                    <h4 className="text-sm font-medium mb-2 text-gray-700">
                      Assigned To
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                      <span className="text-sm text-gray-800">
                        {workOrder.assignedTo || "Unassigned"}
                      </span>
                    </div>
                  </div>

                  {/* DESCRIPTION (Tailwind) */}
                  <div className="p-6 border-b bg-white">
                    <h4 className="text-sm font-medium mb-2 text-gray-700">
                      Description
                    </h4>
                    <p className="text-sm text-gray-500 whitespace-pre-line">
                      {workOrder.description || "No description provided."}
                    </p>
                  </div>

                  {/* DETAILS GRID (Tailwind) */}
                  <div className="p-6 grid grid-cols-2 gap-6 border-b bg-white">
                    <div>
                      <h4 className="text-sm font-medium mb-1.5 text-gray-700">
                        Asset
                      </h4>
                      <span className="flex items-center gap-1.5 text-sm text-gray-800">
                        <Factory size={16} className="text-gray-500" />
                        {workOrder.asset}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1.5 text-gray-700">
                        Location
                      </h4>
                      <span className="flex items-center gap-1.5 text-sm text-gray-800">
                        <MapPin size={16} className="text-gray-500" />
                        {workOrder.location}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1.5 text-gray-700">
                        Estimated Time
                      </h4>
                      <span className="flex items-center gap-1.5 text-sm text-gray-800">
                        <Clock size={16} className="text-gray-500" />
                        {workOrder.estimated_time}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1.5 text-gray-700">
                        Work Type
                      </h4>
                      <span className="flex items-center gap-1.5 text-sm text-gray-800">
                        <CalendarDays size={16} className="text-gray-500" />
                        {workOrder.work_type}
                      </span>
                    </div>
                  </div>

                  {/* ✅ 20. TIME & COST (Yellow Line Design) */}
                  <div className="p-6 border-b bg-white">
                    <h2 className="text-xl font-semibold mb-3 text-gray-900">
                      Time & Cost Tracking
                    </h2>
                    <div className="space-y-2">
                      <div 
                        onClick={() => setPanel("parts")}
                        className="flex justify-between items-center py-3 border-b-2 border-yellow-400 cursor-pointer group"
                      >
                        <span className="text-sm font-medium text-gray-700">Parts</span>
                        <div className="flex items-center text-sm text-gray-500 group-hover:text-blue-600">
                          Add
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                      
                      <div 
                        onClick={() => setPanel("time")}
                        className="flex justify-between items-center py-3 border-b-2 border-yellow-400 cursor-pointer group"
                      >
                        <span className="text-sm font-medium text-gray-700">Time</span>
                        <div className="flex items-center text-sm text-gray-500 group-hover:text-blue-600">
                          Add
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>

                      <div 
                        onClick={() => setPanel("cost")}
                        className="flex justify-between items-start py-3 border-b-2 border-yellow-400 cursor-pointer group"
                      >
                        <span className="text-sm font-medium text-gray-700">Other Costs</span>
                        <div className="text-right">
                          <div className="flex items-center text-sm text-gray-500 group-hover:text-blue-600 justify-end">
                            {otherCosts.length} entries
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </div>
                           <div className="text-base font-semibold text-gray-900 mt-0.5">
                             ${totalOtherCost.toFixed(2)}
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ✅ 21. FOOTER (Tailwind) - MOVED HERE */}
                  <div className="p-6 flex justify-between text-sm text-gray-600 bg-white border-b">
                    <div className="flex items-center gap-1.5">
                      Created by
                      <User className="w-4 h-4 text-blue-500" /> 
                      <strong className="font-semibold text-gray-800">
                        {workOrder.createdBy || "System"}
                      </strong>
                      on {formatModalDateTime(workOrder.createdOn)}
                    </div>
                    <div>
                      Last updated on {formatModalDateTime(workOrder.updatedOn)}
                    </div>
                  </div>

                  {/* ✅ 22. ADDED COMMENTS SECTION */}
                  <CommentsSection
                    ref={commentTextAreaRef}
                    comment={comment}
                    setComment={setComment}
                    attachment={attachment}
                    setAttachment={setAttachment}
                    fileRef={fileRef}
                  />

                  {/* Empty space for floating button */}
                  <div className="h-24 flex-shrink-0 bg-white"></div>
                </>
              )}
            </>
          )}
        </div> {/* End of scrollable area */}
        
        {/* --- FLOATING BUTTON (FIXED) --- */}
        {/* ✅ 23. This is outside the scrollable div, so it's fixed */}
        {/* It only shows if panel is "details" AND not in edit mode */}
        {panel === "details" && !isEditing && (
          <div
            style={{
              position: "absolute",
              bottom: "24px", // 1.5rem
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
            }}
          >
            <button className="flex items-center gap-2 bg-white text-blue-600 border-2 border-yellow-400 hover:bg-yellow-50 px-6 py-2 rounded-full shadow-lg font-medium whitespace-nowrap">
              <View size={18} className="text-blue-500"/>
              View Procedure
            </button>
          </div>
        )}
      </div> 
    </div> 
  );
}