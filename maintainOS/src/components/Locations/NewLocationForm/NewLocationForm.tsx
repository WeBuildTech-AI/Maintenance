"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { AddressAndDescription } from "./AddressAndDescription";
import { QrCodeSection } from "./QrCodeSection";
import { Dropdowns } from "./Dropdowns";
import { FooterActions } from "./FooterActions";
import { BlobUpload, type BUD } from "../../utils/BlobUpload";

import type { RootState, AppDispatch } from "../../../store";
import { createLocation, updateLocation } from "../../../store/locations";
import type { LocationResponse } from "../../../store/locations";

// Helper type for options
type Option = { id: string; name: string };

type NewLocationFormProps = {
  onCancel: () => void;
  onCreate: (locationData: LocationResponse) => void;
  onSuccess: (locationData: LocationResponse) => void;
  isEdit?: boolean;
  editData?: LocationResponse | null;
  initialParentId?: string;
  isSubLocation?: boolean;
  fetchLocations: () => void;
  fetchLocationById: () => void;
};

export function NewLocationForm({
  onCancel,
  onCreate,
  onSuccess,
  isEdit = false,
  editData = null,
  initialParentId,
  isSubLocation = false,
  fetchLocations,
  fetchLocationById,
}: NewLocationFormProps) {
  const [locationImages, setLocationImages] = useState<BUD[]>([]);
  const [locationDocs, setLocationDocs] = useState<BUD[]>([]);
  const [name, setName] = useState("");
  const [submitLocationFormLoader, setSubmitLocationFormLoader] = useState(false);
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [teamInCharge, setTeamInCharge] = useState<string[]>([]);
  const [vendorId, setVendorId] = useState<string[]>([]);
  const [parentLocationId, setParentLocationId] = useState("");

  // ✅ NEW: Store hydrated options for prefilling UI
  const [preloadedTeams, setPreloadedTeams] = useState<Option[]>([]);
  const [preloadedVendors, setPreloadedVendors] = useState<Option[]>([]);
  const [preloadedParent, setPreloadedParent] = useState<Option[]>([]);

  const [teamOpen, setTeamOpen] = useState(false);
  const [vendorOpen, setVendorOpen] = useState(false);
  const [parentOpen, setParentOpen] = useState(false);

  const teamRef = useRef<HTMLDivElement>(null!);
  const vendorRef = useRef<HTMLDivElement>(null!);
  const parentRef = useRef<HTMLDivElement>(null!);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (isEdit && editData) {
      setName(editData.name);
      setAddress(editData.address || "");
      setDescription(editData.description || "");
      setQrCode(editData.qrCode?.split("/").pop() || "");
      
      // 1. Handle Parent ID
      setParentLocationId(editData.parentLocationId || "");

      // 2. Handle Vendors (IDs + Hydration)
      if (editData.vendorIds && editData.vendorIds.length > 0) {
        setVendorId(editData.vendorIds);
      } else if ((editData as any).vendors && Array.isArray((editData as any).vendors)) {
        setVendorId((editData as any).vendors.map((v: any) => v.id));
      } else {
        setVendorId([]);
      }

      // ✅ Hydrate Vendor Options (So pills show names immediately)
      if ((editData as any).vendors && Array.isArray((editData as any).vendors)) {
        setPreloadedVendors((editData as any).vendors);
      }

      // 3. Handle Teams (IDs + Hydration)
      if (editData.teamsInCharge && editData.teamsInCharge.length > 0) {
        setTeamInCharge(editData.teamsInCharge);
      }
      
      // ✅ Hydrate Team Options
      if ((editData as any).teams && Array.isArray((editData as any).teams)) {
        setPreloadedTeams((editData as any).teams);
      }

      // 4. Handle Parent (Hydration)
      // Note: If the backend provides a 'parentLocation' object, use it here.
      // If not, the ID will remain, but the name might be missing until dropdown click.
      if ((editData as any).parentLocation) {
         setPreloadedParent([(editData as any).parentLocation]);
      }

      // Images & Files
      if (editData.locationImages) {
        setLocationImages(editData.locationImages);
      } else if (editData.photoUrls) {
        setLocationImages(editData.photoUrls);
      }

      if (editData.locationDocs) {
        setLocationDocs(editData.locationDocs);
      } else if (editData.files) {
        setLocationDocs(editData.files);
      }
    }
  }, [isEdit, editData]);

  useEffect(() => {
    if (initialParentId && !isEdit) {
      setParentLocationId(initialParentId);
    }
  }, [initialParentId, isEdit]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (teamRef.current && !teamRef.current.contains(event.target as Node))
        setTeamOpen(false);
      if (vendorRef.current && !vendorRef.current.contains(event.target as Node))
        setVendorOpen(false);
      if (parentRef.current && !parentRef.current.contains(event.target as Node))
        setParentOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBlobChange = (data: { formId: string; buds: BUD[] }) => {
    if (data.formId === "location_images") {
      setLocationImages(data.buds);
    } else if (data.formId === "location_docs") {
      setLocationDocs(data.buds);
    }
  };

  const handleSubmitLocation = async () => {
    if (!user?.id || !user?.organizationId) {
      toast.error("User or Organization ID missing.");
      return;
    }
    if (!name.trim()) {
      toast.error("Location Name is required.");
      return;
    }

    setSubmitLocationFormLoader(true);
    const formData = new FormData();

    formData.append("name", String(name.trim()));
    formData.append("createdBy", String(user.id));

    if (description) formData.append("description", String(description));
    if (address) formData.append("address", String(address));
    if (qrCode) formData.append("qrCode", `location/${String(qrCode)}`);
    if (parentLocationId && parentLocationId.trim()) {
      formData.append("parentLocationId", String(parentLocationId));
    }

    if (teamInCharge && teamInCharge.length > 0) {
      teamInCharge.forEach((team) => formData.append("teamsInCharge[]", team));
    }

    if (vendorId && vendorId.length > 0) {
      vendorId.forEach((vendor) => formData.append("vendorIds[]", vendor));
    }

    // Images & Docs
    locationImages?.forEach((image, index) => {
      formData.append(`locationImages[${index}][key]`, image.key);
      formData.append(`locationImages[${index}][fileName]`, image.fileName);
    });

    locationDocs?.forEach((doc, index) => {
      formData.append(`locationDocs[${index}][key]`, doc.key);
      formData.append(`locationDocs[${index}][fileName]`, doc.fileName);
    });

    try {
      let res;
      if (isEdit && editData?.id) {
        res = await dispatch(updateLocation({ id: editData.id, locationData: formData })).unwrap();
        toast.success("Location updated successfully");
        onSuccess(res);
      } else {
        res = await dispatch(createLocation(formData)).unwrap();
        toast.success(isSubLocation ? "Sub-location added!" : "Location created!");
        isSubLocation ? fetchLocationById() : onCreate(res);
      }

      setTimeout(() => fetchLocations(), 500);
      onCancel();
    } catch (err: any) {
      console.error("Failed to submit location:", err);
      toast.error(err.message || "An error occurred.");
    } finally {
      setSubmitLocationFormLoader(false);
    }
  };

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
        <div className="p-4 border-b flex-none">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0 mb-2">
          <div className="space-y-1">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Location Name"
              className="w-full px-0 py-2 p-3 text-gray-400 placeholder-gray-400 bg-transparent border-0 border-b-4 border-blue-500 focus:outline-none"
            />
          </div>
          <BlobUpload
            formId="location_images"
            type="images"
            initialBuds={locationImages}
            onChange={handleBlobChange}
          />
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
            onSelect={(val) => setTeamInCharge(Array.isArray(val) ? val : [val])}
            preloadedOptions={preloadedTeams} // ✅ Pass hydrated data
          />
          
          <QrCodeSection qrCode={qrCode} setQrCode={setQrCode} />
          
          <BlobUpload
            formId="location_docs"
            type="files"
            initialBuds={locationDocs}
            onChange={handleBlobChange}
          />
          
          <Dropdowns
            stage="vendors"
            open={vendorOpen}
            setOpen={setVendorOpen}
            containerRef={vendorRef}
            navigate={navigate}
            value={vendorId}
            onSelect={(val) => setVendorId(Array.isArray(val) ? val : [val])}
            preloadedOptions={preloadedVendors} // ✅ Pass hydrated data
          />
          
          <Dropdowns
            stage="parent"
            open={parentOpen}
            setOpen={setParentOpen}
            containerRef={parentRef}
            navigate={navigate}
            value={parentLocationId}
            onSelect={(val) => setParentLocationId(val as string)}
            disabled={isEdit || isSubLocation}
            preloadedOptions={preloadedParent} // ✅ Pass hydrated data
          />
        </div>

        <FooterActions
          onCancel={onCancel}
          onCreate={handleSubmitLocation}
          submitLocationFormLoader={submitLocationFormLoader}
          isEdit={isEdit}
          buttonText={buttonText}
        />
      </div>
    </>
  );
}