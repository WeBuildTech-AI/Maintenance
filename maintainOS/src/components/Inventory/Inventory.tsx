// Inventory.tsx
"use client";

import { Check, ChevronDown, ChevronUp, PanelTop, Table as TableIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { EmptyState } from "./EmptyState";
import { InventoryHeaderComponent } from "./InventoryHeader";
import { NewPartForm } from "./NewPartForm/NewPartForm";
import { PartCard } from "./PartCard";
import { PartDetails } from "./PartDetail/PartDetails";
import RestockModal from "./PartDetail/RestockModal";
import { PartTable } from "./PartTable";

/* ✅ Import partService */
import { partService } from "../../store/parts/parts.service";
import { FetchPartsParams } from "../../store/parts/parts.types"; 
import { DiscardChangesModal } from "../work-orders/ToDoView/DiscardChangesModal";//discard popup//

// Define ViewMode locally to avoid type errors if not imported
type ViewMode = "table" | "panel";

export function Inventory() {
  const [parts, setParts] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedMode = localStorage.getItem("partViewMode");
    return (savedMode as ViewMode) || "panel";
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const isEditingOrCreating =
    location.pathname.includes("/create") ||
    location.pathname.includes("/edit");
  //handlers
  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);

    if (pendingPath) {
      navigate(pendingPath);
      setPendingPath(null);
    }
  };

  const handleCancelDiscard = () => {
    setShowDiscardModal(false);
    setPendingPath(null);
  };

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  //  Sorting states
  const [sortType, setSortType] = useState("Creation Date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const headerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [shouldSelectFirst, setShouldSelectFirst] = useState(false);
  // ✅ Discard modal state (Work Orders pattern)
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  // ✅ PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  const [filterParams, setFilterParams] = useState<FetchPartsParams>({
    page: 1,
    limit: 50,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const refreshParts = useCallback(async () => {
    let res: any;
    try {
      setLoading(true);
      if (showDeleted) {
        res = await partService.fetchDeletePart();
      } else {
        const apiPayload = {
          ...filterParams,
          name: debouncedSearch || undefined,
        };
        res = await partService.fetchParts(apiPayload);
      }

      setParts(res || []);
    } catch (err: any) {
      console.error("Error fetching parts:", err);
      setError("Failed to load parts");
      setParts([]);
    } finally {
      setLoading(false);
    }
  }, [showDeleted, filterParams, debouncedSearch]);

  useEffect(() => {
    refreshParts();
  }, [refreshParts, viewMode]);

  const handleFilterChange = useCallback((newParams: Partial<FetchPartsParams>) => {
    setFilterParams((prev) => {
      const merged = { ...prev, ...newParams };
      if (JSON.stringify(prev) === JSON.stringify(merged)) return prev;
      return merged;
    });
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      refreshParts();
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, location.pathname, navigate, refreshParts]);

  useEffect(() => {
    if (headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      });
    }
  }, [isDropdownOpen]);

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

  // ✅ Auto-Selection Logic
  useEffect(() => {
    if (viewMode === 'panel' && sortedParts.length > 0) {
      // Basic check to see if we possess an ID in the URL.
      // Current path: /inventory or /inventory/:id or /inventory/create ...
      // We want to avoid overriding /create or /edit
      const isCreateOrEdit = location.pathname.includes('/create') || location.pathname.includes('/edit');
      const hasId = location.pathname !== '/inventory' && location.pathname !== '/inventory/';
      
      if (shouldSelectFirst) {
          navigate(`/inventory/${sortedParts[0].id}`);
          setShouldSelectFirst(false);
      } else if (!hasId && !isCreateOrEdit) {
          // Initial load default selection
           navigate(`/inventory/${sortedParts[0].id}`, { replace: true });
      }
    }
  }, [sortedParts, shouldSelectFirst, viewMode, location.pathname, navigate]);

  // ✅ CLIENT-SIDE PAGINATION LOGIC
  const totalItems = sortedParts.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = sortedParts.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };
  const handleNextPage = () => {
    if (endIndex < totalItems) setCurrentPage((p) => p + 1);
  };

  // Reset page on sort change
  useEffect(() => setCurrentPage(1), [sortType, sortOrder, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-background">
      {InventoryHeaderComponent(
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        // ✅ FIX: Pass navigation to the 5th arg (setIsCreatingForm) 
        // because InventoryHeader calls setIsCreatingForm(true) on click.
        () => navigate("/inventory/create"), 
        // 6th arg: setShowSettings (dummy/placeholder as it's not state-managed here yet)
        () => {}, 
        setIsSettingsModalOpen,
        setShowDeleted,
        handleFilterChange 
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
              // setSelectedId={(id) => navigate(`/inventory/${id}`)}
              fetchPartsData={refreshParts}
              isSettingsModalOpen={isSettingsModalOpen}
              setIsSettingsModalOpen={setIsSettingsModalOpen}
              showDeleted={showDeleted}
              setShowDeleted={setShowDeleted}
            />
          )}
        </div>
      ) : (
        // 🟦 PANEL VIEW (Mimicking ToDoView structure)
        <div className="flex flex-1 min-h-0 h-full">
          {/* LEFT LIST */}
          <div className="w-96 mr-2 ml-3 mb-2 border border-border flex flex-col min-h-0">
            
            {/* Header / Sort Bar (Like ToDoTabs) */}
            <div
              ref={headerRef}
              className="px-4 py-3 border-b bg-white z-40 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-1 text-sm text-gray-700">
                <span className="font-medium text-gray-500">Sort By:</span>
                <button
                  onClick={() => setIsDropdownOpen((p) => !p)}
                  className="flex items-center gap-1 text-blue-600 font-medium focus:outline-none hover:text-blue-700"
                >
                  {sortType} : {sortOrder === "asc" ? "Asc" : "Desc"}
                  {isDropdownOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Dropdown Modal */}
            {isDropdownOpen && (
              <div
                ref={modalRef}
                className="fixed z-[9999] text-sm rounded-lg border border-gray-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-100 p-1"
                style={{
                  top: dropdownPos.top,
                  left: dropdownPos.left,
                  transform: "translateX(-50%)",
                  width: "240px",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                 <div className="py-1">
                  {[
                    { label: "Creation Date", options: ["Oldest First", "Newest First"] },
                    { label: "Last Updated", options: ["Least Recent First", "Most Recent First"] },
                    { label: "Name", options: ["Ascending Order", "Descending Order"] },
                    { label: "Units in Stock", options: ["Lowest First", "Highest First"] },
                  ].map((section) => (
                    <div key={section.label}>
                       <button
                         onClick={() => setOpenSection(openSection === section.label ? null : section.label)}
                         className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-gray-100 rounded-md"
                       >
                          <span>{section.label}</span>
                          {openSection === section.label ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                       </button>
                       {openSection === section.label && (
                         <div className="pl-4 pr-2 bg-gray-50 py-1 space-y-1">
                            {section.options.map(opt => {
                              const isAsc = opt.includes("Asc") || opt.includes("Oldest") || opt.includes("Least") || opt.includes("Lowest");
                              const isSelected = sortType === section.label && sortOrder === (isAsc ? "asc" : "desc");

                              return (
                               <button 
                                  key={opt}
                                  onClick={() => {
                                      setSortType(section.label);
                                      setSortOrder(isAsc ? "asc" : "desc");
                                      setShouldSelectFirst(true);
                                      setIsDropdownOpen(false);
                                  }}
                                  className={`w-full flex items-center justify-between text-left text-xs px-2 py-1.5 rounded transition-colors ${
                                      isSelected
                                        ? "text-blue-600 bg-blue-50 font-medium"
                                        : "text-gray-600 hover:bg-gray-100"
                                    }`}
                               >
                                  <span>{opt}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
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
            <div className="flex-1 overflow-auto bg-white p-4 space-y-2">
              {loading && (
                <div className="flex items-center justify-center h-full">
                   <p className="text-sm text-gray-500">Loading parts...</p>
                </div>
              )}
              {!loading && parts.length === 0 && (
                <EmptyState variant="list" onCreate={() => navigate("/inventory/create")} />
              )}
              {!loading && currentItems.map((it) => (
                  <PartCard
                    key={it.id}
                    item={it}
                    selected={location.pathname.includes(it.id)}
                    onSelect={() => {
                      const targetPath = `/inventory/${it.id}`;

                      if (isEditingOrCreating) {
                        setPendingPath(targetPath);
                        setShowDiscardModal(true);
                        return;
                      }

                      navigate(targetPath);
                    }}
                  />
              ))}
            </div>

            {/* ✅ PAGINATION BUBBLE (Exactly like ListView) */}
            {totalItems > 0 && (
              <div className="flex items-center justify-end p-3 border-t border-gray-200 bg-white">
                <div className="inline-flex items-center gap-3 border border-yellow-400 rounded-full px-3 py-1 shadow-sm bg-white">
                  <span className="text-xs font-medium text-gray-700">
                    {startIndex + 1} – {endIndex} of {totalItems}
                  </span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={handlePrevPage} 
                      disabled={currentPage === 1}
                      className="text-gray-400 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <button 
                      onClick={handleNextPage} 
                      disabled={endIndex >= totalItems}
                      className="text-gray-400 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="flex-1 bg-card mr-3 ml-1 mb-2 border border-border min-h-0 flex flex-col">
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
                    refreshParts={refreshParts}
                  />
                }
              />
              <Route
                path=":id/edit"
                element={<EditPartRoute onSuccess={refreshParts} />}
              />
              <Route
                path=":id/restock"
                element={<RestockRoute parts={parts} />}
              />
            </Routes>
          </div>
        </div>
      )}
      {/* ✅ DISCARD CHANGES MODAL (GLOBAL) */}
      <DiscardChangesModal
        isOpen={showDiscardModal}
        onDiscard={handleConfirmDiscard}
        onKeepEditing={handleCancelDiscard}
      />
    </div>
  );
}

/* ✅ CREATE ROUTE (UPDATED TO HANDLE COPY) */
function CreatePartRoute({ onSuccess }: { onSuccess: () => void }) {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Added access to location state

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

  // ✅ Effect to pre-fill form if "copyData" is present in navigation state
  useEffect(() => {
    if (location.state?.copyData) {
      setNewItem({
        ...location.state.copyData,
        id: null, // Clear ID to ensure it's a new part creation
      });
    }
  }, [location.state]);

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
  refreshParts
}: {
  parts: any[];
  onPartDeleted: (id: string) => void;
  refreshParts: () => void;
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const part = parts.find((p) => String(p.id) === String(id));
  
  if (!part) return <EmptyState variant="panel" />;

  const delta = (part.unitsInStock || 0) - (part.minInStock || 0);
  const stockStatus = { ok: delta >= 0, delta };

  return (
    <PartDetails
      item={part}
      stockStatus={stockStatus}
      onClose={() => navigate("/inventory")}
      onEdit={() => navigate(`/inventory/${id}/edit`)}
      onDeleteSuccess={onPartDeleted}
      fetchPartData={refreshParts}
      restoreData=""
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

  return (
    <RestockModal
      isOpen={true}
      part={part}
      onClose={() => navigate(`/inventory/${id}`)}
      onConfirm={(data) => {
        navigate(`/inventory/${id}`, { state: { refresh: true } });
      }}
    />
  );
}