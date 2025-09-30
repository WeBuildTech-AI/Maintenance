"use client";

import { useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { NewWorkOrderForm } from "./NewWorkOrderForm";
import { AddProcedurePanel } from "./WorkloadView/Modal/AddProcedurePanel";
import { AddAssetsPanel } from "./WorkloadView/Modal/AddAssetsPanel";
import { InviteAssignPanel } from "./WorkloadView/Modal/InviteAssignPanel";

export type WorkOrderModalView = "FORM" | "PROCEDURE" | "ASSETS" | "INVITE";

export default function NewWorkOrderModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [view, setView] = useState<WorkOrderModalView>("FORM");

  if (!isOpen) return null;

  const showBack = view !== "FORM";
  const title =
    view === "FORM"
      ? "New Work Order"
      : view === "PROCEDURE"
      ? "Add Procedure"
      : view === "ASSETS"
      ? "Add Assets"
      : "Invite New Member";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
    >
      <div
        className="w-[900px] max-w-[95vw] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden"
        style={{ height: "90vh", maxHeight: "900px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                onClick={() => setView("FORM")}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={() => {
              setView("FORM");
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Fixed size Body (only content swap hoga) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          {view === "FORM" && (
            <NewWorkOrderForm
              onCreate={() => onClose()}
              onOpenProcedure={() => setView("PROCEDURE")}
              onOpenAssets={() => setView("ASSETS")}
              onOpenInvite={() => setView("INVITE")}
            />
          )}

          {view === "PROCEDURE" && (
            <AddProcedurePanel onCreateNew={() => setView("FORM")} />
          )}

          {view === "ASSETS" && (
            <AddAssetsPanel
              assets={[
                { id: "1", name: "HVAC" },
                { id: "2", name: "Pump" },
                { id: "3", name: "AHU-01" },
              ]}
              onAdd={() => setView("FORM")}
              onCancel={() => setView("FORM")}
            />
          )}

          {view === "INVITE" && (
            <InviteAssignPanel
              onCancel={() => setView("FORM")}
              onInvite={() => setView("FORM")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
