import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { File as FileIcon, Eye } from "lucide-react";
import {
  fetchThumbnailThunk,
  openViewUrlThunk,
} from "../../store/storage/storage.thunks";
import type { BUD } from "../utils/BlobUpload";

interface MessageAttachmentsProps {
  messageImages?: BUD[];
  messageDocs?: BUD[];
}

export const MessageAttachments: React.FC<MessageAttachmentsProps> = ({
  messageImages = [],
  messageDocs = [],
}) => {
  const dispatch = useDispatch<any>();
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  // Ensure we have arrays and filter out invalid entries
  const validImages = Array.isArray(messageImages)
    ? messageImages.filter((img) => img && img.key && img.fileName)
    : [];
  const validDocs = Array.isArray(messageDocs)
    ? messageDocs.filter((doc) => doc && doc.key && doc.fileName)
    : [];

  // Fetch thumbnails for images
  useEffect(() => {
    const fetchThumbnails = async () => {
      const imagesToFetch = validImages.filter((img) => !thumbnails[img.key]);
      if (imagesToFetch.length === 0) return;

      try {
        const results = await Promise.allSettled(
          imagesToFetch.map((img) =>
            dispatch(fetchThumbnailThunk(img.key)).unwrap()
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

    fetchThumbnails();
  }, [validImages, dispatch, thumbnails]);

  // Handle opening file in new window
  const handleOpenFile = async (bud: BUD) => {
    try {
      const result = await dispatch(
        openViewUrlThunk({
          formId: "message_files",
          key: bud.key,
        })
      ).unwrap();
      window.open(result.url, "_blank");
    } catch (error) {
      console.error("Failed to open file:", error);
    }
  };

  if (validImages.length === 0 && validDocs.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 space-y-2">
      {/* Images */}
      {validImages.length > 0 && (
        <div className="grid grid-cols-2 gap-2 max-w-md">
          {validImages.map((img, idx) => (
            <div
              key={idx}
              className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100"
              onClick={() => handleOpenFile(img)}
            >
              {thumbnails[img.key] ? (
                <img
                  src={thumbnails[img.key]}
                  alt={img.fileName}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 flex items-center justify-center bg-gray-200">
                  <FileIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}

              {/* Overlay with view icon */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
              </div>

              {/* File name */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                {img.fileName}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Documents */}
      {validDocs.length > 0 && (
        <div className="space-y-1">
          {validDocs.map((doc, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleOpenFile(doc)}
            >
              <FileIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span
                className="text-sm text-gray-800 truncate flex-1"
                title={doc.fileName}
              >
                {doc.fileName}
              </span>
              <Eye className="h-4 w-4 text-gray-400" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
