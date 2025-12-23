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

  const [partImages, setPartImages] = React.useState<BUD[]>([]);
  const [partDocs, setPartDocs] = React.useState<BUD[]>([]);

  const handleBlobChange = (data: { formId: string; buds: BUD[] }) => {
    if (data.formId === "part_images") {
      setPartImages(data.buds);
    } else if (data.formId === "part_docs") {
      setPartDocs(data.buds);
    }
  };

  React.useEffect(() => {
    if (newItem?.partImages) {
      setPartImages(newItem.partImages);
    }
    if (newItem?.partDocs) {
      setPartDocs(newItem.partDocs);
    }
  }, [newItem?.partImages, newItem?.partDocs]);

  // ✅ FIXED: Normalize Data (Pre-fill Locations, Assets, etc.)
  React.useEffect(() => {
    if (!newItem) return;

    setNewItem((prev: any) => {
      // 1. Extract First Location Data (if exists)
      const firstLoc = prev.locations?.[0];

      return {
        ...prev,
        // Arrays Normalization
        assetIds:
          prev.assetIds && prev.assetIds.length > 0
            ? prev.assetIds
            : prev.assets?.map((a: any) => a.id) || [],
        teamsInCharge:
          prev.teamsInCharge && prev.teamsInCharge.length > 0
            ? prev.teamsInCharge
            : prev.teams?.map((t: any) => t.id) || [],
        vendorIds:
          prev.vendorIds && prev.vendorIds.length > 0
            ? prev.vendorIds
            : prev.vendors?.map((v: any) => v.id) || [],
        partsType:
          prev.partsType && prev.partsType.length > 0
            ? prev.partsType
            : Array.isArray(prev.partsType)
            ? prev.partsType
            : prev.partsType
            ? [prev.partsType]
            : [],

        // ✅ FIX: Map Location Data to Top-Level Fields for Inputs
        locationId: prev.locationId || firstLoc?.locationId || firstLoc?.id || "",
        area: prev.area || firstLoc?.area || "",
        // Handle 0 values correctly using nullish coalescing (??)
        unitInStock: prev.unitInStock ?? firstLoc?.unitsInStock ?? 0,
        minInStock: prev.minInStock ?? firstLoc?.minimumInStock ?? 0,
      };
    });
  }, [newItem?.id, setNewItem]);

  const handleSubmitPart = async () => {
    try {
      const isEditing = !!newItem.id;

      // ✅ CONSTRUCT JSON PAYLOAD (Replaces FormData)
      // This sends real arrays directly, preventing backend parsing errors.
      const payload: any = {
        organizationId: organizationId || "",
        name: newItem.name || "",
        description: newItem.description || "",
        // Ensure unitCost is a number
        unitCost: newItem.unitCost ? Number(newItem.unitCost) : 0, 
        
        // Handle QR Code format
        qrCode: newItem.qrCode ? `part/${String(newItem.qrCode).replace('part/', '')}` : "",

        // ✅ Send Arrays as REAL Arrays (No JSON.stringify)
        partsType: Array.isArray(newItem.partsType) ? newItem.partsType : [],
        assetIds: Array.isArray(newItem.assetIds) ? newItem.assetIds : [],
        teamsInCharge: Array.isArray(newItem.teamsInCharge) ? newItem.teamsInCharge : [],
        vendorIds: Array.isArray(newItem.vendorIds) ? newItem.vendorIds : [],

        // ✅ Send Metadata for Images/Docs (Assuming file upload handled separately or pre-signed URLs)
        partImages: partImages && partImages.length > 0 ? partImages : [],
        partDocs: partDocs && partDocs.length > 0 ? partDocs : [],

        // Initialize complex fields
        locations: [],
        vendors: []
      };

      // 3. LOCATIONS LOGIC (Push objects to array)
      // Case A: If user added multiple locations via the list
      if (newItem.locations && newItem.locations.length > 0) {
        payload.locations = newItem.locations.map((loc: any) => ({
           locationId: loc.locationId || loc.id,
           area: loc.area || "",
           unitsInStock: Number(loc.unitsInStock ?? loc.unitInStock ?? 0),
           minimumInStock: Number(loc.minimumInStock ?? loc.minInStock ?? 0)
        }));
      } 
      // Case B: Fallback for the single location inputs (edited via main form)
      else if (newItem.locationId || newItem.area) {
        payload.locations.push({
           locationId: newItem.locationId || "",
           area: newItem.area || "",
           unitsInStock: Number(newItem.unitInStock || 0),
           minimumInStock: Number(newItem.minInStock || 0)
        });
      }

      // 4. VENDORS METADATA LOGIC
      if (Array.isArray(newItem.vendors) && newItem.vendors.length > 0) {
        payload.vendors = newItem.vendors.map((vendor: any) => ({
          vendorId: vendor.vendorId || "",
          orderingPartNumber: vendor.orderingPartNumber || ""
        }));
      }

      // 5. Submit as JSON
      // NOTE: Ensure your backend Controller is using @Body() not @UploadedFiles() for these fields now
      if (isEditing) {
        await dispatch(updatePart({ id: String(newItem.id), partData: payload })).unwrap();
        toast.success("Part updated successfully!");
      } else {
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
        disabled={!newItem.name}
        isEditing={!!newItem.id}
      />
    </div>
  );
}