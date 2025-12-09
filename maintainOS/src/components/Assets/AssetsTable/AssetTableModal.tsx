import React, {
  useState,
  type Dispatch,
  type SetStateAction,
  useRef,
} from "react";
import { X } from "lucide-react";
import { AssetDetail } from "../AssetDetail/AssetDetail";
import type { Asset } from "../Assets";
import { MeterDetail } from "../../Meters/MeterDetail/MeterDetail";
import LocationDetails from "../../Locations/LocationDetails";
import VendorDetails from "../../vendors/VendorDetails/VendorDetails";
import { PartDetails } from "../../Inventory/PartDetail/PartDetails";
import PurchaseOrderDetails from "../../purchase-orders/PurchaseOrderDetails";
import { NewAssetForm } from "../NewAssetForm/NewAssetForm";

// ✅ 1. IMPORT METER COMPONENTS
import { ReadingHistory } from "../../Meters/MeterDetail/ReadingHistory";
import RecordReadingModal from "../../Meters/MeterDetail/RecordReadingModal";
import { NewMeterForm } from "../../Meters/NewMeterForm/NewMeterForm";

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
  showDeleted: boolean;
}

const AssetTableModal: React.FC<AssetTableModalProps> = ({
  onClose,
  data,
  onDelete,
  onEdit, // Note: Ye prop sirf Assets ke liye tha, Meter ke liye hum local state use karenge
  fetchData,
  setSeeMoreAssetStatus,
  showDetailsSection,
  restoreData,
  showDeleted,
}) => {
  // Asset Editing State
  const [isEditing, setIsEditing] = useState(false);

  // ✅ 2. NEW STATES FOR METER (Edit, History, Record)
  const [isMeterEditing, setIsMeterEditing] = useState(false);
  const [showMeterHistory, setShowMeterHistory] = useState(false);
  const [isRecordReadingOpen, setIsRecordReadingOpen] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/50 flex w-full items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={onClose}
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto">
          {/* --- ASSET SECTION --- */}
          {showDetailsSection === "asset" &&
            (isEditing ? (
              <div className="p-4">
                <NewAssetForm
                  isEdit={true}
                  assetData={data}
                  fetchAssetsData={fetchData}
                  onCancel={() => setIsEditing(false)}
                  onCreate={(updatedAsset) => {
                    fetchData();
                    setIsEditing(false);
                  }}
                />
              </div>
            ) : (
              <AssetDetail
                asset={data}
                onDelete={onDelete}
                onEdit={() => setIsEditing(true)}
                fetchAssetsData={fetchData}
                onClose={onClose}
                restoreData={restoreData}
                showDeleted={showDeleted}
                setSeeMoreAssetStatus={setSeeMoreAssetStatus}
              />
            ))}

          {/* --- METER SECTION (UPDATED FOR IN-MODAL EDITING) --- */}
          {showDetailsSection === "meter" &&
            (isMeterEditing ? (
              <div className="p-4">
                <NewMeterForm
                  editingMeter={data} // Current meter ka data pass kiya
                  onCancel={() => setIsMeterEditing(false)} // Cancel par wapas detail view
                  onCreate={() => {
                    fetchData(); // Data refresh karo
                    setIsMeterEditing(false); // Edit mode band karo
                  }}
                />
              </div>
            ) : showMeterHistory ? (
              <ReadingHistory
                selectedMeter={data}
                onBack={() => setShowMeterHistory(false)}
                setIsRecordModalOpen={setIsRecordReadingOpen}
              />
            ) : (
              <>
                <MeterDetail
                  selectedMeter={data}
                  restoreData={"Restore"}
                  fetchMeters={fetchData}
                  onClose={onClose}
                  // 👇 Ye props pass kiye taaki History aur Record features kaam karein
                  setShowReadingMeter={setShowMeterHistory}
                  setIsRecordModalOpen={setIsRecordReadingOpen}
                  // 👇 MAIN CHANGE: Edit button dabane par local state change hogi
                  onEdit={() => setIsMeterEditing(true)}
                />

                {/* Record Reading Modal Overlay */}
                {isRecordReadingOpen && (
                  <RecordReadingModal
                    modalRef={modalRef}
                    selectedMeter={data}
                    onClose={() => setIsRecordReadingOpen(false)}
                    fetchMeters={fetchData}
                  />
                )}
              </>
            ))}

          {/* --- OTHER SECTIONS (Location, Vendor, Part, PO) --- */}
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

          {showDetailsSection === "purchaseorder" && (
            <PurchaseOrderDetails
              selectedPO={data}
              updateState={() => {}}
              handleConfirm={() => {}}
              setModalAction={() => "delete"}
              topRef={{ current: null }}
              commentsRef={{ current: null }}
              formatMoney={(v) => v.toString()}
              addressToLine={() => ""}
              showCommentBox={false}
              setShowCommentBox={() => {}}
              handleEditClick={() => {}}
              setApproveModal={() => {}}
              fetchPurchaseOrder={fetchData}
              restoreData={restoreData}
              onClose={onClose}
              showDeleted={showDeleted}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetTableModal;
