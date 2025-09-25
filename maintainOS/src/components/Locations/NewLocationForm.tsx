"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Upload, Search, ChevronDown, Paperclip } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function NewLocationForm({ onCancel, onCreate }) {
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

    // click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (teamRef.current && !teamRef.current.contains(event.target as Node)) setTeamOpen(false);
            if (vendorRef.current && !vendorRef.current.contains(event.target as Node)) setVendorOpen(false);
            if (parentRef.current && !parentRef.current.contains(event.target as Node)) setParentOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // File handling (split into images/docs)
    const splitFiles = (selectedFiles: File[]) => {
        const imageTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
        const docTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        const newImages = selectedFiles.filter((f) => imageTypes.includes(f.type));
        const newDocs = selectedFiles.filter((f) => docTypes.includes(f.type));
        if (newImages.length) setPictures((prev) => [...prev, ...newImages]);
        if (newDocs.length) setAttachedDocs((prev) => [...prev, ...newDocs]);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        splitFiles(Array.from(e.dataTransfer.files));
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        splitFiles(Array.from(e.target.files));
    };

    const removePicture = (index: number) => {
        setPictures((prev) => prev.filter((_, i) => i !== index));
    };

    const removeDoc = (index: number) => {
        setAttachedDocs((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header (Fixed) */}
            <div className="p-4 border-b flex-none">
                <h2 className="text-lg font-semibold">New Location</h2>
            </div>

            {/* Scrollable Middle Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
                {/* Location Name */}
                <div className="space-y-1">
                    <input
                        type="text"
                        placeholder="Enter Location Name"
                        className="w-full px-0 py-2 text-gray-400 placeholder-gray-400 bg-transparent border-0 border-b-4 border-blue-500 focus:outline-none"
                    />
                </div>

                {/* Pictures */}
                <div>
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">Pictures</h3>
                    {pictures.length === 0 ? (
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className="border border-dashed rounded-md p-6 text-center bg-blue-50 text-blue-600 cursor-pointer flex flex-col items-center justify-center"
                            onClick={() => document.getElementById("pictureInput")?.click()}
                        >
                            <Upload className="h-6 w-6 mb-2" />
                            <p className="text-sm">Add or drag pictures</p>
                            <input
                                id="pictureInput"
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4">
                            {/* Add more */}
                            <div
                                onClick={() => document.getElementById("pictureInput")?.click()}
                                className="border border-dashed rounded-md text-center bg-blue-50 text-blue-600 cursor-pointer flex flex-col items-center justify-center w-32 h-32"
                            >
                                <Upload className="h-6 w-6 mb-2" />
                                <p className="text-xs">Add more</p>
                                <input
                                    id="pictureInput"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </div>
                            {pictures.map((file, i) => {
                                const url = URL.createObjectURL(file);
                                return (
                                    <div
                                        key={i}
                                        className="relative w-32 h-32 rounded-md overflow-hidden flex items-center justify-center"
                                    >
                                        <img
                                            src={url}
                                            alt={file.name}
                                            className="object-cover w-full h-full"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removePicture(i)}
                                            className="absolute top-1 right-1 bg-white text-blue-600 rounded-full p-1 shadow"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Address */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900">
                        Address
                    </label>
                    <input
                        type="text"
                        placeholder="Enter address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900">
                        Description
                    </label>
                    <textarea
                        placeholder="Add a description"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                </div>

                {/* Teams Dropdown */}
                <div className="relative" ref={teamRef}>
                    <h3 className="mb-2 text-base font-medium text-gray-900">Teams in Charge</h3>
                    <div
                        className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12 cursor-pointer"
                        onClick={() => setTeamOpen((p) => !p)}
                    >
                        <Search className="h-4 w-4 text-gray-400" />
                        <span className="flex-1 text-gray-400">Start typing...</span>
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                    {teamOpen && (
                        <div className="absolute left-0 top-full mt-1 w-full rounded-md border bg-white shadow-lg z-50">
                            <div
                                onClick={() => navigate("/teams/create")}
                                className="relative flex items-center px-4 py-2 text-sm text-blue-600 bg-blue-50 cursor-pointer hover:bg-blue-100"
                            >
                                <div className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-l-md" />
                                <span className="ml-3">+ Create New Team</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* QR Code */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900">
                        QR Code/Barcode
                    </label>
                    <input
                        type="text"
                        placeholder="Enter or scan code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">or</span>
                        <button className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer underline">
                            Generate Code
                        </button>
                    </div>
                </div>

                {/* Attached Docs */}
                <div>
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">Files</h3>
                    <div className="space-y-2">
                        {attachedDocs.map((file, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs rounded">
                                        {file.name.split(".").pop()?.toUpperCase()}
                                    </div>
                                    <span className="text-sm text-gray-700 truncate max-w-xs">
                                        {file.name}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeDoc(i)}
                                    className="text-gray-500 hover:text-red-600"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Attach files button */}
                    <div className="mt-3">
                        <label
                            htmlFor="docInput"
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 rounded cursor-pointer hover:bg-blue-50"
                        >
                            <Paperclip className="h-4 w-4" />
                            Attach files
                        </label>
                        <input
                            id="docInput"
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files) {
                                    splitFiles(Array.from(e.target.files));
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Vendors Dropdown */}
                <div className="relative" ref={vendorRef}>
                    <h3 className="mb-2 text-base font-medium text-gray-900">Vendors</h3>
                    <div
                        className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12 cursor-pointer"
                        onClick={() => setVendorOpen((p) => !p)}
                    >
                        <Search className="h-4 w-4 text-gray-400" />
                        <span className="flex-1 text-gray-400">Start typing...</span>
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                    {vendorOpen && (
                        <div className="absolute left-0 top-full mt-1 w-full rounded-md border bg-white shadow-lg z-50">
                            <div
                                onClick={() => navigate("/vendors")}
                                className="relative flex items-center px-4 py-2 text-sm text-blue-600 bg-blue-50 cursor-pointer hover:bg-blue-100"
                            >
                                <div className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-l-md" />
                                <span className="ml-3">+ Create New Vendor</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Parent Location Dropdown */}
                <div className="relative" ref={parentRef}>
                    <h3 className="mb-2 text-base font-medium text-gray-900">Parent Location</h3>
                    <div
                        className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12 cursor-pointer"
                        onClick={() => setParentOpen((p) => !p)}
                    >
                        <Search className="h-4 w-4 text-gray-400" />
                        <span className="flex-1 text-gray-400">Start typing...</span>
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                    {parentOpen && (
                        <div className="absolute left-0 top-full mt-1 w-full rounded-md border bg-white shadow-lg z-50">
                            <div
                                onClick={() => navigate("/locations")}
                                className="relative flex items-center px-4 py-2 text-sm text-blue-600 bg-blue-50 cursor-pointer hover:bg-blue-100"
                            >
                                <div className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-l-md" />
                                <span className="ml-3">+ Create New Parent Location</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer (Fixed) */}
            <div className="flex justify-end gap-2 border-t p-4 flex-none">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button onClick={() => onCreate({ pictures, attachedDocs })}>Create</Button>
            </div>
        </div>
    );
}
