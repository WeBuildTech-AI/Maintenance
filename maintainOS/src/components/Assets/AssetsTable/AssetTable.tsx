"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Card, CardContent } from "../../ui/card";
import { Avatar as ShadCNAvatar, AvatarFallback } from "../../ui/avatar"; // Renamed
import {
  CircleCheck,
  MapPin,
  MessageCircleWarning,
  Trash2,
  Loader2,
  Settings,
} from "lucide-react";
import { formatDateOnly } from "../../utils/Date";
import { UpdateAssetStatusModal } from "../AssetDetail/sections/AssetStatusReadings";
import { assetService } from "../../../store/assets";
import { Tooltip } from "../../ui/tooltip";
import toast from "react-hot-toast";
import SettingsModal from "../../utils/SettingsModal";

// ⭐ 1. Ant Design Imports (ListView se copy kiye gaye)
import { Table, Avatar, Tooltip as AntTooltip } from "antd";
import type { TableProps, TableColumnType } from "antd";
import type { AppDispatch } from "../../../store"; // Store path check kar lein
import { useDispatch } from "react-redux";
import Loader from "../../Loader/Loader";
import AssetTableModal from "./AssetTableModal";

// --- Helper Functions (ListView se copy kiye gaye) ---

type Sorter = Parameters<NonNullable<TableProps<any>["onChange"]>>[2];

const mapAntSortOrder = (order: "asc" | "desc"): "ascend" | "descend" =>
  order === "asc" ? "ascend" : "descend";

// Row Styling (ListView se copy kiya gaya)
const tableStyles = `
  .selected-row-class > td {
    background-color: #ffe8d9 !important; /* Orange theme */
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

const allAvailableColumns = [
  "ID",
  "Status",
  "Location",
  "Criticality",
  "Manufacturer",
  "Type",
  "QrCode",
  "Meter",
  "Part",
  "Team",
  "Updated At",
  "Created At",
];

// ⭐ 2. Data Mapping (har column ke liye)
// Yeh batata hai ki "Visible Column Name" ka data 'dataSource' mein kis key par milega
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
  Status: { dataIndex: "status", width: 150 },
  Location: {
    dataIndex: "location",
    width: 150,
    sorter: (a, b) => (a.location || "").localeCompare(b.location || ""),
  },
  Criticality: {
    dataIndex: "criticality",
    width: 130,
    sorter: (a, b) => (a.criticality || "").localeCompare(b.criticality || ""),
  },
  Manufacturer: {
    dataIndex: "manufacturer",
    width: 150,
    sorter: (a, b) =>
      (a.manufacturer || "").localeCompare(b.manufacturer || ""),
  },
  Type: { dataIndex: "type", width: 150 },
  QrCode: { dataIndex: "qrCode", width: 150 },
  Meter: { dataIndex: "meter", width: 150 },
  Part: { dataIndex: "part", width: 150 },
  Team: { dataIndex: "team", width: 150 },
  "Updated At": { dataIndex: "updatedAt", width: 150 },
  "Created At": { dataIndex: "createdAt", width: 150 },
};

export function AssetTable({
  assets,
  selectedAsset, // Yeh prop abhi use nahi ho raha, par rakha hai
  handleDeleteAsset,
  fetchAssetsData,
  setIsSettingsModalOpen,
  isSettingsModalOpen,
  onEdit,
  onDelete
}: {
  assets: any[];
  selectedAsset: any;
  handleDeleteAsset: (id: string) => Promise<void> | void;
  fetchAssetsData: () => void;
  setIsSettingsModalOpen: (isOpen: boolean) => void;
  isSettingsModalOpen: boolean;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string | number) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  const [assetDetailsModal, setAssetDetailsModal] = useState(false);
  const [updateAssetModal, setUpdateAssetModal] = useState(false);
  const [selectedStatusAsset, setSelectedStatusAsset] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCriticalityPopoverOpen, setIsCriticalityPopoverOpen] =
    useState(false);
  const [selectedCriticality, setSelectedCriticality] = useState("");
  const [includeSubAssets, setIncludeSubAssets] = useState(false);
  const [isUpdatingCriticality, setIsUpdatingCriticality] = useState(false);
  const [isOpenAssetDetailsMpdal, setIsOpenAssetDetailsModal] = useState(false);
  const [isSelectedAssetTable, setIsSelectedAssetTable] = useState<any[]>(
    []
  );
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [visibleColumns, setVisibleColumns] =
    useState<string[]>(allAvailableColumns);

  // ⭐ 3. Sorting State (ListView se)
  const [sortType, setSortType] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const StatusModal = UpdateAssetStatusModal as any;

  // ... (handleClickOutside useEffect... waisa hi hai)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isCriticalityPopoverOpen &&
        popoverRef.current &&
        triggerRef.current
      ) {
        if (
          !popoverRef.current.contains(event.target as Node) &&
          !triggerRef.current.contains(event.target as Node)
        ) {
          setIsCriticalityPopoverOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCriticalityPopoverOpen]);

  const renderInitials = (text: string) =>
    text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  // --- Selection Logic ---
  const allAssetIds = useMemo(() => assets.map((p) => p.id), [assets]);
  const selectedCount = selectedAssetIds.length;
  const isEditing = selectedCount > 0;
  const areAllSelected =
    allAssetIds.length > 0 && selectedCount === allAssetIds.length;
  const isIndeterminate = selectedCount > 0 && !areAllSelected;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate, isEditing]);

  const handleSelectAllToggle = () => {
    if (areAllSelected) setSelectedAssetIds([]);
    else setSelectedAssetIds(allAssetIds);
  };

  const toggleRowSelection = (id: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  // --- End Selection Logic ---

  // ⭐ 4. Table Change Handler (ListView se)
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
      // Agar sort order null hai (cycle complete), default par reset karein
      setSortType(s.field as string);
      setSortOrder("asc");
    } else {
      // Sorting clear ho gayi
      setSortType("name");
      setSortOrder("asc");
    }
  };

  // --- Delete, Status, Criticality Handlers (Aapke original code se) ---
  const handleDelete = async () => {
    if (selectedAssetIds.length === 0) {
      toast.error("No assets selected to delete.");
      return;
    }
    setIsDeleting(true);

    try {
      // Call your new function directly with the array of IDs
      await assetService.batchDeleteAsset(selectedAssetIds);
      toast.success("Assets deleted successfully!");
      setSelectedAssetIds([]);
      fetchAssetsData();
    } catch (err) {
      console.error("Error bulk deleting assets:", err);
      toast.error("Failed to delete assets.");
    } finally {
      // Always stop the loading spinner
      setIsDeleting(false);
    }
  };

  const handleStatusClick = (asset: any) => {
    setSelectedStatusAsset(asset);
    setUpdateAssetModal(true);
  };

  const handleManualDowntimeSubmit = async (updatedStatus: string) => {
    try {
      setIsSubmitting(true);
      await assetService.updateAssetStatus(
        selectedStatusAsset.id,
        updatedStatus
      );
      setUpdateAssetModal(false);
      fetchAssetsData();
    } catch (error) {
      console.error("Error updating asset status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyCriticalityChanges = async () => {
    if (!selectedCriticality || selectedAssetIds.length === 0) {
      alert("Please select a criticality level.");
      return;
    }
    setIsUpdatingCriticality(true);
    try {
      const payload = { criticality: selectedCriticality };
      // Note: Antd table data source se 'id' ko string mein badalna pad sakta hai
      await assetService.updateAsset(selectedAssetIds.join(","), payload);
      toast.success(
        `${selectedAssetIds.length} asset(s) updated successfully!`
      );
      fetchAssetsData();
      setSelectedAssetIds([]);
      setIsCriticalityPopoverOpen(false);
      setSelectedCriticality("");
      setIncludeSubAssets(false);
    } catch (error) {
      console.error("Failed to update criticality:", error);
      toast.error("Failed to update asset criticality.");
    } finally {
      setIsUpdatingCriticality(false);
    }
  };
  // --- End Handlers ---

  const handleApplySettings = (settings: {
    resultsPerPage: number;
    showDeleted: boolean;
    sortColumn: string;
    visibleColumns: string[];
  }) => {
    setVisibleColumns(settings.visibleColumns);
    setIsSettingsModalOpen(false);
  };

  // ⭐ 5. Columns Definition (`useMemo` mein)
  const columns: TableColumnType<any>[] = useMemo(() => {
    // --- Name Column (Fixed Left) ---
    const nameColumn: TableColumnType<any> = {
      title: () => {
        if (!isEditing) {
          // ⭐ BADLAAV 1: Yahaan se settings button hata diya gaya hai
          return (
            <div className="flex items-center justify-between gap-2 h-full">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  ref={headerCheckboxRef}
                  checked={areAllSelected}
                  onChange={handleSelectAllToggle}
                  className="h-4 w-4 accent-orange-600 cursor-pointer"
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
              className="h-4 w-4 accent-orange-600 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-900">
              Edit {selectedCount} {selectedCount === 1 ? "Item" : "Items"}
            </span>
            {/* Bulk Action Buttons */}
            <Tooltip text="Delete">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`flex items-center gap-1 transition ${
                  isDeleting
                    ? "text-orange-400 cursor-not-allowed"
                    : "text-orange-600 hover:text-red-700"
                }`}
              >
                {isDeleting ? <Loader /> : <Trash2 size={16} />}
              </button>
            </Tooltip>
            <Tooltip text="Edit Location">
              <button
                disabled={isDeleting}
                className={`flex items-center gap-1 transition ${
                  isDeleting
                    ? "text-orange-400 cursor-not-allowed"
                    : "text-orange-600 hover:text-red-700"
                }`}
              >
                <MapPin size={16} />
              </button>
            </Tooltip>
            <div className="relative">
              <Tooltip text="Edit Criticality">
                <button
                  ref={triggerRef}
                  onClick={() => setIsCriticalityPopoverOpen((prev) => !prev)}
                  disabled={isDeleting}
                  className={`flex items-center gap-1 mt-1 transition ${
                    isDeleting
                      ? "text-orange-400 cursor-not-allowed"
                      : "text-orange-600 hover:text-red-700"
                  }`}
                >
                  <MessageCircleWarning size={16} />
                </button>
              </Tooltip>

              {/* ⭐⭐ START: FIXED POPOVER CODE ⭐⭐ */}
              {isCriticalityPopoverOpen && (
                <div
                  ref={popoverRef}
                  className="absolute top-full left-0 z-50 w-48 p-4 mt-2 bg-card border border-border rounded-md shadow-lg"
                >
                  <div className="flex flex-col gap-4">
                    <h4 className="font-semibold text-sm text-foreground">
                      Edit Criticality
                    </h4>
                    <div className="grid gap-2 text-sm text-foreground">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="criticality"
                          value="low"
                          checked={selectedCriticality === "low"}
                          onChange={(e) =>
                            setSelectedCriticality(e.target.value)
                          }
                          className="accent-orange-600"
                        />
                        Low
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="criticality"
                          value="high"
                          checked={selectedCriticality === "high"}
                          onChange={(e) =>
                            setSelectedCriticality(e.target.value)
                          }
                          className="accent-orange-600"
                        />
                        High
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="criticality"
                          value="medium"
                          checked={selectedCriticality === "medium"}
                          onChange={(e) =>
                            setSelectedCriticality(e.target.value)
                          }
                          className="accent-orange-600"
                        />
                        Normal
                      </label>
                    </div>
                    <div className="border-t border-border -mx-4"></div>
                    <div className="flex items-start gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        id="sub-assets"
                        checked={includeSubAssets}
                        onChange={(e) => setIncludeSubAssets(e.target.checked)}
                        className="mt-1 cursor-pointer accent-orange-600"
                      />
                      <label htmlFor="sub-assets" className="cursor-pointer">
                        Edit Sub-Asset criticality as well
                      </label>
                    </div>
                    <button
                      onClick={handleApplyCriticalityChanges}
                      disabled={!selectedCriticality || isUpdatingCriticality}
                      className="w-full bg-orange-600 text-white px-3 py-1.5 text-sm rounded-md hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isUpdatingCriticality ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Apply Changes"
                      )}
                    </button>
                  </div>
                </div>
              )}
              {/* ⭐⭐ END: FIXED POPOVER CODE ⭐⭐ */}
            </div>
            <Tooltip text="Edit Status">
              <button
                disabled={isDeleting}
                className={`flex items-center gap-1 transition ${
                  isDeleting
                    ? "text-orange-400 cursor-not-allowed"
                    : "text-orange-600 hover:text-red-700"
                }`}
              >
                <CircleCheck size={16} />
              </button>
            </Tooltip>
          </div>
        );
      },
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 300,
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
      sortOrder: sortType === "name" ? mapAntSortOrder(sortOrder) : undefined,
      render: (name: string, record: any) => {
        const isSelected = selectedAssetIds.includes(record.id);
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
                  className="h-5 w-5 accent-orange-600 cursor-pointer"
                />
              ) : (
                <ShadCNAvatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback>
                    {record.icon || renderInitials(name)}
                  </AvatarFallback>
                </ShadCNAvatar>
              )}
            </div>
            <span
              className="truncate cursor-pointer hover:text-orange-600 hover:underline"
              onClick={(e) => {
                // Yahaan par aap asset detail view open kar sakte hain
                e.stopPropagation();
                console.log("Open details for:", record.name);
                // setSelectedAsset(record.fullAsset); // Jaise
                setIsSelectedAssetTable(record);
                setIsOpenAssetDetailsModal(true);
              }}
            >
              {name}
            </span>
          </div>
        );
      },
    };

    // --- Dynamic Columns (visibleColumns se) ---
    const dynamicColumns: TableColumnType<any>[] = visibleColumns
      .map((colName) => {
        const config = columnConfig[colName];
        if (!config) return null;

        // Custom render function
        let renderFunc:
          | ((value: any, record: any) => React.ReactNode)
          | undefined = undefined;

        if (colName === "Status") {
          renderFunc = (status: string, record: any) => (
            <span
              className="flex items-center gap-2 capitalize hover:text-orange-600 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusClick(record.fullAsset);
              }}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  status === "online"
                    ? "bg-green-500"
                    : status === "offline"
                    ? "bg-red-500"
                    : status === "doNotTrack"
                    ? "bg-yellow-500"
                    : "bg-gray-300"
                }`}
              ></span>
              {status ?? "—"}
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
          render: renderFunc, // Default render use karega agar undefined hai
        };
      })
      .filter(Boolean) as TableColumnType<any>[];

    return [nameColumn, ...dynamicColumns];
  }, [
    isEditing,
    sortType,
    sortOrder,
    selectedAssetIds,
    areAllSelected,
    selectedCount,
    visibleColumns, // ⭐ Yeh dependency zaroori hai
    isDeleting,
    isCriticalityPopoverOpen,
    selectedCriticality,
    isUpdatingCriticality,
  ]);

  const dataSource = useMemo(() => {
    return assets.map((item) => ({
      key: item.id,
      id: item.id || "—",
      name: item.name || "—",
      icon: item.icon, // Avatar ke liye
      status: item.status ?? "—",
      location: item.location?.name || "—",
      criticality: item.criticality || "—",
      manufacturer: item.manufacturer?.name || "—",
      type: item.assetTypes?.length
        ? `${item.assetTypes[0]?.name}${
            item.assetTypes.length > 1 ? ` +${item.assetTypes.length - 1}` : ""
          }`
        : "—",
      qrCode: (item.qrCode && item.qrCode?.split("/").pop()) || "—",
      meter: item.meters?.length
        ? `${item.meters[0]?.name}${
            item.meters.length > 1 ? ` +${item.meters.length - 1}` : ""
          }`
        : "—",
      part: item.parts?.length
        ? `${item.parts[0]?.name}${
            item.parts.length > 1 ? ` +${item.parts.length - 1}` : ""
          }`
        : "—",
      team: item.teams?.length
        ? `${item.teams[0]?.name}${
            item.teams.length > 1 ? ` +${item.teams.length - 1}` : ""
          }`
        : "—",
      createdAt: item.createdAt || "—",
      updatedAt: item.updatedAt || "—",
      fullAsset: item, // Status modal jaise actions ke liye original object
    }));
  }, [assets]);

  return (
    <div className="flex p-2 w-full h-full overflow-x-auto">
      <style>{tableStyles}</style>

      <Card className=" border rounded-lg overflow-hidden w-full">
        <CardContent className="p-0">
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={{ x: "content", y: "75vh" }} // 'x' ko dynamic rakha
            rowClassName={(record: any) =>
              selectedAssetIds.includes(record.id) ? "selected-row-class" : ""
            }
            // onChange={handleTableChange}
            rowSelection={{
              selectedRowKeys: selectedAssetIds,
              columnWidth: 0,
              renderCell: () => null,

              columnTitle: " ",
            }}
            onRow={(record) => ({
              onClick: () => {
                // Row click par select/deselect karein
                toggleRowSelection(record.id);
              },
            })}
          />
        </CardContent>
      </Card>

      {/* Status Modal (waisa hi hai) */}
      {updateAssetModal && selectedStatusAsset && (
        <StatusModal
          asset={selectedStatusAsset}
          initialStatus={selectedStatusAsset.status}
          onClose={() => setUpdateAssetModal(false)}
          isLoading={isSubmitting}
          onSubmit={handleManualDowntimeSubmit}
        />
      )}

      {/* Settings Modal (waisa hi hai) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onApply={handleApplySettings}
        allToggleableColumns={allAvailableColumns}
        currentVisibleColumns={visibleColumns}
        componentName="Asset"
        currentShowDeleted
      />

      {
        isOpenAssetDetailsMpdal && (
          <AssetTableModal asset={isSelectedAssetTable} onClose={() => setIsOpenAssetDetailsModal(false)} onDelete={onDelete}
                      onEdit={onEdit} />
        )
      }
    </div>
  );
}
