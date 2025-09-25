"use client";

import { Paperclip } from "lucide-react";

type FilesUploadProps = {
  attachedDocs: File[];
  setAttachedDocs: React.Dispatch<React.SetStateAction<File[]>>;
};

export function FilesUpload({ attachedDocs, setAttachedDocs }: FilesUploadProps) {
  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files) as File[];
    setAttachedDocs((prev) => [...prev, ...selected]);
  };

  const removeDoc = (index: number) => {
    setAttachedDocs((prev) => prev.filter((_, i) => i !== index));
  };

  return (
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
              <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
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
          className="inline-flex items-center  text-orange-600 gap-2 px-3 py-2 text-sm font-medium text-blue-600 rounded cursor-pointer hover:bg-blue-50"
        >
          <Paperclip className="h-4 w-4" />
          Attach files
        </label>
        <input id="docInput" type="file" multiple className="hidden" onChange={handleSelect} />
      </div>
    </div>
  );
}
