"use client";
import React, { useEffect, useRef } from "react";

export default function WorkOrderActionsModal({ isOpen, onClose, onAction }) {
  const modalRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuItems = [
    "Mark as unread",
    "Copy to New Work Order",
    "Save as Work Order Template",
    "Export to PDF",
    "Email to Vendors",
    "Delete",
  ];

  return (
    <div
      ref={modalRef}
      className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50"
    >
      <ul className="py-1">
        {menuItems.map((item) => (
          <li key={item}>
            <button
              onClick={() => {
                onAction(item);
                onClose();
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
