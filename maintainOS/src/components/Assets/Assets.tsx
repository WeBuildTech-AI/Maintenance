"use client";

import { useEffect, useState, FC, useMemo } from "react";
import { AssetDetail } from "./AssetDetail/AssetDetail";
import { AssetsList } from "./AssetsList/AssetsList";
import { NewAssetForm } from "./NewAssetForm/NewAssetForm";
import { AssetTable } from "./AssetsTable/AssetTable";
import { AssetHeaderComponent } from "./AssetsHeader/AssetsHeader";
import type { ViewMode } from "../purchase-orders/po.types";
import { assetService, deleteAsset } from "../../store/assets";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { locationService } from "../../store/locations";

export interface Asset {
  id: number | string;
  name: string;
  updatedAt: string;
  createdAt: string;
  location: {
    id: number | string;
    name: string;
  };
}

export const Assets: FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewAssetForm, setShowNewAssetForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [loading, setLoading] = useState(false);
  const [assetData, setAssetData] = useState<Asset[]>([]);
  const [sortType, setSortType] = useState("Name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [allLocationData, setAllLocationData] = useState<{ name: string }[]>(
    []
  );
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const fetchAssetsData = async () => {
    setLoading(true);
    try {
      const assets: Asset[] = await assetService.fetchAssets(10, 1, 0);
      setAssetData(assets);

      if (assets.length > 0) {
        const mostRecent = [...assets].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setSelectedAsset(mostRecent[0]);
      }
    } catch (err) {
      console.error("Failed to fetch assets:", err);
    } finally {
      setLoading(false);
    }
  };

  const FetchAllLocationApi = async () => {
    setLoading(true);
    try {
      const res = await locationService.fetchLocationsName();
      setAllLocationData(res || []);
      console.log("Fetched locations:", res);
    } catch (err) {
      console.error("Error fetching locations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetsData();
    FetchAllLocationApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditAsset = (assetToEdit: Asset) => {
    setEditingAsset(assetToEdit);
    setShowNewAssetForm(true);
  };

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

    if (!searchQuery) return processedAssets;

    const q = searchQuery.toLowerCase();
    return processedAssets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(q) ||
        asset.location?.name.toLowerCase().includes(q)
    );
  }, [assetData, sortType, sortOrder, searchQuery]);

  const handleDeleteAsset = (id: string | number) => {
    const currentIndex = assetData.findIndex((a) => a.id === id);

    if (window.confirm("Are you sure you want to delete this asset?")) {
      dispatch(deleteAsset(id))
        .unwrap()
        .then(() => {
          const newAssetList = assetData.filter((asset) => asset.id !== id);
          setAssetData(newAssetList);

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
        })
        .catch((error) => {
          console.error("Delete failed:", error);
          toast.error("Failed to delete the asset.");
        });
    }
  };

  return (
    <>
      <Toaster />
      <div className="flex h-full flex-col">
        {AssetHeaderComponent(
          viewMode,
          setViewMode,
          searchQuery,
          setSearchQuery,
          setShowNewAssetForm,
          setShowSettings,
          setSelectedAsset
        )}

        {viewMode === "table" ? (
          <AssetTable
            assets={sortedAndFilteredAssets}
            selectedAsset={selectedAsset}
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
                      // Edit Mode: Purane asset ko naye, merged data se replace karein
                      setAssetData((prevAssets) =>
                        prevAssets.map((asset) => {
                          if (asset.id === updatedOrNewAsset.id) {
                            // Yahan hum purane asset (...asset) aur API se aaye naye data
                            // (...updatedOrNewAsset) ko merge kar rahe hain.
                            // Isse 'createdAt' jaisi properties bani rehti hain.
                            return { ...asset, ...updatedOrNewAsset };
                          }
                          return asset;
                        })
                      );
                    } else {
                      // Create Mode: List ke shuru mein naya asset add karein
                      setAssetData((prevAssets) => [
                        updatedOrNewAsset as Asset,
                        ...prevAssets,
                      ]);
                    }

                    // Baaki logic same rahega
                    setSelectedAsset(updatedOrNewAsset);
                    setShowNewAssetForm(false);
                    setEditingAsset(null);
                  }}
                  onCancel={() => {
                    setShowNewAssetForm(false);
                    setEditingAsset(null);
                  }}
                  isEdit={!!editingAsset}
                  assetData={editingAsset}
                />
              ) : selectedAsset ? (
                <AssetDetail
                  asset={selectedAsset}
                  onDelete={handleDeleteAsset}
                  onEdit={handleEditAsset}
                  allLocationData={allLocationData}
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
      </div>
    </>
  );
};
