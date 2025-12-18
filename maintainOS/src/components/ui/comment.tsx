import { Send, X, Paperclip, Trash2 } from "lucide-react";
import React, { useRef, useState } from "react";

type CommentProps = {
  showCommentBox: boolean;
  comment: string;
  handleSend: (file: File | null) => void;
  setShowCommentBox: React.Dispatch<React.SetStateAction<boolean>>;
  setComment: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
};

const Comment: React.FC<CommentProps> = ({
  showCommentBox,
  comment,
  handleSend,
  setShowCommentBox,
  setComment,
  isLoading,
}) => {
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      {showCommentBox && (
        <div style={{ animation: "slideInUp 0.3s ease" }}>
          <style>
            {`
              @keyframes slideInUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
            `}
          </style>

          <div
            style={{
              background: "white",
              width: "20rem",
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
                disabled={isLoading}
                style={{
                  width: "100%",
                  height: "7rem",
                  padding: "0.75rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "0.5rem",
                  resize: "none",
                  fontSize: "0.875rem",
                  backgroundColor: isLoading ? "#f1f5f9" : "white",
                }}
              />

              <input
                ref={fileInputRef}
                type="file"
                hidden
                disabled={isLoading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setAttachedFile(file);
                }}
              />

              {/* Attachment preview + remove */}
              {attachedFile && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "0.5rem",
                    padding: "0.4rem 0.6rem",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.4rem",
                    fontSize: "0.75rem",
                  }}
                >
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "14rem",
                    }}
                  >
                    {attachedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#ef4444",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "0.75rem",
                }}
              >
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    background: "transparent",
                    border: "none",
                    color: "#475569",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  <Paperclip size={16} />
                  Attach file
                </button>

                <button
                  onClick={() => {
                    handleSend(attachedFile);
                    setAttachedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  disabled={(!comment.trim() && !attachedFile) || isLoading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background:
                      (!comment.trim() && !attachedFile) || isLoading
                        ? "#e2e8f0"
                        : "#FFCD00",
                    color:
                      (!comment.trim() && !attachedFile) || isLoading
                        ? "#64748b"
                        : "white",
                    padding: "0.4rem 0.8rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    cursor:
                      (!comment.trim() && !attachedFile) || isLoading
                        ? "not-allowed"
                        : "pointer",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                  }}
                >
                  {isLoading ? (
                    "Sending..."
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

      {showCommentBox ? (
        <button
          onClick={() => setShowCommentBox(false)}
          className="flex justify-center items-center"
          style={{
            background: "#FFCD00",
            color: "white",
            width: "3rem",
            height: "3rem",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
          }}
        >
          <X size={20} />
        </button>
      ) : (
        <button
          onClick={() => setShowCommentBox(true)}
          style={{
            background: "#FFCD00",
            color: "white",
            padding: "0.5rem 1.2rem",
            height: "3rem",
            borderRadius: "9999px",
            fontSize: "14px",
            fontWeight: "500",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
          }}
        >
          Add Comment
        </button>
      )}
    </div>
  );
};

export default Comment;
