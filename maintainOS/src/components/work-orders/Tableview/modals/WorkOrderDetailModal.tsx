import React, { useState, useEffect } from "react";
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
} from "lucide-react";

// --- Sub-Panels (Tailwind) ---
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

// --- Main Modal (Hybrid: Inline frame, Tailwind content) ---

export default function WorkOrderDetailsModal({ open, onClose, workOrder }) {
  if (!open || !workOrder) return null;

  const [panel, setPanel] = useState("details");
  const [activeStatus, setActiveStatus] = useState(workOrder.status);
  const [isExpanded, setIsExpanded] = useState(false); // <-- Resize state

  useEffect(() => {
    if (workOrder) {
      setActiveStatus(workOrder.status);
    }
  }, [workOrder]);

  const otherCosts = workOrder.otherCosts || [];
  const totalOtherCost = otherCosts.reduce(
    (sum, c) => sum + Number(c.amount ?? 0),
    0
  );

  const handleClose = () => {
    setPanel("details");
    setActiveStatus(workOrder.status); // Reset status on close
    setIsExpanded(false); // Reset expansion
    onClose();
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
          maxHeight: "90vh",
          overflow: "hidden",
          borderRadius: "14px",
          padding: 0,
          position: "relative",
          boxShadow: "0 25px 40px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s ease-in-out", // <-- Resize animation
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- 1. NAYA BLUE HEADER (TAILWIND) [FIXED] --- */}
        <div className="bg-blue-600 text-white px-6 py-4 grid grid-cols-3 items-center flex-shrink-0">
          {/* LEFT — EXPAND ICON */}
          <div className="flex justify-start">
            <button
              onClick={() => setIsExpanded(!isExpanded)} // <-- Resize toggle
              className="text-white p-1 rounded-lg hover:bg-white/20 transition"
            >
              {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>

          {/* CENTER DATE */}
          <div className="text-sm font-medium text-center">
            Created on{" "}
            <span className="font-bold">
              {workOrder.createdOn
                ? new Date(workOrder.createdOn).toLocaleDateString("en-US")
                : "N/A"}
            </span>
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
        {panel === "details" && (
          <div className="p-6 border-b bg-white flex-shrink-0">
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
                <button className="bg-white rounded-md px-4 py-2 border border-blue-500 text-blue-600 flex items-center gap-2 cursor-pointer hover:bg-blue-50 font-medium">
                  <Edit size={18} />
                  Edit
                </button>
                <button className="text-gray-500 hover:text-gray-800 p-2">
                  <MoreHorizontal size={20} />
                </button>
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
        <div className="overflow-y-auto relative">
          {" "}
          {/* <-- Added relative */}
          {/* PANELS (Tailwind) */}
          {panel === "parts" && <PartsPanel onBack={() => setPanel("details")} />}
          {panel === "time" && <TimePanel onBack={() => setPanel("details")} />}
          {panel === "cost" && (
            <CostPanel
              onBack={() => setPanel("details")}
              workOrder={workOrder}
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

              {/* TIME & COST (Tailwind) */}
              <div className="p-6 border-b bg-white">
                <h2 className="text-xl font-semibold mb-3 text-gray-900">
                  Time & Cost Tracking
                </h2>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Parts
                  </span>
                  <button
                    onClick={() => setPanel("parts")}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 cursor-pointer"
                  >
                    Add <ChevronRight size={16} />
                  </button>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Time
                  </span>
                  <button
                    onClick={() => setPanel("time")}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 cursor-pointer"
                  >
                    Add <ChevronRight size={16} />
                  </button>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-700">
                    Other Costs
                  </span>
                  <button
                    onClick={() => setPanel("cost")}
                    className="text-right cursor-pointer group"
                  >
                    <span className="text-sm text-blue-600 group-hover:underline flex items-center justify-end">
                      {otherCosts.length} entries
                      <ChevronRight size={16} className="ml-1" />
                    </span>
                    <div className="text-base font-semibold text-gray-900 mt-0.5">
                      ${totalOtherCost.toFixed(2)}
                    </div>
                  </button>
                </div>
              </div>

              {/* FOOTER (Tailwind) */}
              <div className="p-6 flex justify-between text-sm text-gray-700 bg-white">
                <div>
                  Created By{" "}
                  <strong className="font-semibold">
                    {workOrder.createdBy}
                  </strong>{" "}
                  on {workOrder.createdOn}
                </div>
                <div>Updated On {workOrder.updatedOn}</div>
              </div>

              {/* Empty space for floating button */}
              <div className="h-24 flex-shrink-0"></div>
            </>
          )}

          {/* --- FLOATING BUTTON (MOVED) --- */}
          {/* Button 'sticky' tha aur scrollable div ke andar tha */}
          {/* Ab yeh block yahan se move ho jayega */}
        </div>
        
        {/* --- FLOATING BUTTON (NEW POSITION) --- */}
        {/* Yeh 'absolute' hai aur scrollable div ke BAHAR hai, modal box ke relative */}
        {/* Inline CSS wrapper div aapke request ke according */}
        {panel === "details" && (
            <div
              style={{
                position: "absolute",
                bottom: "24px", // 1.5rem
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 10,
              }}
            >
              <button className="flex items-center gap-2 bg-white text-blue-600 border-2 border-blue-400 hover:bg-blue-50 px-6 py-2 rounded-full shadow-lg font-medium whitespace-nowrap">
                <View size={18} />
                View Procedure
              </button>
            </div>
          )}
      </div>
    </div>
  );
}