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
import { deleteProcedure } from "../../../store/procedures/procedures.thunks";
import type { AppDispatch } from "../../../store"; // ✅ FIX: 'import' ko 'import type' se badal diya
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
  onViewProcedure: (procedure: any) => void; // <-- (NEW) Yeh prop add karein
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
  onViewProcedure, // <-- (NEW) Prop receive karein
}: LibraryTableProps) {
  const [modalProc, setModalProc] = useState<any | null>(null);
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
      await dispatch(deleteProcedure(modalProc.id)).unwrap();
    } catch (error: any) {
      if (error?.statusCode !== 404) alert("Failed to delete procedure.");
    } finally {
      setModalProc(null);
      onRefresh();
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
    <div className="flex-1 overflow-auto p-3 flex flex-col">
      <Card className="overflow-hidden shadow-sm border border-gray-200">
        <CardContent className="p-0">
          <table className="w-full table-fixed text-sm">
            {/* Header */}
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b">
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
                          onClick={() => {
                            const first = procedures.find(
                              (p) => p.id === selectedProcedures[0]
                            );
                            if (first) handleDeleteClick(first);
                          }}
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
                    className={`border-b border-gray-200 transition hover:bg-gray-50 ${
                      isSelected ? "bg-blue-50/70" : "bg-white"
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

                        {/* --- (UPDATED) Title --- */}
                        {/* Ab yeh clickable hai aur modal kholega */}
                        <span
                          className="font-medium text-gray-800 select-none cursor-pointer hover:text-blue-600 hover:underline"
                          onClick={() => onViewProcedure(proc)} // <-- (NEW) Click handler
                        >
                          {proc.title || "Untitled Procedure"}
                        </span>
                      </div>
                    </td>

                    {/* Dynamic Cells */}
                    {visibleColumns.map((colName) => (
                      <td key={colName} className="px-4 py-3 text-gray-600">
                        <RenderTableCell proc={proc} columnName={colName} />
                      </td>
                    ))}

                    {/* Actions Cell */}
                    <td className="px-4 py-3 text-gray-600">
                      <div className="flex items-center justify-end gap-4">
                        <button className="hover:text-blue-600">
                          <Pencil size={18} />
                        </button>
                        <button className="hover:text-blue-600">
                          <Copy size={18} />
                        </button>
                        <MoreActionsMenu
                          onDelete={() => handleDeleteClick(proc)}
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
                    No procedures found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-end pt-4">
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

      {/* Delete Modal */}
      <ConfirmationModal
        isOpen={!!modalProc}
        onClose={() => setModalProc(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Procedure"
        message={`Are you sure you want to delete "${modalProc?.title}"?`}
      />
    </div>
  );
}
