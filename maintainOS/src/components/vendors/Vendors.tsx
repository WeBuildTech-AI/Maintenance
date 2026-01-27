"use client";

import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { vendorService, updateVendor } from "../../store/vendors"; // ✅ Added updateVendor
import { FetchVendorsParams } from "../../store/vendors/vendors.types";

// Components
import { VendorHeaderComponent } from "./VendorHeader"; // Ensure this matches InventoryHeaderComponent signature or adapt it
import { VendorCard } from "./VendorCard";
import { VendorForm } from "./VendorsForm/VendorForm";
import VendorDetails from "./VendorDetails/VendorDetails";
import { VendorTable } from "./VendorTable";
import { EmptyState } from "../Inventory/EmptyState"; // Reuse EmptyState


// Helper: Sort Label for Vendors (UI Mapping)
const getSortLabel = (type: string, order: "asc" | "desc") => {
  if (type === "Creation Date") {
    return order === "asc" ? "Oldest First" : "Newest First";
  }

  if (type === "Last Updated") {
    return order === "asc" ? "Least Recent First" : "Most Recent First";
  }

  if (type === "Name") {
    return order === "asc" ? "Ascending Order" : "Descending Order";
  }

  return order === "asc" ? "Ascending Order" : "Descending Order";
};



export function Vendors() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"panel" | "table">("panel");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Sorting States
  const [sortType, setSortType] = useState("Creation Date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [shouldSelectFirst, setShouldSelectFirst] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Settings / Filter States
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [filterParams, setFilterParams] = useState<FetchVendorsParams>({
    page: 1,
    limit: 50,
  });

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Vendors
  const refreshVendors = useCallback(async () => {
    let res: any;
    try {
      setLoading(true);
      if (showDeleted) {
        res = await vendorService.fetchDeleteVendor();
      } else {
        const apiPayload = {
          ...filterParams,
          search: debouncedSearch || undefined,
        };
        res = await vendorService.fetchVendors(apiPayload);
      }
      setVendors(res || []);
    } catch (err: any) {
      console.error("Error fetching vendors:", err);
      setError("Failed to load vendors");
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [showDeleted, filterParams, debouncedSearch]);

  useEffect(() => {
    refreshVendors();
  }, [refreshVendors, viewMode]);

  // Handle Refresh from Navigation State
  useEffect(() => {
    if (location.state?.refresh) {
      refreshVendors();
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, location.pathname, navigate, refreshVendors]);

  // Dropdown Positioning
  useEffect(() => {
    if (headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      });
    }
  }, [isDropdownOpen]);

  // Close Dropdown on Outside Click
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

  // Filter Handler
  const handleFilterChange = useCallback(
    (newParams: Partial<FetchVendorsParams>) => {
      setFilterParams((prev) => ({ ...prev, ...newParams }));
    },
    []
  );

  // Sorting Logic
  const sortedVendors = useMemo(() => {
    const sorted = [...vendors].sort((a, b) => {
      let valA: any = a.name;
      let valB: any = b.name;

      if (sortType === "Creation Date") {
        valA = a.createdAt || "";
        valB = b.createdAt || "";
      } else if (sortType === "Last Updated") {
        valA = a.updatedAt || "";
        valB = b.updatedAt || "";
      }

      if (typeof valA === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });
    return sorted;
  }, [vendors, sortType, sortOrder]);

  // ✅ Auto-Selection Logic
  useEffect(() => {
    if (viewMode === 'panel' && sortedVendors.length > 0) {
      const isCreateOrEdit = location.pathname.includes('/create') || location.pathname.includes('/edit');
      const hasId = location.pathname !== '/vendors' && location.pathname !== '/vendors/';
      
      if (shouldSelectFirst) {
          navigate(`/vendors/${sortedVendors[0].id}`);
          setShouldSelectFirst(false);
      } else if (!hasId && !isCreateOrEdit) {
          // Initial load default selection
           navigate(`/vendors/${sortedVendors[0].id}`, { replace: true });
      }
    }
  }, [sortedVendors, shouldSelectFirst, viewMode, location.pathname, navigate]);

  // Pagination Logic
  const totalItems = sortedVendors.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = sortedVendors.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };
  const handleNextPage = () => {
    if (endIndex < totalItems) setCurrentPage((p) => p + 1);
  };

  useEffect(() => setCurrentPage(1), [sortType, sortOrder, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header Reuse */}
      {VendorHeaderComponent(
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        () => navigate("/vendors/create"), // Create Action
        setIsSettingModalOpen,
        setShowDeleted,
        setShowSettings,
        handleFilterChange
      )}

      {/* 🟩 TABLE VIEW */}
      {viewMode === "table" ? (
        <div className="flex-1 overflow-auto p-3 bg-muted/20">
          {/* Use your existing VendorTable here */}
          <VendorTable
            vendors={sortedVendors}
            isSettingModalOpen={isSettingModalOpen}
            setIsSettingModalOpen={setIsSettingModalOpen}
            fetchVendors={refreshVendors}
            showDeleted={showDeleted}
            setShowDeleted={setShowDeleted}
          />
        </div>
      ) : (
        // 🟦 PANEL VIEW (Matching Inventory Structure)
        <div className="flex flex-1 min-h-0 h-full">
          {/* LEFT LIST PANEL */}
          <div className="w-96 mr-2 ml-3 mb-2 border border-border flex flex-col min-h-0 bg-white rounded-lg shadow-sm">
            {/* Sort Header */}
            <div
              ref={headerRef}
              className="px-4 py-3 border-b bg-white z-40 flex items-center justify-between"
            >
              <div className="flex items-center gap-1 text-sm text-gray-700">
                <span className="font-medium text-gray-500">Sort By:</span>
                <button
                  onClick={() => setIsDropdownOpen((p) => !p)}
                  className="flex items-center gap-1 text-blue-600 font-medium focus:outline-none hover:text-blue-700"
                >
                  {sortType} : {getSortLabel(sortType, sortOrder)}

                  {isDropdownOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Sort Dropdown Modal */}
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
                  ].map((section) => (
                    <div key={section.label}>
                      <button
                        onClick={() =>
                          setOpenSection(
                            openSection === section.label ? null : section.label
                          )
                        }
                        className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-gray-100 rounded-md"
                      >
                        <span>{section.label}</span>
                        {openSection === section.label ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>
                      {openSection === section.label && (
                        <div className="pl-4 pr-2 bg-gray-50 py-1 space-y-1">
                          {section.options.map((opt) => {
                            const isAsc =
                              opt.includes("Asc") ||
                              opt.includes("Oldest") ||
                              opt.includes("Least");
                            const isSelected =
                              sortType === section.label &&
                              sortOrder === (isAsc ? "asc" : "desc");

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
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-blue-600" />
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

            {/* List Content */}
            <div className="flex-1 overflow-auto bg-white p-4 space-y-2">
              {loading && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-500">Loading vendors...</p>
                </div>
              )}
              {!loading && vendors.length === 0 && (
                <EmptyState
                  variant="list"
                  onCreate={() => navigate("/vendors/create")}
                />
              )}
              {!loading &&
                currentItems.map((vendor) => (
                  <VendorCard
                    key={vendor.id}
                    vendor={vendor}
                    selected={location.pathname.includes(vendor.id)}
                    onSelect={() => navigate(`/vendors/${vendor.id}`)}
                  />
                ))}
            </div>

            {/* Pagination Bubble */}
            {totalItems > 0 && (
              <div className="flex items-center justify-end p-3 border-t border-gray-200 bg-white rounded-b-lg">
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
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={endIndex >= totalItems}
                      className="text-gray-400 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT DETAIL PANEL */}
          <div className="flex-1 bg-card mr-3 ml-1 mb-2 border border-border min-h-0 flex flex-col rounded-lg shadow-sm overflow-hidden">
            <Routes>
              <Route path="/" element={<EmptyState variant="panel" />} />
              <Route
                path="create"
                element={<CreateVendorRoute onSuccess={refreshVendors} />}
              />
              <Route
                path=":id"
                element={
                  <VendorDetailRoute
                    vendors={vendors}
                    onVendorDeleted={(deletedId) =>
                      setVendors((prev) =>
                        prev.filter((v) => v.id !== deletedId)
                      )
                    }
                    refreshVendors={refreshVendors}
                    showDeleted={showDeleted}
                  />
                }
              />
              <Route
                path=":id/edit"
                element={<EditVendorRoute onSuccess={refreshVendors} />}
              />
            </Routes>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-ROUTES ---

function CreateVendorRoute({ onSuccess }: { onSuccess: () => void }) {
  const navigate = useNavigate();
  return (
    <VendorForm
      onCancel={() => navigate("/vendors")}
      onSuccess={() => {
        onSuccess();
        navigate("/vendors", { state: { refresh: true } });
      }}
    />
  );
}

function EditVendorRoute({ onSuccess }: { onSuccess: () => void }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>(); // ✅ Dispatch hook
  const [vendor, setVendor] = useState<any>(null);

  useEffect(() => {
    vendorService.fetchVendorById(id!).then(setVendor).catch(console.error);
  }, [id]);

  if (!vendor) return <EmptyState variant="panel" />;

  return (
    <VendorForm
      initialData={vendor}
      onCancel={() => navigate(`/vendors/${id}`)}
      onSubmit={(data: FormData) => {
        // ✅ CRITICAL FIX: Return the dispatch promise so saveVendor awaits it
        return dispatch(updateVendor({ id: id!, data })).unwrap();
      }}
      onSuccess={() => {
        // ✅ This calls refreshVendors() in parent immediately
        onSuccess();
        // Force navigation to ensure state refresh if needed
        navigate(`/vendors/${id}`, { state: { refresh: true } });
      }}
    />
  );
}

function VendorDetailRoute({
  vendors,
  onVendorDeleted,
  refreshVendors,
  showDeleted,
}: {
  vendors: any[];
  onVendorDeleted: (id: string) => void;
  refreshVendors: () => void;
  showDeleted: boolean;
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const vendor = vendors.find((v) => String(v.id) === String(id));

  if (!vendor) return <EmptyState variant="panel" />;

  return (
    <VendorDetails
      vendor={vendor}
      onEdit={(v) => navigate(`/vendors/${v.id}/edit`)}
      onDeleteSuccess={onVendorDeleted}
      restoreData={showDeleted ? "true" : ""}
      onClose={() => navigate("/vendors")}
      fetchVendors={refreshVendors}
    />
  );
}