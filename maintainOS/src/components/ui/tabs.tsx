"use client";

import * as React from "react";

import { cn } from "./utils";

type Orientation = "horizontal" | "vertical";

type TabsContextValue = {
  value?: string;
  setValue: (value: string) => void;
  orientation: Orientation;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(component: string) {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error(`${component} must be used within <Tabs>.`);
  }
  return context;
}

type TabsProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: Orientation;
} & React.HTMLAttributes<HTMLDivElement>;

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      orientation = "horizontal",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const isControlled = value !== undefined;
    const selected = isControlled ? value : internalValue;

    const setValue = React.useCallback(
      (next: string) => {
        if (!isControlled) {
          setInternalValue(next);
        }
        onValueChange?.(next);
      },
      [isControlled, onValueChange],
    );

    const contextValue = React.useMemo<TabsContextValue>(
      () => ({ value: selected, setValue, orientation }),
      [selected, setValue, orientation],
    );

    return (
      <TabsContext.Provider value={contextValue}>
        <div
          ref={ref}
          data-slot="tabs"
          data-orientation={orientation}
          className={cn("flex flex-col gap-2", className)}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  },
);

Tabs.displayName = "Tabs";

type TabsListProps = React.HTMLAttributes<HTMLDivElement>;

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="tablist"
        data-slot="tabs-list"
        className={cn(
          "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px]",
          className,
        )}
        {...props}
      />
    );
  },
);

TabsList.displayName = "TabsList";

type TabsTriggerProps = {
  value: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, className, onClick, ...props }, ref) => {
    const { value: selected, setValue } = useTabsContext("TabsTrigger");
    const isActive = selected === value;

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        data-slot="tabs-trigger"
        data-state={isActive ? "active" : "inactive"}
        aria-selected={isActive}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            setValue(value);
          }
        }}
        className={cn(
          "data-[state=active]:bg-card dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className,
        )}
        {...props}
      />
    );
  },
);

TabsTrigger.displayName = "TabsTrigger";

type TabsContentProps = {
  value: string;
  forceMount?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, forceMount = false, className, children, ...props }, ref) => {
    const { value: selected } = useTabsContext("TabsContent");
    const isActive = selected === value;

    if (!isActive && !forceMount) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        hidden={!isActive}
        data-slot="tabs-content"
        data-state={isActive ? "active" : "inactive"}
        className={cn("flex-1 outline-none", className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
