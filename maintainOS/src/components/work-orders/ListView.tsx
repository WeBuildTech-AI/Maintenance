"use client";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { Card, CardContent } from "./../ui/card";
import {
  Pencil,
  Copy,
  MoreVertical,
  ClipboardList,
  Trash2,
  Loader2,
  Settings, // Settings Icon Added
} from "lucide-react";

// Ant Design
import { Table, Avatar, Tooltip as AntTooltip, Badge } from "antd";
import type { TableProps, TableColumnType } from "antd";

import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { deleteWorkOrder } from "../../store/workOrders/workOrders.thunks";

import DeleteWorkOrderModal from "./ToDoView/DeleteWorkOrderModal";
import { type ListViewProps } from "./types";
import { Tooltip } from "./../ui/tooltip";

// DETAILS/EDIT MODAL
import WorkOrderDetailsModal from "./Tableview/modals/WorkOrderDetailModal";
import toast from "react-hot-toast";
import { workOrderService } from "../../store/workOrders";

// SETTINGS MODAL (Used for column management)
import SettingsModal from "../utils/SettingsModal";

// Format Dates
function formatTableDate(dateString: any) {
  if (!dateString || dateString === "—") return "—";
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

const mapAntSortOrder = (order: any) =>
  order === "asc" ? "ascend" : "descend";

// --- Work Order Specific Column Configuration ---
const allAvailableColumns = [
  "ID",
  "Status",
  "Priority",
  "Work Type",
  "Assigned To",
  "Categories",
  "Asset",
  "Location",
  "Created On",
  "Updated On",
  "Procedure",
];

interface WorkOrderRow {
  id: string;
  title: string;
  status: string;
  priority: string;
  workType: string;
  assignedTo: string;
  categories: string;
  asset: string;
  location: string;
  createdOn: string | number | Date;
  updatedOn: string | number | Date;
  attachedProcedure: string;
  // allow other fields (full object, etc.)
  [key: string]: any;
}

interface ColumnConfigItem {
  dataIndex: keyof WorkOrderRow;
  width: number;
  sorter?: (a: WorkOrderRow, b: WorkOrderRow) => number;
}

const columnConfig: Record<string, ColumnConfigItem> = {
  ID: {
    dataIndex: "id",
    width: 120,
    sorter: (a, b) => (a.id || "").localeCompare(b.id || ""),
  },
  Status: {
    dataIndex: "status",
    width: 150,
    sorter: (a, b) => (a.status || "").localeCompare(b.status || ""),
  },
  Priority: {
    dataIndex: "priority",
    width: 130,
    sorter: (a, b) => (a.priority || "").localeCompare(b.priority || ""),
  },
  "Work Type": {
    dataIndex: "workType",
    width: 150,
    sorter: (a, b) => (a.workType || "").localeCompare(b.workType || ""),
  },
  "Assigned To": {
    dataIndex: "assignedTo",
    width: 170,
    sorter: (a, b) => (a.assignedTo || "").localeCompare(b.assignedTo || ""),
  },
  Categories: {
    dataIndex: "categories",
    width: 150,
    sorter: (a, b) => (a.categories || "").localeCompare(b.categories || ""),
  },
  Asset: {
    dataIndex: "asset",
    width: 150,
    sorter: (a, b) => (a.asset || "").localeCompare(b.asset || ""),
  },
  Location: {
    dataIndex: "location",
    width: 150,
    sorter: (a, b) => (a.location || "").localeCompare(b.location || ""),
  },
  "Created On": {
    dataIndex: "createdOn",
    width: 150,
    sorter: (a, b) =>
      new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime(),
  },
  "Updated On": {
    dataIndex: "updatedOn",
    width: 150,
    sorter: (a, b) =>
      new Date(a.updatedOn).getTime() - new Date(b.updatedOn).getTime(),
  },
  Procedure: {
    dataIndex: "attachedProcedure",
    width: 200,
    sorter: (a, b) =>
      (a.attachedProcedure || "").localeCompare(b.attachedProcedure || ""),
  },
};
// --- END CONFIG ---

// Row Styling & Custom Scrollbar
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

export function ListView({
  workOrders,
  onRefreshWorkOrders,
  setIsSettingsModalOpen,
  isSettingsModalOpen,
  showDeleted,
  setShowDeleted,
}: ListViewProps) {
  const dispatch = useDispatch();
  const [modalWO, setModalWO] = useState<any>(null);
  const [selectedWorkOrderIds, setSelectedWorkOrderIds] = useState<string[]>(
    []
  );

  // State for dynamic columns, initialized to show all
  const [visibleColumns, setVisibleColumns] = useState(allAvailableColumns);
  const [sortType, setSortType] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isDeleting, setIsDeleting] = useState(false);
  // const [showDeleted, setShowDeleted] = useState(false); // State for soft delete toggle

  // VIEW MODAL (Details/Edit)
  const [viewModal, setViewModal] = useState(false);
  const [selectedWO, setSelectedWO] = useState(null);

  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const allWorkOrderIds = useMemo(
    () => workOrders.map((p) => p.id),
    [workOrders]
  );

  const selectedCount = selectedWorkOrderIds.length;
  const isEditing = selectedCount > 0;
  const areAllSelected =
    allWorkOrderIds.length > 0 && selectedCount === allWorkOrderIds.length;
  const isIndeterminate = selectedCount > 0 && !areAllSelected;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate, isEditing]);

  const handleSelectAllToggle = () => {
    if (areAllSelected) setSelectedWorkOrderIds([]);
    else setSelectedWorkOrderIds(allWorkOrderIds);
  };

  const toggleRowSelection = (id: string) => {
    setSelectedWorkOrderIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Bulk Delete
  const handleDelete = async () => {
    if (selectedWorkOrderIds.length === 0) {
      toast.error("No work orders selected to delete.");
      return;
    }
    setIsDeleting(true);
    try {
      await workOrderService.batchDeleteWorkOrder(selectedWorkOrderIds);
      toast.success("Work orders deleted successfully!");
      setSelectedWorkOrderIds([]);
      onRefreshWorkOrders();
    } catch (err) {
      console.error("Error bulk deleting work orders:", err);
      toast.error("Failed to delete work orders.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (s && s.field && s.order) {
      setSortType(s.field as string);
      setSortOrder(s.order === "ascend" ? "asc" : "desc");
    } else if (s && s.field) {
      setSortType(s.field as string);
      setSortOrder("asc");
    } else {
      setSortType("title");
      setSortOrder("asc");
    }
  };

  // Handle Apply Settings from Modal
  const handleApplySettings = (settings: {
    resultsPerPage: number;
    showDeleted: boolean;
    sortColumn: string;
    visibleColumns: string[];
  }) => {
    // Apply visible columns
    setVisibleColumns(settings.visibleColumns);
    // Apply showDeleted toggle from modal and refresh list
    try {
      setShowDeleted(settings.showDeleted);
    } catch (e) {
      console.warn("setShowDeleted is not a function", e);
    }

    // Close modal
    setIsSettingsModalOpen(false);
  };

  // Columns definition
  const columns = useMemo(() => {
    const titleColumn = {
      title: () => {
        if (!isEditing) {
          return (
            <div className="flex items-center justify-between gap-2 h-full">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  ref={headerCheckboxRef}
                  checked={areAllSelected}
                  onChange={handleSelectAllToggle}
                  className="h-4 w-4 accent-blue-600 cursor-pointer"
                />
                <span className="text-gray-600">Title</span>
              </div>

              {/* Settings Icon in Header (When not editing) */}
              <Tooltip text="Settings">
                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="text-gray-500 hover:text-blue-600"
                >
                  <Settings size={18} />
                </button>
              </Tooltip>
            </div>
          );
        }
        // --- Bulk Edit Header (when isEditing is true) ---
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
              Edit {selectedCount} {selectedCount === 1 ? "Item" : "Items"}
            </span>

            {/* Bulk Delete Button */}
            <AntTooltip title="Delete" getPopupContainer={() => document.body}>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`flex items-center gap-1 transition ${
                  isDeleting
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-red-600 hover:text-red-700"
                }`}
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
      fixed: "left" as any,
      width: 300,

      sorter: (a: any, b: any) => (a.title || "").localeCompare(b.title || ""),
      sortOrder:
        sortType === "title" ? mapAntSortOrder(sortOrder) : (undefined as any),

      render: (title: string, record: any) => {
        const isSelected = selectedWorkOrderIds.includes(record.id);

        return (
          <div className="flex items-center gap-3 font-medium text-gray-800 h-full">
            {isEditing ? (
              // When in Editing mode, show the checkbox
              <div className="flex items-center justify-center h-8 w-8 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="h-5 w-5 accent-blue-600 cursor-pointer"
                />
              </div>
            ) : (
              // When not in Editing mode, show the Avatar/List icon
              <div
                className="flex items-center justify-center h-8 w-8 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRowSelection(record.id);
                }}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <ClipboardList size={18} />
                </Avatar>
              </div>
            )}

            {/* CLICK → OPEN VIEW/EDIT MODAL */}
            <span
              className="truncate cursor-pointer hover:text-blue-600 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedWO(record.full);
                setViewModal(true);
              }}
            >
              {title}
            </span>
          </div>
        );
      },
    };

    // Dynamically generate columns based on visibleColumns state
    const dynamicColumns = visibleColumns
      .filter((colName) => colName !== "Title") // Title is handled separately
      .map((colName) => {
        const config = columnConfig[colName];
        if (!config) return null;

        let renderFunc;
        // Apply special render functions for Status, Created On, Updated On
        if (colName === "Status") {
          renderFunc = (status: any) => (
            <Badge variant="secondary">{status}</Badge>
          );
        } else if (colName === "Created On" || colName === "Updated On") {
          renderFunc = (text: any) => formatTableDate(text);
        }

        return {
          title: colName,
          dataIndex: config.dataIndex,
          key: config.dataIndex,
          width: config.width,
          sorter: config.sorter,
          sortOrder:
            sortType === config.dataIndex.toLowerCase()
              ? mapAntSortOrder(sortOrder)
              : (undefined as any),
          render: renderFunc,
        };
      })
      .filter(Boolean); // Remove nulls

    return [titleColumn, ...dynamicColumns]; // Only Title and Dynamic columns remain
  }, [
    isEditing,
    sortType,
    sortOrder,
    visibleColumns,
    selectedWorkOrderIds,
    areAllSelected,
    selectedCount,
    isDeleting,
    handleSelectAllToggle,
    toggleRowSelection,
    handleDelete,
    setIsSettingsModalOpen,
  ]);

  // ✅ SAFELY MAP DATA (Prevents "Objects are not valid as React Child" Error)
  const dataSource = useMemo(() => {
    // Helper to extract a string if the value is an object {id, name}
    const getSafeString = (val: any) => {
      if (!val) return "—";
      if (typeof val === "string") return val;
      if (typeof val === "object") {
        return val.name || val.fullName || val.title || val.id || "—";
      }
      return String(val);
    };

    return workOrders.map((item) => {
      // 1. Assigned To (Usually array or object)
      const assigneeVal = Array.isArray(item.assignees)
        ? item.assignees[0]
        : item.assignedTo;
      const assignedToStr = getSafeString(assigneeVal);

      // 2. Asset (Array or object)
      const assetVal = Array.isArray(item.assets) ? item.assets[0] : item.asset;
      const assetStr = getSafeString(assetVal);

      // 3. Location (Object)
      const locationStr = getSafeString(item.location);

      // 4. Categories (Array of strings or objects)
      let catStr = "—";
      const cats = item.categories || item.category;
      if (Array.isArray(cats) && cats.length > 0) {
        catStr = getSafeString(cats[0]); // Take first category
      } else {
        catStr = getSafeString(cats);
      }

      return {
        key: item.id,
        id: item.id || "—",
        title: item.title || "—",
        // Extract string values for potentially complex objects
        status: getSafeString(item.status),
        priority: getSafeString(item.priority),
        workType: getSafeString(item.work_type || item.workType),
        assignedTo: assignedToStr === "—" ? "Unassigned" : assignedToStr,
        categories: catStr,
        asset: assetStr,
        location: locationStr,
        createdOn: item.createdAt || "—",
        updatedOn: item.updatedAt || "—",
        attachedProcedure: getSafeString(item.attachedProcedure),
        full: item,
      };
    });
  }, [workOrders]);

  return (
    // ✅ ADDED: h-full flex flex-col to parent to occupy full height
    <div className="h-full flex flex-col p-4">
      <style>{tableStyles}</style>

      {/* ✅ ADDED: flex-1 flex flex-col to Card to stretch it */}
      <Card className="flex-1 flex flex-col shadow-sm border rounded-lg overflow-hidden">
        {/* ✅ ADDED: flex-1 overflow-hidden to CardContent to make Table scrollable */}
        <CardContent className="flex-1 p-0 overflow-hidden">
          <Table
            columns={columns as any}
            dataSource={dataSource}
            pagination={false}
            // ✅ UPDATED: Scroll calculation adjusted for Full Screen List feel
            scroll={{ x: "max-content", y: "calc(100vh - 280px)" }}
            rowClassName={(record: any) =>
              selectedWorkOrderIds.includes(record.id)
                ? "selected-row-class"
                : ""
            }
            onChange={handleTableChange}
            rowSelection={{
              selectedRowKeys: selectedWorkOrderIds,
              columnWidth: 0,
              renderCell: () => null,
              columnTitle: " ",
            }}
            onRow={(record: any) => ({
              onClick: () => {
                toggleRowSelection(record.id);
              },
            })}
          />
        </CardContent>

        {/* PAGINATION FOOTER - Pushed to bottom by flex-1 above */}
        <div className="flex-shrink-0 flex items-center justify-end p-3 border-t border-gray-100 bg-white">
          <div className="inline-flex items-center gap-4 rounded-md border bg-white p-2 shadow-sm">
            <span className="text-sm text-gray-600">
              1 – {workOrders.length} of {workOrders.length}
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

      {/* Settings Modal (Controls Visible Columns) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onApply={handleApplySettings}
        allToggleableColumns={allAvailableColumns}
        currentVisibleColumns={visibleColumns}
        currentShowDeleted={showDeleted}
        componentName="Work Order"
      />
      {modalWO && (
        <DeleteWorkOrderModal
          isOpen={!!modalWO}
          onClose={() => setModalWO(null)}
          onConfirm={async () => {
            await workOrderService.deleteWorkOrder(modalWO?.id);
            setModalWO(null);
            onRefreshWorkOrders();
          }}
        />
      )}

      {/* VIEW DETAILS MODAL */}
      <WorkOrderDetailsModal
        open={viewModal}
        onClose={() => setViewModal(false)}
        workOrder={selectedWO}
        onRefreshWorkOrders={onRefreshWorkOrders}
        showDeleted={showDeleted}
      />
    </div>
  );
}

export default ListView;
