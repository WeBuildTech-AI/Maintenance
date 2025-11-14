import React, { useMemo, useState, useRef, useEffect } from "react";
import { Card, CardContent } from "./../ui/card";
import {
  Pencil,
  Copy,
  MoreVertical,
  ClipboardList,
  Trash2,
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
import { MoreActionsMenuWorkOrder } from "./Tableview/modals/MoreActionsMenuWorkOrder";

// ⭐⭐ NEW — DETAILS MODAL ⭐⭐
import WorkOrderDetailsModal from "./Tableview/modals/WorkOrderDetailModal";


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

// Row Styling
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
`;

export function ListView({ workOrders }: ListViewProps) {
  const dispatch = useDispatch<AppDispatch>();

  const [modalWO, setModalWO] = useState<any | null>(null);
  const [selectedWorkOrderIds, setSelectedWorkOrderIds] = useState<string[]>([]);
  const [sortType, setSortType] = useState<string>("Title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // ⭐ NEW — View modal (DETAILS MODAL)
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
                onClick={() => alert("Batch delete")}
                className="ml-1 text-gray-600 hover:text-red-600 transition"
              >
                <Trash2 size={16} />
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
              <div
                className="flex items-center justify-center h-8 w-8 cursor-pointer"
                onClick={() => toggleRowSelection(record.id)}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="h-5 w-5 accent-blue-600 cursor-pointer"
                />
              </div>
            ) : (
              <div
                className="flex items-center justify-center h-8 w-8 cursor-pointer"
                onClick={() => toggleRowSelection(record.id)}
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
                e.stopPropagation();
                setSelectedWO(record);
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
      { title: "Assigned To", dataIndex: "assignedTo", key: "assignedTo", width: 170 },
      { title: "Categories", dataIndex: "categories", key: "categories", width: 150 },
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

          <MoreActionsMenuWorkOrder onDelete={() => setModalWO(record)}>
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
            scroll={{ x: "120%", y: "75vh" }}
            rowClassName={(record: any) =>
              selectedWorkOrderIds.includes(record.id)
                ? "selected-row-class"
                : ""
            }
            onChange={handleTableChange}
          />
        </CardContent>
      </Card>

      {/* DELETE MODAL */}
      {modalWO && (
        <DeleteWorkOrderModal
          isOpen={!!modalWO}
          onClose={() => setModalWO(null)}
          onConfirm={async () => {
            await dispatch(deleteWorkOrder(modalWO.id)).unwrap();
            setModalWO(null);
          }}
        />
      )}

      {/* ⭐⭐ VIEW DETAILS MODAL ⭐⭐ */}
      <WorkOrderDetailsModal
        open={viewModal}
        onClose={() => setViewModal(false)}
        workOrder={{
          ...selectedWO,
          description: selectedWO?.full?.description,
        }}
      />
    </div>
  );
}

export default ListView;
