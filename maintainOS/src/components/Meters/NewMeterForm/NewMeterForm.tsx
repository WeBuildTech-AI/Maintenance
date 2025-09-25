"use client";

import { useState } from "react";
import { Upload, Lock, RefreshCcw, User} from "lucide-react";
import { SearchWithDropdown } from "../../Locations/SearchWithDropdown";


interface NewMeterFormProps {
    onCreate: (data: any) => void;
}

export function NewMeterForm({ onCreate}: NewMeterFormProps) {
    const [meterType, setMeterType] = useState<"manual" | "automated">("manual");
    const [meterName, setMeterName] = useState("");
    const [description, setDescription] = useState("");
    const [measurementUnit, setMeasurementUnit] = useState("");
    const [asset, setAsset] = useState("");
    const [location, setLocation] = useState("");
    const [readingFrequencyUnit, setReadingFrequencyUnit] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [docs, setDocs] = useState<File[]>([]);
    const [error, setError] = useState("");

    // Split images/docs
    const splitFiles = (selectedFiles: File[]) => {
        const imageTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
        const docTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        const newImages = selectedFiles.filter((f) => imageTypes.includes(f.type));
        const newDocs = selectedFiles.filter((f) => docTypes.includes(f.type));
        if (newImages.length) setFiles((prev) => [...prev, ...newImages]);
        if (newDocs.length) setDocs((prev) => [...prev, ...newDocs]);
    };

    // File handling
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        splitFiles(droppedFiles);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const selectedFiles = Array.from(e.target.files);
        splitFiles(selectedFiles);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const removeDoc = (index: number) => {
        setDocs((prev) => prev.filter((_, i) => i !== index));
    };

    const handleCreate = () => {
        if (!meterName.trim()) {
            setError("You need to provide a Meter Name");
            return;
        }
        if (!measurementUnit.trim()) {
            setError("You need to select a Measurement Unit");
            return;
        }
        setError("");
        onCreate({
            meterName,
            meterType,
            description,
            measurementUnit,
            asset,
            location,
            readingFrequencyUnit,
            files,
            docs,
        });
    };

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-lg border">
            {/* Header (fixed) */}
            <div className="flex-none border-b px-6 py-4">
                <h2 className="text-xl font-semibold">New Meter</h2>
            </div>

            {/* Scrollable content */}
            <div className="min-h-0 flex-1 overflow-y-auto">
                {/* Name row */}
                <div className="px-6 pt-6">
                    <div className="flex items-start gap-4">
                        <div className="mt-1 flex h-12 w-12 flex-none items-center justify-center rounded-full border bg-white text-gray-400">
                            <RefreshCcw className="h-5 w-5" />
                        </div>

                        <div className="w-full">
                            <input
                                type="text"
                                placeholder="Enter Meter Name (Required)"
                                value={meterName}
                                onChange={(e) => setMeterName(e.target.value)}
                                className="w-full border-0 border-b-2 border-gray-200 bg-transparent px-0 py-2 text-lg placeholder-gray-400 outline-none focus:border-blue-500"
                            />
                            {error && !meterName.trim() && (
                                <p className="text-sm text-red-600">{error}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Meter Type */}
                <div className="px-6 pb-6 pt-6">
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                        Meter Type
                    </label>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setMeterType("manual")}
                            className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                                meterType === "manual"
                                    ? "border-blue-500 bg-blue-50 text-blue-600 ring-1 ring-blue-500/20"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            <User className="h-4 w-4" />
                            Manual
                        </button>
                        <button
                            type="button"
                            onClick={() => setMeterType("automated")}
                            className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                                meterType === "automated"
                                    ? "border-blue-500 bg-blue-50 text-blue-600 ring-1 ring-blue-500/20"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            <Lock className="h-4 w-4" />
                            Automated
                        </button>
                    </div>
                </div>

                {/* Description */}
                <div className="px-6 pb-6">
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                        Description
                    </label>
                    <textarea
                        placeholder="Add a description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full min-h-[96px]  rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                {/* Divider */}
                <div className="mx-6 border-b" />

                {/* Measurement Unit (Required) */}
                <div className="px-6 pt-6 pb-2">
                    <div className="w-full sm:max-w-md md:max-w-lg">
                        <SearchWithDropdown
                            title="Measurement Unit (Required)"
                            placeholder="Start typing..."
                            dropdownOptions={["Liters", "Gallons", "Cubic Meters", "kWh"]}
                            onDropdownSelect={(val) => setMeasurementUnit(val)}
                            className="mb-0 w-full"
                        />
                        {error && !measurementUnit && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}
                    </div>
                </div>

                {/* Asset & Location */}
                <div className="flex gap-6 px-6 pb-6 pt-6 ">
                    {/* Asset */}
                    <div className="flex-1">
                        <label
                            style={{
                                display: "block",
                                marginBottom: "6px",
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "#111827",
                            }}
                        >
                            Asset
                        </label>

                        <div style={{ position: "relative", width: "100%" }}>
                            <select
                                defaultValue="none"
                                onChange={(e) => setAsset(e.target.value)}
                                style={{
                                    height: "40px",
                                    width: "100%",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "6px",
                                    padding: "0 32px 0 12px",
                                    fontSize: "14px",
                                    color: "#374151",
                                    backgroundColor: "#fff",
                                    appearance: "none",
                                    cursor: "pointer",
                                }}
                            >
                                <option value="none">Start typing...</option>
                                <option value="assetA">Asset A</option>
                                <option value="assetB">Asset B</option>
                                <option value="assetC">Asset C</option>
                            </select>

                            {/* Chevron Icon */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    width: "16px",
                                    height: "16px",
                                    color: "#4b5563",
                                    pointerEvents: "none",
                                }}
                            >
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="flex-1">
                        <label
                            style={{
                                display: "block",
                                marginBottom: "6px",
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "#111827",
                            }}
                        >
                            Location
                        </label>

                        <div style={{ position: "relative", width: "100%" }}>
                            <select
                                defaultValue="none"
                                onChange={(e) => setLocation(e.target.value)}
                                style={{
                                    height: "40px",
                                    width: "100%",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "6px",
                                    padding: "0 32px 0 12px",
                                    fontSize: "14px",
                                    color: "#374151",
                                    backgroundColor: "#fff",
                                    appearance: "none",
                                    cursor: "pointer",
                                }}
                            >
                                <option value="none">Start typing...</option>
                                <option value="all">All Locations</option>
                                <option value="buildings">Buildings</option>
                                <option value="floors">Floors</option>
                                <option value="rooms">Rooms</option>
                                <option value="areas">Areas</option>
                            </select>

                            {/* Chevron Icon */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    width: "16px",
                                    height: "16px",
                                    color: "#4b5563",
                                    pointerEvents: "none",
                                }}
                            >
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="mx-6 border-b" />

                {/* Reading Frequency */}
                <div style={{ padding: "24px" }}>
                    <h3
                        style={{
                            marginBottom: "16px",
                            fontSize: "18px",
                            fontWeight: 600,
                            color: "#111827",
                        }}
                    >
                        Reading Frequency
                    </h3>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "14px", color: "#374151" }}>Every</span>

                        <input
                            type="number"
                            value="0"
                            readOnly
                            style={{
                                height: "40px",
                                width: "70px",
                                border: "1px solid #e5e7eb",
                                borderRadius: "6px",
                                backgroundColor: "#f3f4f6",
                                textAlign: "center",
                                color: "#6b7280",
                                fontSize: "14px",
                                pointerEvents: "none",
                            }}
                        />

                        <div style={{ position: "relative", width: "180px" }}>
                            <select
                                defaultValue="none"
                                onChange={(e) => setReadingFrequencyUnit(e.target.value)}
                                style={{
                                    height: "40px",
                                    width: "100%",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "6px",
                                    padding: "0 32px 0 12px",
                                    fontSize: "14px",
                                    color: "#374151",
                                    backgroundColor: "#fff",
                                    appearance: "none",
                                    cursor: "pointer",
                                }}
                            >
                                <option value="none">None</option>
                                <option value="hours">Hours</option>
                                <option value="days">Days</option>
                                <option value="weeks">Weeks</option>
                                <option value="months">Months</option>
                                <option value="years">Years</option>
                            </select>

                            {/* Chevron icon */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    width: "16px",
                                    height: "16px",
                                    color: "#4b5563",
                                    pointerEvents: "none",
                                }}
                            >
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="mx-6 border-b mb-20" />

                {/* Additional Info (dropzone updated) */}
                <div className="px-6 pb-24 pt-6">
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">
                        Additional Info
                    </h3>

                    {/* Image uploader */}
                    {files.length === 0 ? (
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className="mb-20 border border-dashed rounded-md p-6 text-center bg-blue-50 text-blue-600 cursor-pointer"
                            onClick={() => document.getElementById("fileInputMeter")?.click()}
                        >
                            <Upload className="mx-auto mb-2 h-6 w-6" />
                            <p>Add or drag pictures</p>
                            <input
                                id="fileInputMeter"
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4 mt-3">
                            {/* Add More first */}
                            <div
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                                className="border border-dashed rounded-md text-center bg-blue-50 text-blue-600 cursor-pointer flex flex-col items-center justify-center w-32 h-32"
                                onClick={() => document.getElementById("fileInputMeter")?.click()}
                            >
                                <Upload className="h-6 w-6 mb-2" />
                                <p className="text-xs">Add more</p>
                                <input
                                    id="fileInputMeter"
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </div>
                            {files.map((file, i) => {
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

                    {/* Docs Preview */}
                    {docs.length > 0 && (
                        <div className="space-y-2 mt-3">
                            {docs.map((file, i) => (
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
                    )}
                </div>
            </div>

            {/* Footer (fixed) */}
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
