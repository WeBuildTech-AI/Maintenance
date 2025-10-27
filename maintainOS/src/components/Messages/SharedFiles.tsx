import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { File as FileIcon, Eye, Image } from "lucide-react";
import {
  fetchThumbnailThunk,
  openViewUrlThunk,
} from "../../store/storage/storage.thunks";
import type { BUD } from "../utils/BlobUpload";

interface SharedFilesProps {
  messages: {
    id: number;
    sender: string;
    text: string;
    avatar: string;
    timestamp: string;
    messageImages?: BUD[];
    messageDocs?: BUD[];
  }[];
}

export const SharedFiles: React.FC<SharedFilesProps> = ({ messages }) => {
  const dispatch = useDispatch<any>();
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [failedKeys, setFailedKeys] = useState<Set<string>>(new Set());

  // Extract all files from messages - memoize to prevent re-renders
  const allImages = React.useMemo(
    () => messages.flatMap((msg) => msg.messageImages || []),
    [messages]
  );
  const allDocs = React.useMemo(
    () => messages.flatMap((msg) => msg.messageDocs || []),
    [messages]
  );
  const allFiles = React.useMemo(
    () => [...allImages, ...allDocs],
    [allImages, allDocs]
  );

  // Fetch thumbnails for images - only once per unique key
  useEffect(() => {
    const imagesToFetch = allImages.filter(
      (img) => !thumbnails[img.key] && !failedKeys.has(img.key)
    );

    if (imagesToFetch.length === 0) return;

    const fetchThumbnails = async () => {
      try {
        const results = await Promise.allSettled(
          imagesToFetch.map((img) =>
            dispatch(fetchThumbnailThunk(img.key)).unwrap()
          )
        );

        const newThumbnails: Record<string, string> = {};
        const newFailedKeys = new Set(failedKeys);

        results.forEach((result, index) => {
          const key = imagesToFetch[index].key;
          if (result.status === "fulfilled") {
            newThumbnails[result.value.key] = result.value.blobUrl;
          } else {
            // Track failed keys to prevent retry loops
            newFailedKeys.add(key);
            console.warn(
              `Failed to fetch thumbnail for ${key}:`,
              result.reason
            );
          }
        });

        if (Object.keys(newThumbnails).length > 0) {
          setThumbnails((prev) => ({ ...prev, ...newThumbnails }));
        }

        if (newFailedKeys.size > failedKeys.size) {
          setFailedKeys(newFailedKeys);
        }
      } catch (error) {
        console.error("Failed to fetch thumbnails:", error);
      }
    };

    fetchThumbnails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allImages]);

  // Handle opening file in new window
  const handleOpenFile = async (bud: BUD) => {
    try {
      const result = await dispatch(
        openViewUrlThunk({
          formId: "shared_files",
          key: bud.key,
        })
      ).unwrap();
      window.open(result.url, "_blank");
    } catch (error) {
      console.error("Failed to open file:", error);
    }
  };

  if (allFiles.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">No shared files</div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Images Section */}
      {allImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Image className="h-4 w-4" />
            Images ({allImages.length})
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {allImages.map((img, idx) => (
              <div
                key={`${img.key}-${idx}`}
                className="relative group cursor-pointer rounded-md overflow-hidden bg-gray-100 aspect-square"
                onClick={() => handleOpenFile(img)}
              >
                {thumbnails[img.key] ? (
                  <img
                    src={thumbnails[img.key]}
                    alt={img.fileName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <FileIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents Section */}
      {allDocs.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <FileIcon className="h-4 w-4" />
            Documents ({allDocs.length})
          </h4>
          <div className="space-y-2">
            {allDocs.map((doc, idx) => (
              <div
                key={`${doc.key}-${idx}`}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleOpenFile(doc)}
              >
                <FileIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm text-gray-800 truncate"
                    title={doc.fileName}
                  >
                    {doc.fileName}
                  </p>
                </div>
                <Eye className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
