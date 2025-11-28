"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Card, CardContent } from "../../ui/card";
import { Avatar as ShadCNAvatar, AvatarFallback } from "../../ui/avatar";
import {
  CircleCheck,
  MapPin,
  MessageCircleWarning,
  Trash2,
  Loader2,
  Settings,
  ArchiveRestoreIcon,
} from "lucide-react";
import { formatDateOnly } from "../../utils/Date";
import { UpdateAssetStatusModal } from "../AssetDetail/sections/AssetStatusReadings";
import { assetService } from "../../../store/assets";
import { Tooltip } from "../../ui/tooltip";
import toast from "react-hot-toast";
import SettingsModal from "../../utils/SettingsModal";
import { Table } from "antd";
import type { TableProps, TableColumnType } from "antd";
import type { AppDispatch } from "../../../store";
import { useDispatch } from "react-redux";
import Loader from "../../Loader/Loader";
import AssetTableModal from "./AssetTableModal";

// Map sort order
const mapAntSortOrder = (order: "asc" | "desc"): "ascend" | "descend" =>
  order === "asc" ? "ascend" : "descend";

const tableStyles = `
  .selected-row-class > td {
    background-color: #ffe8d9 !important;
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
  Status: {
    dataIndex: "status",
    width: 150,
    sorter: (a, b) => (a.status || "").localeCompare(b.status || ""),
  },
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
  Type: {
    dataIndex: "type",
    width: 150,
    sorter: (a, b) => (a.type || "").localeCompare(b.type || ""),
  },
  QrCode: {
    dataIndex: "qrCode",
    width: 150,
    sorter: (a, b) => (a.qrCode || "").localeCompare(b.qrCode || ""),
  },
  Meter: {
    dataIndex: "meter",
    width: 150,
    sorter: (a, b) => (a.meter || "").localeCompare(b.meter || ""),
  },
  Part: {
    dataIndex: "part",
    width: 150,
    sorter: (a, b) => (a.part || "").localeCompare(b.part || ""),
  },
  Team: {
    dataIndex: "team",
    width: 150,
    sorter: (a, b) => (a.team || "").localeCompare(b.team || ""),
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

export function AssetTable({
  assets,
  selectedAsset,
  handleDeleteAsset,
  fetchAssetsData,
  setIsSettingsModalOpen,
  isSettingsModalOpen,
  onEdit,
  onDelete,
  showDeleted,
  setShowDeleted,
}: {
  assets: any[];
  selectedAsset: any;
  handleDeleteAsset: (id: string) => Promise<void> | void;
  fetchAssetsData: () => void;
  setIsSettingsModalOpen: (isOpen: boolean) => void;
  isSettingsModalOpen: boolean;
  onEdit: (asset: any) => void;
  onDelete: (id: string | number) => void;
  showDeleted: boolean;
  setShowDeleted: (value: boolean) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const [updateAssetModal, setUpdateAssetModal] = useState(false);
  const [selectedStatusAsset, setSelectedStatusAsset] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCriticalityPopoverOpen, setIsCriticalityPopoverOpen] =
    useState(false);
  const [selectedCriticality, setSelectedCriticality] = useState("");
  const [includeSubAssets, setIncludeSubAssets] = useState(false);
  const [isUpdatingCriticality, setIsUpdatingCriticality] = useState(false);

  const [isOpenAssetDetailsModal, setIsOpenAssetDetailsModal] = useState(false);
  const [isSelectedAssetTable, setIsSelectedAssetTable] = useState<any[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [showDetailsSection, setShowDetailsSection] = useState("asset");
  const [visibleColumns, setVisibleColumns] =
    useState<string[]>(allAvailableColumns);

  const [sortType, setSortType] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const StatusModal = UpdateAssetStatusModal as any;

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

  // ⭐ Handle Table Sort
  const handleTableChange: TableProps<any>["onChange"] = (_, __, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;

    if (s && s.field) {
      const field = s.field as string;

      if (s.order) {
        setSortType(field);
        setSortOrder(s.order === "ascend" ? "asc" : "desc");
      } else {
        setSortType("name");
        setSortOrder("asc");
      }
    } else {
      setSortType("name");
      setSortOrder("asc");
    }
  };

  const handleDelete = async () => {
    if (selectedAssetIds.length === 0) {
      toast.error("No assets selected to delete.");
      return;
    }
    setIsDeleting(true);

    try {
      await assetService.batchDeleteAsset(selectedAssetIds);
      toast.success("Assets deleted successfully!");
      setSelectedAssetIds([]);
      fetchAssetsData();
    } catch (err) {
      console.error("Error bulk deleting assets:", err);
      toast.error("Failed to delete assets.");
    } finally {
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
      await assetService.updateAsset(selectedAssetIds.join(","), payload);
      toast.success(`${selectedAssetIds.length} asset(s) updated!`);
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

  const columns: TableColumnType<any>[] = useMemo(() => {
    const nameColumn: TableColumnType<any> = {
      title: () => {
        if (!isEditing) {
          return (
            <div className="flex items-center gap-2 h-full">
              <input
                type="checkbox"
                ref={headerCheckboxRef}
                checked={areAllSelected}
                onChange={handleSelectAllToggle}
                className="h-4 w-4 accent-orange-600 cursor-pointer"
              />
              <span className="text-gray-600">Name</span>
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
              className="h-4 w-4 accent-orange-600 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-900">
              Edit {selectedCount} {selectedCount === 1 ? "Item" : "Items"}
            </span>

            {!showDeleted === true && (
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
            )}

            {/* <Tooltip text="Edit Criticality">
              <button
                ref={triggerRef}
                onClick={() =>
                  setIsCriticalityPopoverOpen((prev) => !prev)
                }
                disabled={isDeleting}
                className={`flex items-center gap-1 transition ${
                  isDeleting
                    ? "text-orange-400 cursor-not-allowed"
                    : "text-orange-600 hover:text-red-700"
                }`}
              >
                <MessageCircleWarning size={16} />
              </button>
            </Tooltip> */}

            {isCriticalityPopoverOpen && (
              <div
                ref={popoverRef}
                className="absolute top-full left-0 z-50 w-48 p-4 mt-2 bg-card border border-border rounded-md shadow-lg"
              >
                <div className="flex flex-col gap-4">
                  <h4 className="font-semibold text-sm">Edit Criticality</h4>

                  <div className="grid gap-2 text-sm">
                    {["low", "medium", "high"].map((c) => (
                      <label
                        key={c}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="criticality"
                          value={c}
                          checked={selectedCriticality === c}
                          onChange={(e) =>
                            setSelectedCriticality(e.target.value)
                          }
                          className="accent-orange-600"
                        />
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </label>
                    ))}
                  </div>

                  <div className="border-t"></div>

                  <div className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={includeSubAssets}
                      onChange={(e) => setIncludeSubAssets(e.target.checked)}
                      className="mt-1 accent-orange-600"
                    />
                    <span>Edit Sub-Asset criticality</span>
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
                e.stopPropagation();
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

    const dynamicColumns: TableColumnType<any>[] = visibleColumns
      .map((colName) => {
        const config = columnConfig[colName];
        if (!config) return null;

        let renderFunc:
          | ((value: any, record: any) => React.ReactNode)
          | undefined;

        if (colName === "ID") {
          renderFunc = (id: string) => (
            <Tooltip text={id}>
              <span>#{id.substring(0, 8)}...</span>
            </Tooltip>
          );
        } else if (colName === "Status") {
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
          render: renderFunc,
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
    visibleColumns,
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
      icon: item.icon,
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
      fullAsset: item,
    }));
  }, [assets]);

  return (
    <div className="flex p-2 w-full h-full overflow-x-auto">
      <style>{tableStyles}</style>

      <Card className="border rounded-lg overflow-hidden w-full">
        <CardContent className="p-0">
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={{ x: "content", y: "75vh" }}
            rowClassName={(record: any) =>
              selectedAssetIds.includes(record.id) ? "selected-row-class" : ""
            }
            onChange={handleTableChange}
            rowSelection={{
              selectedRowKeys: selectedAssetIds,
              columnWidth: 0,
              renderCell: () => null,
              columnTitle: " ",
            }}
            onRow={(record) => ({
              onClick: () => toggleRowSelection(record.id),
            })}
          />
        </CardContent>
      </Card>

      {updateAssetModal && selectedStatusAsset && (
        <StatusModal
          asset={selectedStatusAsset}
          initialStatus={selectedStatusAsset.status}
          onClose={() => setUpdateAssetModal(false)}
          isLoading={isSubmitting}
          onSubmit={handleManualDowntimeSubmit}
        />
      )}

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onApply={handleApplySettings}
        allToggleableColumns={allAvailableColumns}
        currentVisibleColumns={visibleColumns}
        componentName="Asset"
        currentShowDeleted={showDeleted}
      />

      {isOpenAssetDetailsModal && (
        <AssetTableModal
          data={isSelectedAssetTable.fullAsset}
          onClose={() => setIsOpenAssetDetailsModal(false)}
          onDelete={onDelete}
          onEdit={onEdit}
          showDetailsSection={showDetailsSection}
          restoreData={"Restore"}
          fetchData={fetchAssetsData}
        />
      )}
    </div>
  );
}
