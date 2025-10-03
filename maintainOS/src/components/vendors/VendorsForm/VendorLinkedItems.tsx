import { useState } from "react";
import { DynamicSelect, type SelectOption } from "./DynamicSelect";

interface VendorLinkedItemsProps {
  availableLocations: SelectOption[];
  selectedLocationIds: string[];
  onLocationsChange: (selected: string[]) => void;
  onFetchLocations: () => void;
  locationsLoading: boolean;
  
  availableAssets: SelectOption[];
  selectedAssetIds: string[];
  onAssetsChange: (selected: string[]) => void;
  onFetchAssets: () => void;
  assetsLoading: boolean;

  availableParts: SelectOption[];
  selectedPartIds: string[];
  onPartsChange: (selected: string[]) => void;
  onFetchParts: () => void;
  partsLoading: boolean;

  onCtaClick: (path: string) => void;
}

export function VendorLinkedItems({
  availableLocations,
  selectedLocationIds,
  onLocationsChange,
  onFetchLocations,
  locationsLoading,
  availableAssets,
  selectedAssetIds,
  onAssetsChange,
  onFetchAssets,
  assetsLoading,
  availableParts,
  selectedPartIds,
  onPartsChange,
  onFetchParts,
  partsLoading,
  onCtaClick
}: VendorLinkedItemsProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <div className="space-y-6 px-6 pb-8">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Location</label>
        <DynamicSelect
          options={availableLocations}
          value={selectedLocationIds}
          onSelect={onLocationsChange}
          onFetch={onFetchLocations}
          loading={locationsLoading}
          placeholder="Select locations..."
          ctaText="+ Create New Location"
          onCtaClick={() => onCtaClick('/locations')}
          name="locations"
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Assets</label>
        <DynamicSelect
          options={availableAssets}
          value={selectedAssetIds}
          onSelect={onAssetsChange}
          onFetch={onFetchAssets}
          loading={assetsLoading}
          placeholder="Select assets..."
          ctaText="+ Create New Asset"
          onCtaClick={() => onCtaClick('/assets')}
          name="assets"
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Parts</label>
        <DynamicSelect
          options={availableParts}
          value={selectedPartIds}
          onSelect={onPartsChange}
          onFetch={onFetchParts}
          loading={partsLoading}
          placeholder="Select parts..."
          ctaText="+ Create New Part"
          onCtaClick={() => onCtaClick('/parts')}
          name="parts"
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
        />
      </div>
    </div>
  );
}