"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useMatch } from "react-router-dom";
import { useDispatch } from "react-redux"; // ✅ Added
import { workOrderService } from "../../store/workOrders/workOrders.service";
import { fetchWorkOrders } from "../../store/workOrders/workOrders.thunks"; // ✅ Added
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

  const navigate = useNavigate();
  const dispatch = useDispatch(); // ✅ Added

  // ✅ Router Hooks
  const isCreateRoute = useMatch("/work-orders/create");
  const editMatch = useMatch("/work-orders/:id/edit");
  const viewMatch = useMatch("/work-orders/:id");

  const isEditMode = !!editMatch;
  const editingId = editMatch?.params?.id;
  const viewingId = viewMatch?.params?.id;

  // ✅ Centralized Fetch (so we can re-use)
  const getWorkOrders = async () => {
    try {
      setLoading(true);
      const res = await workOrderService.fetchWorkOrders();
      console.log("✅ API Response:", res);
      setWorkOrders(res || []);
      if (res.length > 0 && !selectedWorkOrder) setSelectedWorkOrder(res[0]);
    } catch (error) {
      console.error("❌ Error fetching work orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial fetch
  useEffect(() => {
    getWorkOrders();
  }, []);

  // ✅ Select active work order based on route
  useEffect(() => {
    if (!workOrders.length) return;
    if (viewingId) {
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
      const location = wo.location?.name?.toLowerCase() || "";
      const asset = wo.assets?.[0]?.name?.toLowerCase() || "";
      const assignee = wo.assignees?.[0]?.fullName?.toLowerCase() || "";
      const vendor = wo.vendors?.map((v) => v.name?.toLowerCase()).join(" ") || "";

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
    () => filteredWorkOrders.filter((wo) => wo.status !== "completed"),
    [filteredWorkOrders]
  );

  const doneWorkOrders = useMemo(
    () => filteredWorkOrders.filter((wo) => wo.status === "completed"),
    [filteredWorkOrders]
  );

  // ✅ Navigation Handlers
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

  // ✅ Realtime refresh function for ToDoView
  const handleRefreshWorkOrders = async () => {
    await getWorkOrders(); // ✅ Re-fetch latest list
    dispatch(fetchWorkOrders()); // ✅ optional Redux sync
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
        setIsModalOpen
      )}

      {/* Loader */}
      {loading && (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Loading work orders...
        </div>
      )}

      {/* Main View Logic */}
      {!loading && (
        <div className="flex-1 overflow-hidden">
          {viewMode === "todo" && (
            <ToDoView
              todoWorkOrders={todoWorkOrders}
              doneWorkOrders={doneWorkOrders}
              selectedWorkOrder={selectedWorkOrder}
              onSelectWorkOrder={handleSelectWorkOrder}
              creatingWorkOrder={creatingWorkOrder}
              onCancelCreate={handleCancelCreate}
              onRefreshWorkOrders={handleRefreshWorkOrders} // ✅ connected
            />
          )}

          {viewMode === "list" && <ListView workOrders={filteredWorkOrders}  onRefreshWorkOrders={handleRefreshWorkOrders} />}

          {viewMode === "calendar" && (
            <CalendarView workOrders={filteredWorkOrders} />
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

      {/* New Work Order Modal */}
      <NewWorkOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
