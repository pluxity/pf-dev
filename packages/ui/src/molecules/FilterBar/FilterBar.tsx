import * as PopoverPrimitive from "@radix-ui/react-popover";
import { createContext, useCallback, useContext, useMemo, useState, type JSX } from "react";
import { Check, ChevronDownSmall, Search, X } from "../../atoms/Icon";
import { cn } from "../../utils";
import type {
  FilterBarChipsProps,
  FilterBarClearProps,
  FilterBarContentProps,
  FilterBarContextValue,
  FilterBarEmptyProps,
  FilterBarIconProps,
  FilterBarInputProps,
  FilterBarItemProps,
  FilterBarListProps,
  FilterBarProps,
  FilterBarTriggerProps,
  FilterBarValueProps,
  FilterOption,
} from "./types";

const FilterBarContext = createContext<FilterBarContextValue<unknown> | null>(null);

function useFilterBar<TValue = string>() {
  const context = useContext(FilterBarContext);
  if (!context) {
    throw new Error("FilterBar components must be used within a FilterBar");
  }
  return context as FilterBarContextValue<TValue>;
}

function FilterBarRoot<TValue = string>({
  selected,
  onSelectedChange,
  options,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  disabled,
  children,
}: FilterBarProps<TValue>) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [search, setSearch] = useState("");

  const open = controlledOpen ?? uncontrolledOpen;
  const onOpenChange = controlledOnOpenChange ?? setUncontrolledOpen;

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen);
      if (!nextOpen) {
        setSearch("");
      }
    },
    [onOpenChange]
  );

  const onSelect = useCallback(
    (value: TValue) => {
      if (selected.includes(value)) {
        onSelectedChange(selected.filter((v) => v !== value));
      } else {
        onSelectedChange([...selected, value]);
      }
    },
    [selected, onSelectedChange]
  );

  const onRemove = useCallback(
    (value: TValue) => {
      onSelectedChange(selected.filter((v) => v !== value));
    },
    [selected, onSelectedChange]
  );

  const onClear = useCallback(() => {
    onSelectedChange([]);
  }, [onSelectedChange]);

  const getLabel = useCallback(
    (value: TValue) => {
      const option = options.find((opt) => opt.value === value);
      return option?.label ?? String(value);
    },
    [options]
  );

  const getCategory = useCallback(
    (value: TValue) => {
      const option = options.find((opt) => opt.value === value);
      return option?.category;
    },
    [options]
  );

  const contextValue = useMemo(
    () => ({
      selected,
      onSelect: onSelect as (value: unknown) => void,
      onRemove: onRemove as (value: unknown) => void,
      onClear,
      open,
      onOpenChange: handleOpenChange,
      search,
      onSearchChange: setSearch,
      disabled,
      options: options as FilterOption<unknown>[],
      getLabel: getLabel as (value: unknown) => string,
      getCategory: getCategory as (value: unknown) => string | undefined,
    }),
    [
      selected,
      onSelect,
      onRemove,
      onClear,
      open,
      handleOpenChange,
      search,
      disabled,
      options,
      getLabel,
      getCategory,
    ]
  );

  return (
    <FilterBarContext.Provider value={contextValue}>
      <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
        {children}
      </PopoverPrimitive.Root>
    </FilterBarContext.Provider>
  );
}

function FilterBarTrigger({ className, children, ref, ...props }: FilterBarTriggerProps) {
  const { disabled } = useFilterBar();

  return (
    <PopoverPrimitive.Trigger
      ref={ref}
      disabled={disabled}
      className={cn(
        "flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </PopoverPrimitive.Trigger>
  );
}

function FilterBarValue({
  placeholder = "Add filter...",
  className,
  ref,
  ...props
}: FilterBarValueProps) {
  return (
    <span ref={ref} className={cn("text-gray-500", className)} {...props}>
      {placeholder}
    </span>
  );
}

function FilterBarIcon({ className, ref, ...props }: FilterBarIconProps) {
  return (
    <span ref={ref} className={cn("text-gray-500", className)} aria-hidden {...props}>
      <ChevronDownSmall />
    </span>
  );
}

function FilterBarContent({ className, children, ref, ...props }: FilterBarContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        sideOffset={4}
        className={cn(
          "z-50 min-w-[12rem] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        align="start"
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}

function FilterBarInput({
  className,
  placeholder = "Search filters...",
  ref,
  ...props
}: FilterBarInputProps) {
  const { search, onSearchChange } = useFilterBar();

  return (
    <div className="flex items-center border-b border-gray-200 px-3">
      <Search size="sm" className="text-gray-400" />
      <input
        ref={ref}
        type="text"
        className={cn(
          "flex-1 bg-transparent py-2.5 pl-2 text-sm outline-none",
          "placeholder:text-gray-500",
          className
        )}
        placeholder={placeholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        {...props}
      />
    </div>
  );
}

function FilterBarList({ className, children, ref, ...props }: FilterBarListProps) {
  return (
    <div
      ref={ref}
      className={cn("max-h-64 overflow-auto p-1", className)}
      role="listbox"
      {...props}
    >
      {children}
    </div>
  );
}

function FilterBarEmpty({
  className,
  children = "No filters found",
  ref,
  ...props
}: FilterBarEmptyProps) {
  return (
    <div
      ref={ref}
      className={cn("px-3 py-6 text-center text-sm text-gray-500", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function FilterBarItemComponent<TValue = string>({
  value: itemValue,
  disabled,
  className,
  children,
  ref,
  ...props
}: FilterBarItemProps<TValue>) {
  const { selected, onSelect, getLabel, getCategory } = useFilterBar<TValue>();

  const isSelected = selected.includes(itemValue);
  const category = getCategory(itemValue);

  const handleSelect = () => {
    if (disabled) return;
    onSelect(itemValue);
  };

  return (
    <div
      ref={ref}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
      data-disabled={disabled ? "" : undefined}
      data-selected={isSelected ? "" : undefined}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-2 text-sm outline-none",
        "hover:bg-gray-50 focus:bg-gray-50",
        isSelected && "bg-primary-50 text-primary-600",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSelect();
        }
      }}
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        {isSelected && <Check size="sm" className="text-primary-500" />}
      </span>
      {children ?? (
        <span className="flex items-center gap-1">
          {category && <span className="text-gray-500">{category}:</span>}
          <span>{getLabel(itemValue)}</span>
        </span>
      )}
    </div>
  );
}

function FilterBarChips({
  className,
  showCategory = true,
  removable = true,
  ref,
  ...props
}: FilterBarChipsProps) {
  const { selected, onRemove, getLabel, getCategory, disabled } = useFilterBar();

  if (selected.length === 0) {
    return null;
  }

  return (
    <div ref={ref} className={cn("flex flex-wrap gap-2", className)} {...props}>
      {selected.map((value) => {
        const label = getLabel(value);
        const category = showCategory ? getCategory(value) : undefined;

        return (
          <span
            key={String(value)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full bg-primary-500 px-3 text-xs font-bold text-white",
              disabled && "opacity-50"
            )}
          >
            {category && <span className="text-white/70">{category}:</span>}
            <span>{label}</span>
            {removable && !disabled && (
              <button
                type="button"
                onClick={() => onRemove(value)}
                className="cursor-pointer rounded-full p-0.5 transition-colors hover:bg-white/20"
              >
                <X size="xs" />
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}

function FilterBarClear({ className, children = "Clear all", ref, ...props }: FilterBarClearProps) {
  const { selected, onClear, disabled } = useFilterBar();

  if (selected.length === 0) {
    return null;
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClear}
      disabled={disabled}
      className={cn(
        "cursor-pointer text-sm text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

const FilterBar = FilterBarRoot as <TValue = string>(props: FilterBarProps<TValue>) => JSX.Element;

const FilterBarItem = FilterBarItemComponent as <TValue = string>(
  props: FilterBarItemProps<TValue>
) => JSX.Element;

export {
  FilterBar,
  FilterBarTrigger,
  FilterBarValue,
  FilterBarIcon,
  FilterBarContent,
  FilterBarInput,
  FilterBarList,
  FilterBarEmpty,
  FilterBarItem,
  FilterBarChips,
  FilterBarClear,
  useFilterBar,
};
