import { Children, type Ref } from "react";
import { cn } from "../../utils";

// ============================================================================
// Types
// ============================================================================

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Children (composition pattern) */
  children?: React.ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Item title */
  title: string;
  /** Item description */
  description?: string;
  /** Time label */
  time?: string;
  /** Icon element */
  icon?: React.ReactNode;
  /** Item variant */
  variant?: "default" | "success" | "warning" | "error";
  ref?: Ref<HTMLDivElement>;
}

export interface TimelineCustomProps {
  /** Custom content */
  children: React.ReactNode;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const variantStyles = {
  default: "bg-brand",
  success: "bg-success-brand",
  warning: "bg-warning-brand",
  error: "bg-error-brand",
};

// ============================================================================
// Components
// ============================================================================

// Timeline.Item
function Item({
  title,
  description,
  time,
  icon,
  variant = "default",
  className,
  ref,
  ...props
}: TimelineItemProps) {
  return (
    <div ref={ref} className={cn("relative flex gap-4 pb-8 last:pb-0", className)} {...props}>
      <div
        className={cn(
          "relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full",
          variantStyles[variant]
        )}
      >
        {icon ? (
          <span className="text-white">{icon}</span>
        ) : (
          <div className="h-2 w-2 rounded-full bg-white" />
        )}
      </div>

      <div className="flex-1 pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-[#333340]">{title}</h4>
          {time && <span className="flex-shrink-0 text-xs text-[#808088]">{time}</span>}
        </div>
        {description && <p className="mt-1 text-sm text-[#666673]">{description}</p>}
      </div>
    </div>
  );
}

// Timeline.Custom
function Custom({ children, className }: TimelineCustomProps) {
  return <div className={cn("relative flex gap-4 pb-8 last:pb-0", className)}>{children}</div>;
}

// Main component
function Timeline({ children, className, ref, ...props }: TimelineProps) {
  const childrenArray = Children.toArray(children);

  return (
    <div ref={ref} className={cn("relative space-y-0", className)} {...props}>
      {/* Connecting line */}
      <div className="absolute left-[11px] top-6 h-[calc(100%-48px)] w-0.5 bg-[#E6E6E8]" />
      {childrenArray}
    </div>
  );
}

// Attach sub-components
Timeline.Item = Item;
Timeline.Custom = Custom;

export { Timeline };
