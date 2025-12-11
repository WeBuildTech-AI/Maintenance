"use client";

import { type FormEvent, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import { type NewItem } from "../inventory.types";
import { PartDynamicSelect, type PartSelectOption } from "./PartDynamicSelect";
import { fetchFilterData } from "../../utils/filterDataFetcher"; // ✅ API Utility

export function LocationFormDialog({
  newItem,
  setNewItem,
}: {
  newItem: NewItem;
  setNewItem: React.Dispatch<React.SetStateAction<NewItem>>;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    locationId: "",
    name: "",
    area: "",
    unitInStock: "",
    minInStock: "",
  });

  // ✅ Dropdown State
  const [locationOptions, setLocationOptions] = useState<PartSelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // ✅ API Fetch Function
  const fetchLocationOptions = useCallback(async () => {
    if (locationOptions.length > 0) return; // Don't refetch if already loaded
    setLoading(true);
    try {
      // Call your API to get locations
      const { data } = await fetchFilterData("locations");
      
      // Normalize data for dropdown
      const normalized = Array.isArray(data)
        ? data.map((d: any) => ({
            id: d.id,
            name: d.name || d.title || "Unknown",
          }))
        : [];
      setLocationOptions(normalized);
    } catch (err) {
      console.error("Failed to fetch locations", err);
    } finally {
      setLoading(false);
    }
  }, [locationOptions.length]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.locationId) return;

    // Create new location object
    const newLocation = {
      locationId: form.locationId,
      locationName: form.name, // ✅ Save name for display in the table
      area: form.area,
      unitInStock: form.unitInStock,
      minInStock: form.minInStock,
      // Also keep 'id' if needed for backend uniqueness logic
      id: form.locationId
    };

    // Update parent state (NewPartForm)
    setNewItem((prev: any) => ({
      ...prev,
      locations: [...(prev.locations || []), newLocation],
    }));

    // Reset and Close
    setForm({ locationId: "", name: "", area: "", unitInStock: "", minInStock: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="link"
          size="sm"
          className="px-0 text-blue-600 font-medium hover:underline"
        >
          + Add Location
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-white rounded-xl shadow-lg z-[9999]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Add Location to Part
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          
          {/* ✅ Location Dropdown with API */}
          <div className="flex flex-col gap-2 mt-4">
            <Label className="text-sm font-medium text-gray-900">
              Location Name
            </Label>
            <PartDynamicSelect
              name="location_select_modal"
              placeholder="Select location..."
              options={locationOptions}
              value={form.locationId}
              loading={loading}
              onFetch={fetchLocationOptions}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              onSelect={(val) => {
                const id = Array.isArray(val) ? val[0] : val;
                const selectedOpt = locationOptions.find((opt) => opt.id === id);
                setForm((prev) => ({
                  ...prev,
                  locationId: id,
                  name: selectedOpt ? selectedOpt.name : "", // ✅ Capture Name
                }));
              }}
            />
          </div>

          {/* Area */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-gray-900">Area</Label>
            <Input
              className="bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
              placeholder="Enter area (e.g. Shelf A)"
              value={form.area}
              onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
            />
          </div>

          {/* Stock Inputs */}
          <div className="grid grid-cols-2 gap-x-6">
            <div className="flex flex-col gap-2 mr-2">
              <Label className="text-sm font-medium text-gray-900">
                Units in Stock
              </Label>
              <Input
                type="number"
                className="bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                placeholder="0"
                value={form.unitInStock}
                onChange={(e) =>
                  setForm((f) => ({ ...f, unitInStock: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-gray-900">
                Minimum in Stock
              </Label>
              <Input
                type="number"
                className="bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                placeholder="0"
                value={form.minInStock}
                onChange={(e) =>
                  setForm((f) => ({ ...f, minInStock: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="flex justify-end gap-3 pt-4 pb-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 text-white font-medium hover:bg-blue-700"
              disabled={!form.locationId}
            >
              Add Location
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}