import React, { type Dispatch, type SetStateAction } from "react";
import { X } from "lucide-react"; // Assuming you use lucide-react for icons
import { AssetDetail } from "../AssetDetail/AssetDetail";
// Import your Asset type definition here.
// If you don't have a shared type file, I've defined a placeholder below.
import type { Asset } from "../Assets";
import { MeterDetail } from "../../Meters/MeterDetail/MeterDetail";
import LocationDetails from "../../Locations/LocationDetails";
import VendorDetails from "../../vendors/VendorDetails/VendorDetails";
import { PartDetails } from "../../Inventory/PartDetail/PartDetails";
import PurchaseOrderDetails from "../../purchase-orders/PurchaseOrderDetails";
import { addressToLine, formatMoney } from "../../purchase-orders/helpers";

// Define the props interface
interface AssetTableModalProps {
  data: any[];
  onClose: () => void;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string | number) => void;
  fetchData: () => void;
  setSeeMoreAssetStatus: (value: boolean) => void;
  showDetailsSection: string;
  setShowReadingMeter: Dispatch<SetStateAction<boolean>>;
  setIsRecordModalOpen: Dispatch<SetStateAction<boolean>>;
  restoreData: string;
}

const AssetTableModal: React.FC<AssetTableModalProps> = ({
  onClose,
  data,
  onDelete,
  onEdit,
  fetchData,
  setSeeMoreAssetStatus,
  showDetailsSection,
  restoreData,
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
        className="bg-card rounded-lg shadow-md w-200 h-full flex flex-col overflow-auto bg-white"
        onClick={handleContentClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold capitalize">
            {showDetailsSection} Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 cursor-pointer rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {showDetailsSection === "asset" && (
            <AssetDetail
              asset={data}
              onDelete={onDelete}
              onEdit={() => {}}
              fetchAssetsData={fetchData}
              setSeeMoreAssetStatus={() => {}}
              onClose={onClose}
              restoreData={restoreData}
            />
          )}

          {showDetailsSection === "meter" && (
            <MeterDetail
              selectedMeter={data}
              restoreData={"Restore"}
              fetchMeters={fetchData}
              onClose={onClose}
            />
          )}

          {showDetailsSection === "location" && (
            <LocationDetails
              selectedLocation={data}
              restoreData={"Restore"}
              fetchLocation={fetchData}
              onClose={onClose}
            />
          )}

          {showDetailsSection === "vendor" && (
            <VendorDetails
              vendor={data}
              restoreData={restoreData}
              onClose={onClose}
              fetchVendors={fetchData}
            />
          )}

          {showDetailsSection === "part" && (
            <PartDetails
              onClose={onClose}
              restoreData={restoreData}
              item={data}
              fetchPartData={fetchData}
            />
          )}

          {/* {showDetailsSection === "purchaseOrder" && (
            <PurchaseOrderDetails
              onClose={onClose}
              restoreData={restoreData}
              selectedPO={data}
              fetchPurchaseOrder={fetchData}
              formatMoney={formatMoney}
              addressToLine={addressToLine}
            />
          )} */}
        </div>
      </div>
    </div>
  );
};

export default AssetTableModal;
