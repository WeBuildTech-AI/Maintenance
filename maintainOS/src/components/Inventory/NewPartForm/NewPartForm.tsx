"use client";

import * as React from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store";
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

  const handleSubmitPart = async () => {
    try {
      const formData = new FormData();

      // ✅ Basic fields
      formData.append("organizationId", newItem.organizationId || "");
      formData.append("name", newItem.name || "");
      formData.append("description", newItem.description || "");
      formData.append("unitCost", newItem.unitCost ? String(newItem.unitCost) : "0");
      formData.append("qrCode", newItem.qrCode || "");

      // ✅ Nested Locations
      if (Array.isArray(newItem.locations) && newItem.locations.length > 0) {
        newItem.locations.forEach((loc: any, index: number) => {
          formData.append(`locations[${index}][locationId]`, loc.locationId || "");
          formData.append(`locations[${index}][area]`, loc.area || "");
          formData.append(`locations[${index}][unitsInStock]`, String(loc.unitsInStock || 0));
          formData.append(`locations[${index}][minimumInStock]`, String(loc.minimumInStock || 0));
        });
      }

      // ✅ Arrays
      (newItem.partsType || []).forEach((t: any) => formData.append("partsType", t));
      (newItem.assetIds || []).forEach((a: any) => formData.append("assetIds", a));
      (newItem.teamsInCharge || []).forEach((t: any) => formData.append("teamsInCharge", t));
      (newItem.vendorIds || []).forEach((v: any) => formData.append("vendorIds", v));

      // ✅ Photos (base64 or File)
      if (Array.isArray(newItem.pictures) && newItem.pictures.length > 0) {
        newItem.pictures.forEach((file: any) => {
          if (file instanceof File) {
            formData.append("photos", file);
          } else if (typeof file === "string" && file.startsWith("data:")) {
            // handle base64 strings
            const byteString = atob(file.split(",")[1]);
            const mimeString = file.split(",")[0].split(":")[1].split(";")[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            formData.append("photos", blob);
          }
        });
      }

      // ✅ Files (attachments)
      if (Array.isArray(newItem.files) && newItem.files.length > 0) {
        newItem.files.forEach((file: any) => {
          if (file instanceof File) {
            formData.append("files", file);
          } else {
            formData.append("files", file); // fallback string filenames
          }
        });
      }

      // ✅ Vendors
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

      // ✅ Dispatch
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
      <PartHeader />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto w-full max-w-[840px] p-6 space-y-20">
          <PartBasicDetails newItem={newItem} setNewItem={setNewItem} />
          <PartQRCodeSection
            qrCode={newItem.qrCode}
            setQrCode={(code) => setNewItem((s: any) => ({ ...s, qrCode: code }))}
          />
          <PartType />
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
      />
    </div>
  );
}
