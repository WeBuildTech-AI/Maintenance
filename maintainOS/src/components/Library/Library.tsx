import { useState, useEffect, useRef, useMemo } from "react";
// --- 1. API SERVICE (ACTIVE) ---
import { procedureService } from "../../store/procedures/procedures.service";
import { LibraryHeaderComponent } from "./LibraryHeader";
import type { ViewMode } from "../purchase-orders/po.types";
import GenerateProcedure from "./GenerateProcedure/GenerateProcedure";
import { ChevronDown } from "lucide-react";

// --- NYE COMPONENTS IMPORT ---
import { LibraryCard } from "./LibraryCard";
import { LibraryDetails } from "./LibraryDetails";
import SortModal from "./SortModal"; // <-- SortModal import kiya
// --- 1. IMPORT EmptyState (using correct path) ---
import EmptyState from "./components/EmptyState";
// --- 💡 1. LibraryTable component import karein ---
import { LibraryTable } from "./GenerateProcedure/LibraryTable";

// --- 💡 2. Priority sort helper ---
const priorityToValue = (priority: string | null | undefined): number => {
  if (!priority) return 4; // "—" ya null/undefined
  switch (priority.toLowerCase()) {
    case "high":
      return 1;
    case "medium":
      return 2;
    case "low":
      return 3;
    default:
      return 4; // Baki sab
  }
};

export function Library() {
  const [viewMode, setViewMode] = useState<ViewMode>("panel"); // 'panel' matlab ToDo jaisa view
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showForm, setShowForm] = useState(false); // Yeh "New Procedure" form control karega

  const [selectedProcedure, setSelectedProcedure] = useState<any>(null);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- SORT MODAL KE LIYE STATE ---
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  // --- 💡 3. Default sort ko 'Title' kiya ---
  const [sortType, setSortType] = useState("Title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const sortButtonRef = useRef<HTMLDivElement>(null); // Ref ko DIV banaya

  // --- Router hooks HATA DIYE GAYE ---

  // --- 2. WRAPPED fetchData in a memoized function ---
  const fetchData = useMemo(() => {
    return async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await procedureService.fetchProcedures();
        console.log("🌐 API response (procedures):", res);

        // Handle both array and nested object format
        const data = Array.isArray(res)
          ? res
          : res?.data || res?.data?.data || [];

        setProcedures(data);
        // Selected procedure ab neeche sorting ke baad set hoga
      } catch (err: any) {
        console.error("❌ Error fetching procedures:", err);
        setError(err.message || "Failed to fetch procedures");
      } finally {
        setLoading(false);
      }
    };
  }, []); // Empty dependency array, function is created once

  // --- 3. API CALL (ACTIVE) ---
  useEffect(() => {
    console.log("Using Live API");
    fetchData();
  }, [fetchData]); // Yeh sirf ek baar run hoga

  // --- 💡 4. SORTING LOGIC (Updated for Priority) ---
  const sortedProcedures = useMemo(() => {
    // localeCompare string sorting ke liye behtar hai
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
          valA = a.categories?.[0] || ""; // API response ke hisaab se
          valB = b.categories?.[0] || "";
          return sortOrder === "asc"
            ? compareStrings(valA, valB)
            : compareStrings(valB, valA);

        case "Created At":
          valA = new Date(a.createdAt || 0).getTime();
          valB = new Date(b.createdAt || 0).getTime();
          break;

        case "Last updated": // Table header se
        case "Last Updated": // SortModal se
          valA = new Date(a.updatedAt || 0).getTime();
          valB = new Date(b.updatedAt || 0).getTime();
          break;

        case "Priority":
          valA = priorityToValue(a.priority); // API mein priority nahi hai, par logic rakhi hai
          valB = priorityToValue(b.priority);
          break;

        default:
          // Default sorting (Title)
          valA = a.title || "";
          valB = b.title || "";
          return sortOrder === "asc"
            ? compareStrings(valA, valB)
            : compareStrings(valB, valA);
      }

      // Number (Date & Priority) comparison
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });
  }, [procedures, sortType, sortOrder]);

  // --- INITIAL SELECTION LOGIC (Reverted) ---
  useEffect(() => {
    if (!selectedProcedure && sortedProcedures.length > 0) {
      setSelectedProcedure(sortedProcedures[0]);
    }
    // FIX: Handle case where selected item is deleted
    else if (
      selectedProcedure &&
      !sortedProcedures.find((p) => p.id === selectedProcedure.id)
    ) {
      setSelectedProcedure(sortedProcedures[0] || null);
    }
  }, [sortedProcedures, selectedProcedure]);

  // --- SORT HANDLER ---
  const handleSortChange = (type: string, order: "asc" | "desc") => {
    setSortType(type);
    setSortOrder(order);
    setIsSortModalOpen(false); // Modal band karein
  };

  // Helper function to get sort order text for button
  const getSortOrderText = () => {
    // Yeh ab sirf Panel View ke sort button ke liye hai
    if (sortType === "Last Updated")
      return sortOrder === "asc" ? "Least Recent First" : "Most Recent First";
    if (sortType === "Title")
      return sortOrder === "asc" ? "A-Z" : "Z-A";
    
    // Fallback
    return sortType;
  };

  // --- LAYOUT KO "h-screen" AUR "overflow-hidden" BANAYEIN ---
  return (
    <div className="flex flex-col bg-white w-full h-screen overflow-hidden">
      {/* Header (Fixed) */}
      {!showForm && (
        <LibraryHeaderComponent
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setIsCreatingForm={setShowForm}
          setShowSettings={setShowSettings}
        />
      )}

      {/* --- Content area "flex-1 overflow-hidden" HOGI --- */}
      <div className="flex-1 overflow-hidden border-t border-gray-200">
        {showForm ? (
          // --- FORM VIEW (SCROLLS) ---
          <div className="flex-1 bg-white p-6 overflow-y-auto h-full">
            <GenerateProcedure
              onBack={() => {
                setShowForm(false);
                fetchData(); // Refresh list after creating
              }}
            />
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-lg">
            Loading procedures...
          </div>
        ) : procedures.length === 0 ? (
          // --- 5. REPLACED inline UI with EmptyState component ---
          <div className="flex-1 flex items-center justify-center m-2 bg-white h-full">
            <EmptyState />
          </div>
        ) : (
          // --- ViewMode ke hisaab se logic ---
          <>
            {viewMode === "panel" ? (
              // --- PANEL VIEW (Aapka purana code) ---
              <div className="flex h-full">
                {/* Left Panel (Fixed Width + Scroll) */}
                <div className="w-96 mr-2 ml-3 mb-2 border border-border flex flex-col min-h-0">
                  {/* Tabs + Sort (Work Order jaisa) */}
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
                  {/* --- FIX: Pass onRefresh prop --- */}
                  <LibraryDetails
                    selectedProcedure={selectedProcedure}
                    onRefresh={fetchData}
                  />
                </div>
              </div>
            ) : (
              // --- 💡 5. TABLE VIEW (Updated props) ---
              <LibraryTable
                procedures={sortedProcedures}
                sortType={sortType}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                onRefresh={fetchData} // <-- Yeh naya prop add kiya
              />
            )}
          </>
        )}
      </div>

      {/* --- SORT MODAL RENDER KIYA --- */}
      <SortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        onSortChange={handleSortChange}
        currentSort={sortType}
        currentOrder={sortOrder}
        anchorRef={sortButtonRef}
      />
    </div>
  );
}