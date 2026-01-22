"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

export function SortModal({
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
  unreadFirst: boolean;
  onToggleUnread: () => void;
  anchorRef: React.RefObject<HTMLDivElement>;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [openSection, setOpenSection] = useState<string | null>(currentSort);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const sections = [
    { label: "Creation Date", options: ["Newest First", "Oldest First"] },
    { label: "Due Date", options: ["Earliest First", "Latest First"] },
    { label: "Last Updated", options: ["Most Recent First", "Least Recent First"] },
    { label: "Priority", options: ["Highest First", "Lowest First"] },
  ];

  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, left: rect.left + rect.width / 2 });
    }
  }, [isOpen, anchorRef]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        anchorRef.current &&
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

  const modalContent = (
    <>
      <div
        className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-[9998]"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        className="fixed z-[9999] text-sm rounded-md border border-gray-200 bg-white shadow-xl animate-fade-in p-3"
        style={{
          top: pos.top,
          left: pos.left,
          transform: "translateX(-50%)",
          width: "300px",
          maxWidth: "90vw",
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Sorting Sections */}
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

  if (!isOpen) return null;
  return createPortal(modalContent, document.body);
}
