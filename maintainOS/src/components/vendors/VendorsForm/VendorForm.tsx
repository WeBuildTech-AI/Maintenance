"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import type { SelectOption } from "./DynamicSelect";
import { fetchLocationsName } from "../../../store/locations/locations.thunks";
import { fetchAssetsName } from "../../../store/assets/assets.thunks";
import { VendorPrimaryDetails } from "./VendorPrimaryDetails";
import { VendorContactInput, type ContactFormData } from "./VendorContactInput";
import { VendorLinkedItems } from "./VendorLinkedItems";
import { saveVendor } from "./vendorService";
import { BlobUpload, type BUD } from "../../utils/BlobUpload";

export function VendorForm({
  onCancel,
  initialData,
  onSubmit,
  onSuccess,
}: any) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    services: "",
    createdBy: "",
    partsSummary: "",
    color: "#2563eb",
    vendorType: "manufacturer",
  });

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  const [vendorImages, setVendorImages] = useState<BUD[]>([]);
  const [vendorDocs, setVendorDocs] = useState<BUD[]>([]);

  // Contacts
  const [contacts, setContacts] = useState<ContactFormData[]>([]);

  // Dropdown States
  const [availableLocations, setAvailableLocations] = useState<SelectOption[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);

  const [availableAssets, setAvailableAssets] = useState<SelectOption[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  const [availableParts, setAvailableParts] = useState<SelectOption[]>([]);
  const [partsLoading, setPartsLoading] = useState(false);
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);

  // ✅ INITIALIZATION & PREFILL LOGIC
  useEffect(() => {
    if (initialData) {
      setForm((f) => ({
        ...f,
        name: initialData.name || "",
        description: initialData.description || "",
        category: initialData.category || "",
        services: initialData.services || "",
        partsSummary: initialData.partsSummary || "",
        color: initialData.color || "#2563eb",
        vendorType: initialData.vendorType || "manufacturer",
      }));

      if (initialData.vendorImages) setVendorImages(initialData.vendorImages);
      if (initialData.vendorDocs) setVendorDocs(initialData.vendorDocs);

      // ✅ PREFILL CONTACTS
      if (initialData.contacts) {
        try {
          const c = Array.isArray(initialData.contacts)
            ? initialData.contacts
            : typeof initialData.contacts === "string"
              ? JSON.parse(initialData.contacts)
              : [initialData.contacts];
          setContacts(c);
        } catch {
          setContacts([]);
        }
      }

      // ✅ PREFILL LOCATIONS (IDs + Options for badges)
      if (initialData.locations && Array.isArray(initialData.locations)) {
        // 1. Set IDs
        const ids = initialData.locations.map((loc: any) =>
          typeof loc === "string" ? loc : loc.id
        );
        setSelectedLocationIds(ids);

        // 2. Set Options (Important for displaying names immediately)
        const opts = initialData.locations
          .filter((loc: any) => typeof loc === "object")
          .map((loc: any) => ({
            id: loc.id,
            name: loc.name || "Unknown Location"
          }));
        if (opts.length > 0) setAvailableLocations(opts);
      }

      // ✅ PREFILL ASSETS
      if (initialData.assets && Array.isArray(initialData.assets)) {
        const ids = initialData.assets.map((a: any) => a.id);
        setSelectedAssetIds(ids);

        const opts = initialData.assets.map((a: any) => ({
          id: a.id,
          name: a.name || "Unknown Asset"
        }));
        setAvailableAssets(opts);
      } else if (initialData.assetIds) {
        setSelectedAssetIds(initialData.assetIds);
      }

      // ✅ PREFILL PARTS
      if (initialData.parts && Array.isArray(initialData.parts)) {
        const ids = initialData.parts.map((p: any) => p.id);
        setSelectedPartIds(ids);

        const opts = initialData.parts.map((p: any) => ({
          id: p.id,
          name: p.name || "Unknown Part"
        }));
        setAvailableParts(opts);
      } else if (initialData.partIds) {
        setSelectedPartIds(initialData.partIds);
      }
    }
  }, [initialData]);

  const handleFetchLocations = () => {
    setLocationsLoading(true);
    dispatch(fetchLocationsName())
      .unwrap()
      .then((response) => {
        const list = response || [];
        const options = list.map((loc: any) => ({
          id: loc.id || loc._id || String(loc),
          name: loc.name || loc.location_name || "Unnamed",
        }));
        setAvailableLocations(options);
      })
      .catch((err) => {
        console.error("🚨 Fetch locations failed:", err);
      })
      .finally(() => setLocationsLoading(false));
  };

  const handleFetchAssets = () => {
    setAssetsLoading(true);
    dispatch(fetchAssetsName())
      .unwrap()
      .then((response) => {
        const list = response || [];
        const options = list.map((asset: any) => ({
          id: asset.id || asset._id || String(asset),
          name: asset.name || asset.asset_name || "Unnamed",
        }));
        setAvailableAssets(options);
      })
      .catch((err) => {
        console.error("🚨 Fetch assets failed:", err);
      })
      .finally(() => setAssetsLoading(false));
  };

  const handleFetchParts = () => {
    setPartsLoading(true);
    // Mock or implement fetchPartsName thunk here
    setPartsLoading(false);
  };

  const handleCtaClick = (path: string) => navigate(path);

  const handleBlobChange = (data: { formId: string; buds: BUD[] }) => {
    if (data.formId === "vendor_profile") setVendorImages(data.buds);
    else if (data.formId === "vendor_docs") setVendorDocs(data.buds);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;
    setSubmitting(true);

    const formData = new FormData();
    const appendIfPresent = (key: string, value: any) => {
      if (value !== undefined && value !== null && value !== "") formData.append(key, value);
    };

    appendIfPresent("name", form.name.trim());
    appendIfPresent("description", form.description);
    appendIfPresent("color", form.color);
    appendIfPresent("vendorType", form.vendorType?.toLowerCase());

    // Contacts
    if (Array.isArray(contacts)) {
      contacts.forEach((contact, index) => {
        formData.append(`contacts[${index}][fullName]`, contact.fullName || "");
        formData.append(`contacts[${index}][role]`, contact.role || "");
        formData.append(`contacts[${index}][email]`, contact.email || "");
        formData.append(`contacts[${index}][phoneNumber]`, contact.phoneNumber || "");
        formData.append(`contacts[${index}][phoneExtension]`, contact.phoneExtension || "");
        formData.append(`contacts[${index}][contactColor]`, contact.contactColour || "#EC4899");
      });
    }

    // Dropdowns
    if (selectedLocationIds) selectedLocationIds.forEach((id) => formData.append("locations[]", id));
    if (selectedAssetIds) selectedAssetIds.forEach((id) => formData.append("assetIds[]", id));
    if (selectedPartIds) selectedPartIds.forEach((id) => formData.append("partIds[]", id));

    // Images & Docs
    vendorImages.forEach((img, i) => {
      formData.append(`vendorImages[${i}][key]`, img.key);
      formData.append(`vendorImages[${i}][fileName]`, img.fileName);
    });
    vendorDocs.forEach((doc, i) => {
      formData.append(`vendorDocs[${i}][key]`, doc.key);
      formData.append(`vendorDocs[${i}][fileName]`, doc.fileName);
    });

    await saveVendor({
      dispatch,
      formData,
      initialData,
      onSubmit,
      onSuccess,
      onCancel,
    });
    setSubmitting(false);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border">
      <div className="flex-none border-b px-6 py-4">
        <h2 className="text-xl font-semibold">
          {initialData ? "Edit Vendor" : "New Vendor"}
        </h2>
      </div>

      <form className="min-h-0 flex-1 overflow-y-auto space-y-8 py-8" onSubmit={handleSubmit}>
        <VendorPrimaryDetails form={form} setForm={setForm} />

        <BlobUpload
          formId="vendor_profile"
          type="images"
          initialBuds={vendorImages}
          onChange={handleBlobChange}
        />

        {/* ✅ Updated Contact Input with Initial Data Support */}
        <VendorContactInput
          initialContacts={contacts}
          onContactsChange={setContacts}
        />

        <BlobUpload
          formId="vendor_docs"
          type="files"
          initialBuds={vendorDocs}
          onChange={handleBlobChange}
        />

        <VendorLinkedItems
          availableLocations={availableLocations}
          selectedLocationIds={selectedLocationIds}
          onLocationsChange={setSelectedLocationIds}
          onFetchLocations={handleFetchLocations}
          locationsLoading={locationsLoading}

          availableAssets={availableAssets}
          selectedAssetIds={selectedAssetIds}
          onAssetsChange={setSelectedAssetIds}
          onFetchAssets={handleFetchAssets}
          assetsLoading={assetsLoading}

          availableParts={availableParts}
          selectedPartIds={selectedPartIds}
          onPartsChange={setSelectedPartIds}
          onFetchParts={handleFetchParts}
          partsLoading={partsLoading}

          onCtaClick={handleCtaClick}
        />
      </form>

      <div
        style={{
          position: "sticky",
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "0.5rem",
          borderTop: "1px solid #E5E7EB",
          backgroundColor: "#FFFFFF",
          padding: "1rem 1.5rem",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          style={{
            height: "2.5rem",
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            borderRadius: "0.375rem",
            paddingLeft: "2rem",
            paddingRight: "2rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            border: "1px solid #EA580C",
            backgroundColor: "#FFFFFF",
            color: "#EA580C",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          style={{
            height: "2.5rem",
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            borderRadius: "0.375rem",
            paddingLeft: "2rem",
            paddingRight: "2rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            border: "none",
            backgroundColor: "#EA580C",
            color: "#FFFFFF",
          }}
        >
          {initialData ? "Save Changes" : "Create"}
        </button>
      </div>
    </div>
  );
}