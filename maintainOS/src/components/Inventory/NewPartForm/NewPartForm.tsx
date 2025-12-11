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

  React.useEffect(() => {
    if (!newItem) return;
    setNewItem((prev: any) => ({
      ...prev,
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
    }));
  }, [newItem?.id, setNewItem]);

  const handleSubmitPart = async () => {
    try {
      const formData = new FormData();
      const isEditing = !!newItem.id;
      const original = newItem._original || {}; 

      // Helper to append if value exists or changed
      const appendIfChanged = (key: string, newVal: any, oldVal: any) => {
        if (typeof newVal === "string" && (newVal === "[]" || newVal === "{}")) return;

        const isEmpty =
          newVal === "" ||
          newVal === null ||
          newVal === undefined ||
          (Array.isArray(newVal) && newVal.length === 0) ||
          (typeof newVal === "object" && !Array.isArray(newVal) && Object.keys(newVal).length === 0);

        // In Create mode, send everything. In Edit mode, send only diffs.
        // Or for arrays like locations/files, easier to just send the current state to replace.
        const isChanged = !isEditing || JSON.stringify(newVal) !== JSON.stringify(oldVal);

        // Usually for multipart forms we send keys if they have values or changed
        if (!isEmpty || isChanged) {
          formData.append(key, newVal);
        }
      };

      // 1. Basic Fields
      appendIfChanged("organizationId", organizationId || "", original.organizationId);
      appendIfChanged("name", newItem.name || "", original.name);
      appendIfChanged("description", newItem.description || "", original.description);
      appendIfChanged("unitCost", newItem.unitCost ? String(newItem.unitCost) : "", original.unitCost ? String(original.unitCost) : "");
      
      const newQr = newItem.qrCode ? `part/${String(newItem.qrCode).replace('part/', '')}` : "";
      if (newQr) formData.append("qrCode", newQr);

      // 2. Arrays (JSON)
      const partTypeVal = Array.isArray(newItem.partsType) ? newItem.partsType : [];
      if (partTypeVal.length > 0) {
        formData.append("partsType", JSON.stringify(partTypeVal));
      }

      if (Array.isArray(newItem.assetIds) && newItem.assetIds.length > 0) {
        formData.append("assetIds", JSON.stringify(newItem.assetIds));
      }
      if (Array.isArray(newItem.teamsInCharge) && newItem.teamsInCharge.length > 0) {
        formData.append("teamsInCharge", JSON.stringify(newItem.teamsInCharge));
      }
      if (Array.isArray(newItem.vendorIds) && newItem.vendorIds.length > 0) {
        formData.append("vendorIds", JSON.stringify(newItem.vendorIds));
      }

      // 3. ✅ LOCATIONS LOGIC (Fixed for Multiple Locations)
      let locationsPayload: any[] = [];

      // Case A: If user added multiple locations via the list (newItem.locations)
      if (newItem.locations && newItem.locations.length > 0) {
        locationsPayload = newItem.locations.map((loc: any) => ({
           locationId: loc.locationId || loc.id,
           area: loc.area || "",
           unitsInStock: Number(loc.unitsInStock ?? loc.unitInStock ?? 0),
           minimumInStock: Number(loc.minimumInStock ?? loc.minInStock ?? 0)
        }));
      } 
      // Case B: Fallback for the single location inputs (if used)
      else if (newItem.locationId || newItem.area) {
        locationsPayload.push({
           locationId: newItem.locationId || "",
           area: newItem.area || "",
           unitsInStock: Number(newItem.unitInStock || 0),
           minimumInStock: Number(newItem.minInStock || 0)
        });
      }

      if (locationsPayload.length > 0) {
         formData.append("locations", JSON.stringify(locationsPayload));
      }

      // 4. Photos & Files
      if (Array.isArray(newItem.pictures) && newItem.pictures.length > 0) {
        newItem.pictures.forEach((file: any) => {
          if (file instanceof File) {
            formData.append("photos", file);
          } else if (typeof file === "string" && file.startsWith("data:")) {
            // Convert Base64 to Blob if needed
            const byteString = atob(file.split(",")[1]);
            const mimeString = file.split(",")[0].split(":")[1].split(";")[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
            const blob = new Blob([ab], { type: mimeString });
            formData.append("photos", blob);
          }
        });
      }

      if (Array.isArray(newItem.files) && newItem.files.length > 0) {
        newItem.files.forEach((file: any) => {
          formData.append("files", file instanceof File ? file : String(file));
        });
      }

      // 5. Backblaze Arrays
      const partImagesArray = partImages && partImages.length > 0 ? partImages : [];
      const partDocsArray = partDocs && partDocs.length > 0 ? partDocs : [];
      formData.append("partImages", JSON.stringify(partImagesArray));
      formData.append("partDocs", JSON.stringify(partDocsArray));

      // 6. Vendors Metadata
      if (Array.isArray(newItem.vendors) && newItem.vendors.length > 0) {
        newItem.vendors.forEach((vendor: any, index: number) => {
          formData.append(`vendors[${index}][vendorId]`, vendor.vendorId || "");
          formData.append(`vendors[${index}][orderingPartNumber]`, vendor.orderingPartNumber || "");
        });
      }

      // 7. Submit
      if (isEditing) {
        await dispatch(updatePart({ id: String(newItem.id), partData: formData })).unwrap();
        toast.success("Part updated successfully!");
      } else {
        await dispatch(createPart(formData)).unwrap();
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