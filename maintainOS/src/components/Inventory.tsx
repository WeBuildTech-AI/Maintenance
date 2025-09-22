import * as React from "react";
import { useMemo, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Search,
  Plus,
  LayoutGrid,
  ChevronDown,
  Filter,
  Settings,
  Upload,
  Edit,
  MoreHorizontal,
  Mail,
  Phone,
  Paperclip,
  Building2,
  MapPin,
  Tag,
  QrCode,
} from "lucide-react";

/* ------------------------------- Types ------------------------------- */
type Vendor = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
};

type Location = {
  id: string;
  name: string;
  area?: string;
};

type ItemVendor = { vendorId: string; orderingPartNumber?: string };

type Item = {
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
  assetNames?: string[]; // simple chips for now
  vendors: ItemVendor[];
  files?: string[];
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
};

/* ----------------------------- Mock Data ---------------------------- */
const mockVendors: Vendor[] = [
  { id: "V-001", name: "Ramu", email: "ramu@vendor.com", phone: "+91 9876543210" },
  { id: "V-002", name: "Acme Spares", email: "sales@acmespares.com", phone: "+91 9988776655" },
];

const mockLocations: Location[] = [
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
    unitsInStock: 12,         // below min => needs restock
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
    unitsInStock: 0,          // out of stock
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
    unitsInStock: 0,          // out of stock
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


/* ----------------------------- Utilities ---------------------------- */
function id() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2, 10);
}
const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    isFinite(n) ? n : 0
  );

/* ---------------------------- New Item Form -------------------------- */
type NewItem = {
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
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={startCreate}>
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
          <Button variant="ghost" size="sm" className="gap-2 text-blue-600">
            <Settings className="h-4 w-4" />
            My Filters
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left list */}
        <div className="w-96 border-r bg-card flex flex-col min-h-0">
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
                <Card
                  key={it.id}
                  className={`cursor-pointer transition-colors ${
                    selectedId === it.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => {
                    setSelectedId(it.id);
                    setCreating(false);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{it.name}</h4>
                        <div className="text-sm text-muted-foreground">
                          {mockLocations.find((l) => l.id === it.locationId)?.name ?? "-"}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{it.unitsInStock} units</div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded border-dashed" />
                  </div>
                  <p className="text-muted-foreground mb-2">No parts found</p>
                  <Button variant="link" className="text-primary p-0" onClick={startCreate}>
                    Create your first part
                  </Button>
                </div>
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
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded border-dashed" />
                </div>
                <p className="text-muted-foreground mb-2">Select a part to view details</p>
                <p className="text-sm text-muted-foreground">or create a new one to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ====================== Right panel: Details View ====================== */
function PartDetails({
  item,
  stockStatus,
}: {
  item: Item;
  stockStatus: { ok: boolean; delta: number } | null;
}) {
  const vendorBadge = (v: ItemVendor) => {
    const ven = mockVendors.find((mv) => mv.id === v.vendorId);
    if (!ven) return null;
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700">
          {ven.name.slice(0, 1)}
        </div>
        <div className="leading-tight">
          <div className="font-medium">{ven.name}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            {ven.email && (
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {ven.email}
              </span>
            )}
            {ven.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {ven.phone}
              </span>
            )}
          </div>
        </div>
        {v.orderingPartNumber && (
          <span className="ml-auto text-sm text-muted-foreground">
            Ordering Part Number <span className="font-medium">{v.orderingPartNumber}</span>
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between">
        <h2 className="text-xl font-medium">{item.name}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
            <Upload className="h-4 w-4" />
            Restock
          </Button>
          <Button variant="outline" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Archive</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs (static visuals) */}
      <div className="border-b">
        <div className="flex gap-6 px-6">
          <div className="py-3 border-b-2 border-primary text-primary cursor-default">Details</div>
          <div className="py-3 text-muted-foreground cursor-default">History</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-8">
        <div className="text-muted-foreground">{item.unitsInStock} units in stock</div>

        {/* Top stats */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Minimum in Stock</div>
            <div className="mt-1">{item.minInStock} units</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Unit Cost</div>
            <div className="mt-1">{money(item.unitCost)}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Part Type</div>
            <div className="mt-1">
              {item.partTypes?.length ? (
                item.partTypes.map((p) => (
                  <Badge key={p} variant="outline" className="mr-1">
                    {p}
                  </Badge>
                ))
              ) : (
                "-"
              )}
            </div>
          </Card>
        </div>

        {/* Location table */}
        <div>
          <h3 className="font-medium mb-3">Location</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="p-3">Location</th>
                  <th className="p-3">Area</th>
                  <th className="p-3">Units in Stock</th>
                  <th className="p-3">Minimum in Stock</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3">
                    <div className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      {mockLocations.find((l) => l.id === item.locationId)?.name ?? "-"}
                    </div>
                  </td>
                  <td className="p-3">{item.area ?? "-"}</td>
                  <td className="p-3">{item.unitsInStock}</td>
                  <td className="p-3">{item.minInStock}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Description + QR */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-2">Description</div>
            <div>{item.description || "-"}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-2">QR Code/Barcode</div>
            {item.qrCode ? (
              <div className="text-sm">{item.qrCode}</div>
            ) : (
              <div className="text-sm text-muted-foreground">Barcode will be generated</div>
            )}
            <div className="mt-3 w-40 h-40 border rounded-md flex items-center justify-center bg-muted/30">
              <QrCode className="h-20 w-20 text-muted-foreground" />
            </div>
          </Card>
        </div>

        {/* Assets */}
        {item.assetNames?.length ? (
          <div>
            <h3 className="font-medium mb-2">Assets ({item.assetNames.length})</h3>
            <div className="flex flex-wrap gap-2">
              {item.assetNames.map((a) => (
                <Badge key={a} variant="outline">
                  {a}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        {/* Vendors */}
        <div>
          <h3 className="font-medium mb-3">Vendors</h3>
          <div className="space-y-4">
            {item.vendors.map((v, i) => (
              <Card key={i} className="p-4">
                {vendorBadge(v)}
              </Card>
            ))}
          </div>
        </div>

        {/* Files */}
        <div>
          <h3 className="font-medium mb-3">Attached Files</h3>
          {item.files?.length ? (
            <div className="space-y-2">
              {item.files.map((f, i) => (
                <div key={i} className="inline-flex items-center gap-2 border rounded px-3 py-2">
                  <Paperclip className="h-4 w-4" />
                  <span className="text-sm">{f}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No files attached</div>
          )}
        </div>

        {/* Created/Updated + CTA */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-4">
            <div className="text-sm">
              Created By <span className="font-medium">{item.createdBy}</span>{" "}
              on {new Date(item.createdAt).toLocaleString()}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm">
              Last updated By <span className="font-medium">{item.updatedBy ?? "-"}</span>{" "}
              {item.updatedAt ? `on ${new Date(item.updatedAt).toLocaleString()}` : ""}
            </div>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Upload className="h-4 w-4" />
            Use in New Work Order
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ====================== Right panel: New Part Form ====================== */
function NewPartForm({
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
            <div className="text-xl font-medium mb-4">{newItem.name || "New Part"}</div>

            <div className="mb-6">
              <div className="w-full h-32 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors">
                <Upload className="h-6 w-6 text-blue-600 mb-2" />
                <span className="text-sm text-blue-600">Add or drag pictures</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Input
                className="h-9 text-sm"
                placeholder="Part Name"
                value={newItem.name}
                onChange={(e) => setNewItem((s) => ({ ...s, name: e.target.value }))}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  className="h-9 text-sm"
                  type="number"
                  placeholder="Unit Cost"
                  value={newItem.unitCost}
                  onChange={(e) => setNewItem((s) => ({ ...s, unitCost: Number(e.target.value) || 0 }))}
                />
                <Input
                  className="h-9 text-sm"
                  type="number"
                  placeholder="Units in Stock"
                  value={newItem.unitsInStock}
                  onChange={(e) =>
                    setNewItem((s) => ({ ...s, unitsInStock: Number(e.target.value) || 0 }))
                  }
                />
                <Input
                  className="h-9 text-sm"
                  type="number"
                  placeholder="Minimum in Stock"
                  value={newItem.minInStock}
                  onChange={(e) =>
                    setNewItem((s) => ({ ...s, minInStock: Number(e.target.value) || 0 }))
                  }
                />
              </div>
              <Input
                className="h-24 text-sm"
                // asChild={false}
                placeholder="Description"
                value={newItem.description}
                onChange={(e) => setNewItem((s) => ({ ...s, description: e.target.value }))}
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
              onChange={(e) => setNewItem((s) => ({ ...s, qrCode: e.target.value }))}
            />
            <div className="mt-3 w-40 h-40 border rounded-md flex items-center justify-center bg-muted/30">
              <QrCode className="h-20 w-20 text-muted-foreground" />
            </div>

            <div className="mt-6">
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
                    setNewItem((s) => ({ ...s, partTypes: [...s.partTypes, "Critical"] }))
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
                onValueChange={(v: string) => setNewItem((s) => ({ ...s, locationId: v }))}
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

              <Select value={newItem.area} onValueChange={(v: string) => setNewItem((s) => ({ ...s, area: v }))}>
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
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
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
                        nv[idx] = { ...nv[idx], orderingPartNumber: e.target.value };
                        return { ...s, vendors: nv };
                      })
                    }
                  />
                  {newItem.vendors.length > 1 && (
                    <div className="md:col-span-3 -mt-2">
                      <Button variant="ghost" size="sm" onClick={() => removeVendorRow(idx)}>
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
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={onCreate}
            disabled={!newItem.name}
          >
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
