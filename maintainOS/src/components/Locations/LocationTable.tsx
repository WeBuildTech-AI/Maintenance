"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Card, CardContent } from "../ui/card";
import { Avatar as ShadCNAvatar, AvatarFallback } from "../ui/avatar";
import { Settings } from "lucide-react";
import { Tooltip } from "../ui/tooltip"; // ShadCN Tooltip
import SettingsModal from "../utils/SettingsModal"; // Is path ko check kar lein
import { formatDateOnly } from "../utils/Date"; // Path check kar lein

// ⭐ 1. Ant Design Imports
import { Table, Avatar, Tooltip as AntTooltip } from "antd";
import type { TableProps, TableColumnType } from "antd";

// --- Helper Functions ---

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

// ⭐ 2. Column Configuration
const allAvailableColumns = [
  "ID",
  "Description",
  "Address",
  "Teams",
  "Vendor",
  "CreatedAt",
  "UpdatedAt",
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
    width: 150,
    sorter: (a, b) => (a.id || "").localeCompare(b.id || ""),
  },
  Description: {
    dataIndex: "description",
    width: 200,
    sorter: (a, b) => (a.description || "").localeCompare(b.description || ""),
  },
  Address: {
    dataIndex: "address",
    width: 200,
    sorter: (a, b) => (a.address || "").localeCompare(b.address || ""),
  },
  Teams: {
    dataIndex: "teams",
    width: 150,
    sorter: (a, b) => (a.teams || "").localeCompare(b.teams || ""),
  },
  Vendor: {
    dataIndex: "vendor",
    width: 150,
    sorter: (a, b) => (a.vendor || "").localeCompare(b.vendor || ""),
  },
  CreatedAt: {
    dataIndex: "createdAt",
    width: 150,
    sorter: (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  },
  UpdatedAt: {
    dataIndex: "updatedAt",
    width: 150,
    sorter: (a, b) =>
      new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
  },
};

export function LocationTable({
  location,
  setIsSettingsModalOpen,
  isSettingsModalOpen,
  selectedLocation, // Yeh abhi highlighting ke liye use nahi ho raha, par prop rakha hai
}: {
  location: any[];
  setIsSettingsModalOpen: any;
  isSettingsModalOpen: any;
  selectedLocation: any;
}) {
  // ⭐ 3. State Management
  const [visibleColumns, setVisibleColumns] =
    useState<string[]>(allAvailableColumns);
  // const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [sortType, setSortType] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // ⭐ NEW: Selection State
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const renderInitials = (text: string) =>
    text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  // ⭐ NEW: Selection Logic
  const allLocationIds = useMemo(() => location.map((p) => p.id), [location]);
  const selectedCount = selectedLocationIds.length;
  const isEditing = selectedCount > 0;
  const areAllSelected =
    allLocationIds.length > 0 && selectedCount === allLocationIds.length;
  const isIndeterminate = selectedCount > 0 && !areAllSelected;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate, isEditing]);

  const handleSelectAllToggle = () => {
    if (areAllSelected) setSelectedLocationIds([]);
    else setSelectedLocationIds(allLocationIds);
  };

  const toggleRowSelection = (id: string) => {
    setSelectedLocationIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  // --- End Selection Logic ---

  // ⭐ 4. Handlers
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
    setVisibleColumns(settings.visibleColumns);
    setIsSettingsModalOpen(false);
  };

  // ⭐ 5. Columns Definition
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
        const isSelected = selectedLocationIds.includes(record.id);
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
                  <AvatarFallback>
                    {record.icon || renderInitials(name)}
                  </AvatarFallback>
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

        let renderFunc:
          | ((value: any, record: any) => React.ReactNode)
          | undefined = undefined;

        if (colName === "CreatedAt" || colName === "UpdatedAt") {
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
    selectedLocationIds,
  ]);

  const dataSource = useMemo(() => {
    return location.map((loc) => ({
      key: loc.id,
      id: loc.id || "—",
      name: loc.name || "—",
      icon: loc.icon,
      description: loc.description || "—",
      address: loc.address || "—",
      teams: loc.teamsInCharge || "—",
      vendor: loc.vendorId?.name || "—", // Safe navigation
      createdAt: loc.createdAt || "—",
      updatedAt: loc.updatedAt || "—",
      fullLocation: loc, // Original object
    }));
  }, [location]);

  return (
    <div className="flex-1 overflow-auto p-2">
      <style>{tableStyles}</style>

      <Card className="shadow-sm border rounded-lg overflow-hidden w-full">
        <CardContent className="p-0">
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={{ x: "max-content", y: "100vh" }}
            rowClassName={(record: any) =>
              selectedLocationIds.includes(record.id)
                ? "selected-row-class"
                : ""
            }
            onChange={handleTableChange}
            rowSelection={{
              selectedRowKeys: selectedLocationIds,
              columnWidth: 0,
              renderCell: () => null,
              columnTitle: " ", // Default header checkbox ko hide karega
            }}
            onRow={(record) => ({
              onClick: () => {
                toggleRowSelection(record.id);
              },
            })}
            // Agar data na ho toh text dikhane ke liye
            locale={{
              emptyText: "No Location found.",
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
        componentName="Location"
      />
    </div>
  );
}
