import { createContext, useContext, type Ref } from "react";
import { cn } from "../../utils";

// ============================================================================
// Context
// ============================================================================

interface NotificationCenterContextValue {
  onNotificationClick?: (id: string) => void;
}

const NotificationCenterContext = createContext<NotificationCenterContextValue | null>(null);

const useNotificationCenterContext = () => {
  const context = useContext(NotificationCenterContext);
  if (!context) {
    throw new Error(
      "NotificationCenter compound components must be used within NotificationCenter"
    );
  }
  return context;
};

// ============================================================================
// Types
// ============================================================================

export interface NotificationCenterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Children (composition pattern) */
  children?: React.ReactNode;
  /** Callback when notification is clicked */
  onNotificationClick?: (id: string) => void;
  /** Maximum height of notification list */
  maxHeight?: number | string;
  ref?: Ref<HTMLDivElement>;
}

export interface NotificationCenterHeaderProps {
  /** Header content */
  children?: React.ReactNode;
  className?: string;
}

export interface NotificationCenterUnreadBadgeProps {
  /** Unread count */
  count: number;
  className?: string;
}

export interface NotificationCenterMarkAllReadProps {
  /** Click handler */
  onClick?: () => void;
  /** Button text */
  children?: React.ReactNode;
  className?: string;
}

export interface NotificationCenterItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Notification ID */
  id: string;
  /** Icon element */
  icon?: React.ReactNode;
  /** Notification title */
  title: string;
  /** Notification description */
  description?: string;
  /** Timestamp text */
  timestamp: string;
  /** Read status */
  read?: boolean;
  /** Click handler */
  onClick?: () => void;
  ref?: Ref<HTMLDivElement>;
}

export interface NotificationCenterEmptyProps {
  /** Empty message */
  children?: React.ReactNode;
  className?: string;
}

export interface NotificationCenterCustomProps {
  /** Custom content */
  children: React.ReactNode;
  className?: string;
}

// ============================================================================
// Components
// ============================================================================

// NotificationCenter.Header
function Header({ children, className }: NotificationCenterHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between px-5 py-4", className)}>
      <div className="flex items-center gap-2">
        <h3 className="text-base font-bold text-[#1A1A26]">Notifications</h3>
        {children}
      </div>
    </div>
  );
}

// NotificationCenter.UnreadBadge
function UnreadBadge({ count, className }: NotificationCenterUnreadBadgeProps) {
  if (count === 0) return null;
  return (
    <span
      className={cn(
        "flex h-5 min-w-[24px] items-center justify-center rounded-full bg-[#DE4545] px-2 text-[11px] font-bold text-white",
        className
      )}
    >
      {count}
    </span>
  );
}

// NotificationCenter.MarkAllRead
function MarkAllRead({
  onClick,
  children = "Mark all read",
  className,
}: NotificationCenterMarkAllReadProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("text-xs text-brand hover:underline", className)}
    >
      {children}
    </button>
  );
}

// NotificationCenter.Item
function Item({
  id,
  icon,
  title,
  description,
  timestamp,
  read = false,
  onClick,
  className,
  ref,
  ...props
}: NotificationCenterItemProps) {
  const { onNotificationClick } = useNotificationCenterContext();

  const handleClick = () => {
    onClick?.();
    onNotificationClick?.(id);
  };

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
      className={cn(
        "relative cursor-pointer px-5 py-4 transition-colors hover:bg-[#F5F5F7]",
        !read && "bg-[#FAFAFF]",
        className
      )}
      {...props}
    >
      {!read && <div className="absolute left-5 top-[42px] h-2 w-2 rounded-full bg-brand" />}

      <div className="flex gap-3">
        {icon && (
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-xl">
            {icon}
          </div>
        )}

        <div className={cn("flex-1", icon && "pl-0")}>
          <h4 className="text-[13px] font-bold text-[#1A1A26]">{title}</h4>
          {description && <p className="mt-1 text-xs text-[#808088]">{description}</p>}
          <span className="mt-1 block text-[11px] text-[#999999]">{timestamp}</span>
        </div>
      </div>
    </div>
  );
}

// NotificationCenter.Empty
function Empty({ children = "No notifications", className }: NotificationCenterEmptyProps) {
  return (
    <div className={cn("flex h-32 items-center justify-center text-sm text-[#808088]", className)}>
      {children}
    </div>
  );
}

// NotificationCenter.Custom
function Custom({ children, className }: NotificationCenterCustomProps) {
  return <div className={className}>{children}</div>;
}

// Main component
function NotificationCenter({
  children,
  onNotificationClick,
  maxHeight = 400,
  className,
  ref,
  ...props
}: NotificationCenterProps) {
  const contextValue: NotificationCenterContextValue = {
    onNotificationClick,
  };

  return (
    <NotificationCenterContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={cn(
          "w-[380px] overflow-hidden rounded-xl border border-[#E6E6E8] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.10)]",
          className
        )}
        {...props}
      >
        <div
          className="overflow-y-auto"
          style={{ maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight }}
        >
          {children}
        </div>
      </div>
    </NotificationCenterContext.Provider>
  );
}

// Attach sub-components
NotificationCenter.Header = Header;
NotificationCenter.UnreadBadge = UnreadBadge;
NotificationCenter.MarkAllRead = MarkAllRead;
NotificationCenter.Item = Item;
NotificationCenter.Empty = Empty;
NotificationCenter.Custom = Custom;

export { NotificationCenter, useNotificationCenterContext };
