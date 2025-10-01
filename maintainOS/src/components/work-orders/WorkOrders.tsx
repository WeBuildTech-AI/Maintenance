"use client";

import { useMemo, useState } from "react";
import { CalendarView } from "./CalendarView";
import { ListView } from "./ListView";
import { ToDoView } from "./ToDoView";
import type { WorkOrder } from "./types";
import type { ViewMode } from "./types";
import { WorkloadView } from "./WorkloadView/WorkloadView";
import { WorkOrderHeaderComponent } from "./WorkOrderHeader";
import NewWorkOrderModal from "./NewWorkOrderModal";

const mockWorkOrders: WorkOrder[] = [
  {
    id: "WO-001",
    title: "Daily facility inspection",
    status: "Open",
    priority: "Daily",
    dueDate: "Today",
    assignedTo: {
      name: "Ashwini Chauhan",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face",
      team: "Operations",
    },
    asset: "HVAC-02",
    location: "Administration Wing",
    isCompleted: false,
    wasDeleted: true,
    deletedDate: "19/09/2025, 13:16",
  },
  {
    id: "WO-002",
    title: "Pump maintenance",
    status: "In Progress",
    priority: "High",
    dueDate: "Tomorrow",
    assignedTo: {
      name: "John Smith",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      team: "Maintenance",
    },
    asset: "Pump A",
    location: "Building A",
    isCompleted: false,
    wasDeleted: false,
  },
  {
    id: "WO-003",
    title: "Filter replacement",
    status: "Completed",
    priority: "Medium",
    dueDate: "Yesterday",
    assignedTo: {
      name: "Sarah Wilson",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      team: "Maintenance",
    },
    asset: "Air Filter",
    location: "Building B",
    isCompleted: true,
    wasDeleted: false,
  },
  {
    id: "WO-004",
    title: "Fire suppression system test",
    status: "Open",
    priority: "High",
    dueDate: "In 2 days",
    assignedTo: {
      name: "Miguel Rodriguez",
      avatar:
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=40&h=40&fit=crop&crop=face",
      team: "Safety",
    },
    asset: "Fire Pump",
    location: "Safety Control Room",
    isCompleted: false,
    wasDeleted: false,
  },
];

export function WorkOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder>(
    mockWorkOrders[0]
  );
  const [viewMode, setViewMode] = useState<ViewMode>("todo");
  const [workloadWeekOffset, setWorkloadWeekOffset] = useState(0);
  const [creatingWorkOrder, setCreatingWorkOrder] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log(showSettings, "showSettings")

  const filteredWorkOrders = useMemo(() => {
    if (searchQuery.trim() === "") {
      return mockWorkOrders;
    }
    const query = searchQuery.toLowerCase();
    return mockWorkOrders.filter((workOrder) => {
      return (
        workOrder.title.toLowerCase().includes(query) ||
        workOrder.id.toLowerCase().includes(query) ||
        workOrder.assignedTo.name.toLowerCase().includes(query) ||
        workOrder.asset.toLowerCase().includes(query) ||
        workOrder.location.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  const todoWorkOrders = useMemo(
    () => filteredWorkOrders.filter((workOrder) => !workOrder.isCompleted),
    [filteredWorkOrders]
  );

  const doneWorkOrders = useMemo(
    () => filteredWorkOrders.filter((workOrder) => workOrder.isCompleted),
    [filteredWorkOrders]
  );

  return (
    <div className="flex flex-col h-full bg-background">

      {WorkOrderHeaderComponent(
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        setCreatingWorkOrder,
        setShowSettings,
        setIsModalOpen // ⬅️ pass modal opener
      )}

      {/* Views */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "todo" && (
          <ToDoView
            todoWorkOrders={todoWorkOrders}
            doneWorkOrders={doneWorkOrders}
            selectedWorkOrder={selectedWorkOrder}
            onSelectWorkOrder={setSelectedWorkOrder}
            creatingWorkOrder={creatingWorkOrder}
            onCancelCreate={() => setCreatingWorkOrder(false)}
          />
        )}
        {viewMode === "list" && <ListView workOrders={filteredWorkOrders} />}
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

      {/* Modal */}
      <NewWorkOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
