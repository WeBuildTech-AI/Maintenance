import React, { useState, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";

interface MoreActionsMenuProps {
  children: React.ReactNode; // The trigger button itself
  onDelete?: () => void; 
  onDuplicate?: () => void; 
  onRestore?: () => void; // <-- [CHANGE] NAYA PROP ADD KAREIN
}

export function MoreActionsMenu({
  children,
  onDelete,
  onDuplicate,
  onRestore, // <-- [CHANGE] PROPS SE READ KAREIN
}: MoreActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null); // Ref for the button
  const menuRef = useRef<HTMLDivElement>(null); // Ref for the menu panel
  
  const [position, setPosition] = useState({ 
    top: 0, 
    left: 0, 
    width: 0,
    placement: "bottom" as "bottom" | "top" 
  });

  // Position the menu
  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current || !menuRef.current) return;
    if (typeof window === "undefined") return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 288; // Fixed width for the menu as per your image

    const estimatedMenuHeight = 200; 
    const bottomSpace = window.innerHeight - triggerRect.bottom;
    const topSpace = triggerRect.top;
    
    const placement = (bottomSpace < estimatedMenuHeight && topSpace > bottomSpace) ? "top" : "bottom";
    
    const top = placement === "bottom" 
      ? triggerRect.bottom + 8 
      : triggerRect.top - 8;      

    let left = triggerRect.right - menuWidth; 
    if (left < 0) { 
        left = triggerRect.left; 
    }

    setPosition({
      top: top,
      left: left,
      width: menuWidth,
      placement: placement,
    });
  }, [isOpen]); 

  // Handle clicks outside to close the menu
  React.useEffect(() => {
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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(); 
    }
    setIsOpen(false); 
  };

  const handleDuplicateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDuplicate) {
      onDuplicate(); 
    }
    setIsOpen(false); 
  };
  
  // --- 👇 [CHANGE] NAYA HANDLER ADD KAREIN ---
  const handleRestoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRestore) {
      onRestore(); // Prop function ko call kiya
    }
    setIsOpen(false); // Menu band kiya
  };
  // --- END OF NEW HANDLER ---


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
              transform: position.placement === "bottom" ? "translateY(0)" : "translateY(-100%)",
            }}
          >
            {/* --- 👇 [CHANGE] NAYA "RESTORE" BUTTON CONDITIONALLY ADD KAREIN --- */}
            {/* Yeh tabhi dikhega jab `onRestore` prop pass hoga */}
            {onRestore && (
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleRestoreClick}
              >
                Restore
              </button>
            )}
            {/* --- END OF NEW BUTTON --- */}

            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Use in Existing Work Orders
            </a>
            
            {/* `onDuplicate` prop ke hisaab se button show/hide karein */}
            {onDuplicate && (
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleDuplicateClick}
              >
                Copy to New Template
              </button>
            )}

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
            
            {/* `onDelete` prop ke hisaab se button show/hide karein */}
            {onDelete && (
              <button
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                onClick={handleDeleteClick}
              >
                Delete
              </button>
            )}
          </div>,
          document.body
        )}
    </>
  );
}