"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useMatch } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FetchWorkOrdersParams } from "../../store/workOrders/workOrders.types";
import { fetchWorkOrders } from "../../store/workOrders/workOrders.thunks";
import { CalendarView } from "./CalendarView";
import { ListView } from "./ListView";
import NewWorkOrderModal from "./NewWorkOrderModal";
import type { ViewMode, WorkOrder } from "./types";
import { WorkloadView } from "./WorkloadView/WorkloadView";
import { WorkOrderHeaderComponent } from "./WorkOrderHeader";
import { ToDoView } from "./ToDoView/ToDoView";
import type { AppDispatch } from "../../store";

export function WorkOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(
    null
  );
  const [viewMode, setViewMode] = useState<ViewMode>("todo");
  const [workloadWeekOffset, setWorkloadWeekOffset] = useState(0);
  const [creatingWorkOrder, setCreatingWorkOrder] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // ✅ 1. Refresh Key State
  const [refreshKey, setRefreshKey] = useState(0);

  const [filterParams, setFilterParams] = useState<FetchWorkOrdersParams>({
    page: 1,
    limit: 20,
  });

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

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

  // ✅ 2. Main Fetch (Added refreshKey & Selected Work Order Update Logic)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const apiPayload = {
          ...filterParams,
          title: debouncedSearch || undefined,
        };

        console.log("🔥 WorkOrders API Call:", apiPayload);

        const result = await dispatch(fetchWorkOrders(apiPayload)).unwrap();

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
  }, [dispatch, filterParams, debouncedSearch, refreshKey]);

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
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}