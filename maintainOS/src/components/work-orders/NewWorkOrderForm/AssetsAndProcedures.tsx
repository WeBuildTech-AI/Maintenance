import { useState } from "react";
// --- (NEW) Icons import kiye gaye ---
import { Plus, ClipboardList, Pencil, Trash2 } from "lucide-react";
import { DynamicSelect, type SelectOption } from "./DynamicSelect";
import AddAssetsModal from "../WorkloadView/Modal/AddAssetsModal";
import { useNavigate } from "react-router-dom";

interface Props {
  assetIds: string[];
  onAssetSelect: (value: string | string[]) => void;
  assetOptions: SelectOption[];
  isAssetsLoading: boolean;
  onFetchAssets: () => void;
  onCreateAsset: () => void;
  activeDropdown: string | null;
  setActiveDropdown: (name: string | null) => void;
  
  // --- Props jo pichle step mein add kiye the ---
  linkedProcedure: any | null;
  onRemoveProcedure: () => void;
  onPreviewProcedure: () => void;
  onOpenProcedureModal: () => void; 
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
  // --- Naye props ---
  linkedProcedure,
  onRemoveProcedure,
  onPreviewProcedure,
  onOpenProcedureModal,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate(); 

  const handleAddAssets = (selected: { id: string; name: string }[]) => {
    const newIds = selected.map((a) => a.id);
    onAssetSelect([...assetIds, ...newIds]);
  };
  
  const handleEditProcedure = () => {
    if (linkedProcedure) {
      navigate(`/library`); 
    }
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

      {/* --- UPDATED PROCEDURE SECTION --- */}
      <div className="mt-8">
        {/* (FIX) Heading style updated to match image */}
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Procedure</h2>
        
        {linkedProcedure ? (
          // --- State 1: Procedure linked (Aapki image wala UI) ---
          <div className="flex flex-col gap-4">
            <div 
              // (FIX) Padding aur Gap update kiya
              className="flex items-center gap-4 p-4 rounded-lg" 
              style={{ backgroundColor: "#f0f7ff" }} // Light blue bg
            >
              <div 
                className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-white border border-blue-200"
              >
                <ClipboardList className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium  text-gray-900 truncate">
                  {linkedProcedure.title || "Untitled Procedure"}
                </p>
                <p className="text-sm text-gray-600">
                  From Procedure Library
                </p>
              </div>
              {/* (FIX) Actions spacing aur icon size update kiya */}
              <div className="flex-shrink-0 flex items-center gap-4">
                <button
                  onClick={onPreviewProcedure}
                  type="button" 
                  className="text-sm  text-blue-500 "
                >
                  Preview
                </button>
                <span>|</span>
                <button
                  onClick={handleEditProcedure}
                  type="button" 
                  className="text-gray-600 hover:text-blue-600"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={onRemoveProcedure}
                  type="button" 
                  className="text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* (FIX) Button style update kiya */}
            <button
              type="button"
              onClick={onOpenProcedureModal} 
              className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:text-blue-700 focus:outline-none"
            >
              <Plus className="h-5 w-5" />
              Add Another Procedure
            </button>
          </div>
          
        ) : (
          // --- State 2: Koi procedure linked nahi hai (Purana UI) ---
          <>
            <div className="flex justify-center items-center text-center gap-3 mb-6">
              <span className="text-base text-gray-600">
                Create or attach new Form, Procedure or Checklist
              </span>
            </div>
            <div className="flex justify-center items-center">
              <button
                type="button"
                onClick={onOpenProcedureModal}
                className="inline-flex items-center p-2 gap-2 px-8 h-20 text-sm font-semibold text-orange-600 bg-white border border-orange-600 rounded-md"
              >
                <Plus className="h-5 w-5" />
                Add Procedure
              </button>
            </div>
          </>
        )}
      </div>
      {/* --- (End of NEW) --- */}


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