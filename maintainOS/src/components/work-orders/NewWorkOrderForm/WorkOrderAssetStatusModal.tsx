import { X, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../../ui/button";
import { DynamicSelect } from "./DynamicSelect";

interface StatusData {
  status: string;
  notes?: string;
  since?: string;
  to?: string;
  downtimeType?: string;
}

interface Props {
  initialStatus: string;
  initialNotes?: string;
  initialDowntimeType?: string;
  initialSince?: string;
  initialTo?: string;
  onClose: () => void;
  onSubmit: (data: StatusData) => void;
}

// --- Helper Components ---

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
  if (!isNotesVisible && !notes) {
    return (
      <button
        type="button"
        onClick={() => setIsNotesVisible(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#2563eb", // blue-600
          cursor: "pointer",
          fontWeight: 500,
          background: "none",
          border: "none",
          padding: 0,
        }}
      >
        <Plus className="w-4 h-4" /> Add notes
      </button>
    );
  }
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "14px",
          fontWeight: 500,
          color: "#111827", // gray-900
          marginBottom: "8px",
        }}
      >
        Notes
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add any relevant details..."
        style={{
          width: "100%",
          padding: "8px",
          border: "1px solid #d1d5db", // gray-300
          borderRadius: "4px",
          outline: "none",
          minHeight: "80px",
        }}
      />
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
  const inputStyle = {
    width: "100%",
    padding: "8px",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    outline: "none",
  };

  return (
    <div
      style={{
        padding: "16px",
        border: "1px solid #e5e7eb", // border-gray-200
        borderRadius: "4px",
        backgroundColor: "#f9fafb", // bg-gray-50
        margin: "0 -8px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            color: "#111827",
            marginBottom: "8px",
          }}
        >
          From:
        </label>
        <div style={{ display: "flex", gap: "16px" }}>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="time"
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
            style={inputStyle}
            required
          />
        </div>
      </div>

      <div>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            color: "#111827",
            marginBottom: "8px",
          }}
        >
          To:
        </label>
        <div style={{ display: "flex", gap: "16px" }}>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="time"
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
            style={inputStyle}
            required
          />
        </div>
      </div>
    </div>
  );
};

export function WorkOrderAssetStatusModal({
  initialStatus,
  initialNotes = "",
  initialDowntimeType = "",
  initialSince,
  initialTo,
  onClose,
  onSubmit,
}: Props) {
  const [selectedStatus, setSelectedStatus] = useState(initialStatus || "online");
  const [downtimeType, setDowntimeType] = useState(initialDowntimeType);
  const [notes, setNotes] = useState(initialNotes);
  const [isNotesVisible, setIsNotesVisible] = useState(!!initialNotes);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null); // ✅ New State

  const parseDate = (isoString?: string) => {
    if (!isoString) return { date: "", time: "" };
    try {
      const d = new Date(isoString);
      return {
        date: d.toISOString().split("T")[0],
        time: d.toTimeString().slice(0, 5),
      };
    } catch {
      return { date: "", time: "" };
    }
  };

  const initialFrom = parseDate(initialSince);
  const initialToParsed = parseDate(initialTo);

  const [offlineSince, setOfflineSince] = useState(
    initialSince ? "Custom date" : "Now"
  );

  const [fromDate, setFromDate] = useState(initialFrom.date);
  const [fromTime, setFromTime] = useState(initialFrom.time);
  const [toDate, setToDate] = useState(initialToParsed.date);
  const [toTime, setToTime] = useState(initialToParsed.time);

  const isFormValid = () => {
    if (!selectedStatus) return false;
    if (selectedStatus === "offline" && !downtimeType) {
      return false;
    }
    if (offlineSince === "Custom date") {
      return fromDate && fromTime && toDate && toTime;
    }
    return true;
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormValid()) return;

    const submitData: StatusData = {
      status: selectedStatus,
      notes: notes,
    };

    if (selectedStatus === "offline") {
      submitData.downtimeType = downtimeType;
    } else {
      submitData.downtimeType = "";
    }

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

    onSubmit(submitData);
  };

  // Maps for DynamicSelect
  const statusOptions = [
    { id: "online", name: "Online", color: "#22c55e" }, // green-500
    { id: "offline", name: "Offline", color: "#ef4444" }, // red-500
    { id: "doNotTrack", name: "Do Not Track", color: "#EAB308" }, // yellow-500
  ];

  const downtimeOptions = [
    { id: "planned", name: "Planned Maintenance" },
    { id: "unplanned", name: "Unplanned Repairs" },
  ];

  const sinceOptions = [
    { id: "Now", name: "Now" },
    { id: "1 hour ago", name: "1 hour ago" },
    { id: "2 hours ago", name: "2 hours ago" },
    { id: "1 day ago", name: "1 day ago" },
    { id: "Custom date", name: "Custom date" },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "4px", // ✅ Reduced Border Radius
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          width: "500px",
          maxWidth: "100%",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "#111827",
              margin: 0,
            }}
          >
            Update Asset Status
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#9ca3af",
              cursor: "pointer",
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              height: "350px", // ✅ Fixed Height to prevent resizing jumps
              overflowY: "auto",
              paddingBottom: activeDropdown ? "150px" : "24px", // Spacer for dropdown scrolling
            }}
          >
            {/* Status Dropdown */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#111827",
                  marginBottom: "8px",
                }}
              >
                Status <span style={{ color: "#6b7280" }}>(required)</span>
              </label>
              <div style={{ position: "relative", zIndex: activeDropdown === "status-modal" ? 50 : 20 }}>
                <DynamicSelect
                    name="status-modal"
                    placeholder="Select status..."
                    options={statusOptions}
                    loading={false}
                    value={selectedStatus}
                    onSelect={(val) => setSelectedStatus(val as string)}
                    onFetch={() => {}}
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                    className="w-full"
                    dropdownStyle={{ maxHeight: "135px" }} // ✅ Limit to ~3 items
                />
              </div>
            </div>

            {/* Notes Section */}
            <NotesSection
              isNotesVisible={isNotesVisible}
              setIsNotesVisible={setIsNotesVisible}
              notes={notes}
              setNotes={setNotes}
            />

            {/* --- Conditional Fields --- */}

            {selectedStatus === "offline" && (
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#111827",
                    marginBottom: "8px",
                  }}
                >
                  Downtime Type <span style={{ color: "#ef4444" }}>(required)</span>
                </label>
                <div style={{ position: "relative", zIndex: activeDropdown === "downtime-modal" ? 50 : 15 }}>
                     <DynamicSelect
                        name="downtime-modal"
                        placeholder="Select downtime type"
                        options={downtimeOptions}
                        loading={false}
                        value={downtimeType || ""}
                        onSelect={(val) => setDowntimeType(val as string)}
                        onFetch={() => {}}
                        activeDropdown={activeDropdown}
                        setActiveDropdown={setActiveDropdown}
                        className="w-full"
                        dropdownStyle={{ maxHeight: "135px" }} // ✅ Limit to ~3 items
                    />
                </div>
              </div>
            )}

            <div style={{ position: "relative", zIndex: activeDropdown === "since-modal" ? 50 : 10 }}>
                <label
                    style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#111827",
                    marginBottom: "8px",
                    }}
                >
                    {selectedStatus === "online"
                      ? "Online Since"
                      : selectedStatus === "offline"
                      ? "Offline Since"
                      : "Status Since"}
                </label>
                <DynamicSelect
                    name="since-modal"
                    placeholder="Select time"
                    options={sinceOptions}
                    loading={false}
                    value={offlineSince}
                    onSelect={(val) => setOfflineSince(val as string)}
                    onFetch={() => {}}
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                    className="w-full"
                    dropdownStyle={{ maxHeight: "135px" }} // ✅ Limit to ~3 items
                />
            </div>

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

          {/* Footer */}
          <div
            style={{
              padding: "16px 24px",
              backgroundColor: "white",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <Button
              onClick={onClose}
              type="button"
              style={{
                backgroundColor: "white",
                color: "#111827",
                border: "1px solid #EAB308",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid()}
              style={{
                backgroundColor: "#EAB308", // Yellow-500
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isFormValid() ? "pointer" : "not-allowed",
                opacity: isFormValid() ? 1 : 0.7,
                fontWeight: 600,
              }}
            >
              Update Status
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
