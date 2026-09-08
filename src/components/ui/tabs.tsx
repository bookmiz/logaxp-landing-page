"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/logaxp/lib/cn";

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      [
        "inline-flex items-center gap-1 rounded-2xl border p-1",
        "bg-white border-slate-200 shadow-sm",
        "dark:bg-slate-950 dark:border-slate-800",
      ].join(" "),
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      [
        "inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold",
        "text-slate-600 hover:text-slate-900",
        "transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20",
        "data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm",
        "dark:text-slate-300 dark:hover:text-slate-50",
        "dark:data-[state=active]:bg-slate-50 dark:data-[state=active]:text-slate-900",
      ].join(" "),
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 rounded-2xl",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";