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

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  batchDeleteProcedures,
  duplicateProcedure,
} from "../../store/procedures/procedures.thunks";
import type { AppDispatch, RootState } from "../../store";

import { ConfirmationModal } from "./GenerateProcedure/components/ConfirmationModal";
import { WorkOrderHistoryChart } from "../utils/WorkOrderHistoryChart";
import { format, subDays } from "date-fns";

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

type DateRange = { startDate: string; endDate: string };

// --- DetailsTabContent component ---
const DetailsTabContent = ({ procedure }: { procedure: any }) => {
  const createdDate = formatDisplayDate(procedure.createdAt);
  const updatedDate = formatDisplayDate(procedure.updatedAt);
  const procedureId = procedure.id || "N/A";

  const user = useSelector((state: RootState) => state.auth.user);
  const fullName = user?.fullName;

  // Helpers for display
  const assets = procedure.assets || [];
  const locations = procedure.locations || [];
  const teams = procedure.teams || [];

  // ✅ FIX: Robust extraction for categories
  // Checks for 'categories' (plural) first, then falls back to 'category' (singular) if needed
  let categories = procedure.categories || [];
  if (categories.length === 0 && procedure.category) {
    categories = Array.isArray(procedure.category)
      ? procedure.category
      : [procedure.category];
  }

  const renderBadgeList = (items: any[]) => {
    if (!items || items.length === 0)
      return <span className="text-sm text-gray-500">—</span>;
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => {
          // Handle both string IDs and Objects (API returns objects with name)
          const label =
            typeof item === "string"
              ? item
              : item.name || item.title || "Unknown";
          return (
            <span
              key={idx}
              className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 "
            >
              {label}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-8">
      {/* Created/Updated Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={16} className="text-blue-600" />
          <span>
            Created By{" "}
            <span className="font-semibold text-gray-900">
              {fullName || "Unknown User"}
            </span>{" "}
            on {createdDate}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-600 pl-8">
          <span>
            Last updated by{" "}
            <span className="font-semibold text-gray-900">
              {fullName || "Unknown User"}
            </span>{" "}
            on {updatedDate}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
        {/* Assets */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Assets</h4>
          {renderBadgeList(assets)}
        </div>

        {/* Locations */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Locations</h4>
          {renderBadgeList(locations)}
        </div>

        {/* Teams */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Teams in Charge
          </h4>
          {renderBadgeList(teams)}
        </div>

        {/* ✅ FIX: Explicitly added Categories Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Categories</h4>
          {renderBadgeList(categories)}
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
  onRefresh,
  onEdit,
}: {
  selectedProcedure: any;
  onRefresh: () => void;
  onEdit: (id: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"fields" | "details" | "history">(
    "fields"
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chartDateRanges, setChartDateRanges] = useState<
    Record<string, DateRange>
  >({
    "work-order-history": {
      startDate: format(subDays(new Date(), 7), "MM/dd/yyyy"),
      endDate: format(new Date(), "MM/dd/yyyy"),
    },
  });

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    setActiveTab("fields");
  }, [selectedProcedure]);

  const handleConfirmDelete = async () => {
    if (!selectedProcedure) return;

    try {
      await dispatch(batchDeleteProcedures([selectedProcedure.id])).unwrap();
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
      onRefresh();
    } catch (error) {
      console.error("Failed to duplicate procedure:", error);
      alert("Failed to duplicate procedure.");
    }
  };

  const handleUseInWorkOrder = () => {
    if (!selectedProcedure) return;

    navigate(`/work-orders/create?procedureId=${selectedProcedure.id}`, {
      state: {
        procedureData: selectedProcedure,
      },
    });
  };

  if (!selectedProcedure) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Select a template from the left panel</p>
      </div>
    );
  }

  // work order graph - filters and handler
  const filters = {
    procedureIds: selectedProcedure.id,
  };

  // Handler to update only the specific chart ID
  const handleDateRangeChange = (id: string, start: Date, end: Date) => {
    setChartDateRanges((prev) => ({
      ...prev,
      [id]: {
        startDate: format(start, "MM/dd/yyyy"),
        endDate: format(end, "MM/dd/yyyy"),
      },
    }));
  };

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
            <button
              onClick={() => onEdit(selectedProcedure.id)}
              className="inline-flex items-center rounded border border-blue-500 text-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-50"
            >
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

      {/* --- CONTENT --- */}
      <div className="flex-1 overflow-y-auto" style={{ background: "#f9fafb" }}>
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
          <WorkOrderHistoryChart
            id="work-order-history"
            title="Work Order History"
            workOrderHistory={selectedProcedure?.workOrders}
            filters={filters}
            dateRange={chartDateRanges["work-order-history"]}
            onDateRangeChange={handleDateRangeChange}
            groupByField="createdAt"
            lineName="Created"
            lineColor="#0091ff"
          />
        )}
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

      {/* --- Modals --- */}
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
