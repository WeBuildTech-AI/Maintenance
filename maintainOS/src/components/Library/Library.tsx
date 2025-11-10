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

// --- 2. MOCK DATA REMOVED ---
// const mockProcedures = [ ... ];

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
  const [sortType, setSortType] = useState("Last Updated");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const sortButtonRef = useRef<HTMLDivElement>(null); // Ref ko DIV banaya

  // --- 3. API CALL (ACTIVE) ---
  useEffect(() => {
    console.log("Using Live API");
    const fetchData = async () => {
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

    fetchData();
  }, []); // Yeh sirf ek baar run hoga

  // --- SORTING LOGIC ---
  const sortedProcedures = useMemo(() => {
    return [...procedures].sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      switch (sortType) {
        case "Last Updated":
          valA = new Date(a.updatedAt || 0).getTime();
          valB = new Date(b.updatedAt || 0).getTime();
          break;
        // Baki sort types yahan add kar sakte hain
        default:
           valA = new Date(a.updatedAt || 0).getTime();
           valB = new Date(b.updatedAt || 0).getTime();
           break;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [procedures, sortType, sortOrder]);

  // --- 4. INITIAL SELECTION LOGIC (SORTING KE BAAD) ---
  // Jab sorted procedures taiyyar hon, tab pehla item select karein
  useEffect(() => {
    if (!selectedProcedure && sortedProcedures.length > 0) {
      setSelectedProcedure(sortedProcedures[0]);
    }
  }, [sortedProcedures, selectedProcedure]);


  // --- SORT MODAL HANDLER ---
  const handleSortChange = (type: string, order: "asc" | "desc") => {
    setSortType(type);
    setSortOrder(order);
    setIsSortModalOpen(false); // Modal band karein
  };
  
  // Helper function to get sort order text for button
  const getSortOrderText = () => {
    if (sortType === "Last Updated") return sortOrder === "asc" ? "Least Recent First" : "Most Recent First";
    // ... add other cases from SortModal
    return sortOrder === "asc" ? "Ascending" : "Descending";
  }

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
            <GenerateProcedure onBack={() => setShowForm(false)} />
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-lg">
            Loading procedures...
          </div>
        ) : procedures.length === 0 ? (
          // --- EMPTY STATE (Agar API se 0 items aaye) ---
          <div className="flex-1 flex items-center justify-center m-2 bg-white h-full">
            <div className="w-full h-full flex flex-col items-center justify-center text-center px-6 py-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="120"
                height="120"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-8"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="16"
                  rx="2"
                  ry="2"
                  strokeDasharray="4 4"
                  fill="#EFF6FF"
                ></rect>
                <path d="M9 10l2 2 4-4" stroke="#2563EB" strokeWidth="2"></path>
                <line
                  x1="8"
                  y1="16"
                  x2="16"
                  y2="16"
                  stroke="#93C5FD"
                  strokeWidth="2"
                ></line>
              </svg>
              <h2 className="text-3xl font-semibold mb-3 text-gray-900">
                Start adding Procedures to{" "}
                <span className="text-blue-600">webuildtech</span> on{" "}
                <span className="text-blue-600">MaintainX</span>
              </h2>
              <p className="text-gray-600 text-lg mt-1 max-w-2xl">
                Press{" "}
                <span className="text-blue-600 font-medium">
                  + New Procedure Template
                </span>{" "}
                button above to add your first Procedure and share it with your
                organization!
              </p>
            </div>
          </div>
        ) : (
          // --- YEH "ToDoView.tsx" KA LAYOUT HAI ---
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
              <LibraryDetails selectedProcedure={selectedProcedure} />
            </div>
          </div>
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