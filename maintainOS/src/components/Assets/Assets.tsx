"use client";
import { useEffect, useState, FC, useMemo, useCallback } from "react";
import { AssetDetail } from "./AssetDetail/AssetDetail";
import { AssetsList } from "./AssetsList/AssetsList";
import { NewAssetForm } from "./NewAssetForm/NewAssetForm";
import { AssetTable } from "./AssetsTable/AssetTable";
import { AssetHeaderComponent } from "./AssetsHeader/AssetsHeader"; // Assuming this is a proper React component
import type { ViewMode } from "../purchase-orders/po.types";
import { assetService, deleteAsset } from "../../store/assets";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { locationService } from "../../store/locations"; // Used for fetching location data
import AssetStatusMoreDetails from "./AssetDetail/sections/AssetStatusMoreDetails";

// --- Asset Interface and Location Data Interface defined inside the file ---
export interface Location {
  id: number | string;
  name: string;
}

export interface Asset {
  id: number | string;
  name: string;
  updatedAt: string;
  createdAt: string;
  location: Location; // Changed to use the new Location interface
  meters: any[]; // Use a more specific type if possible, or keep as any[] for flexibility
}

// --- Component Start ---
export const Assets: FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [seeMoreAssetStatus, setSeeMoreAssetStatus] = useState(false);
  const [showNewAssetForm, setShowNewAssetForm] = useState(false);
  // const [showSettings, setShowSettings] = useState(false); // Unused, removed
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [loading, setLoading] = useState(false);
  const [assetData, setAssetData] = useState<Asset[]>([]);
  const [sortType, setSortType] = useState("Name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [allLocationData, setAllLocationData] = useState<Location[]>([]); // Changed type to Location[]
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  // Use useCallback for fetchAssetsData
  const fetchAssetsData = useCallback(async () => {
    setLoading(true);
    setSelectedAsset(null);

    try {
      // Assuming assetService.fetchAssets returns Asset[]
      const assets: Asset[] = await assetService.fetchAssets(10, 1, 0);

      if (assets && assets.length > 0) {
        setAssetData(assets);

        const mostRecent = [...assets].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setSelectedAsset(mostRecent[0]);
      } else {
        setAssetData([]);
        setSelectedAsset(null);
      }
    } catch (err) {
      console.error("Failed to fetch assets:", err);
      setAssetData([]);
      setSelectedAsset(null);
      toast.error("Failed to load assets."); // Added user-facing error toast
    } finally {
      setLoading(false);
    }
  }, []); // Dependencies are empty, runs once

  // Function to fetch location data
  const fetchAllLocationData = useCallback(async () => {
    try {
      // Assuming locationService.fetchLocations returns an array of Location objects
      const locations: Location[] = await locationService.fetchLocations();
      setAllLocationData(locations);
    } catch (err) {
      console.error("Failed to fetch locations:", err);
      // Optional: Add a toast notification for location fetch failure
    }
  }, []);

  useEffect(() => {
    fetchAssetsData();
    fetchAllLocationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAssetsData, fetchAllLocationData]); // Added dependencies to comply with hook rules

  // Use useCallback for handleEditAsset
  const handleEditAsset = useCallback((assetToEdit: Asset) => {
    setEditingAsset(assetToEdit);
    setShowNewAssetForm(true);
  }, []);

  const sortedAndFilteredAssets = useMemo(() => {
    let processedAssets = [...assetData];

    processedAssets.sort((a, b) => {
      let comparison = 0;
      switch (sortType) {
        case "Name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "Last Updated":
          comparison =
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          break;
        case "Creation Date":
          comparison =
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        default:
          break;
      }

      // Logic for sorting name (asc/desc) and dates (desc/asc)
      // For Name: asc is positive comparison, desc is negative.
      // For Dates: b - a gives descending (latest first) comparison.
      if (sortType === "Name") {
        return sortOrder === "asc" ? comparison : -comparison;
      }
      // For Date/Time: If sortOrder is 'desc' (latest first), the default comparison (b-a) is correct.
      return sortOrder === "desc" ? comparison : -comparison;
      // NOTE: The original logic for dates was: return sortOrder === "desc" ? comparison : -comparison;
      // This is generally correct for sorting dates where comparison is b.time - a.time (descending by default).
    });

    if (!searchQuery) return processedAssets;

    const q = searchQuery.toLowerCase();
    return processedAssets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(q) ||
        asset.location?.name.toLowerCase().includes(q)
    );
  }, [assetData, sortType, sortOrder, searchQuery]);

  // Use useCallback for handleDeleteAsset
  const handleDeleteAsset = useCallback(
    (id: string | number) => {
      const currentIndex = assetData.findIndex((a) => a.id === id);
      dispatch(deleteAsset(id))
        .unwrap()
        .then(() => {
          const newAssetList = assetData.filter((asset) => asset.id !== id);
          setAssetData(newAssetList);

          // Update selected asset after deletion
          if (newAssetList.length === 0) {
            setSelectedAsset(null);
          } else {
            const newIndexToSelect = Math.min(
              currentIndex,
              newAssetList.length - 1
            );
            setSelectedAsset(newAssetList[newIndexToSelect]);
          }

          toast.success("Asset deleted successfully!");
          // Removed redundant fetchAssetsData() here
        })
        .catch((error) => {
          console.error("Delete failed:", error);
          toast.error("Failed to delete the asset.");
        });
    },
    [assetData, dispatch]
  ); // Dependencies: assetData and dispatch

  return (
    <>
      <Toaster />
      <div className="flex h-full flex-col">
        {seeMoreAssetStatus === false ? (
          <>
            {/* 1. CORRECTED: Use AssetHeaderComponent as a JSX component */}
            {AssetHeaderComponent(
              viewMode,
              setViewMode,
              searchQuery,
              setSearchQuery,
              setShowNewAssetForm,
              setSelectedAsset,
              setIsSettingsModalOpen
            )}

            {viewMode === "table" ? (
              <AssetTable
                assets={sortedAndFilteredAssets}
                selectedAsset={selectedAsset}
                handleDeleteAsset={handleDeleteAsset}
                fetchAssetsData={fetchAssetsData}
                setIsSettingsModalOpen={setIsSettingsModalOpen}
                isSettingsModalOpen={isSettingsModalOpen}
                onDelete={handleDeleteAsset}
                onEdit={handleEditAsset}
              />
            ) : (
              <div className="flex flex-1 min-h-0">
                <AssetsList
                  assets={sortedAndFilteredAssets}
                  selectedAsset={selectedAsset}
                  setSelectedAsset={setSelectedAsset}
                  setShowNewAssetForm={setShowNewAssetForm}
                  loading={loading}
                  sortType={sortType}
                  setSortType={setSortType}
                  sortOrder={sortOrder}
                  setSortOrder={setSortOrder}
                  allLocationData={allLocationData}
                />
                <div className="flex-1 bg-card min-h-0 flex flex-col">
                  {showNewAssetForm ? (
                    <NewAssetForm
                      onCreate={(updatedOrNewAsset) => {
                        // Logic for handling asset creation/update
                        if (editingAsset) {
                          // Edit Mode: Replace old asset with new/merged data
                          setAssetData((prevAssets) =>
                            prevAssets.map((asset) => {
                              if (asset.id === updatedOrNewAsset.id) {
                                // Merge existing asset data with new data from the API response
                                return { ...asset, ...updatedOrNewAsset };
                              }
                              return asset;
                            })
                          );
                        } else {
                          // Create Mode: Add new asset to the beginning of the list
                          setAssetData((prevAssets) => [
                            updatedOrNewAsset as Asset,
                            ...prevAssets,
                          ]);
                        }

                        setSelectedAsset(updatedOrNewAsset as Asset);
                        setShowNewAssetForm(false);
                        setEditingAsset(null);
                      }}
                      onCancel={() => {
                        setShowNewAssetForm(false);
                        setEditingAsset(null);
                      }}
                      isEdit={!!editingAsset}
                      assetData={editingAsset}
                      fetchAssetsData={fetchAssetsData}
                    />
                  ) : selectedAsset ? (
                    <AssetDetail
                      asset={selectedAsset}
                      onDelete={handleDeleteAsset}
                      onEdit={handleEditAsset}
                      fetchAssetsData={fetchAssetsData}
                      setSeeMoreAssetStatus={setSeeMoreAssetStatus}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                          <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded border-dashed"></div>
                        </div>
                        <p className="text-muted-foreground mb-2">
                          Select an asset to view details
                        </p>
                        <p className="text-sm text-muted-foreground">
                          or create a new asset to get started
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {selectedAsset && ( // Ensure selectedAsset exists before rendering
              <AssetStatusMoreDetails
                setSeeMoreAssetStatus={setSeeMoreAssetStatus}
                asset={selectedAsset}
                fetchAssetsData={fetchAssetsData}
                setShowNewAssetForm={setShowNewAssetForm}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};
