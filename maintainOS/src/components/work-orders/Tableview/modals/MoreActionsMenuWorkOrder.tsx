import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface MoreActionsMenuWorkOrderProps {
  children: React.ReactNode; // Trigger button
  onDelete?: () => void;
}

export function MoreActionsMenuWorkOrder({
  children,
  onDelete,
}: MoreActionsMenuWorkOrderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  // Menu positioning
  useEffect(() => {
    if (!isOpen || !triggerRef.current || !menuRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 288;

    let left = triggerRect.right - menuWidth;
    if (left < 0) left = triggerRect.left;

    setPosition({
      top: triggerRect.bottom + 8,
      left,
      width: menuWidth,
    });
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        !menuRef.current?.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete();
    setIsOpen(false);
  };

  if (typeof document === "undefined" || !document.body) return null;

  return (
    <>
      {React.cloneElement(children as React.ReactElement, {
        ref: triggerRef,
        onClick: () => setIsOpen(!isOpen),
      })}

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "absolute",
              top: position.top,
              left: position.left,
              width: position.width,
              zIndex: 1000,
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "0.375rem",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
            }}
          >
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Duplicate Work Order
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Export Work Order to PDF
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Share Work Order via Email
            </a>
            <div className="border-t border-gray-100 my-2"></div>

            <button
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              onClick={handleDeleteClick}
            >
              Delete Work Order
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
