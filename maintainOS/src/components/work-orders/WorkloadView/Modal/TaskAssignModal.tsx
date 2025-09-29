import { useEffect, useMemo, useState } from "react";
import { X, User, Calendar, Clock, Lock } from "lucide-react";

interface TaskAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any | null;
  defaultAssignees: string[];
  onSave?: (updated: {
    title: string;
    assignees: string[];
    status: string;
    startDate?: string;
    startTime?: string;
    dueDate?: string;
    dueTime?: string;
  }) => void;
}

export default function TaskAssignModal({
  isOpen,
  onClose,
  task,
  defaultAssignees,
  onSave,
}: TaskAssignModalProps) {
  const [status, setStatus] = useState<"Open" | "Closed" | "On Hold">("Open");
  const [assignees, setAssignees] = useState<string[]>(defaultAssignees || []);
  const [assigneeInput, setAssigneeInput] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [dueTime, setDueTime] = useState<string>("");

  const startPlaceholder = useMemo(() => {
    if (task?.startDate) return undefined;
    return task?.startDay ? `Pick date (${task.startDay})` : undefined;
  }, [task]);

  const duePlaceholder = useMemo(() => {
    if (task?.dueDate) return undefined;
    return task?.endDay || task?.dueDay
      ? `Pick date (${task?.endDay || task?.dueDay})`
      : undefined;
  }, [task]);

  useEffect(() => {
    if (!task) return;

    // Prefill status
    if (task.status === "Closed" || task.status === "On Hold") {
      setStatus(task.status);
    } else {
      setStatus("Open");
    }

    // Merge assignees
    const merged = Array.from(
      new Set([...(task.assignees || []), ...(defaultAssignees || [])])
    );
    setAssignees(merged);

    // Prefill dates/times
    setStartDate(task.startDate || "");
    setStartTime(task.startTime || "");
    setDueDate(task.dueDate || "");
    setDueTime(task.dueTime || "");
  }, [task, defaultAssignees]);

  if (!isOpen || !task) return null;

  const removeAssignee = (name: string) =>
    setAssignees((prev) => prev.filter((a) => a !== name));

  const addAssignee = () => {
    const name = assigneeInput.trim();
    if (!name) return;
    setAssignees((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setAssigneeInput("");
  };

  const handleSave = () => {
    onSave?.({
      title: task.title,
      assignees,
      status,
      startDate: startDate || undefined,
      startTime: startTime || undefined,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
    });
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.3)",
        zIndex: 120,
      }}
    >
      <div
        style={{
          background: "#fff",
          width: "440px", // same compact size
          maxWidth: "95vw",
          borderRadius: "8px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          border: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div className="px-3 py-2 bg-gray-50 rounded-t-md flex justify-between items-center border-b">
          <h2 className="text-sm font-semibold text-gray-900 truncate">
            {task.title}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 text-sm text-gray-700 space-y-5 overflow-y-auto">
          {/* Status */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500">Status</label>
            <div className="flex items-center h-8 px-2 border rounded bg-white shadow-sm w-28 min-w-[7rem]">
              <Lock size={14} className="text-blue-500 mr-1" />
              <select
                className="w-full min-w-0 text-xs outline-none bg-transparent"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option>Open</option>
                <option>Closed</option>
                <option>On Hold</option>
              </select>
            </div>
          </div>

          {/* Assign To */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Assign to</label>
            <div className="border rounded px-2 py-2 bg-white shadow-sm">
              <div className="flex flex-wrap gap-2 mb-2">
                {assignees.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 px-2 h-7 rounded-full bg-blue-50 text-blue-700 text-xs border border-blue-200"
                  >
                    <User size={12} />
                    {a}
                    <button
                      className="ml-1 hover:text-blue-900"
                      onClick={() => removeAssignee(a)}
                      title="Remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border rounded px-2 h-8 bg-white shadow-sm flex-1">
                  <User size={14} className="text-gray-500 mr-2" />
                  <input
                    type="text"
                    placeholder="Type a name and press Add"
                    className="w-full text-sm outline-none bg-transparent"
                    value={assigneeInput}
                    onChange={(e) => setAssigneeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addAssignee();
                      }
                    }}
                  />
                </div>
                <button
                  onClick={addAssignee}
                  className="px-3 h-8 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Start Date & Time */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
            <div className="border rounded px-2 h-8 bg-white shadow-sm flex items-center mb-2">
              <Calendar size={14} className="text-gray-500 mr-2" />
              <input
                type="date"
                className="w-full text-sm outline-none bg-transparent"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder={startPlaceholder}
              />
            </div>
            <div className="border rounded px-2 h-8 bg-white shadow-sm flex items-center">
              <Clock size={14} className="text-gray-500 mr-2" />
              <input
                type="time"
                className="w-full text-sm outline-none bg-transparent"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>

          {/* Due Date & Time */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Due Date</label>
            <div className="border rounded px-2 h-8 bg-white shadow-sm flex items-center mb-2">
              <Calendar size={14} className="text-gray-500 mr-2" />
              <input
                type="date"
                className="w-full text-sm outline-none bg-transparent"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder={duePlaceholder}
              />
            </div>
            <div className="border rounded px-2 h-8 bg-white shadow-sm flex items-center">
              <Clock size={14} className="text-gray-500 mr-2" />
              <input
                type="time"
                className="w-full text-sm outline-none bg-transparent"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center border-t px-4 py-3 bg-gray-50 gap-3 rounded-b-md">
          <button
            onClick={onClose}
            className="text-sm text-blue-600 hover:underline"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded shadow hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
