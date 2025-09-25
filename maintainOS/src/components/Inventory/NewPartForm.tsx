"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Paperclip, QrCode, Upload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { NewItem } from "./Inventory";
import { mockVendors, mockLocations } from "./Inventory";

export function NewPartForm({
  newItem,
  setNewItem,
  addVendorRow,
  removeVendorRow,
  onCancel,
  onCreate,
}: {
  newItem: NewItem;
  setNewItem: React.Dispatch<React.SetStateAction<NewItem>>;
  addVendorRow: () => void;
  removeVendorRow: (idx: number) => void;
  onCancel: () => void;
  onCreate: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.dataTransfer.files) return;
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Simple QR generator (kept minimal, purely client-side)
  const generateQrCode = () => {
    const code = `QR-${Date.now().toString(36).toUpperCase()}`;
    setNewItem((s) => ({ ...s, qrCode: code }));
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between">
        <h2 className="text-xl font-medium">New Part</h2>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto w-full max-w-[820px] p-6 space-y-10">
          {/* Name + Pictures */}
          <section>
            <div className="text-xl font-medium mb-4">
              {newItem.name || "New Part"}
            </div>

            {/* Drag & Drop uploader */}
            {files.length === 0 ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="mb-6 w-full h-32 border-2 border-dashed rounded-lg bg-orange-50 text-orange-600 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-100 transition-colors"
                onClick={() =>
                  document.getElementById("partFileInput")?.click()
                }
              >
                <Upload className="h-6 w-6 mb-2" />
                <span className="text-sm">Add or drag pictures</span>
                <input
                  id="partFileInput"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Add More */}
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border border-dashed rounded-md text-center bg-orange-50 text-orange-600 cursor-pointer flex flex-col items-center justify-center w-32 h-32"
                  onClick={() =>
                    document.getElementById("partFileInput")?.click()
                  }
                >
                  <Upload className="h-6 w-6 mb-2" />
                  <p className="text-xs">Add more</p>
                  <input
                    id="partFileInput"
                    type="file"
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
                        className="absolute top-1 right-1 bg-white text-orange-600 rounded-full p-1 shadow"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <Input
                className="h-9 text-sm"
                placeholder="Part Name"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem((s) => ({ ...s, name: e.target.value }))
                }
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  className="h-9 text-sm"
                  type="number"
                  placeholder="Unit Cost"
                  value={newItem.unitCost}
                  onChange={(e) =>
                    setNewItem((s) => ({
                      ...s,
                      unitCost: Number(e.target.value) || 0,
                    }))
                  }
                />
                <Input
                  className="h-9 text-sm"
                  type="number"
                  placeholder="Units in Stock"
                  value={newItem.unitsInStock}
                  onChange={(e) =>
                    setNewItem((s) => ({
                      ...s,
                      unitsInStock: Number(e.target.value) || 0,
                    }))
                  }
                />
                <Input
                  className="h-9 text-sm"
                  type="number"
                  placeholder="Minimum in Stock"
                  value={newItem.minInStock}
                  onChange={(e) =>
                    setNewItem((s) => ({
                      ...s,
                      minInStock: Number(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              {/* Description — same style as your AddressAndDescription */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Description
                </label>
                <textarea
                  placeholder="Add a description"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem((s) => ({ ...s, description: e.target.value }))
                  }
                />
              </div>
            </div>
          </section>

          {/* QR Code/Barcode — styled like your QrCodeSection */}
          <section>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                QR Code/Barcode
              </label>
              <input
                type="text"
                placeholder="Enter or scan code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newItem.qrCode ?? ""}
                onChange={(e) =>
                  setNewItem((s) => ({ ...s, qrCode: e.target.value }))
                }
              />
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500">or</span>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer underline"
                  onClick={generateQrCode}
                >
                  Generate Code
                </button>
              </div>
            </div>

            {/* (Kept) Preview box so you still have the visual */}
            <div className="mt-3 w-40 h-40 border rounded-md flex items-center justify-center bg-muted/30">
              <QrCode className="h-20 w-20 text-muted-foreground" />
            </div>
          </section>

          {/* Part Types */}
          <section>
            <div className="text-base font-medium mb-2">Part Types</div>
            <div className="flex items-center gap-2">
              {(newItem.partTypes || []).map((p, i) => (
                <Badge key={i} variant="outline">
                  {p}
                </Badge>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setNewItem((s) => ({
                    ...s,
                    partTypes: [...s.partTypes, "Critical"],
                  }))
                }
              >
                + Add
              </Button>
            </div>
          </section>

          {/* Location */}
          <section>
            <div className="text-base font-medium mb-4">Location</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select
                value={newItem.locationId}
                onValueChange={(v: string) =>
                  setNewItem((s) => ({ ...s, locationId: v }))
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  {mockLocations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={newItem.area}
                onValueChange={(v: string) =>
                  setNewItem((s) => ({ ...s, area: v }))
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ground Floor">Ground Floor</SelectItem>
                  <SelectItem value="Bay 3">Bay 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* Vendors */}
          <section>
            <div className="text-base font-medium mb-4">Vendors</div>
            <div className="space-y-3">
              {newItem.vendors.map((v, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center"
                >
                  <Select
                    value={v.vendorId}
                    onValueChange={(val: string) =>
                      setNewItem((s) => {
                        const nv = [...s.vendors];
                        nv[idx] = { ...nv[idx], vendorId: val };
                        return { ...s, vendors: nv };
                      })
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select Vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockVendors.map((mv) => (
                        <SelectItem key={mv.id} value={mv.id}>
                          {mv.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="h-9 text-sm md:col-span-2"
                    placeholder="Vendor's Ordering Part Number"
                    value={v.orderingPartNumber ?? ""}
                    onChange={(e) =>
                      setNewItem((s) => {
                        const nv = [...s.vendors];
                        nv[idx] = {
                          ...nv[idx],
                          orderingPartNumber: e.target.value,
                        };
                        return { ...s, vendors: nv };
                      })
                    }
                  />
                  {newItem.vendors.length > 1 && (
                    <div className="md:col-span-3 -mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVendorRow(idx)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Button variant="outline" onClick={addVendorRow}>
                Add additional Vendor
              </Button>
            </div>
          </section>

          {/* Files */}
          <section>
            <div className="text-base font-medium mb-2">Files</div>
            <Button variant="outline" className="gap-2 h-9">
              <Paperclip className="h-4 w-4" />
              Attach files
            </Button>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t flex justify-end">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="gap-2 bg-orange-600 hover:bg-orange-700"
            onClick={onCreate}
            disabled={!newItem.name}
          >
            <Upload className="h-4 w-4" />
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
