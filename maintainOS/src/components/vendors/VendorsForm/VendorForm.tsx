"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import { createVendor } from "../../../store/vendors";
import type { SelectOption } from "./DynamicSelect";
import { fetchLocationsName } from "../../../store/locations/locations.thunks";
import { fetchAssetsName } from "../../../store/assets/assets.thunks";
import { fetchPartsName } from "../../../store/parts/parts.thunks";
import { VendorPrimaryDetails } from "./VendorPrimaryDetails";
import { VendorPicturesInput } from "./VendorPicturesInput";
import { VendorContactInput } from "./VendorContactInput";
import { VendorAttachmentsInput } from "./VendorAttachmentsInput";
import { VendorLinkedItems } from "./VendorLinkedItems";
import toast from "react-hot-toast";

// ✅ Contact interface matching backend ContactDto
export interface ContactFormData {
  fullName: string;
  role: string;
  email: string;
  phoneNumber: string; // backend expects phoneNumber
  phoneExtension: string;
  contactColour: string; // backend expects contactColour
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

  const [pictures, setPictures] = useState<File[]>([]);
  const [attachedDocs, setAttachedDocs] = useState<File[]>([]);
  const [showContactInputs, setShowContactInputs] = useState(false);
  const [contact, setContact] = useState({ email: "", phone: "" }); // legacy single contact
  const [contacts, setContacts] = useState<ContactFormData[]>([]); // NEW: contacts array (optional)
  const [showInputs, setShowInputs] = useState(false);
  const [availableLocations, setAvailableLocations] = useState<SelectOption[]>(
    []
  );
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
        const options = response.data.map((loc: any) => ({
          id: loc.id,
          name: loc.name,
        }));
        setAvailableLocations(options);
      })
      .finally(() => setLocationsLoading(false));
  };

  const handleFetchAssets = () => {
    setAssetsLoading(true);
    dispatch(fetchAssetsName({ limit: 1000, page: 1, offset: 0 }))
      .unwrap()
      .then((response) => {
        const options = response.data.map((asset: any) => ({
          id: asset.id,
          name: asset.name,
        }));
        setAvailableAssets(options);
      })
      .finally(() => setAssetsLoading(false));
  };

  const handleFetchParts = () => {
    setPartsLoading(true);
    dispatch(fetchPartsName({ limit: 1000, page: 1, offset: 0 }))
      .unwrap()
      .then((response) => {
        const options = response.data.map((part: any) => ({
          id: part.id,
          name: part.name,
        }));
        setAvailableParts(options);
      })
      .finally(() => setPartsLoading(false));
  };

  // ✅ Navigate to creation pages when clicking “+ Create New …”
  const handleCtaClick = (path: string) => {
    navigate(path);
  };

  const handleFilesSelected = (selectedFiles: File[]) => {
    const imageFiles: File[] = [];
    const docFiles: File[] = [];

    for (const file of selectedFiles) {
      if (file.type.startsWith("image/")) {
        imageFiles.push(file);
      } else {
        docFiles.push(file);
      }
    }

    if (imageFiles.length > 0) {
      setPictures((prev) => [...prev, ...imageFiles]);
      toast.success(`${imageFiles.length} image(s) added.`);
    }
    if (docFiles.length > 0) {
      setAttachedDocs((prev) => [...prev, ...docFiles]);
      toast.success(`${docFiles.length} document(s) attached.`);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.name.trim()) return;

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

    // ✅ Basic fields
    appendIfPresent("organizationId", user.organizationId);
    appendIfPresent("name", form.name.trim());
    appendIfPresent("description", form.description);
    appendIfPresent("color", form.color);
    appendIfPresent("vendorType", form.vendorType?.toLowerCase());

    // ✅ CONTACTS — Must be an array as per backend ContactDto[]
    const contactsArray = [];

    if (Array.isArray(contacts) && contacts.length > 0) {
      // Convert frontend contacts to backend format
      contacts.forEach((contact) => {
        if (contact.fullName || contact.email || contact.phoneNumber) {
          // Format phone number properly for international validation
          let formattedPhone = contact.phoneNumber || "";
          if (formattedPhone && !formattedPhone.startsWith("+")) {
            // If phone extension exists and doesn't start with +, combine them
            if (
              contact.phoneExtension &&
              contact.phoneExtension.startsWith("+")
            ) {
              formattedPhone = contact.phoneExtension + formattedPhone;
            } else if (
              formattedPhone.startsWith("91") ||
              formattedPhone.startsWith("1")
            ) {
              // If starts with country code, add +
              formattedPhone = "+" + formattedPhone;
            } else {
              // Default to +91 for Indian numbers (adjust as needed)
              formattedPhone = "+91" + formattedPhone;
            }
          }

          contactsArray.push({
            fullName: contact.fullName || "",
            role: contact.role || "",
            email: contact.email || "",
            phoneNumber: formattedPhone, // backend expects 'phoneNumber' in international format
            phoneExtension: contact.phoneExtension || "",
            contactColour: contact.contactColour || "#EC4899", // backend expects 'contactColour'
          });
        }
      });
    } else if (contact && (contact.email.trim() || contact.phone.trim())) {
      // fallback for legacy single contact - convert to array format
      let formattedPhone = contact.phone || "";
      if (formattedPhone && !formattedPhone.startsWith("+")) {
        // Default to +91 for Indian numbers (adjust as needed)
        formattedPhone = "+91" + formattedPhone;
      }

      contactsArray.push({
        fullName: "",
        role: "",
        email: contact.email || "",
        phoneNumber: formattedPhone, // backend expects 'phoneNumber' in international format
        phoneExtension: "",
        contactColour: "#EC4899", // backend expects 'contactColour'
      });
    }

    // Send each contact as individual array items in FormData
    if (contactsArray.length > 0) {
      contactsArray.forEach((contact, index) => {
        formData.append(`contacts[${index}][fullName]`, contact.fullName);
        formData.append(`contacts[${index}][role]`, contact.role);
        formData.append(`contacts[${index}][email]`, contact.email);
        formData.append(`contacts[${index}][phoneNumber]`, contact.phoneNumber);
        formData.append(
          `contacts[${index}][phoneExtension]`,
          contact.phoneExtension
        );
        formData.append(
          `contacts[${index}][contactColour]`,
          contact.contactColour
        );
      });
    }

    // Debug: Log FormData contents
    console.log("FormData contents:");
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    // ✅ Arrays
    if (Array.isArray(selectedLocationIds) && selectedLocationIds.length > 0) {
      selectedLocationIds.forEach((id) => formData.append("locations[]", id));
    }

    if (Array.isArray(selectedAssetIds) && selectedAssetIds.length > 0) {
      selectedAssetIds.forEach((id) => formData.append("assetIds[]", id));
    }

    if (Array.isArray(selectedPartIds) && selectedPartIds.length > 0) {
      selectedPartIds.forEach((id) => formData.append("partIds[]", id));
    }

    // ✅ Files (images + docs)
    if (pictures.length > 0) {
      pictures.forEach((pic) => {
        formData.append("files", pic);
      });
    }
    if (attachedDocs.length > 0) {
      attachedDocs.forEach((f) => formData.append("files", f));
    }

    try {
      if (initialData && onSubmit) {
        const updatePayload = formData;
        onSubmit(updatePayload);
        toast.success("Vendor updated successfully");
      } else {
        const created = await dispatch(createVendor(formData)).unwrap();
        toast.success("Vendor created successfully");
        if (onSuccess) onSuccess(created);
      }

      // reset
      setForm({
        name: "",
        description: "",
        category: "",
        services: "",
        createdBy: "",
        partsSummary: "",
        color: "#2563eb",
        vendorType: "Manufacturer",
      });
      setContact({ email: "", phone: "" });
      setContacts([]); // reset contacts array too
      setSelectedAssetIds([]);
      setSelectedPartIds([]);
      setPictures([]);
      setAttachedDocs([]);

      onCancel();
    } catch (err) {
      console.error("Failed to submit vendor:", err);
      toast.error("Error while saving vendor");
    }
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
        <VendorPicturesInput
          files={pictures}
          setFiles={setPictures}
          onFilesSelected={handleFilesSelected}
        />
        <VendorContactInput
          contact={contact}
          setContact={setContact}
          showInputs={showInputs}
          setShowInputs={setShowInputs}
          // NEW: agar tum NewContactModal waala table use karte ho,
          // to yeh callback array upar lift karega
          onContactsChange={setContacts}
        />

        <VendorAttachmentsInput
          attachedDocs={attachedDocs}
          setAttachedDocs={setAttachedDocs}
          onFilesSelected={handleFilesSelected}
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
