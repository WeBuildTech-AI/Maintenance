import React, {
  useState,
  type Dispatch,
  type SetStateAction,
  useRef,
} from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { AssetDetail } from "../Assets/AssetDetail/AssetDetail";
import type { Asset } from "../Assets/Assets";
import { MeterDetail } from "../Meters/MeterDetail/MeterDetail";
import LocationDetails from "../Locations/LocationDetails";
import VendorDetails from "../vendors/VendorDetails/VendorDetails";
import { PartDetails } from "../Inventory/PartDetail/PartDetails";
import PurchaseOrderDetails from "../purchase-orders/PurchaseOrderDetails";
import { NewAssetForm } from "../Assets/NewAssetForm/NewAssetForm";

// Meter Components
import { ReadingHistory } from "../Meters/MeterDetail/ReadingHistory";
import RecordReadingModal from "../Meters/MeterDetail/RecordReadingModal";
import { NewMeterForm } from "../Meters/NewMeterForm/NewMeterForm";

// PO Service & Modal
import { purchaseOrderService } from "../../store/purchaseOrders";
import ConfirmationModal from "../purchase-orders/ConfirmationModal";

interface AssetTableModalProps {
  data: any;
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
  onEdit,
  fetchData,
  setSeeMoreAssetStatus,
  showDetailsSection,
  restoreData,
  showDeleted,
}) => {
  const navigate = useNavigate();

  // Asset Editing State
  const [isEditing, setIsEditing] = useState(false);
  // Meter States
  const [isMeterEditing, setIsMeterEditing] = useState(false);
  const [showMeterHistory, setShowMeterHistory] = useState(false);
  const [isRecordReadingOpen, setIsRecordReadingOpen] = useState(false);
  const [showRecordingButton, setShowRecordingButton] = useState(false);
  // --- PO ACTION STATES ---
  const [poModalAction, setPoModalAction] = useState<
    "reject" | "approve" | "delete" | "fullfill" | "cancelled" | null
  >(null);
  const [isPoLoading, setIsPoLoading] = useState(false);
  const [showCommentSection, setShowCommentSection] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // --- 1. PO EDIT HANDLER ---
  const handleEditPO = () => {
    if (data?.id) {
      // Navigate to the edit URL (opens the main Dialog)
      navigate(`/purchase-orders/${data.id}/edit`);
      onClose(); // Close this modal
    }
  };

  // --- 2. PO CONFIRMATION HANDLER ---
  const handlePoConfirm = async () => {
    if (!data?.id) return;
    setIsPoLoading(true);
    try {
      if (poModalAction === "reject") {
        await purchaseOrderService.rejectPurchaseOrder(data.id);
        toast.success("Successfully Rejected");
      } else if (poModalAction === "approve") {
        await purchaseOrderService.approvePurchaseOrder(data.id);
        toast.success("Successfully Approved");
      } else if (poModalAction === "delete") {
        // ⭐ Delete Logic
        await purchaseOrderService.deletePurchaseOrder(data.id);
        toast.success("Deleted Successfully");
        onClose(); // Close modal immediately after delete
      } else if (poModalAction === "cancelled") {
        await purchaseOrderService.cancelPurchaseOrder(data.id);
        toast.success("Cancelled Successfully");
      }
      fetchData(); // Refresh Parent Table
    } catch (error) {
      console.error("Action failed:", error);
      toast.error("Action failed!");
    } finally {
      setIsPoLoading(false);
      setPoModalAction(null);
    }
  };

  // Content for PO Confirmation Modal
  const poModalContent = {
    reject: {
      title: "Reject Confirmation",
      message: "If you confirm, this Purchase Order will be rejected.",
      confirmButtonText: "Reject",
      variant: "danger" as const,
    },
    approve: {
      title: "Approve Confirmation",
      message: "Are you sure you want to Approve this Purchase Order?",
      confirmButtonText: "Approve",
      variant: "warning" as const,
    },
    delete: {
      title: "Delete Confirmation",
      message: "Are you sure you want to Delete this?",
      confirmButtonText: "Delete",
      variant: "warning" as const,
    },
    cancelled: {
      title: "Cancel Confirmation",
      message: "Are you sure you want to Cancel this?",
      confirmButtonText: "Cancel",
      variant: "warning" as const,
    },
    fullfill: {
      title: "",
      message: "",
      confirmButtonText: "",
      variant: "warning" as const,
    },
  };

  return (
    // ⭐ z-50 for the Asset Modal
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
            {showDetailsSection === "purchaseorder"
              ? "Purchase Order"
              : showDetailsSection}{" "}
            Details
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
          {/* ... Asset, Meter, Location, Vendor, Part Sections ... */}

          {showDetailsSection === "asset" &&
            (isEditing ? (
              <div className="p-4">
                <NewAssetForm
                  isEdit={true}
                  assetData={data}
                  fetchAssetsData={fetchData}
                  onCancel={() => setIsEditing(false)}
                  onCreate={() => {
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

          {showDetailsSection === "meter" &&
            (isMeterEditing ? (
              <div className="p-4">
                <NewMeterForm
                  editingMeter={data}
                  onCancel={() => setIsMeterEditing(false)}
                  onCreate={() => {
                    fetchData();
                    setIsMeterEditing(false);
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
                  setShowReadingMeter={setShowMeterHistory}
                  setIsRecordModalOpen={setIsRecordReadingOpen}
                  onEdit={() => setIsMeterEditing(true)}
                  showRecordingButton={showRecordingButton}
                  showDeleted={showDeleted}
                />
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

          {/* --- PURCHASE ORDER SECTION --- */}
          {showDetailsSection === "purchaseorder" && (
            <PurchaseOrderDetails
              selectedPO={data}
              updateState={() => {}}
              setModalAction={setPoModalAction}
              handleConfirm={handlePoConfirm}
              topRef={{ current: null }}
              commentsRef={{ current: null }}
              formatMoney={(v) => v.toString()}
              addressToLine={() => ""}
              showCommentBox={false}
              setShowCommentBox={() => {}}
              // ⭐ This triggers Edit Navigation
              handleEditClick={handleEditPO}
              setApproveModal={() => {}}
              fetchPurchaseOrder={fetchData}
              restoreData={restoreData}
              onClose={onClose}
              showDeleted={showDeleted}
              showCommentSection={showCommentSection}
            />
          )}
        </div>
      </div>

      {/* ✅ CONFIRMATION MODAL FIXED */}
      {/* Moved outside the inner div but inside the fixed container. 
          If issues persist, check ConfirmationModal's own z-index. */}
      {poModalAction && (
        <div style={{ position: "relative", zIndex: 60 }}>
          <ConfirmationModal
            isOpen={poModalAction !== null}
            onClose={() => setPoModalAction(null)}
            handleConfirm={handlePoConfirm}
            isLoading={isPoLoading}
            // ⭐ CRITICAL FIX: Pass selectedPO or the component might crash/hide
            selectedPO={data}
            title={poModalAction ? poModalContent[poModalAction].title : ""}
            message={poModalAction ? poModalContent[poModalAction].message : ""}
            confirmButtonText={
              poModalAction
                ? poModalContent[poModalAction].confirmButtonText
                : ""
            }
            confirmButtonVariant={
              poModalAction ? poModalContent[poModalAction].variant : "warning"
            }
          />
        </div>
      )}
    </div>
  );
};

export default AssetTableModal;
