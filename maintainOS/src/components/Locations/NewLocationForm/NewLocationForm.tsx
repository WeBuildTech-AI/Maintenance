"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { PicturesUpload } from "./PicturesUpload";
import { AddressAndDescription } from "./AddressAndDescription";
import { QrCodeSection } from "./QrCodeSection";
import { FilesUpload } from "./FilesUpload";
import { Dropdowns } from "./Dropdowns";
import { FooterActions } from "./FooterActions";

import type { RootState, AppDispatch } from "../../../store";
import { createLocation, updateLocation } from "../../../store/locations"; // ✅ added update
import type {
  CreateLocationData,
  LocationResponse,
} from "../../../store/locations";

type NewLocationFormProps = {
  onCancel: () => void;
  setSelectedLocation: (id: string) => void;
  setShowForm: (show: boolean) => void;
  isEdit?: boolean; // ✅ new
  editData?: LocationResponse | null; // ✅ new
};

export function NewLocationForm({
  onCancel,
  setSelectedLocation,
  setShowForm,
  isEdit = false, // ✅ default false
  editData = null, // ✅ default null
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

  // Dropdown states
  const [teamOpen, setTeamOpen] = useState(false);
  const [vendorOpen, setVendorOpen] = useState(false);
  const [parentOpen, setParentOpen] = useState(false);

  const teamRef = useRef<HTMLDivElement>(null);
  const vendorRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  // ✅ Pre-fill fields if editing
  useEffect(() => {
    if (isEdit && editData) {
      setName(editData.name || "");
      setAddress(editData.address || "");
      setDescription(editData.description || "");
      setQrCode(editData.qrCode || "");
      setVendorId(editData.vendorIds || []);
      setParentLocationId(editData.parentLocationId || "");
      setPictures(editData.photoUrls || []);
      // pictures, attachedDocs, teamInCharge can be mapped if available in API
    }
  }, [isEdit, editData]);

  // Click outside handler
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

  // Create / Update location handler

  // const handleSubmitLocation = async () => {
  //   if (!user) return;

  //   setSubmitLocationFormLoader(true);

  //   const formData = new FormData();
  //   formData.append("organizationId", user.organizationId || "");
  //   formData.append("name", name);
  //   formData.append("address", address);
  //   formData.append("description", description);
  //   formData.append("parentLocationId", parentLocationId || "");
  //   formData.append("qrCode", qrCode);

  //   // ✅ Add vendorIds as array
  //   vendorId.forEach((id) => {
  //     formData.append("vendorIds[]", id); // matches curl
  //   });

  //   // ✅ Add teamsInCharge as array
  //   teamInCharge.forEach((id) => {
  //     formData.append("teamsInCharge[]", id); // matches curl
  //   });

  //   // ✅ Add photos as array
  //   pictures.forEach((pic) => {
  //     formData.append("photos", pic); // multiple photos with same key
  //   });

  //   // ✅ Add attached docs if needed
  //   attachedDocs.forEach((doc) => {
  //     formData.append("attachedDocs", doc);
  //   });

  //   try {
  //     let res;
  //     if (isEdit && editData?.id) {
  //       // console.log([...formData.entries()]);
  //       res = await dispatch(
  //         updateLocation({ id: editData.id, data: formData })
  //       ).unwrap();
  //       toast.success("Location updated successfully");
  //     } else {
  //       res = await dispatch(createLocation(formData)).unwrap();
  //       // setSelectedLocation(res.id);
  //       toast.success("Location created successfully");
  //     }
  //     console.log("Location response:", res);
  //     // setSelectedLocation(res.id);
  //     setShowForm(false);
  //     setName("");
  //     setAddress("");
  //     setDescription("");
  //     setQrCode("");
  //     setPictures([]);
  //     setAttachedDocs([]);
  //     setTeamInCharge([]);
  //     setVendorId([]);
  //     setParentLocationId("");
  //   } catch (err) {
  //     console.error("Failed to submit location:", err);
  //     toast.error("Error while saving location");
  //   } finally {
  //     setSubmitLocationFormLoader(false);
  //   }
  // };

  const handleSubmitLocation = async () => {
    if (!user) return;
    setSubmitLocationFormLoader(true);

    try {
      const formData = new FormData();

      formData.append("organizationId", user.organizationId || "");
      formData.append("name", name);
      formData.append("address", address);
      formData.append("description", description);
      formData.append("parentLocationId", parentLocationId || "");
      formData.append("qrCode", qrCode);

      vendorId.forEach((id) => formData.append("vendorIds[]", id));
      teamInCharge.forEach((id) => formData.append("teamsInCharge[]", id));

      // Handle pictures: allow new uploads or keep existing URLs
      pictures.forEach((pic) => {
        if (pic instanceof File) {
          formData.append("photos", pic);
        } else if (typeof pic === "string") {
          formData.append("existingPhotos[]", pic); // backend should handle existing ones
        }
      });

      attachedDocs.forEach((doc) => {
        if (doc instanceof File) {
          formData.append("attachedDocs", doc);
        } else if (typeof doc === "string") {
          formData.append("existingDocs[]", doc);
        }
      });

      let res;
      if (isEdit && editData?.id) {
        res = await dispatch(
          updateLocation({ id: editData.id, data: formData })
        ).unwrap();
        toast.success("Location updated successfully");
      } else {
        res = await dispatch(createLocation(formData)).unwrap();
        toast.success("Location created successfully");
      }

      console.log("Location response:", res);

      // Reset all form fields after submission
      setShowForm(false);
      setName("");
      setAddress("");
      setDescription("");
      setQrCode("");
      setPictures([]);
      setAttachedDocs([]);
      setTeamInCharge([]);
      setVendorId([]);
      setParentLocationId("");
    } catch (err) {
      console.error("Failed to submit location:", err);
      toast.error("Error while saving location");
    } finally {
      setSubmitLocationFormLoader(false);
    }
  };

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex-none">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Location" : "New Location"}
          </h2>
        </div>

        {/* Scrollable content */}
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

          {/* Pictures Upload */}
          <PicturesUpload pictures={pictures} setPictures={setPictures} />

          {/* Address + Description */}
          <AddressAndDescription
            address={address}
            setAddress={setAddress}
            description={description}
            setDescription={setDescription}
          />

          {/* Teams Dropdown */}
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

          {/* QR Code Section */}
          <QrCodeSection qrCode={qrCode} setQrCode={setQrCode} />

          {/* Attached Docs */}
          <FilesUpload
            attachedDocs={attachedDocs}
            setAttachedDocs={setAttachedDocs}
          />

          {/* Vendors Dropdown */}
          <Dropdowns
            stage="vendors"
            open={vendorOpen}
            setOpen={setVendorOpen}
            containerRef={vendorRef}
            navigate={navigate}
            value={vendorId}
            onSelect={(val) => setVendorId(Array.isArray(val) ? val : [val])}
          />

          {/* Parent Location Dropdown */}
          <Dropdowns
            stage="parent"
            open={parentOpen}
            setOpen={setParentOpen}
            containerRef={parentRef}
            navigate={navigate}
            value={parentLocationId}
            onSelect={(val) => setParentLocationId(val as string)}
          />
        </div>

        {/* Footer Actions */}
        <FooterActions
          onCancel={onCancel}
          onCreate={handleSubmitLocation} // ✅ unified handler
          submitLocationFormLoader={submitLocationFormLoader}
          isEdit={isEdit} // ✅ pass flag
        />
      </div>
    </>
  );
}
