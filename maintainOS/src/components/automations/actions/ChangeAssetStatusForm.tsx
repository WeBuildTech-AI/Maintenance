import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { DynamicSelect, type SelectOption } from "../../work-orders/NewWorkOrderForm/DynamicSelect";
import { fetchFilterData } from "../../utils/filterDataFetcher";

export interface ChangeAssetStatusActionData {
  assetId: string;
  status: string;
}

interface ChangeAssetStatusFormProps {
  onBack: () => void;
  onChange?: (data: ChangeAssetStatusActionData) => void;
  initialData?: ChangeAssetStatusActionData | null;
}

export function ChangeAssetStatusForm({ onBack, onChange, initialData }: ChangeAssetStatusFormProps) {
  const [selectedAssetId, setSelectedAssetId] = useState(initialData?.assetId || "{{asset.id}}"); 
  const [selectedStatus, setSelectedStatus] = useState(initialData?.status || "offline");

  // Dynamic dropdown state
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [assetOptions, setAssetOptions] = useState<SelectOption[]>([]);
  const [isAssetsLoading, setIsAssetsLoading] = useState(false);

  const statusOptions = [
    { value: "online", label: "Online" },
    { value: "offline", label: "Offline" },
    {value: "doNotTrack", label: "Do Not Track"}
  ];

  // Fetch assets
  const handleFetchAssets = async () => {
    try {
      setIsAssetsLoading(true);
      const { data } = await fetchFilterData("assets");
      const normalized = Array.isArray(data)
        ? data.map((d: any) => ({
            id: d.id,
            name: d.name || "Unknown Asset",
          }))
        : [];
      setAssetOptions(normalized);
    } catch (error) {
      console.error("Failed to fetch assets:", error);
    } finally {
      setIsAssetsLoading(false);
    }
  };

  // Notify parent of data changes
  useEffect(() => {
    if (onChange) {
      onChange({
        assetId: selectedAssetId,
        status: selectedStatus,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAssetId, selectedStatus]);

  return (
    <div className="border rounded-md shadow bg-white mb-6">
      {/* Header */}
      <div className="bg-blue-50 px-6 py-4 flex items-center justify-between rounded-t-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800 text-lg leading-none">
            ←
          </button>
          <h3 className="text-base font-semibold text-gray-900">Change Asset Status</h3>
        </div>
        <div className="flex items-center gap-10 pr-2">
          <button  onClick={onBack} className="text-red-600 hover:text-red-800">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Asset Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Asset <span className="text-red-500">(Required)</span>
          </label>
          <DynamicSelect
            name="change-status-asset"
            placeholder="Select asset"
            options={assetOptions}
            loading={isAssetsLoading}
            value={selectedAssetId}
            onSelect={(val) => setSelectedAssetId(typeof val === "string" ? val : val[0] || "")}
            onFetch={handleFetchAssets}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            New Status <span className="text-red-500">(Required)</span>
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
