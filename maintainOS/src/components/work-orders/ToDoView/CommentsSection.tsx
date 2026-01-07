"use client";

import { forwardRef, useEffect, useState, useMemo } from "react";
import { Paperclip, X, Loader2, Filter } from "lucide-react";
import { formatBytes } from "../../../utils/formatBytes";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  addWorkOrderComment,
  fetchWorkOrderComments,
  fetchWorkOrderLogs,
} from "../../../store/workOrders/workOrders.thunks";
import toast from "react-hot-toast";
import { User as UserIcon } from "lucide-react"; 

const formatCommentDate = (dateString?: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
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
  refreshTrigger?: number; 
}

export const CommentsSection = forwardRef<
  HTMLTextAreaElement,
  CommentsSectionProps
>(function CommentsSection(
  { comment, setComment, attachment, setAttachment, fileRef, selectedWorkOrder, refreshTrigger },
  ref
) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [localLogs, setLocalLogs] = useState<any[]>([]);
  const [localComments, setLocalComments] = useState<any[]>(selectedWorkOrder?.comments || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ FILTER STATE
  const [filter, setFilter] = useState<'all' | 'comments' | 'logs'>('all');

  // Sync prop changes
  useEffect(() => {
    if (selectedWorkOrder?.comments) {
        setLocalComments(selectedWorkOrder.comments);
    }
  }, [selectedWorkOrder]);

  // ✅ Fetch Data (Triggered by mount OR refreshTrigger)
  useEffect(() => {
    if (selectedWorkOrder?.id) {
      // Only show loader on initial load, not on background refresh
      if (!refreshTrigger || refreshTrigger === 0) setIsLoading(true);

      Promise.all([
        dispatch(fetchWorkOrderComments(selectedWorkOrder.id))
          .unwrap()
          .then((res) => setLocalComments(res)),

        dispatch(fetchWorkOrderLogs(selectedWorkOrder.id))
          .unwrap()
          .then((res) => {
            if (Array.isArray(res)) setLocalLogs(res);
          }),
      ])
        .catch((err) => console.error("Failed to fetch logs/comments:", err))
        .finally(() => setIsLoading(false));
    }
  }, [dispatch, selectedWorkOrder?.id, refreshTrigger]); // ✅ refreshTrigger ensures updates run

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

      await dispatch(
        addWorkOrderComment({
          id: selectedWorkOrder.id,
          message: comment,
        })
      ).unwrap();

      setComment("");
      setAttachment(null);
      toast.success("Comment added");
      
      // ✅ Switch to comments tab to see new message
      setFilter('comments');

      const updatedComments = await dispatch(fetchWorkOrderComments(selectedWorkOrder.id)).unwrap();
      setLocalComments(updatedComments);
      
    } catch (error: any) {
      toast.error(typeof error === "string" ? error : "Failed to send comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const timelineItems = useMemo(() => {
    const currentLogs = Array.isArray(localLogs) ? localLogs : [];
    
    let items = [
      ...localComments.map((c: any) => ({ ...c, type: "comment" })),
      ...currentLogs.map((l: any) => ({ ...l, type: "log" })),
    ];

    // ✅ Filter Logic
    if (filter === 'comments') {
      items = items.filter(i => i.type === 'comment');
    } else if (filter === 'logs') {
      items = items.filter(i => i.type === 'log');
    }

    return items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [localComments, localLogs, filter]);

  return (
    <>
      {/* INPUT SECTION */}
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
          {attachment ? (
            <div className="group flex items-center gap-3 rounded-md border border-gray-200 bg-white px-2 py-1">
              <div className="min-w-0">
                <div className="text-xs font-medium truncate max-w-[200px]">
                  {attachment.name}
                </div>
              </div>
              <button
                type="button"
                onClick={clearAttachment}
                className="ml-1 text-gray-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              onChange={onFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            <button
              onClick={handleSend}
              disabled={isSubmitting || !comment.trim()}
              className="inline-flex items-center gap-2 rounded bg-orange-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
            >
              {isSubmitting && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
              Send
            </button>
          </div>
        </div>
      </div>

      {/* ✅ FILTER TABS */}
      <div className="flex items-center gap-6 px-6 border-b border-gray-100 bg-white">
        {[
          { id: 'all', label: 'All Activity' },
          { id: 'comments', label: 'Comments' },
          { id: 'logs', label: 'Logs' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`py-3 text-xs font-medium border-b-2 transition-colors ${
              filter === tab.id 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TIMELINE */}
      <div className="space-y-6 p-6 bg-white">

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 items-start animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-300"></div>

                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-gray-300 rounded"></div>
                  <div className="h-3 w-48 bg-gray-200 rounded"></div>
                  <div className="h-3 w-36 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : timelineItems.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No activity found.
          </p>
        ) : (
          timelineItems.map((item: any, index: number) => {
            const author = item.author || currentUser || {};
            const authorName = author.fullName || "Unknown User";
            const authorAvatar = author.avatarUrl || null;
            const initials =
              authorName.charAt(0)?.toUpperCase() || "U";

            const isLog = item.type === "log";

            let messageText = "";
            if (isLog) {
              let msg = item.responseLog || "Activity logged";
              if (item.oldValue && item.newValue)
                msg += ` from "${item.oldValue}" to "${item.newValue}"`;
              else if (item.newValue) msg += ` to "${item.newValue}"`;
              else if (item.oldValue) msg += ` from "${item.oldValue}"`;
              messageText = msg;
            } else {
              messageText = item.message;
            }

            return (
              <div
                key={`${item.type}-${item.id || index}`}
                className="flex gap-3 items-start group"
              >
                {/* AVATAR */}
                <div
                  className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center 
                  text-white font-semibold text-sm shadow-sm overflow-hidden bg-blue-600"
                >
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

                {/* CONTENT */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {authorName}
                    </p>
                    <span className="text-xs text-gray-400">
                      {formatCommentDate(item.createdAt)}
                    </span>
                  </div>

                  <div
                    className={`text-sm leading-relaxed w-fit max-w-full break-words ${
                      isLog
                        ? "text-gray-700 italic px-1"
                        : "bg-[#FFFCF5]  shadow-[0_2px_8px_-3px_rgba(234,179,8,0.15)] rounded-lg hover:shadow-[0_4px_12px_-4px_rgba(234,179,8,0.2)] transition-shadow"
                    }`}
                  >
                    {messageText?.split("\n").map((line: string, i: number) => (
                      <p key={i} className="min-h-[1.25rem]">
                        {line}
                      </p>
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
});