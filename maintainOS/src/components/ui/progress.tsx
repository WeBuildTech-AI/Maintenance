"use client";

import * as React from "react";

import { cn } from "./utils";

type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: number;
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    const clamped = Number.isFinite(value)
      ? Math.min(100, Math.max(0, value))
      : 0;

    return (
      <div
        ref={ref}
        data-slot="progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        className={cn(
          "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
          className,
        )}
        {...props}
      >
        <div
          data-slot="progress-indicator"
          className="bg-primary h-full transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
    );
  },
);

Progress.displayName = "Progress";

export { Progress };
