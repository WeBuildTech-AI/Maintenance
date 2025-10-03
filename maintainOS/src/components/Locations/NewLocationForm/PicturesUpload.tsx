"use client";

import { Upload } from "lucide-react";

type PicturesUploadProps = {
  pictures: File[];
  setPictures: React.Dispatch<React.SetStateAction<File[]>>;
};

export function PicturesUpload({ pictures, setPictures }: PicturesUploadProps) {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files) as File[]; // keep TS happy
    setPictures((prev) => [...prev, ...dropped]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files) as File[];
    setPictures((prev) => [...prev, ...selected]);
  };

  const removePicture = (index: number) => {
    setPictures((prev) => prev.filter((_, i) => i !== index));
  };

  console.log(pictures , "picture")

  return (
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
            const url = `data:${file?.mimetype};base64,${file?.base64}`;
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
  );
}
