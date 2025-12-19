"use client";

import { Search, X, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { procedureService } from "../../../../store/procedures/procedures.service";
import toast from "react-hot-toast";

// ✅ 1. Production-Grade Safe Rendering Helper
// Prevents "Objects are not valid as a React child" crashes
const safeRender = (value: any): React.ReactNode => {
  // Handle Null/Undefined
  if (value === null || value === undefined) return null;

  // Handle Primitives (String, Number)
  if (typeof value === "string" || typeof value === "number") return value;

  // Handle Boolean
  if (typeof value === "boolean") return ""; // Don't render boolean text

  // Handle Arrays (e.g. ["Tag1", "Tag2"])
  if (Array.isArray(value)) {
    return value.map((item) => safeRender(item)).join(", ");
  }

  // Handle Objects (The specific fix for {id, name})
  if (typeof value === "object") {
    // Priority list of keys to attempt to render
    const candidate = 
      value.title || 
      value.name || 
      value.label || 
      value.fullName || 
      value.value || 
      value.id;
    
    if (candidate !== undefined && candidate !== null) {
      return safeRender(candidate); // Recursively safe-render the found value
    }
    return "—"; // Fallback for unknown objects
  }

  return String(value); // Last resort stringify
};

interface AddProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (procedure: any) => void;
}

export default function AddProcedureModal({
  isOpen,
  onClose,
  onSelect,
}: AddProcedureModalProps) {
  const [search, setSearch] = useState("");
  const [selectedProcedure, setSelectedProcedure] = useState<any | null>(null);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const loadProcedures = async () => {
        setLoading(true);
        try {
          const data = await procedureService.fetchProcedures();
          const list = Array.isArray(data) ? data : (data as any)?.data || [];
          setProcedures(list);
        } catch (error) {
          console.error("Failed to load procedures", error);
          toast.error("Failed to load procedures");
        } finally {
          setLoading(false);
        }
      };
      loadProcedures();
      setSelectedProcedure(null);
      setSearch("");
    }
  }, [isOpen]);

  const handleAdd = () => {
    if (selectedProcedure) {
      onSelect(selectedProcedure);
      onClose();
    }
  };

  const handleCardClick = (proc: any) => {
    if (selectedProcedure?.id === proc.id) {
      setSelectedProcedure(null); 
    } else {
      setSelectedProcedure(proc);
    }
  };

  // ✅ 2. Safe Filter Logic (Prevents .toLowerCase() crash on objects)
  const filteredProcedures = procedures.filter((p) => {
    const titleStr = typeof p.title === "string" ? p.title : (p.title?.name || p.title?.title || ""); 
    return (titleStr || "").toLowerCase().includes(search.toLowerCase());
  });

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center backdrop-blur-sm"
      onClick={onClose} 
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-200"
        style={{ width: "900px", height: "85vh" }}
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 bg-white shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Add Procedure</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full border border-gray-300 rounded-md pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-gray-700 bg-white"
              autoFocus
            />
          </div>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="text-sm">Loading library...</span>
            </div>
          ) : filteredProcedures.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
              <FileText size={40} className="opacity-20" />
              <p className="text-sm">No procedures found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProcedures.map((proc) => {
                const isSelected = selectedProcedure?.id === proc.id;
                return (
                  <div
                    key={proc.id}
                    onClick={() => handleCardClick(proc)}
                    className={`relative flex flex-col gap-2 p-4 rounded-lg border cursor-pointer transition-all duration-200 group ${
                      isSelected
                        ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-sm"
                        : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500"
                          }`}
                        >
                          <FileText size={20} />
                        </div>
                        <div>
                          <h3 className={`font-medium text-sm ${isSelected ? "text-blue-800" : "text-gray-900"}`}>
                            {/* ✅ 3. FIX: safeRender wraps title */}
                            {safeRender(proc.title) || "Untitled Procedure"}
                          </h3>
                          {proc.categories && proc.categories.length > 0 && (
                             <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 mt-1">
                               {/* ✅ 4. FIX: safeRender wraps category item */}
                               {safeRender(proc.categories[0])}
                             </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        {isSelected && <CheckCircle2 size={14} />}
                      </div>
                    </div>

                    {proc.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1 pl-[52px]">
                        {/* ✅ 5. FIX: safeRender wraps description */}
                        {safeRender(proc.description)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-gray-200 px-6 py-4 bg-white shrink-0">
          <span className="text-sm text-gray-500">
            {selectedProcedure ? "1 procedure selected" : "No procedure selected"}
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors shadow-sm"
            >
              Cancel
            </button>
            
            <button
              onClick={handleAdd}
              disabled={!selectedProcedure}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors shadow-sm border ${
                selectedProcedure
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white border-transparent cursor-pointer"
                  : "bg-white text-gray-400 border-gray-200 cursor-not-allowed"
              }`}
            >
              Add Procedure
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body 
  );
}