"use client";

import { Upload, X } from "lucide-react";
import React, { useEffect, useState, type Dispatch, type SetStateAction } from "react";

interface PartPicturesInputProps {
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
  // parent should NOT modify files in this callback
  onFilesSelected?: (newFiles: File[]) => void;
}

export function PartPicturesInput({
  files,
  setFiles,
  onFilesSelected,
}: PartPicturesInputProps) {
  const [previews, setPreviews] = useState<{ url: string; name: string }[]>([]);

  // ✅ Generate blob URLs for previews
  useEffect(() => {
    const urls = files.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setPreviews(urls);

    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u.url));
    };
  }, [files]);

  // ✅ Handle File Selection (no duplicate)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    // 🟢 Filter duplicates by file.name + size
    const uniqueFiles = newFiles.filter(
      (f) => !files.some((existing) => existing.name === f.name && existing.size === f.size)
    );
    const updated = [...files, ...uniqueFiles];
    setFiles(updated);
    onFilesSelected?.(uniqueFiles); // inform parent only
    e.target.value = "";
  };

  // ✅ Handle Drag-Drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    const uniqueFiles = dropped.filter(
      (f) => !files.some((existing) => existing.name === f.name && existing.size === f.size)
    );
    const updated = [...files, ...uniqueFiles];
    setFiles(updated);
    onFilesSelected?.(uniqueFiles);
  };

  // ✅ Remove File
  const handleRemove = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
  };

  return (
    <div>
      <h3 className="block text-sm font-medium text-gray-700 mb-4">Part Pictures</h3>

      {files.length === 0 ? (
        // 🟠 Dropzone for first upload
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById("partPictureInput")?.click()}
          className="border border-dashed rounded-md p-6 text-center bg-orange-50 text-orange-600 cursor-pointer flex flex-col items-center justify-center h-48 transition hover:bg-orange-100"
        >
          <Upload className="h-8 w-8 mb-2" />
          <p className="text-sm">Add or drag pictures</p>
          <input
            id="partPictureInput"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        // 🟢 Grid for previews
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {/* Add More */}
          <div
            onClick={() => document.getElementById("partPictureInput")?.click()}
            className="border border-dashed rounded-md text-center bg-orange-50 text-orange-600 cursor-pointer flex flex-col items-center justify-center w-32 h-24 transition hover:bg-orange-100"
          >
            <Upload className="h-6 w-6 mb-2" />
            <p className="text-xs">Add more</p>
            <input
              id="partPictureInput"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* ✅ Preview Thumbnails */}
          {previews.map((p, i) => (
            <div
              key={`${p.name}-${i}`}
              className="relative w-32 h-24 rounded-md overflow-hidden flex items-center justify-center border border-gray-200 bg-white shadow-sm"
            >
              <img src={p.url} alt={p.name} className="object-cover w-full h-full" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(i);
                }}
                className="absolute top-1 right-1 bg-white text-orange-600 rounded-full p-1 shadow border border-gray-200 hover:bg-orange-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
