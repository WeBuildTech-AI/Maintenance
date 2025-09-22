import { FormEvent, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
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
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>New Vendor</CardTitle>
        <CardDescription>
          Fill out the form below to create a new vendor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vendor Name */}
          <div className="space-y-2">
            <Label>Vendor Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>Images</Label>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                console.log("Selected images:", e.target.files)
              }
            />
          </div>

          {/* Vendor Color */}
          <div className="space-y-2">
            <Label>Vendor Color</Label>
            <div className="flex gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`h-8 w-8 rounded-full border ${
                    form.color === color
                      ? "ring-2 ring-primary"
                      : "border-muted"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setForm((f) => ({ ...f, color }))}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.partsSummary}
              onChange={(e) =>
                setForm((f) => ({ ...f, partsSummary: e.target.value }))
              }
            />
          </div>

          {/* Contact List */}
          <div className="space-y-2">
            <Label>Contact List</Label>
            <Button type="button" variant="outline" size="sm">
              + Add Contact
            </Button>
          </div>

          {/* Files */}
          <div className="space-y-2">
            <Label>Files</Label>
            <Input
              type="file"
              multiple
              onChange={(e) =>
                console.log("Selected files:", e.target.files)
              }
            />
          </div>

          {/* Locations */}
          <div className="space-y-2">
            <Label>Locations</Label>
            <select
              multiple
              className="w-full rounded-md border px-2 py-1"
              onChange={(e) => {
                const values = Array.from(
                  e.target.selectedOptions,
                  (opt) => opt.value
                );
                setForm((f) => ({ ...f, locations: values }));
              }}
            >
              <option value="Substation 1">Substation 1</option>
              <option value="Utility Yard">Utility Yard</option>
              <option value="Warehouse Dock 3">Warehouse Dock 3</option>
            </select>
          </div>

          {/* Assets */}
          <div className="space-y-2">
            <Label>Assets</Label>
            <select
              multiple
              className="w-full rounded-md border px-2 py-1"
              onChange={(e) => {
                const values = Array.from(
                  e.target.selectedOptions,
                  (opt) => opt.value
                );
                setForm((f) => ({ ...f, assets: values }));
              }}
            >
              <option value="Chiller">Chiller</option>
              <option value="Pump">Pump</option>
            </select>
          </div>

          {/* Parts */}
          <div className="space-y-2">
            <Label>Parts</Label>
            <select
              multiple
              className="w-full rounded-md border px-2 py-1"
              onChange={(e) => {
                const values = Array.from(
                  e.target.selectedOptions,
                  (opt) => opt.value
                );
                setForm((f) => ({ ...f, parts: values }));
              }}
            >
              <option value="Mechanical Seals">Mechanical Seals</option>
              <option value="Impellers">Impellers</option>
              <option value="Control Boards">Control Boards</option>
            </select>
          </div>

          {/* Vendor Types */}
          <div className="space-y-2">
            <Label>Vendor Type</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="vendorType"
                  value="Manufacturer"
                  checked={form.vendorType === "Manufacturer"}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, vendorType: e.target.value }))
                  }
                />
                Manufacturer
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="vendorType"
                  value="Distributor"
                  checked={form.vendorType === "Distributor"}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, vendorType: e.target.value }))
                  }
                />
                Distributor
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Create Vendor</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
