import React from "react";
import { X } from "lucide-react";
import VendorDetails from "./VendorDetails/VendorDetails"; // Adjust path if needed

interface VendorTableModalProps {
  vendor: any;
  onClose: () => void;
  onEdit: () => void;
  fetchData: () => void;
  showDeleted?: boolean;
}

export default function VendorTableModal({
  vendor,
  onClose,
  onEdit,
  fetchData,
  showDeleted = false,
}: VendorTableModalProps) {
  if (!vendor) return null;

  return (
    // 1. Overlay (Backdrop)
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* 2. Modal Container (White Box) - Same design as AssetTableModal */}
      <div 
        className="relative w-full max-w-5xl h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200"
        role="dialog"
        aria-modal="true"
      >
        
        {/* 3. Close Button (Absolute Top Right) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 shadow-sm z-[100] border border-gray-100 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* 4. Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white">
          <VendorDetails
            vendor={vendor}
            onEdit={onEdit}
            onDeleteSuccess={() => {
              fetchData();
              onClose();
            }}
            restoreData={showDeleted ? "true" : ""}
            onClose={onClose}
            fetchVendors={fetchData}
          />
        </div>
      </div>
    </div>
  );
}