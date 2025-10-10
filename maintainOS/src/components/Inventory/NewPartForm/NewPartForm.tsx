"use client";

import * as React from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store";
import { createPart } from "../../../store/parts/parts.thunks";
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

  const handleCreatePart = async () => {
    try {
      // ✅ create form data
      const formData = new FormData();

      formData.append("name", newItem.name || "");
      formData.append("description", newItem.description || "");
      formData.append("unitCost", String(newItem.unitCost || 0));
      formData.append("unitInStock", String(newItem.unitInStock || 0));
      formData.append("minInStock", String(newItem.minInStock || 0));
      formData.append("area", newItem.area || "");
      formData.append("locationId", newItem.locationId || "");
      formData.append("qrCode", newItem.qrCode || "");

      // ✅ Append arrays properly
      (newItem.partsType || []).forEach((t: any) => formData.append("partsType[]", t));
      (newItem.assetIds || []).forEach((a: any) => formData.append("assetIds[]", a));
      (newItem.teamsInCharge || []).forEach((t: any) => formData.append("teamsInCharge[]", t));
      (newItem.vendorIds || []).forEach((v: any) => formData.append("vendorIds[]", v));

      // ✅ Append photos (image files)
      if (newItem.pictures && newItem.pictures.length > 0) {
        newItem.pictures.forEach((file: File) => {
          formData.append("photos", file);
        });
      }

      // ✅ Append files section (attachments)
      if (newItem.files && newItem.files.length > 0) {
        newItem.files.forEach((file: File) => {
          formData.append("files", file);
        });
      }

      // ✅ Debug payload before sending
      console.log("📦 Final FormData payload:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // ✅ Dispatch API
      await dispatch(createPart(formData)).unwrap();

      toast.success("Part created successfully!");
      onCreate();
    } catch (error: any) {
      console.error("❌ Error creating part:", error);
      toast.error("Failed to create part");
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

      <PartFooter onCancel={onCancel} onCreate={handleCreatePart} disabled={!newItem.name} />
    </div>
  );
}
