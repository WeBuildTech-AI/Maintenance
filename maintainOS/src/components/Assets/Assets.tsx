"use client";
import { useEffect, useState, FC, useMemo, useCallback } from "react";
import { AssetDetail } from "./AssetDetail/AssetDetail";
import { AssetsList } from "./AssetsList/AssetsList";
import { NewAssetForm } from "./NewAssetForm/NewAssetForm";
import { AssetTable } from "./AssetsTable/AssetTable";
import { AssetHeaderComponent } from "./AssetsHeader/AssetsHeader";
import type { ViewMode } from "../purchase-orders/po.types";
import { assetService, deleteAsset } from "../../store/assets";
import { FetchAssetsParams } from "../../store/assets/assets.types";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { locationService } from "../../store/locations";
import AssetStatusMoreDetails from "./AssetDetail/sections/AssetStatusMoreDetails";
// ✅ Import useSearchParams
import { useSearchParams } from "react-router-dom";

// --- Interfaces (Same as provided) ---
export interface Location {
  id: number | string;
  name: string;
}

export interface Asset {
  id: number | string;
  name: string;
  updatedAt: string;
  createdAt: string;
  location: Location;
  meters: any[];
}

// --- Component Start ---
export const Assets: FC = () => {
  // ✅ 1. URL Search Params Setup
  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ 2. Initialize State from URL
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("search") || ""
  );
  const [debouncedSearch, setDebouncedSearch] = useState(
    () => searchParams.get("search") || ""
  );

  const [seeMoreAssetStatus, setSeeMoreAssetStatus] = useState(() => {
    return searchParams.get("moreDetails") === "true";
  });

  const [showNewAssetForm, setShowNewAssetForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (searchParams.get("viewMode") as ViewMode) || "panel";
  });

  const [loading, setLoading] = useState(false);
  const [assetData, setAssetData] = useState<Asset[]>([]);
  const [sortType, setSortType] = useState("Name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [allLocationData, setAllLocationData] = useState<Location[]>([]);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  // ✅ FILTER PARAMETERS STATE (Page from URL)
  const [filterParams, setFilterParams] = useState<FetchAssetsParams>({
    page: Number(searchParams.get("page")) || 1,
    limit: 50,
  });

  // ✅ 3. Sync State TO URL (Effect to update URL when state changes)
  useEffect(() => {
    const params: any = {};

    if (debouncedSearch) params.search = debouncedSearch;
    // if (viewMode) params.viewMode = viewMode;
    if (seeMoreAssetStatus) params.moreDetails = "true";
    // Check if filterParams.page is greater than 1, usually we only put it in URL if not default
    if (filterParams.page > 1) params.page = filterParams.page.toString();

    // Most important: Set the Asset ID
    if (selectedAsset?.id) params.assetId = selectedAsset.id;

    // Update URL (replace: true prevents massive history stack)
    setSearchParams(params, { replace: true });
  }, [
    debouncedSearch,
    viewMode,
    seeMoreAssetStatus,
    selectedAsset?.id,
    filterParams.page,
  ]);

  // ✅ DEBOUNCE EFFECT
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchAssetsData = useCallback(async () => {
    setLoading(true);
    // Removed setSelectedAsset(null) to allow persistence logic to work

    try {
      let assets: any;

      if (showDeleted && viewMode === "table") {
        assets = await assetService.fetchDeleteAsset();
      } else {
        const apiPayload = {
          ...filterParams,
          name: debouncedSearch || undefined,
        };
        assets = await assetService.fetchAssets(apiPayload);
      }

      if (assets && assets.length > 0) {
        setAssetData(assets);

        // ✅ URL SELECTION LOGIC
        const urlAssetId = searchParams.get("assetId");

        if (urlAssetId) {
          // 1. Try to find the asset from the URL
          const found = assets.find((a) => String(a.id) === String(urlAssetId));
          if (found) {
            setSelectedAsset(found);
          } else {
            // If URL ID is invalid/not found, fallback to most recent
            const mostRecent = [...assets].sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            );
            setSelectedAsset(mostRecent[0]);
          }
        } else {
          // 2. If no URL ID and no currently selected asset, select most recent
          if (!selectedAsset) {
            const mostRecent = [...assets].sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            );
            setSelectedAsset(mostRecent[0]);
          }
        }
      } else {
        setAssetData([]);
        setSelectedAsset(null);
      }
    } catch (err) {
      console.error("Failed to fetch assets:", err);
      setAssetData([]);
      setSelectedAsset(null);
      toast.error("Failed to load assets.");
    } finally {
      setLoading(false);
    }
  }, [showDeleted, viewMode, filterParams, debouncedSearch]); // Note: removed searchParams from dependency to avoid loop, it reads strictly inside

  const fetchAllLocationData = useCallback(async () => {
    try {
      const locations: Location[] = await locationService.fetchLocations();
      setAllLocationData(locations);
    } catch (err) {
      console.error("Failed to fetch locations:", err);
    }
  }, []);

  useEffect(() => {
    fetchAssetsData();
    fetchAllLocationData();
  }, [fetchAssetsData, fetchAllLocationData]);

  // ✅ HANDLER: Filter Change
  const handleFilterChange = useCallback(
    (newParams: Partial<FetchAssetsParams>) => {
      setFilterParams((prev) => {
        const merged = { ...prev, ...newParams };
        if (JSON.stringify(prev) === JSON.stringify(merged)) return prev;
        return merged;
      });
    },
    []
  );

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
      if (sortType === "Name") {
        return sortOrder === "asc" ? comparison : -comparison;
      }
      return sortOrder === "desc" ? comparison : -comparison;
    });

    return processedAssets;
  }, [assetData, sortType, sortOrder]);

  const handleDeleteAsset = useCallback(
    (id: string | number) => {
      const currentIndex = assetData.findIndex((a) => a.id === id);
      dispatch(deleteAsset(id))
        .unwrap()
        .then(() => {
          const newAssetList = assetData.filter((asset) => asset.id !== id);
          setAssetData(newAssetList);
          if (newAssetList.length === 0) {
            setSelectedAsset(null);
          } else {
            // Logic to select next available item
            const newIndexToSelect = Math.min(
              currentIndex,
              newAssetList.length - 1
            );
            setSelectedAsset(newAssetList[newIndexToSelect]);
          }
          toast.success("Asset deleted successfully!");
        })
        .catch((error) => {
          console.error("Delete failed:", error);
          toast.error("Failed to delete the asset.");
        });
    },
    [assetData, dispatch]
  );

  return (
    <>
      <Toaster />
      <div className="flex h-full flex-col">
        {seeMoreAssetStatus === false ? (
          <>
            <AssetHeaderComponent
              viewMode={viewMode}
              setViewMode={setViewMode}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setShowNewAssetForm={setShowNewAssetForm}
              setSelectedAsset={setSelectedAsset}
              setIsSettingsModalOpen={setIsSettingsModalOpen}
              setShowDeleted={setShowDeleted}
              onFilterChange={handleFilterChange}
            />

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
                showDeleted={showDeleted}
                setShowDeleted={setShowDeleted}
                setSeeMoreAssetStatus={setSeeMoreAssetStatus}
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
                        if (editingAsset) {
                          setAssetData((prevAssets) =>
                            prevAssets.map((asset) => {
                              if (asset.id === updatedOrNewAsset.id) {
                                return { ...asset, ...updatedOrNewAsset };
                              }
                              return asset;
                            })
                          );
                        } else {
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
            {selectedAsset && (
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
