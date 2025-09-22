import * as React from "react";

import { cn } from "./utils";

type SlotProps = {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (value: T | null) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(value);
      } else {
        try {
          // @ts-expect-error: ref is writable
          ref.current = value;
        } catch {
          /* noop */
        }
      }
    });
  };
}

const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, className, style, ...props }, forwardedRef) => {
    if (!React.isValidElement(children)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Slot expects a single React element child.");
      }
      return null;
    }

    const childProps = children.props as Record<string, unknown>;
    const composedProps: Record<string, unknown> = { ...childProps };

    Object.entries(props).forEach(([key, value]) => {
      if (key === "className" || key === "style") {
        return;
      }

      const isEventHandler = /^on[A-Z]/.test(key);
      if (
        isEventHandler &&
        typeof value === "function" &&
        typeof childProps[key] === "function"
      ) {
        composedProps[key] = (...args: unknown[]) => {
          (childProps[key] as (...args: unknown[]) => void)(...args);
          (value as (...args: unknown[]) => void)(...args);
        };
        return;
      }

      composedProps[key] = value;
    });

    composedProps.className = cn(childProps.className as string, className);
    composedProps.style = { ...(childProps.style as React.CSSProperties), ...style };

    const childRef = (children as React.ReactElement & { ref?: React.Ref<unknown> })
      .ref as React.Ref<HTMLElement> | undefined;

    return React.cloneElement(children, {
      ...composedProps,
      ref: mergeRefs(childRef, forwardedRef),
    });
  },
);

Slot.displayName = "Slot";

export { Slot };
