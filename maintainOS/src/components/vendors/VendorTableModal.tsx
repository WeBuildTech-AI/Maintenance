import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { updateVendor } from "../../store/vendors";

// ✅ Correct Imports
import VendorDetails from "./VendorDetails/VendorDetails";
import { VendorForm } from "./VendorsForm/VendorForm";

interface VendorTableModalProps {
  vendor: any;
  onClose: () => void;
  fetchData: () => void;
  showDeleted?: boolean;
}

export default function VendorTableModal({
  vendor,
  onClose,
  fetchData,
  showDeleted = false,
}: VendorTableModalProps) {
  const dispatch = useDispatch<AppDispatch>();

  // State: Toggle between Details (View) and Form (Edit)
  const [isEditing, setIsEditing] = useState(false);

  // Reset to View mode whenever a new vendor opens
  useEffect(() => {
    setIsEditing(false);
  }, [vendor?.id]);

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!vendor) return null;

  return (
    // ✅ Overlay matching AssetTableModal (z-50, backdrop-blur, etc.)
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/50 flex w-full items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* ✅ Container matching AssetTableModal */}
      <div
        className="bg-card rounded-lg shadow-md w-200 h-full flex flex-col overflow-auto bg-white"
        onClick={handleContentClick}
      >
        {/* ✅ Header matching AssetTableModal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold capitalize">
            Vendor Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 cursor-pointer rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* ✅ Content Body matching AssetTableModal */}
        <div className="flex-1 overflow-y-auto">
          {isEditing ? (
            /* ---------------- EDIT MODE ---------------- */
            // Wrapped in p-4 div to match AssetTableModal edit form style
            <div className="p-4">
               <VendorForm
                  initialData={vendor} 
                  
                  // Cancel -> Switch back to View Mode (Does NOT close modal)
                  onCancel={() => setIsEditing(false)} 
                  
                  // Submit -> Call PATCH API via Redux
                  onSubmit={(data: FormData) => {
                    return dispatch(updateVendor({ id: vendor.id, data })).unwrap();
                  }}
                  
                  // Success -> Refresh Table & Close Modal
                  onSuccess={() => {
                    fetchData(); 
                    onClose();   
                  }}
                />
            </div>
          ) : (
            /* ---------------- VIEW MODE ---------------- */
            <VendorDetails
              vendor={vendor}
              
              // Switch to Edit Mode
              onEdit={() => setIsEditing(true)} 
              
              onDeleteSuccess={onClose}
              restoreData={showDeleted ? "Restore" : ""}
              onClose={onClose}
              fetchVendors={fetchData}
            />
          )}
        </div>
      </div>
    </div>
  );
}