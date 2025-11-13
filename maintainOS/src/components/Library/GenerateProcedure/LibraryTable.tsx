import { Card, CardContent } from "../../ui/card";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import {
  Pencil,
  Copy,
  MoreVertical,
  ChevronUp,
  ClipboardList,
  ChevronDown,
  ChevronsUpDown,
  Trash2,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { MoreActionsMenu } from "../GenerateProcedure/components/MoreActionsMenu";
import { ConfirmationModal } from "../GenerateProcedure/components/ConfirmationModal";
import { useDispatch } from "react-redux";
import {
  duplicateProcedure,
  batchDeleteProcedures,
  restoreProcedure,
} from "../../../store/procedures/procedures.thunks";
import type { AppDispatch } from "../../../store"; 
import { Tooltip } from "../../ui/tooltip";

function formatTableDate(dateString: string) {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return "N/A";
  }
}

interface LibraryTableProps {
  procedures: any[];
  sortType: string;
  sortOrder: "asc" | "desc";
  onSortChange: (type: string, order: "asc" | "desc") => void;
  onRefresh: () => void;
  visibleColumns: string[];
  onViewProcedure: (procedure: any) => void; 
  showDeleted: boolean; 
  // --- 👇 [CHANGE] Naya prop add karein ---
  onEdit: (id: string) => void;
}

const RenderTableCell = ({
  proc,
  columnName,
}: {
  proc: any;
  columnName: string;
}) => {
  switch (columnName) {
    case "Last updated":
      return <>{formatTableDate(proc.updatedAt)}</>;
    case "Category":
      return <>{proc.categories?.[0] ?? "—"}</>;
    case "Created At":
      return <>{formatTableDate(proc.createdAt)}</>;
    default:
      return null;
  }
};

export function LibraryTable({
  procedures,
  sortType,
  sortOrder,
  onSortChange,
  onRefresh,
  visibleColumns,
  onViewProcedure, 
  showDeleted,
  // --- 👇 [CHANGE] Naya prop read karein ---
  onEdit,
}: LibraryTableProps) {
  const [modalProc, setModalProc] = useState<any | null>(null);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
  
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const dispatch = useDispatch<AppDispatch>();


  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  const allProcedureIds = useMemo(
    () => procedures.map((p) => p.id),
    [procedures]
  );

  const selectedCount = selectedProcedures.length;
  const isEditing = selectedCount > 0;
  const areAllSelected =
    allProcedureIds.length > 0 && selectedCount === allProcedureIds.length;
  const isIndeterminate = selectedCount > 0 && !areAllSelected;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate, isEditing]);

  const handleSelectAllToggle = () => {
    if (areAllSelected) {
      setSelectedProcedures([]);
    } else {
      setSelectedProcedures(allProcedureIds);
    }
  };

  const handleHeaderClick = (columnName: string) => {
    if (sortType === columnName) {
      onSortChange(columnName, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange(columnName, "asc");
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortType !== column)
      return <ChevronsUpDown size={14} className="text-gray-400" />;
    return sortOrder === "asc" ? (
      <ChevronUp size={14} className="text-blue-600" />
    ) : (
      <ChevronDown size={14} className="text-blue-600" />
    );
  };

  const toggleRowSelection = (id: string) => {
    setSelectedProcedures((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteClick = (proc: any) => setModalProc(proc);
  const handleConfirmDelete = async () => {
    if (!modalProc) return;
    try {
      await dispatch(batchDeleteProcedures([modalProc.id])).unwrap();
      onRefresh(); 
    } catch (error: any) {
      if (error?.statusCode !== 404) alert("Failed to delete procedure.");
    } finally {
      setModalProc(null);
      setSelectedProcedures([]); 
    }
  };

  const handleDuplicate = async (proc: any) => {
    if (!proc) return;
    try {
      await dispatch(duplicateProcedure(proc.id)).unwrap();
      onRefresh();
    } catch (error) {
      console.error("Failed to duplicate procedure:", error);
      alert("Failed to duplicate procedure.");
    }
  };
  
  const handleRestore = async (proc: any) => {
    if (!proc) return;
    try {
      await dispatch(restoreProcedure(proc.id)).unwrap();
      onRefresh(); 
    } catch (error) {
      console.error("Failed to restore procedure:", error);
      alert("Failed to restore procedure.");
    }
  };

  const handleConfirmBatchDelete = async () => {
    if (selectedProcedures.length === 0) return;
    try {
      await dispatch(batchDeleteProcedures(selectedProcedures)).unwrap();
      onRefresh();
    } catch (error: any) {
      alert("Failed to delete selected procedures.");
    } finally {
      setIsBatchDeleteModalOpen(false); 
      setSelectedProcedures([]); 
    }
  };

  const getColumnWidth = (columnName: string): string => {
    switch (columnName) {
      case "Last updated":
        return "20%";
      case "Category":
        return "15%";
      case "Created At":
        return "15%";
      default:
        return "auto";
    }
  };

  const totalColumns = visibleColumns.length + 2;

  return (
    <div className="flex-1 p-3 flex flex-col overflow-hidden">
      
      <Card className={`flex-1 flex flex-col overflow-hidden shadow-sm border ${
        showDeleted ? "border-yellow-300" : "border-gray-200"
      }`}>
        
        <CardContent className="p-0 flex-1 overflow-auto">
          <table className="w-full table-fixed text-sm">
            <thead className={`text-xs font-semibold uppercase tracking-wide text-gray-500 border-b sticky top-0 z-10 ${
              showDeleted ? "bg-yellow-100 border-yellow-300" : "bg-gray-50 border-gray-200"
            }`}>
              <tr>
                <th className="w-[35%] px-4 py-3 text-left">
                  {!isEditing ? (
                    <button
                      onClick={() => handleHeaderClick("Title")}
                      className="flex items-center gap-1 text-gray-600"
                    >
                      Title <SortIcon column="Title" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        ref={headerCheckboxRef}
                        checked={areAllSelected}
                        onChange={handleSelectAllToggle}
                        className="h-4 w-4 accent-blue-600 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        Edit {selectedCount}{" "}
                        {selectedCount === 1 ? "Procedure" : "Procedures"}
                      </span>
                      <Tooltip text="Delete">
                        <button
                          onClick={() => setIsBatchDeleteModalOpen(true)} 
                          className="ml-1 text-gray-600 hover:text-red-600 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </th>

                {/* Dynamic Columns */}
                {visibleColumns.map((colName) => (
                  <th
                    key={colName}
                    className="px-4 py-3 text-left"
                    style={{ width: getColumnWidth(colName) }}
                  >
                    <button
                      onClick={() => handleHeaderClick(colName)}
                      className="flex items-center gap-1 text-gray-600"
                    >
                      {colName} <SortIcon column={colName} />
                    </button>
                  </th>
                ))}

                {/* Actions Column */}
                <th className="w-[15%] px-4 py-3 text-right"></th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {procedures.map((proc) => {
                const isSelected = selectedProcedures.includes(proc.id);
                return (
                  <tr
                    key={proc.id}
                    className={`border-b transition hover:bg-gray-50 ${
                      showDeleted ? "border-yellow-200" : "border-gray-200"
                    } ${
                      isSelected ? "bg-blue-50/70" : (showDeleted ? "bg-yellow-50" : "bg-white")
                    }`}
                  >
                    {/* Title Cell */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center justify-center h-8 w-8 cursor-pointer transition-all duration-200"
                          onClick={() => toggleRowSelection(proc.id)}
                        >
                          {!isEditing ? (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-blue-50 text-blue-500">
                                <ClipboardList size={18} />
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              readOnly
                              className={`h-5 w-5 accent-blue-600 cursor-pointer ${
                                isSelected
                                  ? "transition-transform duration-150 scale-110"
                                  : ""
                              }`}
                            />
                          )}
                        </div>
                        <span
                          className="font-medium text-gray-800 select-none cursor-pointer hover:text-blue-600 hover:underline"
                          onClick={() => onViewProcedure(proc)} 
                        >
                          {proc.title || "Untitled Procedure"}
                        </span>
                      </div>
                    </td>

                    {/* Dynamic Cells */}
                    {visibleColumns.map((colName) => (
                      <td className="px-4 py-3 text-gray-600">
                        <RenderTableCell proc={proc} columnName={colName} />
                      </td>
                    ))}

                    {/* Actions Cell */}
                    <td className="px-4 py-3 text-gray-600">
                      <div className="flex items-center justify-end gap-4">
                        {/* --- 👇 [CHANGE] onClick handler add karein --- */}
                        <button 
                          onClick={() => onEdit(proc.id)} 
                          className="hover:text-blue-600"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDuplicate(proc)} 
                          className="hover:text-blue-600"
                        >
                          <Copy size={18} />
                        </button>
                        <MoreActionsMenu
                          onDelete={() => handleDeleteClick(proc)}
                          onDuplicate={() => handleDuplicate(proc)}
                          onRestore={showDeleted ? () => handleRestore(proc) : undefined}
                        >
                          <button className="hover:text-blue-600">
                            <MoreVertical size={18} />
                          </button>
                        </MoreActionsMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {procedures.length === 0 && (
                <tr>
                  <td
                    colSpan={totalColumns}
                    className="text-center text-gray-500 py-6 italic"
                  >
                    {showDeleted ? "No deleted procedures found." : "No procedures found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
        
        <div className={`flex-shrink-0 flex items-center justify-end p-3 border-t ${
          showDeleted ? "border-yellow-200 bg-yellow-50" : "border-gray-100 bg-white"
        }`}>
          <div className="inline-flex items-center gap-4 rounded-md border bg-white p-2 shadow-sm">
            <span className="text-sm text-gray-600">
              1 – {procedures.length} of {procedures.length}
            </span>
            <button className="text-gray-400 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
            <button className="text-gray-400 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
      </Card>

      {/* Delete Modal (NO CHANGE) */}
      <ConfirmationModal
        isOpen={!!modalProc}
        onClose={() => setModalProc(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Procedure"
        message={`Are you sure you want to delete "${modalProc?.title}"?`}
      />

      {/* Batch Delete Modal (NO CHANGE) */}
      <ConfirmationModal
        isOpen={isBatchDeleteModalOpen}
        onClose={() => setIsBatchDeleteModalOpen(false)}
        onConfirm={handleConfirmBatchDelete}
        title="Delete Procedures"
        message={`Are you sure you want to delete ${selectedCount} ${
          selectedCount === 1 ? "procedure" : "procedures"
        }?`}
      />
    </div>
  );
}