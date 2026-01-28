import { ChevronDown, ChevronRight, ChevronUp, Plus, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
// Make sure this path to your store is correct
import type { RootState, AppDispatch } from "../../../../store";
import { formatFriendlyDate } from "../../../utils/Date";
import { useState, useEffect } from "react";
import { Button } from "../../../ui/button";
// Make sure this path to your thunk is correct
import { assetService, updateAssetStatus } from "../../../../store/assets";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import NewWorkOrderModal from "../../../work-orders/NewWorkOrderModal";

// --- Main Component ---
// --- Main Component ---
export function AssetStatusReadings({
  asset,
  fetchAssetsData,
  setSeeMoreAssetStatus,
  seeMoreFlag,
  getAssetStatusLog,
  updatedUser, // ✅ Prop for correct user
  lastUpdatedDate, // ✅ Prop for correct date
}: {
  asset: any;
  fetchAssetsData?: (force?: boolean) => void;
  setSeeMoreAssetStatus: (value: boolean) => void;
  seeMoreFlag: boolean;
  getAssetStatusLog?: () => void;
  updatedUser?: string;
  lastUpdatedDate?: string | null;
}) {
  const user = useSelector((state: RootState) => state.auth.user);

  const [assetStatus, setAssetStatus] = useState(asset?.status || "online");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAssetStatus(asset?.status || "online");
  }, [asset]);

  // Offline work order prompt
  const [isOfflinePromptOpen, setIsOfflinePromptOpen] = useState(false);
  const [isNewWorkOrderModalOpen, setIsNewWorkOrderModalOpen] = useState(false);
  const [woPrefillData, setWoPrefillData] = useState<any>(null);
  const navigate = useNavigate();

  const statuses = [
    { name: "Online", value: "online", color: "bg-green-500" },
    { name: "Offline", value: "offline", color: "bg-red-500" },
    { name: "Do Not Track", value: "doNotTrack", color: "bg-orange-500" },
  ];

  const getStatusColor = (statusValue: string) => {
    const status = statuses.find((s) => s.value === statusValue);
    return status ? status.color : "bg-gray-400";
  };

  const handleStatusSelection = (newStatusValue: string) => {
    setIsDropdownOpen(false);
    if (newStatusValue !== assetStatus) {
      setStatusToUpdate(newStatusValue);
      setIsModalOpen(true);
    }
  };

  const handleModalSubmit = async (statusData: {
    status: string;
    notes?: string;
    since?: string;
    to?: string;
    downtimeType?: string;
  }) => {
    if (!asset?.id) {
      console.error("Asset ID not found!");
      return;
    }

    if (!user?.id) {
      console.error("User ID not found!");
      return;
    }

    setIsLoading(true);
    try {
      const finalStatusData = {
        ...statusData,
      };

      console.log("Submitting to backend:", finalStatusData);

      await assetService.updateAssetStatus(asset.id, finalStatusData);

      // IMPORTANT FIX — UPDATE UI IMMEDIATELY
      setAssetStatus(finalStatusData.status);

      // Optional refetch
      if (typeof fetchAssetsData === "function") {
        fetchAssetsData(true);
      }
      if (typeof getAssetStatusLog === "function") {
        getAssetStatusLog();
      }

      setIsModalOpen(false);
      toast.success("Asset Status Successfully updated");

      // ✅ Check if status changed to offline - show work order prompt
      if (finalStatusData.status?.toLowerCase() === 'offline') {
        setIsOfflinePromptOpen(true);
      }
    } catch (error: any) {
      console.error("Failed to update asset status:", error);
      toast.error(error?.message || "Failed to update Asset Status");
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ... (Baaki ka JSX code same rahega) ...
  return (
    <div>
      {isModalOpen && statusToUpdate && (
        <UpdateAssetStatusModal
          initialStatus={statusToUpdate}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          isLoading={isLoading}
        />
      )}

      {/* \u2705 Offline Work Order Prompt */}
      <OfflinePromptModal
        isOpen={isOfflinePromptOpen}
        onClose={() => setIsOfflinePromptOpen(false)}
        onCreateWorkOrder={() => {
          setIsOfflinePromptOpen(false);
          setWoPrefillData({
            assetIds: [asset.id],
            assetName: asset.name,
            locationId: asset.locationId,
            locationName: asset.location?.name,
            assetStatus: "offline",
            assetStatusSince: new Date().toISOString(),
          });
          setIsNewWorkOrderModalOpen(true);
        }}
      />

      {/* ✅ Inline New Work Order Modal */}
      <NewWorkOrderModal
        isOpen={isNewWorkOrderModalOpen}
        onClose={() => setIsNewWorkOrderModalOpen(false)}
        prefillData={woPrefillData}
      />
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Status</h2>
        {seeMoreFlag === false ? null : (
          <Button
            onClick={() => setSeeMoreAssetStatus?.()}
            className="gap-1 bg-white p-2 cursor-pointer text-orange-600 hover:text-orange-600 hover:bg-orange-50  h-auto"
          >
            See More
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="space-y-4">
        <div className="relative w-48">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex cursor-pointer items-center justify-between px-3 py-2 bg-white border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 ${getStatusColor(
                  assetStatus
                )} rounded-full`}
              ></div>
              <span className="text-gray-700 font-medium">
                {statuses.find((s) => s.value === assetStatus)?.name ||
                  assetStatus}
              </span>
            </div>
            {isDropdownOpen ? (
              <ChevronUp className="w-5 h-5 text-orange-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-orange-500" />
            )}
          </button>
          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleStatusSelection(status.value)}
                  className="w-full flex cursor-pointer items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-3 h-3 ${status.color} rounded-full`}></div>

                  <span className="text-gray-700">{status.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {seeMoreFlag === false ? null : (
          <p className="text-sm text-muted-foreground">
            Last updated :{" "}
            <span className="font-medium text-orange-600 capitalize">
              {updatedUser || "Unknown"}
            </span>{" "}
            , {formatFriendlyDate(lastUpdatedDate || asset?.updatedAt)}
          </p>
        )}
      </div>
    </div>
  );
}

// --- Helper Components (Unchanged) ---
const NotesSection = ({
  isNotesVisible,
  setIsNotesVisible,
  notes,
  setNotes,
}: {
  isNotesVisible: boolean;
  setIsNotesVisible: (value: boolean) => void;
  notes: string;
  setNotes: (value: string) => void;
}) => {
  if (!isNotesVisible) {
    return (
      <button
        type="button"
        onClick={() => setIsNotesVisible(true)}
        className="flex items-center gap-2 text-blue-600 cursor-pointer hover:text-blue-700 font-medium"
      >
        <Plus className="w-4 h-4" /> Add notes
      </button>
    );
  }
  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        Notes
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add any relevant details..."
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        rows={3}
      />
    </div>
  );
};

const OfflineSinceDropdown = ({
  offlineSince,
  setOfflineSince,
  offlineSinceDropdown,
  setOfflineSinceDropdown,
  offlineSinceOptions,
}: {
  offlineSince: string;
  setOfflineSince: (value: string) => void;
  offlineSinceDropdown: boolean;
  setOfflineSinceDropdown: (value: boolean) => void;
  offlineSinceOptions: string[];
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        Offline Since
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOfflineSinceDropdown(!offlineSinceDropdown)}
          className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <span>{offlineSince}</span>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${offlineSinceDropdown ? "rotate-180" : ""
              }`}
          />
        </button>
        {offlineSinceDropdown && (
          <div className="absolute w-full z-50 h-32 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-30">
            {offlineSinceOptions.map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => {
                  setOfflineSince(opt);
                  setOfflineSinceDropdown(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-50"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CustomDateRangePicker = ({
  fromDate,
  setFromDate,
  fromTime,
  setFromTime,
  toDate,
  setToDate,
  toTime,
  setToTime,
}: {
  fromDate: string;
  setFromDate: (val: string) => void;
  fromTime: string;
  setFromTime: (val: string) => void;
  toDate: string;
  setToDate: (val: string) => void;
  toTime: string;
  setToTime: (val: string) => void;
}) => {
  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-md bg-gray-50 -mx-2">
      {/* From Row */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          From:
        </label>
        <div className="flex gap-4">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <input
            type="time"
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      {/* To Row */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          To:
        </label>
        <div className="flex gap-4">
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <input
            type="time"
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>
    </div>
  );
};
// --- END NEW HELPER COMPONENT ---

// --- Modal Component (MODIFIED) ---
export function UpdateAssetStatusModal({
  initialStatus,
  onClose,
  onSubmit,
  isLoading,
}: {
  initialStatus: string;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [downtimeType, setDowntimeType] = useState("");
  const [offlineSince, setOfflineSince] = useState("Now"); // UI state
  const [notes, setNotes] = useState("");
  const [isNotesVisible, setIsNotesVisible] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toDate, setToDate] = useState("");
  const [toTime, setToTime] = useState("");

  const [statusDropdown, setStatusDropdown] = useState(false);
  const [downtimeDropdown, setDowntimeDropdown] = useState(false);
  const [offlineSinceDropdown, setOfflineSinceDropdown] = useState(false);
  const [offlineReason, setOfflineReason] = useState("");
  const [reasonDropdown, setReasonDropdown] = useState(false);


  const statuses = [
    { name: "Online", value: "online", color: "bg-green-500" },
    { name: "Offline", value: "offline", color: "bg-red-500" },
    { name: "Do Not Track", value: "doNotTrack", color: "bg-orange-500" },
  ];

  // --- +++++++ YAHAN BADLAAV KIYA GAYA HAI +++++++ ---
  const downtimeTypes = [
    {
      name: "Planned Mark Status at a plan if it's due to expected maintaince  inspections etc  ",
      value: "planned", // Lowercase "p" (jaisa curl mein hai)
    },
    {
      name: "Unplanned Unplanned status update can be related to unexpected breakdowns etc ",
      value: "unplanned", // <-- MODIFIED: Lowercase "u"
    },
  ];
  // --- +++++++ BADLAAV KHATM +++++++ ---
  //
  const offlineReasons = [
  { name: "Electrical Fault", value: "electrical_fault" },
  { name: "Equipment Failure", value: "equipment_failure" },
  { name: "Inspection", value: "inspection" },
  { name: "Operator Error", value: "operator_error" },
  { name: "Planned Maintenance", value: "planned_maintenance" },
  { name: "Tool Failure", value: "tool_failure" },
  ];

  const offlineSinceOptions = [
    "Now",
    "1 hour ago",
    "2 hours ago",
    "1 day ago",
    "Custom date",
  ];

  const isFormValid = () => {
    if (!selectedStatus) return false;
    // Modified: Check both downtimeType AND offlineReason
    if (selectedStatus === "offline") {
      if (!downtimeType || !offlineReason) return false;
    }
    if (offlineSince === "Custom date") {
      return fromDate && fromTime && toDate && toTime;
    }
    return true;
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormValid() || isLoading) return;

    const submitData: any = {
      status: selectedStatus,
    };

    if (isNotesVisible && notes) {
      submitData.notes = notes;
    }

    // --- CHANGE 1: Sirf 'downtimeType' ke liye check karein ki status offline hai ya nahi ---
    if (selectedStatus === "offline") {
      submitData.downtimeType = downtimeType;
      // ✅ ADDED: downtimeReason is required
      submitData.downtimeReason = offlineReason;
    }

    // --- CHANGE 2: Date calculation logic ko bahar nikaal diya ---
    // Ab ye logic 'online', 'offline' aur 'doNotTrack' sabke liye chalega
    const now = new Date();

    switch (offlineSince) {
      case "Now":
        submitData.since = now.toISOString();
        break;
      case "1 hour ago":
        now.setHours(now.getHours() - 1);
        submitData.since = now.toISOString();
        break;
      case "2 hours ago":
        now.setHours(now.getHours() - 2);
        submitData.since = now.toISOString();
        break;
      case "1 day ago":
        now.setDate(now.getDate() - 1);
        submitData.since = now.toISOString();
        break;
      case "Custom date":
        if (fromDate && fromTime) {
          submitData.since = new Date(`${fromDate}T${fromTime}`).toISOString();
        }
        if (toDate && toTime) {
          submitData.to = new Date(`${toDate}T${toTime}`).toISOString();
        }
        break;
      default:
        submitData.since = now.toISOString();
    }

    console.log("Submitting Data:", submitData); // Debugging ke liye check kar lein
    onSubmit(submitData);
  };

  const isAnyDropdownOpen =
    statusDropdown || downtimeDropdown || offlineSinceDropdown || reasonDropdown;


  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <div className="bg-white rounded-lg shadow-lg w-130 max-w-full">
        {/* Header (Unchanged) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Update Asset Status
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 cursor-pointer hover:text-gray-600 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div
            className={`p-6 space-y-4 max-h-[70vh] ${isAnyDropdownOpen ? "overflow-visible" : "overflow-y-auto"
              }`}
          >
            {/* Status Dropdown (Unchanged) */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Status <span className="text-gray-500">(required)</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setStatusDropdown(!statusDropdown)}
                  className="w-full flex cursor-pointer items-center justify-between px-3 py-2 bg-white border-2 border-blue-500 rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 ${statuses.find((s) => s.value === selectedStatus)?.color
                        } rounded-full`}
                    ></div>
                    <span>
                      {statuses.find((s) => s.value === selectedStatus)?.name ||
                        selectedStatus}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-blue-500 transition-transform ${statusDropdown ? "rotate-180" : ""
                      }`}
                  />
                </button>
                {statusDropdown && (
                  <div className="absolute w-full z-50 bg-white cursor-pointer border border-gray-200 rounded-md shadow-lg mt-1 z-30">
                    {statuses.map((status) => (
                      <button
                        type="button"
                        key={status.value}
                        onClick={() => {
                          setSelectedStatus(status.value);
                          setStatusDropdown(false);
                        }}
                        className="w-full flex z-50 items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
                      >
                        <div
                          className={`w-3 h-3 ${status.color} rounded-full`}
                        ></div>
                        <span className="text-gray-700">{status.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes Section (Unchanged) */}
            <NotesSection
              isNotesVisible={isNotesVisible}
              setIsNotesVisible={setIsNotesVisible}
              notes={notes}
              setNotes={setNotes}
            />

            {/* --- Conditional Fields (Unchanged) --- */}
            {selectedStatus === "offline" && (

              <div className="space-y-4">
                
                {/* downtimetype */}
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Downtime Type <span className="text-red-500">(required)</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDowntimeDropdown(!downtimeDropdown)}
                    className="w-full capitalize flex cursor-pointer items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <span>
                      {downtimeTypes.find((t) => t.value === downtimeType)
                        ?.value || "Select downtime type"}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform ${downtimeDropdown ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                  {downtimeDropdown && (
                    <div className="absolute z-50  w-full bg-white cursor-pointer border border-gray-200 rounded-md shadow-lg mt-1 z-30">
                      {downtimeTypes.map((type) => (
                        <button
                          type="button"
                          key={type.value}
                          onClick={() => {
                            setDowntimeType(type.value); // Yeh ab "planned" ya "unplanned" set karega
                            setDowntimeDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50"
                        >
                          {type.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                    
                    {/* ✅ Reason Dropdown (AFTER Downtime Type) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Downtime Reason <span className="text-red-500">(required)</span>
                      </label>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setReasonDropdown(!reasonDropdown)}
                          className="w-full capitalize flex cursor-pointer items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          <span>
                            {offlineReasons.find((r) => r.value === offlineReason)?.name ||
                              "Select reason"}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-500 transition-transform ${
                              reasonDropdown ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {reasonDropdown && (
                          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1" style={{
                              maxHeight: "120px", // shows ~3 items
                              overflowY: "auto",
                            }}
                          >

                            {offlineReasons.map((reason) => (
                              <button
                                type="button"
                                key={reason.value}
                                onClick={() => {
                                  setOfflineReason(reason.value);
                                  setReasonDropdown(false);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-gray-50"
                              >
                                {reason.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                
              </div>
            )}



            <OfflineSinceDropdown
              offlineSince={offlineSince}
              setOfflineSince={setOfflineSince}
              offlineSinceDropdown={offlineSinceDropdown}
              setOfflineSinceDropdown={setOfflineSinceDropdown}
              offlineSinceOptions={offlineSinceOptions}
            />

            {offlineSince === "Custom date" && (
              <CustomDateRangePicker
                fromDate={fromDate}
                setFromDate={setFromDate}
                fromTime={fromTime}
                setFromTime={setFromTime}
                toDate={toDate}
                setToDate={setToDate}
                toTime={toTime}
                setToTime={setToTime}
              />
            )}
          </div>

          {/* Footer (Unchanged) */}
          <div className="flex items-center justify-between cursor-pointer px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Button
              className="cursor-pointer bg-gray-50 text-black  border border-orange-600"
              onClick={onClose}
              disabled={isLoading}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className="px-6 py-2 cursor-pointer rounded-md bg-orange-600 font-medium text-white disabled:bg-orange-300"
            >
              {isLoading ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// \u2705 Offline Asset Work Order Prompt Modal
interface OfflinePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkOrder: () => void;
}

function OfflinePromptModal({ isOpen, onClose, onCreateWorkOrder }: OfflinePromptModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.3)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "400px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          padding: "24px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Your asset is offline
        </h2>
        <p className="text-gray-600 mb-6">
          Would you like to create a work order for this offline asset?
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            onClick={onClose}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </Button>
          <Button
            onClick={onCreateWorkOrder}
            className="bg-orange-600 text-white hover:bg-orange-700"
          >
            Create Work Order
          </Button>
        </div>
      </div>
    </div>
  );
}
