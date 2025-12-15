"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { createPart, updatePart } from "../../../store/parts/parts.thunks";
import { PartHeader } from "./PartHeader";
import { PartBasicDetails } from "./PartBasicDetails";
import { PartQRCodeSection } from "./PartQRCodeSection";
import { PartLocationSection } from "./PartLocationSection";
import { PartFilesSection } from "./PartFilesSection";
import { PartFooter } from "./PartFooter";
import PartType from "./PartType";
import toast from "react-hot-toast";
import PartVendorsSection from "./PartVendorsSection";
import type { BUD } from "../../utils/BlobUpload";

export function NewPartForm({
  newItem,
  setNewItem,
  addVendorRow,
  removeVendorRow,
  onCancel,
  onCreate,
}: {
  newItem: any;
  setNewItem: React.Dispatch<React.SetStateAction<any>>;
  addVendorRow: () => void;
  removeVendorRow: (idx: number) => void;
  onCancel: () => void;
  onCreate: () => void;
}) {
  const dispatch = useDispatch<AppDispatch>();

  const organizationId = useSelector(
    (state: RootState) => state.auth?.user?.organizationId
  );

  const [partImages, setPartImages] = React.useState<BUD[]>(
    newItem.partImages || []
  );
  const [partDocs, setPartDocs] = React.useState<BUD[]>(
    newItem.partDocs || []
  );

  React.useEffect(() => {
    setPartImages(newItem.partImages || []);
    setPartDocs(newItem.partDocs || []);
  }, [newItem.partImages, newItem.partDocs]);

  const handleBlobChange = React.useCallback(
    (data: { formId: string; buds: BUD[] }) => {
      if (data.formId === "part_images") {
        setPartImages(data.buds);
        setNewItem((s: any) => ({ ...s, partImages: data.buds }));
      } else if (data.formId === "part_docs") {
        setPartDocs(data.buds);
        setNewItem((s: any) => ({ ...s, partDocs: data.buds }));
      }
    },
    [setNewItem]
  );

  const isFormValid = newItem.name.trim() !== "";

  /* -------------------------------------------------------------------------- */
  /* ✅ FIXED HANDLESUBMIT: USES JSON OBJECT INSTEAD OF FORMDATA               */
  /* -------------------------------------------------------------------------- */

  const handleSubmitPart = async () => {
    // Basic validation
    if (!isFormValid || !organizationId) {
      toast.error("Part Name and Organization ID are required.");
      return;
    }

    try {
      // 1. PREPARE LOCATIONS ARRAY
      const locationsPayload: any[] = Array.isArray(newItem.locations)
        ? newItem.locations
            .filter((loc: any) => loc.locationId)
            .map((loc: any) => ({
              locationId: loc.locationId,
              area: loc.area || "",
              unitsInStock: Number(loc.unitsInStock) || 0,
              minInStock: Number(loc.minInStock) || 0,
            }))
        : [];

      // 2. PREPARE VENDORS ARRAY
      const vendorsPayload = Array.isArray(newItem.vendors)
        ? newItem.vendors
            .map((v: any) => ({
              vendorId: v.vendorId,
              orderingPartNumber: v.orderingPartNumber || ""
            }))
            .filter((v: any) => v.vendorId)
        : [];

      // 3. CONSTRUCT PURE JSON OBJECT (No FormData, No JSON.stringify for arrays)
      const payload: Record<string, any> = {
        organizationId: organizationId,
        name: newItem.name,
      };

      // --- Add optional fields only if they exist ---
      
      if (newItem.description) {
        payload.description = newItem.description;
      }
      
      if (Number(newItem.unitCost) > 0) {
        payload.unitCost = Number(newItem.unitCost);
      }

      if (newItem.qrCode) {
         payload.qrCode = `part/${String(newItem.qrCode).replace('part/', '')}`;
      }

      // --- Arrays: Pass them directly (Backend receives ["id1", "id2"]) ---
      
      if (newItem.partsType?.length > 0) {
        payload.partsType = newItem.partsType; 
      }

      if (newItem.assetIds?.length > 0) {
        payload.assetIds = newItem.assetIds;
      }

      if (newItem.teamsInCharge?.length > 0) {
        payload.teamsInCharge = newItem.teamsInCharge;
      }

      if (newItem.vendorIds?.length > 0) {
        payload.vendorIds = newItem.vendorIds;
      }

      // --- Complex Arrays ---
      if (locationsPayload.length > 0) {
        payload.locations = locationsPayload;
      }

      if (vendorsPayload.length > 0) {
        payload.vendors = vendorsPayload;
      }

      // --- Files (Metadata/BUDs) ---
      // Assuming backend accepts 'partImages' as an array of objects/strings in JSON body
      if (partImages.length > 0) {
        payload.partImages = partImages;
      }

      if (partDocs.length > 0) {
        payload.partDocs = partDocs;
      }

      // 4. DISPATCH
      // Ensure your createPart/updatePart thunks are set up to accept a JSON object, not FormData.
      if (newItem.id) {
        // Update mode
        await dispatch(updatePart({ id: newItem.id, partData: payload })).unwrap();
        toast.success("Part updated successfully!");
      } else {
        // Create mode
        await dispatch(createPart(payload)).unwrap();
        toast.success("Part created successfully!");
      }

      onCreate();
    } catch (error: any) {
      console.error("❌ Error saving part:", error);
      toast.error("Failed to save part");
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <PartHeader isEditing={!!newItem.id} />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto w-full max-w-[840px] p-6 space-y-20">
          <PartBasicDetails newItem={newItem} setNewItem={setNewItem} />
          <PartFilesSection
            partImages={partImages}
            partDocs={partDocs}
            onBlobChange={handleBlobChange}
          />
          <PartQRCodeSection
            qrCode={(newItem.qrCode && newItem.qrCode.split("/").pop()) || ""}
            setQrCode={(code) =>
              setNewItem((s: any) => ({ ...s, qrCode: code }))
            }
          />
          <PartType newItem={newItem} setNewItem={setNewItem} />
          <PartLocationSection newItem={newItem} setNewItem={setNewItem} />
          <PartVendorsSection
            newItem={newItem}
            setNewItem={setNewItem}
            addVendorRow={addVendorRow}
            removeVendorRow={removeVendorRow}
          />
        </div>
      </div>
      <PartFooter
        onCancel={onCancel}
        onCreate={handleSubmitPart}
        disabled={!isFormValid}
        isEditing={!!newItem.id}
      />
    </div>
  );
}