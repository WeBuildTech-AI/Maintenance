import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Search,
  Plus,
  LayoutGrid,
  ChevronDown,
  Filter,
  Settings,
  Building2,
  MapPin,
  Tag,
  PanelTop,
  Table,
} from "lucide-react";

import { PartCard } from "./PartCard";
import { EmptyState } from "./EmptyState";
import { PartDetails } from "./PartDetails";
import { NewPartForm } from "./NewPartForm";
import { id } from "./utils";
import { PartTable } from "./PartTable";
import { mockVendors, seedItems, type Item, type NewItem } from "./inventory.types";
import type { ViewMode } from "../purchase-orders/po.types";
import { InventoryHeaderComponent } from "./InventoryHeader";


const emptyNewItem: NewItem = {
  name: "",
  unitCost: 0,
  description: "",
  partTypes: [],
  qrCode: "",
  locationId: undefined,
  area: "",
  unitsInStock: 0,
  minInStock: 0,
  assetNames: [],
  vendors: [{ vendorId: "", orderingPartNumber: "" }],
  files: [],
};

/* ============================ COMPONENT ============================ */
export function Inventory() {
  const [items, setItems] = useState<Item[]>(seedItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    items[0]?.id ?? null
  );
  const [isCreatingInventory, setIsCreatingInventory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newItem, setNewItem] = useState<NewItem>(emptyNewItem);
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const filtered = items.filter((i) => {
    const vendorNames = i.vendors
      .map((v) => mockVendors.find((mv) => mv.id === v.vendorId)?.name ?? "")
      .join(" ");
    const text = `${i.name} ${vendorNames} ${
      i.description ?? ""
    }`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  const selected = items.find((i) => i.id === selectedId) || null;

  const stockStatus = useMemo(() => {
    if (!selected) return null;
    const delta = selected.unitsInStock - selected.minInStock;
    return { ok: delta >= 0, delta };
  }, [selected]);

  /* ---------------------------- Handlers ---------------------------- */
  const startCreate = () => {
    setNewItem(emptyNewItem);
    setIsCreatingInventory(true);
  };

  const addVendorRow = () =>
    setNewItem((s) => ({
      ...s,
      vendors: [...s.vendors, { vendorId: "", orderingPartNumber: "" }],
    }));

  const removeVendorRow = (idx: number) =>
    setNewItem((s) => ({
      ...s,
      vendors: s.vendors.filter((_, i) => i !== idx),
    }));

  const createItem = () => {
    if (!newItem.name) return;
    const item: Item = {
      id: id(),
      name: newItem.name,
      description: newItem.description,
      unitCost: Number(newItem.unitCost) || 0,
      unitsInStock: Number(newItem.unitsInStock) || 0,
      minInStock: Number(newItem.minInStock) || 0,
      locationId: newItem.locationId,
      area: newItem.area,
      qrCode: newItem.qrCode || undefined,
      partTypes: newItem.partTypes,
      assetNames: newItem.assetNames,
      vendors: newItem.vendors
        .filter((v) => v.vendorId)
        .map((v) => ({
          vendorId: v.vendorId,
          orderingPartNumber: v.orderingPartNumber || "",
        })),
      files: newItem.files,
      createdBy: "Ashwini Chauhan",
      createdAt: new Date().toISOString(),
      updatedBy: "Ashwini Chauhan",
      updatedAt: new Date().toISOString(),
    };
    setItems((s) => [item, ...s]);
    setIsCreatingInventory(false);
    setSelectedId(item.id);
  };

  /* ------------------------------- UI ------------------------------- */
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      {InventoryHeaderComponent(viewMode, setViewMode, searchQuery, setSearchQuery, setIsCreatingInventory, setShowSettings)}

      {viewMode === "table" ? (
        <>
          <PartTable inventory={filtered} setSelectedId={setSelectedId} />
        </>
      ) : (
        <>
          <div className="flex flex-1 min-h-0">
            {/* Left list */}
            <div className="w-112 border-r bg-card flex flex-col min-h-0">
              <div className="p-4 border-b flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Sort By:
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary p-0 h-auto"
                      >
                        Name: Ascending Order
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Name: Ascending Order</DropdownMenuItem>
                      <DropdownMenuItem>
                        Name: Descending Order
                      </DropdownMenuItem>
                      <DropdownMenuItem>Units in Stock</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="p-4 space-y-3">
                  {filtered.map((it) => (
                    <PartCard
                      key={it.id}
                      item={it}
                      selected={selectedId === it.id}
                      onSelect={() => {
                        setSelectedId(it.id);
                        setIsCreatingInventory(false);
                      }}
                    />
                  ))}

                  {filtered.length === 0 && (
                    <EmptyState variant="list" onCreate={startCreate} />
                  )}
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 bg-card min-h-0 flex flex-col">
              {isCreatingInventory ? (
                <NewPartForm
                  newItem={newItem}
                  setNewItem={setNewItem}
                  addVendorRow={addVendorRow}
                  removeVendorRow={removeVendorRow}
                  onCancel={() => setIsCreatingInventory(false)}
                  onCreate={createItem}
                />
              ) : selected ? (
                <PartDetails item={selected} stockStatus={stockStatus} />
              ) : (
                <EmptyState variant="panel" />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
