"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Card, CardContent } from "../ui/card";
import { Avatar as ShadCNAvatar, AvatarFallback } from "../ui/avatar";
import { Settings, Trash2, Loader2 } from "lucide-react";
import { Tooltip } from "../ui/tooltip"; // ShadCN Tooltip
import SettingsModal from "../utils/SettingsModal";
import { formatDateOnly } from "../utils/Date";
import { Table, Avatar, Tooltip as AntTooltip } from "antd";
import type { TableProps, TableColumnType } from "antd";
import toast from "react-hot-toast";
import { meterService } from "../../store/meters";
import AssetTableModal from "../Assets/AssetsTable/AssetTableModal";

type Sorter = Parameters<NonNullable<TableProps<any>["onChange"]>>[2];

const mapAntSortOrder = (order: "asc" | "desc"): "ascend" | "descend" =>
  order === "asc" ? "ascend" : "descend";

// Row Styling
const tableStyles = `
  .selected-row-class > td {
    background-color: #f0f9ff !important; /* Primary/5 equivalent */
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
  .ant-table-thead > tr > th {
    background-color: #f9fafb !important; /* Header BG */
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
  }
  .ant-table-tbody > tr > td {
    border-bottom: 1px solid #f3f4f6; /* Lighter border */
  }
`;
// --- End Helper Functions ---

// Column Configuration
const allAvailableColumns = [
  "ID",
  "Type",
  "Asset",
  "Location",
  "Last Reading",
  "Status",
  "Updated At",
  "Created At",
];

const columnConfig: {
  [key: string]: {
    dataIndex: string;
    width: number;
    sorter?: (a: any, b: any) => number;
  };
} = {
  ID: {
    dataIndex: "id",
    width: 120,
    sorter: (a, b) => (a.id || "").localeCompare(b.id || ""),
  },
  Type: {
    dataIndex: "meterType",
    width: 130,
    sorter: (a, b) => (a.meterType || "").localeCompare(b.meterType || ""),
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
  "Last Reading": {
    dataIndex: "lastReading",
    width: 150,
    sorter: (a, b) => (a.lastReading || "").localeCompare(b.lastReading || ""),
  },
  Status: {
    dataIndex: "status",
    width: 130,
    sorter: (a, b) => (a.status || "").localeCompare(b.status || ""),
  },
  "Updated At": {
    dataIndex: "updatedAt",
    width: 150,
    sorter: (a, b) =>
      new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
  },
  "Created At": {
    dataIndex: "createdAt",
    width: 150,
    sorter: (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  },
};

export function MeterTable({
  meter,
  selectedMeter,
  isSettingsModalOpen,
  setIsSettingsModalOpen,
  fetchMeters, // ⭐ NEW PROP: Add this to refresh data after delete
  showDeleted,
  setShowDeleted,
}: {
  meter: any[];
  isSettingsModalOpen: any;
  setIsSettingsModalOpen: any;
  selectedMeter: any;
  fetchMeters: () => void; // ⭐ NEW PROP
  showDeleted: boolean;
  setShowDeleted: (v: boolean) => void;
}) {
  const [visibleColumns, setVisibleColumns] =
    useState<string[]>(allAvailableColumns);
  const [sortType, setSortType] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedMeterTable, setSelectedMeterTable] = useState<any | null>(null);
  const [selectedMeterIds, setSelectedMeterIds] = useState<string[]>([]);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  const [isOpenMeterDetailsModal, setIsOpenMeterDetailsModal] = useState(false);

  // ⭐ NEW: Deleting state
  const [isDeleting, setIsDeleting] = useState(false);

  const renderInitials = (text: string) =>
    text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  // Selection Logic
  const allMeterIds = useMemo(() => meter.map((p) => p.id), [meter]);
  const selectedCount = selectedMeterIds.length;
  const isEditing = selectedCount > 0;
  const areAllSelected =
    allMeterIds.length > 0 && selectedCount === allMeterIds.length;
  const isIndeterminate = selectedCount > 0 && !areAllSelected;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate, isEditing]);

  const handleSelectAllToggle = () => {
    if (areAllSelected) setSelectedMeterIds([]);
    else setSelectedMeterIds(allMeterIds);
  };

  const toggleRowSelection = (id: string) => {
    setSelectedMeterIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  // --- End Selection Logic ---

  // ⭐ NEW: Bulk Delete Handler
  const handleDelete = async () => {
    if (selectedMeterIds.length === 0) {
      toast.error("No meters selected to delete.");
      return;
    }

    setIsDeleting(true);

    try {
      // Assuming your service has a batchDeleteMeter function
      await meterService.batchDeleteMeter(selectedMeterIds);

      toast.success("Meters deleted successfully!");

      setSelectedMeterIds([]);

      // Call the new prop to refresh the list
      fetchMeters();
    } catch (err) {
      console.error("Error bulk deleting meters:", err);
      toast.error("Failed to delete meters.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTableChange: TableProps<any>["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (s && s.field && s.order) {
      setSortType(s.field as string);
      setSortOrder(s.order === "ascend" ? "asc" : "desc");
    } else if (s && s.field) {
      setSortType(s.field as string);
      setSortOrder("asc");
    } else {
      setSortType("name");
      setSortOrder("asc");
    }
  };

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
      // defensive: if setShowDeleted isn't a function, ignore
      // (but we've corrected the prop typing to a function)
      // eslint-disable-next-line no-console
      console.warn("setShowDeleted is not a function", e);
    }

    // Close modal
    setIsSettingsModalOpen(false);

    // Refresh meters to reflect the new showDeleted value
    if (typeof fetchMeters === "function") {
      fetchMeters();
    }
  };

  // ⭐ 5. Columns Definition (Updated with Delete Button)
  const columns: TableColumnType<any>[] = useMemo(() => {
    const nameColumn: TableColumnType<any> = {
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
                <span className="text-gray-600">Name</span>
              </div>
            </div>
          );
        }
        // --- Bulk Edit Header ---
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

            {/* ⭐ NEW: Delete Button */}
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
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 250,
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
      sortOrder: sortType === "name" ? mapAntSortOrder(sortOrder) : undefined,
      render: (name: string, record: any) => {
        const isSelected = selectedMeterIds.includes(record.id);
        return (
          <div className="flex items-center gap-3 font-medium text-gray-800 h-full">
            <div
              className="flex items-center justify-center h-8 w-8 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                toggleRowSelection(record.id);
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
                <ShadCNAvatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback>{renderInitials(name)}</AvatarFallback>
                </ShadCNAvatar>
              )}
            </div>
            <span
              className="truncate cursor-pointer hover:text-orange-600 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMeterTable(record);
                setIsOpenMeterDetailsModal(true);
              }}
            >
              {name}
            </span>
          </div>
        );
      },
    };

    const dynamicColumns: TableColumnType<any>[] = visibleColumns
      .map((colName) => {
        const config = columnConfig[colName];
        if (!config) return null;

        let renderFunc:
          | ((value: any, record: any) => React.ReactNode)
          | undefined = undefined;

        if (colName === "Status") {
          renderFunc = (status: string, record: any) => (
            <span
              className={`font-medium ${
                record.isOverdue ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {status || "—"}
            </span>
          );
        } else if (colName === "Created At" || colName === "Updated At") {
          renderFunc = (text: string) => formatDateOnly(text) || "—";
        }

        return {
          title: colName,
          dataIndex: config.dataIndex,
          key: config.dataIndex,
          width: config.width,
          sorter: config.sorter,
          sortOrder:
            sortType === config.dataIndex
              ? mapAntSortOrder(sortOrder)
              : undefined,
          render: renderFunc,
        };
      })
      .filter(Boolean) as TableColumnType<any>[];

    return [nameColumn, ...dynamicColumns];
  }, [
    isEditing,
    sortType,
    sortOrder,
    visibleColumns,
    areAllSelected,
    selectedCount,
    selectedMeterIds,
    isDeleting, // ⭐ NEW: Add dependency
  ]);

  const dataSource = useMemo(() => {
    return meter.map((m) => ({
      key: m.id,
      id: m.id || "—",
      name: m.name || "—",
      meterType: m.meterType || "—",
      asset: m.asset?.name || "—",
      location: m.location?.name || "—",
      lastReading: m.readingFrequency
        ? `${m.readingFrequency.time} ${m.readingFrequency.interval}`
        : "—",
      status: m.status || "—",
      isOverdue: m.isOverdue || false,
      createdAt: m.createdAt || "—",
      updatedAt: m.updatedAt || "—",
      fullMeter: m,
    }));
  }, [meter]);

  return (
    <div className="flex-1 overflow-auto p-2">
      <style>{tableStyles}</style>

      <Card className="shadow-sm border rounded-lg overflow-hidden w-full">
        <CardContent className="p-0">
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={{ x: "max-content", y: "75vh" }}
            rowClassName={(record: any) =>
              selectedMeterIds.includes(record.id) ? "selected-row-class" : ""
            }
            onChange={handleTableChange}
            rowSelection={{
              selectedRowKeys: selectedMeterIds,
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
      </Card>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onApply={handleApplySettings}
        allToggleableColumns={allAvailableColumns}
        currentVisibleColumns={visibleColumns}
        currentShowDeleted={showDeleted}
        componentName="Meter"
      />

      {isOpenMeterDetailsModal && (
        <AssetTableModal
          data={selectedMeterTable.fullMeter}
          onClose={() => setIsOpenMeterDetailsModal(false)}
          showDetailsSection={"meter"}
          restoreData={"Restore"}
          fetchData={fetchMeters}
        />
      )}

      
    </div>
  );
}
