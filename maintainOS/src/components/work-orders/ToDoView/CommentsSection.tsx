"use client";

import { forwardRef, useEffect, useState, useMemo } from "react";
import { Paperclip, X, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  addWorkOrderComment,
  fetchWorkOrderComments,
  fetchWorkOrderLogs,
} from "../../../store/workOrders/workOrders.thunks";
import toast from "react-hot-toast";

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

  // Fetch Data
  useEffect(() => {
    if (selectedWorkOrder?.id) {
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
        .finally(() => setIsLoading(false));
    }
  }, [dispatch, selectedWorkOrder?.id, refreshTrigger]);

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
      <div className="wo-modal-comments-container">
        <h3 className="wo-modal-comments-header">Add Comments</h3>

        <div className="wo-modal-comments-input-wrapper">
          <textarea
            ref={ref}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Typing..."
            rows={3}
            className="wo-modal-comments-textarea"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <div className="wo-modal-comments-toolbar">
            {attachment ? (
              <div className="group flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1">
                <span className="text-xs font-medium truncate max-w-[150px]">
                  {attachment.name}
                </span>
                <button
                  type="button"
                  onClick={clearAttachment}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}

            <input
              ref={fileRef}
              type="file"
              onChange={onFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="wo-modal-comments-attach-btn"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            <button
              onClick={handleSend}
              disabled={isSubmitting || !comment.trim()}
              className="wo-modal-comments-send-btn"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Send"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ FILTER TABS */}
      <div className="wo-modal-tabs-container">
        {[
          { id: 'all', label: 'All Activities' },
          { id: 'comments', label: 'Comments' },
          { id: 'logs', label: 'Logs' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`wo-modal-tab ${filter === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TIMELINE */}
      <div className="wo-modal-timeline-list">

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
                className="wo-modal-timeline-item"
              >
                <div className="wo-modal-timeline-header">
                  <span className="wo-modal-timeline-author">
                    {authorName}
                  </span>
                  <span className="wo-modal-timeline-date">
                    {formatCommentDate(item.createdAt)}
                  </span>
                </div>

                <div
                  className={
                    isLog
                      ? "wo-modal-timeline-message wo-modal-timeline-log-message"
                      : "wo-modal-timeline-message wo-modal-timeline-comment-bubble"
                  }
                >
                  {messageText?.split("\n").map((line: string, i: number) => (
                    <p key={i} className="min-h-[1.25rem]">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
});