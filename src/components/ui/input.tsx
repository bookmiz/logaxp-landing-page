"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/logaxp/lib/cn";

const inputVariants = cva(
  [
    "flex w-full rounded-xl border bg-white px-3 py-2 text-sm",
    "text-slate-900 placeholder:text-slate-400",
    "shadow-sm transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:border-slate-300",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "dark:bg-slate-950 dark:text-slate-50 dark:border-slate-800 dark:placeholder:text-slate-500",
    "dark:focus-visible:ring-slate-50/15 dark:focus-visible:border-slate-700",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-9",
        md: "h-10",
        lg: "h-11 text-base",
      },
      invalid: {
        true: "border-red-500 focus-visible:ring-red-500/20 focus-visible:border-red-500",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      invalid: false,
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      size,
      invalid,
      label,
      hint,
      error,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    const isInvalid = Boolean(error) || Boolean(invalid);

    return (
      <div className={cn("space-y-1.5", containerClassName)}>
        {label ? (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            {label}
          </label>
        ) : null}

        <div className="relative">
          {leftIcon ? (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </span>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={isInvalid || undefined}
            aria-describedby={hint || error ? `${inputId}-help` : undefined}
            className={cn(
              inputVariants({ size, invalid: isInvalid }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            {...props}
          />

          {rightIcon ? (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </span>
          ) : null}
        </div>

        {error ? (
          <p
            id={`${inputId}-help`}
            className="text-xs font-medium text-red-600"
          >
            {error}
          </p>
        ) : hint ? (
          <p
            id={`${inputId}-help`}
            className="text-xs text-slate-500 dark:text-slate-400"
          >
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";