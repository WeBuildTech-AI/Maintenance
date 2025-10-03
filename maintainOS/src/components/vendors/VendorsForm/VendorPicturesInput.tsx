"use client";

import { Upload, X } from "lucide-react"; // Added X for the remove button
import type { Dispatch, SetStateAction } from "react";

interface VendorPicturesInputProps {
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
}

export function VendorPicturesInput({ files, setFiles }: VendorPicturesInputProps) {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    // Filter for image files only for safety
    const imageFiles = dropped.filter(file => file.type.startsWith('image/'));
    setFiles((prev) => [...prev, ...imageFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    const imageFiles = selected.filter(file => file.type.startsWith('image/'));
    setFiles((prev) => [...prev, ...imageFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="px-6">
      <h3 className="mb-3 text-lg font-semibold text-gray-900">Pictures</h3>
      {files.length === 0 ? (
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
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {files.map((file, i) => {
            const url = URL.createObjectURL(file);
            return (
              <div
                key={i}
                className="relative w-32 h-32 rounded-md overflow-hidden flex items-center justify-center"
              >
                <img src={url} alt={file.name} className="object-cover w-full h-full" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 bg-white text-blue-600 rounded-full p-1 shadow"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
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
        </div>
      )}
    </div>
  );
}