import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";

interface MoreActionsMenuProps {
  children: React.ReactNode; // The trigger button itself
  onDelete?: () => void; // <-- 1. DELETE PROP ADD KIYA
}

export function MoreActionsMenu({
  children,
  onDelete, // <-- 2. PROP KO READ KIYA
}: MoreActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null); // Ref for the button
  const menuRef = useRef<HTMLDivElement>(null); // Ref for the menu panel
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  // Position the menu
  useEffect(() => {
    if (!isOpen || !triggerRef.current || !menuRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 288; // Fixed width for the menu as per your image

    let left = triggerRect.right - menuWidth; 
    if (left < 0) { 
        left = triggerRect.left; 
    }

    setPosition({
      top: triggerRect.bottom + 8, // 8px below the trigger
      left: left,
      width: menuWidth,
    });
  }, [isOpen]);

  // Handle clicks outside to close the menu
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

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // --- 3. DELETE CLICK HANDLER BANAYA ---
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(); // Prop function ko call kiya
    }
    setIsOpen(false); // Menu band kiya
  };

  if (typeof document === "undefined" || !document.body) {
    return null;
  }

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
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", 
              paddingTop: "0.5rem", 
              paddingBottom: "0.5rem", 
            }}
          >
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Use in Existing Work Orders
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Copy to New Template
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Export to PDF
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Share Procedure publicly with the MaintainOS community
            </a>
            <div className="border-t border-gray-100 my-2"></div>
            
            {/* --- 4. <a> TAG KO <button> SE BADLA AUR onClick ADD KIYA --- */}
            <button
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              onClick={handleDeleteClick}
            >
              Delete
            </button>
          </div>,
          document.body
        )}
    </>
  );
}