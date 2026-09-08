// separator.tsx
import * as React from "react";
import { cn } from "@/logaxp/lib/cn";

export interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {
  /**
   * The orientation of the separator
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  
  /**
   * Whether the separator is decorative (not read by screen readers)
   * @default true
   */
  decorative?: boolean;
  
  /**
   * The visual style variant
   * @default "default"
   */
  variant?: "default" | "dashed" | "dotted" | "gradient";
  
  /**
   * The thickness/size of the separator
   * @default "default"
   */
  size?: "sm" | "default" | "lg" | "xl";
  
  /**
   * Optional label to display in the middle (horizontal only)
   */
  label?: string;
  
  /**
   * Optional icon to display with the label
   */
  labelIcon?: React.ReactNode;
}

const variantStyles = {
  default: {
    horizontal: "border-t",
    vertical: "border-l",
    gradient: "",
  },
  dashed: {
    horizontal: "border-t border-dashed",
    vertical: "border-l border-dashed",
    gradient: "",
  },
  dotted: {
    horizontal: "border-t border-dotted",
    vertical: "border-l border-dotted",
    gradient: "",
  },
  gradient: {
    horizontal: "bg-gradient-to-r from-transparent via-border to-transparent h-px border-0",
    vertical: "bg-gradient-to-b from-transparent via-border to-transparent w-px border-0",
    gradient: "",
  },
};

const sizeStyles = {
  sm: {
    horizontal: "my-2",
    vertical: "mx-1 h-4",
    thickness: {
      horizontal: "border-t-[1px]",
      vertical: "border-l-[1px]",
    },
  },
  default: {
    horizontal: "my-4",
    vertical: "mx-2 h-6",
    thickness: {
      horizontal: "border-t",
      vertical: "border-l",
    },
  },
  lg: {
    horizontal: "my-6",
    vertical: "mx-3 h-8",
    thickness: {
      horizontal: "border-t-2",
      vertical: "border-l-2",
    },
  },
  xl: {
    horizontal: "my-8",
    vertical: "mx-4 h-10",
    thickness: {
      horizontal: "border-t-4",
      vertical: "border-l-4",
    },
  },
};

export const Separator = React.forwardRef<HTMLHRElement, SeparatorProps>(
  (
    {
      className,
      orientation = "horizontal",
      decorative = true,
      variant = "default",
      size = "default",
      label,
      labelIcon,
      ...props
    },
    ref
  ) => {
    const isHorizontal = orientation === "horizontal";
    const variantStyle = variantStyles[variant];
    const sizeStyle = sizeStyles[size];

    // For gradient variant, we don't use border classes
    const thicknessClass = variant === "gradient" 
      ? "" 
      : sizeStyle.thickness[orientation];

    // If there's a label, render a more complex separator
    if (label && isHorizontal) {
      return (
        <div className={cn("relative flex items-center", className)}>
          <div
            className={cn(
              "flex-1",
              variantStyle[orientation],
              thicknessClass,
              sizeStyle[orientation],
              variant === "gradient" && variantStyle.gradient
            )}
          />
          <span className="mx-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground whitespace-nowrap">
            {labelIcon && <span className="shrink-0">{labelIcon}</span>}
            {label}
          </span>
          <div
            className={cn(
              "flex-1",
              variantStyle[orientation],
              thicknessClass,
              sizeStyle[orientation],
              variant === "gradient" && variantStyle.gradient
            )}
          />
        </div>
      );
    }

    // Default separator (just a line)
    return (
      <hr
        ref={ref}
        aria-orientation={isHorizontal ? orientation : undefined}
        aria-hidden={decorative}
        className={cn(
          "shrink-0 bg-border",
          isHorizontal
            ? cn("w-full", variantStyle.horizontal, thicknessClass, sizeStyle.horizontal)
            : cn("h-full", variantStyle.vertical, thicknessClass, sizeStyle.vertical),
          variant === "gradient" && variantStyle.gradient,
          className
        )}
        {...props}
      />
    );
  }
);

Separator.displayName = "Separator";

// Section separator with title
export interface SectionSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "subtle" | "bold";
}

export function SectionSeparator({
  title,
  description,
  icon,
  action,
  variant = "default",
  className,
  ...props
}: SectionSeparatorProps) {
  const variantStyles = {
    default: {
      container: "py-4",
      title: "text-base font-semibold",
      description: "text-sm text-muted-foreground",
      line: "mt-2",
    },
    subtle: {
      container: "py-3",
      title: "text-sm font-medium text-muted-foreground",
      description: "text-xs text-muted-foreground/70",
      line: "mt-1",
    },
    bold: {
      container: "py-5",
      title: "text-lg font-bold",
      description: "text-sm text-muted-foreground",
      line: "mt-3",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn("space-y-1", styles.container, className)} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <h3 className={styles.title}>{title}</h3>
        </div>
        {action && <div>{action}</div>}
      </div>
      {description && <p className={styles.description}>{description}</p>}
      <Separator variant={variant === "bold" ? "default" : "dashed"} className={styles.line} />
    </div>
  );
}

// Dot separator for inline use
export function DotSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("mx-1.5 text-muted-foreground/50 select-none", className)}
      {...props}
    >
      •
    </span>
  );
}

// Vertical separator for inline use
export function VerticalSeparator({
  className,
  size = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { size?: "sm" | "default" | "lg" }) {
  const sizeStyles = {
    sm: "h-3 mx-1",
    default: "h-4 mx-2",
    lg: "h-5 mx-3",
  };

  return (
    <span
      className={cn(
        "inline-block w-px bg-border align-middle",
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}

// Example usage and compound components
export const SeparatorGroup = {
  Root: Separator,
  Section: SectionSeparator,
  Dot: DotSeparator,
  Vertical: VerticalSeparator,
};