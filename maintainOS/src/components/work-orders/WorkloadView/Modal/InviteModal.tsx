import { useState } from "react";
import { X } from "lucide-react";

export default function InviteAssignModal() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const handleInvite = () => {
    if (email && name) {
      console.log("Inviting:", { email, name });
      setEmail("");
      setName("");
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setEmail("");
    setName("");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    zIndex: 50
  };

  const modalStyle = {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    width: "100%",
    maxWidth: "600px",
    position: "relative"
  };

  const closeButtonStyle = {
    position: "absolute",
    top: "16px",
    right: "16px",
    color: "#6b7280",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px"
  };

  const contentStyle = {
    padding: "32px"
  };

  const titleStyle = {
    fontSize: "24px",
    fontWeight: 600,
    color: "#111827",
    marginBottom: "32px"
  };

  const fieldContainerStyle = {
    marginBottom: "24px"
  };

  const labelStyle = {
    display: "block",
    fontSize: "16px",
    fontWeight: 600,
    color: "#111827",
    marginBottom: "8px"
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    fontSize: "16px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    boxSizing: "border-box"
  };

  const footerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "32px"
  };

  const footerTextStyle = {
    fontSize: "14px",
    color: "#6b7280"
  };

  const buttonContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "24px"
  };

  const cancelButtonStyle = {
    color: "#2563eb",
    fontWeight: 500,
    fontSize: "16px",
    background: "none",
    border: "none",
    cursor: "pointer",
    textDecoration: "none"
  };

  const inviteButtonStyle = {
    padding: "8px 24px",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: 500,
    border: "none",
    cursor: email && name ? "pointer" : "not-allowed",
    backgroundColor: email && name ? "#1f2937" : "#d1d5db",
    color: email && name ? "white" : "#6b7280",
    transition: "background-color 0.2s"
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button
          onClick={handleCancel}
          style={closeButtonStyle}
          onMouseEnter={(e) => e.currentTarget.style.color = "#374151"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#6b7280"}
        >
          <X size={20} />
        </button>

        <div style={contentStyle}>
          <h1 style={titleStyle}>
            Invite and Assign this work order
          </h1>

          <div style={fieldContainerStyle}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@example.com"
              style={inputStyle}
              onFocus={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#d1d5db"}
            />
          </div>

          <div style={fieldContainerStyle}>
            <label style={labelStyle}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Name"
              style={inputStyle}
              onFocus={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#d1d5db"}
            />
          </div>

          <div style={footerStyle}>
            <p style={footerTextStyle}>
              We'll send an invite to join your account.
            </p>
            <div style={buttonContainerStyle}>
              <button
                onClick={handleCancel}
                style={cancelButtonStyle}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={!email || !name}
                style={inviteButtonStyle}
                onMouseEnter={(e) => {
                  if (email && name) e.currentTarget.style.backgroundColor = "#111827";
                }}
                onMouseLeave={(e) => {
                  if (email && name) e.currentTarget.style.backgroundColor = "#1f2937";
                }}
              >
                Invite and Assign
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}