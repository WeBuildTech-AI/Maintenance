import React, { useEffect, useState } from "react";
import { FileIcon, Image as ImageIcon } from "lucide-react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store";
import {
  fetchThumbnailThunk,
  openViewUrlThunk,
} from "../../../store/storage/storage.thunks";
import type { Vendor } from "../vendors.types";

export const VendorImages: React.FC<{ vendor: Vendor }> = ({ vendor }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [loadingKeys, setLoadingKeys] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const images = vendor.vendorImages || [];

  /** Fetch thumbnails for all vendor images concurrently */
  useEffect(() => {
    if (!images?.length) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    (async () => {
      try {
        const results = await Promise.allSettled(
          images.map((img) => dispatch(fetchThumbnailThunk(img.key)).unwrap())
        );

        const newThumbs: Record<string, string> = {};
        results.forEach((r) => {
          if (r.status === "fulfilled") {
            newThumbs[r.value.key] = r.value.blobUrl;
          } else {
            console.warn("No thumbnail for", r.reason?.key || "unknown key");
          }
        });

        setThumbs(newThumbs);
      } catch (err) {
        console.error("Parallel thumbnail fetch failed:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [images, dispatch]);

  /** Handle click → open presigned GET URL in new tab */
  const handleOpen = async (key: string) => {
    try {
      setLoadingKeys((prev) => [...prev, key]);
      const res = await dispatch(openViewUrlThunk({ formId: vendor.id, key })).unwrap();
      window.open(res.url, "_blank");
    } catch (err) {
      console.error("Failed to open file:", err);
    } finally {
      setLoadingKeys((prev) => prev.filter((k) => k !== key));
    }
  };

  if (!images?.length)
    return (
      <p className="text-sm text-gray-500 italic">
        No vendor images uploaded.
      </p>
    );

  return (
    <div className="mt-4">
      <h3 className="mb-3 text-sm font-medium text-gray-800">
        Vendor Images ({images.length})
      </h3>

      <div className="flex flex-wrap gap-4">
        {isLoading
          ? // 🩶 Skeleton placeholders (while thumbnails load)
            Array.from({ length: images.length }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="flex items-center w-64 p-2 border rounded-md bg-white"
              >
                <div className="w-12 h-12 rounded-md bg-gray-200 animate-pulse flex-shrink-0"></div>
                <div className="ml-3 flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-2 bg-gray-100 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))
          : // 🟢 Actual thumbnails after load
            images.map((img) => {
              const ext = img.fileName.split(".").pop()?.toLowerCase();
              const isImage = ["png", "jpg", "jpeg", "webp", "gif"].includes(ext || "");
              const thumb = thumbs[img.key];
              const loading = loadingKeys.includes(img.key);

              return (
                <div
                  key={img.key}
                  onClick={() => handleOpen(img.key)}
                  className="cursor-pointer flex items-center w-64 p-2 rounded-md bg-white hover:bg-gray-50 transition group"
                  title={img.fileName}
                >
                  <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center border rounded overflow-hidden bg-gray-50">
                    {loading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="h-4 w-4 rounded-full animate-spin"></div>
                      </div>
                    )}
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={img.fileName}
                        className="object-cover w-full h-full"
                      />
                    ) : isImage ? (
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    ) : (
                      <FileIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </div>

                  <div className="ml-3 flex-1">
                    <p className="text-xs text-gray-800 line-clamp-2 group-hover:underline">
                      {img.fileName}
                    </p>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
};
