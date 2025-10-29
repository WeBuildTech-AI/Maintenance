"use client";

import { Activity, PauseCircle, Loader2, CheckCircle2 } from "lucide-react";

export const STATUSES = [
  { key: "open", label: "Open", Icon: Activity },
  { key: "on_hold", label: "On hold", Icon: PauseCircle },
  { key: "in_progress", label: "In Progress", Icon: Loader2 },
  { key: "done", label: "Done", Icon: CheckCircle2 },
];

export function StatusPanel({
  activeStatus,
  setActiveStatus,
}: {
  activeStatus: string;
  setActiveStatus: (key: string) => void;
}) {
  return (
    <div
      className="flex items-start justify-between gap-6 border rounded-lg p-4 bg-white sm:flex-row flex-col"
      role="group"
      aria-label="Status panel"
    >
      <div className="flex gap-4">
        {STATUSES.map(({ key, label, Icon }) => {
          const active = activeStatus === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveStatus(key)}
              aria-pressed={active}
              aria-label={`Set status to ${label}`}
              className={`h-16 w-20 rounded-lg border shadow-md inline-flex flex-col items-center justify-center gap-2 transition-all outline-none focus-visible:ring-[3px] focus-visible:border-ring ${
                active
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-orange-50 text-sidebar-foreground border-gray-200 hover:bg-orange-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs font-medium leading-none text-center px-2 truncate">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
