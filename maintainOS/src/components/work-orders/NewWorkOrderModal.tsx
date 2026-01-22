"use client";

import { X } from "lucide-react";
import { NewWorkOrderForm } from "./NewWorkOrderForm/NewWorkOrderFrom";

export default function NewWorkOrderModal({
  isOpen,
  onClose,
  prefillData,
}: {
  isOpen: boolean;
  onClose: () => void;
  prefillData?: any;
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.1)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "85vw",
          height: "90vh",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button - top right */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 bg-white rounded-full p-1 shadow-sm"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Form content */}
        <div className="flex-1 overflow-y-auto">
          <NewWorkOrderForm
            isEditMode={false}
            onCancel={onClose}
            onCreate={() => {
              onClose();
            }}
            prefillData={prefillData}
          />
        </div>
      </div>
    </div>
  );
}

