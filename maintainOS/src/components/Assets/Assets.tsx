"use client";
import { useEffect, useState, FC, useMemo, useCallback } from "react";
import { AssetDetail } from "./AssetDetail/AssetDetail";
import { AssetsList } from "./AssetsList/AssetsList";
import { NewAssetForm } from "./NewAssetForm/NewAssetForm";
import { AssetTable } from "./AssetsTable/AssetTable";
import { AssetHeaderComponent } from "./AssetsHeader/AssetsHeader";
import type { ViewMode } from "../purchase-orders/po.types";
import { assetService, createAsset, deleteAsset } from "../../store/assets";
import {
  FetchAssetsParams,
  CreateAssetData,
} from "../../store/assets/assets.types";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { locationService } from "../../store/locations";
import AssetStatusMoreDetails from "./AssetDetail/sections/AssetStatusMoreDetails";
import { useSearchParams } from "react-router-dom";

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
  [key: string]: any;
}

export const Assets: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // --- 1. Init State from URL ---
  const [filterParams, setFilterParams] = useState<FetchAssetsParams>(() => {
    const initialParams: any = {
      page: Number(searchParams.get("page")) || 1,
      limit: 50,
    };
    searchParams.forEach((value, key) => {
      if (["page", "limit", "search", "assetId", "moreDetails"].includes(key))
        return;

      if (value.includes(",")) {
        initialParams[key] = value.split(",");
      } else {
        initialParams[key] = value;
      }
    });
    return initialParams;
  });

  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("search") || ""
  );
  const [debouncedSearch, setDebouncedSearch] = useState(
    () => searchParams.get("search") || ""
  );
  const [seeMoreAssetStatus, setSeeMoreAssetStatus] = useState(
    () => searchParams.get("moreDetails") === "true"
  );

  const [showNewAssetForm, setShowNewAssetForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(
    () => (localStorage.getItem("assetViewMode") as ViewMode) || "panel"
  );

  const [loading, setLoading] = useState(false);
  const [assetData, setAssetData] = useState<Asset[]>([]);
  const [sortType, setSortType] = useState("Name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [allLocationData, setAllLocationData] = useState<Location[]>([]);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const paramAssetId = searchParams.get("assetId");

  // --- 2. Sync State -> URL ---
  useEffect(() => {
    const params: any = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (seeMoreAssetStatus) params.moreDetails = "true";
    if (selectedAsset?.id) params.assetId = selectedAsset.id;
    if (filterParams.page && filterParams.page > 1)
      params.page = filterParams.page.toString();

    Object.keys(filterParams).forEach((key) => {
      const value = filterParams[key as keyof FetchAssetsParams];
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value) && value.length > 0) {
          params[key] = value.join(",");
        } else if (!Array.isArray(value)) {
          params[key] = String(value);
        }
      }
    });

    setSearchParams(params, { replace: true });
  }, [
    debouncedSearch,
    seeMoreAssetStatus,
    selectedAsset?.id,
    filterParams,
    setSearchParams,
  ]);

  // --- 3. Debounce Search ---
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- 4. Fetch Assets ---

  const fetchAssetsData = useCallback(async () => {
    setLoading(true);

    try {
      let assets: any;

      // 1. Fetch Logic
      if (showDeleted) {
        assets = await assetService.fetchDeleteAsset();
      } else {
        const apiPayload = {
          ...filterParams,
          name: debouncedSearch || undefined,
        };
        assets = await assetService.fetchAssets(apiPayload);
      }

      // 2. Selection Logic
      if (assets && assets.length > 0) {
        setAssetData(assets);

        const urlAssetId = searchParams.get("assetId");

        // Case A: URL mein ID hai (Direct link ya refresh)
        if (urlAssetId) {
          const found = assets.find((a) => String(a.id) === String(urlAssetId));
          if (found) {
            setSelectedAsset(found);
          } else {
            // ID invalid hai toh default recent asset lo
            const mostRecent = [...assets].sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            );
            setSelectedAsset(mostRecent[0]);
          }
        }
        // Case B: URL mein ID nahi hai
        else {
          // ✅ CRITICAL FIX: Agar pehle se koi asset selected hai (memory mein), toh usse mat chhedo.
          // Ye tab kaam aayega jab aap Table se wapis Panel mein aaoge.
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
  }, [showDeleted, filterParams, debouncedSearch]);

  // --- 5. Selection Logic ---
  useEffect(() => {
    if (!assetData || assetData.length === 0) return;
    if (paramAssetId) {
      const found = assetData.find(
        (a: any) => String(a.id) === String(paramAssetId)
      );
      if (found && found.id !== selectedAsset?.id) setSelectedAsset(found);
    } else {
      if (!selectedAsset) {
        const mostRecent = [...assetData].sort(
          (a: any, b: any) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setSelectedAsset(mostRecent[0]);
      }
    }
  }, [assetData, paramAssetId]);

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

  // --- Filter Handler ---
  const handleFilterChange = useCallback(
    (newParams: Partial<FetchAssetsParams>) => {
      const sanitized: any = {};

      Object.keys(newParams).forEach((key) => {
        const value = newParams[key as keyof FetchAssetsParams];

        if (value === undefined || value === null || value === "") {
          sanitized[key] = undefined;
          return;
        }

        if (typeof value === "object" && !Array.isArray(value)) {
          if ("id" in (value as any)) sanitized[key] = (value as any).id;
          else if ("name" in (value as any))
            sanitized[key] = (value as any).name;
          else sanitized[key] = String(value);
        } else if (Array.isArray(value)) {
          if (
            value.length > 0 &&
            typeof value[0] === "object" &&
            "id" in value[0]
          ) {
            sanitized[key] = value.map((v: any) => v.id);
          } else {
            sanitized[key] = value;
          }
        } else {
          sanitized[key] = value;
        }
      });

      setFilterParams((prev) => {
        const merged = { ...prev, ...sanitized, page: 1 };
        Object.keys(sanitized).forEach((k) => {
          if (sanitized[k] === undefined)
            delete merged[k as keyof FetchAssetsParams];
        });
        if (JSON.stringify(prev) === JSON.stringify(merged)) return prev;
        return merged;
      });
    },
    []
  );

  // --- HANDLE COPY ASSET ---
  const handleCopyAsset = useCallback(
    async (asset: any) => {
      const loadingToast = toast.loading("Creating copy...");
      try {
        const payload: CreateAssetData = {
          year: asset.year,
          name: `Copy - ${asset.name}`,
          description: asset.description,
          status: asset.status,
          locationId: asset.location?.id || asset.locationId,
          criticality: asset.criticality,
          pictures: asset.pictures || [],
          files: asset.files || [],
          // Fixed: Changed manufacturer to manufacturerId
          manufacturerId:
            typeof asset.manufacturer === "object"
              ? asset.manufacturer?.id
              : asset.manufacturer,
          model: asset.model,
          serialNumber: asset.serialNumber,
        };

        await dispatch(createAsset(payload)).unwrap();
        toast.success("Asset copied successfully", { id: loadingToast });
        fetchAssetsData();
      } catch (error) {
        console.error(error);
        toast.error("Failed to copy asset", { id: loadingToast });
      }
    },
    [dispatch, fetchAssetsData]
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
      }
      return sortType === "Name"
        ? sortOrder === "asc"
          ? comparison
          : -comparison
        : sortOrder === "desc"
        ? comparison
        : -comparison;
    });
    return processedAssets;
  }, [assetData, sortType, sortOrder]);

  const totalItems = sortedAndFilteredAssets.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedAssets = sortedAndFilteredAssets.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortType, sortOrder, debouncedSearch, filterParams]);

  const handleDeleteAsset = useCallback(
    (id: string | number) => {
      const currentIndex = assetData.findIndex((a) => a.id === id);
      dispatch(deleteAsset(id))
        .unwrap()
        .then(() => {
          const newAssetList = assetData.filter((asset) => asset.id !== id);
          setAssetData(newAssetList);
          if (newAssetList.length === 0) setSelectedAsset(null);
          else {
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
                onCopy={handleCopyAsset}
                showDeleted={showDeleted}
                setShowDeleted={setShowDeleted}
                setSeeMoreAssetStatus={setSeeMoreAssetStatus}
              />
            ) : (
              <div className="flex flex-1 min-h-0">
                <AssetsList
                  assets={paginatedAssets}
                  selectedAsset={selectedAsset}
                  setSelectedAsset={setSelectedAsset}
                  setShowNewAssetForm={setShowNewAssetForm}
                  loading={loading}
                  sortType={sortType}
                  setSortType={setSortType}
                  sortOrder={sortOrder}
                  setSortOrder={setSortOrder}
                  allLocationData={allLocationData}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  totalItems={totalItems}
                />
                <div className="flex-1 bg-card min-h-0 flex flex-col">
                  {showNewAssetForm ? (
                    <NewAssetForm
                      onCreate={(updatedOrNewAsset) => {
                        if (editingAsset) {
                          setAssetData((prevAssets) =>
                            prevAssets.map((asset) =>
                              asset.id === updatedOrNewAsset.id
                                ? { ...asset, ...updatedOrNewAsset }
                                : asset
                            )
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
                      onCopy={handleCopyAsset}
                      fetchAssetsData={fetchAssetsData}
                      setSeeMoreAssetStatus={setSeeMoreAssetStatus}
                      onClose={() => setSelectedAsset(null)}
                      restoreData=""
                      showDeleted={showDeleted}
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
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <AssetStatusMoreDetails
            setSeeMoreAssetStatus={setSeeMoreAssetStatus}
            asset={selectedAsset!}
            fetchAssetsData={fetchAssetsData}
            setShowNewAssetForm={setShowNewAssetForm}
          />
        )}
      </div>
    </>
  );
};
