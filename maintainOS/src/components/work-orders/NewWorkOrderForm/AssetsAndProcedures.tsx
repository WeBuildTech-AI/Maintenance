import { useState } from "react";
import { Plus, ClipboardList, Pencil, Trash2 } from "lucide-react";
import { DynamicSelect, type SelectOption } from "./DynamicSelect";

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
  
  linkedProcedure: any | null;
  onRemoveProcedure: () => void;
  onPreviewProcedure: () => void;
  setLinkedProcedure: (p: any) => void;
  onEditProcedure?: () => void;
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
  onAssetSearch,

  linkedProcedure,
  onRemoveProcedure,
  onPreviewProcedure,
  setLinkedProcedure,
  
  onEditProcedure,
}: Props) {



  const [showProcedureModal, setShowProcedureModal] = useState(false);



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
              // ✅ FORCE SINGLE SELECT: Pass only the first ID as a string
              value={assetIds[0] || ""}
              onSelect={(val) => {
                 // ✅ FORCE ARRAY: Wrap single value back into array for parent state
                 const singleId = val as string;
                 onAssetSelect(singleId ? [singleId] : []);
                 
 
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


        </div>

        {/* ✅ Render Status Modal */}

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