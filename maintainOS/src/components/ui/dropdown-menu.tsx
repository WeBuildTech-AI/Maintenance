"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "./utils";
import { Slot } from "./slot";

type Align = "start" | "center" | "end";
type Side = "top" | "right" | "bottom" | "left";

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
};

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(
  null,
);

function useDropdownMenuContext(component: string) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error(`${component} must be used within <DropdownMenu>.`);
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
      left =
        triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
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

type DropdownMenuProps = {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function DropdownMenu({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
}: DropdownMenuProps) {
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = open !== undefined;
  const openState = isControlled ? Boolean(open) : uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const lastOpenRef = React.useRef(openState);
  React.useEffect(() => {
    if (lastOpenRef.current && !openState) {
      triggerRef.current?.focus({ preventScroll: true });
    }
    lastOpenRef.current = openState;
  }, [openState]);

  const contextValue = React.useMemo<DropdownMenuContextValue>(
    () => ({ open: openState, setOpen, triggerRef }),
    [openState, setOpen],
  );

  return (
    <DropdownMenuContext.Provider value={contextValue}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

type DropdownMenuTriggerProps = {
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ asChild = false, onClick, ...props }, ref) => {
  const { open, setOpen, triggerRef } = useDropdownMenuContext(
    "DropdownMenuTrigger",
  );
  const handleRef = composeRefs(ref, (node: HTMLButtonElement | null) => {
    triggerRef.current = node;
  });
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={handleRef as React.Ref<any>}
      data-slot="dropdown-menu-trigger"
      aria-haspopup="menu"
      aria-expanded={open}
      type={asChild ? undefined : "button"}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          setOpen(!open);
        }
      }}
      {...props}
    >
      {props.children}
    </Comp>
  );
});

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

type DropdownMenuContentProps = {
  align?: Align;
  side?: Side;
  sideOffset?: number;
} & React.HTMLAttributes<HTMLDivElement>;

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(
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
    const { open, setOpen, triggerRef } = useDropdownMenuContext(
      "DropdownMenuContent",
    );
    const contentRef = React.useRef<HTMLDivElement | null>(null);
    const mergedRef = composeRefs(ref, (node: HTMLDivElement | null) => {
      contentRef.current = node;
    });
    const [position, setPosition] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });

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
        role="menu"
        data-slot="dropdown-menu-content"
        data-side={side}
        style={{
          position: "absolute",
          top: position.top,
          left: position.left,
          zIndex: 1000,
          ...style,
        }}
        className={cn(
          "bg-popover text-popover-foreground min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );

    return createPortal(content, document.body);
  },
);

DropdownMenuContent.displayName = "DropdownMenuContent";

type DropdownMenuItemProps = {
  asChild?: boolean;
  inset?: boolean;
  variant?: "default" | "destructive";
  onSelect?: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  (
    { asChild = false, inset, variant = "default", className, onClick, onSelect, ...props },
    ref,
  ) => {
    const { setOpen } = useDropdownMenuContext("DropdownMenuItem");
    const Comp = (asChild ? Slot : "button") as any;

    return (
      <Comp
        ref={ref}
        role="menuitem"
        data-slot="dropdown-menu-item"
        data-inset={inset ? "true" : undefined}
        data-variant={variant}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            onSelect?.();
            setOpen(false);
          }
        }}
        className={cn(
          "relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 disabled:pointer-events-none disabled:opacity-50",
          inset && "pl-8",
          className,
        )}
        {...props}
      />
    );
  },
);

DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    data-slot="dropdown-menu-separator"
    className={cn("bg-border -mx-1 my-1 h-px", className)}
    {...props}
  />
));

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
