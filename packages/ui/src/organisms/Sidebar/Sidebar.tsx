import { useState, createContext, useContext, type Ref } from "react";
import { ChevronDown, ChevronRight, ChevronLeft, Menu } from "../../atoms/Icon";
import { cn } from "../../utils";

// ============================================================================
// Context
// ============================================================================

interface SidebarContextValue {
  collapsed: boolean;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("Sidebar compound components must be used within Sidebar");
  }
  return context;
};

// ============================================================================
// Types
// ============================================================================

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** Sidebar title */
  title?: string;
  /** Logo element */
  logo?: React.ReactNode;
  /** Children (composition pattern) */
  children?: React.ReactNode;
  /** Collapsible sidebar */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Controlled collapsed state */
  collapsed?: boolean;
  /** Callback when collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Footer content */
  footer?: React.ReactNode;
  ref?: Ref<HTMLElement>;
}

export interface SidebarItemProps extends React.HTMLAttributes<HTMLElement> {
  /** Item label */
  children: React.ReactNode;
  /** Icon element */
  icon?: React.ReactNode;
  /** Link href (renders as <a> instead of <button>) */
  href?: string;
  /** Active state */
  active?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Default expanded state for nested items */
  defaultExpanded?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export interface SidebarSectionProps {
  /** Section label */
  label?: string;
  /** Section items */
  children: React.ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export interface SidebarSeparatorProps {
  className?: string;
}

export interface SidebarCustomProps {
  /** Custom content */
  children: React.ReactNode;
  className?: string;
}

// ============================================================================
// Components
// ============================================================================

// Sidebar.Item
function Item({
  children,
  icon,
  href,
  active,
  onClick,
  className,
  defaultExpanded = false,
  ref,
  ...props
}: SidebarItemProps) {
  const { collapsed } = useSidebarContext();
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Check if children are nested items (not just text)
  const hasNestedItems = Array.isArray(children)
    ? children.some((child) => child && typeof child === "object" && "type" in child)
    : false;

  const handleClick = () => {
    if (hasNestedItems) {
      setExpanded(!expanded);
    }
    onClick?.();
  };

  const content = (
    <>
      {icon && (
        <span
          className={cn(
            "flex h-5 w-5 flex-shrink-0 items-center justify-center",
            active ? "text-brand" : "text-[#666673]"
          )}
        >
          {icon}
        </span>
      )}
      {!collapsed && (
        <>
          <span className="flex-1 truncate">
            {Array.isArray(children) ? children.find((c) => typeof c === "string") : children}
          </span>
          {hasNestedItems && (
            <span className="flex-shrink-0">
              {expanded ? <ChevronDown size="sm" /> : <ChevronRight size="sm" />}
            </span>
          )}
        </>
      )}
    </>
  );

  const itemClasses = cn(
    "group relative flex h-10 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-sm transition-colors",
    active
      ? "bg-[#F5F8FF] font-bold text-brand"
      : "font-medium text-[#666673] hover:bg-[#F5F5F7] hover:text-[#333340]",
    collapsed && "justify-center px-0",
    className
  );

  const nestedItems = Array.isArray(children)
    ? children.filter((child) => child && typeof child === "object" && "type" in child)
    : null;

  const label = Array.isArray(children) ? children.find((c) => typeof c === "string") : children;

  return (
    <div ref={ref} {...props}>
      {href ? (
        <a href={href} className={itemClasses} onClick={handleClick}>
          {active && !collapsed && (
            <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand" />
          )}
          {content}
          {collapsed && (
            <span className="absolute left-full ml-2 hidden whitespace-nowrap rounded-md bg-[#333340] px-2 py-1 text-xs text-white group-hover:block">
              {label}
            </span>
          )}
        </a>
      ) : (
        <button type="button" className={itemClasses} onClick={handleClick}>
          {active && !collapsed && (
            <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand" />
          )}
          {content}
          {collapsed && (
            <span className="absolute left-full ml-2 hidden whitespace-nowrap rounded-md bg-[#333340] px-2 py-1 text-xs text-white group-hover:block">
              {label}
            </span>
          )}
        </button>
      )}
      {nestedItems && expanded && !collapsed && (
        <div className="ml-8 mt-1 space-y-1">{nestedItems}</div>
      )}
    </div>
  );
}

// Sidebar.Section
function Section({ label, children, className, ref }: SidebarSectionProps) {
  const { collapsed } = useSidebarContext();

  return (
    <div ref={ref} className={cn("space-y-1", className)}>
      {label && !collapsed && (
        <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#808088]">
          {label}
        </div>
      )}
      {collapsed && label && <div className="my-2 h-px bg-[#E6E6E8]" />}
      {children}
    </div>
  );
}

// Sidebar.Separator
function Separator({ className }: SidebarSeparatorProps) {
  return <div className={cn("my-2 h-px bg-[#E6E6E8]", className)} />;
}

// Sidebar.Custom
function Custom({ children, className }: SidebarCustomProps) {
  return <div className={cn("px-3 py-2", className)}>{children}</div>;
}

// Main component
function Sidebar({
  className,
  title,
  logo,
  children,
  collapsible = true,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  footer,
  ref,
  ...props
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isControlled = controlledCollapsed !== undefined;
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed;

  const handleToggleCollapse = () => {
    const newCollapsed = !collapsed;
    if (!isControlled) {
      setInternalCollapsed(newCollapsed);
    }
    onCollapsedChange?.(newCollapsed);
  };

  const contextValue: SidebarContextValue = { collapsed };

  return (
    <SidebarContext.Provider value={contextValue}>
      <aside
        ref={ref}
        className={cn(
          "flex h-full flex-col border-r border-[#E6E6E8] bg-white transition-all duration-300",
          collapsed ? "w-16" : "w-[280px]",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "flex h-14 items-center border-b border-[#E6E6E8]",
            collapsed ? "justify-center px-2" : "justify-between px-4"
          )}
        >
          {collapsed ? (
            logo || (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
                {title?.charAt(0) || "D"}
              </span>
            )
          ) : (
            <div className="flex items-center gap-3">
              {logo || (
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
                  {title?.charAt(0) || "D"}
                </span>
              )}
              {title && <h2 className="text-lg font-bold text-[#333340]">{title}</h2>}
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto p-3">{children}</nav>

        {collapsible && (
          <div className={cn("border-t border-[#E6E6E8] p-3", collapsed && "flex justify-center")}>
            <button
              type="button"
              onClick={handleToggleCollapse}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-[#666673] transition-colors hover:bg-[#F5F5F7] hover:text-[#333340]",
                collapsed ? "w-10 justify-center px-0" : "w-full"
              )}
            >
              {collapsed ? (
                <Menu size="md" />
              ) : (
                <>
                  <ChevronLeft size="md" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        )}

        {footer && !collapsed && <div className="border-t border-[#E6E6E8] p-3">{footer}</div>}
      </aside>
    </SidebarContext.Provider>
  );
}

// Attach sub-components
Sidebar.Item = Item;
Sidebar.Section = Section;
Sidebar.Separator = Separator;
Sidebar.Custom = Custom;

export { Sidebar, useSidebarContext };
