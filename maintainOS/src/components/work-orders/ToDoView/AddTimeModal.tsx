"use client";

import { useEffect, useMemo, useState } from "react";
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

  const [form, setForm] = useState({
    userId: initialTime?.userId || initialTime?.user?.id || "",
    userName:
      initialTime?.user?.fullName ||
      initialTime?.userName ||
      (selectedWorkOrder?.assignees?.[0]?.fullName ?? ""),
    hours:
      typeof initialTime?.hours !== "undefined"
        ? String(initialTime.hours)
        : "",
    minutes:
      typeof initialTime?.minutes !== "undefined"
        ? String(initialTime.minutes)
        : "",
    entryType:
      (initialTime?.entryType &&
        (initialTime.entryType[0].toUpperCase() + initialTime.entryType.slice(1))) ||
      "Work",
    rate:
      typeof initialTime?.rate !== "undefined"
        ? String(initialTime.rate)
        : "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // ✅ Dropdown options (same as AddCostModal)
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
    if (!form.userId && userOptions.length) {
      setForm((f) => ({
        ...f,
        userId: userOptions[0].id,
        userName: userOptions[0].name,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userOptions.length]);

  // ✅ Add / Update
  const handlePrimary = async () => {
    if (!form.userId) {
      alert("Please select a user");
      return;
    }

    const totalMinutes =
      Number(form.hours || 0) * 60 + Number(form.minutes || 0);
    if (totalMinutes <= 0) {
      alert("Please enter valid hours or minutes");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id: initialTime?.id,
        userId: form.userId,
        totalMinutes,
        hours: Number(form.hours || 0),
        minutes: Number(form.minutes || 0),
        entryType: form.entryType.toLowerCase(),
        rate: Number(form.rate || 0),
        createdAt: initialTime?.createdAt || new Date().toISOString(),
        user: { id: form.userId, fullName: form.userName || "Unknown User" },
      };

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

  // ✅ Delete
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
        className="bg-white rounded-md shadow-lg border border-gray-200"
        style={{
          width: "560px",
          minHeight: "500px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* User Dropdown */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              User
            </label>
            <DynamicSelect
              options={userOptions}
              value={form.userId}
              onSelect={(val: any, opt?: any) =>
                setForm({
                  ...form,
                  userId: val as string,
                  userName: opt?.name ?? form.userName,
                })
              }
              onFetch={() => {}}
              loading={false}
              placeholder="Select User"
              name="user"
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
            />
          </div>

          {/* Hours & Minutes */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Hours
              </label>
              <input
                type="number"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus-visible:border-blue-400 transition"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Minutes
              </label>
              <input
                type="number"
                value={form.minutes}
                onChange={(e) => setForm({ ...form, minutes: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus-visible:border-blue-400 transition"
              />
            </div>
          </div>

          {/* Entry Type Dropdown */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Entry Type
            </label>
            <DynamicSelect
              options={typeOptions}
              value={form.entryType}
              onSelect={(val) => setForm({ ...form, entryType: val as string })}
              onFetch={() => {}}
              loading={false}
              placeholder="Select Entry Type"
              name="entryType"
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
            />
          </div>

          {/* Rate */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Hourly Rate (Optional)
            </label>
            <div className="flex items-center border border-gray-300 rounded-md px-3">
              <span className="text-gray-500 mr-2">$</span>
              <input
                type="number"
                value={form.rate}
                onChange={(e) => setForm({ ...form, rate: e.target.value })}
                className="flex-1 py-2 text-sm outline-none bg-transparent"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
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
