import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface CreateProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (name: string, description: string) => void;
}

export default function CreateProcedureModal({
  isOpen,
  onClose,
  onNext,
}: CreateProcedureModalProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          padding: "3rem",
          width: "600px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "#111827",
            textAlign: "center",
            marginBottom: "1.5rem",
          }}
        >
          Bring your new procedure to life
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "#f3f8ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #dbeafe",
            }}
          >
            <CheckCircle2 size={36} color="#3b82f6" />
          </div>
        </div>

        <label style={{ fontWeight: 600 }}>
          Give it a name <span style={{ color: "#ef4444" }}>(Required)</span>
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Procedure name"
          style={{
            width: "100%",
            marginTop: "6px",
            padding: "10px 12px",
            border: "1px solid #93c5fd",
            borderRadius: "6px",
          }}
        />

        <label style={{ fontWeight: 600, marginTop: "1rem", display: "block" }}>
          Add a description
        </label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="What needs to be done"
          style={{
            width: "100%",
            height: "100px",
            marginTop: "6px",
            padding: "10px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            resize: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "1.5rem",
            gap: "1rem",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#2563eb",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            disabled={!name.trim()}
            onClick={() => onNext(name, desc)}
            style={{
              backgroundColor: name.trim() ? "#2563eb" : "#e5e7eb",
              color: name.trim() ? "#fff" : "#9ca3af",
              fontWeight: 500,
              border: "none",
              borderRadius: "6px",
              padding: "10px 20px",
              cursor: name.trim() ? "pointer" : "not-allowed",
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
