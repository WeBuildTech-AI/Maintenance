"use client";

import React, { useEffect, useRef } from "react";

interface WorkOrderOptionsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  onMarkUnread?: () => void;
  onCopy?: () => void;
  onExport?: () => void;
}

export default function WorkOrderOptionsDropdown({
  isOpen,
  onClose,
  onDelete,
  onMarkUnread,
  onCopy,
  onExport,
}: WorkOrderOptionsDropdownProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50"
      ref={modalRef}
    >
      <ul className="py-1 text-sm text-gray-700">
        <li
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
          onClick={() => {
            onMarkUnread?.();
            onClose();
          }}
        >
          <span>📨</span> Mark as Unread
        </li>
        <li
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
          onClick={() => {
            onCopy?.();
            onClose();
          }}
        >
          <span>📋</span> Copy to New Work Order
        </li>
        <li
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
          onClick={() => {
            onExport?.();
            onClose();
          }}
        >
          <span>📄</span> Export to PDF
        </li>
        <hr className="my-1 border-gray-200" />
        <li
          className="px-4 py-2 text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-2"
          onClick={() => {
            onDelete();
            onClose();
          }}
        >
          <span>🗑️</span> Delete
        </li>
      </ul>
    </div>
  );
}
