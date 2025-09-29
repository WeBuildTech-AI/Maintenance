"use client";

import { useEffect, useState } from "react";
import { AssetDetail } from "./AssetDetail/AssetDetail";
import { AssetsList } from "./AssetsList/AssetsList";
import { mockAssets } from "./mockAssets";
import { NewAssetForm } from "./NewAssetForm/NewAssetForm"; // keep your existing form
import { AssetTable } from "./AssetsTable/AssetTable";
import { AssetHeaderComponent } from "./AssetsHeader/AssetsHeader";
import type { ViewMode } from "../purchase-orders/po.types";
import { assetService } from "../../store/assets";

export function Assets() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewAssetForm, setShowNewAssetForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<
    (typeof mockAssets)[0] | null
  >(null);
  const [viewMode, setViewMode] = useState<ViewMode>("panel");
  const [loading, setLoading] = useState(false);
  const [assetData, setAssetData] = useState([]);
  useEffect(() => {
    const fetchMeters = async () => {
      setLoading(true);
      try {
        const res = await assetService.fetchAssets(10, 1, 0);
        setAssetData(res);
        console.log(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeters();
  }, []);

  const filteredAssets = assetData.filter((asset) => {
    const q = searchQuery.toLowerCase();
    return (
      asset.name.toLowerCase().includes(q) ||
      (asset.locationId?.toLowerCase?.().includes(q) ?? false)
    );
  });

  return (
    <div className="flex h-full flex-col">
      {AssetHeaderComponent(
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        setShowNewAssetForm,
        setShowSettings
      )}

      {viewMode === "table" ? (
        <>
          <AssetTable assets={filteredAssets} selectedAsset={selectedAsset} />
        </>
      ) : (
        <>
          <div className="flex flex-1 min-h-0">
            <AssetsList
              assets={filteredAssets}
              selectedAsset={selectedAsset}
              setSelectedAsset={setSelectedAsset}
              setShowNewAssetForm={setShowNewAssetForm}
              loading={loading}
            />

            <div className="flex-1 bg-card min-h-0 flex flex-col">
              {showNewAssetForm ? (
                <>
                  <NewAssetForm
                    onCreate={() => {
                      // handle asset creation logic
                      setShowNewAssetForm(false);
                    }}
                    onCancel={() => setShowNewAssetForm(false)}
                  />
                </>
              ) : selectedAsset ? (
                <AssetDetail asset={selectedAsset} />
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
  );
}
