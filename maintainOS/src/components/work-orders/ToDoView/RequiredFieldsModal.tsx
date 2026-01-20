import React from "react";
import { X } from "lucide-react";

interface RequiredFieldsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RequiredFieldsModal: React.FC<RequiredFieldsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          padding: "32px",
          width: "90%",
          maxWidth: "500px",
          position: "relative",
          textAlign: "center",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#6B7280",
          }}
        >
          <X size={20} />
        </button>

        <h2
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#111827",
            marginBottom: "16px",
            marginTop: "8px",
          }}
        >
          Some required fields have not been completed
        </h2>

        <p
          style={{
            fontSize: "16px",
            color: "#4B5563",
            marginBottom: "32px",
            lineHeight: "1.5",
          }}
        >
          Some required fields have not been completed. You need to fill them
          before completing the Work Order
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#60A5FA", 
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "10px 24px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              width: "100%",
              maxWidth: "280px",
              transition: "background-color 0.2s",
            }}
           
          >
            Cancel
          </button>

          
        </div>
      </div>
    </div>
  );
};

export default RequiredFieldsModal;
