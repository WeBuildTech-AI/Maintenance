"use client";

import { useRef, useState } from "react";
import { LuClipboardCheck } from "react-icons/lu";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SortModal } from "../../utils/SortModal";

export function ToDoTabs({
  activeTab,
  setActiveTab,
  todoCount,
  doneCount,
  onSortChange,
}: {
  activeTab: "todo" | "done";
  setActiveTab: (tab: "todo" | "done") => void;
  todoCount: number;
  doneCount: number;
  onSortChange: (sortType: string, sortOrder: "asc" | "desc", unreadFlag?: boolean) => void;
}) {
  const [sortType, setSortType] = useState("Last Updated");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [unreadFirst, setUnreadFirst] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleSortChange = (type: string, order: "asc" | "desc") => {
    setSortType(type);
    setSortOrder(order);
    setIsModalOpen(false);
    onSortChange(type, order, unreadFirst);
  };

  const handleToggleUnread = () => {
    const newVal = !unreadFirst;
    setUnreadFirst(newVal);
    onSortChange(sortType, sortOrder, newVal);
  };

  return (
    <div className="border-b border-gray-200">
      {/* Tabs Header */}
      <div className="flex">
        <button
          className={`flex-1 text-center py-2 font-medium ${
            activeTab === "todo"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-700"
          }`}
          onClick={() => setActiveTab("todo")}
        >
          To Do ({todoCount})
        </button>
        <button
          className={`flex-1 text-center py-2 font-medium ${
            activeTab === "done"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-700"
          }`}
          onClick={() => setActiveTab("done")}
        >
          Done ({doneCount})
        </button>
      </div>

      {/* Sort Bar */}
      <div className="flex justify-between items-center px-4 py-2 text-sm border-t border-gray-200 relative z-[10]">
        <div className="flex items-center gap-1">
          <span>Sort By:</span>
          <div ref={buttonRef} className="flex items-center">
            <button
              onClick={() => setIsModalOpen((p) => !p)}
              className="flex items-center gap-1 text-blue-600 font-medium"
            >
              {sortType} : {sortOrder === "asc" ? "Ascending" : "Descending"}
              {isModalOpen ? (
                <ChevronUp className="w-4 h-4 text-blue-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-blue-600" />
              )}
            </button>
          </div>
        </div>
        <LuClipboardCheck size={18} className="text-gray-600" />
      </div>

      {/* Modal */}
      <SortModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSortChange={handleSortChange}
        currentSort={sortType}
        currentOrder={sortOrder}
        unreadFirst={unreadFirst}
        onToggleUnread={handleToggleUnread}
        anchorRef={buttonRef}
      />
    </div>
  );
}
