"use client";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { Card, CardContent } from "../../ui/card";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import {
  Pencil,
  Copy,
  MoreVertical,
  ClipboardList,
  Trash2,
  Loader2,
} from "lucide-react";

// Ant Design
import { Table, Tooltip as AntTooltip } from "antd";
import type { TableProps } from "antd";

import { useDispatch } from "react-redux";
import {
  duplicateProcedure,
  batchDeleteProcedures,
  restoreProcedure,
} from "../../../store/procedures/procedures.thunks";
import type { AppDispatch } from "../../../store";
import { Tooltip } from "../../ui/tooltip";
import { MoreActionsMenu } from "../GenerateProcedure/components/MoreActionsMenu";
import { ConfirmationModal } from "../GenerateProcedure/components/ConfirmationModal";

// Format Dates
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

const mapAntSortOrder = (order: string) =>
  order === "asc" ? "ascend" : "descend";

// --- Styles ---
const tableStyles = `
  .selected-row-class > td {
    background-color: #eff6ff !important;
  }
  .selected-row-class:hover > td {
    background-color: #f9fafb !important;
  }
  .ant-table-cell-fix-left, 
  .ant-table-cell-fix-right {
    background-color: #fff !important; 
    z-index: 3 !important;
  }
  .ant-table-row:hover > td {
    background-color: #f9fafb !important;
  }
  /* ✅ CUSTOM SCROLLBAR STYLING FOR ANT TABLE */
  .ant-table-body::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .ant-table-body::-webkit-scrollbar-track {
    background: transparent;
  }
  .ant-table-body::-webkit-scrollbar-thumb {
    background: #d1d5db; /* gray-300 */
    border-radius: 9999px;
  }
  .ant-table-body::-webkit-scrollbar-thumb:hover {
    background: #9ca3af; /* gray-400 */
  }
`;

interface LibraryTableProps {
  procedures: any[];
  sortType: string;
  sortOrder: "asc" | "desc";
  onSortChange: (type: string, order: "asc" | "desc") => void;
  onRefresh: () => void;
  visibleColumns: string[];
  onViewProcedure: (procedure: any) => void;
  showDeleted: boolean;
  onEdit: (id: string) => void;
}

export function LibraryTable({
  procedures,
  sortType,
  sortOrder,
  onSortChange,
  onRefresh,
  visibleColumns,
  onViewProcedure,
  showDeleted,
  onEdit,
}: LibraryTableProps) {
  const dispatch = useDispatch<AppDispatch>();

  // Selection State
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);

  // Modals
  const [modalProc, setModalProc] = useState<any | null>(null);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  // Derived Selection Logic
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

  const toggleRowSelection = (id: string) => {
    setSelectedProcedures((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // --- Handlers ---

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
      setSelectedProcedures((prev) =>
        prev.filter((id) => id !== modalProc?.id)
      );
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
    setIsDeleting(true);
    try {
      await dispatch(batchDeleteProcedures(selectedProcedures)).unwrap();
      onRefresh();
      setSelectedProcedures([]);
    } catch (error: any) {
      alert("Failed to delete selected procedures.");
    } finally {
      setIsDeleting(false);
      setIsBatchDeleteModalOpen(false);
    }
  };

  // Handle Table Changes (Sorting)
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (s && s.field && s.order) {
      // Map dataIndex back to SortType string if needed, or simple pass field
      // Here assuming backend expects specific strings
      let sortField = s.field;
      if (s.field === "updatedAt") sortField = "Last updated";
      if (s.field === "createdAt") sortField = "Created At";
      if (s.field === "title") sortField = "Title";
      if (s.field === "category") sortField = "Category";

      onSortChange(sortField, s.order === "ascend" ? "asc" : "desc");
    } else {
      // Default
      onSortChange("Title", "asc");
    }
  };

  // --- Columns Configuration ---
  const columns = useMemo(() => {
    // 1. Title Column (Left Fixed)
    const titleColumn = {
      title: () => {
        if (!isEditing) {
          return (
            <div className="flex items-center gap-2 h-full">
              <input
                type="checkbox"
                ref={headerCheckboxRef}
                checked={areAllSelected}
                onChange={handleSelectAllToggle}
                className="h-4 w-4 accent-blue-600 cursor-pointer"
              />
              <span className="text-gray-600">Title</span>
            </div>
          );
        }
        // Bulk Edit Header
        return (
          <div className="flex items-center gap-4 h-full">
            <input
              type="checkbox"
              ref={headerCheckboxRef}
              checked={areAllSelected}
              onChange={handleSelectAllToggle}
              className="h-4 w-4 accent-blue-600 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-900">
              Edit {selectedCount} {selectedCount === 1 ? "Procedure" : "Procedures"}
            </span>
            <AntTooltip title="Delete">
              <button
                onClick={() => setIsBatchDeleteModalOpen(true)}
                className={`flex items-center gap-1 transition ${
                  isDeleting
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-red-600 hover:text-red-700"
                }`}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </AntTooltip>
          </div>
        );
      },
      dataIndex: "title",
      key: "title",
      fixed: "left" as const,
      width: 300,
      sorter: true,
      sortOrder: sortType === "Title" ? mapAntSortOrder(sortOrder) : null,
      render: (title: string, record: any) => {
        const isSelected = selectedProcedures.includes(record.key);
        return (
          <div className="flex items-center gap-3 font-medium text-gray-800 h-full">
            <div
              className="flex items-center justify-center h-8 w-8 cursor-pointer transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                toggleRowSelection(record.key);
              }}
            >
              {isEditing ? (
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="h-5 w-5 accent-blue-600 cursor-pointer"
                />
              ) : (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-50 text-blue-500">
                    <ClipboardList size={18} />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            <span
              className="truncate cursor-pointer hover:text-blue-600 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onViewProcedure(record.fullData);
              }}
            >
              {title}
            </span>
          </div>
        );
      },
    };

    // 2. Dynamic Columns
    const dynamicColumns = visibleColumns.map((col) => {
      let dataIndex = "";
      let width = 150;
      let render = (val: any) => val;

      if (col === "Last updated") {
        dataIndex = "updatedAt";
        width = 180;
        render = (val) => formatTableDate(val);
      } else if (col === "Category") {
        dataIndex = "category";
        width = 150;
      } else if (col === "Created At") {
        dataIndex = "createdAt";
        width = 150;
        render = (val) => formatTableDate(val);
      }

      return {
        title: col,
        dataIndex,
        key: dataIndex,
        width,
        sorter: true,
        sortOrder: sortType === col ? mapAntSortOrder(sortOrder) : null,
        render,
      };
    });

    // 3. Actions Column
    const actionColumn = {
      title: " ",
      key: "actions",
      width: 120,
      fixed: "right" as const,
      render: (_: any, record: any) => (
        <div className="flex items-center justify-end gap-2 text-gray-500">
          <button
            onClick={() => onEdit(record.key)}
            className="hover:text-blue-600"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => handleDuplicate(record.fullData)}
            className="hover:text-blue-600"
          >
            <Copy size={18} />
          </button>
          <MoreActionsMenu
            onDelete={() => handleDeleteClick(record.fullData)}
            onDuplicate={() => handleDuplicate(record.fullData)}
            onRestore={
              showDeleted ? () => handleRestore(record.fullData) : undefined
            }
          >
            <button className="hover:text-blue-600">
              <MoreVertical size={18} />
            </button>
          </MoreActionsMenu>
        </div>
      ),
    };

    return [titleColumn, ...dynamicColumns, actionColumn];
  }, [
    visibleColumns,
    selectedProcedures,
    sortType,
    sortOrder,
    isEditing,
    areAllSelected,
    selectedCount,
    isDeleting,
  ]);

  // Data Source Mapping
  const dataSource = useMemo(() => {
    return procedures.map((p) => ({
      key: p.id,
      title: p.title || "Untitled Procedure",
      updatedAt: p.updatedAt,
      createdAt: p.createdAt,
      category: p.categories?.[0] || "—",
      fullData: p,
    }));
  }, [procedures]);

  return (
    <div className="h-full flex flex-col p-4">
      <style>{tableStyles}</style>

      {/* Main Table Card */}
      <Card
        className={`flex-1 flex flex-col shadow-sm border rounded-lg overflow-hidden ${
          showDeleted ? "border-yellow-300" : "border-gray-200"
        }`}
      >
        <CardContent className="flex-1 p-0 overflow-hidden">
          <Table
            columns={columns as any}
            dataSource={dataSource}
            pagination={false}
            scroll={{ x: "max-content", y: "calc(100vh - 280px)" }}
            rowClassName={(record: any) =>
              selectedProcedures.includes(record.key)
                ? "selected-row-class"
                : ""
            }
            onChange={handleTableChange}
            onRow={(record: any) => ({
              onClick: () => toggleRowSelection(record.key),
            })}
          />
        </CardContent>

        {/* Pagination Footer */}
        <div
          className={`flex-shrink-0 flex items-center justify-end p-3 border-t ${
            showDeleted
              ? "bg-yellow-50 border-yellow-200"
              : "bg-white border-gray-100"
          }`}
        >
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

      {/* Modals */}
      <ConfirmationModal
        isOpen={!!modalProc}
        onClose={() => setModalProc(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Procedure"
        message={`Are you sure you want to delete "${modalProc?.title}"?`}
      />

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