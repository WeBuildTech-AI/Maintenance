export function ConfirmDiscardModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          width: "500px",
          minHeight: "220px",
          maxWidth: "95%",
          padding: "40px 28px 28px",
          textAlign: "center",
          position: "relative",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        }}
      >
        <button
          onClick={onCancel}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "transparent",
            border: "none",
            fontSize: "20px",
            color: "#6B7280",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <p
          style={{
            fontSize: "17px",
            fontWeight: 500,
            color: "#111827",
            marginBottom: "28px",
            marginTop: "20px",
          }}
        >
          Discard unsaved changes?
        </p>

        <button
          onClick={onConfirm}
          style={{
            width: "100%",
            backgroundColor: "#60A5FA",
            border: "none",
            borderRadius: "6px",
            padding: "12px",
            fontSize: "15px",
            fontWeight: 600,
            color: "white",
            cursor: "pointer",
            marginBottom: "18px",
          }}
        >
          Discard Changes
        </button>

        <button
          onClick={onCancel}
          style={{
            background: "transparent",
            border: "none",
            color: "#3B82F6",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
