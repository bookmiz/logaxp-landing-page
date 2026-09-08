// src/components/ui/radio-group.tsx
"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@/logaxp/lib/cn";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-3", className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "group relative flex cursor-pointer items-center gap-3 rounded-xl border border-input bg-background px-4 py-3.5 text-sm transition-all",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary/5 data-[state=checked]:ring-1 data-[state=checked]:ring-primary/30",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60",
        className
      )}
      {...props}
    >
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-background ring-offset-background transition-all group-hover:border-primary/60 group-data-[state=checked]:border-primary group-data-[state=checked]:bg-primary group-data-[state=checked]:text-primary-foreground">
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <CheckCircle2 className="h-4 w-4 text-primary-foreground opacity-0 group-data-[state=checked]:opacity-100 transition-opacity" />
        </RadioGroupPrimitive.Indicator>
      </div>

      <div className="flex-1 space-y-0.5 leading-none">
        {children}
      </div>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };

// ────────────────────────────────────────────────
// Example usage in your component (like the cancel dialog)
// ────────────────────────────────────────────────

/*
<RadioGroup
  value={cancelAtPeriodEnd ? "period-end" : "immediate"}
  onValueChange={(v) => setCancelAtPeriodEnd(v === "period-end")}
  className="space-y-4"
>
  <RadioGroupItem value="period-end" id="period-end">
    <div>
      <div className="font-medium">Cancel at end of billing period</div>
      <div className="text-sm text-muted-foreground">
        You'll keep access until the current period ends.
      </div>
    </div>
  </RadioGroupItem>

  <RadioGroupItem value="immediate" id="immediate">
    <div>
      <div className="font-medium">Cancel immediately</div>
      <div className="text-sm text-muted-foreground">
        Access will be revoked right away.
      </div>
    </div>
  </RadioGroupItem>
</RadioGroup>
*/
