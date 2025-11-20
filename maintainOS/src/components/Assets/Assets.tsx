"use client";
import { useEffect, useState, FC, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; 
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
import AssetStatusMoreDetails from "./AssetDetail/sections/AssetStatusMoreDetails";

export interface Asset {
  id: number | string;
  name: string;
  updatedAt: string;
  createdAt: string;
  location: {
    id: number | string;
    name: string;
  };
  meters: [];
}

// ⚠️ Helper function to extract the Asset ID from the custom URL format
const getAssetIdFromUrl = (searchString: string): string | null => {
    if (searchString && searchString.startsWith('?')) {
        // Remove the leading '?' and return the rest (which is the ID)
        const id = searchString.substring(1);
        return id.trim() || null; // Return null if it's just '?' or '?? '
    }
    return null;
};


export const Assets: FC = () => {
  const navigate = useNavigate();
  // useSearchParams is still needed to track URL changes
  const [searchParams, setSearchParams] = useSearchParams(); 

  const [searchQuery, setSearchQuery] = useState("");
  const [seeMoreAssetStatus, setSeeMoreAssetStatus] = useState(false);
  const [showNewAssetForm, setShowNewAssetForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [loading, setLoading] = useState(false);
  const [assetData, setAssetData] = useState<Asset[]>([]);
  const [sortType, setSortType] = useState("Name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [allLocationData, setAllLocationData] = useState<{ name: string }[]>([]);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  // Handler function to update the URL and state
  const handleAssetSelect = (asset: Asset | null) => {
    const currentPath = window.location.pathname;
    
    if (!asset) {
        // Clear the search part of the URL
        navigate(currentPath, { replace: true });
        setSelectedAsset(null);
        return;
    }

    // Set the asset ID directly as the search string
    const assetId = asset.id.toString();
    navigate(`${currentPath}?${assetId}`, { replace: true }); 
    
    // Update the local state for immediate UI response
    setSelectedAsset(asset);
  };

  // Effect to Sync URL -> State (Key for handling refresh/copy-paste)
  useEffect(() => {
    // Get the raw search string from the URL
    const assetIdFromUrl = getAssetIdFromUrl(window.location.search);

    if (assetData.length > 0) {
      if (assetIdFromUrl) {
        const foundAsset = assetData.find(
          (a) => a.id.toString() === assetIdFromUrl
        );
        
        // Only update if the asset is found and is different from current selection
        if (foundAsset && foundAsset.id !== selectedAsset?.id) {
          setSelectedAsset(foundAsset);
        } else if (!foundAsset && selectedAsset) {
          // If ID in URL is bad/not found, clear selection (and URL)
          handleAssetSelect(null); 
        }
      } else if (selectedAsset) {
        // If URL has no ID, but state does, clear state
        setSelectedAsset(null);
      }
    }
  }, [window.location.search, assetData, selectedAsset]); 


  const fetchAssetsData = async () => {
    setLoading(true);
    
    try {
      const assets: Asset[] = await assetService.fetchAssets(10, 1, 0);

      if (assets && assets.length > 0) {
        setAssetData(assets);

        // 5. Initial Selection Logic (Only if no custom ID in URL on first load)
        const assetIdFromUrl = getAssetIdFromUrl(window.location.search);
        
        if (!assetIdFromUrl) {
          // Auto-select the most recent asset
          const mostRecent = [...assets].sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          // Update URL/state using the handler
          handleAssetSelect(mostRecent[0]); 
        }
        // If assetIdFromUrl exists, the dedicated useEffect above will handle selecting it 
        // once assetData is set.
      } else {
        setAssetData([]);
        handleAssetSelect(null); 
      }
    } catch (err) {
      console.error("Failed to fetch assets:", err);
      setAssetData([]);
      handleAssetSelect(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetsData();
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
    dispatch(deleteAsset(id))
      .unwrap()
      .then(() => {
        const newAssetList = assetData.filter((asset) => asset.id !== id);
        setAssetData(newAssetList);

        if (newAssetList.length === 0) {
          handleAssetSelect(null);
        } else {
          const newIndexToSelect = Math.min(
            currentIndex,
            newAssetList.length - 1
          );
          handleAssetSelect(newAssetList[newIndexToSelect]);
        }

        toast.success("Asset deleted successfully!");
        fetchAssetsData();
      })
      .catch((error) => {
        console.error("Delete failed:", error);
        toast.error("Failed to delete the asset.");
      });
  };

  return (
    <>
      <Toaster />
      <div className="flex h-full flex-col">
        {seeMoreAssetStatus === false ? (
          <>
            {AssetHeaderComponent(
              viewMode,
              setViewMode,
              searchQuery,
              setSearchQuery,
              setShowNewAssetForm,
              setShowSettings,
              handleAssetSelect, 
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
                  setSelectedAsset={handleAssetSelect} 
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

                        handleAssetSelect(updatedOrNewAsset as Asset); 
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
            <AssetStatusMoreDetails
              setSeeMoreAssetStatus={setSeeMoreAssetStatus}
              asset={selectedAsset}
              fetchAssetsData={fetchAssetsData}
              setShowNewAssetForm={setShowNewAssetForm}
            />
          </>
        )}
      </div>
    </>
  );
};