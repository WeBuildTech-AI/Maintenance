import { Plus } from "lucide-react";
import { DynamicSelect, type SelectOption } from "./DynamicSelect";

interface Props {
  assetIds: string[]; onAssetSelect: (value: string | string[]) => void;
  assetOptions: SelectOption[]; isAssetsLoading: boolean;
  onFetchAssets: () => void; onCreateAsset: () => void;
  activeDropdown: string | null; setActiveDropdown: (name: string | null) => void;
}

export function AssetsAndProcedures({
  assetIds, onAssetSelect, assetOptions, isAssetsLoading, onFetchAssets, onCreateAsset,
  activeDropdown, setActiveDropdown
}: Props) {
  return (
    <>
      <div className="mt-8">
        <h3 className="mb-4 text-base font-medium text-gray-900">Asset(s)</h3>
        <DynamicSelect name="assets" placeholder="Select assets..." options={assetOptions} loading={isAssetsLoading} value={assetIds} onSelect={onAssetSelect} onFetch={onFetchAssets} ctaText="+ Create New Asset" onCtaClick={onCreateAsset} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Procedure</h2>
        <div className="flex justify-center items-center text-center gap-3 mb-6"><span className="text-base text-gray-600">Create or attach new Form, Procedure or Checklist</span></div>
        <div className="flex justify-center items-center"><button type="button" className="inline-flex items-center p-2 gap-2 px-8 h-20 text-sm font-semibold text-orange-600 bg-white border border-orange-600 rounded-md"><Plus className="h-5 w-5" />Add Procedure</button></div>
      </div>
    </>
  );
}