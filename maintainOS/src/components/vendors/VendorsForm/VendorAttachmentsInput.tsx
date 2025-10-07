"use client";

import { Paperclip, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

interface VendorAttachmentsInputProps {
  attachedDocs: File[];
  setAttachedDocs: Dispatch<SetStateAction<File[]>>;
  onFilesSelected: (files: File[]) => void;
}

export function VendorAttachmentsInput({
  attachedDocs,
  setAttachedDocs,
  onFilesSelected,
}: VendorAttachmentsInputProps) {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    onFilesSelected(dropped);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    onFilesSelected(selected);
    e.target.value = "";
  };

  const removeDoc = (index: number) => {
    setAttachedDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const fileInput = (
    <input
      id="docInput"
      type="file"
      multiple
      className="hidden"
      onChange={handleFileSelect}
    />
  );

  return (
    <div className="px-6 pt-4">
      <h3 className="block text-sm font-medium text-gray-700 mb-4">Files</h3>

      {attachedDocs.length === 0 ? (
        <div>
          {/* === Clean Attach Button Style === */}
          <button
            type="button"
            onClick={() => document.getElementById("docInput")?.click()}
            className="flex items-center gap-2 border border-blue-300 text-blue-600 font-medium text-sm px-4 py-2 rounded-md hover:bg-blue-50 transition-all duration-200"
          >
            <Paperclip className="h-4 w-4" />
            Attach files
          </button>
          {fileInput}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          <div
            onClick={() => document.getElementById("docInput")?.click()}
            className="border border-dashed rounded-md text-center bg-gray-50 text-gray-600 cursor-pointer flex flex-col items-center justify-center w-32 h-24 hover:bg-gray-100"
          >
            <Paperclip className="h-6 w-6 mb-2 text-gray-500" />
            <p className="text-xs text-gray-700 font-medium">Add more</p>
            {fileInput}
          </div>

          {attachedDocs.map((file, i) => {
            const extension =
              file.name.split(".").pop()?.toUpperCase().substring(0, 4) || "FILE";
            return (
              <div
                key={i}
                className="relative w-32 h-24 rounded-md overflow-hidden flex flex-col items-center justify-center border border-gray-200 bg-gray-50 p-2 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-100 text-xs font-bold text-blue-700">
                  {extension}
                </div>
                <span className="mt-2 w-full truncate text-center text-xs text-gray-700">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeDoc(i)}
                  className="absolute top-1 right-1 bg-white text-gray-600 rounded-full p-1 shadow border border-gray-200 hover:text-red-600"
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
