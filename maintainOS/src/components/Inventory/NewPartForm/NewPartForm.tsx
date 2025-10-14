"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { createPart, updatePart } from "../../../store/parts/parts.thunks";
import { PartHeader } from "./PartHeader";
import { PartBasicDetails } from "./PartBasicDetails";
import { PartQRCodeSection } from "./PartQRCodeSection";
import { PartLocationSection } from "./PartLocationSection";
import { PartVendorsSection } from "./PartVendorsSection";
import { PartFilesSection } from "./PartFilesSection";
import { PartFooter } from "./PartFooter";
import PartType from "./PartType";
import toast from "react-hot-toast";

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

  // ✅ Get organizationId from Redux store
  const organizationId = useSelector(
    (state: RootState) => state.auth?.user?.organizationId
  );

  const handleSubmitPart = async () => {
    try {
      const formData = new FormData();

      // ✅ Basic fields
      formData.append("organizationId", organizationId || "");
      formData.append("name", newItem.name || "");
      formData.append("description", newItem.description || "");
      formData.append("unitCost", newItem.unitCost ? String(newItem.unitCost) : "0");
      formData.append("qrCode", newItem.qrCode || "");

      // ✅ Part Type (JSON)
      formData.append("partsType", JSON.stringify(newItem.partsType || []));

      // ✅ Locations (as JSON array)
      const locationsPayload = [
        {
          locationId: newItem.locationId || "",
          area: newItem.area || "",
          unitsInStock: Number(newItem.unitInStock || 0),
          minimumInStock: Number(newItem.minInStock || 0),
        },
      ];
      formData.append("locations", JSON.stringify(locationsPayload));

      // ✅ Other arrays (JSON)
      formData.append("assetIds", JSON.stringify(newItem.assetIds || []));
      formData.append("teamsInCharge", JSON.stringify(newItem.teamsInCharge || []));
      formData.append("vendorIds", JSON.stringify(newItem.vendorIds || []));

      // ✅ Photos
      if (Array.isArray(newItem.pictures) && newItem.pictures.length > 0) {
        newItem.pictures.forEach((file: any) => {
          if (file instanceof File) {
            formData.append("photos", file);
          } else if (typeof file === "string" && file.startsWith("data:")) {
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

      // ✅ Files (attachments)
      if (Array.isArray(newItem.files) && newItem.files.length > 0) {
        newItem.files.forEach((file: any) => {
          formData.append("files", file instanceof File ? file : String(file));
        });
      }

      // ✅ Vendors extra mapping (optional)
      if (Array.isArray(newItem.vendors)) {
        newItem.vendors.forEach((vendor: any, index: number) => {
          formData.append(`vendors[${index}][vendorId]`, vendor.vendorId || "");
          formData.append(`vendors[${index}][orderingPartNumber]`, vendor.orderingPartNumber || "");
        });
      }

      // ✅ Debug Log
      console.log("📦 FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // ✅ Dispatch create or update
      if (newItem.id) {
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
          <PartQRCodeSection
            qrCode={newItem.qrCode}
            setQrCode={(code) => setNewItem((s: any) => ({ ...s, qrCode: code }))}
          />
          <PartType newItem={newItem} setNewItem={setNewItem} />
          <PartLocationSection newItem={newItem} setNewItem={setNewItem} />
          <PartVendorsSection
            newItem={newItem}
            setNewItem={setNewItem}
            addVendorRow={addVendorRow}
            removeVendorRow={removeVendorRow}
          />
          <PartFilesSection />
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
