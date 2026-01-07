"use client";

import * as React from "react";

interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        ref={ref}
        onClick={() => onCheckedChange && onCheckedChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          
          /* --- COLOR LOGIC --- */
          ${checked 
            ? "bg-orange-600 border-orange-600"  // ON: Orange fill, Orange border
            : "bg-gray-200 border-gray-200"      // OFF: Gray fill, Gray border
          }
          ${className}
        `}
        {...props}
      >
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-lg ring-0 
            transition duration-200 ease-in-out mt-0.5
            
            /* --- KNOB MOVEMENT & COLOR --- */
            ${checked 
              ? "translate-x-5 bg-white"        // ON: Move Right, White Knob
              : "translate-x-0.5 bg-white"      // OFF: Left, White Knob
            }
          `}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
