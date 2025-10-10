"use client";

import { Upload, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

interface PartPicturesInputProps {
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
  onFilesSelected: (files: File[]) => void;
}

export function PartPicturesInput({
  files,
  setFiles,
  onFilesSelected,
}: PartPicturesInputProps) {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    onFilesSelected(dropped);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    onFilesSelected(selected);
    e.target.value = ""; // reset input for reupload
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const fileInput = (
    <input
      id="partPictureInput"
      type="file"
      multiple
      accept="image/*"
      className="hidden"
      onChange={handleFileSelect}
    />
  );

  return (
    <div className="">
      <h3 className="block text-sm font-medium text-gray-700 mb-4">
        Part Pictures
      </h3>

      {files.length === 0 ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border border-dashed rounded-md p-6 text-center bg-orange-50 text-orange-600 cursor-pointer flex flex-col items-center justify-center h-48 transition hover:bg-orange-100"
          onClick={() => document.getElementById("partPictureInput")?.click()}
        >
          <Upload className="h-8 w-8 mb-2" />
          <p className="text-sm">Add or drag pictures</p>
          {fileInput}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {/* Add More Button */}
          <div
            onClick={() => document.getElementById("partPictureInput")?.click()}
            className="border border-dashed rounded-md text-center bg-orange-50 text-orange-600 cursor-pointer flex flex-col items-center justify-center w-32 h-24 transition hover:bg-orange-100"
          >
            <Upload className="h-6 w-6 mb-2" />
            <p className="text-xs">Add more</p>
            {fileInput}
          </div>

          {/* Image Previews */}
          {files.map((file, i) => {
            const url = URL.createObjectURL(file);
            return (
              <div
                key={i}
                className="relative w-32 h-24 rounded-md overflow-hidden flex items-center justify-center border border-gray-200 bg-white shadow-sm"
              >
                <img
                  src={url}
                  alt={file.name}
                  className="object-cover w-full h-full"
                  onLoad={() => URL.revokeObjectURL(url)} // Clean up URL
                />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 bg-white text-orange-600 rounded-full p-1 shadow border border-gray-200 hover:bg-orange-50 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
