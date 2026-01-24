"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useMatch, useLocation, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FetchWorkOrdersParams } from "../../store/workOrders/workOrders.types";
import { fetchWorkOrders } from "../../store/workOrders/workOrders.thunks";
import { CalendarView } from "./CalendarView";
import { ListView } from "./ListView";
import NewWorkOrderModal from "./NewWorkOrderModal";
import type { ViewMode, WorkOrder } from "./types";
import { WorkloadView } from "./WorkloadView/WorkloadView";
import { UnifiedHeader } from "./UnifiedHeader"; // Updated Import
import { ToDoView } from "./ToDoView/ToDoView";
import type { AppDispatch } from "../../store";
import { workOrderService } from "../../store/workOrders";
import WorkOrderDetailModal from "./Tableview/modals/WorkOrderDetailModal";
import { addMonths, subMonths, addWeeks, subWeeks } from "date-fns"; // ✅ Added imports

export function WorkOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(
    null
  );
  // const [viewMode, setViewMode] = useState<ViewMode>("todo");
  /* Refactored to use URL Search Params */
  const [searchParams, setSearchParams] = useSearchParams();
  const queryViewMode = searchParams.get("view") as ViewMode | null;
  const viewMode: ViewMode = queryViewMode && ["todo", "list", "calendar", "workload"].includes(queryViewMode)
    ? queryViewMode
    : "todo";

  // ✅ Calendar State Lifted
  const [calendarDate, setCalendarDate] = useState(new Date());

  const handlePrevDate = useCallback(() => {
    setCalendarDate(prev => viewMode === 'workload' ? subWeeks(prev, 1) : subMonths(prev, 1));
  }, [viewMode]);

  const handleNextDate = useCallback(() => {
    setCalendarDate(prev => viewMode === 'workload' ? addWeeks(prev, 1) : addMonths(prev, 1));
  }, [viewMode]);

  // Sync 'todo' to URL if missing, or just handle default silently. 
  // Let's just use the derived value.
  const [workloadWeekOffset, setWorkloadWeekOffset] = useState(0);
  const [creatingWorkOrder, setCreatingWorkOrder] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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

  // Get prefill data from navigation state (from Assets offline prompt)
  const prefillData = (location.state as any)?.prefillData;

  const isCreateRoute = useMatch("/work-orders/create");
  const editMatch = useMatch("/work-orders/:id/edit");
  const viewMatch = useMatch("/work-orders/:id");

  const isEditMode = !!editMatch;
  const editingId = editMatch?.params?.id;
  const viewingId = viewMatch?.params?.id;

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // store the view mode in local storage

  // Persist view mode to localStorage when it changes (optional, but good for UX restoration if we want to redirect on load)
  useEffect(() => {
    if (viewMode) {
      localStorage.setItem("workOrderViewMode", viewMode);
    }
  }, [viewMode]);

  //  2. Main Fetch (Added refreshKey & Selected Work Order Update Logic)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let result: any;
        const apiPayload = {
          ...filterParams,
          title: debouncedSearch || undefined,
        };

        console.log("🔥 WorkOrders API Call:", apiPayload);

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
              setSelectedWorkOrder(freshData);
            }
          }
        } else {
          setWorkOrders([]);
        }
      } catch (error) {
        console.error("❌ Error fetching work orders:", error);
        setWorkOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
      if (viewingId && viewingId !== selectedWorkOrder?.id) {
        try {
          const wo = await workOrderService.fetchWorkOrderById(viewingId);
          setViewingWorkOrder(wo);
        } catch (err) {
          console.error("Failed to fetch work order", err);
          navigate("/work-orders");
        }
      } else if (!viewingId) {
        setViewingWorkOrder(null);
      }
    };
    fetchViewingWorkOrder();
  }, [viewingId]);

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
  const handleCreateClick = () => {
    navigate("/work-orders/create");
    setCreatingWorkOrder(true);
    setIsModalOpen(false);
  };
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
      {/* ✅ Use Unified Component */}
      <UnifiedHeader
        viewMode={viewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setIsCreatingForm={setCreatingWorkOrder}
        setShowSettings={setShowSettings}
        setIsModalOpen={setIsModalOpen}
        setIsSettingsModalOpen={setIsSettingsModalOpen}
        onFilterChange={handleFilterChange}
        setShowDeleted={setShowDeleted}
        // ✅ Passed Props
        currentDate={calendarDate}
        onPrevDate={handlePrevDate}
        onNextDate={handleNextDate}
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
              currentPage={filterParams.page || 1}
              itemsPerPage={filterParams.limit || 20}
              onParamsChange={handleFilterChange}
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

          {viewMode === "calendar" && (
            <CalendarView
              workOrders={workOrders}
              currentDate={calendarDate} // ✅ Prop
            // We typically use month view default for calendar string in URL
            // If sub-view needed, we can expand
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

      {/* ✅ Work Order Detail Modal (for List/Calendar View) */}
      {viewingWorkOrder && (
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
