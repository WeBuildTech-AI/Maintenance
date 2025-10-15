import { X, PackagePlus } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  part?: any;
}

export default function RestockModal({ isOpen, onClose, onConfirm, part }: RestockModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [restockData, setRestockData] = useState<Record<string, number>>({});

  // 🟢 Log received part
  useEffect(() => {
    if (part) {
      console.log("📦 RestockModal opened for:", part.name);
      console.log("🏬 Location data received:", part.locations);
    }
  }, [part]);

  // 🟡 Initialize restock data per location
  useEffect(() => {
    if (part?.locations?.length) {
      const defaults: Record<string, number> = {};
      part.locations.forEach((loc: any) => {
        defaults[loc.name || loc.locationName || "Unknown"] = 0;
      });
      setRestockData(defaults);
    }
  }, [part]);

  // 🟣 Scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // 🟣 Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // 🟣 Outside click close
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      const el = modalRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) onClose();
    };
    window.addEventListener("pointerdown", handler, true);
    return () => window.removeEventListener("pointerdown", handler, true);
  }, [onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    console.log("🧾 Restock quantities entered:", restockData);
    onConfirm(restockData);
  };

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-yellow-500" />
            Restock Part
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {part ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Add stock for <span className="font-medium text-gray-900">{part.name}</span>.
            </p>

            {part.locations?.length ? (
              <div className="space-y-3 mb-6">
                {part.locations.map((loc: any, i: number) => {
                  const locName = loc.name || loc.locationName || `Location ${i + 1}`;
                  const current = loc.unitsInStock ?? 0;

                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2 hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{locName}</p>
                        <p className="text-xs text-gray-500">Current: {current} units</p>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={restockData[locName] ?? 0}
                        onChange={(e) =>
                          setRestockData((prev) => ({
                            ...prev,
                            [locName]: Number(e.target.value),
                          }))
                        }
                        className="border border-gray-300 rounded-md px-2 py-1 w-24 text-right focus:outline-none focus:ring-1 focus:ring-yellow-400"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-6">No location data available for this part.</p>
            )}
          </>
        ) : (
          <p className="text-gray-500 text-sm mb-6">No part selected.</p>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-yellow-600 border border-yellow-400 rounded-md hover:bg-yellow-50 transition-all"
          >
            Confirm Restock
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
