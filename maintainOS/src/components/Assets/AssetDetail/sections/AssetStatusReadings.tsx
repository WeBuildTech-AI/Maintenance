import { ChevronDown, ChevronRight, ChevronUp, Plus, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
// Make sure this path to your store is correct
import type { RootState, AppDispatch } from "../../../../store";
import { formatFriendlyDate } from "../../../utils/Date";
import { useState, useEffect } from "react";
import { Button } from "../../../ui/button";
// Make sure this path to your thunk is correct
import { updateAssetStatus } from "../../../../store/assets";

// --- Main Component ---
export function AssetStatusReadings({
  asset,
  fetchAssetsData,
}: {
  asset: any;
  fetchAssetsData?: () => void;
}) {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();

  const [assetStatus, setAssetStatus] = useState(asset?.status || "online");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAssetStatus(asset?.status || "online");
  }, [asset]);

  const statuses = [
    { name: "Online", value: "online", color: "bg-green-500" },
    { name: "Offline", value: "offline", color: "bg-red-500" },
    { name: "Do Not Track", value: "doNotTrack", color: "bg-gray-500" },
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

  // --- (Unchanged) handleModalSubmit handles the data correctly ---
  const handleModalSubmit = async (statusData: {
    status: string;
    notes?: string;
    offlineSince?: string;
    offlineFrom?: string;
    offlineTo?: string;
    downtimeType?: string; // This will now receive "Planned" or "Unplanned"
  }) => {
    if (!asset?.id) {
      console.error("Asset ID not found!");
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Dispatch the update
      if (!user?.id) {
        console.error("DEBUG: User ID not found in user object!", user);
        return;
      }
      await dispatch(
        updateAssetStatus({
          id: user?.id,
          // 'statusData' now contains all fields from the modal
          assetDataStatus: statusData,
        })
      ).unwrap();

      // Step 2: Call fetchAssetsData (if provided)
      if (typeof fetchAssetsData === "function") {
        fetchAssetsData();
      }

      // Step 3: Close the modal
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to update asset status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ... (The rest of your AssetStatusReadings JSX remains unchanged) ...
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Status</h2>
        <Button
          variant="ghost"
          className="gap-1 cursor-pointer text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-0 h-auto"
        >
          See More
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4">
        <div className="relative w-48">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex cursor-pointer items-center justify-between px-3 py-2 bg-white border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 ${getStatusColor(
                  assetStatus
                )} rounded-full`}
              ></div>
              <span className="text-gray-700 font-medium">
                {statuses.find((s) => s.value === assetStatus)?.name ||
                  assetStatus}
              </span>
            </div>
            {isDropdownOpen ? (
              <ChevronUp className="w-5 h-5 text-blue-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-blue-500" />
            )}
          </button>
          {isDropdownOpen && (
            <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleStatusSelection(status.value)}
                  className="w-full flex cursor-pointer items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-2 h-2 ${status.color} rounded-full`}></div>
                  <span className="text-gray-700">{status.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Last updated: <span className="font-medium">MaintainOS</span>,{" "}
          {formatFriendlyDate(asset?.updatedAt)}
        </p>
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
  // ... (This component remains unchanged)
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
  // ... (This component remains unchanged)
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
            className={`w-5 h-5 text-gray-500 transition-transform ${
              offlineSinceDropdown ? "rotate-180" : ""
            }`}
          />
        </button>
        {offlineSinceDropdown && (
          <div className="absolute w-full z-50 h-32 overflow-x-auto bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-30">
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

// --- (Unchanged) NEW HELPER COMPONENT ---
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
            required // Make required if custom date is chosen
          />
          <input
            type="time"
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required // Make required if custom date is chosen
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
            required // Make required if custom date is chosen
          />
          <input
            type="time"
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required // Make required if custom date is chosen
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
  const [downtimeType, setDowntimeType] = useState(""); // This will store "Planned" or "Unplanned"
  const [offlineSince, setOfflineSince] = useState("Now");
  const [notes, setNotes] = useState("");
  const [isNotesVisible, setIsNotesVisible] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toDate, setToDate] = useState("");
  const [toTime, setToTime] = useState("");

  const [statusDropdown, setStatusDropdown] = useState(false);
  const [downtimeDropdown, setDowntimeDropdown] = useState(false);
  const [offlineSinceDropdown, setOfflineSinceDropdown] = useState(false);

  const statuses = [
    { name: "Online", value: "online", color: "bg-green-500" },
    { name: "Offline", value: "offline", color: "bg-red-500" },
    { name: "Do Not Track", value: "doNotTrack", color: "bg-gray-500" },
  ];

  // --- MODIFIED: Changed from string[] to object[] ---
  const downtimeTypes = [
    {
      name: "Planned Mark Status at a plan if it's due to expected maintaince  inspections etc  ",
      value: "planned",
    },
    {
      name: "Unplanned Unplanned status update can be related to unexpected breakdowns etc ",
      value: "Unplanned",
    },
  ];

  const offlineSinceOptions = [
    "Now",
    "1 hour ago",
    "2 hours ago",
    "1 day ago",
    "Custom date", // This value triggers the new UI
  ];

  // --- MODIFIED: Form validity now checks for downtimeType ---
  const isFormValid = () => {
    if (!selectedStatus) return false;

    // Check downtimeType if status is offline
    if (selectedStatus === "offline" && !downtimeType) {
      return false;
    }

    // Check custom date if selected
    if (offlineSince === "Custom date") {
      return fromDate && fromTime && toDate && toTime;
    }

    return true; // Form is valid otherwise
  };

  // --- (Unchanged) Form Submit Handler (already correctly sends downtimeType) ---
  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormValid() || isLoading) return;

    const submitData: any = {
      status: selectedStatus,
    };

    if (isNotesVisible && notes) {
      submitData.notes = notes;
    }

    if (selectedStatus !== "online") {
      submitData.offlineSince = offlineSince;

      if (selectedStatus === "offline") {
        submitData.downtimeType = downtimeType; // Sends "Planned" or "Unplanned"
      }

      if (offlineSince === "Custom date") {
        submitData.offlineFrom = `${fromDate}T${fromTime}`;
        submitData.offlineTo = `${toDate}T${toTime}`;
      }
    }

    onSubmit(submitData);
  };

  const isAnyDropdownOpen =
    statusDropdown || downtimeDropdown || offlineSinceDropdown;

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
            className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div
            className={`p-6 space-y-4 max-h-[70vh] ${
              isAnyDropdownOpen ? "overflow-visible" : "overflow-y-auto"
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
                      className={`w-2.5 h-2.5 ${
                        statuses.find((s) => s.value === selectedStatus)?.color
                      } rounded-full`}
                    ></div>
                    <span>
                      {statuses.find((s) => s.value === selectedStatus)?.name ||
                        selectedStatus}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-blue-500 transition-transform ${
                      statusDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {statusDropdown && (
                  <div className="absolute w-full bg-white cursor-pointer border border-gray-200 rounded-md shadow-lg mt-1 z-30">
                    {statuses.map((status) => (
                      <button
                        type="button"
                        key={status.value}
                        onClick={() => {
                          setSelectedStatus(status.value);
                          setStatusDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
                      >
                        <div
                          className={`w-2 h-2 ${status.color} rounded-full`}
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

            {/* --- MODIFIED: Conditional Fields --- */}

            {/* Show Downtime Type only if status is "offline" */}
            {selectedStatus === "offline" && (
              <div>
                {/* --- MODIFIED: Updated required text --- */}
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Downtime Type <span className="text-red-500">(required)</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDowntimeDropdown(!downtimeDropdown)}
                    className="w-full flex cursor-pointer items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {/* --- MODIFIED: Find name from object array --- */}
                    <span>
                      {downtimeTypes.find((t) => t.value === downtimeType)
                        ?.name || "Select downtime type"}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        downtimeDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {downtimeDropdown && (
                    <div className="absolute z-50  w-full bg-white cursor-pointer border border-gray-200 rounded-md shadow-lg mt-1 z-30">
                      {/* --- MODIFIED: Map over object array --- */}
                      {downtimeTypes.map((type) => (
                        <button
                          type="button"
                          key={type.value} // Use value for key
                          onClick={() => {
                            setDowntimeType(type.value); // Set value to state
                            setDowntimeDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50"
                        >
                          {type.name} {/* Show name in UI */}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Show "Offline Since" logic only if status is NOT "online" */}
            {selectedStatus !== "online" && (
              <>
                <OfflineSinceDropdown
                  offlineSince={offlineSince}
                  setOfflineSince={setOfflineSince}
                  offlineSinceDropdown={offlineSinceDropdown}
                  setOfflineSinceDropdown={setOfflineSinceDropdown}
                  offlineSinceOptions={offlineSinceOptions}
                />

                {/* --- (Unchanged) Conditionally render CustomDateRangePicker --- */}
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
              </>
            )}
            {/* --- END MODIFIED: Conditional Fields --- */}
          </div>

          {/* Footer (Unchanged) */}
          <div className="flex items-center justify-between cursor-pointer px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid() || isLoading} // This correctly uses the updated isFormValid
              className="px-6 py-2 rounded-md bg-orange-600 font-medium text-white disabled:bg-orange-300"
            >
              {isLoading ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
