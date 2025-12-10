// PartOptionsDropdown.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface PartOptionsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  onOrder?: () => void;
  onCopy?: () => void;
  onExportQR?: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

export default function PartOptionsDropdown({
  isOpen,
  onClose,
  onDelete,
  onOrder,
  onCopy,
  onExportQR,
  triggerRef,
}: PartOptionsDropdownProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const updatePosition = () => {
        if (!triggerRef.current) return;
        const triggerRect = triggerRef.current.getBoundingClientRect();
        // A standard width for text-only dropdowns, slightly smaller than icon ones
        const menuWidth = 200; 

        // Align right edge of menu with right edge of trigger button
        let left = triggerRect.right - menuWidth;
        // Prevent going off-screen to the left
        if (left < 10) left = triggerRect.left;

        // Position below button with a small gap
        const menuHeight = 180; 
        let top = triggerRect.bottom + window.scrollY + 4;
        
        // Flip upwards if hitting bottom of viewport
        if (triggerRect.bottom + menuHeight > window.innerHeight) {
             top = triggerRect.top + window.scrollY - menuHeight;
        }

        setPosition({ top, left });
      };

      updatePosition();
      // Update on scroll/resize
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isOpen, triggerRef]);

  // Handle Outside Click
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

  return createPortal(
    <div
      ref={menuRef}
      className="bg-white border border-gray-200 rounded-md shadow-lg z-[99999] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      style={{
        position: "absolute",
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: "200px",
      }}
    >
      <div className="py-1">
        <MenuItem 
          label="Order this Part" 
          onClick={onOrder} 
        />
        <MenuItem 
          label="Copy to New Part" 
          onClick={onCopy} 
        />
        <MenuItem 
          label="Export QR Codes" 
          onClick={onExportQR} 
        />
        
        <div className="h-px bg-gray-100 my-1" />
        
        <MenuItem 
          label="Delete" 
          onClick={onDelete} 
          variant="danger" 
        />
      </div>
    </div>,
    document.body
  );
}

// Reusable Row Component - Simplified (No Icon prop)
function MenuItem({ label, onClick, variant = "default" }: any) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`w-full text-left px-4 py-2 text-sm transition-colors block
        ${variant === 'danger' 
          ? 'text-red-600 hover:bg-red-50' 
          : 'text-gray-700 hover:bg-gray-100'
        }
      `}
    >
      {label}
    </button>
  );
}