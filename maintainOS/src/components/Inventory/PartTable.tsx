"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Card, CardContent } from "../ui/card";
import { Avatar as ShadCNAvatar, AvatarFallback } from "../ui/avatar";

// Antd & Icons
import { Table, Tooltip as AntTooltip } from "antd";
import type { TableProps, TableColumnType } from "antd";
import { Settings, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// Imports
import SettingsModal from "../utils/SettingsModal";
import { formatDateOnly } from "../utils/Date";
import { partService } from "../../store/parts";

// --- Helper Functions ---

const mapAntSortOrder = (order: "asc" | "desc"): "ascend" | "descend" =>
  order === "asc" ? "ascend" : "descend";

const renderInitials = (text: string) =>
  text
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

// Row Styling
const tableStyles = `
  .selected-row-class > td {
    background-color: #f0f9ff !important;
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
    background-color: #f9fafb !important;
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
  }
  .ant-table-tbody > tr > td {
    border-bottom: 1px solid #f3f4f6;
  }
`;

// ⭐ 1. Column Names (Jo user ko settings modal mein dikhenge)
const allAvailableColumns = [
  "Name",
  "Part ID",
  "Unit Cost",
  "Stock",
  "Location",
  "Vendors",
  "Teams",
  "Created At",
  "Updated At",
];

// ⭐ 2. Column Config (Sorting aur Width settings)
const columnConfig: {
  [key: string]: {
    dataIndex: string;
    width: number;
    sorter?: (a: any, b: any) => number;
  };
} = {
  Name: {
    dataIndex: "name",
    width: 250,
    sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
  },
  "Part ID": {
    dataIndex: "id",
    width: 150,
    sorter: (a, b) => (a.id || "").localeCompare(b.id || ""),
  },
  "Unit Cost": {
    dataIndex: "unitCost",
    width: 120,
    sorter: (a, b) => (a.unitCost || 0) - (b.unitCost || 0),
  },
  Stock: {
    dataIndex: "totalStock", // Humne niche map kiya hai
    width: 150,
    sorter: (a, b) => (a.totalStock || 0) - (b.totalStock || 0),
  },
  Location: {
    dataIndex: "locationString", // Combined string
    width: 200,
    sorter: (a, b) =>
      (a.locationString || "").localeCompare(b.locationString || ""),
  },
  Vendors: {
    dataIndex: "vendors", // Array object
    width: 200,
    sorter: (a, b) =>
      (a.vendors?.[0]?.name || "").localeCompare(b.vendors?.[0]?.name || ""),
  },
  Teams: {
    dataIndex: "teamsString", // Combined string
    width: 150,
    sorter: (a, b) => (a.teamsString || "").localeCompare(b.teamsString || ""),
  },
  "Created At": {
    dataIndex: "createdAt",
    width: 150,
    sorter: (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  },
  "Updated At": {
    dataIndex: "createdAt",
    width: 150,
    sorter: (a, b) =>
      new Date(a.udpatedAt).getTime() - new Date(b.udpatedAt).getTime(),
  },
};

export function PartTable({
  inventory,
  isSettingsModalOpen,
  setIsSettingsModalOpen,
  fetchPartsData,
  showDeleted,
  setShowDeleted,
}: {
  inventory: any[];
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (isOpen: boolean) => void;
  fetchPartsData: () => void;
  showDeleted: boolean;
  setShowDeleted: (v: boolean) => void;
}) {
  const [visibleColumns, setVisibleColumns] =
    useState<string[]>(allAvailableColumns);
  const [sortType, setSortType] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const allPartIds = useMemo(() => inventory.map((p) => p.id), [inventory]);
  const selectedCount = selectedPartIds.length;
  const isEditing = selectedCount > 0;
  const areAllSelected =
    allPartIds.length > 0 && selectedCount === allPartIds.length;
  const isIndeterminate = selectedCount > 0 && !areAllSelected;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate, isEditing]);

  const handleSelectAllToggle = () => {
    if (areAllSelected) setSelectedPartIds([]);
    else setSelectedPartIds(allPartIds);
  };

  const toggleRowSelection = (id: string) => {
    setSelectedPartIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (selectedPartIds.length === 0) {
      toast.error("No parts selected to delete.");
      return;
    }
    setIsDeleting(true);
    try {
      await partService.batchDeletePart(selectedPartIds);
      toast.success("Parts deleted successfully!");
      setSelectedPartIds([]);
      fetchPartsData();
    } catch (err) {
      console.error("Error bulk deleting parts:", err);
      toast.error("Failed to delete parts.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTableChange: TableProps<any>["onChange"] = (
    _pagination,
    _filters,
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
    setVisibleColumns(settings.visibleColumns);
    setShowDeleted(settings.showDeleted);
    setIsSettingsModalOpen(false);
  };

  // ⭐ 3. Columns Definition (Display Logic)
  const columns: TableColumnType<any>[] = useMemo(() => {
    // --- Name Column (Fixed Left) ---
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
        const isSelected = selectedPartIds.includes(record.id);
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
            <span className="truncate capitalize">{name}</span>
          </div>
        );
      },
    };

    const dynamicColumns: TableColumnType<any>[] = visibleColumns
      .map((colName) => {
        const config = columnConfig[colName];
        if (!config) return null;
        if (colName === "Name") return null; // Skip Name (it's fixed)

        let renderFunc:
          | ((value: any, record: any) => React.ReactNode)
          | undefined = undefined;

        // Custom Renders
        if (colName === "Part ID") {
          renderFunc = (id: string) => (
            <span className="font-mono text-muted-foreground">
              #{id.substring(0, 8)}...
            </span>
          );
        } else if (colName === "Unit Cost") {
          renderFunc = (val: number) => (
            <span className="text-muted-foreground">
              ${(val || 0).toFixed(2)}
            </span>
          );
        } else if (colName === "Stock") {
          // Record se 'totalStock' aur 'minStock' use kar rahe hain
          renderFunc = (_: any, record: any) => (
            <span className="text-muted-foreground">
              {record.totalStock} / Min {record.minStock}
            </span>
          );
        } else if (colName === "Vendors") {
          // Backend: vendors = [{ id, name }]
          renderFunc = (vendors: any[]) => (
            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              {vendors && vendors.length > 0
                ? vendors.map((v) => (
                    <span
                      key={v.id}
                      className="bg-gray-100 px-2 py-0.5 rounded w-fit"
                    >
                      {v.name}
                    </span>
                  ))
                : "—"}
            </div>
          );
        } else if (colName === "Teams") {
          renderFunc = (text: string) => (
            <span className="text-muted-foreground">{text || "—"}</span>
          );
        } else if (colName === "Created At") {
          renderFunc = (text: string) => formatDateOnly(text) || "—";
        } else if (colName === "Updated At") {
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
    selectedPartIds,
    isDeleting,
  ]);

  // ⭐ 4. Data Mapping (Backend Response -> Table Rows)
  const dataSource = useMemo(() => {
    return inventory.map((part) => {
      // Calculate Stock (Sum of all locations)
      const totalStock =
        part.locations?.reduce(
          (acc: number, loc: any) => acc + (loc.unitsInStock || 0),
          0
        ) || 0;
      const minStock =
        part.locations?.reduce(
          (acc: number, loc: any) => acc + (loc.minimumInStock || 0),
          0
        ) || 0;

      // Format Location String
      const locationString =
        part.locations?.map((l: any) => `${l.name} (${l.area})`).join(", ") ||
        "—";

      // Format Teams String
      const teamsString = part.teams?.map((t: any) => t.name).join(", ") || "";

      return {
        key: part.id,
        id: part.id,
        name: part.name,
        unitCost: part.unitCost,

        // Calculated Fields
        totalStock,
        minStock,
        locationString,
        teamsString,

        // Arrays passed as is
        vendors: part.vendors,
        createdAt: part.createdAt,
        updatedAt: part.updatedAt,
        fullPart: part,
      };
    });
  }, [inventory]);

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
              selectedPartIds.includes(record.id) ? "selected-row-class" : ""
            }
            onChange={handleTableChange}
            rowSelection={{
              selectedRowKeys: selectedPartIds,
              columnWidth: 0,
              renderCell: () => null,
              columnTitle: " ",
            }}
            onRow={(record) => ({
              onClick: () => {
                toggleRowSelection(record.id);
              },
            })}
            locale={{
              emptyText: "No parts found.",
            }}
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
        componentName="Parts"
      />
    </div>
  );
}
