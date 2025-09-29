"use client";

import { type FormEvent, useState } from "react";
import { Upload, Paperclip } from "lucide-react";
import type { Vendor } from "./vendors.types";
import type { AppDispatch, RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import { createVendor, type CreateVendorData } from "../../store/vendors";

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
  const dispatch = useDispatch<AppDispatch>();
  const [files, setFiles] = useState<File[]>([]);
  const [attachedDocs, setAttachedDocs] = useState<File[]>([]);
  const user = useSelector((state: RootState) => state.auth.user);
  const [showInputs, setShowInputs] = useState(false);
  const [contact, setContact] = useState([{ email: "", phone: "" }]);
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    splitFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    splitFiles(selectedFiles);
  };

  const splitFiles = (selectedFiles: File[]) => {
    const imageTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
    const docTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const newImages = selectedFiles.filter((f) => imageTypes.includes(f.type));
    const newDocs = selectedFiles.filter((f) => docTypes.includes(f.type));
    if (newImages.length) setFiles((prev) => [...prev, ...newImages]);
    if (newDocs.length) setAttachedDocs((prev) => [...prev, ...newDocs]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeDoc = (index: number) => {
    setAttachedDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const newVendor: CreateVendorData = {
      organizationId: user.organizationId,
      name: form.name.trim(),
      // vendorType: form.vendorType || "manufacturer", // added key
      // pictureUrl: form.pictureUrl || "", // optional
      color: form.color || "#000000", // optional
      description: form.description || "",
      // services: form.services
      //   .split(",")
      //   .map((s) => s.trim())
      //   .filter(Boolean),
      contacts: contact, // { email, phone }
      // files: form.files || [], // array of file URLs
      // locations: form.locations.map((loc) => loc.id || loc), // map to IDs if needed
      // assetIds: form.assetIds || [],
      // partIds: form.partIds || [],
    };

    console.log(newVendor, "newVendor");

    // Dispatch the Redux thunk to call the API
    dispatch(createVendor(newVendor))
      .unwrap()
      .then((res) => {
        console.log("Vendor created successfully:", res);
        // setVendors((prev) => [...prev, res]);
        setSelectedVendorId(res.id);
        onCancel();
      })
      .catch((err) => {
        console.error("Failed to create vendor:", err);
      });
  };

  const colorOptions = ["#2563eb", "#10b981", "#f97316", "#ec4899", "#6366f1"];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border">
      {/* Header */}
      <div className="flex-none border-b px-6 py-4">
        <h2 className="text-xl font-semibold">New Vendor</h2>
      </div>

      {/* Scrollable content */}
      <form
        // onSubmit={handleSubmit}
        className="min-h-0 flex-1 overflow-y-auto"
      >
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

        {/* Pictures */}
        <div className="px-6 pt-6">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Pictures</h3>

          {files.length === 0 ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border border-dashed rounded-md p-6 text-center bg-blue-50 text-blue-600 cursor-pointer flex flex-col items-center justify-center"
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              <Upload className="h-6 w-6 mb-2" />
              <p className="text-sm">Add or drag pictures</p>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border border-dashed rounded-md p-6 text-center bg-blue-50 text-blue-600 cursor-pointer flex flex-col items-center justify-center w-32 h-32"
                onClick={() => document.getElementById("fileInput")?.click()}
              >
                <Upload className="h-6 w-6 mb-2" />
                <p className="text-xs">Add more</p>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
              {files.map((file, i) => {
                const url = URL.createObjectURL(file);
                return (
                  <div
                    key={i}
                    className="relative w-32 h-32 rounded-md overflow-hidden flex items-center justify-center"
                  >
                    <img
                      src={url}
                      alt={file.name}
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 bg-white text-blue-600 rounded-full p-1 shadow"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
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
        </div>

        {/* Contact List */}
        <div className="px-6 pt-6">
          <label className="block text-base font-medium text-gray-700">
            Contact List
          </label>

          <button
            type="button"
            onClick={() => setShowInputs((prev) => !prev)}
            className="mt-2 inline-flex items-center px-2 py-1 text-sm font-normal text-orange-600 bg-white border border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-all duration-150 w-fit h-8"
          >
            + New Contact
          </button>

          {showInputs && (
            <div className="mt-4 flex flex-col gap-2">
              <input
                type="email"
                placeholder="Email"
                className="px-2 py-1 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
                value={contact.email}
                onChange={(e) =>
                  setContact((prev) => ({ ...prev, email: e.target.value }))
                }
              />
              <input
                type="number"
                placeholder="Phone"
                className="px-2 py-1 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
                value={contact.phone}
                onChange={(e) =>
                  setContact((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
          )}
        </div>

        {/* ✅ Files (DOC, PDF, etc.) */}
        <div className="px-6 pt-6">
          <label className="block text-base font-medium text-gray-700 mb-2">
            Files
          </label>
          <div className="space-y-2">
            {attachedDocs.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2" // ⬅ no border
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs rounded">
                    {file.name.split(".").pop()?.toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700 truncate max-w-xs">
                    {file.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeDoc(i)}
                  className="text-gray-500 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Attach files button */}
          <div className="mt-3">
            <label
              htmlFor="docInput"
              className="inline-flex items-center text-orange-600 gap-2 px-3 py-2 text-sm font-medium text-blue-600 rounded cursor-pointer hover:bg-blue-50" // ⬅ no border
            >
              <Paperclip className="h-4 w-4" />
              Attach files
            </label>
            <input
              id="docInput"
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  splitFiles(Array.from(e.target.files));
                }
              }}
            />
          </div>
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
          </div>
        </div>
      </form>

      {/* Footer */}
      <div className="sticky bottom-0 mt-6 flex items-center border-t bg-white px-6 py-4">
        <button
          onClick={handleSubmit}
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
