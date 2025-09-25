"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, MapPin, Search, Upload } from "lucide-react";
import { Package } from "lucide-react";
import { useNavigate } from "react-router-dom";


interface NewAssetFormProps {
    onCreate: () => void;
    onCancel?: () => void; // optional
}

export function NewAssetForm({ onCreate }: NewAssetFormProps) {
    const [qrCodeValue, setQrCodeValue] = useState("");
    const [pictures, setPictures] = useState<File[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [assetName, setAssetName] = useState("");
    const [error, setError] = useState("");
    const [vendorOpen, setVendorOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);


    const navigate = useNavigate();


    // Vendors list + selection ✅
    const [vendors, setVendors] = useState<{ name: string }[]>([
        { name: "Mfd" },
        { name: "Paam" },
    ]);
    const [selectedVendor, setSelectedVendor] = useState<{ name: string } | null>(null);

    const handlePictureSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        setPictures((prev) => [...prev, ...Array.from(files)]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        setFiles((prev) => [...prev, ...Array.from(files)]);
    };


    const removePicture = (index: number) => {
        setPictures((prev) => prev.filter((_, i) => i !== index));
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleCreate = () => {
        if (!assetName.trim()) {
            setError("You need to provide an Asset Name");
            return;
        }
        setError("");
        onCreate();
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setVendorOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-lg border">
            {/* Header */}
            <div className="flex-none border-b px-6 py-4">
                <h2 className="text-xl font-semibold">New Asset</h2>
            </div>

            {/* Scrollable content */}
            <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="px-6 pt-6">
                    {/* Header row: Icon + Asset Name input */}
                    <div className="flex items-start gap-4">
                        {/* Circle icon container with Package icon */}
                        <div className="mt-1 flex h-12 w-12 flex-none items-center justify-center rounded-full border bg-white text-gray-400">
                            <Package className="h-5 w-5" />
                        </div>
                        {/* Asset name input */}
                        <div className="w-full">
                            <input
                                type="text"
                                value={assetName}
                                onChange={(e) => setAssetName(e.target.value)}
                                placeholder="Enter Asset Name (Required)"
                                className="w-full border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2 text-lg text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
                            />
                            {error && (
                                <p className="text-sm text-red-600 mt-1">{error}</p>
                            )}
                        </div>
                    </div>

                    {/* Pictures upload section */}
                    <div className="mt-4">
                        <h3 className="mb-4 text-base font-medium text-gray-900">Pictures</h3>
                        {pictures.length === 0 ? (
                            <div
                                className="mb-20 border border-dashed rounded-md p-6 text-center bg-blue-50 text-blue-600 cursor-pointer"
                                onClick={() => document.getElementById("pictureInput")?.click()}
                            >
                                <Upload className="mx-auto mb-2 h-6 w-6" />
                                <p className="text-gray-900">Add or drag pictures</p>
                                <input
                                    id="pictureInput"
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handlePictureSelect}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-4">
                                {/* Add more always first */}
                                <div
                                    className="border border-dashed rounded-md text-center bg-blue-50 text-blue-600 cursor-pointer flex flex-col items-center justify-center w-32 h-32"
                                    onClick={() => document.getElementById("pictureInput")?.click()}
                                >
                                    <Upload className="h-6 w-6 mb-2" />
                                    <p className="text-xs">Add more</p>
                                    <input
                                        id="pictureInput"
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={handlePictureSelect}
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

                    {/* Files upload section */}
                    <div className="mt-4">
                        <h3 className="mb-4 text-base font-medium text-gray-900">Files</h3>
                        {files.length === 0 ? (
                            <div
                                className="mb-20 border border-dashed rounded-md p-6 text-center bg-blue-50 text-blue-600 cursor-pointer"
                                onClick={() => document.getElementById("fileInput")?.click()}
                            >
                                <Upload className="mx-auto mb-2 h-6 w-6" />
                                <p className="text-gray-900">Add or drag files</p>
                                <input
                                    id="fileInput"
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-4">
                                {/* Add more always first */}
                                <div
                                    className="border border-dashed rounded-md text-center bg-blue-50 text-blue-600 cursor-pointer flex flex-col items-center justify-center w-32 h-32"
                                    onClick={() => document.getElementById("fileInput")?.click()}
                                >
                                    <Upload className="h-6 w-6 mb-2" />
                                    <p className="text-xs">Add more</p>
                                    <input
                                        id="fileInput"
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                </div>
                                {files.map((file, i) => {
                                    const ext = file.name.split(".").pop()?.toUpperCase();
                                    return (
                                        <div
                                            key={i}
                                            className="relative w-32 h-32 rounded-md overflow-hidden flex flex-col items-center justify-center bg-gray-50"
                                        >
                                            <div className="w-12 h-12 bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs rounded mb-2">
                                                {ext}
                                            </div>
                                            <span className="text-xs text-gray-700 px-1 truncate w-full text-center">
                                                {file.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(i)}
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

                    {/* Location dropdown */}
                    <div className="mt-4">
                        <h3 className="mb-4 text-base font-medium text-gray-900">Location</h3>
                        <div className="relative">
                            <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12">
                                <MapPin className="h-5 w-5 text-blue-500" />
                                <span className="flex-1 text-gray-900">General</span>
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Criticality dropdown */}
                    <div className="mt-4">
                        <h3 className="mb-4 text-base font-medium text-gray-900">Criticality</h3>
                        <div className="relative">
                            <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12">
                                <span className="flex-1 text-gray-400">Start typing...</span>
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Description text area */}
                    <div className=" mt-4">
                        <label className="mb-2 block text-sm font-medium text-gray-900">
                            Description
                        </label>
                        <textarea
                            placeholder="Add a description"
                            className="w-full min-h-[96px] rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    {/* Year input */}
                    <div className="mt-4">
                        <h3 className="mb-4 text-base font-medium text-gray-900">Year</h3>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Start typing..."
                                className="w-full h-12 px-4 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 bg-white outline-none transition-all focus:border-gray-400"
                            />
                        </div>
                    </div>

                    {/* Manufacturer dropdown */}
                    <div className="mt-4">
                        <h3 className="mb-4 text-base font-medium text-gray-900">Manufacturer</h3>
                        <div className="relative">
                            <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12">
                                <span className="flex-1 text-gray-400">
                                    Start typing to search or customize...
                                </span>
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Model field */}
                    <div className="mt-4">
                        <h3 className="mb-4 text-base font-medium text-gray-900">Model</h3>
                        <div className="relative">
                            <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-gray-100 px-4 py-3 h-12">
                                <span className="flex-1 text-gray-400">Enter manufacturer first</span>
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Serial Number */}
                    <div className="mt-4">
                        <h3 className="mb-4 text-base font-medium text-gray-900">Serial Number</h3>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Serial Number"
                                className="w-full h-12 px-4 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 bg-white outline-none transition-all focus:border-gray-400"
                            />
                        </div>
                    </div>

                    {/* Teams in Charge */}
                    <div className="mt-4">
                        <h3 className="mb-4 text-base font-medium text-gray-900">Teams in Charge</h3>
                        <div className="relative">
                            <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-gray-100 px-4 py-3 h-12">
                                <span className="flex-1 text-gray-400">Start typing…</span>
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="mt-4">
                        <label className="mb-2 block text-sm font-medium text-gray-900">
                            QR Code/Barcode
                        </label>
                        <input
                            type="text"
                            value={qrCodeValue}
                            onChange={(e) => setQrCodeValue(e.target.value)}
                            placeholder="Enter or scan code"
                            className="w-full h-12 px-4 border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 bg-white outline-none transition-all focus:border-gray-400"
                        />
                        <div className="mt-2">
                            <span className="text-gray-900 text-sm">or </span>
                            <span className="text-blue-600 text-sm cursor-pointer hover:underline">
                                Generate Code
                            </span>
                        </div>
                    </div>

                    {/* Asset Types */}
                    <div className="mt-4">
                        <h3 className="mb-4 text-base font-medium text-gray-900">Asset Types</h3>
                        <div className="relative">
                            <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12">
                                <Search className="h-4 w-4 text-gray-400" />
                                <span className="flex-1 text-gray-400">Start typing...</span>
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Vendors */}
                    <div className="mt-4 relative z-50" ref={dropdownRef}>
                        <h3 className="mb-4 text-base font-medium text-gray-900">Vendors</h3>
                        <div
                            className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12 cursor-pointer"
                            onClick={() => setVendorOpen((prev) => !prev)}
                        >
                            <Search className="h-4 w-4 text-gray-400" />
                            <span className="flex-1 text-gray-400">
                                {selectedVendor ? selectedVendor.name : "Start typing..."}
                            </span>
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                        </div>

                        {vendorOpen && (
                            <div
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    top: "100%",
                                    marginTop: "4px",
                                    width: "100%",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "0.375rem",
                                    backgroundColor: "white",
                                    boxShadow:
                                        "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
                                    zIndex: 9999,
                                    overflow: "hidden",
                                }}
                            >
                                {/* Vendor list */}
                                {vendors.length > 0 &&
                                    vendors.map((vendor, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.75rem",
                                                padding: "0.5rem 1rem",
                                                fontSize: "0.875rem",
                                                color: "#111827",
                                                backgroundColor: "white",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => {
                                                setSelectedVendor(vendor);
                                                setVendorOpen(false);
                                            }}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.backgroundColor = "#f9fafb")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.backgroundColor = "white")
                                            }
                                        >
                                            {/* Avatar */}
                                            <div
                                                style={{
                                                    width: "2rem",
                                                    height: "2rem",
                                                    borderRadius: "9999px",
                                                    backgroundColor: "#10b981",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "white",
                                                    fontSize: "0.875rem",
                                                    fontWeight: 600,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {vendor.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span>{vendor.name}</span>
                                            <span
                                                style={{
                                                    marginLeft: "auto",
                                                    fontSize: "0.875rem",
                                                    color: "#6b7280",
                                                }}
                                            >
                                                No contacts
                                            </span>
                                        </div>
                                    ))}

                                {/* Create New Vendor section */}
                                <div
                                    onClick={() => navigate("/vendors")}

                                    style={{
                                        padding: "0.75rem 1rem",
                                        fontSize: "0.875rem",
                                        color: "#2563eb",
                                        backgroundColor: "#f0f7ff", // light blue background
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor = "#e0efff")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor = "#f0f7ff")
                                    }
                                >
                                    + Create New Vendor
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Parts */}
                    <div className="mt-4">
                        <h3 className="mb-4 text-base font-medium text-gray-900">Parts</h3>
                        <div className="relative">
                            <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12">
                                <Search className="h-4 w-4 text-gray-400" />
                                <span className="flex-1 text-gray-400">Start typing...</span>
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Parent Asset */}
                    <div className="mt-4">
                        <h3 className="mb-4 text-base font-medium text-gray-900">Parent Asset</h3>
                        <div className="relative">
                            <div className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 h-12">
                                <Search className="h-4 w-4 text-gray-400" />
                                <span className="flex-1 text-gray-400">Start typing...</span>
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 mt-6 flex items-center border-t bg-white px-6 py-4">
                <button
                    onClick={handleCreate}
                    style={{ marginLeft: "auto", paddingLeft: "40px", paddingRight: "40px" }}
                    className="h-10 rounded-md bg-blue-600 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Create
                </button>
            </div>
        </div>
    );
}
