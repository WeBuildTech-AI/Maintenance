"use client";

import { X } from "lucide-react";
import { useState } from "react";
import WorkOrderForm from "./panels/WorkOrderForm";
import ProcedurePanel from "./panels/ProcedurePanel";
import AssetsPanel from "./panels/AssetsPanel";
import InvitePanel from "./panels/InvitePanel";

export default function NewWorkOrderModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [panel, setPanel] = useState<"form" | "procedure" | "assets" | "invite">("form");

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          width: "85vw",
          height: "90vh",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {panel === "form" && "New Work Order"}
            {panel === "procedure" && "Add Procedure"}
            {panel === "assets" && "Add Assets"}
            {panel === "invite" && "Invite and Assign this work order"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto px-6 pt-6">
          {panel === "form" && <WorkOrderForm setPanel={setPanel} />}
          {panel === "procedure" && <ProcedurePanel setPanel={setPanel} />}
          {panel === "assets" && <AssetsPanel setPanel={setPanel} />}
          {panel === "invite" && <InvitePanel setPanel={setPanel} />}
        </div>

        {/* Footer */}
        {panel === "form" && (
          <div className="sticky bottom-0 mt-6 flex items-center border-t bg-white px-6 py-4">
            <button
              onClick={onClose}
              className="ml-auto h-10 rounded-md bg-orange-600 px-10 text-sm font-medium text-white shadow hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
