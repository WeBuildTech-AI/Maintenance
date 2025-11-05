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
  Repeat,
} from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { deleteWorkOrder } from "../../../store/workOrders/workOrders.thunks"; // ✅ adjust import path if needed
import DeleteWorkOrderModal from "./DeleteWorkOrderModal";

// ✅ New subpanels imports
import UpdatePartsPanel from "../panels/UpdatePartsPanel";
import TimeOverviewPanel from "../panels/TimeOverviewPanel";
import OtherCostsPanel from "../panels/OtherCostsPanel";

export function WorkOrderDetails({
  selectedWorkOrder,
  selectedAvatarUrl,
  selectedAssignee,
  activeStatus,
  setActiveStatus,
  CopyPageU,
  onEdit,
  onRefreshWorkOrders, // ✅ added prop
  activePanel, // ✅ added from ToDoView
  setActivePanel, // ✅ added from ToDoView
}: any) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // ✅ Remove local state (already controlled by ToDoView)
  // const [activePanel, setActivePanel] = useState<"details" | "parts" | "time" | "cost">("details");

  // ✅ Edit
  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(selectedWorkOrder);
    } else if (selectedWorkOrder?.id) {
      navigate(`/work-orders/${selectedWorkOrder.id}/edit`);
    }
  }, [navigate, onEdit, selectedWorkOrder]);

  // ✅ Close dropdown when clicked outside
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

  // ✅ Delete flow
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

  // ✅ Conditional rendering for subpanels
  if (activePanel === "parts") {
    return (
      <UpdatePartsPanel
        onCancel={() => setActivePanel("details")}
        workOrderId={selectedWorkOrder?.id} // ✅ pass ID
        selectedWorkOrder={selectedWorkOrder} // optional full object
      />
    );
  }

  if (activePanel === "time") {
    return (
      <TimeOverviewPanel
        onCancel={() => setActivePanel("details")}
        workOrderId={selectedWorkOrder?.id} // ✅ pass ID
        selectedWorkOrder={selectedWorkOrder}
      />
    );
  }

  if (activePanel === "cost") {
    return (
      <OtherCostsPanel
        onCancel={() => setActivePanel("details")}
        workOrderId={selectedWorkOrder?.id} // ✅ pass ID
        selectedWorkOrder={selectedWorkOrder}
      />
    );
  }

  return (
    <>
      {/* HEADER */}
      <div className="p-6 border-b border-border relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-medium">
              {selectedWorkOrder?.title || "Untitled Work Order"}
            </h2>
            <CopyPageU />
          </div>

          <div className="flex items-center gap-2 relative">
            <button className="inline-flex items-center rounded border px-2 py-1.5 text-sm hover:bg-muted">
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

      {/* Delete Modal */}
      <DeleteWorkOrderModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* Deleted warning */}
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
                    disabled={isDeleting}
                    className={`h-16 w-20 rounded-lg border shadow-md inline-flex flex-col items-center justify-center gap-2 transition-all outline-none focus-visible:ring-[3px] focus-visible:border-ring ${active
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

        {/* DUE DATE / PRIORITY / ID */}
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

        {/* ASSIGNED TO */}
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

        {/* DESCRIPTION */}
        <div className="border-t p-6">
          <h3 className="text-sm font-medium mb-2">Description</h3>
          <p className="text-sm text-muted-foreground">
            {selectedWorkOrder?.description || "No description provided."}
          </p>
        </div>

        {/* ASSET / LOCATION / TIME / TYPE */}
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

        {/* SCHEDULE CONDITIONS */}
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

        {/* TIME & COST TRACKING */}
        <div className="border-t p-6">
          <h3 className="text-2xl font-medium mb-2">Time & Cost Tracking</h3>
          {["Parts", "Time", "Other Costs"].map((label) => {
            const isOtherCosts = label === "Other Costs";
            const otherCosts = selectedWorkOrder?.otherCosts || [];
            const totalEntries = otherCosts.length;
            const totalAmount = otherCosts.reduce(
              (sum, c) => sum + (Number(c.amount ?? c.cost ?? 0) || 0),
              0
            );

            return (
              <div
                key={label}
                className="flex justify-between items-center p-3 mb-2 border-b last:border-none"
              >
                <span className="text-sm font-medium">{label}</span>

                {/* --- Regular Add Button --- */}
                {!isOtherCosts || totalEntries === 0 ? (
                  <button
                    className="flex text-sm text-muted-foreground items-center gap-1"
                    onClick={() =>
                      setActivePanel(
                        label === "Parts"
                          ? "parts"
                          : label === "Time"
                            ? "time"
                            : "cost"
                      )
                    }
                  >
                    Add
                    <ChevronRight className="h-4 w-4 font-muted-foreground" />
                  </button>
                ) : (
                  /* --- When Other Costs have data --- */
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

        {/* CREATED / UPDATED */}
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
