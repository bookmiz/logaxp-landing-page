"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { useTimeToast } from "./useTimeToast";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export function CopyButton({
  value,
  label = "Copy",
  size = "sm",
  className,
}: {
  value: string;
  label?: string;
  size?: "xs" | "sm";
  className?: string;
}) {
  const { toast } = useTimeToast();
  const [ok, setOk] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setOk(true);
      toast({ tone: "success", title: "Copied", description: value });
      window.setTimeout(() => setOk(false), 900);
    } catch {
      toast({ tone: "error", title: "Copy failed", description: "Clipboard permission denied." });
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cx(
        "inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900",
        size === "xs" ? "px-2 py-1 text-[11px]" : "px-2.5 py-1.5 text-xs",
        className
      )}
      title={label}
    >
      {ok ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}