// src/components/ui/toggle-group.tsx
"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";

import { cn } from "@/logaxp/lib/cn";

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & {
    variant?: "default" | "outline";
    size?: "default" | "sm" | "lg";
  }
>(({ className, variant = "default", size = "default", children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-lg border bg-background shadow-sm",
      className
    )}
    {...props}
  >
    {React.Children.map(children, (child) =>
      React.isValidElement(child)
        ? React.cloneElement(child, {
            variant,
            size,
          } as any)
        : child
    )}
  </ToggleGroupPrimitive.Root>
));
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> & {
    variant?: "default" | "outline";
    size?: "default" | "sm" | "lg";
  }
>(
  (
    { className, children, variant = "default", size = "default", ...props },
    ref
  ) => {
    const sizeClasses = {
      default: "h-9 px-4 text-sm",
      sm: "h-8 px-3 text-xs",
      lg: "h-10 px-6 text-base",
    };

    const variantClasses = {
      default: cn(
        "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
        "data-[state=on]:shadow-sm",
        "hover:bg-accent hover:text-accent-foreground",
        "data-[state=on]:hover:bg-primary/90"
      ),
      outline: cn(
        "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
        "data-[state=on]:shadow-sm"
      ),
    };

    return (
      <ToggleGroupPrimitive.Item
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          "data-[state=on]:shadow-sm",
          sizeClasses[size],
          variantClasses[variant],
          "first:rounded-l-lg last:rounded-r-lg",
          className
        )}
        {...props}
      >
        {children}
      </ToggleGroupPrimitive.Item>
    );
  }
);
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };