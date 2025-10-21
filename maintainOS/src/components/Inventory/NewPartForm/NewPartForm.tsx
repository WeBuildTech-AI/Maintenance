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

  // ✅ Prefill ID arrays from nested objects when editing
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
  }, [newItem?.id, setNewItem]); // ✅

  const handleSubmitPart = async () => {
    try {
      const formData = new FormData();

      const isEditing = !!newItem.id;
      const original = newItem._original || {}; // keep original fetched data for diff

      // ✅ Helper: append only changed and non-empty fields
      const appendIfChanged = (key: string, newVal: any, oldVal: any) => {
        // Handle serialized JSON case
        if (typeof newVal === "string") {
          if (newVal === "[]" || newVal === "{}") return; // skip empty JSON arrays/objects
        }

        // Ignore null / undefined / empty string / empty array / empty object
        const isEmpty =
          newVal === "" ||
          newVal === null ||
          newVal === undefined ||
          (Array.isArray(newVal) && newVal.length === 0) ||
          (typeof newVal === "object" &&
            !Array.isArray(newVal) &&
            Object.keys(newVal).length === 0);

        const isChanged =
          !isEditing || JSON.stringify(newVal) !== JSON.stringify(oldVal);

        if (!isEmpty && isChanged) {
          formData.append(key, newVal);
        }
      };

      // ✅ Basic fields
      appendIfChanged("organizationId", organizationId || "", original.organizationId);
      appendIfChanged("name", newItem.name || "", original.name);
      appendIfChanged("description", newItem.description || "", original.description);
      appendIfChanged(
        "unitCost",
        newItem.unitCost ? String(newItem.unitCost) : "",
        original.unitCost ? String(original.unitCost) : ""
      );
      appendIfChanged("qrCode", newItem.qrCode || "", original.qrCode);

      // ✅ Part Type (JSON) — now correctly skipped if empty
      const partTypeVal = Array.isArray(newItem.partsType)
        ? newItem.partsType
        : [];
      if (partTypeVal.length > 0) {
        appendIfChanged(
          "partsType",
          JSON.stringify(partTypeVal),
          JSON.stringify(original.partsType || [])
        );
      }

      // ✅ Locations (only if user actually filled anything)
      const hasLocationValues =
        newItem.locationId ||
        newItem.area ||
        Number(newItem.unitInStock) > 0 ||
        Number(newItem.minInStock) > 0;

      if (hasLocationValues) {
        const locationsPayload = [
          {
            locationId: newItem.locationId || "",
            area: newItem.area || "",
            unitsInStock: Number(newItem.unitInStock || 0),
            minimumInStock: Number(newItem.minInStock || 0),
          },
        ];
        appendIfChanged(
          "locations",
          JSON.stringify(locationsPayload),
          JSON.stringify(original.locations || [])
        );
      }

      // ✅ Arrays (only if non-empty and changed)
      if (Array.isArray(newItem.assetIds) && newItem.assetIds.length > 0) {
        appendIfChanged(
          "assetIds",
          JSON.stringify(newItem.assetIds),
          JSON.stringify(original.assetIds || [])
        );
      }
      if (Array.isArray(newItem.teamsInCharge) && newItem.teamsInCharge.length > 0) {
        appendIfChanged(
          "teamsInCharge",
          JSON.stringify(newItem.teamsInCharge),
          JSON.stringify(original.teamsInCharge || [])
        );
      }
      if (Array.isArray(newItem.vendorIds) && newItem.vendorIds.length > 0) {
        appendIfChanged(
          "vendorIds",
          JSON.stringify(newItem.vendorIds),
          JSON.stringify(original.vendorIds || [])
        );
      }

      // ✅ Photos (only if added)
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

      // ✅ Files (only if added)
      if (Array.isArray(newItem.files) && newItem.files.length > 0) {
        newItem.files.forEach((file: any) => {
          formData.append("files", file instanceof File ? file : String(file));
        });
      }

      // ✅ Vendors extra mapping (optional)
      if (Array.isArray(newItem.vendors) && newItem.vendors.length > 0) {
        newItem.vendors.forEach((vendor: any, index: number) => {
          formData.append(`vendors[${index}][vendorId]`, vendor.vendorId || "");
          formData.append(
            `vendors[${index}][orderingPartNumber]`,
            vendor.orderingPartNumber || ""
          );
        });
      }

      // ✅ Debug Log
      console.log("📦 FormData contents (final to send):");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // ✅ Create or Update
      if (isEditing) {
        await dispatch(
          updatePart({ id: String(newItem.id), partData: formData })
        ).unwrap();
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
