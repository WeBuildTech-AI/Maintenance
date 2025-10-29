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
import { useNavigate, useMatch } from "react-router-dom"; // ✅ Added

export type StatusKey = "open" | "on_hold" | "in_progress" | "done";

export function ToDoView({
  todoWorkOrders,
  doneWorkOrders,
  selectedWorkOrder,
  onSelectWorkOrder,
  creatingWorkOrder,
  onCancelCreate,
  onRefreshWorkOrders, // ✅ added
}: ToDoViewProps & {
  creatingWorkOrder?: boolean;
  onCancelCreate?: () => void;
  onRefreshWorkOrders?: () => void; // ✅ added
}) {
  const [activeTab, setActiveTab] = useState<"todo" | "done">("todo");
  const [activeStatus, setActiveStatus] = useState<StatusKey>("open");
  const [comment, setComment] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  const [editingWorkOrder, setEditingWorkOrder] = useState<any | null>(null);
  const navigate = useNavigate();

  // ✅ Detect routes
  const isEditRoute = useMatch("/work-orders/:workOrderId/edit");
  const isCreateRoute = useMatch("/work-orders/create");
  const isDetailRoute = useMatch("/work-orders/:workOrderId");
  const editingId = isEditRoute?.params?.workOrderId;
  const detailId = isDetailRoute?.params?.workOrderId;
  const isEditMode = !!isEditRoute;

  const lists = useMemo(
    () => ({
      todo: todoWorkOrders,
      done: doneWorkOrders,
    }),
    [todoWorkOrders, doneWorkOrders]
  );

  const activeList = lists[activeTab];

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

  const getInitials = (name: string | undefined | null): string => {
    if (typeof name === "string" && name.trim().length > 0) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("");
    }
    return "U";
  };

  // ✅ Navigate to edit mode
  const handleEditWorkOrder = (wo: any) => {
    setEditingWorkOrder(wo);
    if (wo?.id) {
      navigate(`/work-orders/${wo.id}/edit`);
    }
  };

  // ✅ Auto select work order from URL when loaded or refreshed
  useEffect(() => {
    if (detailId && !selectedWorkOrder) {
      const allOrders = [...todoWorkOrders, ...doneWorkOrders];
      const found = allOrders.find((wo) => String(wo.id) === String(detailId));
      if (found) {
        onSelectWorkOrder(found);
      }
    }
  }, [detailId, selectedWorkOrder, todoWorkOrders, doneWorkOrders]);

  // ✅ Auto close create/edit form when a work order is selected
  useEffect(() => {
    if (selectedWorkOrder && (editingWorkOrder || creatingWorkOrder)) {
      setEditingWorkOrder(null);
      onCancelCreate?.();
    }
  }, [selectedWorkOrder]);

  // ✅ Handle cancel in edit mode — restores details instead of create form
  const handleEditCancel = () => {
    setEditingWorkOrder(null);
    if (selectedWorkOrder?.id) {
      navigate(`/work-orders/${selectedWorkOrder.id}`);
    } else {
      navigate("/work-orders");
    }
  };

  // ✅ FIXED: ensures correct navigation even after leaving /create
  const handleSelectWorkOrder = (item: any) => {
    onSelectWorkOrder(item);
    setEditingWorkOrder(null);

    // close create/edit first
    onCancelCreate?.();

    // navigate after microtask (fix race)
    if (item?.id) {
      setTimeout(() => {
        navigate(`/work-orders/${item.id}`);
      }, 0);
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Panel */}
      <div className="w-96 mr-2 ml-3 mb-2 border border-border flex flex-col min-h-0">
        <ToDoTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          todoCount={todoWorkOrders.length}
          doneCount={doneWorkOrders.length}
        />

        <div className="flex-1 overflow-auto">
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
        {/* Handle Create / Edit / Details */}
        {isCreateRoute ? (
          <NewWorkOrderForm
            onCreate={() => {
              onCancelCreate?.();
              setEditingWorkOrder(null);
              onRefreshWorkOrders?.(); // ✅ refresh after create
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
              onRefreshWorkOrders?.(); // ✅ refresh after edit
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
            />
            <CommentsSection
              ref={ref}
              comment={comment}
              setComment={setComment}
              attachment={attachment}
              setAttachment={setAttachment}
              fileRef={fileRef}
            />
          </div>
        )}
      </div>
    </div>
  );
}
