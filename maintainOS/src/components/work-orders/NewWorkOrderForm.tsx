"use client";

import { useState } from "react";
import {
  ChevronDown,
  MapPin,
  Plus,
  Search,
  Upload,
  Calendar,
} from "lucide-react";
import { Package } from "lucide-react";

interface NewWorkOrderFormProps {
  onCreate: () => void;
  onCancel?: () => void; // optional
}

export function NewWorkOrderForm({ onCreate }: NewWorkOrderFormProps) {
  const [qrCodeValue, setQrCodeValue] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [selectedPriority, setSelectedPriority] = useState("None");
  const [workTypeOpen, setWorkTypeOpen] = useState(false);
  const [selectedWorkType, setSelectedWorkType] = useState("Reactive");

  const workTypes = ["Reactive", "Preventive", "Other"];

  const priorities = [
    { name: "None", color: "bg-blue-500", textColor: "text-white" },
    { name: "Low", color: "bg-green-500", textColor: "text-white" },
    { name: "Medium", color: "bg-orange-500", textColor: "text-white" },
    { name: "High", color: "bg-red-500", textColor: "text-white" },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border">
      {/* Header */}
      <div className="flex-none border-b px-6 py-4">
        <h2 className="text-xl font-semibold">New Work Order</h2>
      </div>

      {/* Scrollable content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="px-6 pt-6">
          {/* Header row: Icon + Work Order Name input */}
          <div className="flex items-start gap-4">
            {/* Circle icon container with Package icon */}
            <div className="mt-1 flex h-12 w-12 flex-none items-center justify-center rounded-full border bg-white text-gray-400">
              <Package className="h-5 w-5" />
            </div>
            {/* Work Order name input */}
            <div className="w-full">
              <input
                type="text"
                placeholder="Enter Work Order Name (Required)"
                className="w-full border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2 text-lg text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Pictures upload section */}
          <div className="mt-4">
            <h3 className="mb-4 text-base font-medium text-gray-900">
              Pictures
            </h3>
            <div className="mb-20 border border-dashed rounded-md p-6 text-center bg-blue-50 text-blue-600 cursor-pointer">
              <Upload className="mx-auto mb-2 h-6 w-6" />
              <p className="text-gray-900">Add or drag pictures</p>
            </div>
          </div>

          {/* Description text area */}
          <div className=" mt-4">
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Description
            </label>
            <textarea
              placeholder="Add a description"
              className="w-full min-h-[96px] rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Location dropdown */}
          <div className="mt-4">
            <h3 className="mb-4 text-base font-medium text-gray-900">
              Location
            </h3>
            <div className="relative">
              <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12">
                <MapPin className="h-5 w-5 text-blue-500" />
                <span className="flex-1 text-gray-900">General</span>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="mb-4 text-base font-medium text-gray-900">Asset</h3>
            <div className="relative">
              <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12">
                <Search className="h-4 w-4 text-gray-400" />
                <span className="flex-1 text-gray-400">Start typing...</span>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="mt-4">
              {/* changed mt-5 → mt-8 */}
              <button className="flex items-center gap-2 text-orange-600 text-sm cursor-pointer hover:text-orange-800 transition-colors">
                <Plus className="h-4 w-4" />
                Add multiple assets
              </button>
            </div>
          </div>

          <div className="mt-8">
            {/* Procedure Section */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Procedure
              </h2>

              {/* Description Text - Centered */}
              <div className="flex justify-center items-center gap-3 mb-6">
                <svg
                  className="w-5 h-5 text-blue-500 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-base text-gray-600">
                  Create or attach new Form, Procedure or Checklist
                </span>
              </div>

              {/* Add Procedure Button - Centered */}
              <div className="flex justify-center items-center">
                <button
                  type="button"
                  onClick={() => {
                    /* your add procedure logic */
                  }}
                  className="inline-flex items-center p-2 gap-2 px-8 h-20 text-sm font-semibold text-orange-600 bg-white border border-orange-600 rounded-md"
                >
                  {/* Plus icon */}
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v12m6-6H6"
                    />
                  </svg>
                  Add Procedure
                </button>
              </div>
            </div>

            {/* Assigned To Section */}
            <div className="mt-4">
              <h3 className="mb-4 text-base font-medium text-gray-900">
                Assigned To
              </h3>
              <div className="relative">
                <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12">
                  <span className="flex-1 text-gray-400">
                    Start typing to search or customize...
                  </span>
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Estimated Time section */}
          <div className="mt-4">
            <h3 className="mb-4 text-base font-medium text-gray-900">
              Estimated Time
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Hours input */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Hours
                </label>
                <input
                  type="number"
                  defaultValue={1}
                  className="w-full h-12 px-4 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              {/* Minutes input */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Minutes
                </label>
                <input
                  type="number"
                  defaultValue={0}
                  className="w-full h-12 px-4 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Due Date section */}
          <div className="mt-4">
            <h3 className="mb-4 text-base font-medium text-gray-900">
              Due Date
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  placeholder="mm/dd/yyyy"
                  className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <Calendar
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#3b82f6",
                    width: "20px",
                    height: "20px",
                    pointerEvents: "none",
                  }}
                />
              </div>
              <div></div>
            </div>
          </div>

          {/* Start Date section */}
          <div className="mt-4">
            <h3 className="mb-4 text-base font-medium text-gray-900">
              Start Date
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  placeholder="mm/dd/yyyy"
                  className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <Calendar
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#3b82f6",
                    width: "20px",
                    height: "20px",
                    pointerEvents: "none",
                  }}
                />
              </div>
              <div></div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="mb-4 text-base font-medium text-gray-900">
              Recurrence
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Recurrence Dropdown */}
              <div className="relative">
                <select className="w-full h-12 px-4 pr-10 border border-gray-300 rounded-md text-gray-900 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none">
                  <option>Does not repeat</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>

              {/* Work Type Custom Dropdown */}
              <div className="relative">
                {/* Trigger */}
                <div
                  onClick={() => setWorkTypeOpen(!workTypeOpen)}
                  className="flex items-center justify-between cursor-pointer text-gray-900"
                >
                  <span>
                    Work Type:{" "}
                    <span className="font-semibold">{selectedWorkType}</span>
                  </span>
                  <ChevronDown
                    className={`ml-2 h-4 w-4 text-blue-500 transition-transform ${
                      workTypeOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Dropdown Menu */}
                {workTypeOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg z-10">
                    {workTypes.map((type) => (
                      <div
                        key={type}
                        onClick={() => {
                          setSelectedWorkType(type);
                          setWorkTypeOpen(false);
                        }}
                        className={`px-4 py-2 cursor-pointer text-sm ${
                          selectedWorkType === type
                            ? "text-blue-600 font-semibold bg-blue-50 flex justify-between"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span>{type}</span>
                        {selectedWorkType === type && (
                          <span className="text-blue-600">✔</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="mb-4 text-base font-medium text-gray-900">
              Priority
            </h3>
            <div className="flex w-full">
              {priorities.map((priority) => (
                <button
                  key={priority.name}
                  onClick={() => setSelectedPriority(priority.name)}
                  className={`flex-1 px-2 py-1 text-xs font-medium transition-all duration-200 hover:opacity-90 rounded ${
                    selectedPriority === priority.name
                      ? `${priority.color} ${priority.textColor} shadow-sm`
                      : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {priority.name}
                </button>
              ))}
            </div>
          </div>

          {/* Work Order ID input (instead of Serial Number) */}
          <div className="mt-4">
            <h3 className="mb-4 text-base font-medium text-gray-900">
              Work Order ID
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Work Order ID"
                className="w-full h-12 px-4 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 bg-white outline-none transition-all focus:border-gray-400"
              />
            </div>
          </div>

          {/* Teams in Charge dropdown */}
          <div className="mt-4">
            <h3 className="mb-4 text-base font-medium text-gray-900">
              Teams in Charge
            </h3>
            <div className="relative">
              <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-gray-100 px-4 py-3 h-12">
                <span className="flex-1 text-gray-400">Start typing…</span>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* QR Code / Barcode input */}
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-gray-900">
              QR Code/Barcode
            </label>
            <input
              type="text"
              value={qrCodeValue}
              onChange={(e) => setQrCodeValue(e.target.value)}
              placeholder="Enter or scan code"
              className="w-full h-12 px-4 border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 bg-white outline-none transition-all focus:border-gray-400"
            />
            <div className="mt-2">
              <span className="text-gray-900 text-sm">or </span>
              <span className="text-orange-600 text-sm cursor-pointer hover:underline">
                Generate Code
              </span>
            </div>
          </div>

          {/* Work Order Types dropdown */}
          <div className="mt-4">
            <h3 className="mb-4 text-base font-medium text-gray-900">
              Work Order Types
            </h3>
            <div className="relative">
              <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12">
                <Search className="h-4 w-4 text-gray-400" />
                <span className="flex-1 text-gray-400">Start typing...</span>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Vendors dropdown */}
          <div className="mt-4">
            <h3 className="mb-4 text-base font-medium text-gray-900">Parts</h3>
            <div className="relative">
              <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12">
                <Search className="h-4 w-4 text-gray-400" />
                <span className="flex-1 text-gray-400">Start typing...</span>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Parts dropdown */}
          <div className="mt-4">
            <h3 className="mb-4 text-base font-medium text-gray-900">
              Categories
            </h3>
            <div className="relative">
              <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12">
                <Search className="h-4 w-4 text-gray-400" />
                <span className="flex-1 text-gray-400">Start typing...</span>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Parent Work Order dropdown */}
          <div className="mt-4">
            <h3 className="mb-4 text-base font-medium text-gray-900">
              Vendors
            </h3>
            <div className="relative">
              <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12">
                <Search className="h-4 w-4 text-gray-400" />
                <span className="flex-1 text-gray-400">Start typing...</span>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 mt-6 flex items-center border-t bg-white px-6 py-4">
        <button
          onClick={onCreate}
          style={{
            marginLeft: "auto",
            paddingLeft: "40px",
            paddingRight: "40px",
          }}
          className="h-10 rounded-md bg-orange-600 text-sm font-medium text-white shadow hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create
        </button>
      </div>
    </div>
  );
}
