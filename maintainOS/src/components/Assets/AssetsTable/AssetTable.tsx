import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "../../ui/card";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Edit, Trash2 } from "lucide-react";
import { formatDateOnly } from "../../utils/Date";
import { UpdateAssetStatusModal } from "../AssetDetail/sections/AssetStatusReadings";
import { assetService } from "../../../store/assets";
import { Tooltip } from "../../ui/Tooltip";

export function AssetTable({
  assets,
  selectedAsset,
  handleDeleteAsset,
  fetchAssetsData,
}: {
  assets: any[];
  selectedAsset: any;
  handleDeleteAsset: (id: string) => Promise<void> | void;
  fetchAssetsData: () => void;
}) {
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const [updateAssetModal, setUpdateAssetModal] = useState(false);
  const [selectedStatusAsset, setSelectedStatusAsset] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Some modal components have differing prop types in our codebase; cast to any to avoid TS prop checks here
  const StatusModal = UpdateAssetStatusModal as any;

  const renderInitials = (text: string) =>
    text
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const toggleSelection = (id: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id)
        ? prev.filter((assetId) => assetId !== id)
        : [...prev, id]
    );
  };

  useEffect(() => {
    if (!headerCheckboxRef.current) return;
    const allSelected =
      assets.length > 0 &&
      assets.every((asset) => selectedAssetIds.includes(asset.id));
    const someSelected =
      assets.some((asset) => selectedAssetIds.includes(asset.id)) &&
      !allSelected;
    headerCheckboxRef.current.indeterminate = someSelected;
  }, [assets, selectedAssetIds]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = assets.map((a) => a.id);
      setSelectedAssetIds(allIds);
    } else {
      setSelectedAssetIds([]);
    }
  };

  const handleDelete = async () => {
    if (selectedAssetIds.length === 0) return;
    setIsDeleting(true);

    for (const id of selectedAssetIds) {
      try {
        await handleDeleteAsset(id);
      } catch (err) {
        console.error("Error deleting asset:", id, err);
      }
    }

    setIsDeleting(false);
    setSelectedAssetIds([]);
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

  const isAllSelected =
    assets.length > 0 &&
    assets.every((asset) => selectedAssetIds.includes(asset.id));

  return (
    <div className="flex p-2 w-full h-full overflow-x-auto">
      <Card className="overflow-x-auto shadow-sm">
        <CardContent className="p-0">
          {/* allow visible overflow so tooltips are not clipped by parents */}
          <div className="relative overflow-visible">
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-muted/60 border-b text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  {/* Sticky Checkbox Header */}
                  <th className="sticky left-0 z-30 bg-muted/60 w-12 px-4 py-3 text-left">
                    <input
                      ref={headerCheckboxRef}
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="cursor-pointer accent-orange-600"
                    />
                  </th>

                  {/* Sticky Name Header */}
                  <th className="sticky left-[48px] z-30 bg-muted/60 w-[20%] px-4 py-3 text-left overflow-visible">
                    {selectedAssetIds.length > 0 ? (
                      <div className="flex gap-4">
                        {/* Delete button */}
                        <div className="relative group inline-block">
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
                              <Trash2 size={16} />
                            </button>
                          </Tooltip>
                        </div>

                        {/* Edit button */}
                        <div className="relative group inline-block">
                          <Tooltip text="Edit">
                            <button
                              // disabled={isDeleting}
                              className={`flex items-center gap-1 transition ${
                                isDeleting
                                  ? "text-orange-400 cursor-not-allowed"
                                  : "text-orange-600 hover:text-red-700"
                              }`}
                            >
                              <Edit size={16} />
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    ) : (
                      "Name"
                    )}
                  </th>

                  {/* Scrollable headers */}
                  <th className="w-[12%] px-4 py-3 text-left">ID</th>
                  <th className="w-[16%] px-4 py-3 text-left">Status</th>
                  <th className="w-[14%] px-4 py-3 text-left">Location</th>
                  <th className="w-[12%] px-4 py-3 text-left">Criticality</th>
                  <th className="w-[12%] px-4 py-3 text-left">Manufacturer</th>
                  <th className="w-[12%] px-4 py-3 text-left">Type</th>
                  <th className="w-[12%] px-4 py-3 text-left">QrCode</th>
                  <th className="w-[12%] px-4 py-3 text-left">Meter</th>
                  <th className="w-[12%] px-4 py-3 text-left">Part</th>
                  <th className="w-[12%] px-4 py-3 text-left">Team</th>
                  <th className="w-[12%] px-4 py-3 text-left">Updated At</th>
                  <th className="w-[12%] px-4 py-3 text-left">Created At</th>
                </tr>
              </thead>

              <tbody>
                {assets.map((asset) => (
                  <tr
                    key={asset.id}
                    className={`border-b border-border transition hover:bg-muted/40 ${
                      asset.id === selectedAsset?.id ? "bg-primary/5" : ""
                    }`}
                  >
                    {/* Sticky Checkbox */}
                    <td
                      className={`sticky left-0 z-20 bg-card px-4 py-3 ${
                        asset.id === selectedAsset?.id ? "bg-primary/5" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAssetIds.includes(asset.id)}
                        onChange={() => toggleSelection(asset.id)}
                        className="cursor-pointer accent-orange-600"
                      />
                    </td>

                    {/* Sticky Name */}
                    <td
                      className={`sticky left-[48px] z-20 bg-card px-4 py-3 ${
                        asset.id === selectedAsset?.id ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {asset.icon || renderInitials(asset.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium whitespace-nowrap">
                          {asset.name || "-"}
                        </span>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {asset.id || "-"}
                    </td>

                    {/* ✅ Clickable Status */}
                    <td
                      onClick={() => handleStatusClick(asset)}
                      className="px-4 py-3 capitalize text-muted-foreground whitespace-nowrap cursor-pointer hover:text-orange-600 transition"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`h-1 w-2 rounded-full ${
                            asset.status === "online"
                              ? "bg-green-500"
                              : asset.status === "offline"
                              ? "bg-red-500"
                              : asset.status === "doNotTrack"
                              ? "bg-yellow-500"
                              : "bg-gray-300"
                          }`}
                        ></span>
                        {asset.status ?? "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {asset.location?.name || "-"}
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground whitespace-nowrap">
                      {asset.criticality || "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {asset.manufacturer?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {asset.assetTypes?.length
                        ? `${asset.assetTypes[0]?.name}${
                            asset.assetTypes.length > 1
                              ? ` +${asset.assetTypes.length - 1}`
                              : ""
                          }`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {(asset.qrCode && asset.qrCode?.split("/").pop()) || "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {asset.meters?.length
                        ? `${asset.meters[0]?.name}${
                            asset.meters.length > 1
                              ? ` +${asset.meters.length - 1}`
                              : ""
                          }`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {asset.parts?.length
                        ? `${asset.parts[0]?.name}${
                            asset.parts.length > 1
                              ? ` +${asset.parts.length - 1}`
                              : ""
                          }`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {asset.teams?.length
                        ? `${asset.teams[0]?.name}${
                            asset.teams.length > 1
                              ? ` +${asset.teams.length - 1}`
                              : ""
                          }`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDateOnly(asset.updatedAt) || "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDateOnly(asset.createdAt) || "-"}
                    </td>
                  </tr>
                ))}

                {assets.length === 0 && (
                  <tr>
                    <td
                      className="px-4 py-4 text-center text-muted-foreground"
                      colSpan={12}
                    >
                      No assets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ✅ Modal */}
      {updateAssetModal && selectedStatusAsset && (
        <StatusModal
          asset={selectedStatusAsset}
          initialStatus={selectedStatusAsset.status}
          onClose={() => setUpdateAssetModal(false)}
          isLoading={isSubmitting}
          onSubmit={handleManualDowntimeSubmit}
        />
      )}
    </div>
  );
}
