import { useState, useEffect, useRef, useMemo } from "react";
// --- 1. API SERVICE (ACTIVE) ---
import { procedureService } from "../../store/procedures/procedures.service";
import { LibraryHeaderComponent } from "./LibraryHeader";
import type { ViewMode } from "../purchase-orders/po.types";
import GenerateProcedure from "./GenerateProcedure/GenerateProcedure";
import { ChevronDown } from "lucide-react";
import SettingsModal from "../utils/SettingsModal"; 

// --- NYE COMPONENTS IMPORT ---
import { LibraryCard } from "./LibraryCard";
import { LibraryDetails } from "./LibraryDetails";
import SortModal from "./SortModal"; 
import EmptyState from "./components/EmptyState";
import { LibraryTable } from "./GenerateProcedure/LibraryTable";
import { ProcedureDetailModal } from "./GenerateProcedure/components/ProcedureDetailModal"; 

// --- 庁 2. Priority sort helper ---
const priorityToValue = (priority: string | null | undefined): number => {
  if (!priority) return 4; 
  switch (priority.toLowerCase()) {
    case "high":
      return 1;
    case "medium":
      return 2;
    case "low":
      return 3;
    default:
      return 4;
  }
};

const allToggleableColumns = ["Last updated", "Category", "Created At"];

export function Library() {
  const [viewMode, setViewMode] = useState<ViewMode>("panel"); 
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showForm, setShowForm] = useState(false); 

  const [selectedProcedure, setSelectedProcedure] = useState<any>(null);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalProcedure, setModalProcedure] = useState<any>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  // --- 👇 [CHANGE] Nayi state add karein ---
  const [editingProcedureId, setEditingProcedureId] = useState<string | null>(null);

  // --- SORT MODAL KE LIYE STATE ---
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [sortType, setSortType] = useState("Title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const sortButtonRef = useRef<HTMLDivElement>(null); 

  const [visibleColumns, setVisibleColumns] =
    useState<string[]>(allToggleableColumns);

  // --- fetchData function (UPDATE) ---
  const fetchData = useMemo(() => {
    return async () => {
      try {
        setLoading(true);
        setError(null);
        
        let res;
        if (showDeleted) {
          console.log("倹 Fetching DELETED procedures...");
          res = await procedureService.fetchDeletedProcedures();
        } else {
          console.log("倹 Fetching ACTIVE procedures...");
          res = await procedureService.fetchProcedures();
        }
        
        console.log("倹 API response (procedures):", res);

        const data = Array.isArray(res)
          ? res
          : res?.data || res?.data?.data || [];

        setProcedures(data);
      } catch (err: any) {
        console.error("笶Error fetching procedures:", err);
        setError(err.message || "Failed to fetch procedures");
      } finally {
        setLoading(false);
      }
    };
  }, [showDeleted]);

  // --- 3. API CALL (ACTIVE) ---
  useEffect(() => {
    console.log("Using Live API");
    fetchData();
  }, [fetchData]);

  // --- 庁 4. SORTING LOGIC (No Change) ---
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
          return sortOrder === "asc"
            ? compareStrings(valA, valB)
            : compareStrings(valB, valA);

        case "Category":
          valA = a.categories?.[0] || ""; 
          valB = b.categories?.[0] || "";
          return sortOrder === "asc"
            ? compareStrings(valA, valB)
            : compareStrings(valB, valA);

        case "Created At":
          valA = new Date(a.createdAt || 0).getTime();
          valB = new Date(b.createdAt || 0).getTime();
          break;

        case "Last updated": 
        case "Last Updated": 
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
          return sortOrder === "asc"
            ? compareStrings(valA, valB)
            : compareStrings(valB, valA);
      }

      return sortOrder === "asc" ? valA - valB : valB - valA;
    });
  }, [procedures, sortType, sortOrder]);

  // --- INITIAL SELECTION LOGIC (No Change) ---
  useEffect(() => {
    if (viewMode === 'panel' && !selectedProcedure && sortedProcedures.length > 0) {
      setSelectedProcedure(sortedProcedures[0]);
    }
    else if (
      viewMode === 'panel' &&
      selectedProcedure &&
      !sortedProcedures.find((p) => p.id === selectedProcedure.id)
    ) {
      setSelectedProcedure(sortedProcedures[0] || null);
    }
  }, [sortedProcedures, selectedProcedure, viewMode]);

  // --- SORT HANDLER (No Change) ---
  const handleSortChange = (type: string, order: "asc" | "desc") => {
    setSortType(type);
    setSortOrder(order);
    setIsSortModalOpen(false); 
  };

  const getSortOrderText = () => {
    if (sortType === "Last Updated")
      return sortOrder === "asc" ? "Least Recent First" : "Most Recent First";
    if (sortType === "Title") return sortOrder === "asc" ? "A-Z" : "Z-A";
    return sortType;
  };

  const handleModalRefresh = () => {
    fetchData();
    setModalProcedure(null);
  }

  // --- 👇 [CHANGE] Naya handler add karein ---
  const handleEditProcedure = (id: string) => {
    setEditingProcedureId(id);
    setShowForm(true);
    setViewMode("panel"); // Edit hamesha panel view mein open ho
  };

  // --- 👇 [CHANGE] Naya handler add karein ---
  const handleBackFromBuilder = () => {
    setShowForm(false);
    setEditingProcedureId(null); // Edit ID ko reset karein
    fetchData(); // List ko refresh karein
  }

  return (
    <div className="flex flex-col bg-white w-full h-screen overflow-hidden">
      {/* Header (Fixed) */}
      {!showForm && (
        <LibraryHeaderComponent
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          // --- 👇 [CHANGE] "New Procedure" click par ID ko null set karein ---
          setIsCreatingForm={() => {
            setEditingProcedureId(null); 
            setShowForm(true);
            setViewMode("panel");
          }}
          setShowSettings={setShowSettings}
        />
      )}

      {/* --- Main Content --- */}
      <div className="flex-1 flex flex-col overflow-hidden border-t border-gray-200">
        {showForm ? (
          // --- FORM VIEW (SCROLLS) ---
          <div className="flex-1 bg-white p-6 overflow-y-auto h-full">
            <GenerateProcedure
              // --- 👇 [CHANGE] Naye props pass karein ---
              onBack={handleBackFromBuilder}
              editingProcedureId={editingProcedureId}
            />
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-lg">
            Loading procedures...
          </div>
        ) : procedures.length === 0 ? (
          // --- EMPTY STATE (No Change) ---
          <div className="flex-1 flex items-center justify-center m-2 bg-white h-full">
            <EmptyState />
          </div>
        ) : (
          // --- ViewMode Logic ---
          <>
            {viewMode === "panel" ? (
              // --- PANEL VIEW (No Change) ---
              <div className="flex h-full">
                {/* Left Panel */}
                <div className="w-96 mr-2 ml-3 mb-2 border border-border flex flex-col min-h-0">
                  {/* Tabs + Sort */}
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

                  {/* Card List (Scrollable) */}
                  <div className="flex-1 overflow-auto relative z-0 bg-white p-4 space-y-2">
                    {sortedProcedures.map((proc) => (
                      <LibraryCard
                        key={proc.id}
                        procedure={proc}
                        isSelected={selectedProcedure?.id === proc.id}
                        onSelectProcedure={setSelectedProcedure}
                      />
                    ))}
                  </div>
                </div>

                {/* Right Panel (Flexible + Scroll) */}
                <div className="flex-1 bg-card mr-3 ml-2 mb-2 border border-border min-h-0 flex flex-col">
                  <LibraryDetails
                    selectedProcedure={selectedProcedure}
                    onRefresh={fetchData}
                    // --- 👇 [CHANGE] Naya handler pass karein ---
                    onEdit={handleEditProcedure}
                  />
                </div>
              </div>
            ) : (
              // --- TABLE VIEW (No Change) ---
              <LibraryTable
                procedures={sortedProcedures}
                sortType={sortType}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                onRefresh={fetchData} 
                visibleColumns={visibleColumns}
                onViewProcedure={(proc) => setModalProcedure(proc)}
                showDeleted={showDeleted}
              />
            )}
          </>
        )}
      </div>

      {/* --- SORT MODAL (No Change) --- */}
      <SortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        onSortChange={handleSortChange}
        currentSort={sortType}
        currentOrder={sortOrder}
        anchorRef={sortButtonRef}
      />

      {/* --- SETTINGS MODAL (No Change) --- */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        allToggleableColumns={allToggleableColumns}
        currentVisibleColumns={visibleColumns}
        currentShowDeleted={showDeleted}
        onApply={(settings) => {
          console.log("Settings applied:", settings);
          setVisibleColumns(settings.visibleColumns);
          setShowDeleted(settings.showDeleted);
          setShowSettings(false);
        }}
      />

      {/* --- PROCEDURE DETAIL MODAL (No Change) --- */}
      <ProcedureDetailModal
        isOpen={!!modalProcedure}
        onClose={() => setModalProcedure(null)}
        title={modalProcedure?.title || "Procedure Details"}
      >
        <LibraryDetails
          selectedProcedure={modalProcedure}
          onRefresh={handleModalRefresh}
          // --- 👇 [CHANGE] Naya handler pass karein ---
          onEdit={handleEditProcedure}
        />
      </ProcedureDetailModal>
    </div>
  );
}