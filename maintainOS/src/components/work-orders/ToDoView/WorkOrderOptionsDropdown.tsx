"use client";

import React, { useEffect, useRef, useState } from "react";
// ✅ 1. Import createPortal
import { createPortal } from "react-dom";

interface WorkOrderOptionsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  onMarkUnread?: () => void;
  onCopy?: () => void;
  onExport?: () => void;
  // ✅ 2. Add triggerRef to position the modal
  triggerRef: React.RefObject<HTMLButtonElement>;
}

export default function WorkOrderOptionsDropdown({
  isOpen,
  onClose,
  onDelete,
  onMarkUnread,
  onCopy,
  onExport,
  triggerRef, // ✅ 3. Get the triggerRef
}: WorkOrderOptionsDropdownProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // ✅ 4. Logic to calculate position based on the button
  useEffect(() => {
    if (isOpen && triggerRef.current && menuRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 288; // 18rem or w-72 (jaisa aapne manga tha)

      // Position it below the button, aligned to the right
      let left = triggerRect.right - menuWidth;
      if (left < 0) left = triggerRect.left; // Fallback if not enough space

      setPosition({
        top: triggerRect.bottom + window.scrollY + 8, // 8px below the button
        left: left + window.scrollX,
      });
    }
  }, [isOpen, triggerRef]);

  // ✅ 5. Click outside logic (using the new menuRef)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  // ✅ 6. Use createPortal to render outside the modal's overflow
  return createPortal(
    <div
      ref={menuRef}
      className="bg-white border border-gray-200 rounded-md shadow-lg z-[9999999999]" // High z-index
      // ✅ 7. Apply calculated position and width using inline styles
      style={{
        position: "absolute",
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: "288px", // w-72
      }}
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
    </div>,
    document.body // Attach to the document body
  );
}