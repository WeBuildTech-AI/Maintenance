import { useState, useEffect, useRef, useMemo, useCallback } from "react"; 
import { useNavigate, useMatch, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux"; 

// --- API & Store ---
import { procedureService } from "../../store/procedures/procedures.service";
import { LibraryHeaderComponent } from "./LibraryHeader";
import type { ViewMode } from "../purchase-orders/po.types"; 
import GenerateProcedure from "./GenerateProcedure/GenerateProcedure";
import { ChevronDown } from "lucide-react";
import SettingsModal from "../utils/SettingsModal"; 
import type { AppDispatch } from "../../store";
import { FetchProceduresParams } from "../../store/procedures/procedures.types";

// --- Components ---
import { LibraryCard } from "./LibraryCard";
import { LibraryDetails } from "./LibraryDetails";
import SortModal from "./SortModal"; 
import EmptyState from "./components/EmptyState";
import { LibraryTable } from "./GenerateProcedure/LibraryTable";
import { ProcedureDetailModal } from "./GenerateProcedure/components/ProcedureDetailModal"; 

// --- Priority Helper ---
const priorityToValue = (priority: string | null | undefined): number => {
  if (!priority) return 4; 
  switch (priority.toLowerCase()) {
    case "high": return 1;
    case "medium": return 2;
    case "low": return 3;
    default: return 4;
  }
};

const allToggleableColumns = ["Last updated", "Category", "Created At"];

export function Library() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const dispatch = useDispatch<AppDispatch>();

  // --- Router State ---
  const isCreateRoute = useMatch("/library/create");
  const editMatch = useMatch("/library/:id/edit");
  const viewMatch = useMatch("/library/:id");

  const isEditMode = !!editMatch;
  const isFormOpen = !!(isCreateRoute || editMatch); 

  const routeId = editMatch?.params?.id || viewMatch?.params?.id;

  // --- Local State ---
  const [viewMode, setViewMode] = useState<ViewMode>("panel"); 
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); 

  const [showSettings, setShowSettings] = useState(false);

  const [selectedProcedure, setSelectedProcedure] = useState<any>(null);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ 1. Filter Params State
  const [filterParams, setFilterParams] = useState<FetchProceduresParams>({
    page: 1, 
    limit: 50 
  });

  const [modalProcedure, setModalProcedure] = useState<any>(null); 
  const [showDeleted, setShowDeleted] = useState(false);

  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [sortType, setSortType] = useState("Title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const sortButtonRef = useRef<HTMLDivElement>(null); 

  const [visibleColumns, setVisibleColumns] = useState<string[]>(allToggleableColumns);

  // ✅ Debounce Search Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- FETCH LIST (Memoized & Updated with Filters) ---
  const fetchData = useCallback(async () => {
      if (procedures.length === 0) {
        setLoading(true);
      }
      
      try {
        setError(null);
        let data = [];

        if (showDeleted) {
          const res = await procedureService.fetchDeletedProcedures();
          data = Array.isArray(res) ? res : res?.data || [];
        } else {
          // ✅ FIX: Use 'search' instead of 'title' as per API requirements
          const apiPayload = {
            ...filterParams,
            search: debouncedSearch || undefined 
          };

          console.log("🔥 Library API Call:", apiPayload);
          
          const res = await procedureService.fetchProcedures(apiPayload);
          data = Array.isArray(res) ? res : (res as any)?.data?.items || [];
        }
        
        setProcedures(data);

      } catch (err: any) {
        console.error("Error fetching procedures:", err);
        setError(err.message || "Failed to fetch procedures");
      } finally {
        setLoading(false);
      }
  }, [showDeleted, filterParams, debouncedSearch]); 

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ Handle Filter Change Callback
  const handleFilterChange = useCallback((newParams: Partial<FetchProceduresParams>) => {
    setFilterParams((prevParams) => {
      const merged = { ...prevParams, ...newParams };
      if (JSON.stringify(prevParams) === JSON.stringify(merged)) {
        return prevParams; 
      }
      return merged; 
    });
  }, []);

  // --- SYNC SELECTION ---
  useEffect(() => {
    if (procedures.length === 0) return;

    if (routeId) {
      const found = procedures.find((p) => p.id === routeId);
      if (found) {
        setSelectedProcedure(found);
        if(viewMode === "table" && !isFormOpen) {
            setModalProcedure(found);
        }
      }
    } else {
      if (viewMode === "panel") {
        if (!selectedProcedure && sortedProcedures.length > 0) {
           setSelectedProcedure(sortedProcedures[0]);
        }
      } else {
        setSelectedProcedure(null);
        setModalProcedure(null);
      }
    }
  }, [routeId, procedures, viewMode, isFormOpen]); 

  // --- SORTING ---
  const sortedProcedures = useMemo(() => {
    const compareStrings = (a: string, b: string) => {
      return (a || "").localeCompare(b || "", undefined, { numeric: true });
    };

    return [...procedures].sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sortType) {
        case "Title":
          valA = a.title || "";
          valB = b.title || "";
          return sortOrder === "asc" ? compareStrings(valA, valB) : compareStrings(valB, valA);
        case "Category":
          valA = a.categories?.[0] || ""; 
          valB = b.categories?.[0] || "";
          return sortOrder === "asc" ? compareStrings(valA, valB) : compareStrings(valB, valA);
        case "Created At":
          valA = new Date(a.createdAt || 0).getTime();
          valB = new Date(b.createdAt || 0).getTime();
          break;
        case "Last updated": 
          valA = new Date(a.updatedAt || 0).getTime();
          valB = new Date(b.updatedAt || 0).getTime();
          break;
        case "Priority":
          valA = priorityToValue(a.priority); 
          valB = priorityToValue(b.priority);
          break;
        default:
          valA = a.title || "";
          valB = b.title || "";
          return sortOrder === "asc" ? compareStrings(valA, valB) : compareStrings(valB, valA);
      }
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });
  }, [procedures, sortType, sortOrder]);

  // --- HANDLERS ---

  const handleCreateClick = () => navigate("/library/create");
  const handleEditProcedure = (id: string) => navigate(`/library/${id}/edit`);
  const handleSelectProcedure = (proc: any) => {
    if (routeId !== proc.id) navigate(`/library/${proc.id}`);
  };

  const handleBackFromBuilder = useCallback(() => {
    if (location.state?.returnPath) {
        navigate(location.state.returnPath, {
            state: { previousFormState: location.state.previousFormState } 
        });
    } else {
        if (routeId) {
            navigate(`/library/${routeId}`);
        } else {
            navigate("/library");
        }
        fetchData(); 
    }
  }, [location.state, routeId, fetchData, navigate]);

  const handleModalClose = () => {
    setModalProcedure(null);
    navigate("/library");
  };

  const handleSortChange = (type: string, order: "asc" | "desc") => {
    setSortType(type);
    setSortOrder(order);
    setIsSortModalOpen(false); 
  };

  const getSortOrderText = () => {
    if (sortType === "Last Updated") return sortOrder === "asc" ? "Least Recent First" : "Most Recent First";
    if (sortType === "Title") return sortOrder === "asc" ? "A-Z" : "Z-A";
    return sortType;
  };

  return (
    <div className="flex flex-col bg-white w-full h-screen overflow-hidden">
      
      {/* IF: Form is Open (Create or Edit Route) */}
      {isFormOpen ? (
        <div className="flex-1 bg-white p-6 overflow-y-auto h-full">
          <GenerateProcedure
            onBack={handleBackFromBuilder}
            editingProcedureId={isEditMode ? routeId : null}
          />
        </div>
      ) : (
        // ELSE: Show Main Library View
        <>
          <LibraryHeaderComponent
            viewMode={viewMode}
            setViewMode={setViewMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setIsCreatingForm={handleCreateClick}
            setShowSettings={setShowSettings}
            // ✅ Pass Filter Handler
            onFilterChange={handleFilterChange}
          />

          <div className="flex-1 flex flex-col overflow-hidden border-t border-gray-200">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-500 text-lg">
                Loading procedures...
              </div>
            ) : procedures.length === 0 ? (
              <div className="flex-1 flex items-center justify-center m-2 bg-white h-full">
                <EmptyState />
              </div>
            ) : (
              <>
                {viewMode === "panel" ? (
                  <div className="flex h-full">
                    <div className="w-96 mr-2 ml-3 mb-2 border border-border flex flex-col min-h-0">
                      <div className="p-4 border-b">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold">My Templates</h3>
                          <span className="text-sm text-gray-500">
                            {procedures.length} templates
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <span>Sort By:</span>
                            <div ref={sortButtonRef} className="flex items-center">
                              <button
                                onClick={() => setIsSortModalOpen(true)}
                                className="text-blue-600 text-sm cursor-pointer inline-flex items-center gap-1"
                              >
                                {sortType}: {getSortOrderText()}
                                <ChevronDown size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 overflow-auto relative z-0 bg-white p-4 space-y-2">
                        {sortedProcedures.map((proc) => (
                          <LibraryCard
                            key={proc.id}
                            procedure={proc}
                            isSelected={selectedProcedure?.id === proc.id}
                            onSelectProcedure={handleSelectProcedure}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 bg-card mr-3 ml-2 mb-2 border border-border min-h-0 flex flex-col">
                      <LibraryDetails
                        selectedProcedure={selectedProcedure}
                        onRefresh={fetchData}
                        onEdit={handleEditProcedure}
                      />
                    </div>
                  </div>
                ) : (
                  <LibraryTable
                    procedures={sortedProcedures}
                    sortType={sortType}
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                    onRefresh={fetchData} 
                    visibleColumns={visibleColumns}
                    onViewProcedure={(proc) => {
                        handleSelectProcedure(proc);
                        setModalProcedure(proc);
                    }}
                    showDeleted={showDeleted}
                    onEdit={handleEditProcedure}
                  />
                )}
              </>
            )}
          </div>
        </>
      )}

      <SortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        onSortChange={handleSortChange}
        currentSort={sortType}
        currentOrder={sortOrder}
        anchorRef={sortButtonRef}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        allToggleableColumns={allToggleableColumns}
        currentVisibleColumns={visibleColumns}
        currentShowDeleted={showDeleted}
        onApply={(settings) => {
          setVisibleColumns(settings.visibleColumns);
          setShowDeleted(settings.showDeleted);
          setShowSettings(false);
        }}
        componentName="Procedure"
      />

      <ProcedureDetailModal
        isOpen={!!modalProcedure}
        onClose={handleModalClose}
        title={modalProcedure?.title || "Procedure Details"}
      >
        <LibraryDetails
          selectedProcedure={modalProcedure}
          onRefresh={() => { fetchData(); setModalProcedure(null); }}
          onEdit={handleEditProcedure}
        />
      </ProcedureDetailModal>
    </div>
  );
}