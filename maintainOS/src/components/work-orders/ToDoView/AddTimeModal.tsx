"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { DynamicSelect, type  SelectOption } from "../NewWorkOrderForm/DynamicSelect"; // ✅ import your reusable dropdown

export default function AddTimeModal({ onClose }: any) {
  const [form, setForm] = useState({
    user: "",
    hours: "",
    minutes: "",
    type: "",
    rate: "",
  });

  const [userOptions, setUserOptions] = useState<SelectOption[]>([
    { id: "sumit-sahani", name: "sumit sahani" },
    { id: "john-doe", name: "John Doe" },
  ]);

  const [typeOptions, setTypeOptions] = useState<SelectOption[]>([
    { id: "work", name: "Work" },
    { id: "travel", name: "Travel" },
    { id: "meeting", name: "Meeting" },
  ]);

  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingType, setLoadingType] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleFetchUsers = async () => {
    setLoadingUser(true);
    // simulate fetch
    setTimeout(() => setLoadingUser(false), 800);
  };

  const handleFetchTypes = async () => {
    setLoadingType(true);
    // simulate fetch
    setTimeout(() => setLoadingType(false), 800);
  };

  const handleAdd = () => {
    console.log("✅ Added Time Entry:", form);
    onClose();
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
          <h2 className="text-base font-semibold">Add Time</h2>
          <button
            onClick={onClose}
            className="hover:bg-blue-700 rounded-full p-1 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 space-y-6">
          {/* User Dropdown */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-3">
              User
            </label>
            <DynamicSelect
              options={userOptions}
              value={form.user}
              onSelect={(val) => setForm({ ...form, user: val as string })}
              onFetch={handleFetchUsers}
              loading={loadingUser}
              placeholder="Select User"
              name="user"
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
            />
          </div>

          {/* Hours / Minutes */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 block mb-3">
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
              <label className="text-sm font-medium text-gray-700 block mb-3">
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

          {/* Type Dropdown */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-3">
              Type
            </label>
            <DynamicSelect
              options={typeOptions}
              value={form.type}
              onSelect={(val) => setForm({ ...form, type: val as string })}
              onFetch={handleFetchTypes}
              loading={loadingType}
              placeholder="Select Type"
              name="type"
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
            />
          </div>

          {/* Hourly Rate */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-3">
              Hourly Rate (Optional)
            </label>
            <div className="flex items-center border border-gray-300 rounded-md px-3">
              <span className="text-gray-500 mr-2">$</span>
              <input
                type="number"
                value={form.rate}
                onChange={(e) => setForm({ ...form, rate: e.target.value })}
                className="flex-1 py-2 text-sm outline-none bg-transparent"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 border-t bg-gray-50 px-6 py-4 rounded-b-md">
          <button
            onClick={onClose}
            className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm "
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm "
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
