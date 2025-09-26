// "use client";

// import { useState, useRef, useEffect, use } from "react";

// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { PicturesUpload } from "./PicturesUpload";
// import { AddressAndDescription } from "./AddressAndDescription";
// import { QrCodeSection } from "./QrCodeSection";
// import { FilesUpload } from "./FilesUpload";
// import { Dropdowns } from "./Dropdowns";
// import { FooterActions } from "./FooterActions";
// import { format } from "path";
// import { useDispatch, useSelector } from "react-redux";
// import { type CreateLocationData } from "../../../store/locations";
// // import type { RootState } from "../../../store/";
// import { createLocation } from "../../../store/locations/"; // update path
// // import type { CreateLocationData } from "../../../store/locations/locations.service";

// type NewLocationFormProps = {
//   onCancel: () => void;
//   onCreate: (data: { pictures: File[]; attachedDocs: File[] }) => void;
// };

// export function NewLocationForm({ onCancel, onCreate }: NewLocationFormProps) {
//   const [pictures, setPictures] = useState<File[]>([]);
//   const [attachedDocs, setAttachedDocs] = useState<File[]>([]);
//   const [name, setName] = useState("");
//   const [unitCost, setUnitCost] = useState("");
//   const [address, setAddress] = useState("");
//   const [description, setDescription] = useState("");
//   const [qrCode, setQrCode] = useState("");
//   const [teamInCharge, setTeamInCharge] = useState<string[]>([]);
//   const [vendorId, setVendorId] = useState<string[]>([]);
//   const [parentLocationId, setParentLocationId] = useState("");

//   // dropdown states
//   const [teamOpen, setTeamOpen] = useState(false);
//   const [vendorOpen, setVendorOpen] = useState(false);
//   const [parentOpen, setParentOpen] = useState(false);

//   const teamRef = useRef<HTMLDivElement>(null);
//   const vendorRef = useRef<HTMLDivElement>(null);
//   const parentRef = useRef<HTMLDivElement>(null);

//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const user = useSelector((state: RootState) => state.auth.user);
//   // click outside handler (kept exactly as original intent)
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (teamRef.current && !teamRef.current.contains(event.target as Node))
//         setTeamOpen(false);
//       if (
//         vendorRef.current &&
//         !vendorRef.current.contains(event.target as Node)
//       )
//         setVendorOpen(false);
//       if (
//         parentRef.current &&
//         !parentRef.current.contains(event.target as Node)
//       )
//         setParentOpen(false);
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleCreateLocation = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!user) return; // safety check

//     const locationData: CreateLocationData = {
//       organizationId: user.organizationId,
//       name: name,
//       address: address,
//       description:description

//     };

//     dispatch(createLocation(locationData))
//       .unwrap()
//       .then((res) => console.log("Location created:", res))
//       .catch((err) => console.error("Failed to create location:", err));
//   };

//   return (
//     <div className="flex flex-col h-full overflow-hidden">
//       {/* Header (Fixed) */}
//       <div className="p-4 border-b flex-none">
//         <h2 className="text-lg font-semibold">New Location</h2>
//       </div>

//       {/* Scrollable Middle Content */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
//         {/* 1) Location Name (kept inline to preserve exact order) */}
//         <div className="space-y-1">
//           <input
//             type="text"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             placeholder="Enter Location Name"
//             className="w-full px-0 py-2 text-gray-400 placeholder-gray-400 bg-transparent border-0 border-b-4 border-blue-500 focus:outline-none"
//           />
//         </div>

//         {/* 2) Pictures */}
//         <PicturesUpload pictures={pictures} setPictures={setPictures} />

//         {/* 3) Address + 4) Description */}
//         <AddressAndDescription
//           address={address}
//           setAddress={setAddress}
//           description={description}
//           setDescription={setDescription}
//         />

//         {/* 5) Teams Dropdown */}
//         {/* <Dropdowns
//           stage="teams"
//           open={teamOpen}
//           setOpen={setTeamOpen}
//           containerRef={teamRef}
//           navigate={navigate}
//         /> */}

//         <Dropdowns
//           stage="teams"
//           open={teamOpen}
//           setOpen={setTeamOpen}
//           containerRef={teamRef}
//           navigate={navigate}
//           options={["Team A", "Team B", "Team C"]}
//           value={teamInCharge}
//           onSelect={(val) => setTeamInCharge([val])}
//         />

//         {/* 6) QR Code */}
//         <QrCodeSection qrCode={qrCode} setQrCode={setQrCode} />

//         {/* 7) Attached Docs (Files) */}
//         <FilesUpload
//           attachedDocs={attachedDocs}
//           setAttachedDocs={setAttachedDocs}
//         />

//         {/* 8) Vendors Dropdown */}
//         <Dropdowns
//           stage="vendors"
//           open={vendorOpen}
//           setOpen={setVendorOpen}
//           containerRef={vendorRef}
//           navigate={navigate}
//           options={["Vendor X", "Vendor Y"]}
//           value={vendorId}
//           onSelect={(val) => setVendorId([val])}
//         />

//         {/* 9) Parent Location Dropdown */}
//         <Dropdowns
//           stage="parent"
//           open={parentOpen}
//           setOpen={setParentOpen}
//           containerRef={parentRef}
//           navigate={navigate}
//           options={["Location 1", "Location 2"]}
//           value={parentLocationId}
//           onSelect={setParentLocationId}
//         />
//       </div>

//       {/* 10) Footer (Fixed) */}
//       <FooterActions onCancel={onCancel} onCreate={handleCreateLocation} />
//     </div>
//   );
// }

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
  onCreate: () => void;
};

export function NewLocationForm({ onCancel }: NewLocationFormProps) {
  const [pictures, setPictures] = useState<File[]>([]);
  const [attachedDocs, setAttachedDocs] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [teamInCharge, setTeamInCharge] = useState<string[]>([]);
  const [vendorId, setVendorId] = useState<string[]>([]);
  const [parentLocationId, setParentLocationId] = useState("");

  // dropdown states
  const [teamOpen, setTeamOpen] = useState(false);
  const [vendorOpen, setVendorOpen] = useState(false);
  const [parentOpen, setParentOpen] = useState(false);

  const teamRef = useRef<HTMLDivElement>(null);
  const vendorRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  // click outside handler
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

  // create location handler
  const handleCreateLocation = () => {
    if (!user) return;

    const locationData: CreateLocationData = {
      organizationId: user.organizationId || "",
      name,
      address,
      description,
    };

    dispatch(createLocation(locationData))
      .unwrap()
      .then((res) => {
        console.log("Location created:", res);
        // optional: reset form fields
        setName("");
        setAddress("");
        setDescription("");
        setQrCode("");
        setPictures([]);
        setAttachedDocs([]);
        setTeamInCharge([]);
        setVendorId([]);
        setParentLocationId("");
      })
      .catch((err) => console.error("Failed to create location:", err));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex-none">
        <h2 className="text-lg font-semibold">New Location</h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
        {/* Location Name */}
        <div className="space-y-1">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Location Name"
            className="w-full px-0 py-2 text-gray-400 placeholder-gray-400 bg-transparent border-0 border-b-4 border-blue-500 focus:outline-none"
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
          options={["Team A", "Team B", "Team C"]}
          value={teamInCharge}
          onSelect={(val) => setTeamInCharge([val])}
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
          options={["Vendor X", "Vendor Y"]}
          value={vendorId}
          onSelect={(val) => setVendorId([val])}
        />

        {/* Parent Location Dropdown */}
        <Dropdowns
          stage="parent"
          open={parentOpen}
          setOpen={setParentOpen}
          containerRef={parentRef}
          navigate={navigate}
          options={["Location 1", "Location 2"]}
          value={parentLocationId}
          onSelect={setParentLocationId}
        />
      </div>

      {/* Footer Actions */}
      <FooterActions onCancel={onCancel} onCreate={handleCreateLocation} />
    </div>
  );
}
