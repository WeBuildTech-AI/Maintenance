import { useState, useEffect } from "react";
import { Search, Info, FileText, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { procedureService } from "../../../store/procedures/procedures.service";

export default function ProcedurePanel({ setPanel }: { setPanel: (p: any) => void }) {
  const [search, setSearch] = useState("");
  const [selectedProcedure, setSelectedProcedure] = useState<any | null>(null);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProcedures();
  }, []);

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

  const filteredProcedures = procedures.filter((p) => {
    const titleStr = typeof p.title === "string" ? p.title : (p.title?.name || p.title?.title || ""); 
    return (titleStr || "").toLowerCase().includes(search.toLowerCase());
  });

  const handleCardClick = (proc: any) => {
    if (selectedProcedure?.id === proc.id) {
      setSelectedProcedure(null); 
    } else {
      setSelectedProcedure(proc);
    }
  };

  const handleAdd = () => {
    if (selectedProcedure) {
      // NOTE: Currently NewWorkOrderModal doesn't accept a callback prop. 
      // This needs to be hooked up to form state or global state.
      // For now, we simulate success and return to form.
      console.log("Selected Procedure:", selectedProcedure);
      toast.success(`Selected: ${selectedProcedure.title}`);
      setPanel("form");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-6 pt-6 pb-4 flex-shrink-0 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search procedures..."
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            autoFocus
          />
        </div>

        {/* Info Banner */}
        <div className="mt-4 flex items-start gap-3 rounded-md border border-blue-200 bg-blue-50 p-3">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            Select a standard operating procedure or checklist.
          </div>
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
            <button onClick={loadProcedures} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
               <RefreshCw size={12} /> Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredProcedures.map((proc) => {
              const isSelected = selectedProcedure?.id === proc.id;
              return (
                <div
                  key={proc.id}
                  onClick={() => handleCardClick(proc)}
                  className={`relative flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all duration-200 group ${
                    isSelected
                      ? "bg-white border-blue-500 ring-1 ring-blue-500 shadow-md"
                      : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? "bg-blue-50 text-blue-600"
                          : "bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500"
                      }`}
                    >
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                       <h3 className={`font-medium text-sm truncate ${isSelected ? "text-blue-800" : "text-gray-900"}`}>
                         {typeof proc.title === 'string' ? proc.title : "Untitled Procedure"}
                       </h3>
                       {proc.description && <p className="text-xs text-gray-500 truncate">{typeof proc.description === 'string' ? proc.description : ""}</p>}
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ml-3 ${
                      isSelected
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {isSelected && <CheckCircle2 size={14} />}
                  </div>
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
               onClick={() => setPanel("form")}
               className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
            >
               Cancel
            </button>
            <button
               onClick={handleAdd}
               disabled={!selectedProcedure}
               className={`px-6 py-2 text-sm font-medium rounded-md transition-colors shadow-sm ${
                 selectedProcedure
                   ? "bg-orange-600 hover:bg-orange-700 text-white"
                   : "bg-gray-100 text-gray-400 cursor-not-allowed"
               }`}
            >
               Add Procedure
            </button>
          </div>
      </div>
    </div>
  );
}
