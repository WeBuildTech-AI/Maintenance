"use client";

import * as React from "react";
import { Check } from "lucide-react";

// Shadcn/ui jaisa Checkbox component
// Yeh 'checked' aur 'onCheckedChange' props accept karega

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        ref={ref}
        className={`flex h-4 w-4 items-center justify-center rounded border border-gray-400 transition-colors
          ${
            checked
              ? "border-blue-600 bg-blue-600 text-white"
              : "bg-white text-white"
          }
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
          ${className}`}
        onClick={() => onCheckedChange && onCheckedChange(!checked)}
        {...props}
      >
        <Check
          size={16}
          strokeWidth={3}
          className={`transition-opacity ${checked ? "opacity-100" : "opacity-0"}`}
        />
      </button>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };