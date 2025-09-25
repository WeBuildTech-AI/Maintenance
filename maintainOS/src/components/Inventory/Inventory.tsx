
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
} from "lucide-react";

import { PartCard } from "./PartCard";
import { EmptyState } from "./EmptyState";
import { PartDetails } from "./PartDetails";
import { NewPartForm } from "./NewPartForm";
import { id } from "./utils";

/* ------------------------------- Types ------------------------------- */
export type Vendor = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
};

export type Location = {
  id: string;
  name: string;
  area?: string;
};

export type ItemVendor = { vendorId: string; orderingPartNumber?: string };

export type Item = {
  id: string;
  name: string;
  description?: string;
  unitCost: number;
  unitsInStock: number;
  minInStock: number;
  locationId?: string;
  area?: string;
  qrCode?: string;
  partTypes?: string[];
  assetNames?: string[];
  vendors: ItemVendor[];
  files?: string[];
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
};

/* ---------------------------- New Item Form -------------------------- */
export type NewItem = {
  name: string;
  unitCost: number;
  description: string;
  partTypes: string[];
  qrCode?: string;
  locationId?: string;
  area?: string;
  unitsInStock: number;
  minInStock: number;
  assetNames: string[];
  vendors: ItemVendor[];
  files: string[];
};

/* ----------------------------- Mock Data ---------------------------- */
export const mockVendors: Vendor[] = [
  { id: "V-001", name: "Ramu", email: "ramu@vendor.com", phone: "+91 9876543210" },
  { id: "V-002", name: "Acme Spares", email: "sales@acmespares.com", phone: "+91 9988776655" },
];

export const mockLocations: Location[] = [
  { id: "L-1", name: "Substation 1", area: "Ground Floor" },
  { id: "L-2", name: "Warehouse A", area: "Bay 3" },
];

const seedItems: Item[] = [
  {
    id: id(),
    name: "Test Part",
    description: "General spare used with HVAC assemblies.",
    unitCost: 20,
    unitsInStock: 30,
    minInStock: 5,
    locationId: "L-1",
    area: "Ground Floor",
    qrCode: "5FNYVUEGCF27",
    partTypes: ["Critical"],
    assetNames: ["HVAC"],
    vendors: [{ vendorId: "V-001", orderingPartNumber: "1234542" }],
    files: ["spec-sheet-test-part.pdf"],
    createdBy: "Ashwini Chauhan",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedBy: "Ashwini Chauhan",
    updatedAt: new Date().toISOString(),
  },
  {
    id: id(),
    name: "Air Filter 20×20×1 (MERV 8)",
    description: "Pleated HVAC filter; replace quarterly.",
    unitCost: 5.25,
    unitsInStock: 12,
    minInStock: 20,
    locationId: "L-2",
    area: "Bay 3",
    qrCode: "AF-20x20-1",
    partTypes: ["Consumable"],
    assetNames: ["HVAC"],
    vendors: [
      { vendorId: "V-002", orderingPartNumber: "AF-20201" },
      { vendorId: "V-001", orderingPartNumber: "FIL-7792" },
    ],
    files: ["air-filter-datasheet.pdf"],
    createdBy: "Ashwini Chauhan",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedBy: "Ashwini Chauhan",
    updatedAt: new Date().toISOString(),
  },
  {
    id: id(),
    name: "Cable Ties (100 pc, 8\")",
    description: "UV-resistant nylon cable ties.",
    unitCost: 1.08,
    unitsInStock: 200,
    minInStock: 100,
    locationId: "L-2",
    area: "Bay 3",
    qrCode: "CT-100-8IN",
    partTypes: ["Consumable"],
    assetNames: [],
    vendors: [{ vendorId: "V-002", orderingPartNumber: "CT-100" }],
    files: [],
    createdBy: "Ashwini Chauhan",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedBy: "Ashwini Chauhan",
    updatedAt: new Date().toISOString(),
  },
  {
    id: id(),
    name: "6203-2RS Ball Bearing",
    description: "Sealed ball bearing for small motors.",
    unitCost: 4.6,
    unitsInStock: 0,
    minInStock: 8,
    locationId: "L-1",
    area: "Ground Floor",
    qrCode: "BRG-6203-2RS",
    partTypes: ["Critical"],
    assetNames: ["HVAC", "Pump"],
    vendors: [{ vendorId: "V-001", orderingPartNumber: "6203-2RS" }],
    files: ["bearing-size-chart.pdf"],
    createdBy: "Ashwini Chauhan",
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updatedBy: "Ashwini Chauhan",
    updatedAt: new Date().toISOString(),
  },
  {
    id: id(),
    name: "Multipurpose Grease (400g Cartridge)",
    description: "Lithium EP2 grease for general lubrication.",
    unitCost: 3.9,
    unitsInStock: 48,
    minInStock: 24,
    locationId: "L-1",
    area: "Ground Floor",
    qrCode: "LUBE-EP2-400",
    partTypes: ["Consumable"],
    assetNames: ["HVAC", "Conveyor"],
    vendors: [{ vendorId: "V-002", orderingPartNumber: "EP2-400G" }],
    files: ["sds-ep2.pdf"],
    createdBy: "Ashwini Chauhan",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedBy: "Ashwini Chauhan",
    updatedAt: new Date().toISOString(),
  },
  // intentional duplicates from your original seed:
  {
    id: id(),
    name: "Cable Ties (100 pc, 8\")",
    description: "UV-resistant nylon cable ties.",
    unitCost: 1.08,
    unitsInStock: 200,
    minInStock: 100,
    locationId: "L-2",
    area: "Bay 3",
    qrCode: "CT-100-8IN",
    partTypes: ["Consumable"],
    assetNames: [],
    vendors: [{ vendorId: "V-002", orderingPartNumber: "CT-100" }],
    files: [],
    createdBy: "Ashwini Chauhan",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedBy: "Ashwini Chauhan",
    updatedAt: new Date().toISOString(),
  },
  {
    id: id(),
    name: "6203-2RS Ball Bearing",
    description: "Sealed ball bearing for small motors.",
    unitCost: 4.6,
    unitsInStock: 0,
    minInStock: 8,
    locationId: "L-1",
    area: "Ground Floor",
    qrCode: "BRG-6203-2RS",
    partTypes: ["Critical"],
    assetNames: ["HVAC", "Pump"],
    vendors: [{ vendorId: "V-001", orderingPartNumber: "6203-2RS" }],
    files: ["bearing-size-chart.pdf"],
    createdBy: "Ashwini Chauhan",
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updatedBy: "Ashwini Chauhan",
    updatedAt: new Date().toISOString(),
  },
  {
    id: id(),
    name: "Multipurpose Grease (400g Cartridge)",
    description: "Lithium EP2 grease for general lubrication.",
    unitCost: 3.9,
    unitsInStock: 48,
    minInStock: 24,
    locationId: "L-1",
    area: "Ground Floor",
    qrCode: "LUBE-EP2-400",
    partTypes: ["Consumable"],
    assetNames: ["HVAC", "Conveyor"],
    vendors: [{ vendorId: "V-002", orderingPartNumber: "EP2-400G" }],
    files: ["sds-ep2.pdf"],
    createdBy: "Ashwini Chauhan",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedBy: "Ashwini Chauhan",
    updatedAt: new Date().toISOString(),
  },
];

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
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);
  const [creating, setCreating] = useState(false);
  const [newItem, setNewItem] = useState<NewItem>(emptyNewItem);

  const filtered = items.filter((i) => {
    const vendorNames = i.vendors
      .map((v) => mockVendors.find((mv) => mv.id === v.vendorId)?.name ?? "")
      .join(" ");
    const text = `${i.name} ${vendorNames} ${i.description ?? ""}`.toLowerCase();
    return text.includes(query.toLowerCase());
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
    setCreating(true);
  };

  const addVendorRow = () =>
    setNewItem((s) => ({ ...s, vendors: [...s.vendors, { vendorId: "", orderingPartNumber: "" }] }));

  const removeVendorRow = (idx: number) =>
    setNewItem((s) => ({ ...s, vendors: s.vendors.filter((_, i) => i !== idx) }));

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
        .map((v) => ({ vendorId: v.vendorId, orderingPartNumber: v.orderingPartNumber || "" })),
      files: newItem.files,
      createdBy: "Ashwini Chauhan",
      createdAt: new Date().toISOString(),
      updatedBy: "Ashwini Chauhan",
      updatedAt: new Date().toISOString(),
    };
    setItems((s) => [item, ...s]);
    setCreating(false);
    setSelectedId(item.id);
  };

  /* ------------------------------- UI ------------------------------- */
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="p-6 border-b bg-card flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-medium">Parts</h1>
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Panel View</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search Parts"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 w-72"
              />
            </div>
            <Button className="gap-2 bg-orange-600 hover:bg-orange-700" onClick={startCreate}>
              <Plus className="h-4 w-4" />
              New Part
            </Button>
          </div>
        </div>

        {/* Filters row (visual) */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Tag className="h-4 w-4" />
              Part Types
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Building2 className="h-4 w-4" />
              Vendor
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Add Filter
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="gap-2 text-orange-600">
            <Settings className="h-4 w-4" />
            My Filters
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left list */}
        <div className="w-112 border-r bg-card flex flex-col min-h-0">
          <div className="p-4 border-b flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort By:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-primary p-0 h-auto">
                    Name: Ascending Order
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Name: Ascending Order</DropdownMenuItem>
                  <DropdownMenuItem>Name: Descending Order</DropdownMenuItem>
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
                    setCreating(false);
                  }}
                />
              ))}

              {filtered.length === 0 && (
                <EmptyState
                  variant="list"
                  onCreate={startCreate}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 bg-card min-h-0 flex flex-col">
          {creating ? (
            <NewPartForm
              newItem={newItem}
              setNewItem={setNewItem}
              addVendorRow={addVendorRow}
              removeVendorRow={removeVendorRow}
              onCancel={() => setCreating(false)}
              onCreate={createItem}
            />
          ) : selected ? (
            <PartDetails item={selected} stockStatus={stockStatus} />
          ) : (
            <EmptyState variant="panel" />
          )}
        </div>
      </div>
    </div>
  );
}
