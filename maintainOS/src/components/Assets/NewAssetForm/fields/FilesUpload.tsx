import { useState } from "react";
import { Upload } from "lucide-react";

export function FilesUpload() {
  const [files, setFiles] = useState<File[]>([]);

const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files) return;
  const newFiles = Array.from(e.target.files) as File[]; // ✅ cast
  setFiles((prev) => [...prev, ...newFiles]);
};


  const removeFile = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  };

  return (
    <div className="mt-4">
      <h3 className="mb-4 text-base font-medium text-gray-900">Files</h3>
      {files.length === 0 ? (
        <div
          className="mb-20 border border-dashed rounded-md p-6 text-center bg-orange-50 cursor-pointer"
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          <Upload className="mx-auto mb-2 h-6 w-6" />
          <p className="text-orange-600">Add or drag files</p>
          <input id="fileInput" type="file" multiple className="hidden" onChange={handleSelect} />
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
            <input id="fileInput" type="file" multiple className="hidden" onChange={handleSelect} />
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
                <span className="text-xs text-gray-700 px-1 truncate w-full text-center">{file.name}</span>
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
  );
}
