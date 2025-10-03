"use client";

import { type FormEvent, useEffect, useState } from "react";
import type { AppDispatch, RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import type { CreateVendorData } from "../../../store/vendors";
import { createVendor } from "../../../store/vendors";
import type { SelectOption } from "./DynamicSelect";

// Thunks & Child Components
import { fetchLocationsName } from "../../../store/locations/locations.thunks";
import { fetchAssetsName } from "../../../store/assets/assets.thunks";
import { fetchPartsName } from "../../../store/parts/parts.thunks";
import { VendorPrimaryDetails } from "./VendorPrimaryDetails";
import { VendorPicturesInput } from "./VendorPicturesInput";
import { VendorContactInput } from "./VendorContactInput";
import { VendorAttachmentsInput } from "./VendorAttachmentsInput";
import { VendorLinkedItems } from "./VendorLinkedItems";

export function VendorForm({
  onCancel,
  initialData,
  onSubmit,
  setSelectedVendorId
}: any) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    partsSummary: "",
    color: "#2563eb",
    vendorType: "Manufacturer",
  });
  const dispatch = useDispatch<AppDispatch>();
  const [pictures, setPictures] = useState<File[]>([]);
  const [attachedDocs, setAttachedDocs] = useState<File[]>([]);
  const user = useSelector((state: RootState) => state.auth.user);
  const [showContactInputs, setShowContactInputs] = useState(false);
  const [contact, setContact] = useState({ email: "", phone: "" });

  const [availableLocations, setAvailableLocations] = useState<SelectOption[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [availableAssets, setAvailableAssets] = useState<SelectOption[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [availableParts, setAvailableParts] = useState<SelectOption[]>([]);
  const [partsLoading, setPartsLoading] = useState(false);
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setForm((f) => ({ ...f, name: initialData.name || "" }));
    }
  }, [initialData]);

  const handleFetchLocations = () => {
    setLocationsLoading(true);
    dispatch(fetchLocationsName({ limit: 1000, page: 1, offset: 0 }))
      .unwrap()
      .then((response) => {
        const options = response.data.map((loc: any) => ({ id: loc.id, name: loc.name }));
        setAvailableLocations(options);
      })
      .finally(() => setLocationsLoading(false));
  };

  const handleFetchAssets = () => {
    setAssetsLoading(true);
    dispatch(fetchAssetsName({ limit: 1000, page: 1, offset: 0 }))
      .unwrap()
      .then((response) => {
        const options = response.data.map((asset: any) => ({ id: asset.id, name: asset.name }));
        setAvailableAssets(options);
      })
      .finally(() => setAssetsLoading(false));
  };

  const handleFetchParts = () => {
    setPartsLoading(true);
    dispatch(fetchPartsName({ limit: 1000, page: 1, offset: 0 }))
      .unwrap()
      .then((response) => {
        const options = response.data.map((part: any) => ({ id: part.id, name: part.name }));
        setAvailableParts(options);
      })
      .finally(() => setPartsLoading(false));
  };

  const handleCtaClick = (path: string) => { console.log(`Navigating to ${path}`); };
  const splitFiles = (selectedFiles: File[]) => { /* ... */ };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (initialData && onSubmit) {
      const updatePayload = { 
        name: form.name,
        description: form.description,
        color: form.color,
        contacts: contact,
        assetIds: selectedAssetIds,
        partIds: selectedPartIds,
        vendorType: form.vendorType.toLowerCase(),
      };
      onSubmit(updatePayload);
      return;
    }

    const newVendor: CreateVendorData = { 
      organizationId: user.organizationId, 
      name: form.name.trim(),
      description: form.description,
      color: form.color,
      vendorType: form.vendorType.toLowerCase() as "manufacturer" | "distributor",
      contacts: contact,
      assetIds: selectedAssetIds,
      partIds: selectedPartIds,
    };
    
    dispatch(createVendor(newVendor))
      .unwrap()
      .then((res) => { 
        setSelectedVendorId(res.id); 
        onCancel(); 
      })
      .catch((err) => {
        console.error("Create API failed:", err);
      });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border">
      <div className="flex-none border-b px-6 py-4">
        <h2 className="text-xl font-semibold">{initialData ? "Edit Vendor" : "New Vendor"}</h2>
      </div>

      <form className="min-h-0 flex-1 overflow-y-auto space-y-8 py-8" onSubmit={handleSubmit}>
        <VendorPrimaryDetails form={form} setForm={setForm} />
        <VendorPicturesInput files={pictures} setFiles={setPictures} onFilesSelected={splitFiles} />
        <VendorContactInput contact={contact} setContact={setContact} showInputs={showContactInputs} setShowInputs={setShowContactInputs} />
        <VendorAttachmentsInput attachedDocs={attachedDocs} setAttachedDocs={setAttachedDocs} onFilesSelected={splitFiles} />
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
          position: 'sticky',
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '0.5rem',
          borderTop: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
          padding: '1rem 1.5rem',
        }}
      >
        <button 
          type="button"
          onClick={onCancel}
          style={{
            height: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            borderRadius: '0.375rem',
            paddingLeft: '2rem',
            paddingRight: '2rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            border: '1px solid #EA580C',
            backgroundColor: '#FFFFFF',
            color: '#EA580C',
          }}
        >
          Cancel
        </button>
        <button 
         onClick={handleSubmit}
          style={{
            height: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            borderRadius: '0.375rem',
            paddingLeft: '2rem',
            paddingRight: '2rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            border: 'none',
            backgroundColor: '#EA580C',
            color: '#FFFFFF',
          }}
        >
          {initialData ? "Save Changes" : "Create"}
        </button>
      </div>
    </div>
  );
}