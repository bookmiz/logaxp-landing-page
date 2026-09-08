"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/logaxp/lib/cn";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-semibold transition-all select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.99]",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200",
        outline:
          "border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900",
        ghost:
          "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700",
        success:
          "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-700",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
      },
      size: {
        sm: "h-9 rounded-xl px-3 text-sm",
        md: "h-10 rounded-xl px-4 text-sm",
        lg: "h-11 rounded-2xl px-5 text-sm",
        icon: "h-10 w-10 rounded-xl",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  asChild?: boolean; // ✅ add
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, fullWidth, loading, asChild, children, disabled, onClick, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = Boolean(disabled || loading);

    return (
      <Comp
        ref={ref as any}
        className={cn(
          buttonVariants({ variant, size, fullWidth }),
          className,
          // ✅ make “disabled” work even when child is <a> or <Link>
          asChild && isDisabled ? "pointer-events-none opacity-50" : ""
        )}
        // ✅ only real buttons get disabled attribute
        {...(!asChild ? { disabled: isDisabled } : { "aria-disabled": isDisabled })}
        onClick={(e: any) => {
          if (asChild && isDisabled) {
            e.preventDefault?.();
            e.stopPropagation?.();
            return;
          }
          onClick?.(e);
        }}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";