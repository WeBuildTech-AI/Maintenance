"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
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

  // URL Pagination
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [filterParams, setFilterParams] = useState<FetchWorkOrdersParams>({
    limit: 20,
    // page is now derived from URL
  });

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [viewingWorkOrder, setViewingWorkOrder] = useState<WorkOrder | null>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  // Timer Guard Ref
  const activeTimers = useRef<Set<string>>(new Set());

  // Get prefill data from navigation state (from Assets offline prompt)
  const prefillData = (location.state as any)?.prefillData;

  // ✅ FIX: More robust route matching that handles weird URL encoding (like spaces vs hyphens)
  // Fallback: If useMatch fails, manually extract ID from pathname segments.
  const getWorkOrderIdFromUrl = () => {
    const segments = location.pathname.split("/").filter(Boolean);
    if (segments.length >= 2 && (segments[0].toLowerCase() === "work-orders" || segments[0].toLowerCase() === "work orders")) {
      const id = segments[1];
      if (id !== "create" && id !== "edit") return id;
    }
    return null;
  };

  const isCreateRoute = location.pathname.includes("/create");
  const viewingId = getWorkOrderIdFromUrl();

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
      setHasError(false);
      const TIMER_LABEL = "WORK_ORDER_LIST_API";
      try {
        let result: any;
        const apiPayload = {
          ...filterParams,
          page: currentPage, // ✅ Use URL page
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
          // Deleted endpoint might return array directly or object
          if (Array.isArray(result)) {
            setWorkOrders(result);
            setMeta(null);
          } else if (result?.data) {
            setWorkOrders(result.data);
            setMeta(result.meta);
          }
        } else {
          result = await dispatch(fetchWorkOrders(apiPayload)).unwrap();

          if (result && result.data) {
            // @ts-ignore
            setWorkOrders(result.data);
            setMeta(result.meta);

            // 🔥 REAL-TIME UPDATE FIX:
            if (selectedWorkOrder) {
              const freshData = result.data.find(
                (w: any) => w.id === selectedWorkOrder.id
              );
              if (freshData) {
                // @ts-ignore
                setSelectedWorkOrder((prev) => (prev ? { ...prev, ...freshData } : freshData));
              }
            }

          } else if (Array.isArray(result)) {
            // Fallback for old thunk/service behavior
            // @ts-ignore
            setWorkOrders(result);
            setMeta({ totalItems: result.length, totalPages: 1, currentPage: 1 });
          } else {
            setWorkOrders([]);
            setMeta(null);
          }
        }

      } catch (error) {
        console.error("❌ Error fetching work orders:", error);
        setWorkOrders([]);
        setHasError(true);
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
  }, [dispatch, filterParams, debouncedSearch, refreshKey, showDeleted, currentPage]);

  // ✅ SAFETY RE-FETCH: If list is empty but we are viewing an ID, force a refresh
  useEffect(() => {
    if (!loading && workOrders.length === 0 && viewingId && !isCreateRoute) {
      console.log("⚠️ [WorkOrders] List empty while viewing ID, triggering safety refresh...");
      setRefreshKey(prev => prev + 1);
    }
  }, [loading, workOrders.length, viewingId, isCreateRoute]);

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

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

  // ✅ 3. Update Handle Refresh Function (Atomic Reset)
  const handleRefreshWorkOrders = useCallback(async () => {
    console.log("🔄 [WorkOrders] Refreshing Work Orders & Resetting State...");

    // 1. Clear Selection & Detail State
    setSelectedWorkOrder(null);
    setViewingWorkOrder(null);
    setCreatingWorkOrder(false);

    // 2. Clear List to show loader (prevent flicker of old data)
    setWorkOrders([]);

    // 3. Navigate to root to trigger auto-select fresh
    navigate("/work-orders");

    // 4. Trigger re-fetch
    setRefreshKey((prev) => prev + 1);
  }, [navigate]);

  // ✅ Fetch Work Order for Detail View
  useEffect(() => {
    const fetchViewingWorkOrder = async () => {
      if (!viewingId) {
        if (!isCreateRoute) {
          setViewingWorkOrder(null);
          setSelectedWorkOrder(null);
        }
        return;
      }

      // 1️⃣ CHECK EXISTING STATE (Sync check)
      if (selectedWorkOrder && String(selectedWorkOrder.id) === String(viewingId)) {
        if (viewingWorkOrder?.id !== selectedWorkOrder.id) setViewingWorkOrder(selectedWorkOrder);
        return;
      }

      // 2️⃣ CHECK LIST DATA
      const cachedItem = workOrders.find((w) => String(w.id) === String(viewingId));
      if (cachedItem) {
        setViewingWorkOrder(cachedItem);
        setSelectedWorkOrder(cachedItem);
        return;
      }

      // 3️⃣ FETCH IF NOT FOUND
      try {
        const wo = await workOrderService.fetchWorkOrderById(viewingId);
        const typedWo = wo as unknown as WorkOrder;
        setViewingWorkOrder(typedWo);
        setSelectedWorkOrder(typedWo);
      } catch (err) {
        console.error("❌ Failed to fetch work order", err);
        navigate("/work-orders");
      }
    };
    fetchViewingWorkOrder();
  }, [viewingId, workOrders.length]); // ✅ Fixed dependency loop

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

  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    console.log("🔄 [WorkOrders] Switching View Mode to:", newMode);

    // 1. Atomically reset selection states to prevent flicker
    setSelectedWorkOrder(null);
    setViewingWorkOrder(null);
    setCreatingWorkOrder(false);

    // 2. Set the new mode
    setViewMode(newMode);

    // 3. Clear the URL to root to prevent the detail modal/panel from opening in the new view
    navigate("/work-orders");

    // 4. Force a clean refresh key
    setRefreshKey(prev => prev + 1);
  }, [navigate]);

  // ✅ Robust status check helper
  const isWorkOrderCompleted = (status: any) => {
    if (!status) return false;
    const s = String(status).toLowerCase().trim();
    return s === "done" || s === "completed";
  };

  const todoWorkOrders = useMemo(
    () => workOrders.filter((wo) => !isWorkOrderCompleted(wo.status)),
    [workOrders]
  );

  const doneWorkOrders = useMemo(
    () => workOrders.filter((wo) => isWorkOrderCompleted(wo.status)),
    [workOrders]
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* ✅ Use as Component, not function call */}
      <WorkOrderHeaderComponent
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
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
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
            <span className="text-sm font-medium text-muted-foreground animate-pulse">Work Orders Loading...</span>
          </div>
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
              hasError={hasError}
              loading={loading}
              // ✅ PASSING PAGINATION PROPS
              pagination={{
                currentPage: currentPage,
                totalPages: meta?.totalPages || 1,
                totalItems: meta?.totalItems || 0,
                itemsPerPage: Number(filterParams.limit) || 20
              }}
              onPageChange={handlePageChange}

              // ✅ OPTIMISTIC UPDATES
              onWorkOrderCreate={(newWo) => {
                setWorkOrders((prev) => [newWo, ...prev]);
                setSelectedWorkOrder(newWo);
                setCreatingWorkOrder(false);
                navigate(`/work-orders/${newWo.id}`);
              }}
              onWorkOrderUpdate={(updatedWo) => {
                setWorkOrders((prev) => prev.map((wo) => wo.id === updatedWo.id ? { ...wo, ...updatedWo } : wo));
                if (selectedWorkOrder?.id === updatedWo.id) {
                  // ✅ Merge update to preserve expanded relations (assets, parts, etc)
                  setSelectedWorkOrder((prev: any) => (prev ? { ...prev, ...updatedWo } : updatedWo));
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
              loading={loading}
              hasError={hasError}
            />
          )}

          {viewMode === "calendar" && (
            <CalendarView
              workOrders={workOrders}
              onRefreshWorkOrders={handleRefreshWorkOrders}
              loading={loading}
              hasError={hasError}
            />
          )}

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
