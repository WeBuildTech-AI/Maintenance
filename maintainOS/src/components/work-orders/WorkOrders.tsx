"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate, useMatch, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { type FetchWorkOrdersParams } from "../../store/workOrders/workOrders.types";
import { fetchWorkOrders } from "../../store/workOrders/workOrders.thunks";
import { CalendarView } from "./CalendarView";
import { ListView } from "./ListView";
import NewWorkOrderModal from "./NewWorkOrderModal";
import type { ViewMode, WorkOrder } from "./types";
import { WorkloadView } from "./WorkloadView/WorkloadView";
import { WorkOrderHeaderComponent } from "./WorkOrderHeader";
import { ToDoView } from "./ToDoView/ToDoView";
import type { AppDispatch } from "../../store";
import { workOrderService } from "../../store/workOrders";
import WorkOrderDetailModal from "./Tableview/modals/WorkOrderDetailModal";

export function WorkOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(
    null
  );
  // const [viewMode, setViewMode] = useState<ViewMode>("todo");
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedMode = localStorage.getItem("workOrderViewMode");
    return (savedMode as ViewMode) || "todo";
  });
  const [workloadWeekOffset, setWorkloadWeekOffset] = useState(0);
  const [creatingWorkOrder, setCreatingWorkOrder] = useState(false);
  // const [showSettings, setShowSettings] = useState(false);
  const [, setShowSettings] = useState(false); // ✅ Unused state value
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  // ✅ 1. Refresh Key State
  const [refreshKey, setRefreshKey] = useState(0);

  const [filterParams, setFilterParams] = useState<FetchWorkOrdersParams>({
    page: 1,
    limit: 20,
  });

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewingWorkOrder, setViewingWorkOrder] = useState<WorkOrder | null>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  // Timer Guard Ref
  const activeTimers = useRef<Set<string>>(new Set());

  // Get prefill data from navigation state (from Assets offline prompt)
  const prefillData = (location.state as any)?.prefillData;

  const isCreateRoute = useMatch("/work-orders/create");
  // const editMatch = useMatch("/work-orders/:id/edit"); // Unused
  const viewMatch = useMatch("/work-orders/:id");

  // const isEditMode = !!editMatch; // Unused
  // const editingId = editMatch?.params?.id; // Unused
  const viewingId = viewMatch?.params?.id;

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // store the view mode in local storage

  useEffect(() => {
    if (viewMode === "list") {
      localStorage.setItem("workOrderViewMode", "list");
    } else if (viewMode === "calendar") {
      localStorage.setItem("workOrderViewMode", "calendar");
    } else if (viewMode === "workload") {
      // localStorage.setItem("workOrderViewMode", "workload");
    } else {
      localStorage.removeItem("workOrderViewMode");
    }
  }, [viewMode]);

  //  2. Main Fetch (Added refreshKey & Selected Work Order Update Logic)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const TIMER_LABEL = "WORK_ORDER_LIST_API";
      try {
        let result: any;
        const apiPayload = {
          ...filterParams,
          title: debouncedSearch || undefined,
        };

        // Guarded Timer Start
        if (!activeTimers.current.has(TIMER_LABEL)) {
          // Try to end it first just in case (e.g. strict mode fast remount)
          try { console.timeEnd(TIMER_LABEL); } catch (e) { }
          console.time(TIMER_LABEL);
          activeTimers.current.add(TIMER_LABEL);
        }

        if (showDeleted) {
          result = await workOrderService.fetchDeleteWorkOrder();
        } else {
          result = await dispatch(fetchWorkOrders(apiPayload)).unwrap();
        }

        if (Array.isArray(result)) {
          // @ts-ignore
          setWorkOrders(result);

          // 🔥 REAL-TIME UPDATE FIX:
          if (selectedWorkOrder) {
            const freshData = result.find(
              (w: any) => w.id === selectedWorkOrder.id
            );
            if (freshData) {
              // @ts-ignore
              setSelectedWorkOrder(freshData as WorkOrder);
            }
          }
        } else {
          setWorkOrders([]);
        }
      } catch (error) {
        console.error("❌ Error fetching work orders:", error);
        setWorkOrders([]);
      } finally {
        // Guarded Timer End
        if (activeTimers.current.has(TIMER_LABEL)) {
          try { console.timeEnd(TIMER_LABEL); } catch (e) { }
          activeTimers.current.delete(TIMER_LABEL);
        }
        setLoading(false);
      }
    };

    loadData();

    // Cleanup to ensure timer is cleared if unmounted
    return () => {
      // We can't easily access the local variable TIMER_LABEL here unless we define it outside 
      // or use the literal.
      if (activeTimers.current.has("WORK_ORDER_LIST_API")) {
        try { console.timeEnd("WORK_ORDER_LIST_API"); } catch (e) { }
        activeTimers.current.delete("WORK_ORDER_LIST_API");
      }
    };
  }, [dispatch, filterParams, debouncedSearch, refreshKey, showDeleted]);

  // Stable Callback for Filters & Pagination
  const handleFilterChange = useCallback(
    (newParams: Partial<FetchWorkOrdersParams>) => {
      setFilterParams((prevParams) => {
        const merged = { ...prevParams, ...newParams };
        if (JSON.stringify(prevParams) === JSON.stringify(merged)) {
          return prevParams;
        }
        return merged;
      });
    },
    []
  );

  // ✅ 3. Update Handle Refresh Function
  const handleRefreshWorkOrders = useCallback(() => {
    console.log("🔄 Refreshing Work Orders List...");
    setRefreshKey((prev) => prev + 1); // Trigger re-fetch
  }, []);

  // ✅ Fetch Work Order for Detail View when URL changes
  useEffect(() => {
    const fetchViewingWorkOrder = async () => {
      console.log("🔍 [WorkOrders] viewingId:", viewingId, "selectedWorkOrder:", selectedWorkOrder?.id);

      // ✅ FIX: Prevent "create" or "edit" from being treated as work order IDs
      if (viewingId && viewingId !== "create" && viewingId !== "edit") {

        // 1️⃣ CHECK EXISTING STATE (Single-Call Rule)
        // If we already have the full object in state, reuse it!
        if (selectedWorkOrder?.id === viewingId) {
          console.log("⚡ [Optimization] Reusing selectedWorkOrder from state:", viewingId);
          setViewingWorkOrder(selectedWorkOrder);
          return;
        }

        // 2️⃣ CHECK LIST DATA
        // If the item exists in the fetched list, use it first (optimistic load)
        const cachedItem = workOrders.find((w) => w.id === viewingId);
        if (cachedItem) {
          console.log("⚡ [Optimization] Reusing work order from list:", viewingId);
          setViewingWorkOrder(cachedItem);
          // Note: If list item is "summary", we might still want to fetch details. 
          // But per "Single-Call Rule", if list data is sufficient for initial view, we stop here.
          // If Comments/Logs are missing, components like CommentsSection should handle their own lazy fetching.
          return;
        }

        // 3️⃣ FETCH IF NOT FOUND
        console.time("WORK_ORDER_DETAIL_API");
        console.log("🔵 [WorkOrders] Fetching work order:", viewingId);
        try {
          const wo = await workOrderService.fetchWorkOrderById(viewingId);
          console.timeEnd("WORK_ORDER_DETAIL_API");
          console.log("✅ [WorkOrders] Fetched work order:", wo?.id);
          setViewingWorkOrder(wo as unknown as WorkOrder);
        } catch (err) {
          console.error("❌ [WorkOrders] Failed to fetch work order", err);
          navigate("/work-orders");
        }
      } else if (!viewingId || viewingId === "create" || viewingId === "edit") {
        console.log("🟡 [WorkOrders] Clearing viewingWorkOrder (viewingId:", viewingId, ")");
        setViewingWorkOrder(null);
      }
    };
    fetchViewingWorkOrder();
  }, [viewingId, selectedWorkOrder, workOrders]);

  // ✅ Handle create route - open modal for list/calendar, set flag for TODO
  useEffect(() => {
    if (isCreateRoute) {
      if (viewMode !== "todo") {
        setIsModalOpen(true);
      } else {
        setCreatingWorkOrder(true);
      }
    } else {
      if (viewMode !== "todo") {
        setIsModalOpen(false);
      }
    }
  }, [isCreateRoute, viewMode]);

  // ... (Assign/Edit/Create Handlers) ...
  // const handleCreateClick = () => {
  //   navigate("/work-orders/create");
  //   setCreatingWorkOrder(true);
  //   setIsModalOpen(false);
  // };
  const handleCancelCreate = () => {
    navigate("/work-orders");
    setCreatingWorkOrder(false);
    setIsModalOpen(false);
  };
  const handleSelectWorkOrder = (wo: WorkOrder) => {
    navigate(`/work-orders/${wo.id}`);
    setSelectedWorkOrder(wo);
    setCreatingWorkOrder(false);
  };

  const todoWorkOrders = useMemo(
    () =>
      workOrders.filter(
        (wo) => !["done", "completed"].includes(wo.status?.toLowerCase())
      ),
    [workOrders]
  );
  const doneWorkOrders = useMemo(
    () =>
      workOrders.filter((wo) =>
        ["done", "completed"].includes(wo.status?.toLowerCase())
      ),
    [workOrders]
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* ✅ Use as Component, not function call */}
      <WorkOrderHeaderComponent
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setIsCreatingForm={setCreatingWorkOrder}
        setShowSettings={setShowSettings}
        setIsModalOpen={setIsModalOpen}
        setIsSettingsModalOpen={setIsSettingsModalOpen}
        onFilterChange={handleFilterChange}
        setShowDeleted={setShowDeleted}
      />

      {loading && workOrders.length === 0 && (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Loading work orders...
        </div>
      )}

      {(!loading || workOrders.length > 0) && (
        <div className="flex-1 overflow-auto">
          {viewMode === "todo" && (
            <ToDoView
              todoWorkOrders={todoWorkOrders}
              doneWorkOrders={doneWorkOrders}
              selectedWorkOrder={selectedWorkOrder}
              onSelectWorkOrder={handleSelectWorkOrder}
              creatingWorkOrder={creatingWorkOrder}
              onCancelCreate={handleCancelCreate}
              onRefreshWorkOrders={handleRefreshWorkOrders}
              // ✅ PASSING PAGINATION PROPS
              // currentPage={filterParams.page || 1}
              // itemsPerPage={filterParams.limit || 20}
              // onParamsChange={handleFilterChange}

              // ✅ OPTIMISTIC UPDATES
              onWorkOrderCreate={(newWo) => {
                setWorkOrders((prev) => [newWo, ...prev]);
                setSelectedWorkOrder(newWo);
                setCreatingWorkOrder(false);
                navigate(`/work-orders/${newWo.id}`);
              }}
              onWorkOrderUpdate={(updatedWo) => {
                setWorkOrders((prev) => prev.map((wo) => wo.id === updatedWo.id ? updatedWo : wo));
                if (selectedWorkOrder?.id === updatedWo.id) {
                  setSelectedWorkOrder(updatedWo);
                }
              }}
              onOptimisticUpdate={(id: string, patch: any) => {
                setWorkOrders((prev) => prev.map((wo) => wo.id === id ? { ...wo, ...patch } : wo));
                if (selectedWorkOrder?.id === id) {
                  // @ts-ignore
                  setSelectedWorkOrder((prev) => (prev ? { ...prev, ...patch } : null));
                }
              }}
            />
          )}

          {viewMode === "list" && (
            <ListView
              // @ts-ignore
              workOrders={workOrders}
              onRefreshWorkOrders={handleRefreshWorkOrders}
              isSettingsModalOpen={isSettingsModalOpen}
              setIsSettingsModalOpen={setIsSettingsModalOpen}
              showDeleted={showDeleted}
              setShowDeleted={setShowDeleted}
            />
          )}

          {viewMode === "calendar" && <CalendarView workOrders={workOrders} />}

          {viewMode === "workload" && (
            <WorkloadView
              workOrders={workOrders}
              weekOffset={workloadWeekOffset}
              setWeekOffset={setWorkloadWeekOffset}
            />
          )}
        </div>
      )}

      <NewWorkOrderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          navigate("/work-orders");
        }}
        prefillData={prefillData}
      />

      {/* ✅ Work Order Detail Modal (for List/Calendar View ONLY - not ToDo) */}
      {viewingWorkOrder && viewMode !== "todo" && (
        <WorkOrderDetailModal
          open={!!viewingWorkOrder}
          onClose={() => {
            setViewingWorkOrder(null);
            navigate("/work-orders");
          }}
          workOrder={viewingWorkOrder}
          onRefreshWorkOrders={handleRefreshWorkOrders}
        />
      )}
    </div>
  );
}
