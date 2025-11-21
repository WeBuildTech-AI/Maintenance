import React, { useMemo, useState, useRef, useEffect } from "react";
import { Card, CardContent } from "./../ui/card";
import {
  Pencil,
  Copy,
  MoreVertical,
  ClipboardList,
  Trash2,
  Loader2,
} from "lucide-react";

// Ant Design
import { Table, Avatar, Tooltip as AntTooltip, Badge } from "antd";
import type { TableProps, TableColumnType } from "antd";

import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import {
  deleteWorkOrder,
  // batchDeleteWorkOrders,
} from "../../store/workOrders/workOrders.thunks";

import DeleteWorkOrderModal from "./ToDoView/DeleteWorkOrderModal";
import { type ListViewProps } from "./types";
import { Tooltip } from "./../ui/tooltip";
import { MoreActionsMenuWorkOrder } from "./Tableview/modals/MoreActionsMenuWorkOrder";

// DETAILS MODAL
import WorkOrderDetailsModal from "./Tableview/modals/WorkOrderDetailModal";
import toast from "react-hot-toast";
import { workOrderService } from "../../store/workOrders";

// Format Dates
function formatTableDate(dateString: string) {
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

type Sorter = Parameters<NonNullable<TableProps<any>["onChange"]>>[2];

const mapAntSortOrder = (order: "asc" | "desc"): "ascend" | "descend" =>
  order === "asc" ? "ascend" : "descend";

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

export function ListView({ workOrders, onRefreshWorkOrders }: ListViewProps) {
  const dispatch = useDispatch<AppDispatch>();

  const [modalWO, setModalWO] = useState<any | null>(null);
  const [selectedWorkOrderIds, setSelectedWorkOrderIds] = useState<string[]>([]);
  const [sortType, setSortType] = useState<string>("Title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isDeleting, setIsDeleting] = useState(false);

  // VIEW MODAL
  const [viewModal, setViewModal] = useState(false);
  const [selectedWO, setSelectedWO] = useState<any>(null);

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

  const handleDelete = async () => {
    if (selectedWorkOrderIds.length === 0) {
      toast.error("No work orders selected to delete.");
      return;
    }
    setIsDeleting(true);
    try {
      // await dispatch(batchDeleteWorkOrders(selectedWorkOrderIds)).unwrap();
      await workOrderService.batchDeleteWorkOrder(selectedWorkOrderIds)
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

  const handleTableChange: TableProps<any>["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    const s = sorter as Sorter;
    if (s.field && s.order) {
      setSortType(s.field as string);
      setSortOrder(s.order === "ascend" ? "asc" : "desc");
    } else if (s.field) {
      setSortType(s.field as string);
      setSortOrder("asc");
    }
  };

  // Columns
  const columns: TableColumnType<any>[] = useMemo(() => {
    const titleColumn: TableColumnType<any> = {
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
        return (
          <div className="flex items-center gap-2 h-full">
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
            <Tooltip text="Delete">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`ml-1 transition ${
                  isDeleting
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:text-red-600"
                }`}
              >
                {isDeleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </Tooltip>
          </div>
        );
      },

      dataIndex: "title",
      key: "title",
      fixed: "left",
      width: 300,

      sorter: (a, b) => (a.title || "").localeCompare(b.title || ""),
      sortOrder: sortType === "title" ? mapAntSortOrder(sortOrder) : undefined,

      render: (title: string, record: any) => {
        const isSelected = selectedWorkOrderIds.includes(record.id);

        return (
          <div className="flex items-center gap-3 font-medium text-gray-800 h-full">
            {isEditing ? (
              // When in Editing mode, show the checkbox
              <div
                className="flex items-center justify-center h-8 w-8 cursor-pointer"
                onClick={(e) => {
                  // e.stopPropagation() prevents the row click from firing twice, 
                  // but we rely on onRow for selection, so we can omit it here 
                  // or keep it to make the click only on the checkbox area toggle selection.
                  // Since the table's onRow handles the click, we'll keep the onRow logic.
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly // Use readOnly since the row click is managing the state change
                  className="h-5 w-5 accent-blue-600 cursor-pointer"
                />
              </div>
            ) : (
              // When not in Editing mode, show the Avatar/List icon
              <div
                className="flex items-center justify-center h-8 w-8 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent opening view modal when clicking icon
                  toggleRowSelection(record.id); // Allow clicking icon/area to start selection
                }}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <ClipboardList size={18} />
                </Avatar>
              </div>
            )}

            {/* ⭐ CLICK → OPEN VIEW MODAL ⭐ */}
            <span
              className="truncate cursor-pointer hover:text-blue-600 hover:underline"
              onClick={(e) => {
                e.stopPropagation(); // Crucial to prevent row selection when opening modal
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

    const dynamicColumns: TableColumnType<any>[] = [
      { title: "ID", dataIndex: "id", key: "id", width: 120 },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 150,
        render: (status: string) => (
          <Badge variant="secondary">{status}</Badge>
        ),
      },
      { title: "Priority", dataIndex: "priority", key: "priority", width: 130 },
      { title: "Work Type", dataIndex: "workType", key: "workType", width: 150 },
      {
        title: "Assigned To",
        dataIndex: "assignedTo",
        key: "assignedTo",
        width: 170,
      },
      {
        title: "Categories",
        dataIndex: "categories",
        key: "categories",
        width: 150,
      },
      { title: "Asset", dataIndex: "asset", key: "asset", width: 150 },
      { title: "Location", dataIndex: "location", key: "location", width: 150 },
      {
        title: "Created On",
        dataIndex: "createdOn",
        key: "createdOn",
        width: 150,
        render: (text: string) => formatTableDate(text),
      },
      {
        title: "Updated On",
        dataIndex: "updatedOn",
        key: "updatedOn",
        width: 150,
        render: (text: string) => formatTableDate(text),
      },
      {
        title: "Procedure",
        dataIndex: "attachedProcedure",
        key: "attachedProcedure",
        width: 200,
      },
    ];

    const actionColumn: TableColumnType<any> = {
      title: "Actions",
      key: "operation",
      width: 120,
      render: (text: any, record: any) => (
        <div className="flex items-center justify-end gap-4 h-full">
          <AntTooltip title="Edit">
            <button
              onClick={() => alert("Edit " + record.title)}
              className="text-gray-500 hover:text-blue-600"
            >
              <Pencil size={18} />
            </button>
          </AntTooltip>

          <AntTooltip title="Duplicate">
            <button
              onClick={() => alert("Duplicate " + record.title)}
              className="text-gray-500 hover:text-blue-600"
            >
              <Copy size={18} />
            </button>
          </AntTooltip>

          <MoreActionsMenuWorkOrder onDelete={() => setModalWO(record.full)}>
            <button className="text-gray-500 hover:text-blue-600">
              <MoreVertical size={18} />
            </button>
          </MoreActionsMenuWorkOrder>
        </div>
      ),
    };

    return [titleColumn, ...dynamicColumns, actionColumn];
  }, [
    isEditing,
    sortType,
    sortOrder,
    selectedWorkOrderIds,
    areAllSelected,
    selectedCount,
    isDeleting,
    handleSelectAllToggle, // Added dependency for handleSelectAllToggle
    toggleRowSelection, // Added dependency for toggleRowSelection
    handleDelete, // Added dependency for handleDelete
  ]);

  // Map data
  const dataSource = useMemo(() => {
    return workOrders.map((item) => ({
      key: item.id,
      id: item.id || "—",
      title: item.title || "—",
      status: item.status || "—",
      priority: item.priority || "—",
      workType: item.work_type || item.workType || "—",
      assignedTo:
        item.assignees?.[0]?.fullName ||
        item.assignees?.[0]?.name ||
        "Unassigned",
      categories: item.categories || item.category || "—",
      asset: item.assets?.[0]?.name || "—",
      location: item.location?.name || "—",
      createdOn: item.createdAt || "—",
      updatedOn: item.updatedAt || "—",
      attachedProcedure: item.attachedProcedure || "—",
      full: item,
    }));
  }, [workOrders]);

  return (
    <div className="p-4">
      <style>{tableStyles}</style>

      <Card className="shadow-sm border rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={{ x: "120%", y: "calc(100vh - 280px)" }}
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
            onRow={(record) => ({
              onClick: () => {
                toggleRowSelection(record.id);
              },
            })}
          />
        </CardContent>

        {/* ⭐ PAGINATION FOOTER (Fixed at bottom) ⭐ */}
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

      {/* DELETE MODAL (Single) */}
      {modalWO && (
        <DeleteWorkOrderModal
          isOpen={!!modalWO}
          onClose={() => setModalWO(null)}
          onConfirm={async () => {
            await dispatch(deleteWorkOrder(modalWO.id)).unwrap();
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
      />
    </div>
  );
}

export default ListView;