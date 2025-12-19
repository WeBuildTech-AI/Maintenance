"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { X } from "lucide-react";
import { DynamicSelect } from "../NewWorkOrderForm/DynamicSelect";

type AddTimeModalProps = {
  onClose: () => void;
  onAdd?: (time: any) => void;
  onUpdate?: (time: any) => void;
  onDelete?: (id: string) => void;
  workOrderId?: string;
  selectedWorkOrder?: any;
  initialTime?: any | null;
};

export default function AddTimeModal({
  onClose,
  onAdd,
  onUpdate,
  onDelete,
  workOrderId,
  selectedWorkOrder,
  initialTime = null,
}: AddTimeModalProps) {
  const isEdit = !!initialTime;
  const modalRef = useRef<HTMLDivElement>(null);

  // --- STATE ---
  // Default to string "0" to ensure inputs work correctly
  const [userId, setUserId] = useState(initialTime?.userId || initialTime?.user?.id || "");
  const [userName, setUserName] = useState(
    initialTime?.user?.fullName ||
    initialTime?.userName ||
    (selectedWorkOrder?.assignees?.[0]?.fullName ?? "")
  );

  const [hours, setHours] = useState<string>(
    initialTime?.hours !== undefined ? String(initialTime.hours) : "0"
  );
  const [minutes, setMinutes] = useState<string>(
    initialTime?.minutes !== undefined ? String(initialTime.minutes) : "0"
  );

  const [entryType, setEntryType] = useState(
    (initialTime?.entryType && (initialTime.entryType[0].toUpperCase() + initialTime.entryType.slice(1))) || "Work"
  );

  const [rate, setRate] = useState<string>(
    initialTime?.rate !== undefined ? String(initialTime.rate) : ""
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // --- LOGIC ---

  // Dropdown options
  const userOptions = useMemo(() => {
    const opts =
      selectedWorkOrder?.assignees?.map((a: any) => ({
        id: a.id,
        name: a.fullName,
      })) || [];

    if (initialTime?.userId && !opts.some((o: any) => o.id === initialTime.userId)) {
      opts.unshift({
        id: initialTime.userId,
        name:
          initialTime?.user?.fullName ||
          initialTime?.userName ||
          "Unknown User",
      });
    }
    return opts.length ? opts : [{ id: "unknown", name: "Unknown User" }];
  }, [selectedWorkOrder, initialTime]);

  const typeOptions = [
    { id: "Work", name: "Work" },
    { id: "Travel", name: "Travel" },
    { id: "Meeting", name: "Meeting" },
  ];

  useEffect(() => {
    if (!userId && userOptions.length > 0) {
      setUserId(userOptions[0].id);
      setUserName(userOptions[0].name);
    }
  }, [userOptions, userId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // --- HANDLERS ---

  // ✅ Simplified Input Handler
  const handleInputChange = (setter: (val: string) => void, val: string) => {
    // Allow digits or empty string (to delete 0)
    if (val === "" || /^\d+$/.test(val)) {
      setter(val);
    }
  };

  const handlePrimary = async () => {
    // 🛠️ DEBUG LOG 1: Check raw state values when button is clicked
    console.log("👉 [DEBUG] Raw State Values:", { hours, minutes, userId, rate });

    if (!userId) {
      alert("Please select a user");
      return;
    }

    // Convert to numbers safely
    const h = hours === "" ? 0 : parseInt(hours, 10);
    const m = minutes === "" ? 0 : parseInt(minutes, 10);
    const r = rate === "" ? 0 : parseFloat(rate);

    const totalMinutes = (h * 60) + m;

    if (totalMinutes <= 0 && !isEdit) {
      alert("Please enter valid hours or minutes");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        id: initialTime?.id,
        userId: userId,
        hours: h,     // ✅ Sending confirmed number
        minutes: m,   // ✅ Sending confirmed number
        totalMinutes: totalMinutes,
        entryType: entryType.toLowerCase(),
        rate: r,
        createdAt: initialTime?.createdAt || new Date().toISOString(),
        user: { id: userId, fullName: userName || "Unknown User" },
      };

      // 🛠️ DEBUG LOG 2: Check Final Payload before calling onAdd/onUpdate
      console.log("🚀 [DEBUG] Final Payload to Parent:", payload);

      if (isEdit && onUpdate) {
        onUpdate(payload);
      } else if (onAdd) {
        onAdd(payload);
      }
      onClose();
    } catch (e) {
      console.error(e);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!initialTime?.id) return;
    if (confirm("Delete this time entry? This cannot be undone.")) {
      onDelete?.(initialTime.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        ref={modalRef}
        className="bg-white rounded-md shadow-lg border border-gray-200"
        style={{
          width: "560px",
          minHeight: "500px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="flex items-center justify-between bg-blue-600 text-white px-6 py-3 rounded-t-md">
          <h2 className="text-base font-semibold">
            {isEdit ? "Edit Time Entry" : "Add Time"}
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-blue-700 rounded-full p-1 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              User
            </label>
            <DynamicSelect
              options={userOptions}
              value={userId}
              onSelect={(val: any, opt?: any) => {
                setUserId(val as string);
                setUserName(opt?.name ?? userName);
              }}
              onFetch={() => {}}
              loading={false}
              placeholder="Select User"
              name="user"
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Hours
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={hours}
                  // ✅ Using updated safe handler
                  onChange={(e) => handleInputChange(setHours, e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus-visible:border-blue-400 transition"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">h</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Minutes
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={minutes}
                  // ✅ Using updated safe handler
                  onChange={(e) => handleInputChange(setMinutes, e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus-visible:border-blue-400 transition"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">m</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Entry Type
            </label>
            <DynamicSelect
              options={typeOptions}
              value={entryType}
              onSelect={(val) => setEntryType(val as string)}
              onFetch={() => {}}
              loading={false}
              placeholder="Select Entry Type"
              name="entryType"
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Hourly Rate (Optional)
            </label>
            <div className="flex items-center border border-gray-300 rounded-md px-3">
              <span className="text-gray-500 mr-2">$</span>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="flex-1 py-2 text-sm outline-none bg-transparent"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center border-t bg-gray-50 px-6 py-4 rounded-b-md">
          {isEdit ? (
            <button
              onClick={handleDelete}
              className="text-red-600 text-sm font-medium hover:underline"
            >
              Delete
            </button>
          ) : (
            <span />
          )}

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              Cancel
            </button>
            <button
              disabled={isSubmitting}
              onClick={handlePrimary}
              className={`text-white text-sm font-medium px-6 py-2 rounded-md transition ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting
                ? isEdit
                  ? "Updating..."
                  : "Adding..."
                : isEdit
                ? "Update"
                : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}