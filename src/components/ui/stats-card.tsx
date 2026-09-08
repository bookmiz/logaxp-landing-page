// stats-card.tsx
import * as React from "react";
import { cn } from "@/logaxp/lib/cn";
import { Card } from "@/logaxp/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  LucideIcon 
} from "lucide-react";

export interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Title of the stat */
  title: string;
  /** Main value to display */
  value: number | string;
  /** Optional description or context */
  description?: string;
  /** Icon to display */
  icon?: LucideIcon;
  /** Optional trend value (percentage or number) */
  trend?: number;
  /** Label for the trend (e.g., "vs last month") */
  trendLabel?: string;
  /** Format the trend as percentage */
  trendAsPercentage?: boolean;
  /** Visual variant of the card */
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  /** Size of the card */
  size?: "sm" | "default" | "lg";
  /** Loading state */
  loading?: boolean;
  /** Optional action button or element */
  action?: React.ReactNode;
  /** Format the value (e.g., currency, percentage) */
  formatValue?: (value: number | string) => string;
}

const variantStyles = {
  default: {
    card: "",
    icon: "text-muted-foreground",
    value: "text-foreground",
    trend: "text-muted-foreground",
    gradient: "from-transparent to-transparent",
  },
  primary: {
    card: "border-primary/20 bg-primary/5",
    icon: "text-primary",
    value: "text-primary",
    trend: "text-primary/70",
    gradient: "from-primary/10 to-transparent",
  },
  success: {
    card: "border-green-500/20 bg-green-500/5",
    icon: "text-green-500",
    value: "text-green-500",
    trend: "text-green-500/70",
    gradient: "from-green-500/10 to-transparent",
  },
  warning: {
    card: "border-yellow-500/20 bg-yellow-500/5",
    icon: "text-yellow-500",
    value: "text-yellow-500",
    trend: "text-yellow-500/70",
    gradient: "from-yellow-500/10 to-transparent",
  },
  danger: {
    card: "border-red-500/20 bg-red-500/5",
    icon: "text-red-500",
    value: "text-red-500",
    trend: "text-red-500/70",
    gradient: "from-red-500/10 to-transparent",
  },
  info: {
    card: "border-blue-500/20 bg-blue-500/5",
    icon: "text-blue-500",
    value: "text-blue-500",
    trend: "text-blue-500/70",
    gradient: "from-blue-500/10 to-transparent",
  },
};

const sizeStyles = {
  sm: {
    card: "p-3",
    icon: "h-4 w-4",
    title: "text-xs",
    value: "text-lg",
    description: "text-xs",
  },
  default: {
    card: "p-6",
    icon: "h-5 w-5",
    title: "text-sm",
    value: "text-2xl",
    description: "text-sm",
  },
  lg: {
    card: "p-8",
    icon: "h-6 w-6",
    title: "text-base",
    value: "text-3xl",
    description: "text-base",
  },
};

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendLabel,
  trendAsPercentage = false,
  variant = "default",
  size = "default",
  loading = false,
  action,
  formatValue,
  className,
  ...props
}: StatsCardProps) {
  // Format the trend value
  const formattedTrend = React.useMemo(() => {
    if (trend === undefined) return null;
    
    if (trendAsPercentage) {
      return `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`;
    }
    
    return `${trend > 0 ? '+' : ''}${trend}`;
  }, [trend, trendAsPercentage]);

  // Determine trend icon
  const TrendIcon = React.useMemo(() => {
    if (trend === undefined) return null;
    if (trend > 0) return TrendingUp;
    if (trend < 0) return TrendingDown;
    return Minus;
  }, [trend]);

  // Format the main value
  const formattedValue = React.useMemo(() => {
    if (loading) return "—";
    if (formatValue) return formatValue(value);
    return value;
  }, [value, formatValue, loading]);

  const styles = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200 hover:shadow-md",
        styles.card,
        className
      )}
      {...props}
    >
      {/* Gradient Background */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50",
          styles.gradient
        )} 
      />

      <div className={cn("relative space-y-2", sizeStyle.card)}>
        {/* Header with Icon and Action */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className={cn(
                "rounded-lg p-2 bg-background/80 backdrop-blur-sm",
                styles.icon
              )}>
                <Icon className={sizeStyle.icon} />
              </div>
            )}
            <span className={cn("font-medium text-muted-foreground", sizeStyle.title)}>
              {title}
            </span>
          </div>
          {action && <div>{action}</div>}
        </div>

        {/* Main Value */}
        <div className="space-y-1">
          <div className={cn("font-bold tracking-tight", sizeStyle.value, styles.value)}>
            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded bg-muted" />
            ) : (
              formattedValue
            )}
          </div>

          {/* Description */}
          {description && !loading && (
            <p className={cn("text-muted-foreground", sizeStyle.description)}>
              {description}
            </p>
          )}

          {/* Trend Indicator */}
          {trend !== undefined && !loading && TrendIcon && (
            <div className="flex items-center gap-2 mt-2">
              <div className={cn(
                "flex items-center text-xs font-medium",
                trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-muted-foreground"
              )}>
                <TrendIcon className="h-3 w-3 mr-1" />
                {formattedTrend}
              </div>
              {trendLabel && (
                <span className="text-xs text-muted-foreground">
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </Card>
  );
}

// Compact version for dashboards with many stats
export function CompactStatsCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
  className,
  ...props
}: Omit<StatsCardProps, "size" | "description">) {
  return (
    <StatsCard
      title={title}
      value={value}
      icon={Icon}
      trend={trend}
      variant={variant}
      size="sm"
      className={cn("hover:scale-105 transition-transform", className)}
      {...props}
    />
  );
}

// Horizontal stats card for side-by-side layouts
export function HorizontalStatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
  className,
  ...props
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200 hover:shadow-md",
        styles.card,
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4 p-4">
        {Icon && (
          <div className={cn(
            "rounded-lg p-3 bg-background/80 backdrop-blur-sm",
            styles.icon
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground truncate">
              {title}
            </p>
            {trend !== undefined && (
              <div className={cn(
                "flex items-center text-xs font-medium",
                trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-muted-foreground"
              )}>
                {trend > 0 && <TrendingUp className="h-3 w-3 mr-1" />}
                {trend < 0 && <TrendingDown className="h-3 w-3 mr-1" />}
                {trend === 0 && <Minus className="h-3 w-3 mr-1" />}
                {trend}
              </div>
            )}
          </div>
          <p className={cn("text-2xl font-bold truncate", styles.value)}>
            {value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground truncate">
              {description}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}