"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { type ToDoViewProps } from "../types";
import CopyPageU from "../../ui/copy-page-url-icon";
import { ToDoTabs } from "./ToDoTabs";
import { WorkOrderCard } from "./WorkOrderCard";
import { EmptyState } from "./EmptyState";
import { WorkOrderDetails } from "./WorkOrderDetails";
import { CommentsSection } from "./CommentsSection";
import { NewWorkOrderForm } from "../NewWorkOrderForm/NewWorkOrderFrom";
import { useNavigate, useMatch } from "react-router-dom";
import { LinkedProcedurePreview } from "./LinkedProcedurePreview"; // ✅ 1. IMPORTED NEW COMPONENT

export type StatusKey = "open" | "on_hold" | "in_progress" | "done";

export function ToDoView({
  todoWorkOrders,
  doneWorkOrders,
  selectedWorkOrder,
  onSelectWorkOrder,
  creatingWorkOrder,
  onCancelCreate,
  onRefreshWorkOrders,
}: ToDoViewProps & {
  creatingWorkOrder?: boolean;
  onCancelCreate?: () => void;
  onRefreshWorkOrders?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"todo" | "done">("todo");
  const [activeStatus, setActiveStatus] = useState<StatusKey>("open");
  const [comment, setComment] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  const [editingWorkOrder, setEditingWorkOrder] = useState<any | null>(null);
  const navigate = useNavigate();

  // ✅ Sort state
  const [sortType, setSortType] = useState("Last Updated");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [unreadFirst, setUnreadFirst] = useState(false);

  // ✅ New state added for activePanel tracking
  const [activePanel, setActivePanel] = useState<"details" | "parts" | "time" | "cost">("details");

  const isEditRoute = useMatch("/work-orders/:workOrderId/edit");
  const isCreateRoute = useMatch("/work-orders/create");
  const isDetailRoute = useMatch("/work-orders/:workOrderId");
  const editingId = isEditRoute?.params?.workOrderId;
  const detailId = isDetailRoute?.params?.workOrderId;
  const isEditMode = !!isEditRoute;

  // 📌 Sort change handler (from ToDoTabs)
  const handleSortChange = (
    type: string,
    order: "asc" | "desc",
    unreadFlag?: boolean
  ) => {
    setSortType(type);
    setSortOrder(order);
    if (unreadFlag !== undefined) setUnreadFirst(unreadFlag);
  };

  // 🧩 Core sorting logic — now supports Unread First
  const sortList = (list: any[]) => {
    const priorityRank: Record<string, number> = { high: 3, medium: 2, low: 1 };

    let sorted = [...list].sort((a, b) => {
      const createdA = new Date(a.createdAt || 0).getTime();
      const createdB = new Date(b.createdAt || 0).getTime();
      const updatedA = new Date(a.updatedAt || 0).getTime();
      const updatedB = new Date(b.updatedAt || 0).getTime();
      const dueA = new Date(a.dueDate || 0).getTime();
      const dueB = new Date(b.dueDate || 0).getTime();

      const nameA =
        (a.name || a.title || a.workOrderTitle || "").toString().toLowerCase();
      const nameB =
        (b.name || b.title || b.workOrderTitle || "").toString().toLowerCase();

      let valA: any = 0;
      let valB: any = 0;

      switch (sortType) {
        case "Creation Date":
          valA = createdA;
          valB = createdB;
          break;
        case "Last Updated":
          valA = updatedA;
          valB = updatedB;
          break;
        case "Due Date":
          valA = dueA;
          valB = dueB;
          break;
        case "Name":
          return sortOrder === "asc"
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        case "Priority":
          valA = priorityRank[a.priority?.toLowerCase()] || 0;
          valB = priorityRank[b.priority?.toLowerCase()] || 0;
          break;
        default:
          valA = updatedA;
          valB = updatedB;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    // ✅ Unread First toggle
    if (unreadFirst) {
      sorted = sorted.sort((a, b) => {
        const aRead = a.isRead || false;
        const bRead = b.isRead || false;
        return aRead === bRead ? 0 : aRead ? 1 : -1;
      });
    }

    return sorted;
  };

  // ✅ Re-sort when dependencies change
  const lists = useMemo(
    () => ({
      todo: sortList(todoWorkOrders),
      done: sortList(doneWorkOrders),
    }),
    [todoWorkOrders, doneWorkOrders, sortType, sortOrder, unreadFirst]
  );

  const activeList = lists[activeTab];

  // --------------------------------------------------
  // 🧠 ASSIGNEE LOGIC
  const safeAssignee = (wo: any) =>
    wo?.assignees?.[0] ||
    wo?.assignedTo ||
    { fullName: "Unassigned", name: "Unassigned", avatar: null };

  const selectedAssignee = useMemo(
    () => safeAssignee(selectedWorkOrder),
    [selectedWorkOrder]
  );

  const selectedAvatarUrl = useMemo(
    () =>
      selectedAssignee?.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        selectedAssignee?.fullName || selectedAssignee?.name || "U"
      )}`,
    [selectedAssignee]
  );

  const getInitials = (name: string | undefined | null): string =>
    typeof name === "string" && name.trim().length > 0
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
      : "U";

  // --------------------------------------------------
  // ✳️ Navigation + editing logic
  const handleEditWorkOrder = (wo: any) => {
    setEditingWorkOrder(wo);
    if (wo?.id) navigate(`/work-orders/${wo.id}/edit`);
  };

  useEffect(() => {
    if (detailId && !selectedWorkOrder) {
      const allOrders = [...todoWorkOrders, ...doneWorkOrders];
      const found = allOrders.find((wo) => String(wo.id) === String(detailId));
      if (found) onSelectWorkOrder(found);
    }
  }, [detailId, selectedWorkOrder, todoWorkOrders, doneWorkOrders]);

  useEffect(() => {
    if (selectedWorkOrder && (editingWorkOrder || creatingWorkOrder)) {
      setEditingWorkOrder(null);
      onCancelCreate?.();
    }
  }, [selectedWorkOrder]);

  const handleEditCancel = () => {
    setEditingWorkOrder(null);
    if (selectedWorkOrder?.id) navigate(`/work-orders/${selectedWorkOrder.id}`);
    else navigate("/work-orders");
  };

  const handleSelectWorkOrder = (item: any) => {
    onSelectWorkOrder(item);
    setEditingWorkOrder(null);
    onCancelCreate?.();
    if (item?.id) setTimeout(() => navigate(`/work-orders/${item.id}`), 0);
  };

  // --------------------------------------------------
  // 🧱 UI
  return (
    <div className="flex h-full">
      {/* Left Panel */}
      <div className="w-96 mr-2 ml-3 mb-2 border border-border flex flex-col min-h-0">
        <ToDoTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          todoCount={todoWorkOrders.length}
          doneCount={doneWorkOrders.length}
          onSortChange={(type, order) =>
            handleSortChange(type, order, unreadFirst)
          }
        />

        <div className="flex-1 overflow-auto relative z-0 bg-white">
          {activeList.length === 0 ? (
            <EmptyState
              message="No work orders"
              subtext="Switch tabs or create a new work order."
              buttonText="Create Work Order"
            />
          ) : (
            <div className="space-y-2 p-4">
              {activeList.map((wo) => (
                <WorkOrderCard
                  key={wo.id}
                  wo={wo}
                  selectedWorkOrder={selectedWorkOrder}
                  onSelectWorkOrder={handleSelectWorkOrder}
                  safeAssignee={safeAssignee}
                  getInitials={getInitials}
                  activeTab={activeTab}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-card mr-3 ml-2 mb-2 border border-border min-h-0 flex flex-col">
        {isCreateRoute ? (
          <NewWorkOrderForm
            onCreate={() => {
              onCancelCreate?.();
              setEditingWorkOrder(null);
              onRefreshWorkOrders?.();
            }}
            existingWorkOrder={selectedWorkOrder}
            editId={editingId}
            isEditMode={false}
          />
        ) : editingWorkOrder || isEditMode ? (
          <NewWorkOrderForm
            existingWorkOrder={editingWorkOrder}
            editId={editingId}
            isEditMode={isEditMode}
            onCreate={() => {
              setEditingWorkOrder(null);
              onCancelCreate?.();
              onRefreshWorkOrders?.();
            }}
            onCancel={handleEditCancel}
          />
        ) : !selectedWorkOrder ? (
          <EmptyState
            message="No work order selected"
            subtext="Select a work order from the list to view its details."
          />
        ) : (
          <div className="overflow-y-auto">
            <WorkOrderDetails
              selectedWorkOrder={selectedWorkOrder}
              selectedAvatarUrl={selectedAvatarUrl}
              selectedAssignee={selectedAssignee}
              getInitials={getInitials}
              activeStatus={activeStatus}
              setActiveStatus={setActiveStatus}
              CopyPageU={CopyPageU}
              onEdit={handleEditWorkOrder}
              onRefreshWorkOrders={onRefreshWorkOrders}
              /* new line added */
              activePanel={activePanel}
              setActivePanel={setActivePanel}
            />

            {/* ✅ 2. RENDER NEW COMPONENT (it will only show if a procedure exists) */}
            <LinkedProcedurePreview selectedWorkOrder={selectedWorkOrder} />

            {/* ✅ CommentsSection will show only when activePanel === "details" */}
            {activePanel === "details" && (
              <CommentsSection
                ref={ref}
                comment={comment}
                setComment={setComment}
                attachment={attachment}
                setAttachment={setAttachment}
                fileRef={fileRef}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}