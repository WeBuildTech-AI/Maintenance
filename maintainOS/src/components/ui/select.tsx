"use client";

import * as React from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { createPortal } from "react-dom";

import { cn } from "./utils";

type Align = "start" | "center" | "end";
type Side = "top" | "right" | "bottom" | "left";

type SelectContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  value?: string;
  setValue: (value: string) => void;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
  registerItem: (value: string, label: React.ReactNode) => void;
  unregisterItem: (value: string) => void;
  getItemLabel: (value?: string) => React.ReactNode | undefined;
  disabled: boolean;
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext(component: string) {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error(`${component} must be used within <Select>.`);
  }
  return context;
}

function composeRefs<T>(
  ...refs: Array<React.Ref<T> | ((node: T | null) => void) | undefined>
) {
  return (node: T | null) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(node);
      } else {
        try {
          // @ts-expect-error: writable ref
          ref.current = node;
        } catch {
          /* noop */
        }
      }
    });
  };
}

function computePosition(
  triggerRect: DOMRect,
  contentRect: DOMRect,
  side: Side,
  align: Align,
  sideOffset: number,
) {
  let top = triggerRect.bottom + sideOffset;
  let left = triggerRect.left;

  switch (side) {
    case "top":
      top = triggerRect.top - contentRect.height - sideOffset;
      break;
    case "right":
      top = triggerRect.top;
      left = triggerRect.right + sideOffset;
      break;
    case "left":
      top = triggerRect.top;
      left = triggerRect.left - contentRect.width - sideOffset;
      break;
    default:
      top = triggerRect.bottom + sideOffset;
      break;
  }

  if (side === "top" || side === "bottom") {
    if (align === "center") {
      left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
    } else if (align === "end") {
      left = triggerRect.right - contentRect.width;
    }
  } else {
    if (align === "center") {
      top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
    } else if (align === "end") {
      top = triggerRect.bottom - contentRect.height;
    }
  }

  return {
    top: Math.max(8, top + window.scrollY),
    left: Math.max(8, left + window.scrollX),
  };
}

type SelectProps = {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
};

function Select({
  children,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
}: SelectProps) {
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;
  const [open, setOpenState] = React.useState(false);
  const [items, setItems] = React.useState<Map<string, React.ReactNode>>(
    () => new Map(),
  );

  const setOpen = React.useCallback((next: boolean) => {
    setOpenState(next);
  }, []);

  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const registerItem = React.useCallback(
    (itemValue: string, label: React.ReactNode) => {
      setItems((prev) => {
        const next = new Map(prev);
        next.set(itemValue, label);
        return next;
      });
    },
    [],
  );

  const unregisterItem = React.useCallback((itemValue: string) => {
    setItems((prev) => {
      if (!prev.has(itemValue)) return prev;
      const next = new Map(prev);
      next.delete(itemValue);
      return next;
    });
  }, []);

  const getItemLabel = React.useCallback(
    (itemValue?: string) => {
      if (!itemValue) return undefined;
      return items.get(itemValue);
    },
    [items],
  );

  const contextValue = React.useMemo<SelectContextValue>(
    () => ({
      open,
      setOpen,
      value: currentValue,
      setValue,
      triggerRef,
      registerItem,
      unregisterItem,
      getItemLabel,
      disabled,
    }),
    [
      open,
      setOpen,
      currentValue,
      setValue,
      registerItem,
      unregisterItem,
      getItemLabel,
      disabled,
    ],
  );

  return (
    <SelectContext.Provider value={contextValue}>
      {children}
    </SelectContext.Provider>
  );
}

type SelectTriggerProps = {
  size?: "sm" | "default";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, size = "default", disabled, onClick, ...props }, ref) => {
    const { open, setOpen, triggerRef, disabled: contextDisabled } =
      useSelectContext("SelectTrigger");
    const isDisabled = contextDisabled || disabled;
    const handleRef = composeRefs(ref, (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
    });

    return (
      <button
        ref={handleRef}
        type="button"
        data-slot="select-trigger"
        data-size={size}
        data-state={open ? "open" : "closed"}
        className={cn(
          "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className,
        )}
        disabled={isDisabled}
        onClick={(event) => {
          if (isDisabled) return;
          onClick?.(event);
          if (!event.defaultPrevented) {
            setOpen(!open);
          }
        }}
        {...props}
      >
        <span className="flex flex-1 items-center gap-2 overflow-hidden text-left">
          {children}
        </span>
        <ChevronDownIcon className="size-4 opacity-60" aria-hidden="true" />
      </button>
    );
  },
);

SelectTrigger.displayName = "SelectTrigger";

type SelectValueProps = {
  placeholder?: React.ReactNode;
} & React.HTMLAttributes<HTMLSpanElement>;

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder, className, ...props }, ref) => {
    const { value, getItemLabel } = useSelectContext("SelectValue");
    const label = getItemLabel(value);
    const isPlaceholder = label === undefined || label === null;

    return (
      <span
        ref={ref}
        data-slot="select-value"
        data-placeholder={isPlaceholder ? "true" : undefined}
        className={cn("flex-1 truncate", className)}
        {...props}
      >
        {label ?? placeholder ?? ""}
      </span>
    );
  },
);

SelectValue.displayName = "SelectValue";

type SelectContentProps = {
  align?: Align;
  side?: Side;
  sideOffset?: number;
} & React.HTMLAttributes<HTMLDivElement>;

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  (
    {
      className,
      align = "start",
      side = "bottom",
      sideOffset = 4,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const { open, setOpen, triggerRef } = useSelectContext("SelectContent");
    const contentRef = React.useRef<HTMLDivElement | null>(null);
    const mergedRef = composeRefs(ref, (node: HTMLDivElement | null) => {
      contentRef.current = node;
    });
    const [position, setPosition] = React.useState<{ top: number; left: number }>(
      { top: 0, left: 0 },
    );

    React.useLayoutEffect(() => {
      if (!open) return;
      const trigger = triggerRef.current;
      const content = contentRef.current;
      if (!trigger || !content) return;

      const updatePosition = () => {
        const triggerRect = trigger.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();
        setPosition(
          computePosition(triggerRect, contentRect, side, align, sideOffset),
        );
      };

      updatePosition();

      const observer = typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updatePosition)
        : null;
      observer?.observe(content);

      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);

      return () => {
        observer?.disconnect();
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }, [open, triggerRef, align, side, sideOffset]);

    React.useEffect(() => {
      if (!open) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setOpen(false);
        }
      };

      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target as Node | null;
        if (!target) return;
        if (
          contentRef.current?.contains(target) ||
          triggerRef.current?.contains(target)
        ) {
          return;
        }
        setOpen(false);
      };

      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("pointerdown", handlePointerDown, true);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("pointerdown", handlePointerDown, true);
      };
    }, [open, setOpen, triggerRef]);

    if (!open) {
      return null;
    }

    const content = (
      <div
        ref={mergedRef}
        role="listbox"
        data-slot="select-content"
        data-side={side}
        style={{
          position: "absolute",
          top: position.top,
          left: position.left,
          zIndex: 50,
          ...style,
        }}
        className={cn(
          "bg-popover text-popover-foreground min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md",
          className,
        )}
        {...props}
      >
        <div className="max-h-60 overflow-auto">{children}</div>
      </div>
    );

    return createPortal(content, document.body);
  },
);

SelectContent.displayName = "SelectContent";

type SelectItemProps = {
  value: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const SelectItem = React.forwardRef<HTMLButtonElement, SelectItemProps>(
  ({ value, className, children, onClick, ...props }, ref) => {
    const {
      value: selectedValue,
      setValue,
      setOpen,
      registerItem,
      unregisterItem,
    } = useSelectContext("SelectItem");
    const isSelected = selectedValue === value;

    React.useEffect(() => {
      registerItem(value, children);
      return () => unregisterItem(value);
    }, [value, children, registerItem, unregisterItem]);

    return (
      <button
        ref={ref}
        type="button"
        role="option"
        aria-selected={isSelected}
        data-slot="select-item"
        data-state={isSelected ? "selected" : "unchecked"}
        className={cn(
          "relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            setValue(value);
            setOpen(false);
          }
        }}
        {...props}
      >
        <span className="absolute right-2 flex size-3.5 items-center justify-center">
          {isSelected ? <CheckIcon className="size-4" /> : null}
        </span>
        <span className="flex items-center gap-2">{children}</span>
      </button>
    );
  },
);

SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
