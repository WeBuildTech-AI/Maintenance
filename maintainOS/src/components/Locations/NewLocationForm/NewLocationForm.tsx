"use client";

import { useState, useRef, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { PicturesUpload } from "./PicturesUpload";
import { AddressAndDescription } from "./AddressAndDescription";
import { QrCodeSection } from "./QrCodeSection";
import { FilesUpload } from "./FilesUpload";
import { Dropdowns } from "./Dropdowns";
import { FooterActions } from "./FooterActions";

type NewLocationFormProps = {
  onCancel: () => void;
  onCreate: (data: { pictures: File[]; attachedDocs: File[] }) => void;
};

export function NewLocationForm({ onCancel, onCreate }: NewLocationFormProps) {
  const [pictures, setPictures] = useState<File[]>([]);
  const [attachedDocs, setAttachedDocs] = useState<File[]>([]);

  // dropdown states
  const [teamOpen, setTeamOpen] = useState(false);
  const [vendorOpen, setVendorOpen] = useState(false);
  const [parentOpen, setParentOpen] = useState(false);

  const teamRef = useRef<HTMLDivElement>(null);
  const vendorRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // click outside handler (kept exactly as original intent)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (teamRef.current && !teamRef.current.contains(event.target as Node)) setTeamOpen(false);
      if (vendorRef.current && !vendorRef.current.contains(event.target as Node)) setVendorOpen(false);
      if (parentRef.current && !parentRef.current.contains(event.target as Node)) setParentOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header (Fixed) */}
      <div className="p-4 border-b flex-none">
        <h2 className="text-lg font-semibold">New Location</h2>
      </div>

      {/* Scrollable Middle Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
        {/* 1) Location Name (kept inline to preserve exact order) */}
        <div className="space-y-1">
          <input
            type="text"
            placeholder="Enter Location Name"
            className="w-full px-0 py-2 text-gray-400 placeholder-gray-400 bg-transparent border-0 border-b-4 border-blue-500 focus:outline-none"
          />
        </div>

        {/* 2) Pictures */}
        <PicturesUpload pictures={pictures} setPictures={setPictures} />

        {/* 3) Address + 4) Description */}
        <AddressAndDescription />

        {/* 5) Teams Dropdown */}
        <Dropdowns
          stage="teams"
          open={teamOpen}
          setOpen={setTeamOpen}
          containerRef={teamRef}
          navigate={navigate}
        />

        {/* 6) QR Code */}
        <QrCodeSection />

        {/* 7) Attached Docs (Files) */}
        <FilesUpload attachedDocs={attachedDocs} setAttachedDocs={setAttachedDocs} />

        {/* 8) Vendors Dropdown */}
        <Dropdowns
          stage="vendors"
          open={vendorOpen}
          setOpen={setVendorOpen}
          containerRef={vendorRef}
          navigate={navigate}
        />

        {/* 9) Parent Location Dropdown */}
        <Dropdowns
          stage="parent"
          open={parentOpen}
          setOpen={setParentOpen}
          containerRef={parentRef}
          navigate={navigate}
        />
      </div>

      {/* 10) Footer (Fixed) */}
      <FooterActions onCancel={onCancel} onCreate={() => onCreate({ pictures, attachedDocs })} />
    </div>
  );
}
