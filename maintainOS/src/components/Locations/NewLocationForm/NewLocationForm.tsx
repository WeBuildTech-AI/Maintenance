"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { PicturesUpload } from "./PicturesUpload";
import { AddressAndDescription } from "./AddressAndDescription";
import { QrCodeSection } from "./QrCodeSection";
import { FilesUpload } from "./FilesUpload";
import { Dropdowns } from "./Dropdowns";
import { FooterActions } from "./FooterActions";

import type { RootState, AppDispatch } from "../../../store";
import { createLocation } from "../../../store/locations";
import type { CreateLocationData } from "../../../store/locations";

type NewLocationFormProps = {
  onCancel: () => void;
  setSelectedLocation: (id: string) => void;
  setShowForm: (show: boolean) => void;
};

export function NewLocationForm({
  onCancel,
  setSelectedLocation,
  setShowForm,
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

  // Create location handler
  const handleCreateLocation = async () => {
    if (!user) return;

    setSubmitLocationFormLoader(true);

    const locationData: CreateLocationData = {
      organizationId: user.organizationId || "",
      name,
      address,
      description,
      vendorIds: vendorId,
      parentLocationId,
      // teamsInCharge: teamInCharge, // uncomment if API expects it
    };

    try {
      const res = await dispatch(createLocation(locationData)).unwrap();
      console.log("Location created:", res);
      // setSelectedLocation(res.id);
      setShowForm(false);

      // reset form
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
      console.error("Failed to create location:", err);
    } finally {
      setSubmitLocationFormLoader(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex-none">
        <h2 className="text-lg font-semibold">New Location</h2>
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
          onSelect={(val) => setTeamInCharge(Array.isArray(val) ? val : [val])}
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
        onCreate={handleCreateLocation}
        submitLocationFormLoader={submitLocationFormLoader}
      />
    </div>
  );
}
