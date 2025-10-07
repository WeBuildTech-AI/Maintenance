import { useState } from "react";
import { DynamicSelect, type SelectOption } from "./DynamicSelect";

interface VendorLinkedItemsProps {
  availableLocations: SelectOption[];
  selectedLocationIds: string[];
  onLocationsChange: (ids: string[]) => void;
  onFetchLocations: () => void;
  locationsLoading: boolean;

  availableAssets: SelectOption[];
  selectedAssetIds: string[];
  onAssetsChange: (ids: string[]) => void;
  onFetchAssets: () => void;
  assetsLoading: boolean;

  availableParts: SelectOption[];
  selectedPartIds: string[];
  onPartsChange: (ids: string[]) => void;
  onFetchParts: () => void;
  partsLoading: boolean;

  onCtaClick: (path: string) => void;
}

export function VendorLinkedItems({
  availableLocations, selectedLocationIds, onLocationsChange, onFetchLocations, locationsLoading,
  availableAssets, selectedAssetIds, onAssetsChange, onFetchAssets, assetsLoading,
  availableParts, selectedPartIds, onPartsChange, onFetchParts, partsLoading,
  onCtaClick,
}: VendorLinkedItemsProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <div className="space-y-6 px-6">
      <h3 className="text-lg font-medium text-gray-900">Linked Items</h3>

      {/* Locations Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Locations</label>
        <DynamicSelect
          name="locations"
          placeholder="Select locations..."
          options={availableLocations}
          loading={locationsLoading}
          value={selectedLocationIds}
          onSelect={(val) => onLocationsChange(val as string[])}
          onFetch={onFetchLocations}
          ctaText="+ Create New Location"
          onCtaClick={() => onCtaClick('/locations/create')}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
        />
      </div>

      {/* Assets Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Assets</label>
        <DynamicSelect
          name="assets"
          placeholder="Select assets..."
          options={availableAssets}
          loading={assetsLoading}
          value={selectedAssetIds}
          onSelect={(val) => onAssetsChange(val as string[])}
          onFetch={onFetchAssets}
          ctaText="+ Create New Asset"
          onCtaClick={() => onCtaClick('/assets/create')}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
        />
      </div>

      {/* Parts Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Parts</label>
        <DynamicSelect
          name="parts"
          placeholder="Select parts..."
          options={availableParts}
          loading={partsLoading}
          value={selectedPartIds}
          onSelect={(val) => onPartsChange(val as string[])}
          onFetch={onFetchParts}
          ctaText="+ Create New Part"
          onCtaClick={() => onCtaClick('/parts/create')}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
        />
      </div>
    </div>
  );
}