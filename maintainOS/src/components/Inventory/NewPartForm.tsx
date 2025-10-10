import * as React from "react";
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
import { mockLocations, mockVendors, type NewItem } from "./inventory.types";

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
              {newItem.name || "Name"}
            </div>

            <div className="mb-6">
              <div className="w-full h-32 border-2 border-dashed border-orange-300 rounded-lg bg-orange-50 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-100 transition-colors">
                <Upload className="h-6 w-6 text-orange-600 mb-2" />
                <span className="text-sm text-orange-600">
                  Add or drag pictures
                </span>
              </div>
            </div>

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
              <Input
                className="h-24 text-sm"
                placeholder="Description"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem((s) => ({ ...s, description: e.target.value }))
                }
              />
            </div>
          </section>

          {/* QR & Part Types */}
          <section>
            <div className="text-base font-medium mb-4">QR Code/Barcode</div>
            <Input
              className="h-9 text-sm mb-3"
              placeholder="Barcode will be generated (or input manually)"
              value={newItem.qrCode}
              onChange={(e) =>
                setNewItem((s) => ({ ...s, qrCode: e.target.value }))
              }
            />
            <div className="mt-3 w-40 h-40 border rounded-md flex items-center justify-center bg-muted/30">
              <QrCode className="h-20 w-20 text-muted-foreground" />
            </div>

            <div className="mt-6">
              <div className="text-base font-medium mb-2">Part Types</div>
              <div className="flex items-center gap-2">
                {(newItem.partTypes || []).map((p, i) => (
                  <Badge key={`${p}-${i}`} variant="outline">
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
            </div>
          </section>

          {/* Location row */}
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
            <div className="mt-4">
              <Button variant="outline" onClick={addVendorRow}>
                Add additional Vendor
              </Button>
            </div>
          </section>

          {/* Files */}
          <section className="mt-4">
            <div className="text-base font-medium mb-2">Files</div>
            <Button className="gap-2 h-9 bg-white hover:bg-white cursor-pointer text-orange-600">
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
