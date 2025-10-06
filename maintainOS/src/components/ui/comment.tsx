import { XIcon } from "lucide-react";
import React from "react";

const Comment = ({
  showCommentBox,
  comment,
  handleSend,
  setShowCommentBox,
  setComment,
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
          }}
        >
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
                style={{
                  width: "100%",
                  height: "7rem",
                  padding: "0.75rem",
                  border: "1px solid black",
                  borderRadius: "0.5rem",
                  resize: "none",
                  fontSize: "0.875rem",
                  color: "#334155",
                  outline: "none",
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
                  disabled={!comment.trim()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    // background: "white",
                    background: !comment.trim()
                      ? ""
                      : "oklch(.646 .222 41.116)",
                    color: !comment.trim()
                      ? "oklch(.646 .222 41.116)"
                      : "white",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    cursor: !comment.trim() ? "not-allowed" : "pointer",
                    // opacity: !comment.trim() ? 0.5 : 1,
                    transition: "background 0.2s ease",
                  }}
                >
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {showCommentBox ? (
        <button
          onClick={() => setShowCommentBox(!showCommentBox)}
          aria-label={showCommentBox ? "Close comment box" : "Open comment box"}
          style={{
            background: "white",
            color: "oklch(.646 .222 41.116)",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
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
          <div
            style={{
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.3s ease-in-out",
            }}
          >
            <XIcon />
          </div>
        </button>
      ) : (
        <button
          onClick={() => setShowCommentBox(!showCommentBox)}
          aria-label={showCommentBox ? "Close comment box" : "Open comment box"}
          style={{
            background: "oklch(.646 .222 41.116)", // Primary color
            color: "white",
            padding: "0.5rem 1.2rem",
            borderRadius: "8px",
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
