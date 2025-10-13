import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { EmptyState } from "./EmptyState";
import { InventoryHeaderComponent } from "./InventoryHeader";
import { NewPartForm } from "./NewPartForm/NewPartForm";
import { PartCard } from "./PartCard";
import { PartDetails } from "./PartDetail/PartDetails";
import { PartTable } from "./PartTable";
import RestockModal from "./PartDetail/RestockModal";

const DUMMY_PARTS = [
  {
    id: 1,
    name: "Hydraulic Pump",
    description: "High-pressure hydraulic pump used in heavy equipment.",
    unitCost: 4200,
    unitsInStock: 25,
    minInStock: 10,
    locationId: "Warehouse A",
    area: "Section B3",
  },
  {
    id: 2,
    name: "Pressure Gauge",
    description: "Stainless steel industrial-grade pressure gauge.",
    unitCost: 1500,
    unitsInStock: 40,
    minInStock: 15,
    locationId: "Warehouse C",
    area: "Rack 7D",
  },
  {
    id: 3,
    name: "Fuel Injector",
    description: "Precision injector for diesel engines.",
    unitCost: 3200,
    unitsInStock: 8,
    minInStock: 3,
    locationId: "Warehouse B",
    area: "Section C1",
  },
];

export function Inventory() {
  const [inventoryData] = useState<any[]>(DUMMY_PARTS);
  const [viewMode, setViewMode] = useState<"panel" | "table">("panel");
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      {InventoryHeaderComponent(
        viewMode,
        setViewMode,
        "",
        () => {},
        () => navigate("/inventory/create"),
        () => {}
      )}

      {/* 🟩 TABLE VIEW */}
      {viewMode === "table" ? (
        <div className="flex-1 overflow-auto p-3">
          <PartTable
            inventory={inventoryData}
            setSelectedId={(id) => navigate(`/inventory/${id}`)}
          />
        </div>
      ) : (
        // 🟦 PANEL VIEW
        <div className="flex flex-1 min-h-0">
          {/* LEFT LIST */}
          <div className="w-96 border bg-card flex flex-col min-h-0 max-h-full">
            <div className="p-4 border-b bg-white sticky top-0 z-10">
              <span className="text-sm text-muted-foreground">Sort By:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Name: Ascending
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Name: Ascending</DropdownMenuItem>
                  <DropdownMenuItem>Name: Descending</DropdownMenuItem>
                  <DropdownMenuItem>Units in Stock</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex-1 overflow-y-auto">
              {inventoryData.map((it) => (
                <PartCard
                  key={it.id}
                  item={it}
                  selected={false}
                  onSelect={() => navigate(`/inventory/${it.id}`)}
                />
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="flex-1 border bg-card ml-1 mr-2 flex flex-col min-h-0 overflow-hidden">
            <Routes>
              <Route path="/" element={<EmptyState variant="panel" />} />
              <Route path="create" element={<CreatePartRoute />} />
              <Route path=":id" element={<PartDetailRoute />} />
              <Route path=":id/edit" element={<EditPartRoute />} />
              <Route path=":id/restock" element={<RestockRoute />} />
            </Routes>
          </div>
        </div>
      )}
    </div>
  );
}

/* ✅ NEW: Proper create route with useState for typing inputs */
function CreatePartRoute() {
  const navigate = useNavigate();

  const [newItem, setNewItem] = useState<any>({
    name: "",
    description: "",
    unitCost: 0,
    unitInStock: 0,
    minInStock: 0,
    area: "",
    locationId: "",
    qrCode: "",
    pictures: [],
    files: [],
    partsType: [],
    assetIds: [],
    teamsInCharge: [],
    vendorIds: [],
    vendors: [],
  });

  return (
    <NewPartForm
      newItem={newItem}
      setNewItem={setNewItem}
      addVendorRow={() =>
        setNewItem((prev: any) => ({
          ...prev,
          vendors: [
            ...(prev.vendors || []),
            { vendorId: "", orderingPartNumber: "" },
          ],
        }))
      }
      removeVendorRow={(idx: number) =>
        setNewItem((prev: any) => ({
          ...prev,
          vendors: (prev.vendors || []).filter(
            (_: any, i: number) => i !== idx
          ),
        }))
      }
      onCancel={() => navigate("/inventory")}
      onCreate={() => navigate("/inventory")}
    />
  );
}

/* ✅ VIEW DETAILS ROUTE */
function PartDetailRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const part = DUMMY_PARTS.find((p) => String(p.id) === String(id));
  if (!part) return <EmptyState variant="panel" />;

  const delta = part.unitsInStock - part.minInStock;
  const stockStatus = { ok: delta >= 0, delta };

  return (
    <PartDetails
      item={part}
      stockStatus={stockStatus}
      onEdit={() => navigate(`/inventory/${id}/edit`)}
    />
  );
}

/* ✅ EDIT ROUTE (STATE BASED) */
function EditPartRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const part = DUMMY_PARTS.find((p) => String(p.id) === String(id));
  if (!part) return <EmptyState variant="panel" />;

  const [editItem, setEditItem] = useState<any>({
    ...part,
    pictures: [],
    files: [],
    partsType: [],
    assetIds: [],
    teamsInCharge: [],
    vendorIds: [],
    vendors: [],
  });

  return (
    <NewPartForm
      newItem={editItem}
      setNewItem={setEditItem}
      addVendorRow={() =>
        setEditItem((prev: any) => ({
          ...prev,
          vendors: [
            ...(prev.vendors || []),
            { vendorId: "", orderingPartNumber: "" },
          ],
        }))
      }
      removeVendorRow={(idx: number) =>
        setEditItem((prev: any) => ({
          ...prev,
          vendors: (prev.vendors || []).filter(
            (_: any, i: number) => i !== idx
          ),
        }))
      }
      onCancel={() => navigate(`/inventory/${id}`)}
      onCreate={() => {
        console.log("✅ Edited part saved:", editItem);
        navigate(`/inventory/${id}`);
      }}
    />
  );
}

/* ✅ RESTOCK MODAL ROUTE */
function RestockRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const part = DUMMY_PARTS.find((p) => String(p.id) === String(id));
  if (!part) return null;

  return (
    <RestockModal
      isOpen={true}
      onClose={() => navigate(`/inventory/${id}`)}
      onConfirm={(data) => {
        console.log("Restocked part", id, data);
        navigate(`/inventory/${id}`);
      }}
    />
  );
}
