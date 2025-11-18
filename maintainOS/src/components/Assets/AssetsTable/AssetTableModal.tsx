import React from "react";
import { X } from "lucide-react"; // Assuming you use lucide-react for icons
import { AssetDetail } from "../AssetDetail/AssetDetail";
// Import your Asset type definition here. 
// If you don't have a shared type file, I've defined a placeholder below.
import type { Asset } from "../Assets"; 

// Define the props interface
interface AssetTableModalProps {
  asset: Asset;
  onClose: () => void;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string | number) => void;
  fetchAssetsData: () => void;
  setSeeMoreAssetStatus: (value: boolean) => void;
}

const AssetTableModal: React.FC<AssetTableModalProps> = ({
  onClose,
  asset,
  onDelete,
  onEdit,
  fetchAssetsData,
  setSeeMoreAssetStatus,
}) => {
  // Prevent click inside modal content from closing the modal
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/50 flex w-full items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={onClose} // Close when clicking the background overlay
    >
      <div
        className="bg-card rounded-lg shadow-md w-130 h-full flex flex-col overflow-auto bg-white"
        onClick={handleContentClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold">Asset Details</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <AssetDetail
            asset={asset}
            onDelete={onDelete}
            onEdit={onEdit}
            fetchAssetsData={fetchAssetsData}
            setSeeMoreAssetStatus={setSeeMoreAssetStatus}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default AssetTableModal;