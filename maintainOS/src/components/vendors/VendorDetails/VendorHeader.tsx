import { useState, useRef, useEffect } from "react";
import { Copy, Link, MoreHorizontal } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { type Vendor } from "../vendors.types";
import DeleteModal from "./DeleteModal";
import { Tooltip } from "../../ui/tooltip";
import { vendorService } from "../../../store/vendors";

interface VendorHeaderProps {
  vendor: Vendor;
  onEdit: (vendor: Vendor) => void;
  handleDeleteVendor: (id: string) => void;
  restoreData: string;
}

export default function VendorHeader({
  vendor,
  onEdit,
  handleDeleteVendor,
  restoreData,
}: VendorHeaderProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // ✅ Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showDeleteModal &&
        modalRef.current &&
        !modalRef.current.contains(e.target as Node)
      ) {
        setShowDeleteModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDeleteModal]);

  // ✅ Delete vendor logic with toast
  const handleConfirmDelete = () => {
    try {
      handleDeleteVendor(vendor.id);
      toast.success("Vendor deleted successfully!"); // ✅ Restored toast
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete vendor."); // ✅ Added error toast
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleRestoreVendorDeleteData = async (id) => {
    await vendorService.restoreVendorData(id);
    
  };

  return (
    <>
      {/* Fixed Header Section */}
      <div className="flex-none border-b px-6 py-4 bg-white z-30 sticky top-0">
        <div className="flex items-center justify-between">
          {/* Vendor Name */}
          <h2 className="text-lg font-semibold text-gray-900">
            {vendor.name || "Unnamed Vendor"}
          </h2>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 text-blue-600">
            {/* Copy Vendor Link */}
            <Tooltip text="Copy Link">
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/vendors/${vendor.id}`;
                  navigator.clipboard.writeText(url);
                  toast.success("Vendor link copied!"); // ✅ Added toast here too
                }}
                className="p-2 hover:text-blue-800 flex items-center justify-center"
                title="Copy Vendor Link"
              >
                <Link className="w-3 h-3" />
              </button>
            </Tooltip>

            {/* New Purchase Order */}
            <button className="flex items-center gap-1 border border-blue-600 text-blue-600 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-blue-50">
              + New Purchase Order
            </button>

            {/* Edit Vendor */}
            <button
              type="button"
              onClick={() => onEdit(vendor)}
              className="flex items-center gap-1 border border-blue-600 text-blue-600 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-blue-50"
            >
              Edit
            </button>

            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="mt-1">
                <DropdownMenuItem onClick={() => setShowDeleteModal(true)}>
                  Delete
                </DropdownMenuItem>
                {restoreData && (
                  <DropdownMenuItem
                    onClick={() => handleRestoreVendorDeleteData(vendor.id)}
                  >
                    Restore
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ✅ Reuse your DeleteModal */}
      {showDeleteModal && (
        <DeleteModal
          modalRef={modalRef}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
}
