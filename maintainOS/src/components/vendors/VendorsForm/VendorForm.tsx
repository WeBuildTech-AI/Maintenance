"use client";

import { type FormEvent, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import type { SelectOption } from "./DynamicSelect";
import { fetchLocationsName } from "../../../store/locations/locations.thunks";
import { fetchAssetsName } from "../../../store/assets/assets.thunks";
import { partService } from "../../../store/parts"; 
import { VendorPrimaryDetails } from "./VendorPrimaryDetails";
import { VendorContactInput, type ContactFormData } from "./VendorContactInput";
import { VendorLinkedItems } from "./VendorLinkedItems";
import { saveVendor } from "./vendorService";
import { BlobUpload, type BUD } from "../../utils/BlobUpload";
import toast from "react-hot-toast";

// Helper to compare arrays (sets) for changes
const hasArrayChanged = (current: string[], initial: string[] = []) => {
  if (current.length !== (initial?.length || 0)) return true;
  const s1 = new Set(current);
  const s2 = new Set(initial || []);
  for (const item of s1) {
    if (!s2.has(item)) return true;
  }
  return false;
};

// Helper to compare complex objects (Contacts)
const hasContactsChanged = (current: any[], initial: any[] = []) => {
    const normalize = (c: any) => ({
        fullName: c.fullName || c.name || "",
        role: c.role || "",
        email: c.email || "",
        phoneNumber: c.phoneNumber || c.phone || "",
        phoneExtension: c.phoneExtension || "",
        contactColor: c.contactColor || c.color || "#EC4899",
        id: (c.id || c._id || "").toString(),
    });

    const c1 = current.map(normalize);
    const c2 = initial.map(normalize);

    return JSON.stringify(c1) !== JSON.stringify(c2);
};

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

  // Store original IDs for dirty checking later
  const originalIds = useRef({
      locations: [] as string[],
      assets: [] as string[],
      parts: [] as string[],
  });

  // --- Fetchers ---
  const handleFetchLocations = () => {
    setLocationsLoading(true);
    dispatch(fetchLocationsName())
      .unwrap()
      .then((response) => {
        const list = response || [];
        const options = list.map((loc: any) => ({
          id: (loc.id || loc._id || String(loc)).toString(),
          name: loc.name || loc.location_name || "Unnamed",
        }));
        setAvailableLocations(options);
      })
      .catch((err) => console.error("🚨 Fetch locations failed:", err))
      .finally(() => setLocationsLoading(false));
  };

  const handleFetchAssets = () => {
    setAssetsLoading(true);
    dispatch(fetchAssetsName())
      .unwrap()
      .then((response) => {
        const list = response || [];
        const options = list.map((asset: any) => ({
          id: (asset.id || asset._id || String(asset)).toString(),
          name: asset.name || asset.asset_name || "Unnamed",
        }));
        setAvailableAssets(options);
      })
      .catch((err) => console.error("🚨 Fetch assets failed:", err))
      .finally(() => setAssetsLoading(false));
  };

  const handleFetchParts = async () => {
    setPartsLoading(true);
    try {
      const res: any = await partService.fetchParts({ limit: 1000 });
      const items = Array.isArray(res) ? res : res.items || [];
      const options = items.map((p: any) => ({
        id: (p.id || p._id || "").toString(),
        name: p.name || "Unnamed Part",
      }));
      setAvailableParts(options);
    } catch (err) {
      console.error("🚨 Fetch parts failed:", err);
    } finally {
      setPartsLoading(false);
    }
  };

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

      // PREFILL CONTACTS
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

      // ✅ PREFILL & SAVE ORIGINAL IDs
      // Locations
      const rawLocs = initialData.locations || [];
      const locIds = rawLocs.map((l: any) => (typeof l === 'string' ? l : (l.id || l._id || "").toString()));
      setSelectedLocationIds(locIds);
      originalIds.current.locations = locIds;

      // Assets
      const rawAssets = initialData.assetIds || initialData.assets || [];
      const assetIds = rawAssets.map((a: any) => (typeof a === 'string' ? a : (a.id || a._id || "").toString()));
      setSelectedAssetIds(assetIds);
      originalIds.current.assets = assetIds;

      // Parts
      const rawParts = initialData.partIds || initialData.parts || [];
      const partIds = rawParts.map((p: any) => (typeof p === 'string' ? p : (p.id || p._id || "").toString()));
      setSelectedPartIds(partIds);
      originalIds.current.parts = partIds;

      // Trigger fetch so options are available for the prefilled IDs
      handleFetchLocations();
      handleFetchAssets();
      handleFetchParts();
    }
  }, [initialData]);

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
    const isEdit = !!initialData;
    let hasChanges = false; // ✅ Track if anything changed

    // Helper to append only if changed
    const appendIfChanged = (key: string, currentVal: any, initialVal: any) => {
        if (!isEdit || currentVal !== initialVal) {
            // Treat undefined/null as empty string for comparison safety
            const sCurrent = currentVal === undefined || currentVal === null ? "" : String(currentVal);
            const sInitial = initialVal === undefined || initialVal === null ? "" : String(initialVal);
            
            if (!isEdit || sCurrent !== sInitial) {
                formData.append(key, currentVal);
                hasChanges = true;
            }
        }
    };

    appendIfChanged("name", form.name.trim(), initialData?.name);
    appendIfChanged("description", form.description, initialData?.description);
    appendIfChanged("color", form.color, initialData?.color);
    appendIfChanged("vendorType", form.vendorType?.toLowerCase(), initialData?.vendorType);

    // Contacts
    if (!isEdit || hasContactsChanged(contacts, initialData?.contacts)) {
        hasChanges = true;
        if (Array.isArray(contacts)) {
            // Signal empty array if it's now empty
            if (contacts.length === 0) {
                 formData.append("contacts", "[]"); 
            } else {
                contacts.forEach((contact, index) => {
                    formData.append(`contacts[${index}][fullName]`, contact.fullName || "");
                    formData.append(`contacts[${index}][role]`, contact.role || "");
                    formData.append(`contacts[${index}][email]`, contact.email || "");
                    formData.append(`contacts[${index}][phoneNumber]`, contact.phoneNumber || "");
                    formData.append(`contacts[${index}][phoneExtension]`, contact.phoneExtension || "");
                    formData.append(`contacts[${index}][contactColor]`, contact.contactColor || "#EC4899");
                    if ((contact as any).id) {
                         formData.append(`contacts[${index}][id]`, (contact as any).id);
                    } else if ((contact as any)._id) {
                         formData.append(`contacts[${index}][id]`, (contact as any)._id);
                    }
                });
            }
        }
    }

    // Dropdowns (Arrays)
    if (!isEdit || hasArrayChanged(selectedLocationIds, originalIds.current.locations)) {
        hasChanges = true;
        selectedLocationIds.forEach((id) => formData.append("locations[]", id));
    }
    if (!isEdit || hasArrayChanged(selectedAssetIds, originalIds.current.assets)) {
        hasChanges = true;
        selectedAssetIds.forEach((id) => formData.append("assetIds[]", id));
    }
    if (!isEdit || hasArrayChanged(selectedPartIds, originalIds.current.parts)) {
        hasChanges = true;
        selectedPartIds.forEach((id) => formData.append("partIds[]", id));
    }

    // Files (Always send if present, simpler for backend sync)
    // You can add dirty checking for files if needed, but usually strictly required for new files
    if (vendorImages.length > 0 || vendorDocs.length > 0) hasChanges = true;

    vendorImages.forEach((img, i) => {
      formData.append(`vendorImages[${i}][key]`, img.key);
      formData.append(`vendorImages[${i}][fileName]`, img.fileName);
    });
    vendorDocs.forEach((doc, i) => {
      formData.append(`vendorDocs[${i}][key]`, doc.key);
      formData.append(`vendorDocs[${i}][fileName]`, doc.fileName);
    });

    // ✅ PRODUCTION FIX: If edit mode and NO changes, don't call API
    if (isEdit && !hasChanges) {
        toast.success("No changes detected.");
        setSubmitting(false);
        onCancel(); // Close modal
        return;
    }

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

      <form
        className="min-h-0 flex-1 overflow-y-auto space-y-8 py-8"
        onSubmit={handleSubmit}
      >
        <VendorPrimaryDetails form={form} setForm={setForm} />

        <BlobUpload
          formId="vendor_profile"
          type="images"
          initialBuds={vendorImages}
          onChange={handleBlobChange}
        />

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

          vendorType={form.vendorType}
          onVendorTypeChange={(val) => setForm((f) => ({ ...f, vendorType: val }))}
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
          disabled={submitting}
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
            backgroundColor: submitting ? "#fdba74" : "#EA580C",
            color: "#FFFFFF",
          }}
        >
          {submitting ? "Saving..." : initialData ? "Save Changes" : "Create"}
        </button>
      </div>
    </div>
  );
}