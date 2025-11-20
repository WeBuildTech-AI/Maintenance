"use client";

import { forwardRef, useEffect, useState } from "react";
import { Paperclip, X, Loader2, History } from "lucide-react";
import { formatBytes } from "../../../utils/formatBytes"; 
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { 
  addWorkOrderComment, 
  fetchWorkOrderComments,
  fetchWorkOrderLogs 
} from "../../../store/workOrders/workOrders.thunks";
import toast from "react-hot-toast";

// Helper to format API Date strings
const formatCommentDate = (dateString?: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

interface CommentsSectionProps {
  selectedWorkOrder: any;
  comment: string;
  setComment: (val: string) => void;
  attachment: File | null;
  setAttachment: (file: File | null) => void;
  fileRef: React.RefObject<HTMLInputElement>;
}

export const CommentsSection = forwardRef<HTMLTextAreaElement, CommentsSectionProps>(
  function CommentsSection(
    { comment, setComment, attachment, setAttachment, fileRef, selectedWorkOrder },
    ref
  ) {
    const dispatch = useAppDispatch();
    
    // 1. Get Current User (for fallback logic)
    const currentUser = useAppSelector((state) => state.auth.user);
    
    // 2. Get Logs from Redux (Safe access)
    const logs = useAppSelector((state) => state.workOrders?.logs || []);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // 3. Get Comments from selected Work Order
    const comments = selectedWorkOrder?.comments || [];

    // ✅ Fetch Comments AND Logs on Mount/Change
    useEffect(() => {
      if (selectedWorkOrder?.id) {
        dispatch(fetchWorkOrderComments(selectedWorkOrder.id));
        dispatch(fetchWorkOrderLogs());
      }
    }, [dispatch, selectedWorkOrder?.id]);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      setAttachment(file);
      if (fileRef.current) fileRef.current.value = "";
    };

    const clearAttachment = () => setAttachment(null);
    
    const handleSend = async () => {
      if (!comment.trim()) return;
      if (!selectedWorkOrder?.id) return;

      try {
        setIsSubmitting(true);
        
        await dispatch(addWorkOrderComment({ 
          id: selectedWorkOrder.id, 
          message: comment 
        })).unwrap();

        setComment(""); 
        setAttachment(null);
        toast.success("Comment added");
        
        // Refresh comments to ensure we get the full author object from backend
        dispatch(fetchWorkOrderComments(selectedWorkOrder.id));
        
      } catch (error: any) {
        console.error("Failed to add comment:", error);
        toast.error(typeof error === 'string' ? error : "Failed to send comment");
      } finally {
        setIsSubmitting(false);
      }
    };

    // ==========================================
    // 🔄 MERGE & SORT LOGIC
    // ==========================================
    
    // 1. Filter logs for the current Work Order ID
    // Ensure logs is an array before filtering
    const safeLogs = Array.isArray(logs) ? logs : [];
    const currentLogs = safeLogs.filter((log: any) => log.workOrderId === selectedWorkOrder?.id);

    // 2. Combine Comments & Logs into a single timeline array
    const timelineItems = [
      ...comments.map((c: any) => ({ ...c, type: "comment" })),
      ...currentLogs.map((l: any) => ({ ...l, type: "log" }))
    ];

    // 3. Sort by Date (Newest First)
    timelineItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
      <>
        {/* --- INPUT SECTION --- */}
        <div className="border-t p-6 bg-gray-50/50">
          <h3 className="text-lg font-medium mb-2">Activity & Comments</h3>
          <textarea
            ref={ref}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment…"
            rows={3}
            className="w-full text-sm rounded-lg bg-white px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-orange-500 resize-none outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          
          <div className="p-1 flex justify-between items-end mt-2">
            {/* Attachment Preview */}
            {attachment ? (
              <div className="group flex items-center gap-3 rounded-md border border-gray-200 bg-white px-2 py-1">
                {attachment.type.startsWith("image/") && (
                  <img
                    src={URL.createObjectURL(attachment)}
                    alt="Preview"
                    className="h-8 w-8 rounded object-cover"
                  />
                )}
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate max-w-[200px]">
                    {attachment.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {typeof formatBytes === 'function' ? formatBytes(attachment.size) : attachment.size}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearAttachment}
                  className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100 text-gray-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : <div />}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <input ref={fileRef} type="file" onChange={onFileChange} className="hidden" />
              <button onClick={() => fileRef.current?.click()} className="text-gray-400 hover:text-gray-600 transition-colors">
                <Paperclip className="h-5 w-5" />
              </button>
              
              <button 
                onClick={handleSend}
                disabled={isSubmitting || !comment.trim()}
                className="inline-flex items-center gap-2 rounded bg-orange-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting && <Loader2 className="h-3 w-3 animate-spin" />}
                Send
              </button>
            </div>
          </div>
        </div>

        {/* --- TIMELINE LIST (Logs + Comments) --- */}
        <div className="space-y-6 p-6 bg-white">
          {timelineItems.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No activity yet.</p>
          ) : (
            timelineItems.map((item: any, index: number) => {
              
              // ================= COMMON DATA SETUP =================
              
              // Fallback Logic for Author (Fixes "Unknown User")
              let authorData = item.author || item.user;
              if (!authorData && currentUser && item.authorId === currentUser.id) {
                authorData = currentUser;
              }

              const authorName = authorData?.fullName || authorData?.name || "Unknown User";
              const authorAvatar = authorData?.avatarUrl || authorData?.avatar;
              const initials = (authorName.charAt(0) || "U").toUpperCase();

              // ================= RENDER LOG =================
              if (item.type === "log") {
                return (
                  <div key={`log-${item.id || index}`} className="flex gap-3 items-start opacity-85 hover:opacity-100 transition-opacity">
                    {/* Avatar for Log */}
                    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs overflow-hidden">
                      {authorAvatar ? (
                        <img src={authorAvatar} alt={authorName} className="h-full w-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    
                    {/* Log Content */}
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-gray-900">{authorName}</span>
                        <span className="text-xs text-gray-500">{formatCommentDate(item.createdAt)}</span>
                      </div>
                       <p className="text-sm text-gray-600">
                        {item.responseLog || "Activity logged"}
                      </p>
                    </div>
                  </div>
                );
              }

              // ================= RENDER COMMENT =================
              return (
                <div key={`comment-${item.id || index}`} className="flex gap-3 items-start group">
                  
                  {/* Avatar */}
                  <div className="w-10 h-10 flex-shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm overflow-hidden">
                    {authorAvatar ? (
                      <img
                        src={authorAvatar}
                        alt={authorName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  
                  {/* Comment Body */}
                  <div className="flex-1">
                    {/* Header Row: Name + Date */}
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-gray-900">
                        {authorName}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatCommentDate(item.createdAt)}
                      </span>
                    </div>
                    
                    {/* Comment Bubble - No Border, Grey BG */}
                    <div className="text-sm text-gray-800 bg-gray-100 rounded-lg px-3 py-2 leading-relaxed w-fit">
                      {item.message?.split("\n").map((line: string, i: number) => (
                        <p key={i} className="min-h-[1.25rem]">{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </>
    );
  }
);