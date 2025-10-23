import React, { useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileAudio,
  FileVideo,
  File,
} from "lucide-react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { openViewUrlThunk } from "../../store/storage/storage.thunks";
import type { Location } from "./location.types";

export const LocationFiles: React.FC<{ location: Location }> = ({
  location,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loadingKeys, setLoadingKeys] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Support both new and old field names for backward compatibility
  const files = location.locationDocs || location.files || [];

  /** Handle click → open presigned GET URL in new tab */
  const handleOpen = async (key: string) => {
    try {
      setLoadingKeys((prev) => [...prev, key]);
      const res = await dispatch(
        openViewUrlThunk({ formId: location.id, key })
      ).unwrap();
      window.open(res.url, "_blank");
    } catch (err) {
      console.error("Failed to open file:", err);
    } finally {
      setLoadingKeys((prev) => prev.filter((k) => k !== key));
    }
  };

  /** Icon by file extension */
  const getFileIcon = (ext?: string) => {
    switch (ext) {
      case "pdf":
        return <FileText className="h-6 w-6 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="h-6 w-6 text-blue-600" />;
      case "xls":
      case "xlsx":
      case "csv":
        return <FileSpreadsheet className="h-6 w-6 text-green-600" />;
      case "zip":
      case "rar":
      case "7z":
        return <FileArchive className="h-6 w-6 text-yellow-600" />;
      case "mp3":
      case "wav":
        return <FileAudio className="h-6 w-6 text-purple-500" />;
      case "mp4":
      case "mov":
        return <FileVideo className="h-6 w-6 text-indigo-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  if (!files?.length)
    return (
      <div className="mt-6">
        <h3 className="mb-3 text-sm font-medium text-gray-800">
          Location Files
        </h3>
        <p className="text-sm text-gray-500 italic">
          No location files uploaded.
        </p>
      </div>
    );

  // 🩶 Skeletons while loading (e.g. during API prefetch)
  if (isLoading) {
    return (
      <div className="mt-6">
        <h3 className="mb-3 text-sm font-medium text-gray-800">
          Location Files ({files.length})
        </h3>
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: files.length }).map((_, i) => (
            <div
              key={`skeleton-file-${i}`}
              className="flex flex-col items-center justify-center w-40 h-28 rounded-lg border bg-gray-100 animate-pulse"
            >
              <div className="w-8 h-8 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 w-3/4 bg-gray-300 rounded mb-1"></div>
              <div className="h-2 w-1/2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="mb-3 text-sm font-medium text-gray-800">
        Location Files ({files.length})
      </h3>

      <div className="flex flex-wrap gap-3">
        {files.map((f) => {
          const ext = f.fileName.split(".").pop()?.toLowerCase();
          const loading = loadingKeys.includes(f.key);
          const icon = getFileIcon(ext);

          return (
            <div
              key={f.key}
              onClick={() => handleOpen(f.key)}
              className="relative flex flex-col items-center justify-center w-40 h-28 rounded-lg bg-white shadow-sm hover:shadow-md hover:bg-gray-50 transition cursor-pointer"
              title={f.fileName}
            >
              {loading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              <div className="flex flex items-center gap-2">
                {icon}
                <p className="text-xs text-gray-700 text-center line-clamp-2 px-2">
                  {f.fileName}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
