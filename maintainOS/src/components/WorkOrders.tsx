import { useMemo, useState } from "react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Calendar, ChevronDown, LayoutGrid, List, Plus, Search, Users } from "lucide-react";

import { CalendarView } from "./work-orders/CalendarView";
import { ListView } from "./work-orders/ListView";
import { ToDoView } from "./work-orders/ToDoView";
import { WorkloadView } from "./work-orders/WorkloadView";
import { WorkOrder } from "./work-orders/types";

const mockWorkOrders: WorkOrder[] = [
  {
    id: "WO-001",
    title: "Daily facility inspection",
    status: "Open",
    priority: "Daily",
    dueDate: "Today",
    assignedTo: {
      name: "Ashwini Chauhan",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face",
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
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
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
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
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
      avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=40&h=40&fit=crop&crop=face",
      team: "Safety",
    },
    asset: "Fire Pump",
    location: "Safety Control Room",
    isCompleted: false,
    wasDeleted: false,
  },
  {
    id: "WO-005",
    title: "Generator load test",
    status: "Scheduled",
    priority: "Medium",
    dueDate: "Next Monday",
    assignedTo: {
      name: "Priya Sharma",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=40&h=40&fit=crop&crop=face",
      team: "Utilities",
    },
    asset: "GEN-01",
    location: "Power House",
    isCompleted: false,
    wasDeleted: false,
  },
  {
    id: "WO-006",
    title: "Roof leak investigation",
    status: "In Progress",
    priority: "High",
    dueDate: "Friday",
    assignedTo: {
      name: "Liam O'Connor",
      avatar: "https://images.unsplash.com/photo-1544723795-3fb45c2035b9?w=40&h=40&fit=crop&crop=face",
      team: "Facilities",
    },
    asset: "Roof Section C",
    location: "Warehouse",
    isCompleted: false,
    wasDeleted: false,
  },
  {
    id: "WO-007",
    title: "Chiller diagnostics",
    status: "Open",
    priority: "High",
    dueDate: "This Week",
    assignedTo: {
      name: "Emily Chen",
      avatar: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=40&h=40&fit=crop&crop=face",
      team: "HVAC",
    },
    asset: "Chiller-03",
    location: "Mechanical Yard",
    isCompleted: false,
    wasDeleted: false,
  },
  {
    id: "WO-008",
    title: "Lighting audit",
    status: "Completed",
    priority: "Low",
    dueDate: "Last Week",
    assignedTo: {
      name: "Noah Williams",
      avatar: "https://images.unsplash.com/photo-1457449940276-e8deed18bfff?w=40&h=40&fit=crop&crop=face",
      team: "Facilities",
    },
    asset: "Lighting Circuit B",
    location: "Parking Deck",
    isCompleted: true,
    wasDeleted: false,
  },
  {
    id: "WO-009",
    title: "Network cabinet cleanup",
    status: "Scheduled",
    priority: "Medium",
    dueDate: "Next Wednesday",
    assignedTo: {
      name: "Grace Lee",
      avatar: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=40&h=40&fit=crop&crop=face",
      team: "IT Services",
    },
    asset: "Server Cabinet 4",
    location: "Data Center",
    isCompleted: false,
    wasDeleted: false,
  },
];

type ViewType = "todo" | "list" | "calendar" | "workload";

export function WorkOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder>(mockWorkOrders[0]);
  const [currentView, setCurrentView] = useState("todo" satisfies ViewType);
  const [workloadWeekOffset, setWorkloadWeekOffset] = useState(0);

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
    [filteredWorkOrders],
  );

  const doneWorkOrders = useMemo(
    () => filteredWorkOrders.filter((workOrder) => workOrder.isCompleted),
    [filteredWorkOrders],
  );

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-6 border-b border-border bg-card">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-2xl font-semibold flex-shrink-0">Work Orders</h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-shrink-0">
                {currentView === "todo" && (
                  <>
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    To-Do View
                  </>
                )}
                {currentView === "list" && (
                  <>
                    <List className="h-4 w-4 mr-2" />
                    List View
                  </>
                )}
                {currentView === "calendar" && (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendar View
                  </>
                )}
                {currentView === "workload" && (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Workload View
                  </>
                )}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setCurrentView("todo")}>
                <LayoutGrid className="h-4 w-4 mr-2" />
                To-Do View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrentView("list")}>
                <List className="h-4 w-4 mr-2" />
                List View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrentView("calendar")}>
                <Calendar className="h-4 w-4 mr-2" />
                Calendar View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrentView("workload")}>
                <Users className="h-4 w-4 mr-2" />
                Workload View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative flex-1 min-w-64 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search work orders..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10"
            />
          </div>

          <Button className="bg-primary hover:bg-primary/90 flex-shrink-0 ml-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Work Order
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {currentView === "todo" && (
          <ToDoView
            todoWorkOrders={todoWorkOrders}
            doneWorkOrders={doneWorkOrders}
            selectedWorkOrder={selectedWorkOrder}
            onSelectWorkOrder={setSelectedWorkOrder}
          />
        )}

        {currentView === "list" && <ListView workOrders={filteredWorkOrders} />}

        {currentView === "calendar" && <CalendarView workOrders={filteredWorkOrders} />}

        {currentView === "workload" && (
          <WorkloadView
            workOrders={filteredWorkOrders}
            weekOffset={workloadWeekOffset}
            setWeekOffset={setWorkloadWeekOffset}
          />
        )}
      </div>
    </div>
  );
}
