"use client";
import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/logaxp/components/ui/button";
import { cn } from "@/logaxp/lib/cn"; 

type ModalProps = {
  open: boolean;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  widthClassName?: string;
  className?: string;
};

export function Modal({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  widthClassName = "max-w-4xl", // more compact default
  className,
}: ModalProps) {
  React.useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        className={cn(
          "relative w-full overflow-y-auto max-h-[95vh] rounded-xl border bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-950",
          widthClassName,
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="min-w-0 flex-1">
            {title && (
              <div className="text-lg font-semibold leading-tight text-slate-900 dark:text-slate-100">
                {title}
              </div>
            )}
            {subtitle && (
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {subtitle}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-5 md:p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}