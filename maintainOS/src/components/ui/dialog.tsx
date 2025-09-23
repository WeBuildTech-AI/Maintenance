"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { XIcon } from "lucide-react";

import { cn } from "./utils";
import { Slot } from "./slot";

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext(component: string) {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error(`${component} must be used within <Dialog>.`);
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

type DialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

function Dialog({ open, defaultOpen = false, onOpenChange, children }: DialogProps) {
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

  const contextValue = React.useMemo<DialogContextValue>(
    () => ({ open: openState, setOpen, triggerRef }),
    [openState, setOpen],
  );

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  );
}

type DialogTriggerProps = {
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ asChild = false, onClick, ...props }, ref) => {
    const { setOpen, triggerRef, open } = useDialogContext("DialogTrigger");
    const handleRef = composeRefs(ref, (node: HTMLElement | null) => {
      triggerRef.current = node;
    });
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={handleRef as React.Ref<any>}
        data-slot="dialog-trigger"
        type={asChild ? undefined : "button"}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            setOpen(true);
          }
        }}
        {...props}
      >
        {props.children}
      </Comp>
    );
  },
);

DialogTrigger.displayName = "DialogTrigger";

type DialogPortalProps = {
  children: React.ReactNode;
};

function DialogPortal({ children }: DialogPortalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(children, document.body);
}

const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity",
        className,
      )}
      {...props}
    />
  );
});

DialogOverlay.displayName = "DialogOverlay";

type DialogContentProps = React.HTMLAttributes<HTMLDivElement> & {
  closeOnOverlayClick?: boolean;
};

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  (
    {
      className,
      children,
      closeOnOverlayClick = true,
      onClick,
      style,
      ...props
    },
    ref,
  ) => {
    const { open, setOpen } = useDialogContext("DialogContent");
    const contentRef = React.useRef<HTMLDivElement | null>(null);
    const mergedRef = composeRefs(ref, (node: HTMLDivElement | null) => {
      contentRef.current = node;
    });

    React.useEffect(() => {
      if (!open) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          setOpen(false);
        }
      };

      const handlePointerDown = (event: PointerEvent) => {
        if (!closeOnOverlayClick) return;
        const target = event.target as Node | null;
        if (
          target &&
          contentRef.current &&
          !contentRef.current.contains(target)
        ) {
          setOpen(false);
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("pointerdown", handlePointerDown, true);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("pointerdown", handlePointerDown, true);
      };
    }, [open, setOpen, closeOnOverlayClick]);

    if (!open) {
      return null;
    }

    return (
      <DialogPortal>
        <DialogOverlay />
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          <div
            ref={mergedRef}
            role="dialog"
            aria-modal="true"
            data-slot="dialog-content"
            className={cn(
              "relative w-full max-w-xl rounded-lg border bg-background p-6 shadow-lg",
              className,
            )}
            style={style}
            onClick={(event) => {
              onClick?.(event);
              event.stopPropagation();
            }}
            {...props}
          >
            {children}
          </div>
        </div>
      </DialogPortal>
    );

  },
);

DialogContent.displayName = "DialogContent";

type DialogCloseProps = {
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ asChild = false, onClick, ...props }, ref) => {
    const { setOpen } = useDialogContext("DialogClose");
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref as React.Ref<any>}
        data-slot="dialog-close"
        type={asChild ? undefined : "button"}
        aria-label="Close dialog"
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            setOpen(false);
          }
        }}
        {...props}
      >
        {props.children}
      </Comp>
    );
  },
);

DialogClose.displayName = "DialogClose";

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="dialog-header"
    className={cn("flex items-center justify-between border-b pb-3 px-6", className)}
    {...props}
  >
    {children}
    <DialogClose className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring">
      <XIcon className="h-5 w-5" />
      {/* <span className="sr-only">Close</span> */}
    </DialogClose>
  </div>
));

DialogHeader.displayName = "DialogHeader";

const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  ),
);

DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    data-slot="dialog-title"
    className={cn("text-lg font-semibold leading-none", className)}
    {...props}
  />
));

DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="dialog-description"
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));

DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
