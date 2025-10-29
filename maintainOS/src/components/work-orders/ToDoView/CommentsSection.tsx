"use client";
import { forwardRef } from "react";
import { Paperclip, X } from "lucide-react";
import { formatBytes } from "../../../utils/formatBytes";

// Local demo messages (from your example)
const messages = [
  {
    id: 1,
    sender: "Bob Smith",
    text: "Hey, how are you?",
    avatar: "/ashwini.png",
    timestamp: "26/09/2025, 13:40",
  },
  {
    id: 2,
    sender: "Ashwini Chauhan",
    text: "I'm good, what about you?",
    avatar: "/ashwini.png",
    timestamp: "26/09/2025, 13:40",
  },
  {
    id: 3,
    sender: "Charlie Brown",
    text: "Doing great!",
    avatar: "/ashwini.png",
    timestamp: "26/09/2025, 13:40",
  },
];

export const CommentsSection = forwardRef(function CommentsSection(
  { comment, setComment, attachment, setAttachment, fileRef }: any,
  ref
) {
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAttachment(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const clearAttachment = () => setAttachment(null);
  const onInput = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setComment(e.target.value);

//   const getInitials = (name: string) =>
//     name
//       .split(" ")
//       .map((n) => n[0])
//       .join("");

  return (
    <>
      {/* Input */}
      <div className="border-t p-6">
        <h3 className="text-lg font-medium mb-2">Comments</h3>
        <textarea
          ref={ref as any}
          value={comment}
          onChange={onInput}
          placeholder="Write a comment…"
          rows={3}
          className="w-full text-sm rounded-lg bg-white px-3 py-2 border focus:ring-2 focus:ring-orange-300 resize-none"
        />
        <div className="p-1 flex justify-between items-end">
          {/* Attachment preview */}
          {attachment ? (
            <div className="group flex items-center gap-3 rounded-md border border-border bg-white px-2 py-1 mt-2">
              {attachment.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(attachment)}
                  onLoad={(e) =>
                    URL.revokeObjectURL((e.target as HTMLImageElement).src)
                  }
                  alt="Attachment preview"
                  className="h-8 w-8 rounded object-cover"
                />
              ) : null}
              <div className="min-w-0">
                <div className="text-xs font-medium truncate max-w-[200px]">
                  {attachment.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {attachment.type || "file"} • {formatBytes(attachment.size)}
                </div>
              </div>
              <button
                type="button"
                onClick={clearAttachment}
                className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
                aria-label="Remove attachment"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div />
          )}

          {/* Actions */}
          <div className="flex items-center">
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={onFileChange}
              className="hidden"
            />
            <Paperclip
              onClick={() => fileRef.current?.click()}
              className="ml-2 h-4 w-4 cursor-pointer text-muted-foreground"
            />
            <button className="ml-2 inline-flex items-center rounded bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-700">
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Existing comments */}
      <div className="space-y-6 p-6">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100">
              <img
                src={msg.avatar}
                alt={msg.sender}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-medium">{msg.sender}</p>
                <span className="text-xs text-muted-foreground">
                  {msg.timestamp}
                </span>
              </div>
              <div className="mt-1 space-y-1">
                {msg.text.split("\n").map((line, i) => (
                  <p key={i} className="text-sm">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
});
