"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "./utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

const DEFAULT_COLORS = [
  "bg-amber-400",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-rose-500",
];

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getColorClass(name: string | undefined) {
  if (!name) {
    return DEFAULT_COLORS[0];
  }
  const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DEFAULT_COLORS[hash % DEFAULT_COLORS.length];
}

export type AvatarCheckboxProps = {
  name: string;
  imageSrc?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  avatarClassName?: string;
  checkboxAriaLabel?: string;
};

/**
 * Avatar that transitions to a checkbox when hovered or checked.
 */
export const AvatarCheckbox = React.forwardRef<HTMLInputElement, AvatarCheckboxProps>(
  (
    {
      name,
      imageSrc,
      checked,
      defaultChecked,
      onCheckedChange,
      className,
      avatarClassName,
      checkboxAriaLabel,
    },
    ref,
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(!!defaultChecked);
    const isControlled = typeof checked === "boolean";
    const isChecked = isControlled ? checked : internalChecked;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(event.target.checked);
      }
      onCheckedChange?.(event.target.checked);
    };

    const initials = React.useMemo(() => getInitials(name), [name]);
    const colorClass = React.useMemo(() => getColorClass(name), [name]);

    return (
      <label
        className={cn(
          "relative inline-flex size-12 cursor-pointer items-center justify-center",
          className,
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          aria-label={checkboxAriaLabel ?? `Select ${name}`}
          className="peer absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
          checked={isChecked}
          onChange={handleChange}
        />

        <Avatar
          className={cn(
            "size-full transition-opacity duration-200 peer-hover:opacity-0 peer-focus-visible:opacity-0 peer-checked:opacity-0",
            colorClass,
            avatarClassName,
          )}
        >
          {imageSrc ? (
            <AvatarImage src={imageSrc} alt={name} />
          ) : (
            <AvatarFallback className="bg-transparent text-base font-semibold text-white">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>

        <span
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 opacity-0 shadow-sm transition-all duration-200",
            "peer-hover:opacity-100 peer-focus-visible:opacity-100 peer-checked:opacity-100 peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-checked:text-white",
          )}
        >
          {isChecked ? (
            <Check className="h-5 w-5" strokeWidth={3} />
          ) : (
            <span className="block h-5 w-5 rounded-md border border-slate-300" />
          )}
        </span>
      </label>
    );
  },
);

AvatarCheckbox.displayName = "AvatarCheckbox";
