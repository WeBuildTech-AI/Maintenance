"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { type ToDoViewProps } from "../types";
import CopyPageU from "../../ui/copy-page-url-icon";
import { ToDoTabs } from "./ToDoTabs";
import { DiscardChangesModal } from "./DiscardChangesModal";
import { WorkOrderCard } from "./WorkOrderCard";
import { EmptyState } from "./EmptyState";
import { WorkOrderDetails } from "./WorkOrderDetails";
import { CommentsSection } from "./CommentsSection";
import { NewWorkOrderForm } from "../NewWorkOrderForm/NewWorkOrderFrom";
import { useNavigate } from "react-router-dom";
import { LinkedProcedurePreview } from "./LinkedProcedurePreview";
import { useDispatch } from "react-redux";
import { createWorkOrder } from "../../../store/workOrders/workOrders.thunks";
import toast from "react-hot-toast";

export type StatusKey = "open" | "on_hold" | "in_progress" | "done";

export function ToDoView({
  todoWorkOrders,
  doneWorkOrders,
  selectedWorkOrder,
  onSelectWorkOrder,
  creatingWorkOrder,
  onCancelCreate,
  onRefreshWorkOrders,
  onWorkOrderCreate,
  onWorkOrderUpdate,
  onOptimisticUpdate,
  pagination,
  onPageChange,
  hasError,
  loading,
}: ToDoViewProps & {
  creatingWorkOrder?: boolean;
  onCancelCreate?: () => void;
  onRefreshWorkOrders?: () => void;
  onWorkOrderCreate?: (wo: any) => void;
  onWorkOrderUpdate?: (wo: any) => void;
  onOptimisticUpdate?: (id: string, patch: any) => void;
  // ✅ Server-Side Pagination Props
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  onPageChange?: (page: number) => void;
  loading?: boolean;
}) {
  // ✅ Local Pagination State (Fallback)
  const [localPage, setLocalPage] = useState(1);

  // Use passed pagination or local
  const currentPage = pagination ? pagination.currentPage : localPage;
  const itemsPerPage = pagination ? pagination.itemsPerPage : 10;

  const [activeTab, setActiveTab] = useState<"todo" | "done">("todo");
  // ... existing state ...

  // [Skipping middle hooks code provided in view... assuming generic structure]

  // ...

  // Logic for activeList (filtered work orders) remains same
  // const activeList = ... 



  // ... (return JSX)
  // Need to find where pagination controls are rendered and update them to use `currentPage`, `totalCountDisplay`, `handleNextPage`, `handlePrevPage`.
  // Usually near closing `</div>` of the list column.

  // Assuming the render method matches previous `ToDoView.tsx` content which I need to see completely to invoke replace correctly on the footer.
  // I will just inject the props logic at top first.

  const [activeStatus, setActiveStatus] = useState<StatusKey>("open");
  const [comment, setComment] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null!);

  // ✅ WO-401 FIX: Ref specifically for CommentsSection
  const commentsRef = useRef<HTMLTextAreaElement>(null);

  // ✅ REAL-TIME LOG UPDATE STATE
  const [logRefreshTrigger, setLogRefreshTrigger] = useState(0);

  const [editingWorkOrder, setEditingWorkOrder] = useState<any | null>(null);

  // ✅ Discard Modal State
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [pendingWorkOrder, setPendingWorkOrder] = useState<any | null>(null);

  // ✅ Copy Work Order State
  const [workOrderToCopy, setWorkOrderToCopy] = useState<any | null>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch<any>();

  // ✅ Sort state
  const [sortType, setSortType] = useState("Creation Date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [unreadFirst, setUnreadFirst] = useState(false);

  // ✅ New state added for activePanel tracking
  const [activePanel, setActivePanel] = useState<"details" | "parts" | "time" | "cost">("details");

  // ✅ FIX: Reset panel to 'details' whenever the selected Work Order ID changes
  useEffect(() => {
    setActivePanel("details");
  }, [selectedWorkOrder?.id]);

  // ✅ PAGINATION STATE ADDED HERE (REMOVED DUPLICATES)


  // ✅ FIX: Synchronized URL extraction logic with WorkOrders.tsx
  const getWorkOrderIdFromUrl = () => {
    const segments = window.location.pathname.split("/").filter(Boolean);
    if (segments.length >= 2 && (segments[0].toLowerCase() === "work-orders" || segments[0].toLowerCase() === "work orders")) {
      const id = segments[1];
      if (id !== "create" && id !== "edit") return id;
    }
    return null;
  };

  const isEditRoute = window.location.pathname.includes("/edit");
  const isCreateRoute = window.location.pathname.includes("/create");
  const detailId = getWorkOrderIdFromUrl();
  const editingId = (isEditRoute || editingWorkOrder) ? (editingWorkOrder?.id || detailId) : null;
  const isEditMode = !!isEditRoute;

  // 📌 Sort change handler
  const handleSortChange = (
    type: string,
    order: "asc" | "desc",
    unreadFlag?: boolean
  ) => {
    setSortType(type);
    setSortOrder(order);
    if (unreadFlag !== undefined) setUnreadFirst(unreadFlag);
  };

  // 🧩 Core sorting logic
  const sortList = (list: any[]) => {
    const priorityRank: Record<string, number> = { high: 3, medium: 2, low: 1 };

    let sorted = [...list].sort((a, b) => {
      const createdA = new Date(a.createdAt || 0).getTime();
      const createdB = new Date(b.createdAt || 0).getTime();
      const updatedA = new Date(a.updatedAt || 0).getTime();
      const updatedB = new Date(b.updatedAt || 0).getTime();
      const dueA = new Date(a.dueDate || 0).getTime();
      const dueB = new Date(b.dueDate || 0).getTime();

      const nameA = (a.name || a.title || a.workOrderTitle || "").toString().toLowerCase();
      const nameB = (b.name || b.title || b.workOrderTitle || "").toString().toLowerCase();

      let valA: any = 0;
      let valB: any = 0;

      switch (sortType) {
        case "Creation Date": valA = createdA; valB = createdB; break;
        case "Last Updated": valA = updatedA; valB = updatedB; break;
        case "Due Date": valA = dueA; valB = dueB; break;
        case "Name":
          return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        case "Priority":
          valA = priorityRank[a.priority?.toLowerCase()] || 0;
          valB = priorityRank[b.priority?.toLowerCase()] || 0;
          break;
        default: valA = updatedA; valB = updatedB;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    if (unreadFirst) {
      sorted = sorted.sort((a, b) => {
        const aRead = a.isRead || false;
        const bRead = b.isRead || false;
        return aRead === bRead ? 0 : aRead ? 1 : -1;
      });
    }
    return sorted;
  };

  const lists = useMemo(
    () => ({
      todo: sortList(todoWorkOrders),
      done: sortList(doneWorkOrders),
    }),
    [todoWorkOrders, doneWorkOrders, sortType, sortOrder, unreadFirst]
  );

  const activeList = lists[activeTab];

  // ✅ PAGINATION LOGIC
  useEffect(() => {
    if (!pagination) setLocalPage(1);
  }, [activeTab, sortType, sortOrder, unreadFirst, pagination]);

  const totalItems = pagination ? pagination.totalItems : activeList.length;

  const startIndex = pagination
    ? (pagination.currentPage - 1) * pagination.itemsPerPage
    : (localPage - 1) * itemsPerPage;

  // For display "1-20" or "21-40", we use the theoretical page window
  // taking into account we might be at the end.
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // If server-side, activeList IS the current page data. If local, we slice.
  const currentItems = pagination ? activeList : activeList.slice((localPage - 1) * itemsPerPage, ((localPage - 1) * itemsPerPage) + itemsPerPage);

  const handlePrevPage = () => {
    if (pagination && onPageChange) {
      if (pagination.currentPage > 1) onPageChange(pagination.currentPage - 1);
    } else {
      if (localPage > 1) setLocalPage((p) => p - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination && onPageChange) {
      if (endIndex < totalItems) onPageChange(pagination.currentPage + 1);
    } else {
      if (endIndex < totalItems) setLocalPage((p) => p + 1);
    }
  };

  // --------------------------------------------------
  //  ASSIGNEE LOGIC
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
      ? name.split(" ").map((n) => n[0]).join("")
      : "U";

  // --------------------------------------------------
  //  Navigation + editing logic
  const handleEditWorkOrder = (wo: any) => {
    setEditingWorkOrder(wo);
    if (wo?.id) navigate(`/work-orders/${wo.id}/edit`);
  };

  // ✅ Track if we've already auto-selected from URL to prevent loops
  const hasAutoSelectedRef = useRef<string | null>(null);

  useEffect(() => {
    console.log("🔍 [ToDoView] detailId:", detailId, "hasAutoSelected:", hasAutoSelectedRef.current, "selectedWorkOrder:", selectedWorkOrder?.id);

    // Only auto-select if:
    // 1. There's a detailId in the URL
    // 2. We haven't already auto-selected this ID
    // 3. The work order isn't already selected
    if (detailId && detailId !== "create" && detailId !== "edit" && hasAutoSelectedRef.current !== detailId && !selectedWorkOrder) {
      const allOrders = [...todoWorkOrders, ...doneWorkOrders];
      const found = allOrders.find((wo) => String(wo.id) === String(detailId));
      if (found) {
        console.log("🔵 [ToDoView] Auto-selecting work order from URL:", detailId);
        onSelectWorkOrder(found);
        hasAutoSelectedRef.current = detailId; // Mark as selected
      } else {
        console.log("⚠️ [ToDoView] Work order not found for detailId:", detailId);
      }
    }
    // Reset the ref if detailId is cleared
    if (!detailId || detailId === "create" || detailId === "edit") {
      console.log("🟡 [ToDoView] Resetting hasAutoSelectedRef");
      hasAutoSelectedRef.current = null;
    }
  }, [detailId, selectedWorkOrder, todoWorkOrders, doneWorkOrders]);

  // 🛑 REMOVED: This was causing "Edit" mode to exit prematurely when selectedWorkOrder updated (e.g., real-time sync)
  // useEffect(() => {
  //   if (selectedWorkOrder && (editingWorkOrder || creatingWorkOrder)) {
  //     setEditingWorkOrder(null);
  //     onCancelCreate?.();
  //   }
  // }, [selectedWorkOrder]);

  const handleEditCancel = () => {
    setEditingWorkOrder(null);
    if (selectedWorkOrder?.id) navigate(`/work-orders/${selectedWorkOrder.id}`);
    else navigate("/work-orders");
  };

  const handleSelectWorkOrder = (item: any) => {
    // 🛑 If currently editing/creating AND switching to a different ID, intercept!
    if (editingWorkOrder || creatingWorkOrder) {
      // If clicking the SAME work order that is currently being edited, do nothing (or let it stay)
      // But if creating, any click is a switch.
      // If editing, check IDs.
      if (creatingWorkOrder || (editingWorkOrder && item?.id !== editingWorkOrder.id)) {
        setPendingWorkOrder(item);
        setShowDiscardModal(true);
        return;
      }
    }

    proceedWithSelection(item);
  };

  const proceedWithSelection = (item: any) => {
    onSelectWorkOrder(item);
    setEditingWorkOrder(null);
    onCancelCreate?.();
    setActivePanel("details");

    // reset auto-select ref to allow re-selection of same item if needed later
    if (hasAutoSelectedRef.current === item?.id) {
      hasAutoSelectedRef.current = null;
    }

    if (item?.id) {
      navigate(`/work-orders/${item.id}`);
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);
    if (pendingWorkOrder) {
      proceedWithSelection(pendingWorkOrder);
      setPendingWorkOrder(null);
    }
  };

  const handleCancelDiscard = () => {
    setShowDiscardModal(false);
    setPendingWorkOrder(null);
    // Stay on current edit screen
  };

  const handleScrollToComments = () => {
    if (commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      commentsRef.current.focus();
    }
  };

  const handleScrollToProcedure = () => {
    const procedureSection = document.getElementById("linked-procedure-section");
    if (procedureSection) {
      procedureSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ✅ AUTO-SELECT FIRST ITEM (Newest/Top of list)
  // MODIFIED: Only run if we have NO selection and are NOT creating/editing. 
  // IMPORTANT: Added dependency on 'activeList.length' ONLY to trigger on data load, 
  // but guarding against re-selecting if the user simply updated a work order.
  // ✅ AUTO-SELECT FIRST ITEM (ONLY AT ROOT PATH /work-orders)
  // If we are strictly at the root and nothing is selected, select the first one.
  // ✅ AUTO-SELECT FIRST ITEM (ONLY AT ROOT PATH /work-orders)
  // If we are strictly at the root and nothing is selected, select the first one.
  useEffect(() => {
    const segments = window.location.pathname.split("/").filter(Boolean);
    const isAtWorkOrdersRoot = segments.length === 1 && (segments[0].toLowerCase() === "work-orders" || segments[0].toLowerCase() === "work orders");

    if (isAtWorkOrdersRoot && activeList.length > 0 && !selectedWorkOrder && !creatingWorkOrder && !editingWorkOrder && !detailId) {
      console.log("🎯 [ToDoView] Auto-selecting first item at root:", activeList[0].id);
      handleSelectWorkOrder(activeList[0]);
    }
  }, [activeList.length, selectedWorkOrder?.id, creatingWorkOrder, editingWorkOrder, detailId]);

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
          currentSortType={sortType}
          currentSortOrder={sortOrder}
          onSortChange={(type, order) =>
            handleSortChange(type, order, unreadFirst)
          }
        />

        {/* LIST CONTAINER */}
        <div className="flex-1 overflow-auto relative z-0 bg-white">
          {loading && activeList.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="text-sm font-medium">Loading...</span>
              </div>
            </div>
          ) : activeList.length === 0 ? (
            <EmptyState
              message={hasError ? "Failed to load" : "No work orders"}
              subtext={hasError ? "There was an error fetching data. Please try again." : "Switch tabs or create a new work order."}
              buttonText={hasError ? "Retry" : "Create Work Order"}
              onButtonClick={hasError ? onRefreshWorkOrders : undefined}
            />
          ) : (
            <div className="space-y-2 p-4">
              {currentItems.map((wo) => (
                <WorkOrderCard
                  key={wo.id}
                  wo={wo}
                  selectedWorkOrder={selectedWorkOrder}
                  onSelectWorkOrder={handleSelectWorkOrder}
                  safeAssignee={safeAssignee}
                  getInitials={getInitials}
                  activeTab={activeTab}
                  onWorkOrderUpdate={onWorkOrderUpdate}
                  onRefresh={onRefreshWorkOrders}
                  onScrollToProcedure={handleScrollToProcedure}
                />
              ))}
            </div>
          )}
        </div>

        {/* PAGINATION UI */}
        {totalItems > 0 && (
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 12px", borderTop: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", border: "1px solid #fbbf24", borderRadius: "999px", padding: "4px 12px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>
              <span>{startIndex + 1} – {endIndex} of {totalItems}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <button onClick={handlePrevPage} disabled={currentPage === 1} style={{ background: "none", border: "none", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.3 : 1, display: "flex", alignItems: "center", padding: "2px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <button onClick={handleNextPage} disabled={endIndex >= totalItems} style={{ background: "none", border: "none", cursor: endIndex >= totalItems ? "not-allowed" : "pointer", opacity: endIndex >= totalItems ? 0.3 : 1, display: "flex", alignItems: "center", padding: "2px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-card mr-3 ml-2 mb-2 border border-border min-h-0 flex flex-col">

        {/* ✅ CASE 1: CREATE NEW WORK ORDER (Empty or Copy) */}
        {isCreateRoute || creatingWorkOrder ? (
          <NewWorkOrderForm
            // ✅ KEY PROP ADDED: Forces React to re-mount component freshly
            // If copying, use a different key to force refresh
            key={workOrderToCopy ? `copy-${workOrderToCopy.id || 'new'}` : "create-work-order-form"}
            onCreate={(newWo) => {
              // ✅ OPTIMISTIC
              if (newWo && onWorkOrderCreate) onWorkOrderCreate(newWo);

              setEditingWorkOrder(null);
              setWorkOrderToCopy(null); // Clear copy state
              // onRefreshWorkOrders?.();
            }}
            // ✅ Pass copied data if available
            existingWorkOrder={workOrderToCopy || null}
            editId={editingId}
            isEditMode={false}
            onCancel={() => {
              onCancelCreate?.();
              setWorkOrderToCopy(null);
            }}
          />
        )

          // ✅ CASE 2: EDIT WORK ORDER
          : editingWorkOrder || isEditMode ? (
            <NewWorkOrderForm
              // ✅ KEY PROP ADDED: Ensures edit form refreshes on ID change
              key={editingWorkOrder?.id || editingId || 'edit-form'}
              existingWorkOrder={editingWorkOrder}
              editId={editingId}
              isEditMode={isEditMode}
              onCreate={(updatedWo) => {
                // ✅ REAL-TIME UPDATE: Pass the payload up!
                if (updatedWo && onWorkOrderUpdate) onWorkOrderUpdate(updatedWo);

                // Select it so the Details panel updates immediately
                if (updatedWo) onSelectWorkOrder(updatedWo);

                setEditingWorkOrder(null);
                // onRefreshWorkOrders?.(); // Optional if we trust the optimistic update
              }}
              onCancel={handleEditCancel}
            />
          )

            // ✅ CASE 3: ERROR STATE
            : hasError ? (
              <div className="flex-1 flex flex-col h-full">
                <EmptyState
                  message="Failed to load"
                  subtext="There was an error fetching data. Please retry."
                  buttonText="Retry"
                  onButtonClick={onRefreshWorkOrders}
                />
              </div>
            )

              // ✅ CASE 4: VIEW DETAILS OR EMPTY
              : !selectedWorkOrder ? (
                detailId ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground p-8">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      <span className="text-sm font-medium">Loading details...</span>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    message="No work order selected"
                    subtext="Select a work order from the list to view its details."
                  />
                )
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
                    // ✅ Handle Copy
                    onCopy={async (wo: any) => {
                      if (!wo) return;
                      const loadingToast = toast.loading("Creating copy...");
                      try {
                        let recurrenceRule = wo.recurrenceRule;
                        if (typeof recurrenceRule === 'string') {
                          try { recurrenceRule = JSON.parse(recurrenceRule); } catch (e) { }
                        }

                        const payload: any = {
                          title: `Copy - ${wo.title}`,
                          status: "open",
                          description: wo.description,
                          priority: wo.priority,
                          workType: wo.workType,
                          estimatedTimeHours: wo.estimatedTimeHours,
                          startDate: null,
                          dueDate: null,

                          locationId: wo.location?.id || wo.locationId,
                          assetIds: wo.assets?.map((a: any) => a.id) || (wo.assetId ? [wo.assetId] : []),
                          assigneeIds: wo.assignees?.map((a: any) => a.id) || [],
                          assignedTeamIds: wo.teams?.map((t: any) => t.id) || [],
                          vendorIds: wo.vendors?.map((v: any) => v.id) || [],
                          categoryIds: wo.categories?.map((c: any) => c.id) || [],
                          procedureIds: wo.procedures?.map((p: any) => p.id) || [],
                          partIds: wo.parts?.map((p: any) => p.id) || wo.partUsages?.map((p: any) => p.part?.id || p.partId) || [],
                          recurrenceRule: recurrenceRule,
                        };

                        Object.keys(payload).forEach(key => (payload[key] === undefined || payload[key] === null) && delete payload[key]);

                        const newWo = await dispatch(createWorkOrder(payload)).unwrap();

                        toast.success("Work Order Copied!", { id: loadingToast });
                        if (onWorkOrderCreate) onWorkOrderCreate(newWo);
                        if (newWo?.id) onSelectWorkOrder(newWo);

                      } catch (err: any) {
                        console.error(err);
                        toast.error(err?.message || "Failed to copy work order", { id: loadingToast });
                      }
                    }}
                    onRefreshWorkOrders={onRefreshWorkOrders}
                    activePanel={activePanel}
                    setActivePanel={setActivePanel}
                    onScrollToComments={handleScrollToComments}
                    onScrollToProcedure={handleScrollToProcedure}
                    // ✅ Trigger the state update in parent
                    onStatusChangeSuccess={() => setLogRefreshTrigger((prev) => prev + 1)}
                    // ✅ OPTIMISTIC UPDATE
                    onWorkOrderUpdate={onWorkOrderUpdate}
                    onOptimisticUpdate={onOptimisticUpdate}
                  />

                  {/* ✅ Render sub-panels only when active */}
                  {activePanel === "details" && (
                    <>
                      <LinkedProcedurePreview selectedWorkOrder={selectedWorkOrder} />

                      <CommentsSection
                        ref={commentsRef}
                        comment={comment}
                        setComment={setComment}
                        attachment={attachment}
                        setAttachment={setAttachment}
                        fileRef={fileRef}
                        selectedWorkOrder={selectedWorkOrder}
                        // Pass the trigger to re-fetch logs
                        refreshTrigger={logRefreshTrigger}
                      />
                    </>
                  )}
                </div>
              )}
      </div>


      <DiscardChangesModal
        isOpen={showDiscardModal}
        onDiscard={handleConfirmDiscard}
        onKeepEditing={handleCancelDiscard}
      />
    </div>
  );
}