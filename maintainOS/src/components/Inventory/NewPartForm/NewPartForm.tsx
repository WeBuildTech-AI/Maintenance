// NewPartForm.tsx
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
  onCreate: (part?: any) => void;
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

  // Sync images/docs from newItem (Edit Mode)
  React.useEffect(() => {
    if (newItem?.partImages) setPartImages(newItem.partImages);
    if (newItem?.partDocs) setPartDocs(newItem.partDocs);
  }, [newItem?.partImages, newItem?.partDocs]);

  // Normalize Data on Load (Pre-fill Locations, Assets, etc.)
  React.useEffect(() => {
    if (!newItem) return;
    setNewItem((prev: any) => {
      const firstLoc = prev.locations?.[0];
      return {
        ...prev,
        // Arrays Normalization to prevent undefined errors
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
        partsType: Array.isArray(prev.partsType)
          ? prev.partsType
          : prev.partsType
            ? [prev.partsType]
            : [],

        // Map Location Data to Top-Level Fields for Inputs
        locationId:
          prev.locationId || firstLoc?.locationId || firstLoc?.id || "",
        area: prev.area || firstLoc?.area || "",
        unitsInStock: prev.unitsInStock ?? firstLoc?.unitsInStock ?? 0,
        minInStock: prev.minInStock ?? firstLoc?.minimumInStock ?? 0,
      };
    });
  }, [newItem?.id, setNewItem]);

  // ✅ HELPER: Compare Arrays (Order doesn't matter)
  const areArraysEqual = (arr1: any[], arr2: any[]) => {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
    if (arr1.length !== arr2.length) return false;
    const sorted1 = [...arr1].sort();
    const sorted2 = [...arr2].sort();
    return JSON.stringify(sorted1) === JSON.stringify(sorted2);
  };

  const handleSubmitPart = async () => {
    try {
      const isEditing = !!newItem.id;
      const original = newItem._original || {}; // The original data before editing

      // 1. Prepare Current Values (Cleaned)
      const currentUnitCost = newItem.unitCost ? Number(newItem.unitCost) : 0;
      const currentQrCode = newItem.qrCode
        ? newItem.qrCode.startsWith("part/")
          ? newItem.qrCode
          : `part/${newItem.qrCode}`
        : "";

      // Arrays
      const currentPartsType = Array.isArray(newItem.partsType) ? newItem.partsType : [];
      const currentAssetIds = Array.isArray(newItem.assetIds) ? newItem.assetIds : [];
      const currentTeams = Array.isArray(newItem.teamsInCharge) ? newItem.teamsInCharge : [];
      const currentVendorIds = Array.isArray(newItem.vendorIds) ? newItem.vendorIds : [];

      // Images/Docs
      const currentImages = Array.isArray(partImages) ? partImages : [];
      const currentDocs = Array.isArray(partDocs) ? partDocs : [];

      // ---------------------------------------------------------
      // 🛠️ FIXED LOCATIONS LOGIC
      // ---------------------------------------------------------
      // Capture the PRIMARY location from the flat form fields (updated by PartLocationSection)
      const primaryLocationUpdate = {
        locationId: newItem.locationId || "",
        area: newItem.area || "",
        unitsInStock: Number(newItem.unitsInStock ?? 0),
        minimumInStock: Number(newItem.minInStock ?? 0),
      };

      let currentLocations: any[] = [];

      if (newItem.locations && newItem.locations.length > 0) {
        // If locations exist, we update the FIRST one with the flat form data
        currentLocations = newItem.locations.map((loc: any, index: number) => {
          if (index === 0) {
            // Override first location with active form inputs
            return {
              ...loc,
              ...primaryLocationUpdate,
              locationId: primaryLocationUpdate.locationId // Explicitly ensure ID is updated
            };
          }
          // Return other locations unchanged (normalized)
          return {
            locationId: loc.locationId || loc.id,
            area: loc.area || "",
            unitsInStock: Number(loc.unitsInStock ?? 0),
            minimumInStock: Number(loc.minimumInStock ?? 0),
          };
        });
      } else {
        // If no locations array, create one from flat fields if locationId is present
        if (primaryLocationUpdate.locationId) {
          currentLocations.push(primaryLocationUpdate);
        }
      }

      const payload: any = {};

      if (isEditing) {
        // --- Simple Arrays (Asset, Teams, Types, Vendors) ---
        if (!areArraysEqual(currentPartsType, original.partsType || [])) {
          payload.partsType = currentPartsType;
        }

        // Check Asset IDs
        const originalAssetIds = original.assets?.map((a: any) => a.id) || original.assetIds || [];
        if (!areArraysEqual(currentAssetIds, originalAssetIds)) {
          payload.assetIds = currentAssetIds;
        }

        // Check Team IDs
        const originalTeamIds = original.teams?.map((t: any) => t.id) || original.teamsInCharge || [];
        if (!areArraysEqual(currentTeams, originalTeamIds)) {
          payload.teamsInCharge = currentTeams;
        }

        // Check Vendor IDs
        const originalVendorIds = original.vendors?.map((v: any) => v.id) || original.vendorIds || [];
        if (!areArraysEqual(currentVendorIds, originalVendorIds)) {
          payload.vendorIds = currentVendorIds;
        }

        // --- Complex Objects (Locations) ---
        const originalLocsMapped = (original.locations || []).map((loc: any) => ({
          locationId: loc.locationId || loc.id,
          area: loc.area || "",
          unitsInStock: Number(loc.unitsInStock ?? 0),
          minimumInStock: Number(loc.minimumInStock ?? 0),
        }));

        // Compare constructed currentLocations vs original
        if (JSON.stringify(currentLocations) !== JSON.stringify(originalLocsMapped)) {
          payload.locations = currentLocations;
        }

        // --- Files (Images / Docs) ---
        if (JSON.stringify(currentImages) !== JSON.stringify(original.partImages || [])) {
          payload.partImages = currentImages;
        }
        if (JSON.stringify(currentDocs) !== JSON.stringify(original.partDocs || [])) {
          payload.partDocs = currentDocs;
        }

      } else {
        // --- CREATE MODE: Send Everything ---
        payload.organizationId = organizationId || "";
        payload.name = newItem.name;
        payload.description = newItem.description || "";
        payload.unitCost = currentUnitCost;
        payload.qrCode = currentQrCode;
        payload.partsType = currentPartsType;

        payload.assetIds = currentAssetIds;
        payload.teamsInCharge = currentTeams;
        payload.vendorIds = currentVendorIds;
        payload.locations = currentLocations;
        payload.partImages = currentImages;
        payload.partDocs = currentDocs;
      }

      // 🛑 Final Safety Check: If Edit Mode and Payload is empty, warn user
      if (isEditing && Object.keys(payload).length === 0) {
        toast("No changes detected.");
        return;
      }

      let res;
      // 🔥 Dispatch (JSON Payload)
      if (isEditing) {
        res = await dispatch(
          updatePart({ id: String(newItem.id), partData: payload })
        ).unwrap();
        toast.success("Part updated successfully!");
      } else {
        res = await dispatch(createPart(payload)).unwrap();
        toast.success("Part created successfully!");
      }

      onCreate(res);
    } catch (error: any) {
      console.error("❌ Error saving part:", error);
      toast.error(error?.message || "Failed to save part");
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
        <PartFooter
          onCancel={onCancel}
          onCreate={handleSubmitPart}
          disabled={!newItem.name}
          isEditing={!!newItem.id}
        />
      </div>
    </div>
  );
}