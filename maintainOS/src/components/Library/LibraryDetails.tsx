import {
  Building2,
  ClipboardList,
  MoreVertical,
  Pencil,
  User,
} from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { ProcedureForm } from "./GenerateProcedure/components/ProcedureForm";
import { MoreActionsMenu } from "./GenerateProcedure/components/MoreActionsMenu";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
// --- 👇 [CHANGE] 'deleteProcedure' ko 'batchDeleteProcedures' se replace kiya ---
import { batchDeleteProcedures, duplicateProcedure } from "../../store/procedures/procedures.thunks"; 
import type { AppDispatch } from "../../store"; 

import { ConfirmationModal } from "./GenerateProcedure/components/ConfirmationModal";

// --- Helper function to format dates ---
function formatDisplayDate(dateString: string) {
  if (!dateString) return "N/A";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(dateString));
  } catch (error) {
    return dateString;
  }
}

// --- DetailsTabContent component (koi change nahi) ---
const DetailsTabContent = ({ procedure }: { procedure: any }) => {
  const createdDate = formatDisplayDate(procedure.createdAt);
  const updatedDate = formatDisplayDate(procedure.updatedAt);
  const procedureId = procedure.id || "N/A";

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={16} className="text-blue-600" />
          <span>
            Created By{" "}
            <span className="font-semibold text-gray-900">sumit sahani</span> on{" "}
            {createdDate}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-600 pl-8">
          <span>Last updated on {updatedDate}</span>
        </div>
      </div>
      <div className="pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-2">Procedure ID</p>
        <span
          title={procedureId}
          className="inline-block max-w-full bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full truncate"
        >
          #{procedureId}
        </span>
      </div>
    </div>
  );
};

// --- Main LibraryDetails Component ---
export function LibraryDetails({
  selectedProcedure,
  onRefresh, // <-- YEH PROP ZAROORI HAI
}: {
  selectedProcedure: any;
  onRefresh: () => void; 
}) {
  const [activeTab, setActiveTab] = useState<"fields" | "details" | "history">(
    "fields"
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate(); 

  useEffect(() => {
    setActiveTab("fields");
  }, [selectedProcedure]);

  const handleConfirmDelete = async () => {
    if (!selectedProcedure) return;

    try {
      // --- 👇 [CHANGE] Ab 'batchDeleteProcedures' ko array ke saath call karein ---
      await dispatch(batchDeleteProcedures([selectedProcedure.id])).unwrap();
      
      // --- 👇 YEH HAI FIX: 'onRefresh' ko call karein ---
      onRefresh(); 
      
      navigate("/library");
    } catch (error) {
      console.error("Failed to delete procedure:", error);
      alert("Failed to delete procedure.");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleDeleteClick = () => {
    if (!selectedProcedure) return;
    setIsDeleteModalOpen(true);
  };

  const handleDuplicate = async () => {
    if (!selectedProcedure) return;

    try {
      await dispatch(duplicateProcedure(selectedProcedure.id)).unwrap();
      
      // --- 👇 YEH HAI FIX: 'onRefresh' ko call karein ---
      onRefresh();

    } catch (error) {
      console.error("Failed to duplicate procedure:", error);
      alert("Failed to duplicate procedure.");
    }
  };

  // --- (NEW) "Use in Work Order" button ke liye handler ---
  const handleUseInWorkOrder = () => {
    if (!selectedProcedure) return;
    navigate(`/work-orders/create?procedureId=${selectedProcedure.id}`);
  };

  if (!selectedProcedure) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Select a template from the left panel</p>
      </div>
    );
  }

  const rootFields = selectedProcedure.fields || [];
  const rootHeadings = selectedProcedure.headings || [];
  const sections = selectedProcedure.sections || [];

  return (
    <div className="flex flex-col h-full relative bg-transparent">
      {/* --- HEADER --- */}
      <div className="pt-6 border-b border-border relative px-6">
        <div className="flex items-center justify-between">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-blue-400">
              <ClipboardList size={20} />
            </div>
            <h2 className="text-lg font-medium">
              {selectedProcedure?.title || "Untitled Procedure"}
            </h2>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 relative">
            <button className="inline-flex items-center rounded border border-blue-500 text-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-50">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </button>
            <MoreActionsMenu 
              onDelete={handleDeleteClick}
              onDuplicate={handleDuplicate}
            >
              <button className="inline-flex items-center rounded p-2 text-blue-600 hover:text-blue-700 relative">
                <MoreVertical className="h-4 w-4" />
              </button>
            </MoreActionsMenu>
          </div>
        </div>

        {/* --- TABS --- */}
        <div className="border-b pt-2 border-gray-200">
          <nav className="flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("fields")}
              className={`flex-1 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm text-center ${
                activeTab === "fields"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Fields
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`flex-1 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm text-center ${
                activeTab === "details"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm text-center ${
                activeTab === "history"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              History
            </button>
          </nav>
        </div>
      </div>

      {/* --- CONDITIONAL CONTENT --- */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ background: "#f9fafb" }}
      >
        {activeTab === "fields" && (
          <div className="p-6">
            <ProcedureForm
              rootFields={rootFields}
              rootHeadings={rootHeadings}
              sections={sections}
              resetKey={selectedProcedure.id}
            />
          </div>
        )}

        {activeTab === "details" && (
          <DetailsTabContent procedure={selectedProcedure} />
        )}

        {activeTab === "history" && (
          <div className="p-6 text-center text-gray-500">
            Loading
          </div>
        )}

        <div style={{ height: 96 }} />
      </div>

      {/* --- FLOATING BUTTON --- */}
      <div
        style={{
          position: "absolute",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      >
        <Button
          variant="outline"
          onClick={handleUseInWorkOrder}
          className="text-yellow-600 border-2 border-yellow-400 hover:bg-yellow-50 px-8 py-3 rounded-full shadow-lg bg-white font-medium whitespace-nowrap"
        >
          <Building2 className="w-5 h-5 mr-2" />
          Use in New Work Order
        </Button>
      </div>

      {/* --- Confirmation Modal --- */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Procedure" 
        message={`Are you sure you want to delete "${selectedProcedure?.title}"?`}
      />
    </div>
  );
}