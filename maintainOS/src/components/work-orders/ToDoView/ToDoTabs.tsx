"use client";

import { useState, useRef, useEffect } from "react";

export function ToDoTabs({
  activeTab,
  setActiveTab,
  todoCount,
  doneCount,
}: {
  activeTab: "todo" | "done";
  setActiveTab: (tab: "todo" | "done") => void;
  todoCount: number;
  doneCount: number;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="border-b border-border p-2">
      <div className="flex items-center justify-between">
        <div className="flex rounded-full bg-muted/60 p-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab("todo")}
            className={`rounded-full px-4 py-2 transition ${
              activeTab === "todo"
                ? "bg-background shadow"
                : "text-muted-foreground"
            }`}
          >
            To Do ({todoCount})
          </button>
          <button
            onClick={() => setActiveTab("done")}
            className={`rounded-full px-4 py-2 transition ${
              activeTab === "done"
                ? "bg-background shadow"
                : "text-muted-foreground"
            }`}
          >
            Done ({doneCount})
          </button>
        </div>

        {/* Sort dropdown (Tailwind-only) */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-primary p-2 text-sm rounded hover:bg-muted/60"
          >
            Sort: Last Updated
          </button>
          {open && (
            <div className="absolute right-0 mt-1 w-64 rounded-md border bg-white shadow-lg z-10">
              <button className="w-full text-left text-sm px-3 py-2 hover:bg-muted">
                Last Updated: Most Recent First
              </button>
              <button className="w-full text-left text-sm px-3 py-2 hover:bg-muted">
                Priority: Highest First
              </button>
              <button className="w-full text-left text-sm px-3 py-2 hover:bg-muted">
                Due Date: Soonest First
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
