"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/logaxp/lib/cn";

const textareaVariants = cva(
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
        sm: "min-h-[90px]",
        md: "min-h-[110px]",
        lg: "min-h-[140px] text-base",
      },
      invalid: {
        true: "border-red-500 focus-visible:ring-red-500/20 focus-visible:border-red-500",
        false: "",
      },
      resize: {
        none: "resize-none",
        y: "resize-y",
        both: "resize",
      },
    },
    defaultVariants: {
      size: "md",
      invalid: false,
      resize: "y",
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, containerClassName, size, invalid, resize, label, hint, error, id, ...props },
    ref
  ) => {
    const autoId = React.useId();
    const textareaId = id ?? autoId;
    const isInvalid = Boolean(error) || Boolean(invalid);

    return (
      <div className={cn("space-y-1.5", containerClassName)}>
        {label ? (
          <label
            htmlFor={textareaId}
            className="text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            {label}
          </label>
        ) : null}

        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={isInvalid || undefined}
          aria-describedby={hint || error ? `${textareaId}-help` : undefined}
          className={cn(
            textareaVariants({ size, invalid: isInvalid, resize }),
            className
          )}
          {...props}
        />

        {error ? (
          <p id={`${textareaId}-help`} className="text-xs font-medium text-red-600">
            {error}
          </p>
        ) : hint ? (
          <p id={`${textareaId}-help`} className="text-xs text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";