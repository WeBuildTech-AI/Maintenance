"use client";

import { FormEvent, useState } from "react";
import { Upload } from "lucide-react";
import { Vendor } from "./vendors.types";

export function VendorForm({
  setVendors,
  setSelectedVendorId,
  onCancel,
}: {
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  setSelectedVendorId: (id: string) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    services: "",
    createdBy: "",
    partsSummary: "",
    color: "#2563eb",
    vendorType: "Manufacturer",
    locations: [] as string[],
    assets: [] as string[],
    parts: [] as string[],
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const newVendor: Vendor = {
      id: `VEN-${Date.now()}`,
      name: form.name.trim(),
      category: form.category || "General",
      services: form.services
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      contacts: [], // could embed contact creation later
      locations: form.locations.map((loc) => ({ name: loc })),
      createdBy: form.createdBy || "System",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      partsSummary: form.partsSummary || "—",
    };

    setVendors((prev) => [...prev, newVendor]);
    setSelectedVendorId(newVendor.id);
    onCancel(); // close form after submit
  };

  const colorOptions = ["#2563eb", "#10b981", "#f97316", "#ec4899", "#6366f1"];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border">
      {/* Header */}
      <div className="flex-none border-b px-6 py-4">
        <h2 className="text-xl font-semibold">New Vendor</h2>
      </div>

      {/* Scrollable content */}
      <form onSubmit={handleSubmit} className="min-h-0 flex-1 overflow-y-auto">
        {/* Vendor Name */}
        <div className="px-6 pt-6">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Enter Vendor Name (Required)"
            required
            className="w-full border-0 border-b-2 border-gray-200 bg-transparent px-0 py-2 text-lg placeholder-gray-400 outline-none focus:border-blue-500"
          />
        </div>

        {/* Upload Box */}
        <div className="px-6 pt-6">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Pictures</h3>
          <div className="mb-6 border border-dashed rounded-md p-6 text-center bg-blue-50 text-orange-600 cursor-pointer">
            <Upload className="mx-auto mb-2 h-6 w-6" />
            <p>Add or drag pictures</p>
          </div>
        </div>

        {/* Vendor Color */}
        <div className="px-6 pt-6">
          <label className="block text-base font-medium text-gray-900 mb-4">
            Vendor Color
          </label>
          <div className="flex gap-3">
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                className={`h-8 w-8 rounded-full border-2 transition-all duration-200 ${
                  form.color === color
                    ? "ring-2 ring-pink-500 ring-offset-2 border-white"
                    : "border-gray-200 hover:scale-110"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setForm((f) => ({ ...f, color }))}
              />
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="px-6 pt-6">
          <label className="block text-base font-medium text-gray-900 mb-3">
            Description
          </label>
          <textarea
            value={form.partsSummary}
            onChange={(e) =>
              setForm((f) => ({ ...f, partsSummary: e.target.value }))
            }
            placeholder="Add a description"
            rows={4}
            className="w-full px-3 py-3 text-gray-600 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="relative">
            <div className="absolute bottom-1 right-1 w-3 h-3 opacity-30">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-gray-400"
              >
                <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM18 18H16V16H18V18ZM14 22H12V20H14V22Z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Contact List */}
        <div className="px-6 pt-6">
          <label className="block text-base font-medium text-gray-700">
            Contact List
          </label>
          <button
            type="button"
            onClick={() => {
              /* add contact logic */
            }}
            className="mt-2 inline-flex items-center px-2 py-1 text-sm font-normal text-orange-600 bg-white border border-orange-600 rounded hover:bg-gray-50 hover:border-gray-400 transition-all duration-150 w-fit h-8"
          >
            + New Contact
          </button>
        </div>

        {/* Files */}
        <div className="px-6 pt-6">
          <label className="block text-base font-medium text-gray-700">
            Files
          </label>
          <button
            type="button"
            onClick={() => {
              /* attach files logic */
            }}
            className="mt-2 inline-flex items-center gap-2 px-3 py-2 text-sm font-normal text-orange-600 bg-white border border-orange-600 rounded hover:bg-blue-50 hover:border-blue-300 transition-all duration-150 w-fit"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                clipRule="evenodd"
              />
            </svg>
            Attach files
          </button>
        </div>

        {/* Location */}
        <div className="px-6 pt-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Location
          </label>
          <div className="relative w-full">
            <select
              defaultValue="none"
              className="h-10 w-full border border-gray-300 rounded-md px-3 pr-8 text-sm text-gray-700"
            >
              <option value="none">Start typing...</option>
              <option value="all">All Locations</option>
              <option value="buildings">Buildings</option>
              <option value="floors">Floors</option>
              <option value="rooms">Rooms</option>
              <option value="areas">Areas</option>
            </select>
            <svg
              className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Assets */}
        <div className="px-6 pt-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Assets
          </label>
          <div className="relative w-full">
            <select
              defaultValue="none"
              className="h-10 w-full border border-gray-300 rounded-md px-3 pr-8 text-sm text-gray-700"
            >
              <option value="none" className="text-blue-600">
                + Create New Asset
              </option>
            </select>
            <svg
              className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Parts */}
        <div className="px-6 pt-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Parts
          </label>
          <div className="relative w-full">
            <select
              defaultValue="none"
              className="h-10 w-full border border-gray-300 rounded-md px-3 pr-8 text-sm text-gray-700"
            >
              <option value="none" className="text-blue-600">
                + Create New Asset
              </option>
            </select>
            <svg
              className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Vendor Types */}
        <div className="px-6 pt-6 pb-20">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Vendor Type
          </label>
          <div className="relative w-full">
            <select
              defaultValue="none"
              className="h-10 w-full border border-gray-300 rounded-md px-3 pr-8 text-sm text-gray-700"
            >
              <option value="none" className="text-blue-600">
                + Create New Asset
              </option>
            </select>
            <svg
              className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </form>

      {/* Footer */}
      <div className="sticky bottom-0 mt-6 flex items-center border-t bg-white px-6 py-4">
        <button
          style={{
            marginLeft: "auto",
            paddingLeft: "40px",
            paddingRight: "40px",
          }}
          className="h-10 rounded-md bg-orange-600 text-sm font-medium text-white shadow hover:bg-orange-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create
        </button>
      </div>
    </div>
  );
}
