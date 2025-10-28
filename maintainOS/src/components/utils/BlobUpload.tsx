import React, { useState, useEffect } from "react";
import { Upload, File as FileIcon } from "lucide-react";
import { useDispatch } from "react-redux";
import {
  deleteFilesThunk,
  uploadMultipleFilesThunk,
  fetchThumbnailThunk,
} from "../../store/storage/storage.thunks";

export interface BUD {
  key: string;
  fileName: string;
}

interface BlobUploadProps {
  formId: string;
  type: "images" | "files";
  initialBuds?: BUD[]; // Add support for initial files
  onChange: (data: { formId: string; buds: BUD[] }) => void;
}

export const BlobUpload: React.FC<BlobUploadProps> = ({
  formId,
  type,
  initialBuds = [],
  onChange,
}) => {
  const dispatch = useDispatch<any>();
  const [files, setFiles] = useState<File[]>([]);
  const [buds, setBuds] = useState<BUD[]>(initialBuds);
  const [uploading, setUploading] = useState(false);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  // Initialize with existing files when initialBuds changes
  useEffect(() => {
    if (initialBuds && initialBuds.length > 0) {
      setBuds(initialBuds);
      // Notify parent of initial data
      onChange({ formId, buds: initialBuds });
    }
  }, [initialBuds, formId, onChange]);

  // Fetch thumbnails for existing files (those with keys that don't start with 'blob:')
  useEffect(() => {
    const fetchThumbnailsForExistingFiles = async () => {
      const existingFiles = buds.filter((bud) => !bud.key.startsWith("blob:"));
      if (existingFiles.length === 0) return;

      try {
        const results = await Promise.allSettled(
          existingFiles.map((bud) =>
            dispatch(fetchThumbnailThunk(bud.key)).unwrap()
          )
        );

        const newThumbnails: Record<string, string> = {};
        results.forEach((result) => {
          if (result.status === "fulfilled") {
            newThumbnails[result.value.key] = result.value.blobUrl;
          }
        });

        setThumbnails((prev) => ({ ...prev, ...newThumbnails }));
      } catch (error) {
        console.error("Failed to fetch thumbnails:", error);
      }
    };

    fetchThumbnailsForExistingFiles();
  }, [buds, dispatch]);

  /** Handle file selection */
  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);

    // Create temporary BUD objects with blob URLs for immediate preview
    const tempBuds: BUD[] = selected.map((file) => ({
      key: URL.createObjectURL(file),
      fileName: file.name,
    }));

    // Add temporary buds for immediate preview
    setBuds((prev) => [...prev, ...tempBuds]);
    setFiles((prev) => [...prev, ...selected]);
    e.target.value = "";
  };

  /** Remove file (with delete thunk) */
  const removeFile = async (index: number) => {
    const fileToRemove = buds[index];
    if (!fileToRemove) return;

    try {
      // Step 1: mark deleting (optional local UI)
      setBuds((prev) =>
        prev.map((b, i) => (i === index ? { ...b, deleting: true } : b))
      );

      // Step 2: trigger deleteFilesThunk
      await dispatch(
        deleteFilesThunk({ formId, keys: [fileToRemove.key] })
      ).unwrap();

      // Step 3: remove from local state only after successful delete
      setBuds((prev) => {
        const newBuds = prev.filter((_, i) => i !== index);
        onChange({ formId, buds: newBuds });
        return newBuds;
      });
    } catch (err) {
      console.error("Delete failed:", err);
      // Step 4: revert deletion indicator
      setBuds((prev) =>
        prev.map((b, i) =>
          i === index ? { ...b, deleting: false, error: "Delete failed" } : b
        )
      );
    }
  };

  /** Trigger upload when files change */
  useEffect(() => {
    const upload = async () => {
      if (files.length === 0) return;
      setUploading(true);

      try {
        const res = await dispatch(
          uploadMultipleFilesThunk({ formId, files })
        ).unwrap();

        const uploaded: BUD[] = res.results.map(
          (r: { key: string }, i: number) => ({
            key: r.key,
            fileName: files[i].name,
          })
        );

        // Replace temporary blob URLs with actual server keys
        setBuds((prev) => {
          // Remove temp buds (those with blob: keys) and add real uploaded buds
          const existingBuds = prev.filter(
            (bud) => !bud.key.startsWith("blob:")
          );
          const newBuds = [...existingBuds, ...uploaded];
          onChange({ formId, buds: newBuds });
          return newBuds;
        });

        // Clear the files array after successful upload
        setFiles([]);
      } catch (err) {
        console.error("Upload failed:", err);
        // Remove temporary buds on failure
        setBuds((prev) => prev.filter((bud) => !bud.key.startsWith("blob:")));
      } finally {
        setUploading(false);
      }
    };
    if (files.length > 0) upload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  return (
    <div className="p-6 mt-4 relative">
      <h3 className="mb-4 text-base font-medium text-gray-900 capitalize">
        {type === "images" ? "Images" : "Files"}
      </h3>

      {/* File Picker */}
      <div
        className="border border-dashed rounded-md p-6 text-center cursor-pointer bg-orange-50"
        onClick={() => document.getElementById(`${formId}-input`)?.click()}
      >
        <Upload className="mx-auto mb-2 h-6 w-6" />
        <p className="text-orange-600">Add or drag {type}</p>
        <input
          id={`${formId}-input`}
          type="file"
          multiple
          accept={type === "images" ? "image/*" : undefined}
          className="hidden"
          onChange={handleSelect}
        />
      </div>

      {/* Previews */}
      {buds.length > 0 && (
        <div className="mt-4 flex-col flex-wrap gap-3">
          {buds.map((b, i) => {
            const isImage = b.fileName
              ?.toLowerCase()
              .match(/\.(jpg|jpeg|png|gif|webp)$/);

            // Determine the correct URL based on whether it's an existing file or new file
            let imageUrl = null;
            if (b.key.startsWith("blob:")) {
              // This is a new file with blob URL
              imageUrl = b.key;
            } else {
              // This is an existing file, use fetched thumbnail
              imageUrl = thumbnails[b.key] || null;
            }

            return (
              <div
                key={i}
                className="flex items-center gap-2  rounded-lg px-2 py-1 bg-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Small thumbnail */}
                <div className="w-8 h-8 flex items-center justify-center rounded-md overflow-hidden bg-gray-100">
                  {isImage && imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={b.fileName}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <FileIcon className="h-4 w-4 text-blue-500" />
                  )}
                </div>

                {/* File name */}
                <p
                  className="text-sm text-gray-800 max-w-[160px] truncate break-all"
                  title={b.fileName}
                >
                  {b.fileName}
                </p>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="ml-auto text-gray-400 hover:text-red-500 transition disabled:opacity-50"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};
