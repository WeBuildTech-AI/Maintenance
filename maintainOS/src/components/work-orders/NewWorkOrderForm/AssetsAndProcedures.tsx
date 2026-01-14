import { useState, useEffect } from "react";
import { Plus, ClipboardList, Pencil, Trash2 } from "lucide-react";
import { DynamicSelect, type SelectOption } from "./DynamicSelect";
import AddAssetsModal from "../WorkloadView/Modal/AddAssetsModal";
import AddProcedureModal from "../WorkloadView/Modal/AddProcedureModal";

interface Props {
  assetIds: string[];
  onAssetSelect: (value: string | string[]) => void;
  assetOptions: SelectOption[];
  isAssetsLoading: boolean;
  onFetchAssets: () => void;
  onCreateAsset: () => void;
  activeDropdown: string | null;
  setActiveDropdown: (name: string | null) => void;
  
  onAssetSearch?: (query: string) => void;

  assetStatus?: string;
  setAssetStatus?: (value: string) => void;

  linkedProcedure: any | null;
  onRemoveProcedure: () => void;
  onPreviewProcedure: () => void;
  onOpenProcedureModal: () => void;
  setLinkedProcedure: (p: any) => void;
  onEditProcedure?: () => void;
}

// ✅ Options defined outside to prevent re-renders
const ASSET_STATUS_OPTIONS = [
  { id: "Online", name: "Online" },
  { id: "Offline", name: "Offline" },
  { id: "Do not track", name: "Do not track" },
];

export function AssetsAndProcedures({
  assetIds,
  onAssetSelect,
  assetOptions,
  isAssetsLoading,
  onFetchAssets,
  onCreateAsset,
  activeDropdown,
  setActiveDropdown,
  onAssetSearch,

  assetStatus,
  setAssetStatus,

  linkedProcedure,
  onRemoveProcedure,
  onPreviewProcedure,
  onOpenProcedureModal,
  setLinkedProcedure,
  onEditProcedure 
}: Props) {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showProcedureModal, setShowProcedureModal] = useState(false);

  // ✅ Local state to ensure immediate UI updates for Asset Status
  const [internalAssetStatus, setInternalAssetStatus] = useState(assetStatus || "");

  // ✅ Sync local state if parent prop changes
  useEffect(() => {
    if (assetStatus !== undefined) {
      setInternalAssetStatus(assetStatus);
    }
  }, [assetStatus]);

  const handleAddAssets = (selected: { id: string; name: string }[]) => {
    const newIds = selected.map((a) => a.id);
    const uniqueIds = Array.from(new Set([...assetIds, ...newIds]));
    onAssetSelect(uniqueIds);
  };

  const handleOpenAssetModal = () => {
    setIsModalOpen(true);
    // ✅ Fetch latest assets from API when opening the modal
    onFetchAssets(); 
  };

  return (
    <>
      <div className="mt-8 relative z-20"> {/* Parent container z-index context */}
        
        {/* Flex container for Asset & Asset Status */}
        <div className="flex gap-4 items-start w-full relative">
          
          {/* Left: Asset Selection */}
          <div className={`flex-1 min-w-0 relative ${activeDropdown === 'assets' ? 'z-50' : 'z-20'}`}>
            <h3 className="mb-4 text-base font-medium text-gray-900">Asset</h3>
            <DynamicSelect
              name="assets"
              placeholder="Start typing..."
              options={assetOptions}
              loading={isAssetsLoading}
              value={assetIds}
              onSelect={(val) => {
                 onAssetSelect(val);
                 // Reset status if all assets are removed
                 if (Array.isArray(val) && val.length === 0) {
                   setInternalAssetStatus(""); // Clear local
                   if (setAssetStatus) setAssetStatus(""); // Clear parent
                 }
              }}
              onFetch={onFetchAssets}
              onSearch={onAssetSearch}
              ctaText="+ Create New Asset"
              onCtaClick={onCreateAsset}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              className="w-full"
            />
          </div>

          {/* Right: Asset Status (Conditional) */}
          {assetIds.length > 0 && (
            <div className={`w-[200px] flex-shrink-0 relative ${activeDropdown === 'asset-status' ? 'z-50' : 'z-20'}`}>
              <h3 className="mb-4 text-base font-medium text-gray-900">Asset Status</h3>
              <DynamicSelect
                name="asset-status"
                placeholder="Select status..."
                options={ASSET_STATUS_OPTIONS}
                loading={false}
                value={internalAssetStatus} // ✅ Use local state
                onSelect={(val) => {
                  const newVal = val as string;
                  setInternalAssetStatus(newVal); // ✅ Update local immediately
                  if (setAssetStatus) setAssetStatus(newVal); // Update parent
                }}
                onFetch={() => {}} 
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Add Assets Button */}
        <button
          type="button"
          onClick={handleOpenAssetModal} // ✅ Updated to fetch data on click
          className="flex items-center gap-1.5 text-sm text-blue-500 font-medium mt-2 hover:text-blue-600 focus:outline-none relative z-0"
        >
          <Plus className="h-4 w-4" />
          Add Assets
        </button>
      </div>

      {/* ---------------- PROCEDURE SECTION ---------------- */}
      <div className="mt-8 relative z-0">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Procedure</h2>

        {linkedProcedure ? (
          <div className="flex flex-col gap-4">
            <div
              className="flex items-center gap-4 p-4 rounded-lg"
              style={{ backgroundColor: "#f0f7ff" }}
            >
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-white border border-blue-200">
                <ClipboardList className="w-6 h-6 text-blue-500" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {linkedProcedure.title || "Untitled Procedure"}
                </p>
                <p className="text-sm text-gray-600">From Procedure Library</p>
              </div>

              <div className="flex-shrink-0 flex items-center gap-4">
                <button
                  onClick={onPreviewProcedure}
                  type="button"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Preview
                </button>

                <span className="text-gray-300">|</span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEditProcedure) onEditProcedure();
                  }}
                  type="button"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveProcedure();
                  }}
                  type="button"
                  className="text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowProcedureModal(true)}
              className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:text-blue-700 self-start"
            >
              <Plus className="h-5 w-5" />
              Add Another Procedure
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center items-center text-center gap-3 mb-6">
              <span className="text-base text-gray-600">
                Create or attach new Form, Procedure or Checklist
              </span>
            </div>

            <div className="flex justify-center items-center">
              <button
                type="button"
                onClick={() => setShowProcedureModal(true)}
                className="inline-flex items-center justify-center gap-2 px-8 h-12 text-sm font-semibold text-orange-600 bg-white border border-orange-600 rounded-md hover:bg-orange-50 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Procedure
              </button>
            </div>
          </>
        )}
      </div>

      {/* ---------------- ASSETS MODAL ---------------- */}
      <AddAssetsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddAssets}
        // ✅ PASS REAL API DATA HERE (Replaced hardcoded list)
        assets={assetOptions} 
      />

      {/* ---------------- PROCEDURE MODAL ---------------- */}
      <AddProcedureModal
        isOpen={showProcedureModal}
        onClose={() => setShowProcedureModal(false)}
        onSelect={(p) => {
          setLinkedProcedure(p);
          setShowProcedureModal(false);
        }}
      />
    </>
  );
}