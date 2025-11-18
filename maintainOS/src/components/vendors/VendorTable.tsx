"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Card, CardContent } from "../ui/card";
import { Avatar as ShadCNAvatar, AvatarFallback } from "../ui/avatar";

// ⭐ NEW: Imports for Antd, Icons, Services, and Toast
import { Table, Tooltip as AntTooltip } from "antd";
import type { TableProps, TableColumnType } from "antd";
// ⭐ FIX 1: Settings icon import karein
import { Trash2, Loader2, Settings } from "lucide-react";
import { formatDateOnly } from "../utils/Date"; // Path check kar lein
import toast from "react-hot-toast";
import SettingsModal from "../utils/SettingsModal";
// ⭐ NEW: Service aur Type imports (path check kar lein)
// import { vendorService } from "../../../store/vendors";
import { type Vendor } from "./vendors.types";
import { vendorService } from "../../store/vendors";

// --- Helper Functions ---

const mapAntSortOrder = (order: "asc" | "desc"): "ascend" | "descend" =>
  order === "asc" ? "ascend" : "descend";

// Row Styling
const tableStyles = `
  .selected-row-class > td {
    background-color: #f0f9ff !importableAnt; /* Blue selection color */
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
  "Parts",
  "Locations",
  "Created",
  "Updated",
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
  Parts: {
    dataIndex: "parts",
    width: 180,
    sorter: (a, b) => (a.parts || "").localeCompare(b.parts || ""),
  },
  Locations: {
    dataIndex: "locations",
    width: 180,
    sorter: (a, b) => (a.locations || "").localeCompare(b.locations || ""),
  },
  Created: {
    dataIndex: "createdAt",
    width: 150,
    sorter: (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  },
  Updated: {
    dataIndex: "updatedAt",
    width: 150,
    sorter: (a, b) =>
      new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
  },
};

export function VendorTable({
  vendors,
  isSettingModalOpen,
  setIsSettingModalOpen,
  fetchVendors,
}: {
  vendors: Vendor[];
  isSettingModalOpen: any; // Type 'any' rakha hai aapke code ke hisaab se
  setIsSettingModalOpen: (isOpen: boolean) => void;
  fetchVendors: () => void;
}) {
  // State Management
  const [visibleColumns, setVisibleColumns] =
    useState<string[]>(allAvailableColumns);
  const [sortType, setSortType] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showDeleted, setShowDeleted] = useState(false);

  // Selection & Delete State
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const renderInitials = (text: string) =>
    text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  // Selection Logic
  const allVendorIds = useMemo(() => vendors.map((p) => p.id), [vendors]);
  const selectedCount = selectedVendorIds.length;
  const isEditing = selectedCount > 0;
  const areAllSelected =
    allVendorIds.length > 0 && selectedCount === allVendorIds.length;
  const isIndeterminate = selectedCount > 0 && !areAllSelected;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate, isEditing]);

  const handleSelectAllToggle = () => {
    if (areAllSelected) setSelectedVendorIds([]);
    else setSelectedVendorIds(allVendorIds);
  };

  const toggleRowSelection = (id: string) => {
    setSelectedVendorIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Delete Handler
  const handleDelete = async () => {
    if (selectedVendorIds.length === 0) {
      toast.error("No vendors selected to delete.");
      return;
    }
    setIsDeleting(true);
    try {
      // ⭐ FIX: Delete service call ko uncomment kiya
      await vendorService.batchDeleteVendor(selectedVendorIds);
      toast.success("Vendors deleted successfully!");
      setSelectedVendorIds([]);
      fetchVendors(); // Refresh the list
    } catch (err) {
      console.error("Error bulk deleting vendors:", err);
      toast.error("Failed to delete vendors.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Table Change Handler
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

  // Settings Handler
  const handleApplySettings = (settings: {
    resultsPerPage: number;
    showDeleted: boolean;
    sortColumn: string;
    visibleColumns: string[];
  }) => {
    setVisibleColumns(settings.visibleColumns);
    setShowDeleted(settings.showDeleted);
    setIsSettingModalOpen(false);
  };

  // Columns Definition
  const columns: TableColumnType<any>[] = useMemo(() => {
    // --- Name Column (Fixed Left) ---
    const nameColumn: TableColumnType<any> = {
      title: () => {
        if (!isEditing) {
          // Default Header
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
              
              {/* ⭐ FIX 2: YAHAN SETTINGS BUTTON ADD KIYA GAYA HAI */}
              <AntTooltip title="Settings" getPopupContainer={() => document.body}>
                <button
                  onClick={() => setIsSettingModalOpen(true)}
                  className="text-gray-500 hover:text-gray-800"
                >
                  <Settings size={16} />
                </button>
              </AntTooltip>

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
              Edit {selectedCount} {selectedCount === 1 ? "Item" : "Items"}
            </span>
            {/* Delete Button */}
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
        const isSelected = selectedVendorIds.includes(record.id);
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

        let renderFunc:
          | ((value: any, record: any) => React.ReactNode)
          | undefined = undefined;

        if (colName === "Created" || colName === "Updated") {
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
    selectedVendorIds,
    isDeleting,
  ]);
  
  const dataSource = useMemo(() => {
    return vendors.map((vendor) => ({
      key: vendor.id,
      id: vendor.id,
      name: vendor.name,
      parts: vendor.partsSummary ?? "—",
      locations: vendor.locations.map((loc: any) => loc.name).join(", ") || "—",
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
      fullVendor: vendor,
    }));
  }, [vendors]);

  // JSX
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
              selectedVendorIds.includes(record.id) ? "selected-row-class" : ""
            }
            onChange={handleTableChange}
            rowSelection={{
              selectedRowKeys: selectedVendorIds,
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
              emptyText: "No vendors found.",
            }}
          />
        </CardContent>
      </Card>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingModalOpen}
        onClose={() => setIsSettingModalOpen(false)}
        onApply={handleApplySettings}
        allToggleableColumns={allAvailableColumns}
        currentVisibleColumns={visibleColumns}
        currentShowDeleted={showDeleted}
        componentName="Vendor"
      />
    </div>
  );
}