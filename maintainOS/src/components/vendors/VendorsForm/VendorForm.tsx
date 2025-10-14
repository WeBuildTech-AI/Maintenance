"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import type { SelectOption } from "./DynamicSelect";
import { fetchLocationsName } from "../../../store/locations/locations.thunks";
import { fetchAssetsName } from "../../../store/assets/assets.thunks";
import { fetchPartsName } from "../../../store/parts/parts.thunks";
import { VendorPrimaryDetails } from "./VendorPrimaryDetails";
import { VendorContactInput } from "./VendorContactInput";
import { VendorLinkedItems } from "./VendorLinkedItems";
import toast from "react-hot-toast";
import { saveVendor } from "./vendorService"; 
import { BlobUpload, type BUD } from "../../utils/BlobUpload";

// ✅ Contact interface matching backend ContactDto
export interface ContactFormData {
  fullName: string;
  role: string;
  email: string;
  phoneNumber: string;
  phoneExtension: string;
  contactColour: string;
}

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
    vendorType: "Manufacturer",
  });

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  const [vendorImages, setVendorImages] = useState<BUD[]>([]);
  const [vendorDocs, setVendorDocs] = useState<BUD[]>([]);
  const [contact, setContact] = useState({ email: "", phone: "" });
  const [contacts, setContacts] = useState<ContactFormData[]>([]);
  const [showInputs, setShowInputs] = useState(false);

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

  useEffect(() => {
    if (initialData) {
      setForm((f) => ({ ...f, name: initialData.name || "" }));
    }
  }, [initialData]);

  // ✅ Fetch handlers
  const handleFetchLocations = () => {
    setLocationsLoading(true);
    dispatch(fetchLocationsName())
      .unwrap()
      .then((response) => {
        console.log("📦 Raw locations API response:", response);
        const list =response || [];
        if (!Array.isArray(list)) {
          console.error("❌ Unexpected locations response format:", list);
          setAvailableLocations([]);
          return;
        }
        const options = list.map((loc: any) => ({
          id: loc.id || loc._id || String(loc),
          name: loc.name || loc.location_name || "Unnamed",
        }));
        setAvailableLocations(options);
      })
      .catch((err) => {
        console.error("🚨 Fetch locations failed:", err);
        setAvailableLocations([]);
      })
      .finally(() => setLocationsLoading(false));
  };

  const handleFetchAssets = () => {
    setAssetsLoading(true);
    dispatch(fetchAssetsName())
      .unwrap()
      .then((response) => {
        console.log("📦 Raw assets API response:", response);
        const list = response || [];
        if (!Array.isArray(list)) {
          console.error("❌ Unexpected assets response format:", list);
          setAvailableAssets([]);
          return;
        }
        const options = list.map((asset: any) => ({
          id: asset.id || asset._id || String(asset),
          name: asset.name || asset.asset_name || "Unnamed",
        }));
        setAvailableAssets(options);
      })
      .catch((err) => {
        console.error("🚨 Fetch assets failed:", err);
        setAvailableAssets([]);
      })
      .finally(() => setAssetsLoading(false));
  };

  const handleFetchParts = () => {
    setPartsLoading(true);
    dispatch(fetchPartsName())
      .unwrap()
      .then((response) => {
        console.log("📦 Raw parts API response:", response);
        const list = response || [];
        if (!Array.isArray(list)) {
          console.error("❌ Unexpected parts response format:", list);
          setAvailableParts([]);
          return;
        }
        const options = list.map((part: any) => ({
          id: part.id || part._id || String(part),
          name: part.name || part.part_name || "Unnamed",
        }));
        setAvailableParts(options);
      })
      .catch((err) => {
        console.error("🚨 Fetch parts failed:", err);
        setAvailableParts([]);
      })
      .finally(() => setPartsLoading(false));
  };

  const handleCtaClick = (path: string) => {
    navigate(path);
  };

  const handleBlobChange = (data: { formId: string; buds: BUD[] }) => {
  console.log("Upload complete for:", data.formId);
  console.table(data.buds);

  if (data.formId === "vendor_profile") {
    setVendorImages(data.buds);
  } else if (data.formId === "vendor_docs") {
    setVendorDocs(data.buds);
  }
};

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (submitting) return;
    setSubmitting(true);

    const formData = new FormData();
    const appendIfPresent = (key: string, value: any) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        formData.append(key, value);
      }
    };

    appendIfPresent("organizationId", user.organizationId);
    appendIfPresent("name", form.name.trim());
    appendIfPresent("description", form.description);
    appendIfPresent("color", form.color);
    appendIfPresent("vendorType", form.vendorType?.toLowerCase());

    const contactsArray: any[] = [];

    if (Array.isArray(contacts) && contacts.length > 0) {
      contacts.forEach((contact) => {
        if (contact.fullName || contact.email || contact.phoneNumber) {
          let formattedPhone = contact.phoneNumber || "";
          if (formattedPhone && !formattedPhone.startsWith("+")) {
            formattedPhone = contact.phoneExtension?.startsWith("+")
              ? contact.phoneExtension + formattedPhone
              : "+91" + formattedPhone;
          }
          contactsArray.push({
            fullName: contact.fullName || "",
            role: contact.role || "",
            email: contact.email || "",
            phoneNumber: formattedPhone,
            phoneExtension: contact.phoneExtension || "",
            contactColour: contact.contactColour || "#EC4899",
          });
        }
      });
    } else if (contact && (contact.email.trim() || contact.phone.trim())) {
      let formattedPhone = contact.phone || "";
      if (formattedPhone && !formattedPhone.startsWith("+")) {
        formattedPhone = "+91" + formattedPhone;
      }
      contactsArray.push({
        fullName: "",
        role: "",
        email: contact.email || "",
        phoneNumber: formattedPhone,
        phoneExtension: "",
        contactColour: "#EC4899",
      });
    }

    if (contactsArray.length > 0) {
      contactsArray.forEach((contact, index) => {
        formData.append(`contacts[${index}][fullName]`, contact.fullName);
        formData.append(`contacts[${index}][role]`, contact.role);
        formData.append(`contacts[${index}][email]`, contact.email);
        formData.append(`contacts[${index}][phoneNumber]`, contact.phoneNumber);
        formData.append(`contacts[${index}][phoneExtension]`, contact.phoneExtension);
        formData.append(`contacts[${index}][contactColor]`, contact.contactColour);
      });
    }

    if (Array.isArray(selectedLocationIds) && selectedLocationIds.length > 0) {
      selectedLocationIds.forEach((id) => formData.append("locations[]", id));
    }
    if (Array.isArray(selectedAssetIds) && selectedAssetIds.length > 0) {
      selectedAssetIds.forEach((id) => formData.append("assetIds[]", id));
    }
    if (Array.isArray(selectedPartIds) && selectedPartIds.length > 0) {
      selectedPartIds.forEach((id) => formData.append("partIds[]", id));
    }

    vendorImages.forEach((img, i) => {
      formData.append(`vendorImages[${i}][key]`, img.key);
      formData.append(`vendorImages[${i}][fileName]`, img.fileName);
    });

    vendorDocs.forEach((doc, i) => {
      formData.append(`vendorDocs[${i}][key]`, doc.key);
      formData.append(`vendorDocs[${i}][fileName]`, doc.fileName);
    });

    // ✅ Centralized saveVendor logic
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

      <BlobUpload formId="vendor_profile" type="images" onChange={handleBlobChange} />
        {/* <VendorPicturesInput
          files={pictures}
          setFiles={setPictures}
          onFilesSelected={handleFilesSelected}
        /> */}


        <VendorContactInput
          contact={contact}
          setContact={setContact}
          showInputs={showInputs}
          setShowInputs={setShowInputs}
          onContactsChange={setContacts}
        />

        <BlobUpload formId="vendor_docs" type="files" onChange={handleBlobChange} />

        {/* <VendorAttachmentsInput
          attachedDocs={attachedDocs}
          setAttachedDocs={setAttachedDocs}
          onFilesSelected={handleFilesSelected}
        /> */}
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
