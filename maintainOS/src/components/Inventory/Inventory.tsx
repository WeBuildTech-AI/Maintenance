import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { EmptyState } from "./EmptyState";
import { InventoryHeaderComponent } from "./InventoryHeader";
import { NewPartForm } from "./NewPartForm/NewPartForm";
import { PartCard } from "./PartCard";
import { PartDetails } from "./PartDetail/PartDetails";
import RestockModal from "./PartDetail/RestockModal";
import { PartTable } from "./PartTable";

/* ✅ Import partService like vendorService */
import { partService } from "../../store/parts/parts.service";

export function Inventory() {
  const [parts, setParts] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"panel" | "table">("panel");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // 🟡 Sorting states (VendorSidebar-style)
  const [sortType, setSortType] = useState("Name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const headerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // ✅ Refresh helper function
  const refreshParts = async () => {
    try {
      setLoading(true);
      const res = await partService.fetchParts(10, 1, 0);
      console.log("📦 Parts API response:", res);
      setParts(res);
    } catch (err: any) {
      console.error("Error fetching parts:", err);
      setError("Failed to load parts");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch on mount
  useEffect(() => {
    refreshParts();
  }, []);

  // ✅ Refresh when coming back from delete/edit (fallback)
  useEffect(() => {
    if (location.state?.refresh) {
      refreshParts();
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, location.pathname, navigate]);

  // 🟡 Handle dropdown positioning
  useEffect(() => {
    if (headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      });
    }
  }, [isDropdownOpen]);

  // 🟡 Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        headerRef.current &&
        !headerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
        setOpenSection(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🟡 Sort parts
  const sortedParts = useMemo(() => {
    const sorted = [...parts].sort((a, b) => {
      let valA: any = a.name;
      let valB: any = b.name;

      if (sortType === "Creation Date") {
        valA = a.createdAt || "";
        valB = b.createdAt || "";
      } else if (sortType === "Last Updated") {
        valA = a.updatedAt || "";
        valB = b.updatedAt || "";
      } else if (sortType === "Units in Stock") {
        valA = a.unitsInStock || 0;
        valB = b.unitsInStock || 0;
      }

      if (typeof valA === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });
    return sorted;
  }, [parts, sortType, sortOrder]);

  return (
    <div className="flex flex-col h-full">
      {InventoryHeaderComponent(
        viewMode,
        setViewMode,
        "",
        () => { },
        () => navigate("/inventory/create"),
        () => { }
      )}

      {/* 🟩 TABLE VIEW */}
      {viewMode === "table" ? (
        <div className="flex-1 overflow-auto p-3">
          {loading && (
            <p className="text-center text-sm text-gray-500">Loading...</p>
          )}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && parts.length === 0 && (
            <EmptyState variant="table" />
          )}
          {!loading && !error && parts.length > 0 && (
            <PartTable
              inventory={sortedParts}
              setSelectedId={(id) => navigate(`/inventory/${id}`)}
            />
          )}
        </div>
      ) : (
        // 🟦 PANEL VIEW
        <div className="flex flex-1 min-h-0">
          {/* LEFT LIST */}
          <div className="w-96 border bg-card flex flex-col min-h-0 max-h-full relative">
            {/* Sort Header */}
            <div
              ref={headerRef}
              className="p-4 border-b bg-white sticky top-0 z-40 flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <span>Sort By:</span>
                <button
                  onClick={() => setIsDropdownOpen((p) => !p)}
                  className="flex items-center gap-1 text-sm text-yellow-600 font-semibold focus:outline-none"
                >
                  {sortType}:{" "}
                  {sortOrder === "asc" ? "Ascending" : "Descending"}
                  {isDropdownOpen ? (
                    <ChevronUp className="w-4 h-4 text-yellow-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-yellow-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Dropdown Modal */}
            {isDropdownOpen && (
              <div
                ref={modalRef}
                className="fixed z-[9999] text-sm rounded-md border border-gray-200 bg-white shadow-lg animate-fade-in p-2"
                style={{
                  top: dropdownPos.top,
                  left: dropdownPos.left,
                  transform: "translateX(-50%)",
                  width: "300px",
                  maxWidth: "90vw",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col divide-y divide-gray-100">
                  {[
                    {
                      label: "Creation Date",
                      options: ["Oldest First", "Newest First"],
                    },
                    {
                      label: "Last Updated",
                      options: ["Least Recent First", "Most Recent First"],
                    },
                    {
                      label: "Name",
                      options: ["Ascending Order", "Descending Order"],
                    },
                    {
                      label: "Units in Stock",
                      options: ["Lowest First", "Highest First"],
                    },
                  ].map((section) => (
                    <div key={section.label} className="flex flex-col mt-1 mb-1">
                      <button
                        onClick={() =>
                          setOpenSection(
                            openSection === section.label
                              ? null
                              : section.label
                          )
                        }
                        className={`flex items-center justify-between w-full px-4 py-3 text-sm transition-all rounded-md ${sortType === section.label
                            ? "text-yellow-600 font-medium bg-gray-50"
                            : "text-gray-800 hover:bg-gray-50"
                          }`}
                      >
                        <span>{section.label}</span>
                        {openSection === section.label ? (
                          <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </button>

                      {openSection === section.label && (
                        <div className="flex flex-col bg-gray-50 border-t border-gray-100 py-1">
                          {section.options.map((opt) => {
                            const isSelected =
                              (section.label === sortType &&
                                sortOrder === "asc" &&
                                (opt.includes("Asc") ||
                                  opt.includes("Oldest") ||
                                  opt.includes("Least") ||
                                  opt.includes("Lowest"))) ||
                              (section.label === sortType &&
                                sortOrder === "desc" &&
                                (opt.includes("Desc") ||
                                  opt.includes("Newest") ||
                                  opt.includes("Most") ||
                                  opt.includes("Highest")));

                            return (
                              <button
                                key={opt}
                                onClick={() => {
                                  setSortType(section.label);
                                  setSortOrder(
                                    opt.includes("Asc") ||
                                      opt.includes("Oldest") ||
                                      opt.includes("Least") ||
                                      opt.includes("Lowest")
                                      ? "asc"
                                      : "desc"
                                  );
                                }}
                                className={`flex items-center justify-between px-6 py-2 text-left text-sm transition rounded-md ${isSelected
                                    ? "text-yellow-600 bg-white"
                                    : "text-gray-700 hover:text-yellow-500 hover:bg-white"
                                  }`}
                              >
                                {opt}
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-yellow-500" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Parts List */}
            <div className="flex-1 overflow-y-auto">
              {loading && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  Loading parts...
                </p>
              )}
              {error && (
                <p className="text-center text-red-500 mt-4">{error}</p>
              )}
              {!loading && !error && parts.length === 0 && (
                <EmptyState variant="panel" />
              )}
              {!loading &&
                !error &&
                sortedParts.map((it) => (
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
              <Route
                path="create"
                element={<CreatePartRoute onSuccess={refreshParts} />}
              />
              <Route
                path=":id"
                element={
                  <PartDetailRoute
                    parts={parts}
                    onPartDeleted={(deletedId) =>
                      setParts((prev) => prev.filter((p) => p.id !== deletedId))
                    }
                  />
                }
              />
              <Route
                path=":id/edit"
                element={<EditPartRoute onSuccess={refreshParts} />}
              />
              {/* ✅ Modified Restock Route */}
              <Route path=":id/restock" element={<RestockRoute parts={parts} />} />
            </Routes>
          </div>
        </div>
      )}
    </div>
  );
}

/* ✅ CREATE ROUTE */
function CreatePartRoute({ onSuccess }: { onSuccess: () => void }) {
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
      onCreate={() => {
        console.log("✅ Part created:", newItem);
        onSuccess();
        navigate("/inventory", { state: { refresh: true } });
      }}
    />
  );
}

/* ✅ VIEW DETAILS ROUTE */
function PartDetailRoute({
  parts,
  onPartDeleted,
}: {
  parts: any[];
  onPartDeleted: (id: string) => void;
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const part = parts.find((p) => String(p.id) === String(id));
  if (!part) return <EmptyState variant="panel" />;

  const delta = part.unitsInStock - part.minInStock;
  const stockStatus = { ok: delta >= 0, delta };

  return (
    <PartDetails
      item={part}
      stockStatus={stockStatus}
      onEdit={() => navigate(`/inventory/${id}/edit`)}
      onDeleteSuccess={onPartDeleted}
    />
  );
}

/* ✅ EDIT ROUTE */
function EditPartRoute({ onSuccess }: { onSuccess: () => void }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editItem, setEditItem] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const part = await partService.fetchPartById(id!);
        setEditItem({
          ...part,
          _original: part,
          pictures: [],
          files: [],
          partsType: [],
          assetIds: [],
          teamsInCharge: [],
          vendorIds: [],
          vendors: [],
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id]);

  if (!editItem) return <EmptyState variant="panel" />;

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
        onSuccess();
        navigate(`/inventory/${id}`, { state: { refresh: true } });
      }}
    />
  );
}

/* ✅ RESTOCK MODAL ROUTE */
function RestockRoute({ parts }: { parts: any[] }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const part = parts.find((p) => String(p.id) === String(id));

  if (!part) return <EmptyState variant="panel" />;

  console.log("🧩 RestockRoute received part:", part);
  console.log("📍 Location data:", part.locations);

  return (
    <RestockModal
      isOpen={true}
      part={part}
      onClose={() => navigate(`/inventory/${id}`)}
      onConfirm={(data) => {
        console.log("✅ Restock confirmed for:", part.name);
        console.log("📦 Location sent:", part.location || part.locations);
        console.log("📥 Restock input:", data);
        navigate(`/inventory/${id}`, { state: { refresh: true } });
      }}
    />

  );
}
