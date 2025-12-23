"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { DynamicSelect } from "../NewWorkOrderForm/DynamicSelect";

type AddCostModalProps = {
  onClose: () => void;
  onAdd?: (cost: any) => void;            // create flow
  onUpdate?: (cost: any) => void;         // edit flow
  onDelete?: (id: string) => void;        // delete flow
  workOrderId?: string;
  selectedWorkOrder?: any;
  initialCost?: any | null;               // if present => edit mode
};

export default function AddCostModal({
  onClose,
  onAdd,
  onUpdate,
  onDelete,
  workOrderId,
  selectedWorkOrder,
  initialCost = null,
}: AddCostModalProps) {
  const isEdit = !!initialCost;

  // ✅ FIX: Robust State Initialization
  const [form, setForm] = useState({
    userId: initialCost?.userId || "",
    userName:
      initialCost?.user?.fullName ||
      initialCost?.userName ||
      (selectedWorkOrder?.assignees?.[0]?.fullName ?? ""),
    // Initialize as string to handle "0" correctly
    amount:
      typeof initialCost?.amount !== "undefined"
        ? String(initialCost?.amount)
        : "",
    description: initialCost?.description || "",
    category:
      (initialCost?.category &&
        (initialCost.category[0].toUpperCase() +
          initialCost.category.slice(1))) ||
      "Labor",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Users/Assignees for dropdown (keep it simple & flat to preserve design)
  const userOptions = useMemo(() => {
    const opts =
      selectedWorkOrder?.assignees?.map((a: any) => ({
        id: a.id,
        name: a.fullName,
      })) || [];
    // Ensure currently selected (for edit) exists even if not in assignees
    if (
      initialCost?.userId &&
      !opts.some((o: any) => o.id === initialCost.userId)
    ) {
      opts.unshift({
        id: initialCost.userId,
        name:
          initialCost?.user?.fullName ||
          initialCost?.userName ||
          "Unknown User",
      });
    }
    return opts.length ? opts : [{ id: "unknown", name: "Unknown User" }];
  }, [selectedWorkOrder, initialCost]);

  const categoryOptions = [
    { id: "Labor", name: "Labor" },
    { id: "Material", name: "Material" },
    { id: "Equipment", name: "Equipment" },
    { id: "Other", name: "Other" },
  ];

  useEffect(() => {
    // Try to default user if empty
    if (!form.userId && userOptions.length) {
      setForm((f) => ({ ...f, userId: userOptions[0].id, userName: userOptions[0].name }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userOptions.length]);

  const handlePrimary = async () => {
    // ✅ FIX: Allow 0 as valid amount if typed explicitly
    if (form.amount === "" || form.amount === undefined) {
      alert("Please enter a valid amount");
      return;
    }
    if (!form.userId) {
      alert("Please select a user");
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ FIX: Construct clean payload
      const payload = {
        id: initialCost?.id, // present only in edit
        userId: form.userId,
        amount: form.amount, // Pass as string or number, Service handles it
        description: form.description?.trim() || "",
        category: form.category?.toLowerCase() || "other",
        createdAt: initialCost?.createdAt || new Date().toISOString(),
        user: { id: form.userId, fullName: form.userName || "Unknown User" },
      };

      if (isEdit && onUpdate) {
        await onUpdate(payload);
      } else if (onAdd) {
        await onAdd(payload);
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
    if (!initialCost?.id) return;
    if (confirm("Delete this cost entry? This cannot be undone.")) {
      onDelete?.(initialCost.id);
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
            {isEdit ? "Edit Cost" : "Add Cost"}
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
          {/* User */}
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

          {/* Amount */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Amount
            </label>
            <div className="flex items-center border border-gray-300 rounded-md px-3 bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
              <span className="text-gray-500 mr-2">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                // ✅ FIX: Controlled Input
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="flex-1 py-2 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Description (Optional)
            </label>
            <textarea
              // ✅ FIX: Controlled Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Add a description"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              rows={3}
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Cost Category
            </label>
            <DynamicSelect
              options={categoryOptions}
              value={form.category}
              onSelect={(val) => setForm({ ...form, category: val as string })}
              onFetch={() => {}}
              loading={false}
              placeholder="Select Category"
              name="category"
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
            />
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
              {isSubmitting ? (isEdit ? "Updating..." : "Adding...") : isEdit ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}