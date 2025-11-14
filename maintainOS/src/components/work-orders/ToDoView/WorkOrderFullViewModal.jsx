import React from "react";
import { X } from "lucide-react";
import { WorkOrderDetails } from "../ToDoView/WorkOrderDetails";

export default function WorkOrderFullViewModal({
  isOpen,
  onClose,
  workOrder,
}) {
  if (!isOpen || !workOrder) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">

      {/* MAIN MODAL BOX */}
      <div className="bg-white w-[92%] max-w-[1250px] max-h-[92vh] rounded-xl overflow-hidden shadow-2xl animate-in fade-in-50 slide-in-from-bottom-4">

        {/* 🔵 TOP BLUE HEADER — EXACT SAME AS YOUR SCREENSHOT */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">

          {/* LEFT — TITLE + ICON */}
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">
              {workOrder.title || "Untitled Work Order"}
            </h2>

            <a
              href="#"
              className="text-white underline text-sm opacity-90 hover:opacity-100"
            >
              🔗
            </a>
          </div>

          {/* CENTER DATE */}
          <div className="text-sm font-medium">
            Created on{" "}
            <span className="font-bold">
              {workOrder.createdAt
                ? new Date(workOrder.createdAt).toLocaleDateString("en-US")
                : "N/A"}
            </span>
          </div>

          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="text-white p-1 rounded-lg hover:bg-white/20 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* BODY AREA — SCROLLABLE CONTENT */}
        <div className="overflow-y-auto max-h-[82vh] bg-white">

          <WorkOrderDetails
            selectedWorkOrder={workOrder}
            selectedAvatarUrl={workOrder.assignees?.[0]?.avatar || ""}
            selectedAssignee={workOrder.assignees?.[0] || {}}
            activeStatus={workOrder.status}
            setActiveStatus={() => {}}
            CopyPageU={() => null}
            onEdit={() => {}}
            onRefreshWorkOrders={() => {}}
            activePanel="details"
            setActivePanel={() => {}}
          />

        </div>
      </div>
    </div>
  );
}
