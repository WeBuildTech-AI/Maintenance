"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { PicturesUpload } from "./PicturesUpload";
import { AddressAndDescription } from "./AddressAndDescription";
import { QrCodeSection } from "./QrCodeSection";
import { FilesUpload } from "./FilesUpload";
import { Dropdowns } from "./Dropdowns";
import { FooterActions } from "./FooterActions";

import type { RootState, AppDispatch } from "../../../store";
import { createLocation, updateLocation } from "../../../store/locations";
import type { LocationResponse } from "../../../store/locations";

// ✅ CHANGE 1: Updated props to be more specific
type NewLocationFormProps = {
  onCancel: () => void;
  // This is called when a NEW item (root or sub) is created
  onCreate: (locationData: LocationResponse) => void;
  // This is called ONLY when an existing item is successfully updated
  onSuccess: (locationData: LocationResponse) => void;
  isEdit?: boolean;
  editData?: LocationResponse | null;
  initialParentId?: string;
  // ✨ NEW: Prop to identify if the form is for a sub-location
  isSubLocation?: boolean;
  fetchLocations: () => void;
};

export function NewLocationForm({
  onCancel,
  onCreate, // ✅ Use new prop
  onSuccess,
  isEdit = false,
  editData = null,
  initialParentId,
  isSubLocation = false, // ✅ Use new prop
  fetchLocations,
}: NewLocationFormProps) {
  const [pictures, setPictures] = useState<File[]>([]);
  const [attachedDocs, setAttachedDocs] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [submitLocationFormLoader, setSubmitLocationFormLoader] =
    useState(false);
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [teamInCharge, setTeamInCharge] = useState<string[]>([]);
  const [vendorId, setVendorId] = useState<string[]>([]);
  const [parentLocationId, setParentLocationId] = useState("");

  const [teamOpen, setTeamOpen] = useState(false);
  const [vendorOpen, setVendorOpen] = useState(false);
  const [parentOpen, setParentOpen] = useState(false);

  const teamRef = useRef<HTMLDivElement>(null!);
  const vendorRef = useRef<HTMLDivElement>(null!);
  const parentRef = useRef<HTMLDivElement>(null!);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  // Pre-fill fields if editing (no changes here)
  useEffect(() => {
    if (isEdit && editData) {
      setName(editData.name);
      setAddress(editData.address || "");
      setDescription(editData.description || "");
      setQrCode(editData.qrCode || "");
      setVendorId(editData.vendorIds || []);
      setParentLocationId(editData.parentLocationId || "");
      // Note: mapping `photoUrls` to `File[]` is complex.
      // This line might need adjustment if `editData.photoUrls` is not an array of File objects.
      // setPictures(editData.photoUrls || []);
    }
  }, [isEdit, editData]);

  // Pre-fill parent ID for sub-locations (no changes here)
  useEffect(() => {
    if (initialParentId && !isEdit) {
      setParentLocationId(initialParentId);
    }
  }, [initialParentId, isEdit]);

  // Click outside handler (no changes here)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (teamRef.current && !teamRef.current.contains(event.target as Node))
        setTeamOpen(false);
      if (
        vendorRef.current &&
        !vendorRef.current.contains(event.target as Node)
      )
        setVendorOpen(false);
      if (
        parentRef.current &&
        !parentRef.current.contains(event.target as Node)
      )
        setParentOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmitLocation = async () => {
    if (!user) return;
    if (!name || !name.trim()) {
      toast.error("Location Name is required.");
      return;
    }

    setSubmitLocationFormLoader(true);
    const formData = new FormData();

    // Append fields logic is correct
    formData.append("organizationId", user.organizationId || "");
    formData.append("name", name);
    if (address) formData.append("address", address);
    if (description) formData.append("description", description);
    if (parentLocationId) formData.append("parentLocationId", parentLocationId);
    if (qrCode) formData.append("qrCode", qrCode);
    formData.append("createdBy", user.id);
    if (Array.isArray(vendorId) && vendorId.length > 0) {
      vendorId.forEach((id) => formData.append("vendorIds[]", id));
    }
    if (pictures.length > 0) {
      pictures.forEach((pic) => formData.append("photos", pic));
    }

    try {
      let res;
      if (isEdit && editData?.id) {
        res = await dispatch(
          updateLocation({ id: editData.id, locationData: formData })
        ).unwrap();
        toast.success("Location updated successfully");
        // ✅ CHANGE 3: Call onSuccess for UPDATES
        onSuccess(res);
      } else {
        res = await dispatch(createLocation(formData)).unwrap();
        toast.success(
          isSubLocation ? "Sub-location added!" : "Location created!"
        );
        // ✅ CHANGE 3: Call onCreate for CREATION
        isSubLocation ? null : onCreate(res);
      }
      fetchLocations();
      onCancel();
    } catch (err: any) {
      console.error("Failed to submit location:", err);
      toast.error(err.message || "An error occurred.");
    } finally {
      setSubmitLocationFormLoader(false);
    }
  };

  // ✅ CHANGE 2: Dynamic title and button text based on context
  const title = isEdit
    ? "Update Location Details"
    : isSubLocation
    ? "Add New Sub-Location"
    : "Create New Location";

  const buttonText = isEdit
    ? "Save Changes"
    : isSubLocation
    ? "Add Sub-Location"
    : "Create Location";

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex-none">
          {/* Use the dynamic title */}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>

        {/* Scrollable content (no changes needed in the form fields) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0 mb-2">
          {/* Location Name */}
          <div className="space-y-1">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Location Name"
              className="w-full px-0 py-2 p-3 text-gray-400 placeholder-gray-400 bg-transparent border-0 border-b-4 border-blue-500 focus:outline-none"
            />
          </div>
          <PicturesUpload pictures={pictures} setPictures={setPictures} />
          <AddressAndDescription
            address={address}
            setAddress={setAddress}
            description={description}
            setDescription={setDescription}
          />
          <Dropdowns
            stage="teams"
            open={teamOpen}
            setOpen={setTeamOpen}
            containerRef={teamRef}
            navigate={navigate}
            value={teamInCharge}
            onSelect={(val) =>
              setTeamInCharge(Array.isArray(val) ? val : [val])
            }
          />
          <QrCodeSection qrCode={qrCode} setQrCode={setQrCode} />
          <FilesUpload
            attachedDocs={attachedDocs}
            setAttachedDocs={setAttachedDocs}
          />
          <Dropdowns
            stage="vendors"
            open={vendorOpen}
            setOpen={setVendorOpen}
            containerRef={vendorRef}
            navigate={navigate}
            value={vendorId}
            onSelect={(val) => setVendorId(Array.isArray(val) ? val : [val])}
          />
          <Dropdowns
            stage="parent"
            open={parentOpen}
            setOpen={setParentOpen}
            containerRef={parentRef}
            navigate={navigate}
            value={parentLocationId}
            onSelect={(val) => setParentLocationId(val as string)}
            // You might want to disable this dropdown if editing or creating a sub-location
            disabled={isEdit || isSubLocation}
          />
        </div>

        {/* Footer Actions */}
        <FooterActions
          onCancel={onCancel}
          onCreate={handleSubmitLocation}
          submitLocationFormLoader={submitLocationFormLoader}
          isEdit={isEdit}
          // ✨ NEW: Pass the dynamic button text to the footer
          // (You will need to update the FooterActions component to accept this prop)
          buttonText={buttonText}
        />
      </div>
    </>
  );
}
