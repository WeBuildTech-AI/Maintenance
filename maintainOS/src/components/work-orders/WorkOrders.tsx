"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useMatch } from "react-router-dom";
import { useDispatch } from "react-redux";
import { workOrderService } from "../../store/workOrders/workOrders.service";
import { fetchWorkOrders } from "../../store/workOrders/workOrders.thunks";
import { CalendarView } from "./CalendarView";
import { ListView } from "./ListView";
import NewWorkOrderModal from "./NewWorkOrderModal";
import type { ViewMode, WorkOrder } from "./types";
import { WorkloadView } from "./WorkloadView/WorkloadView";
import { WorkOrderHeaderComponent } from "./WorkOrderHeader";
import { ToDoView } from "./ToDoView/ToDoView";

export function WorkOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("todo");
  const [workloadWeekOffset, setWorkloadWeekOffset] = useState(0);
  const [creatingWorkOrder, setCreatingWorkOrder] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ Router Hooks
  const isCreateRoute = useMatch("/work-orders/create");
  const editMatch = useMatch("/work-orders/:id/edit");
  const viewMatch = useMatch("/work-orders/:id");

  const isEditMode = !!editMatch;
  const editingId = editMatch?.params?.id;
  const viewingId = viewMatch?.params?.id;

  // ✅ OPTIMISTIC UPDATE HANDLER
  // Updates local state immediately so UI reflects changes instantly
  const handleOptimisticUpdate = (id: string, updates: Partial<WorkOrder>) => {
    setWorkOrders((prev) => 
      prev.map((wo) => (wo.id === id ? { ...wo, ...updates } : wo))
    );

    if (selectedWorkOrder && selectedWorkOrder.id === id) {
      setSelectedWorkOrder((prev: any) => ({ ...prev, ...updates }));
    }
  };

  // ✅ Centralized Fetch
  const getWorkOrders = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) setLoading(true);
      
      const res = await workOrderService.fetchWorkOrders();
      setWorkOrders(res || []);
      
      // Sync Selected Work Order with Fresh Data
      if (selectedWorkOrder) {
        const freshData = res.find((r: any) => r.id === selectedWorkOrder.id);
        if (freshData) {
            setSelectedWorkOrder(freshData);
        }
      } 
      else if (res.length > 0 && !selectedWorkOrder) {
        if (viewingId) {
            const match = res.find((r: any) => r.id === viewingId);
            if(match) setSelectedWorkOrder(match);
            else setSelectedWorkOrder(res[0]);
        } else {
            setSelectedWorkOrder(res[0]);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching work orders:", error);
    } finally {
      if (!isBackgroundRefresh) setLoading(false);
    }
  };

  // ✅ Initial fetch
  useEffect(() => {
    getWorkOrders();
  }, []);

  // ✅ Select active work order based on route changes
  useEffect(() => {
    if (!workOrders.length) return;
    if (viewingId && (!selectedWorkOrder || selectedWorkOrder.id !== viewingId)) {
      const found = workOrders.find((wo) => wo.id === viewingId);
      if (found) setSelectedWorkOrder(found);
    }
  }, [viewingId, workOrders]);

  // ✅ Filter based on search
  const filteredWorkOrders = useMemo(() => {
    if (!searchQuery.trim()) return workOrders;
    const query = searchQuery.toLowerCase();

    return workOrders.filter((wo) => {
      const title = wo.title?.toLowerCase() || "";
      const description = wo.description?.toLowerCase() || "";
      const location = (wo.location as any)?.name?.toLowerCase() || "";
      const asset = wo.assets?.[0]?.name?.toLowerCase() || "";
      const assignee = wo.assignees?.[0]?.fullName?.toLowerCase() || "";
      const vendor = wo.vendors?.map((v: any) => v.name?.toLowerCase()).join(" ") || "";

      return (
        title.includes(query) ||
        description.includes(query) ||
        location.includes(query) ||
        asset.includes(query) ||
        assignee.includes(query) ||
        vendor.includes(query)
      );
    });
  }, [searchQuery, workOrders]);

  const todoWorkOrders = useMemo(
    () =>
      filteredWorkOrders.filter((wo) => {
        const s = wo.status?.toLowerCase();
        return !s || s === "open" || s === "in_progress" || s === "on_hold";
      }),
    [filteredWorkOrders]
  );

  const doneWorkOrders = useMemo(
    () =>
      filteredWorkOrders.filter((wo) => {
        const s = wo.status?.toLowerCase();
        return s === "done" || s === "completed";
      }),
    [filteredWorkOrders]
  );

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

  const handleRefreshWorkOrders = async () => {
    await getWorkOrders(true);
    dispatch(fetchWorkOrders() as any);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {WorkOrderHeaderComponent(
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        handleCreateClick,
        setShowSettings,
        setIsModalOpen,
        setIsSettingsModalOpen,
      )}

      {loading && (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Loading work orders...
        </div>
      )}

      {!loading && (
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
              onOptimisticUpdate={handleOptimisticUpdate} // ✅ Passed Down
            />
          )}

          {viewMode === "list" && (
            <ListView 
              workOrders={filteredWorkOrders} 
              onRefreshWorkOrders={handleRefreshWorkOrders} 
              isSettingsModalOpen={isSettingsModalOpen}
              setIsSettingsModalOpen={setIsSettingsModalOpen}
            />
          )}

          {viewMode === "calendar" && (
            <CalendarView 
              workOrders={filteredWorkOrders} 
              onRefreshWorkOrders={handleRefreshWorkOrders}
            />
          )}

          {viewMode === "workload" && (
            <WorkloadView
              workOrders={filteredWorkOrders}
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