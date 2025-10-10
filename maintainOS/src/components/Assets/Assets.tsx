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

// Define a clear type for your Asset data
// IMPORTANT: Apne real data ke according is interface ko adjust karein.
export interface Asset {
  id: number | string;
  name: string;
  updatedAt: string; // ISO date string
  createdAt: string; // ISO date string (Added for sorting)
  location: {
    id: number | string;
    name: string;
  };
  // Add any other asset properties here
}

export const Assets: FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showNewAssetForm, setShowNewAssetForm] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [loading, setLoading] = useState<boolean>(false);
  const [assetData, setAssetData] = useState<Asset[]>([]);

  // 1. Sorting state is now managed here in the parent component
  const [sortType, setSortType] = useState<string>("Name");
  const [sortOrder, setSortOrder] = useState<string>("asc"); // 'asc' or 'desc'
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const fetchAssetsData = async () => {
    setLoading(true);
    try {
      const assets: Asset[] = await assetService.fetchAssets(10, 1, 0);
      setAssetData(assets);

      // Set initial selected asset without sorting here
      if (assets.length > 0) {
        // To maintain original behavior, find the most recently updated
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
  useEffect(() => {
    fetchAssetsData();
  }, []);

  // Function to handle editing an asset
  const handleEditAsset = (assetToEdit: Asset) => {
    setEditingAsset(assetToEdit); // Set the asset we want to edit
    setShowNewAssetForm(true); // Show the form
  };

  // 2. useMemo hook to efficiently sort and filter data
  const sortedAndFilteredAssets = useMemo(() => {
    // Start with a copy of the original data
    let processedAssets = [...assetData];

    // --- Sorting Logic ---
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
      // For 'Last Updated' and 'Creation Date', the default is newest first (desc)
      // so we only flip for 'asc'. For 'Name', the default is 'asc'.
      if (sortType === "Name") {
        return sortOrder === "asc" ? comparison : -comparison;
      }
      return sortOrder === "desc" ? comparison : -comparison;
    });

    // --- Filtering Logic ---

    if (!searchQuery) {
      return processedAssets;
    }

    const q = searchQuery.toLowerCase();
    return processedAssets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(q) ||
        // Use optional chaining (?.) to prevent crash if location is null
        asset.location?.name.toLowerCase().includes(q)
    );
  }, [assetData, sortType, sortOrder, searchQuery]);

  // In your Assets.tsx component

  const handleDeleteAsset = (id: string | number) => {
    // Find the index of the item to be deleted from the currently visible list
    const currentIndex = sortedAndFilteredAssets.findIndex((a) => a.id === id);

    if (window.confirm("Are you sure you want to delete this asset?")) {
      dispatch(deleteAsset(id))
        .unwrap()
        .then(() => {
          const newAssetList = assetData.filter((asset) => asset.id !== id);
          setAssetData(newAssetList);
          if (newAssetList.length === 0) {
            // If the list becomes empty, select null
            setSelectedAsset(null);
          } else {
            // Calculate the new index to select. This handles deleting the last item correctly.
            const newIndexToSelect = Math.min(
              currentIndex,
              newAssetList.length - 1
            );

            // We need to select from the sorted/filtered list to match what the user was seeing
            const newSortedList = sortedAndFilteredAssets.filter(
              (a) => a.id !== id
            );
            setSelectedAsset(newSortedList[newIndexToSelect]);
          }

          toast.success("Asset deleted successfully!");
        })
        .catch((error) => {
          console.error("Delete failed:", error);
          toast.error("Failed to delete the asset."); // Use toast.error for better UI
        });
    }
  };

  return (
    <>
      <div>
        <Toaster />
      </div>
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
          <>
            <div className="flex flex-1 min-h-0">
              <AssetsList
                assets={sortedAndFilteredAssets}
                selectedAsset={selectedAsset}
                setSelectedAsset={setSelectedAsset}
                setShowNewAssetForm={setShowNewAssetForm}
                loading={loading}
                // 3. Pass sorting state and setters to AssetsList
                sortType={sortType}
                setSortType={setSortType}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
              />
              <div className="flex-1 bg-card min-h-0 flex flex-col">
                {showNewAssetForm ? (
                  <NewAssetForm
                    onCreate={(newlyCreatedAsset) => {
                      // 1. State mein naye asset ko list ke shuru mein add karein
                      setAssetData((prevAssets) => [
                        newlyCreatedAsset,
                        ...prevAssets,
                      ]);

                      // 2. Naye asset ko select karein taaki uski details dikhein
                      setSelectedAsset(newlyCreatedAsset);

                      // 3. Form ko hide karein
                      setShowNewAssetForm(false);

                      // Edit state ko reset karna bhi zaroori hai
                      setEditingAsset(null);
                    }}
                    onCancel={() => setShowNewAssetForm(false)}
                    isEdit={!!editingAsset} // Converts object to boolean (true if editingAsset is not null)
                    assetData={editingAsset}
                  />
                ) : selectedAsset ? (
                  <AssetDetail
                    asset={selectedAsset}
                    onDelete={handleDeleteAsset}
                    onEdit={handleEditAsset}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
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
          </>
        )}
      </div>
    </>
  );
};
