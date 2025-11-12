import { Send, X, } from "lucide-react"; // Send icon add kiya
import React from "react";

type CommentProps = {
  showCommentBox: boolean;
  comment: string;
  handleSend: () => void; // Logic parent se aayega
  setShowCommentBox: React.Dispatch<React.SetStateAction<boolean>>;
  setComment: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean; // Loading state receive karein
};

const Comment: React.FC<CommentProps> = ({
  showCommentBox,
  comment,
  handleSend,
  setShowCommentBox,
  setComment,
  isLoading, // isLoading ko use karein
}) => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "6rem",
        right: "3rem",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      {/* Comment Box */}
      {showCommentBox && (
        <div
          style={{
            transition: "all 0.3s ease-in-out",
            // Animation ke liye (optional)
            animation: "slideInUp 0.3s ease",
          }}
        >
          {/* CSS Animation (Optional) */}
          <style>
            {`
              @keyframes slideInUp {
                from {
                  transform: translateY(20px);
                  opacity: 0;
                }
                to {
                  transform: translateY(0);
                  opacity: 1;
                }
              }
            `}
          </style>

          <div
            style={{
              background: "white",
              width: "20rem",
              maxWidth: "24rem",
              borderRadius: "0.75rem",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              border: "1px solid #e2e8f0",
              marginBottom: "1rem",
            }}
          >
            <div style={{ padding: "1rem" }}>
              <h3
                style={{
                  fontWeight: "bold",
                  fontSize: "1.125rem",
                  color: "#1e293b",
                  marginBottom: "0.75rem",
                }}
              >
                Leave a comment
              </h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts..."
                disabled={isLoading} // Loading mein disable
                style={{
                  width: "100%",
                  height: "7rem",
                  padding: "0.75rem",
                  border: "1px solid #cbd5e1", // Border color update
                  borderRadius: "0.5rem",
                  resize: "none",
                  fontSize: "0.875rem",
                  color: "#334155",
                  outline: "none",
                  backgroundColor: isLoading ? "#f1f5f9" : "white", // Loading BG
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "0.75rem",
                }}
              >
                <button
                  onClick={handleSend}
                  disabled={!comment.trim() || isLoading} // Loading mein disable
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    // Button color logic
                    background:
                      !comment.trim() || isLoading
                        ? "#e2e8f0" // Disabled color
                        : "#FFCD00", // Active color
                    color:
                      !comment.trim() || isLoading
                        ? "#64748b" // Disabled text color
                        : "white",
                    padding: "0.4rem 0.8rem", // Padding update
                    borderRadius: "0.5rem",
                    border: "none",
                    cursor:
                      !comment.trim() || isLoading ? "not-allowed" : "pointer",
                    transition: "background 0.2s ease",
                    fontSize: "0.875rem", // Font size
                    fontWeight: "500", // Font weight
                  }}
                >
                  {isLoading ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <span>Send</span>
                      <Send size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {showCommentBox ? (
        <button
          onClick={() => setShowCommentBox(false)} // Close karne ke liye 'false' set karein
          aria-label="Close comment box"
          style={{
            background: "#FFCD00", // Red for close
            color: "white",
            width: "3rem", // Size update
            height: "3rem", // Size update
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%", // Fully rounded
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            transition: "all 0.3s ease-in-out",
            transform: "rotate(0deg)", // Rotate X
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05) rotate(0deg)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1) rotate(0deg)";
            e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)";
          }}
        >
          <X size={20} />
        </button>
      ) : (
        <button
          onClick={() => setShowCommentBox(true)} // Open karne ke liye 'true' set karein
          aria-label="Open comment box"
          style={{
            background: "#FFCD00",
            color: "white",
            padding: "0.5rem 1.2rem",
            height: "3rem", // Height set
            borderRadius: "9999px", // Pill shape
            fontSize: "14px",
            fontWeight: "500",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            transition: "all 0.3s ease-in-out",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)";
          }}
        >
          Add Comment
        </button>
      )}
    </div>
  );
};

export default Comment;