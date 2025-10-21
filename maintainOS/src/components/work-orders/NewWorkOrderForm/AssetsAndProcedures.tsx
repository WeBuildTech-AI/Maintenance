import { useState } from "react";
import { Plus } from "lucide-react";
import { DynamicSelect, type SelectOption } from "./DynamicSelect";
import AddAssetsModal from "../WorkloadView/Modal/AddAssetsModal";


interface Props {
  assetIds: string[];
  onAssetSelect: (value: string | string[]) => void;
  assetOptions: SelectOption[];
  isAssetsLoading: boolean;
  onFetchAssets: () => void;
  onCreateAsset: () => void;
  activeDropdown: string | null;
  setActiveDropdown: (name: string | null) => void;
}

export function AssetsAndProcedures({
  assetIds,
  onAssetSelect,
  assetOptions,
  isAssetsLoading,
  onFetchAssets,
  onCreateAsset,
  activeDropdown,
  setActiveDropdown,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddAssets = (selected: { id: string; name: string }[]) => {
    const newIds = selected.map((a) => a.id);
    onAssetSelect([...assetIds, ...newIds]);
  };

  return (
    <>
      <div className="mt-8">
        <h3 className="mb-4 text-base font-medium text-gray-900">Asset</h3>

        <div className="focus-within:ring-2 focus-within:ring-blue-400 rounded-md">
          <DynamicSelect
            name="assets"
            placeholder="Start typing..."
            options={assetOptions}
            loading={isAssetsLoading}
            value={assetIds}
            onSelect={onAssetSelect}
            onFetch={onFetchAssets}
            ctaText="+ Create New Asset"
            onCtaClick={onCreateAsset}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
        </div>

        {/* Add assets button (smaller text) */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 text-sm text-blue-500 font-medium mt-2 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-md"
        >
          <Plus className="h-4 w-4" />
          Add Assets
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Procedure</h2>
        <div className="flex justify-center items-center text-center gap-3 mb-6">
          <span className="text-base text-gray-600">
            Create or attach new Form, Procedure or Checklist
          </span>
        </div>
        <div className="flex justify-center items-center">
          <button
            type="button"
            className="inline-flex items-center p-2 gap-2 px-8 h-20 text-sm font-semibold text-orange-600 bg-white border border-orange-600 rounded-md"
          >
            <Plus className="h-5 w-5" />
            Add Procedure
          </button>
        </div>
      </div>

      {/* Modal */}
      <AddAssetsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddAssets}
        assets={[
          { id: "1", name: "Conveyor Belt" },
          { id: "2", name: "Packaging Machine" },
          { id: "3", name: "Boiler System" },
          { id: "4", name: "HVAC Unit" },
        ]}
      />
    </>
  );
}
