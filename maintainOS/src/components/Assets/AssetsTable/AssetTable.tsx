import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "../../ui/card";
import { Avatar, AvatarFallback } from "../../ui/avatar";
// NEW: Import Loader2 for the loading spinner
import {
  CircleCheck,
  Edit,
  MapPin,
  MessageCircleWarning,
  Trash2,
  Loader2,
} from "lucide-react";
import { formatDateOnly } from "../../utils/Date";
import { UpdateAssetStatusModal } from "../AssetDetail/sections/AssetStatusReadings";
import { assetService } from "../../../store/assets";
import { Tooltip } from "../../ui/Tooltip";
import toast from "react-hot-toast";
// NEW: All 'Popover' and 'toast' imports have been removed.

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

  // NEW: State for the custom popover
  const [isCriticalityPopoverOpen, setIsCriticalityPopoverOpen] =
    useState(false);
  const [selectedCriticality, setSelectedCriticality] = useState("");
  const [includeSubAssets, setIncludeSubAssets] = useState(false);
  const [isUpdatingCriticality, setIsUpdatingCriticality] = useState(false);

  // NEW: Refs to detect outside clicks
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Some modal components have differing prop types in our codebase; cast to any to avoid TS prop checks here
  const StatusModal = UpdateAssetStatusModal as any;

  // NEW: Click-outside-to-close logic for the custom popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the popover is open
      if (
        isCriticalityPopoverOpen &&
        popoverRef.current &&
        triggerRef.current
      ) {
        // And the click is NOT inside the popover
        if (
          !popoverRef.current.contains(event.target as Node) &&
          // And the click is NOT on the trigger button
          !triggerRef.current.contains(event.target as Node)
        ) {
          setIsCriticalityPopoverOpen(false);
        }
      }
    };
    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);
    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCriticalityPopoverOpen]); // Only re-run if the popover's open state changes

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

  // NEW: Handler function to apply criticality changes (uses alert() instead of toast)
  const handleApplyCriticalityChanges = async () => {
    if (!selectedCriticality || selectedAssetIds.length === 0) {
      // Using alert() as a no-library notification
      alert("Please select a criticality level.");
      return;
    }

    setIsUpdatingCriticality(true);
    try {
      // --- API CALL ---
      // Replace this with your actual API call, e.g.,
      // await assetService.updateAssetsCriticality({ ... })
      console.log("Updating assets:", {
        ids: selectedAssetIds,
        criticality: selectedCriticality,
        includeSubAssets: includeSubAssets,
      });

      const payload = { criticality: selectedCriticality };

      // Simulating network delay
      await assetService.updateAsset(selectedAssetIds.toString(), payload);

      // Using alert() as a no-library notification
      toast.success(`${selectedAssetIds.length} asset(s) updated successfully!`);

      // Reset state and fetch new data
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

                  {/* Sticky Name Header with actions */}
                  <th className="sticky left-[48px] z-30 bg-muted/60 w-[20%] px-4 py-3 text-left overflow-visible">
                    {selectedAssetIds.length > 0 ? (
                      <div className="flex gap-4">
                        {/* Delete button */}
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

                        {/* Edit Location button */}
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

                        {/* NEW: Custom Criticality Popover */}
                        <div className="relative">
                          {" "}
                          {/* NEW: Wrapper for positioning */}
                          <Tooltip text="Edit Criticality">
                            <button
                              ref={triggerRef} // NEW: Assign ref to trigger button
                              onClick={() =>
                                setIsCriticalityPopoverOpen((prev) => !prev)
                              } // NEW: Toggle popover
                              disabled={isDeleting}
                              className={`flex items-center gap-1 transition ${
                                isDeleting
                                  ? "text-orange-400 cursor-not-allowed"
                                  : "text-orange-600 hover:text-red-700"
                              }`}
                            >
                              <MessageCircleWarning size={16} />
                            </button>
                          </Tooltip>
                          {/* NEW: Custom Popover Content */}
                          {isCriticalityPopoverOpen && (
                            <div
                              ref={popoverRef} // NEW: Assign ref to popover content
                              // NEW: Styling to make it look like the image.
                              className="absolute top-full left-0 z-50 w-48 p-4 mt-2 bg-card border border-border rounded-md shadow-lg"
                            >
                              <div className="flex flex-col gap-4">
                                <h4 className="font-semibold text-sm text-foreground">
                                  Edit Criticality
                                </h4>
                                <div className="grid gap-2 text-sm text-foreground">
                                  {" "}
                                  {/* NEW: Added text-foreground */}
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="low"
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
                                      name="high"
                                      value="high"
                                      checked={selectedCriticality === "high"}
                                      onChange={(e) =>
                                        setSelectedCriticality(e.target.value)
                                      }
                                      className="accent-orange-600"
                                    />
                                    high
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="medium"
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
                                  {" "}
                                  {/* NEW: Added text-foreground */}
                                  <input
                                    type="checkbox"
                                    id="sub-assets"
                                    checked={includeSubAssets}
                                    onChange={(e) =>
                                      setIncludeSubAssets(e.target.checked)
                                    }
                                    className="mt-1 cursor-pointer accent-orange-600"
                                  />
                                  <label
                                    htmlFor="sub-assets"
                                    className="cursor-pointer"
                                  >
                                    Edit Sub-Asset criticality as well
                                  </label>
                                </div>

                                <button
                                  onClick={handleApplyCriticalityChanges}
                                  disabled={
                                    !selectedCriticality ||
                                    isUpdatingCriticality
                                  }
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

                        {/* Edit Status button */}
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
                          className={`h-2 w-2 rounded-full ${
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
                      colSpan={14} // NEW: Updated colSpan to 14
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

      {/* ✅ Modal (This component is still here, unmodified) */}
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
