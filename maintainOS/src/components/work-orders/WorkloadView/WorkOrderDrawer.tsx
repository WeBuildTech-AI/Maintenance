import {
  ArrowRightToLine,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Expand,
  Filter,
  Lock,
  Search,
  User
} from "lucide-react";
import { useMemo, useState } from "react";

interface WorkOrderStatusDrawerProps {
  open: boolean;
  onClose: () => void;
  status: string | null;
}

export function WorkOrderStatusDrawer({
  open,
  onClose,
}: WorkOrderStatusDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  const tasks = [
    {
      title: "Wrapper",
      status: "Open",
      dueDate: "06/18/2024, 12:00 PM",
      estTime: 2,
      assigned: "Ashwini",
      location: "General",
      asset: "HVAC-10 Ton",
      priority: "High",
    },
    {
      title: "Hydraulic Press",
      status: "Open",
      dueDate: "06/21/2024, 12:00 PM",
      estTime: 3,
      assigned: "John",
      location: "General",
      asset: "HVAC-25 Ton",
      priority: "Low",
    },
    { title: "Water Jet Cutter", status: "Open", estTime: 1, priority: "High" },
    { title: "Surface Grinder", status: "Open", estTime: 1, priority: "High" },
  ];

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    return tasks.filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, tasks]);

  if (!open) return null;

  return (
    <>
      {/* Main Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: "300px",
          backgroundColor: "#ffffff",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          borderLeft: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          zIndex: 100,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <ArrowRightToLine size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          <p className="text-xs text-gray-500 mb-4">
            Drag and drop Work Orders into the Workload view to schedule them.
          </p>

          {/* Search + Filters */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 pl-8 pr-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-1 px-2 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50">
              <Filter size={14} className="text-gray-500" />
              Filters
            </button>
          </div>

          {/* Dropdown */}
          <button className="w-full flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 mb-3">
            Due within the next 15 days
            <span className="text-gray-500">▼</span>
          </button>

          {/* Task List */}
          <div className="space-y-2 relative">
            {filteredTasks.map((task, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={(e) =>
                  e.dataTransfer.setData("application/json", JSON.stringify(task))
                }
                className="flex items-center justify-between rounded-md border px-3 py-2 text-xs bg-white hover:bg-gray-50 cursor-move relative"
                onMouseEnter={() => setHoveredTask(task.title)}
                onMouseLeave={() => setHoveredTask(null)}
                onClick={() => setSelectedTask(task)}
              >
                <span className="truncate text-gray-700">
                  [Repair] {task.title}
                </span>
                <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
                  ● {task.priority}
                </span>

                {/* Hover Preview Card */}
                {hoveredTask === task.title && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      marginTop: "6px",
                      width: "100%",
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      padding: "12px",
                      fontSize: "12px",
                      zIndex: 50,
                    }}
                  >
                    <div className="flex items-center font-semibold text-gray-800 mb-2 gap-2">
                      <Lock size={14} className="text-gray-500" />
                      {task.title}
                    </div>
                    <div className="flex flex-col gap-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="flex items-center gap-1">
                          <Lock size={12} className="text-blue-500" /> {task.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Due:</span>
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <Calendar size={12} className="text-gray-500" /> {task.dueDate}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Est. Time:</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-gray-500" /> {task.estTime}h
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t bg-white text-xs text-gray-500">
          <span>
            {filteredTasks.length > 0
              ? `1–${filteredTasks.length} of ${tasks.length}`
              : "0 results"}
          </span>
          <div className="flex items-center gap-2">
            <button className="p-1 rounded hover:bg-gray-100">
              <ChevronLeft size={16} className="text-gray-600" />
            </button>
            <button className="p-1 rounded hover:bg-gray-100">
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Drawer (click on task) */}
      {selectedTask && (
        <div
          style={{
            position: "fixed",
            top: "70px",
            right: "300px",
            bottom: "0",
            width: "280px",
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px 0 0 0",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            zIndex: 110,
          }}
        >
          {/* Header */}
          <div className="px-3 py-2 bg-gray-50 rounded-t-md flex justify-between items-center">
            <h2 className="text-xs font-semibold text-gray-900 truncate">
              {selectedTask.title}
            </h2>
            <button
              onClick={() => setSelectedTask(null)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Expand size={16} className="text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 text-sm text-gray-700 space-y-5 overflow-hidden">
            {/* Status */}
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-500">Status</label>

              {/* Right-aligned, small width dropdown */}
              <div className="flex items-center h-8 px-2 border rounded bg-white shadow-sm w-28 min-w-[7rem]">
                <Lock size={14} className="text-blue-500 mr-1" />
                <select className="w-full min-w-0 text-xs outline-none bg-transparent">
                  <option>Open</option>
                  <option>Closed</option>
                  <option>On Hold</option>
                </select>
              </div>
            </div>


            {/* Assign To */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Assign to</label>
              <div className="border rounded px-2 h-8 bg-white shadow-sm flex items-center">
                <User size={14} className="text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Start typing..."
                  className="w-full text-sm outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
              <div className="border rounded px-2 h-8 bg-white shadow-sm flex items-center mb-2">
                <Calendar size={14} className="text-gray-500 mr-2" />
                <input type="date" className="w-full text-sm outline-none bg-transparent" />
              </div>
              <div className="border rounded px-2 h-8 bg-white shadow-sm flex items-center">
                <Clock size={14} className="text-gray-500 mr-2" />
                <input type="time" className="w-full text-sm outline-none bg-transparent" />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Due Date</label>
              <div className="border rounded px-2 h-8 bg-white shadow-sm flex items-center mb-2">
                <Calendar size={14} className="text-gray-500 mr-2" />
                <input type="date" className="w-full text-sm outline-none bg-transparent" />
              </div>
              <div className="border rounded px-2 h-8 bg-white shadow-sm flex items-center">
                <Clock size={14} className="text-gray-500 mr-2" />
                <input type="time" className="w-full text-sm outline-none bg-transparent" />
              </div>
            </div>

            {/* Estimated Time */}
            <div className="mt-2">
              <label className="block text-xs text-gray-600 mb-1">
                Estimated Time
              </label>
              <p className="text-xs text-gray-500 flex gap-1 mb-1 leading-snug">
                <span className="text-blue-500">✦</span>
                We estimate that this Work Order will take 5h 5m to complete.
              </p>
              <button className="text-xs text-blue-600 hover:underline mb-2">
                Use Smart Time Estimates
              </button>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  defaultValue={3}
                  className="w-16 h-7 border rounded px-2 text-sm outline-none text-center shadow-sm"
                />
                <span className="text-sm text-gray-600">H</span>
                <input
                  type="number"
                  defaultValue={0}
                  className="w-16 h-7 border rounded px-2 text-sm outline-none text-center shadow-sm"
                />
                <span className="text-sm text-gray-600">M</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end items-center border-t px-4 py-3 bg-gray-50 gap-3">
            <button className="text-sm text-blue-600 hover:underline">
              Cancel
            </button>
            <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded shadow hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </div>
      )}
    </>
  );
}
