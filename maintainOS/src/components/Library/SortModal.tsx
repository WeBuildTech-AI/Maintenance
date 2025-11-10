"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

export default function SortModal({
  isOpen,
  onClose,
  onSortChange,
  currentSort,
  currentOrder,
  anchorRef,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSortChange: (type: string, order: "asc" | "desc") => void;
  currentSort: string;
  currentOrder: "asc" | "desc";
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, placement: "bottom" as "bottom" | "top" });

  // --- 1. "Name" WALA OPTION HATA DIYA HAI ---
  const sections = [
    { label: "Creation Date", options: ["Newest First", "Oldest First"] },
    { label: "Due Date", options: ["Earliest First", "Latest First"] },
    { label: "Last Updated", options: ["Most Recent First", "Least Recent First"] },
    { label: "Priority", options: ["Highest First", "Lowest First"] },
  ];

  // Use layout effect so we measure before paint
  useLayoutEffect(() => {
    if (!isOpen) return;

    const anchor = anchorRef?.current;
    if (!anchor || typeof window === "undefined") return;

    const rect = anchor.getBoundingClientRect();
    const left = rect.left; // Align to the left of the anchor
    const bottomSpace = window.innerHeight - rect.bottom;
    const topSpace = rect.top;

    // prefer bottom placement, but flip if not enough space
    const placement = bottomSpace < 200 && topSpace > bottomSpace ? "top" : "bottom";
    const top = placement === "bottom" ? rect.bottom + 8 : rect.top - 8;
    setPos({ top, left, placement });
  }, [isOpen, anchorRef]);

  // close on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        anchorRef?.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
        setOpenSection(null);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  const handleSelect = (sectionLabel: string, order: "asc" | "desc") => {
    onSortChange(sectionLabel, order);
    onClose();
  };

  if (!isOpen) return null;
  if (typeof document === "undefined" || !document.body) return null;

  const modalContent = (
    <>
      <div
        className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-[9998]"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        className="fixed z-[9999] text-sm rounded-md border border-gray-200 bg-white shadow-xl p-3"
        style={{
          top: pos.top,
          left: pos.left,
          transform: pos.placement === "bottom" ? "translateY(0)" : "translateY(-100%)", // Removed translateX
          width: "300px",
          maxWidth: "90vw",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col divide-y divide-gray-100 max-h-[65vh] overflow-y-auto">
          {sections.map((section) => (
            <div key={section.label} className="flex flex-col mt-1 mb-1">
              <button
                onClick={() =>
                  setOpenSection(openSection === section.label ? null : section.label)
                }
                className={`flex items-center justify-between w-full px-4 py-3 text-sm transition-all rounded-md ${
                  currentSort === section.label
                    ? "text-blue-600 font-medium bg-gray-50"
                    : "text-gray-800 hover:bg-gray-50"
                }`}
              >
                <span>{section.label}</span>
                {openSection === section.label ? (
                  <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>

              {openSection === section.label && (
                <div className="flex flex-col bg-gray-50 border-t border-gray-100 py-1">
                  {section.options.map((opt) => {
                    // --- 2. "A -> Z" WALI LOGIC HATA DI HAI ---
                    const isAsc =
                      opt.includes("Oldest") ||
                      opt.includes("Least") ||
                      opt.includes("Lowest") ||
                      opt.includes("Earliest");
                    const isSelected =
                      currentSort === section.label &&
                      ((isAsc && currentOrder === "asc") ||
                        (!isAsc && currentOrder === "desc"));

                    return (
                      <button
                        key={opt}
                        onClick={() =>
                          handleSelect(section.label, isAsc ? "asc" : "desc")
                        }
                        className={`flex items-center justify-between px-6 py-2 text-left text-sm transition rounded-md ${
                          isSelected
                            ? "text-blue-600 bg-white"
                            : "text-gray-700 hover:text-blue-500 hover:bg-white"
                        }`}
                      >
                        {opt}
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-500" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}